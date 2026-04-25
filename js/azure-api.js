'use strict';
/* ==========================================================================
   AIC_API — REST client for APIM-fronted Cosmos DB
   - Bearer token auth (acquired via AIC_AUTH)
   - Exponential backoff retry
   - Request correlation via X-Request-ID
   - Falls through to AIC_DB localStorage when enableCosmos = false
   ========================================================================== */

const AIC_API = (function () {
  const BASE = AIC_CONFIG.cosmos.apiBaseUrl;

  function _useReal() { return AIC_CONFIG.features.enableCosmos === true && AIC_CONFIG.features.enableAPIM === true; }

  async function _headers(extra) {
    const h = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Request-ID': _genReqId(),
      'X-Client-App': 'AIC-Portal/' + AIC_CONFIG.app.version,
      'X-CSRF-Token': AIC_SEC.getCsrfToken()
    };
    if (AIC_CONFIG.cosmos.apimSubscriptionKey) h['Ocp-Apim-Subscription-Key'] = AIC_CONFIG.cosmos.apimSubscriptionKey;
    if (_useReal()) {
      try {
        const token = await AIC_AUTH.getAccessToken();
        if (token) h['Authorization'] = 'Bearer ' + token;
      } catch (e) { console.warn('[AIC API] token acquisition failed', e); }
    }
    return Object.assign(h, extra || {});
  }
  function _genReqId() {
    return 'req-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
  }
  function _delay(ms) { return new Promise(r => setTimeout(r, ms)); }

  async function fetchWithRetry(url, opts, maxRetries) {
    maxRetries = maxRetries == null ? 3 : maxRetries;
    let lastErr = null;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const res = await fetch(url, opts);
        if (res.status === 401) {
          AIC_SEC.audit('API_UNAUTHORIZED', { url }, 'WARN');
          await AIC_AUTH.login();
          throw new Error('Unauthorized');
        }
        if (res.status === 403) {
          AIC_SEC.audit('API_FORBIDDEN', { url }, 'WARN');
          throw new Error('Forbidden');
        }
        if (res.status === 409) throw new Error('Conflict (etag mismatch)');
        if (res.status === 429 || res.status >= 500) {
          if (attempt < maxRetries) {
            const backoff = Math.min(8000, Math.pow(2, attempt) * 500) + Math.random() * 200;
            console.warn('[AIC API] retry ' + (attempt+1) + ' after ' + Math.round(backoff) + 'ms — status=' + res.status);
            await _delay(backoff);
            continue;
          }
        }
        if (!res.ok) {
          const text = await res.text();
          throw new Error('HTTP ' + res.status + ' ' + text);
        }
        return res.headers.get('Content-Type')?.includes('json') ? await res.json() : await res.text();
      } catch (e) {
        lastErr = e;
        if (attempt >= maxRetries) break;
        await _delay(Math.pow(2, attempt) * 500);
      }
    }
    throw lastErr || new Error('Request failed');
  }

  async function _GET(path) {
    if (!_useReal()) return null;
    return fetchWithRetry(BASE + path, { method:'GET', headers: await _headers() });
  }
  async function _POST(path, body) {
    if (!_useReal()) return null;
    return fetchWithRetry(BASE + path, { method:'POST', headers: await _headers(), body: JSON.stringify(body) });
  }
  async function _PUT(path, body, etag) {
    if (!_useReal()) return null;
    const extra = etag ? { 'If-Match': etag } : null;
    return fetchWithRetry(BASE + path, { method:'PUT', headers: await _headers(extra), body: JSON.stringify(body) });
  }
  async function _PATCH(path, body, etag) {
    if (!_useReal()) return null;
    const extra = etag ? { 'If-Match': etag } : null;
    return fetchWithRetry(BASE + path, { method:'PATCH', headers: await _headers(extra), body: JSON.stringify(body) });
  }
  async function _DELETE(path) {
    if (!_useReal()) return null;
    return fetchWithRetry(BASE + path, { method:'DELETE', headers: await _headers() });
  }

  // --- public API ---
  async function listInitiatives(opts) {
    if (!_useReal()) return AIC_DB.getInitiatives(opts || {});
    const qs = opts ? '?' + new URLSearchParams(opts).toString() : '';
    return _GET('/initiatives' + qs);
  }
  async function getInitiative(id) {
    if (!_useReal()) return AIC_DB.getInitiative(id);
    return _GET('/initiatives/' + encodeURIComponent(id));
  }
  async function createInitiative(data) {
    AIC_SEC.audit('INITIATIVE_CREATE', { title: data.title }, 'INFO');
    if (!_useReal()) return AIC_DB.createInitiative(data);
    return _POST('/initiatives', data);
  }
  async function updateInitiative(id, data, etag) {
    AIC_SEC.audit('INITIATIVE_UPDATE', { id }, 'INFO');
    if (!_useReal()) return AIC_DB.updateInitiative(id, data);
    return _PUT('/initiatives/' + encodeURIComponent(id), data, etag);
  }
  async function patchInitiative(id, patch, etag) {
    if (!_useReal()) return AIC_DB.updateInitiative(id, patch);
    return _PATCH('/initiatives/' + encodeURIComponent(id), patch, etag);
  }
  async function deleteInitiative(id) {
    AIC_SEC.audit('INITIATIVE_DELETE', { id }, 'WARN');
    if (!_useReal()) return AIC_DB.deleteInitiative(id);
    return _PATCH('/initiatives/' + encodeURIComponent(id), { deleted: true });
  }

  async function listUsers() {
    if (!_useReal()) return AIC_DB.getUsers();
    return _GET('/users');
  }
  async function getUser(id) {
    if (!_useReal()) return AIC_DB.getUserById(id);
    return _GET('/users/' + encodeURIComponent(id));
  }
  async function createUser(data) {
    AIC_SEC.audit('USER_CREATE', { email: data.email }, 'INFO');
    if (!_useReal()) return AIC_DB.createUser(data);
    return _POST('/users', data);
  }
  async function updateUser(id, data) {
    AIC_SEC.audit('USER_UPDATE', { id }, 'INFO');
    if (!_useReal()) return AIC_DB.updateUser(id, data);
    return _PUT('/users/' + encodeURIComponent(id), data);
  }
  async function deleteUser(id) {
    AIC_SEC.audit('USER_DELETE', { id }, 'WARN');
    if (!_useReal()) return AIC_DB.deleteUser(id);
    return _DELETE('/users/' + encodeURIComponent(id));
  }

  async function getEvaluations(initiativeId) {
    if (!_useReal()) return [];
    return _GET('/evaluations?initiativeId=' + encodeURIComponent(initiativeId));
  }
  async function submitEvaluation(data) {
    AIC_SEC.audit('EVALUATION_SUBMIT', { initiativeId: data.initiativeId, score: data.score }, 'INFO');
    if (!_useReal()) {
      const i = AIC_DB.getInitiative(data.initiativeId);
      if (!i) return null;
      const patch = { gatekeeperScore: data.score, status: 'Validated', stage: 'Awaiting Council', dimensions: data.dimensions || i.dimensions };
      return AIC_DB.updateInitiative(data.initiativeId, patch);
    }
    return _POST('/evaluations', data);
  }
  async function getStageGates(initiativeId) {
    if (!_useReal()) {
      const i = AIC_DB.getInitiative(initiativeId);
      return i ? (i.stageGates || []) : [];
    }
    return _GET('/stage-gates?initiativeId=' + encodeURIComponent(initiativeId));
  }
  async function approveStageGate(initiativeId, stage) {
    AIC_SEC.audit('STAGE_GATE_APPROVED', { initiativeId, stage }, 'INFO');
    if (!_useReal()) {
      const i = AIC_DB.getInitiative(initiativeId);
      if (!i) return null;
      const gates = (i.stageGates || []).map(g => {
        if (g.stage === stage) return Object.assign({}, g, { status:'Active' });
        return g;
      });
      return AIC_DB.updateInitiative(initiativeId, { stageGates: gates });
    }
    return _POST('/stage-gates/approve', { initiativeId, stage });
  }

  async function getAuditLog(opts) {
    if (!_useReal()) return AIC_DB.getAuditLog((opts && opts.limit) || 200);
    const qs = opts ? '?' + new URLSearchParams(opts).toString() : '';
    return _GET('/audit' + qs);
  }
  async function bulkAuditLog(events) {
    if (!_useReal()) { AIC_DB.bulkAuditLog(events); return { count: events.length }; }
    return _POST('/audit/bulk', { events });
  }

  async function getPortfolioSummary() {
    if (!_useReal()) return AIC_DB.getPortfolioSummary();
    return _GET('/portfolio/summary');
  }
  async function getPortfolioSnapshot() {
    if (!_useReal()) return { snapshotDate: new Date().toISOString().slice(0,10), summary: AIC_DB.getPortfolioSummary() };
    return _GET('/portfolio/snapshot');
  }
  async function healthCheck() {
    if (!_useReal()) return { status:'ok', mode:'demo', latencyMs: 0 };
    const start = Date.now();
    try {
      const res = await fetch(BASE + '/health', { method:'GET', headers: await _headers() });
      return { status: res.ok ? 'ok' : 'error', latencyMs: Date.now() - start, code: res.status };
    } catch (e) {
      return { status: 'error', latencyMs: Date.now() - start, error: String(e) };
    }
  }

  return {
    fetchWithRetry,
    listInitiatives, getInitiative, createInitiative, updateInitiative, patchInitiative, deleteInitiative,
    listUsers, getUser, createUser, updateUser, deleteUser,
    getEvaluations, submitEvaluation, getStageGates, approveStageGate,
    getAuditLog, bulkAuditLog,
    getPortfolioSummary, getPortfolioSnapshot, healthCheck
  };
})();
