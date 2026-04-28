'use strict';
/* ==========================================================================
   AIC App — Global utilities, UI helpers, chart wrappers
   Exposes formatting, score helpers, page bootstrap, toasts, modals, charts
   ========================================================================== */

/* ------------------ Formatting ------------------ */
function formatCurrency(value, currency, compact) {
  if (value == null || isNaN(value)) return '—';
  currency = currency || 'USD';
  try {
    const opts = { style:'currency', currency: currency, maximumFractionDigits: 0 };
    if (compact) {
      opts.notation = 'compact';
      opts.maximumFractionDigits = 2;
      opts.minimumFractionDigits = 0;
    }
    return new Intl.NumberFormat('en-US', opts).format(value);
  } catch (e) {
    return '$' + Number(value).toLocaleString();
  }
}
function formatPct(value, decimals) {
  if (value == null || isNaN(value)) return '—';
  return Number(value).toFixed(decimals == null ? 1 : decimals) + '%';
}
function formatDate(value, opts) {
  if (!value) return '—';
  try {
    const d = new Date(value);
    if (isNaN(d.getTime())) return value;
    return d.toLocaleDateString('en-GB', opts || { day:'2-digit', month:'short', year:'numeric' });
  } catch (e) { return value; }
}
function timeAgo(value) {
  if (!value) return '—';
  const d = new Date(value);
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
  if (seconds < 60) return seconds + 's ago';
  if (seconds < 3600) return Math.floor(seconds/60) + 'm ago';
  if (seconds < 86400) return Math.floor(seconds/3600) + 'h ago';
  if (seconds < 604800) return Math.floor(seconds/86400) + 'd ago';
  return formatDate(value);
}
function uuid() {
  if (window.crypto && window.crypto.randomUUID) return window.crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}
function debounce(fn, delay) {
  let t = null;
  return function () {
    const args = arguments, ctx = this;
    clearTimeout(t);
    t = setTimeout(() => fn.apply(ctx, args), delay || 300);
  };
}
function deepClone(obj) {
  try { return JSON.parse(JSON.stringify(obj)); } catch (e) { return obj; }
}
function getParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}


function lifecycleStepIndex(initiative) {
  const status = (initiative && initiative.status) || '';
  if (status === 'Rejected' || status === 'Rejected by Gatekeeper' || status.indexOf('Rejected') >= 0) return 1;
  if (status === 'Submitted' || status === 'Under Review' || status === 'Gatekeeper Review') return 1;
  if (status === 'Validated' || status === 'Awaiting Council' || status === 'Awaiting CXO Approval') return 2;
  if (status === 'Approved' || status === 'Approved by CXO') return 3;
  if (status === 'Closed' || status === 'Completed') return 4;
  return 0;
}

function renderStatusTimeline(initiative) {
  const labels = ['Submitted','Gatekeeper','CXO','Approved','Completed'];
  const idx = lifecycleStepIndex(initiative);
  const rejected = ((initiative && initiative.status) || '').toLowerCase().indexOf('reject') >= 0;
  const dots = labels.map((label, i) => {
    const active = i <= idx ? 'active' : '';
    const danger = rejected && i >= 1 ? 'danger' : '';
    return '<span class="tl-dot ' + active + ' ' + danger + '" title="' + AIC_SEC.escapeHtml(label) + '"></span>';
  }).join('<span class="tl-line"></span>');
  const stateLabel = initiative && initiative.status ? initiative.status : 'Draft';
  return '<div class="status-timeline">' + dots + '<span class="tl-text">' + AIC_SEC.escapeHtml(stateLabel) + '</span></div>';
}


/* ------------------ Score helpers ------------------ */
function scoreClass(score) {
  if (score == null || isNaN(score)) return 'badge-neutral';
  if (score >= AIC_CONFIG.gatekeeper.passThreshold) return 'badge-success';
  if (score >= AIC_CONFIG.gatekeeper.conditionalThreshold) return 'badge-warning';
  return 'badge-danger';
}
function scoreLabel(score) {
  if (score == null || isNaN(score)) return 'Pending';
  if (score >= AIC_CONFIG.gatekeeper.passThreshold) return 'PASS';
  if (score >= AIC_CONFIG.gatekeeper.conditionalThreshold) return 'CONDITIONAL';
  return 'FAIL';
}
function scoreRingClass(score) {
  if (score == null || isNaN(score)) return 'none';
  if (score >= AIC_CONFIG.gatekeeper.passThreshold) return 'pass';
  if (score >= AIC_CONFIG.gatekeeper.conditionalThreshold) return 'warn';
  return 'fail';
}
function statusClass(status) {
  switch (status) {
    case 'Approved': case 'Approved by CXO': case 'Closed': return 'badge-success';
    case 'Validated': case 'Awaiting Council': case 'Awaiting CXO Approval': return 'badge-info';
    case 'Submitted': case 'Under Review': case 'Gatekeeper Review': return 'badge-warning';
    case 'Rejected': case 'Rejected by Gatekeeper': case 'Deleted': return 'badge-danger';
    case 'Draft': return 'badge-neutral';
    default: return 'badge-neutral';
  }
}

function priorityRank(priority) {
  if (priority === 'Strategic') return 3;
  if (priority === 'Efficiency') return 2;
  if (priority === 'Quick Win') return 1;
  return 0;
}

function sortByPriorityAndScore(items) {
  return (items || []).slice().sort((a,b) => {
    const pr = priorityRank(b.priority) - priorityRank(a.priority);
    if (pr !== 0) return pr;
    const scoreA = (typeof a.gatekeeperScore === 'number' ? a.gatekeeperScore : -1);
    const scoreB = (typeof b.gatekeeperScore === 'number' ? b.gatekeeperScore : -1);
    if (scoreB !== scoreA) return scoreB - scoreA;
    return String(a.title || '').localeCompare(String(b.title || ''));
  });
}
function decisionClass(decision) {
  if (!decision) return 'badge-neutral';
  const d = decision.toLowerCase();
  if (d.indexOf('strong invest') >= 0) return 'badge-success';
  if (d.indexOf('invest') >= 0 && d.indexOf('no') === -1) return 'badge-success';
  if (d.indexOf('conditional') >= 0) return 'badge-warning';
  if (d.indexOf('no invest') >= 0 || d.indexOf('reject') >= 0) return 'badge-danger';
  if (d.indexOf('pending') >= 0 || d.indexOf('draft') >= 0) return 'badge-neutral';
  return 'badge-info';
}
function computeCouncilScore(dimensions) {
  return AIC_DB.computeGatekeeperScore(dimensions);
}

/* ------------------ Auth shortcuts ------------------ */
function getUser() { return AIC_DB.getUser(); }
async function requireAuth(allowedRoles) {
  const user = getUser();
  if (!user) {
    window.location.replace('index.html');
    return null;
  }
  if (allowedRoles && allowedRoles.length && !AIC_SEC.canAccess(user, allowedRoles)) {
    AIC_SEC.audit('ACCESS_DENIED', { role: user.role, allowed: allowedRoles, page: window.location.pathname }, 'WARN');
    window.location.replace('403.html');
    return null;
  }
  AIC_SEC.touchSession();
  return user;
}
function signOut() {
  AIC_SEC.audit('LOGOUT', {}, 'INFO');
  AIC_SEC.flushAudit();
  AIC_SEC.invalidateSession('logout');
  AIC_DB.signOut();
  window.location.replace('index.html');
}

/* ------------------ UI: Toast ------------------ */
function showToast(message, type, duration) {
  type = type || 'info';
  duration = duration || 4000;
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const t = document.createElement('div');
  t.className = 'toast toast-' + type;
  t.innerHTML = AIC_SEC.sanitize(String(message));
  container.appendChild(t);
  setTimeout(() => {
    t.style.transition = 'opacity 0.2s, transform 0.2s';
    t.style.opacity = '0';
    t.style.transform = 'translateX(100%)';
    setTimeout(() => t.remove(), 250);
  }, duration);
}

/* ------------------ UI: Confirm modal ------------------ */
function showConfirm(title, message, confirmLabel) {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML =
      '<div class="modal" role="dialog" aria-modal="true">' +
        '<div class="modal-header"><h3 class="modal-title">' + AIC_SEC.escapeHtml(title) + '</h3>' +
          '<button class="modal-close" data-act="cancel" aria-label="Close">×</button></div>' +
        '<div class="modal-body">' + AIC_SEC.sanitize(message) + '</div>' +
        '<div class="modal-footer">' +
          '<button class="btn btn-secondary" data-act="cancel">Cancel</button>' +
          '<button class="btn btn-primary" data-act="ok">' + AIC_SEC.escapeHtml(confirmLabel || 'Confirm') + '</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(overlay);
    overlay.addEventListener('click', (e) => {
      const act = e.target.getAttribute('data-act');
      if (act === 'ok') { overlay.remove(); resolve(true); }
      else if (act === 'cancel' || e.target === overlay) { overlay.remove(); resolve(false); }
    });
  });
}

/* ------------------ UI: Loading ------------------ */
function showLoading(message) {
  hideLoading();
  const o = document.createElement('div');
  o.className = 'loading-overlay';
  o.id = 'aic-loading';
  o.innerHTML = '<div class="spinner"></div><div class="text-muted">' + AIC_SEC.escapeHtml(message || 'Loading…') + '</div>';
  document.body.appendChild(o);
}
function hideLoading() {
  const o = document.getElementById('aic-loading');
  if (o) o.remove();
}

/* ------------------ Page bootstrap ------------------ */
async function initPage(opts) {
  opts = opts || {};
  AIC_SEC.touchSession();
  const user = await requireAuth(opts.allowedRoles);
  if (!user) return null;

  renderSidebarUser(user);
  highlightCurrentNav();
  applyRoleNavVisibility(user);
  renderExecutiveTopbar(user.role);

  const sb = document.querySelector('.signout-btn');
  if (sb) sb.addEventListener('click', signOut);

  if (opts.onReady) {
    try { await opts.onReady(user); }
    catch (e) {
      console.error('[AIC App] initPage error', e);
      showToast('Page failed to load: ' + e.message, 'error');
    }
  }
  return user;
}

function renderSidebarUser(user) {
  if (!user) return;
  const av = document.querySelector('.sidebar-footer .avatar');
  const nm = document.querySelector('.sidebar-footer .user-name');
  const ro = document.querySelector('.sidebar-footer .user-role');
  if (av) av.textContent = user.initials || (user.name||'').split(' ').map(p=>p[0]).join('').slice(0,2).toUpperCase();
  if (nm) nm.textContent = user.name || '';
  if (ro) ro.textContent = (user.role || '').replace(/_/g, ' ');
}
function highlightCurrentNav() {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('[data-nav-page]').forEach(el => {
    if (el.getAttribute('data-nav-page') === page) el.classList.add('nav-active');
    else el.classList.remove('nav-active');
  });
}
function applyRoleNavVisibility(user) {
  const role = user && user.role;
  document.querySelectorAll('[data-min-role]').forEach(el => {
    const required = el.getAttribute('data-min-role');
    if (!AIC_SEC.hasRole(role, required)) el.style.display = 'none';
  });
  document.querySelectorAll('[data-admin-only]').forEach(el => {
    if (role !== 'Platform_Admin') el.remove();
  });
}
function renderExecutiveTopbar(role) {
  const top = document.querySelector('.top-bar');
  if (!top || top.querySelector('.exec-command')) return;
  const actions = top.querySelector('.top-actions');
  if (!actions) return;
  const roleLabel = (role || '').replace(/_/g, ' ');
  const command = document.createElement('div');
  command.className = 'exec-command';
  command.innerHTML =
    '<span class="exec-cycle">FY26 · Q2 Review Cycle</span>' +
    '<button type="button" class="exec-btn"><i class="fas fa-bolt"></i> Command</button>' +
    '<button type="button" class="exec-btn"><i class="fas fa-bell"></i></button>' +
    '<span class="exec-role">' + AIC_SEC.escapeHtml(roleLabel || 'Workspace') + '</span>';
  top.insertBefore(command, actions);
}

/* ------------------ Data export ------------------ */
function exportToCsv(filename, rows) {
  if (!rows || !rows.length) {
    showToast('No data to export', 'warning');
    return;
  }
  const cols = Object.keys(rows[0]);
  const escape = (v) => {
    if (v == null) return '';
    const s = String(typeof v === 'object' ? JSON.stringify(v) : v);
    if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
    return s;
  };
  const lines = [cols.join(',')].concat(rows.map(r => cols.map(c => escape(r[c])).join(',')));
  const blob = new Blob(['\uFEFF' + lines.join('\n')], { type:'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  AIC_SEC.audit('CSV_EXPORT', { filename, rows: rows.length }, 'INFO');
}

function paginate(items, page, pageSize) {
  page = page || 1;
  pageSize = pageSize || AIC_CONFIG.ui.pageSize;
  const total = items.length;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const p = Math.min(Math.max(1, page), pages);
  const start = (p - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    total, pages, page: p,
    hasPrev: p > 1, hasNext: p < pages
  };
}

/* ------------------ Charts ------------------ */
const AIC_CHARTS = (function () {
  const _instances = {};
  const dark = {
    color: '#94a3b8',
    grid: 'rgba(148,163,184,0.1)',
    border: 'rgba(148,163,184,0.2)'
  };
  function _ensure() {
    if (typeof Chart === 'undefined') return false;
    Chart.defaults.color = dark.color;
    Chart.defaults.borderColor = dark.border;
    Chart.defaults.font.family = "'Inter', sans-serif";
    return true;
  }
  function destroy(id) {
    if (_instances[id]) { _instances[id].destroy(); delete _instances[id]; }
  }
  function create(canvasId, config) {
    if (!_ensure()) return null;
    destroy(canvasId);
    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;
    _instances[canvasId] = new Chart(canvas.getContext('2d'), config);
    return _instances[canvasId];
  }
  function radar(canvasId, labels, data, color) {
    return create(canvasId, {
      type:'radar',
      data:{ labels, datasets:[{
        label:'Score', data,
        backgroundColor: 'rgba(99,102,241,0.2)',
        borderColor: color || '#6366f1',
        pointBackgroundColor: color || '#6366f1',
        borderWidth: 2
      }] },
      options:{
        scales:{ r:{ min:0, max:100, ticks:{ stepSize:20, color: dark.color, backdropColor:'transparent' }, grid:{ color: dark.grid }, angleLines:{ color: dark.grid }, pointLabels:{ color:'#f1f5f9', font:{ size:11 } } } },
        plugins:{ legend:{ display:false } }
      }
    });
  }
  function doughnut(canvasId, labels, data, colors) {
    return create(canvasId, {
      type:'doughnut',
      data:{ labels, datasets:[{ data, backgroundColor: colors, borderWidth: 0 }] },
      options:{ plugins:{ legend:{ position:'bottom', labels:{ font:{ size:11 } } } }, cutout:'65%' }
    });
  }
  function bar(canvasId, labels, datasets, opts) {
    return create(canvasId, {
      type:'bar',
      data:{ labels, datasets },
      options: Object.assign({
        plugins:{ legend:{ display: datasets.length > 1, position:'bottom' } },
        scales:{
          x:{ grid:{ color: dark.grid }, ticks:{ color: dark.color } },
          y:{ grid:{ color: dark.grid }, ticks:{ color: dark.color }, beginAtZero:true }
        }
      }, opts || {})
    });
  }
  function line(canvasId, labels, datasets, opts) {
    return create(canvasId, {
      type:'line',
      data:{ labels, datasets },
      options: Object.assign({
        plugins:{ legend:{ display: datasets.length > 1, position:'bottom' } },
        scales:{
          x:{ grid:{ color: dark.grid }, ticks:{ color: dark.color } },
          y:{ grid:{ color: dark.grid }, ticks:{ color: dark.color } }
        }
      }, opts || {})
    });
  }
  return { create, radar, doughnut, bar, line, destroy };
})();

/* expose globals */
window.formatCurrency = formatCurrency;
window.formatPct = formatPct;
window.formatDate = formatDate;
window.timeAgo = timeAgo;
window.uuid = uuid;
window.debounce = debounce;
window.deepClone = deepClone;
window.getParam = getParam;
window.scoreClass = scoreClass;
window.scoreLabel = scoreLabel;
window.scoreRingClass = scoreRingClass;
window.statusClass = statusClass;
window.decisionClass = decisionClass;
window.computeCouncilScore = computeCouncilScore;
window.priorityRank = priorityRank;
window.sortByPriorityAndScore = sortByPriorityAndScore;
window.renderStatusTimeline = renderStatusTimeline;
window.lifecycleStepIndex = lifecycleStepIndex;
window.getUser = getUser;
window.requireAuth = requireAuth;
window.signOut = signOut;
window.showToast = showToast;
window.showConfirm = showConfirm;
window.showLoading = showLoading;
window.hideLoading = hideLoading;
window.initPage = initPage;
window.renderSidebarUser = renderSidebarUser;
window.highlightCurrentNav = highlightCurrentNav;
window.applyRoleNavVisibility = applyRoleNavVisibility;
window.renderExecutiveTopbar = renderExecutiveTopbar;
window.exportToCsv = exportToCsv;
window.paginate = paginate;
window.AIC_CHARTS = AIC_CHARTS;

console.debug('[AIC App] utilities ready');
