'use strict';
/* ==========================================================================
   AIC_DB — Database Abstraction Layer
   Demo:        localStorage-backed in-memory store
   Production:  Delegates to AIC_API.* (when enableCosmos = true)
   ========================================================================== */

const AIC_DB = (function () {
  const VERSION = '2.1.0';
  const KEYS = {
    initiatives: 'aic_db_initiatives',
    users:       'aic_db_users',
    drafts:      'aic_db_drafts',
    audit:       'aic_db_audit',
    version:     'aic_db_version',
    user:        'aic_user',
    session:     'aic_session',
    profile:     'aic_profile'
  };

  // --- helpers ---
  function read(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      console.warn('[AIC DB] failed to read ' + key, e);
      return fallback;
    }
  }
  function write(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn('[AIC DB] failed to write ' + key, e);
    }
  }
  function makeId(prefix) {
    const r = Math.random().toString(36).slice(2, 8).toUpperCase();
    return (prefix || 'INV-2026-') + r;
  }
  function nowIso() { return new Date().toISOString(); }
  function nowDate() { return new Date().toISOString().slice(0, 10); }

  // --- sample seed data ---
  function getSampleInitiatives() {
    return [
      {
        id: 'INV-2026-0041',
        title: 'AI-Powered Inventory Optimisation — Starbucks GCC',
        domain: 'Retail Supply Chain',
        status: 'Approved',
        stage: 'Stage 1 — Alpha/MVP',
        sponsor: 'Faisal Al-Tamimi (CTO)',
        submittedBy: 'Sarah Al-Rashidi',
        submittedById: 'usr-006',
        submittedDate: '2026-03-12',
        lastUpdated: '2026-04-10T09:22:00Z',
        gatekeeperScore: 82,
        councilScore: 79,
        confidenceLevel: 'High',
        decision: 'Conditional Invest',
        budgetRequested: 1250000,
        budgetApproved: 1250000,
        budgetSpent: 380000,
        stageRelease: 375000,
        country: 'Multi-market — GCC',
        brands: ['Starbucks'],
        priority: 'Strategic',
        description: 'ML-driven demand forecasting and auto-replenishment for 340 Starbucks GCC stores. Target: 18% waste reduction, 22% stockout reduction.',
        problemStatement: 'Current manual replenishment creates 12% food waste rate (AED 4.2M/yr) and 23% stockout frequency at peak times.',
        customerEvidence: 'POS data from 340 stores confirms 23% peak-time stockout. 1.8M loyalty members experience stock friction.',
        proposedSolution: 'ML demand forecasting integrated with SAP EWM + Oracle RMS. 15-store pilot → 170 stores → 340 stores.',
        financialCase: 'Cost $1.25M. Base-case payback 28 months. Bull-case NPV $3.2M at 5yr. Annual benefit post-rollout: $1.1M.',
        dimensions: {
          d1: { name:'Financial Return Credibility',      score:76, weight:30, color:'#3b82f6' },
          d2: { name:'Customer & Market Validity',        score:84, weight:25, color:'#10b981' },
          d3: { name:'Technical & Delivery Credibility',  score:71, weight:20, color:'#f59e0b' },
          d4: { name:'Strategic Alignment & Optionality', score:88, weight:15, color:'#8b5cf6' },
          d5: { name:'Operational & Risk Credibility',    score:74, weight:10, color:'#ef4444' }
        },
        sharkVerdicts: [
          { shark:'Margin Surgeon',       icon:'🔪', color:'#fee2e2', score:74, confidence:'Medium', recommendation:'CONDITIONAL INVEST',
            assessment:'Payback at 28 months is within policy. Benefit model needs Alshaya-only EBITDA isolated from brand-level GMV.' },
          { shark:'Customer Advocate',    icon:'👤', color:'#d1fae5', score:84, confidence:'High',   recommendation:'INVEST',
            assessment:'Demand evidence strong. POS data (Tier 1) confirms 23% stockout. Qatar 2024 comparable shows +8 NPS from similar system.' },
          { shark:'Tech Realist',         icon:'💻', color:'#dbeafe', score:71, confidence:'Medium', recommendation:'CONDITIONAL',
            assessment:'ML pipeline sound but no solution design complete. Recommend $35K discovery sprint before Stage 1 capital.' },
          { shark:'Commercial Strategist',icon:'📊', color:'#ede9fe', score:88, confidence:'High',   recommendation:'STRONG INVEST',
            assessment:'Sits on Board priority of retail efficiency. Landmark deployed Leafio 2025: 20% waste reduction in 9 months.' },
          { shark:'Operator',             icon:'🏪', color:'#fef3c7', score:74, confidence:'Medium', recommendation:'CONDITIONAL',
            assessment:'Only 8 store manager interviews. No live pilot yet. Saudi PDPL sign-off needed for transaction data usage.' },
          { shark:'Measurement Architect',icon:'📏', color:'#d1fae5', score:82, confidence:'High',   recommendation:'INVEST',
            assessment:'Measurement plan solid. Primary metric: Waste Rate % (12.3% → 10.1%). Attribution: pre/post test-control. Owner named.' },
          { shark:'Red Team',             icon:'🎯', color:'#fee2e2', score:-3, confidence:'High',   recommendation:'RISK MODIFIER: -3',
            assessment:'3 risks: (1) Starbucks POS data sharing not contractually confirmed. (2) 92% adoption in 6mo unrealistic. (3) Double-count risk with INV-2026-0038.' }
        ],
        bearCase: 'Oct 2027: $1.1M spent, only 6% waste reduction (vs 18% target). Starbucks International declined real-time data sharing. SAP integration failed at 85 stores. Further $200K needed to pivot to SaaS.',
        franchiseNote: 'Alshaya captures 100% waste reduction savings ($420K/yr) + full margin on incremental sales. Starbucks International captures NPS gains — co-investment opportunity not yet explored.',
        measurementPlan: {
          primaryMetric: 'Food Waste Rate %',
          secondaryMetrics: ['Stockout Frequency','GP Margin per Store'],
          leadingIndicators: 'SKU forecast accuracy within 30 days of go-live',
          baselineValue: '12.3% (SAP EWM Q4 2025)',
          targetValue: '10.1% by Q2 2027',
          frequency: 'Monthly',
          dataSource: 'SAP EWM + Oracle RMS',
          attributionMethod: 'Pre/post test-control vs 40 untreated stores',
          accountableOwner: 'Youssef Al-Hajj — Supply Chain Director',
          reviewDates: '30 Sep 2026 / 31 Dec 2026'
        },
        stageGates: [
          { stage:'Stage 0: Discovery', budget:45000,  spent:45000,  status:'Complete', date:'Mar 2026',  exitCriteria:['Solution architecture reviewed','API contracts signed','Buy vs Build analysis approved'] },
          { stage:'Stage 1: Alpha/MVP', budget:375000, spent:380000, status:'Active',   date:'Apr-Jul 2026', exitCriteria:['ML model ≥85% accuracy','15-store pilot live','Leading indicators trending positive'] },
          { stage:'Stage 2: Scaled Pilot', budget:500000, spent:0, status:'Locked',   date:'Aug-Dec 2026', exitCriteria:['Stage 1 exit criteria met','Waste rate trending to target','Saudi PDPL sign-off'] },
          { stage:'Stage 3: Full Rollout', budget:330000, spent:0, status:'Locked',   date:'Q1 2027',   exitCriteria:['Pilot ≥15% waste reduction','Ops readiness 100%','Scope separation from INV-2026-0038'] }
        ],
        benefitsActuals: [
          { period:'Q1 2026', metric:'Waste Rate %', target:12.3, actual:12.1, variance:-0.2, status:'On Track', notes:'Discovery phase; baseline confirmed' },
          { period:'Q2 2026', metric:'Waste Rate %', target:11.8, actual:11.9, variance:0.1,  status:'Slight Miss', notes:'SAP integration delay in 2 stores' }
        ],
        councilTension: 'Margin Surgeon vs Commercial Strategist on payback horizon. Red Team double-counting concern with INV-2026-0038 escalated to PMO.',
        tags: ['ML','Inventory','Starbucks','GCC'],
        attachments: []
      },
      {
        id: 'INV-2026-0038',
        title: 'Omnichannel Click-and-Collect Unification — H&M & Zara',
        domain: 'Ecommerce',
        status: 'Validated',
        stage: 'Awaiting Council',
        sponsor: 'Rania Al-Khoury (CCO)',
        submittedBy: 'Tariq Mansour',
        submittedById: 'usr-005',
        submittedDate: '2026-04-01',
        lastUpdated: '2026-04-18T14:30:00Z',
        gatekeeperScore: 74,
        councilScore: null,
        confidenceLevel: 'Medium',
        decision: 'Pending',
        budgetRequested: 890000,
        budgetApproved: 0,
        budgetSpent: 0,
        stageRelease: 0,
        country: 'UAE, KSA, Kuwait',
        brands: ['H&M','Zara'],
        priority: 'Strategic',
        description: 'Unified C&C platform replacing 6 separate fulfilment systems. Target: 95% same-day collection confirmation, 35% ops cost reduction.',
        problemStatement: '6 fragmented fulfilment systems cause 18% C&C order cancellations and 22% checkout abandonment.',
        customerEvidence: 'NPS survey (n=2,400): 34% rate C&C "poor"/"very poor". 22% checkout abandonment vs 8% benchmark.',
        proposedSolution: 'Single OMS platform with real-time inventory across all 6 backends. Phased rollout H&M → Zara.',
        financialCase: 'Cost $890K. Payback 19 months. Annual benefit $760K (revenue recovery + ops savings).',
        dimensions: {
          d1:{name:'Financial Return Credibility',score:80,weight:30,color:'#3b82f6'},
          d2:{name:'Customer & Market Validity',score:78,weight:25,color:'#10b981'},
          d3:{name:'Technical & Delivery Credibility',score:66,weight:20,color:'#f59e0b'},
          d4:{name:'Strategic Alignment & Optionality',score:82,weight:15,color:'#8b5cf6'},
          d5:{name:'Operational & Risk Credibility',score:70,weight:10,color:'#ef4444'}
        },
        sharkVerdicts: [
          { shark:'Margin Surgeon',icon:'🔪',color:'#fee2e2',score:78,confidence:'Medium',recommendation:'CONDITIONAL INVEST',assessment:'19-month payback credible. Revenue recovery $760K needs sharper attribution vs concurrent UX redesign project.' },
          { shark:'Customer Advocate',icon:'👤',color:'#d1fae5',score:82,confidence:'High',recommendation:'INVEST',assessment:'34% poor/very poor C&C satisfaction. 22% checkout abandonment. Fixing this is table stakes.' },
          { shark:'Tech Realist',icon:'💻',color:'#dbeafe',score:66,confidence:'Low',recommendation:'CONDITIONAL',assessment:'6 backend integrations ambitious. No vendor selected. Need discovery sprint before Stage 1 capital.' },
          { shark:'Commercial Strategist',icon:'📊',color:'#ede9fe',score:82,confidence:'High',recommendation:'STRONG INVEST',assessment:'Prerequisite for GCC omnichannel strategy presented to Board Q1 2026.' },
          { shark:'Operator',icon:'🏪',color:'#fef3c7',score:70,confidence:'Medium',recommendation:'CONDITIONAL',assessment:'Store ops assessment superficial. H&M International and Inditex API approval timeline unconfirmed.' },
          { shark:'Measurement Architect',icon:'📏',color:'#d1fae5',score:75,confidence:'Medium',recommendation:'INVEST',assessment:'Primary metric clear: cancellation rate 18%→5%. Attribution risk from concurrent UX project noted.' },
          { shark:'Red Team',icon:'🎯',color:'#fee2e2',score:-5,confidence:'High',recommendation:'RISK MODIFIER: -5',assessment:'H&M and Inditex API approval 8-12 weeks. Benefit double-count risk with INV-2026-0041.' }
        ],
        bearCase: 'Sep 2027: $870K spent, H&M UAE live but Zara stalled — Inditex API denied after 5 months. Cancellation rate 18%→14% (vs 5% target). Sunk cost $870K.',
        measurementPlan: {
          primaryMetric:'C&C Order Cancellation Rate %',
          secondaryMetrics:['Checkout Abandonment','Same-day Collection %'],
          leadingIndicators:'Real-time inventory accuracy ≥98% within 60 days',
          baselineValue:'18% (OMS Q1 2026)',
          targetValue:'5% by Q4 2026',
          frequency:'Weekly',
          dataSource:'OMS + GA4',
          attributionMethod:'A/B test 50% traffic new vs legacy',
          accountableOwner:'Tariq Mansour — Head of Digital Operations',
          reviewDates:'30 Jun 2026 / 30 Sep 2026'
        },
        stageGates: [
          { stage:'Stage 0: Discovery',budget:40000,spent:40000,status:'Complete',date:'Apr 2026',exitCriteria:['3 vendors shortlisted','API access confirmed in writing','Architecture review passed'] },
          { stage:'Stage 1: Alpha/MVP',budget:267000,spent:0,status:'Locked',date:'May-Aug 2026',exitCriteria:['H&M UAE migrated','Cancellation rate trending <12%','Vendor SOW signed'] },
          { stage:'Stage 2: Scaled Pilot',budget:356000,spent:0,status:'Locked',date:'Sep-Dec 2026',exitCriteria:['4/6 backends integrated','FTE plan approved by HR','Zara UAE live'] },
          { stage:'Stage 3: Full Rollout',budget:227000,spent:0,status:'Locked',date:'Q1 2027',exitCriteria:['6/6 backends live','<5% cancellation achieved','Ops cost reduction realised'] }
        ],
        benefitsActuals: [],
        tags: ['Omnichannel','Ecommerce','H&M','Zara'],
        attachments: []
      },
      {
        id: 'INV-2026-0044',
        title: "Contactless Self-Checkout — Victoria's Secret UAE",
        domain: 'In-Store Technology',
        status: 'Draft',
        stage: 'Draft',
        sponsor: '',
        submittedBy: 'Dina Al-Saleh',
        submittedById: 'usr-001',
        submittedDate: '2026-04-18',
        lastUpdated: '2026-04-18T11:00:00Z',
        gatekeeperScore: null,
        councilScore: null,
        decision: 'Draft',
        budgetRequested: 320000,
        budgetApproved: 0,
        budgetSpent: 0,
        stageRelease: 0,
        country: 'UAE',
        brands: ["Victoria's Secret"],
        priority: 'Quick Win',
        description: "Deploy contactless self-checkout kiosks in VS UAE flagship stores. Target: reduce queue times, redeploy 8 FTE.",
        problemStatement: 'Average queue wait at peak times is 8.4 minutes, driving 12% walk-away rate.',
        customerEvidence: 'Store traffic data + 320 customer interviews.',
        proposedSolution: 'Tap-to-pay self-checkout kiosks with anti-theft RFID integration.',
        dimensions: {},
        sharkVerdicts: [],
        bearCase: null,
        measurementPlan: {},
        stageGates: [],
        benefitsActuals: [],
        tags: ['In-Store Tech','Self-Checkout'],
        attachments: []
      },
      {
        id: 'INV-2026-0047',
        title: 'Loyalty Points Unification — All Brands GCC',
        domain: 'Customer Loyalty',
        status: 'Submitted',
        stage: 'Gatekeeper Review',
        sponsor: 'Rania Al-Khoury (CCO)',
        submittedBy: 'Dina Al-Saleh',
        submittedById: 'usr-001',
        submittedDate: '2026-04-20',
        lastUpdated: '2026-04-21T09:00:00Z',
        gatekeeperScore: 71,
        councilScore: null,
        confidenceLevel: 'Medium',
        decision: 'Pending',
        budgetRequested: 2100000,
        budgetApproved: 0,
        budgetSpent: 0,
        stageRelease: 0,
        country: 'GCC-Wide',
        brands: ['All Brands'],
        priority: 'Strategic',
        description: 'Unified loyalty platform replacing 12 separate programmes across 70+ brands.',
        problemStatement: '12 fragmented loyalty programmes prevent cross-brand recognition. 38% of Tier 1 customers leak to competitors.',
        customerEvidence: 'Loyalty audit Q1 2026: only 6% of members active in >1 programme.',
        proposedSolution: 'Unified points engine on Salesforce CDP, single member ID across all brands.',
        dimensions: {
          d1:{name:'Financial Return Credibility',score:68,weight:30,color:'#3b82f6'},
          d2:{name:'Customer & Market Validity',score:85,weight:25,color:'#10b981'},
          d3:{name:'Technical & Delivery Credibility',score:62,weight:20,color:'#f59e0b'},
          d4:{name:'Strategic Alignment & Optionality',score:90,weight:15,color:'#8b5cf6'},
          d5:{name:'Operational & Risk Credibility',score:58,weight:10,color:'#ef4444'}
        },
        sharkVerdicts: [],
        bearCase: null,
        measurementPlan: {},
        stageGates: [],
        benefitsActuals: [],
        tags: ['Loyalty','CRM','GCC'],
        attachments: []
      },
      {
        id: 'INV-2025-0031',
        title: 'Dynamic Pricing Engine — Mothercare & Early Learning Centre',
        domain: 'Pricing & Revenue Management',
        status: 'Closed',
        stage: 'Completed',
        sponsor: 'Faisal Al-Tamimi (CTO)',
        submittedBy: 'Sarah Al-Rashidi',
        submittedById: 'usr-006',
        submittedDate: '2025-08-15',
        lastUpdated: '2026-03-01T00:00:00Z',
        gatekeeperScore: 88,
        councilScore: 85,
        confidenceLevel: 'High',
        decision: 'Invest — Completed',
        budgetRequested: 680000,
        budgetApproved: 680000,
        budgetSpent: 671000,
        stageRelease: 680000,
        country: 'UAE, KSA',
        brands: ['Mothercare','Early Learning Centre'],
        priority: 'Strategic',
        description: 'ML-based dynamic pricing for clearance/seasonal lines. Delivered 31% markdown loss reduction and AED 2.8M incremental margin in Year 1.',
        problemStatement: 'Static markdown rules caused AED 8.4M in over-discounting during 2024 clearance cycles.',
        customerEvidence: 'Promotion analytics 2024.',
        proposedSolution: 'ML pricing engine integrated with Oracle RMS.',
        dimensions: {
          d1:{name:'Financial Return Credibility',score:89,weight:30,color:'#3b82f6'},
          d2:{name:'Customer & Market Validity',score:82,weight:25,color:'#10b981'},
          d3:{name:'Technical & Delivery Credibility',score:85,weight:20,color:'#f59e0b'},
          d4:{name:'Strategic Alignment & Optionality',score:88,weight:15,color:'#8b5cf6'},
          d5:{name:'Operational & Risk Credibility',score:84,weight:10,color:'#ef4444'}
        },
        sharkVerdicts: [],
        measurementPlan: {
          primaryMetric: 'Markdown Loss %',
          baselineValue: '14.2%',
          targetValue: '9.5%',
          frequency: 'Monthly',
          attributionMethod: 'Test-control across 60 stores',
          accountableOwner: 'Sarah Al-Rashidi'
        },
        stageGates: [
          { stage:'Stage 0: Discovery', budget:30000, spent:30000, status:'Complete', date:'Sep 2025', exitCriteria:['Architecture approved'] },
          { stage:'Stage 1: Alpha/MVP', budget:204000, spent:204000, status:'Complete', date:'Oct-Dec 2025', exitCriteria:['MVP live'] },
          { stage:'Stage 2: Scaled Pilot', budget:272000, spent:272000, status:'Complete', date:'Jan-Feb 2026', exitCriteria:['60-store pilot complete'] },
          { stage:'Stage 3: Full Rollout', budget:174000, spent:165000, status:'Complete', date:'Mar 2026', exitCriteria:['Full rollout, AED 2.8M realised'] }
        ],
        benefitsActuals: [
          { period:'Q4 2025', metric:'Markdown Loss %', target:13.0, actual:12.6, variance:-0.4, status:'On Track', notes:'Pilot results' },
          { period:'Q1 2026', metric:'Markdown Loss %', target:11.0, actual:9.8,  variance:-1.2, status:'Exceeding', notes:'Full rollout strong' }
        ],
        tags:['Pricing','ML','Mothercare'],
        attachments: []
      }
    ];
  }

  function getSampleUsers() {
    return [
      { id:'usr-001', email:'dina.saleh@alshaya.com',    name:'Dina Al-Saleh',       role:'Initiative_Submitter', department:'Digital Commerce',    title:'Senior Product Manager',      initials:'DS', active:true },
      { id:'usr-002', email:'faisal.tamimi@alshaya.com', name:'Faisal Al-Tamimi',    role:'Investment_Committee', department:'Technology Strategy', title:'Chief Technology Officer',    initials:'FT', active:true },
      { id:'usr-003', email:'rania.khoury@alshaya.com',  name:'Rania Al-Khoury',     role:'Investment_Committee', department:'Commercial Strategy', title:'Chief Commercial Officer',    initials:'RK', active:true },
      { id:'usr-004', email:'admin@alshaya.com',         name:'Khalid Al-Mansouri',  role:'Platform_Admin',       department:'IT Platform',         title:'Platform Administrator',      initials:'KM', active:true },
      { id:'usr-005', email:'tariq.mansour@alshaya.com', name:'Tariq Mansour',       role:'Initiative_Submitter', department:'Ecommerce',           title:'Head of Digital Operations',  initials:'TM', active:true },
      { id:'usr-006', email:'sarah.rashidi@alshaya.com', name:'Sarah Al-Rashidi',    role:'Strategy_Reviewer',    department:'Corporate Strategy',  title:'Strategy Director',           initials:'SR', active:true },
      { id:'usr-007', email:'omar.hassan@alshaya.com',   name:'Omar Al-Hassan',      role:'Strategy_Reviewer',     department:'Finance',             title:'Finance Business Partner',    initials:'OH', active:true }
    ];
  }

  // --- public API ---
  const api = {};

  api.init = function () {
    const existing = read(KEYS.version, null);
    if (existing !== VERSION) {
      console.debug('[AIC DB] seeding sample data — version ' + VERSION);
      write(KEYS.initiatives, getSampleInitiatives());
      write(KEYS.users, getSampleUsers());
      write(KEYS.drafts, []);
      write(KEYS.audit, []);
      write(KEYS.version, VERSION);
    }
  };

  // --- session user ---
  api.getUser = function () { return read(KEYS.user, null); };
  api.setUser = function (user) {
    if (!user) return;
    write(KEYS.user, user);
    write(KEYS.session, { sessionId: 'sess-' + Math.random().toString(36).slice(2, 10), createdAt: nowIso(), lastActivity: nowIso() });
    write(KEYS.profile, user);
  };
  api.signOut = function () {
    [KEYS.user, KEYS.session, KEYS.profile].forEach(k => localStorage.removeItem(k));
  };

  // --- initiatives ---
  api.getInitiatives = function (filter) {
    let list = read(KEYS.initiatives, []);
    list = list.filter(i => !i.deleted);
    if (filter) {
      if (filter.status) list = list.filter(i => i.status === filter.status);
      if (filter.domain) list = list.filter(i => i.domain === filter.domain);
      if (filter.submittedById) list = list.filter(i => i.submittedById === filter.submittedById);
      if (filter.priority) list = list.filter(i => i.priority === filter.priority);
    }
    return list;
  };
  api.getInitiative = function (id) {
    const list = read(KEYS.initiatives, []);
    return list.find(i => i.id === id) || null;
  };
  api.createInitiative = function (data) {
    const list = read(KEYS.initiatives, []);
    const id = data.id || makeId('INV-2026-');
    const obj = Object.assign({
      id: id,
      submittedDate: nowDate(),
      lastUpdated: nowIso(),
      status: 'Draft',
      stage: 'Draft',
      gatekeeperScore: null,
      councilScore: null,
      decision: 'Draft',
      budgetApproved: 0,
      budgetSpent: 0,
      stageRelease: 0,
      dimensions: {},
      sharkVerdicts: [],
      stageGates: [],
      benefitsActuals: [],
      tags: [],
      attachments: []
    }, data, { id: id });
    list.push(obj);
    write(KEYS.initiatives, list);
    api.addAuditEvent({ action:'INITIATIVE_CREATED', data:{ id: id, title: obj.title }, severity:'INFO' });
    return obj;
  };
  api.updateInitiative = function (id, patch) {
    const list = read(KEYS.initiatives, []);
    const idx = list.findIndex(i => i.id === id);
    if (idx === -1) return null;
    list[idx] = Object.assign({}, list[idx], patch, { lastUpdated: nowIso() });
    write(KEYS.initiatives, list);
    api.addAuditEvent({ action:'INITIATIVE_UPDATED', data:{ id: id, fields: Object.keys(patch) }, severity:'INFO' });
    return list[idx];
  };
  api.deleteInitiative = function (id) {
    return api.updateInitiative(id, { deleted: true, status: 'Deleted' });
  };

  // --- drafts ---
  api.saveDraft = function (data) {
    const list = read(KEYS.drafts, []);
    const id = data.id || ('DRAFT-' + Date.now());
    const idx = list.findIndex(d => d.id === id);
    const obj = Object.assign({}, data, { id: id, savedAt: nowIso() });
    if (idx === -1) list.push(obj); else list[idx] = obj;
    write(KEYS.drafts, list);
    return obj;
  };
  api.getDraft = function (initiativeId) {
    const list = read(KEYS.drafts, []);
    if (initiativeId) return list.find(d => d.id === initiativeId) || null;
    return list.length ? list[list.length - 1] : null;
  };
  api.getDrafts = function (userId) {
    const list = read(KEYS.drafts, []);
    if (!userId) return list;
    return list.filter(d => d.submittedById === userId);
  };
  api.deleteDraft = function (id) {
    let list = read(KEYS.drafts, []);
    list = list.filter(d => d.id !== id);
    write(KEYS.drafts, list);
  };

  // --- users ---
  api.getUsers = function () { return read(KEYS.users, []).filter(u => !u.deleted); };
  api.getUserById = function (id) {
    const list = read(KEYS.users, []);
    return list.find(u => u.id === id) || null;
  };
  api.createUser = function (data) {
    const list = read(KEYS.users, []);
    const id = data.id || ('usr-' + (list.length + 1).toString().padStart(3, '0'));
    const initials = (data.name || '??').split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase();
    const obj = Object.assign({
      id: id,
      role: 'Platform_Admin',
      active: true,
      initials: initials,
      createdAt: nowIso()
    }, data, { id: id });
    list.push(obj);
    write(KEYS.users, list);
    api.addAuditEvent({ action:'USER_CREATED', data:{ id: id, role: obj.role }, severity:'INFO' });
    return obj;
  };
  api.updateUser = function (id, patch) {
    const list = read(KEYS.users, []);
    const idx = list.findIndex(u => u.id === id);
    if (idx === -1) return null;
    list[idx] = Object.assign({}, list[idx], patch);
    write(KEYS.users, list);
    api.addAuditEvent({ action:'USER_UPDATED', data:{ id: id, fields: Object.keys(patch) }, severity:'INFO' });
    return list[idx];
  };
  api.deleteUser = function (id) {
    let list = read(KEYS.users, []);
    list = list.filter(u => u.id !== id);
    write(KEYS.users, list);
    api.addAuditEvent({ action:'USER_DELETED', data:{ id: id }, severity:'WARN' });
  };

  // --- portfolio summary ---
  api.getPortfolioSummary = function () {
    const all = api.getInitiatives();
    const summary = {
      total: all.length,
      byStatus: {},
      byDomain: {},
      byPriority: {},
      totalRequested: 0,
      totalApproved: 0,
      totalSpent: 0,
      avgGatekeeperScore: 0,
      avgCouncilScore: 0,
      activeStage: { 'Stage 0': 0, 'Stage 1': 0, 'Stage 2': 0, 'Stage 3': 0, 'Completed': 0 }
    };
    let gkSum = 0, gkCount = 0, councilSum = 0, councilCount = 0;
    all.forEach(i => {
      summary.byStatus[i.status] = (summary.byStatus[i.status] || 0) + 1;
      summary.byDomain[i.domain] = (summary.byDomain[i.domain] || 0) + 1;
      summary.byPriority[i.priority] = (summary.byPriority[i.priority] || 0) + 1;
      summary.totalRequested += (i.budgetRequested || 0);
      summary.totalApproved += (i.budgetApproved || 0);
      summary.totalSpent += (i.budgetSpent || 0);
      if (typeof i.gatekeeperScore === 'number') { gkSum += i.gatekeeperScore; gkCount++; }
      if (typeof i.councilScore === 'number') { councilSum += i.councilScore; councilCount++; }
      if (i.stage && i.stage.indexOf('Stage 0') >= 0) summary.activeStage['Stage 0']++;
      else if (i.stage && i.stage.indexOf('Stage 1') >= 0) summary.activeStage['Stage 1']++;
      else if (i.stage && i.stage.indexOf('Stage 2') >= 0) summary.activeStage['Stage 2']++;
      else if (i.stage && i.stage.indexOf('Stage 3') >= 0) summary.activeStage['Stage 3']++;
      else if (i.stage === 'Completed') summary.activeStage['Completed']++;
    });
    summary.avgGatekeeperScore = gkCount ? Math.round(gkSum / gkCount) : 0;
    summary.avgCouncilScore = councilCount ? Math.round(councilSum / councilCount) : 0;
    summary.utilisationPct = summary.totalApproved > 0 ? Math.round((summary.totalSpent / summary.totalApproved) * 100) : 0;
    return summary;
  };

  // --- audit ---
  api.getAuditLog = function (limit) {
    const list = read(KEYS.audit, []);
    return limit ? list.slice(-limit).reverse() : list.slice().reverse();
  };
  api.addAuditEvent = function (event) {
    if (!AIC_CONFIG.features.enableAuditLogging) return;
    const list = read(KEYS.audit, []);
    const entry = Object.assign({
      timestamp: nowIso(),
      severity: 'INFO',
      url: typeof window !== 'undefined' ? window.location.pathname : ''
    }, event);
    if (!entry.user) {
      const u = api.getUser();
      entry.user = u ? (u.name + ' [' + u.role + ']') : 'anonymous';
    }
    list.push(entry);
    while (list.length > 500) list.shift();
    write(KEYS.audit, list);
  };
  api.bulkAuditLog = function (events) {
    if (!Array.isArray(events) || !events.length) return;
    events.forEach(ev => api.addAuditEvent(ev));
  };

  // --- score helpers ---
  api.computeGatekeeperScore = function (dims) {
    if (!dims) return 0;
    const keys = Object.keys(dims);
    let total = 0, weight = 0;
    keys.forEach(k => {
      const d = dims[k];
      if (d && typeof d.score === 'number' && typeof d.weight === 'number') {
        total += d.score * d.weight;
        weight += d.weight;
      }
    });
    return weight > 0 ? Math.round(total / weight) : 0;
  };

  // --- reset/export ---
  api.resetSampleData = function () {
    [KEYS.initiatives, KEYS.users, KEYS.drafts, KEYS.audit, KEYS.version].forEach(k => localStorage.removeItem(k));
    api.init();
    api.addAuditEvent({ action:'DATA_RESET', data:{}, severity:'WARN' });
  };
  api.clearAllData = function () {
    Object.values(KEYS).forEach(k => localStorage.removeItem(k));
  };
  api.exportAll = function () {
    return {
      version: VERSION,
      exportedAt: nowIso(),
      initiatives: read(KEYS.initiatives, []),
      users: read(KEYS.users, []),
      drafts: read(KEYS.drafts, []),
      audit: read(KEYS.audit, [])
    };
  };

  // auto-init
  api.init();

  console.debug('[AIC DB] ready — ' + read(KEYS.initiatives, []).length + ' initiatives, ' + read(KEYS.users, []).length + ' users');

  return api;
})();
