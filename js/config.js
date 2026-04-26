'use strict';
/* ==========================================================================
   AIC_CONFIG — Application Configuration Singleton
   Frozen at module load. Reads runtime env from window.__AIC_ENV (env-config.js)
   ========================================================================== */

const AIC_CONFIG = {
  auth: {
    clientId: window.__AIC_ENV?.AZURE_CLIENT_ID || 'YOUR_APP_REGISTRATION_CLIENT_ID',
    tenantId: window.__AIC_ENV?.AZURE_TENANT_ID || 'YOUR_TENANT_ID',
    authority: 'https://login.microsoftonline.com/' + (window.__AIC_ENV?.AZURE_TENANT_ID || 'YOUR_TENANT_ID'),
    redirectUri: window.location.origin + '/portal-router.html',
    postLogoutRedirectUri: window.location.origin + '/index.html',
    scopes: [
      'openid',
      'profile',
      'email',
      'offline_access',
      'User.Read',
      'api://' + (window.__AIC_ENV?.AZURE_CLIENT_ID || 'YOUR_APP_REGISTRATION_CLIENT_ID') + '/AIC.ReadWrite'
    ]
  },
  cosmos: {
    apiBaseUrl: window.__AIC_ENV?.APIM_BASE_URL || 'https://aic-apim.azure-api.net/aic/v1',
    apimSubscriptionKey: window.__AIC_ENV?.APIM_SUBSCRIPTION_KEY || ''
  },
  appInsights: {
    connectionString: window.__AIC_ENV?.APPLICATIONINSIGHTS_CONNECTION_STRING || ''
  },
  features: {
    enableAzureAD: false,
    enableCosmos: false,
    enableAPIM: false,
    enableAuditLogging: true,
    demoMode: true
  },
  roles: {
    ADMIN:     'Platform_Admin',
    COMMITTEE: 'Investment_Committee',
    STRATEGY:  'Strategy_Reviewer',
    SUBMITTER: 'Initiative_Submitter',
    // Gatekeeper = Strategy_Reviewer
    GATEKEEPER: 'Strategy_Reviewer'
  },
  app: {
    name: 'Alshaya Investment Council',
    version: '2.1.0',
    organization: 'Alshaya Group',
    supportEmail: 'aic-support@alshaya.com',
    dataClassification: 'INTERNAL-CONFIDENTIAL'
  },
  containers: {
    initiatives:    'investment_briefs',
    evaluations:    'council_evaluations',
    sharkVerdicts:  'shark_verdicts',
    measurements:   'measurement_plans',
    stageGates:     'stage_gates',
    benefitsActuals:'benefits_actuals',
    portfolioSnaps: 'portfolio_snapshots',
    marketIntel:    'market_intelligence',
    auditLog:       'audit_log',
    users:          'portal_users'
  },
  gatekeeper: {
    passThreshold: 75,
    conditionalThreshold: 60
  },
  financial: {
    maxPaybackMonths: 36,
    quickWinMaxBudget: 200000,
    discoveryMaxBudget: 75000,
    stageFunding: {
      stage0Pct: 0.04,
      stage1Pct: 0.30,
      stage2Pct: 0.40,
      stage3Pct: 0.26
    }
  },
  ui: {
    pageSize: 25,
    chartColors: {
      d1: '#3b82f6',
      d2: '#10b981',
      d3: '#f59e0b',
      d4: '#8b5cf6',
      d5: '#ef4444'
    }
  }
};

Object.freeze(AIC_CONFIG);
Object.freeze(AIC_CONFIG.auth);
Object.freeze(AIC_CONFIG.cosmos);
Object.freeze(AIC_CONFIG.appInsights);
Object.freeze(AIC_CONFIG.features);
Object.freeze(AIC_CONFIG.roles);
Object.freeze(AIC_CONFIG.app);
Object.freeze(AIC_CONFIG.containers);
Object.freeze(AIC_CONFIG.gatekeeper);
Object.freeze(AIC_CONFIG.financial);
Object.freeze(AIC_CONFIG.financial.stageFunding);
Object.freeze(AIC_CONFIG.ui);
Object.freeze(AIC_CONFIG.ui.chartColors);

if (typeof console !== 'undefined') {
  console.debug('[AIC Config] v' + AIC_CONFIG.app.version + ' loaded — demoMode=' + AIC_CONFIG.features.demoMode);
}
