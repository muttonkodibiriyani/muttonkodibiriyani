'use strict';
/* ==========================================================================
   AIC_AUTH — Azure AD Authentication (MSAL.js v3) + Demo mode fallback
   ========================================================================== */

const AIC_AUTH = (function () {
  let _msalInstance = null;
  let _currentAccount = null;
  let _currentToken = null;
  let _userProfile = null;
  const _eventHandlers = {};

  function _useAAD() { return AIC_CONFIG.features.enableAzureAD === true && typeof window.msal !== 'undefined'; }

  function _initMsal() {
    if (_msalInstance) return _msalInstance;
    if (!_useAAD()) return null;
    _msalInstance = new window.msal.PublicClientApplication({
      auth: {
        clientId:   AIC_CONFIG.auth.clientId,
        authority:  AIC_CONFIG.auth.authority,
        redirectUri: AIC_CONFIG.auth.redirectUri,
        postLogoutRedirectUri: AIC_CONFIG.auth.postLogoutRedirectUri
      },
      cache: { cacheLocation: 'sessionStorage', storeAuthStateInCookie: false },
      system: { allowNativeBroker: false }
    });
    return _msalInstance;
  }

  function on(event, handler) {
    (_eventHandlers[event] = _eventHandlers[event] || []).push(handler);
  }
  function emitEvent(event, data) {
    (_eventHandlers[event] || []).forEach(h => { try { h(data); } catch (e) { console.warn(e); } });
  }

  async function requireAuth() {
    if (_useAAD()) {
      const inst = _initMsal();
      const accounts = inst.getAllAccounts();
      if (!accounts.length) {
        await login();
        return null;
      }
      _currentAccount = accounts[0];
      return await getProfile();
    }
    const user = AIC_DB.getUser();
    if (!user) {
      window.location.replace('index.html');
      return null;
    }
    _userProfile = _buildDemoProfile(user);
    return _userProfile;
  }

  async function login() {
    if (_useAAD()) {
      const inst = _initMsal();
      AIC_SEC.audit('LOGIN_INITIATED', { method:'AzureAD' }, 'INFO');
      try {
        await inst.loginRedirect({
          scopes: AIC_CONFIG.auth.scopes,
          domainHint: 'alshaya.com',
          prompt: 'select_account'
        });
      } catch (e) {
        AIC_SEC.audit('LOGIN_FAILED', { error: String(e) }, 'CRITICAL');
        throw e;
      }
    } else {
      window.location.assign('index.html');
    }
  }

  async function logout() {
    AIC_SEC.audit('LOGOUT', { user: _userProfile ? _userProfile.email : null }, 'INFO');
    AIC_SEC.flushAudit();
    AIC_SEC.invalidateSession('logout');
    if (_useAAD() && _msalInstance) {
      await _msalInstance.logoutRedirect({ postLogoutRedirectUri: AIC_CONFIG.auth.postLogoutRedirectUri });
    } else {
      AIC_DB.signOut();
      window.location.replace('index.html');
    }
  }

  async function getAccessToken() {
    if (!_useAAD()) return 'DEMO_TOKEN';
    const inst = _initMsal();
    const accounts = inst.getAllAccounts();
    if (!accounts.length) { await login(); return null; }
    try {
      const result = await inst.acquireTokenSilent({ scopes: AIC_CONFIG.auth.scopes, account: accounts[0] });
      _currentToken = result.accessToken;
      return result.accessToken;
    } catch (e) {
      console.warn('[AIC Auth] silent token failed, trying redirect', e);
      await inst.acquireTokenRedirect({ scopes: AIC_CONFIG.auth.scopes });
      return null;
    }
  }

  function _buildDemoProfile(user) {
    const role = user.role;
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      initials: user.initials || (user.name||'').split(' ').map(p=>p[0]).join('').slice(0,2).toUpperCase(),
      roles: [role],
      primaryRole: role,
      department: user.department || '',
      jobTitle: user.title || '',
      tenantId: 'DEMO',
      canSubmit: AIC_SEC.hasRole(role, 'Initiative_Submitter'),
      canReview: AIC_SEC.hasRole(role, 'Strategy_Reviewer'),
      canApprove: AIC_SEC.hasRole(role, 'Investment_Committee'),
      canAdmin: role === 'Platform_Admin',
      isReadOnly: role === 'Portfolio_Viewer',
      sessionStart: new Date().toISOString(),
      loginMethod: 'DemoMode'
    };
  }

  async function getProfile() {
    if (_userProfile) return _userProfile;
    if (!_useAAD()) {
      const u = AIC_DB.getUser();
      if (!u) return null;
      _userProfile = _buildDemoProfile(u);
      return _userProfile;
    }
    const inst = _initMsal();
    const accounts = inst.getAllAccounts();
    if (!accounts.length) return null;
    const account = accounts[0];
    const claims = account.idTokenClaims || {};
    const roles = claims.roles || [];
    const primaryRole = _selectPrimary(roles);
    _userProfile = {
      id: claims.oid || account.localAccountId,
      name: account.name,
      email: claims.email || claims.preferred_username || account.username,
      initials: (account.name||'').split(' ').map(p=>p[0]).join('').slice(0,2).toUpperCase(),
      roles: roles,
      primaryRole: primaryRole,
      department: claims.department || '',
      jobTitle: claims.jobTitle || '',
      tenantId: claims.tid,
      canSubmit: AIC_SEC.hasRole(primaryRole, 'Initiative_Submitter'),
      canReview: AIC_SEC.hasRole(primaryRole, 'Strategy_Reviewer'),
      canApprove: AIC_SEC.hasRole(primaryRole, 'Investment_Committee'),
      canAdmin: primaryRole === 'Platform_Admin',
      isReadOnly: primaryRole === 'Portfolio_Viewer',
      sessionStart: new Date().toISOString(),
      loginMethod: 'AzureAD'
    };
    AIC_SEC.audit('PROFILE_LOADED', { email: _userProfile.email, role: _userProfile.primaryRole }, 'INFO');
    return _userProfile;
  }

  function _selectPrimary(roles) {
    const ordered = ['Platform_Admin','Investment_Committee','Strategy_Reviewer','Initiative_Submitter','Portfolio_Viewer'];
    for (const r of ordered) if (roles.indexOf(r) >= 0) return r;
    return roles[0] || null;
  }

  function hasRole(role) {
    if (!_userProfile) return false;
    if (_userProfile.canAdmin) return true;
    return _userProfile.roles && _userProfile.roles.indexOf(role) >= 0;
  }
  function requireAdmin() {
    if (!_userProfile || !_userProfile.canAdmin) throw new Error('Admin access required');
    return true;
  }
  function getCurrentUser() {
    if (_userProfile) return _userProfile;
    const u = AIC_DB.getUser();
    return u ? _buildDemoProfile(u) : null;
  }

  return {
    requireAuth, login, logout, getAccessToken,
    getProfile, hasRole, requireAdmin, getCurrentUser,
    on, emitEvent
  };
})();
