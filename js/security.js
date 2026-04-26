'use strict';
/* ==========================================================================
   AIC_SEC — Security Module
   - XSS sanitization (DOMPurify wrapper with fallback)
   - Input validation
   - CSRF token management
   - Session management (8h absolute, 30min inactivity)
   - RBAC role hierarchy + access control
   - Audit logging with batch flush
   - Rate limiting
   ========================================================================== */

const AIC_SEC = (function () {
  const SESSION_MAX_MS = 8 * 60 * 60 * 1000;
  const SESSION_IDLE_MS = 30 * 60 * 1000;
  const AUDIT_FLUSH_AT = 10;

  const ROLE_HIERARCHY = Object.freeze({
    'Platform_Admin':       100,
    'Investment_Committee':  80,
    'Strategy_Reviewer':     60,
    'Initiative_Submitter':  40
  });

  const ALLOWED_REDIRECT_PAGES = [
    'index.html','portal-router.html','403.html',
    'initiator-dashboard.html','strategy-dashboard.html','cxo-dashboard.html',
    'submit-initiative.html','initiative-detail.html','admin.html','ms-guide.html'
  ];

  const _state = {
    csrf: null,
    auditQueue: [],
    rateLimits: {}
  };

  // --- sanitize ---
  function sanitize(html, opts) {
    if (html == null) return '';
    if (typeof window !== 'undefined' && typeof window.DOMPurify !== 'undefined') {
      try {
        return window.DOMPurify.sanitize(String(html), opts || { ALLOWED_TAGS: ['b','i','em','strong','span','div','p','br','ul','ol','li','a'], ALLOWED_ATTR: ['href','target','rel','class'] });
      } catch (e) {
        console.warn('[AIC Security] DOMPurify failed, falling back to strip', e);
      }
    }
    return String(html).replace(/<[^>]*>/g, '');
  }
  function encodeAttr(val) {
    return String(val == null ? '' : val).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
  }
  function escapeHtml(val) { return encodeAttr(val); }

  // --- validators ---
  const validate = {
    email: function (val) {
      if (!val || typeof val !== 'string') return { ok:false, msg:'Email required' };
      const v = val.trim();
      if (v.length > 254) return { ok:false, msg:'Email too long' };
      if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v)) return { ok:false, msg:'Invalid email' };
      return { ok:true, value:v };
    },
    text: function (val, opts) {
      opts = opts || {};
      const min = opts.min || 0;
      const max = opts.max || 2000;
      if (val == null) return { ok: !opts.required, msg: opts.required ? 'Required' : '', value:'' };
      const v = String(val).trim();
      if (opts.required && !v) return { ok:false, msg:'Required' };
      if (v.length < min) return { ok:false, msg:'Min ' + min + ' chars' };
      if (v.length > max) return { ok:false, msg:'Max ' + max + ' chars' };
      return { ok:true, value:v };
    },
    number: function (val, opts) {
      opts = opts || {};
      const n = Number(val);
      if (Number.isNaN(n)) return { ok:false, msg:'Not a number' };
      if (typeof opts.min === 'number' && n < opts.min) return { ok:false, msg:'Min ' + opts.min };
      if (typeof opts.max === 'number' && n > opts.max) return { ok:false, msg:'Max ' + opts.max };
      return { ok:true, value:n };
    },
    id: function (val) {
      if (!val) return { ok:false, msg:'ID required' };
      const v = String(val).trim();
      if (!/^[A-Za-z0-9_\-]{1,64}$/.test(v)) return { ok:false, msg:'Invalid ID format' };
      return { ok:true, value:v };
    }
  };

  // --- CSRF token ---
  function getCsrfToken() {
    if (_state.csrf) return _state.csrf;
    let token = sessionStorage.getItem('aic_csrf');
    if (!token) {
      const buf = new Uint8Array(32);
      (window.crypto || window.msCrypto).getRandomValues(buf);
      token = Array.from(buf).map(b => b.toString(16).padStart(2, '0')).join('');
      sessionStorage.setItem('aic_csrf', token);
    }
    _state.csrf = token;
    return token;
  }
  function validateCsrfToken(token) {
    return !!token && token === getCsrfToken();
  }

  // --- session ---
  function _readSession() {
    try { return JSON.parse(sessionStorage.getItem('aic_session_meta') || 'null') || JSON.parse(localStorage.getItem('aic_session') || 'null'); } catch (e) { return null; }
  }
  function _writeSession(meta) {
    sessionStorage.setItem('aic_session_meta', JSON.stringify(meta));
    localStorage.setItem('aic_session', JSON.stringify(meta));
  }
  function _genUuid() {
    if (window.crypto && window.crypto.randomUUID) return window.crypto.randomUUID();
    const buf = new Uint8Array(16);
    (window.crypto || window.msCrypto).getRandomValues(buf);
    buf[6] = (buf[6] & 0x0f) | 0x40;
    buf[8] = (buf[8] & 0x3f) | 0x80;
    const hex = Array.from(buf).map(b => b.toString(16).padStart(2, '0')).join('');
    return hex.slice(0,8)+'-'+hex.slice(8,12)+'-'+hex.slice(12,16)+'-'+hex.slice(16,20)+'-'+hex.slice(20,32);
  }
  function createSession(user) {
    const meta = {
      sessionId: _genUuid(),
      userId: user && user.id,
      createdAt: Date.now(),
      lastActivity: Date.now()
    };
    _writeSession(meta);
    return meta;
  }
  function checkSession() {
    const meta = _readSession();
    if (!meta) return { valid:false, reason:'no_session' };
    const now = Date.now();
    if (now - meta.createdAt > SESSION_MAX_MS) return { valid:false, reason:'expired_absolute' };
    if (now - meta.lastActivity > SESSION_IDLE_MS) return { valid:false, reason:'expired_idle' };
    return { valid:true, meta };
  }
  function touchSession() {
    const meta = _readSession();
    if (!meta) return;
    meta.lastActivity = Date.now();
    _writeSession(meta);
  }
  function invalidateSession(reason) {
    audit('SESSION_INVALIDATED', { reason: reason || 'manual' }, 'INFO');
    sessionStorage.removeItem('aic_session_meta');
    localStorage.removeItem('aic_session');
    sessionStorage.removeItem('aic_csrf');
    _state.csrf = null;
  }

  // --- audit ---
  function audit(action, data, severity) {
    if (!AIC_CONFIG.features.enableAuditLogging) return;
    const event = {
      action: action,
      data: data || {},
      severity: severity || 'INFO',
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.pathname : '',
      sessionId: (_readSession() || {}).sessionId
    };
    _state.auditQueue.push(event);
    if (_state.auditQueue.length >= AUDIT_FLUSH_AT) flushAudit();
    if (severity === 'CRITICAL' || severity === 'WARN') flushAudit();
  }
  function flushAudit() {
    if (!_state.auditQueue.length) return;
    const events = _state.auditQueue.splice(0);
    if (typeof AIC_DB !== 'undefined' && AIC_DB.bulkAuditLog) {
      AIC_DB.bulkAuditLog(events);
    }
    if (typeof AIC_API !== 'undefined' && AIC_API.bulkAuditLog && AIC_CONFIG.features.enableCosmos) {
      AIC_API.bulkAuditLog(events).catch(e => console.warn('[AIC Security] audit flush failed', e));
    }
  }
  // periodic flush
  setInterval(flushAudit, 15000);
  window.addEventListener('beforeunload', flushAudit);

  // --- rate limit ---
  function checkRateLimit(key, maxCalls, windowMs) {
    maxCalls = maxCalls || 30;
    windowMs = windowMs || 60000;
    const now = Date.now();
    const arr = _state.rateLimits[key] || [];
    const filtered = arr.filter(t => now - t < windowMs);
    if (filtered.length >= maxCalls) {
      audit('RATE_LIMITED', { key: key, count: filtered.length }, 'WARN');
      return { allowed:false, retryAfter: windowMs - (now - filtered[0]) };
    }
    filtered.push(now);
    _state.rateLimits[key] = filtered;
    return { allowed:true };
  }

  // --- RBAC ---
  function hasRole(userRole, requiredRole) {
    if (!userRole) return false;
    if (userRole === requiredRole) return true;
    const u = ROLE_HIERARCHY[userRole] || 0;
    const r = ROLE_HIERARCHY[requiredRole] || 0;
    return u >= r;
  }
  function canAccess(user, allowedRoles) {
    if (!user || !user.role) return false;
    if (!allowedRoles || !allowedRoles.length) return true;
    if (allowedRoles.indexOf(user.role) >= 0) return true;
    if (user.role === 'Platform_Admin') return true;
    return false;
  }
  function requireAccess(allowedRoles) {
    let user = null;
    try { user = AIC_DB.getUser(); } catch (e) {}
    if (!user) {
      window.location.replace('index.html');
      return null;
    }
    if (!canAccess(user, allowedRoles)) {
      audit('ACCESS_DENIED', { role: user.role, allowed: allowedRoles, page: window.location.pathname }, 'WARN');
      window.location.replace('403.html');
      return null;
    }
    return user;
  }

  // --- safe redirect ---
  function safeRedirect(url) {
    if (!url) return;
    try {
      const target = new URL(url, window.location.origin);
      if (target.origin !== window.location.origin) {
        audit('OPEN_REDIRECT_BLOCKED', { url: url }, 'WARN');
        return;
      }
      const file = target.pathname.split('/').pop() || 'index.html';
      if (ALLOWED_REDIRECT_PAGES.indexOf(file) === -1) {
        audit('OPEN_REDIRECT_BLOCKED', { url: url, file: file }, 'WARN');
        window.location.replace('index.html');
        return;
      }
      window.location.assign(target.href);
    } catch (e) {
      console.warn('[AIC Security] safeRedirect rejected: ' + url);
    }
  }

  // --- frame busting ---
  if (typeof window !== 'undefined') {
    try {
      if (window.top !== window.self) {
        document.body && (document.body.innerHTML = '');
        window.top.location = window.self.location;
      }
    } catch (e) {
      document.body && (document.body.innerHTML = '<p style="color:red;font-family:sans-serif;padding:32px">Frame access denied</p>');
    }

    // touch session on user activity
    ['click','keydown','scroll'].forEach(ev => {
      window.addEventListener(ev, function () { touchSession(); }, { passive:true });
    });
  }

  console.debug('[AIC Security] ready — session policy: ' + (SESSION_MAX_MS/3600000) + 'h max, ' + (SESSION_IDLE_MS/60000) + 'm idle');

  return {
    sanitize,
    encodeAttr,
    escapeHtml,
    validate,
    getCsrfToken,
    validateCsrfToken,
    createSession,
    checkSession,
    touchSession,
    invalidateSession,
    audit,
    flushAudit,
    checkRateLimit,
    hasRole,
    canAccess,
    requireAccess,
    safeRedirect,
    ROLE_HIERARCHY
  };
})();
