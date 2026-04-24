// ===== PASSÔMETRO UTI - APP.JS =====
// State management, rendering, persistence

const TOTAL_BEDS = 10;

const DEVICES_LIST = [
  { id: 'cvc', name: 'CVC (Cateter Venoso Central)', detailLabel: 'Local / Detalhes' },
  { id: 'pam', name: 'PAM (Pressão Arterial Invasiva)', detailLabel: 'Local' },
  { id: 'svd', name: 'SVD (Sonda Vesical de Demora)', detailLabel: 'Detalhes' },
  { id: 'sng', name: 'SNG (Sonda Nasogástrica)', detailLabel: 'Detalhes' },
  { id: 'sne', name: 'SNE (Sonda Nasoenteral)', detailLabel: 'Detalhes' },
  { id: 'tot', name: 'TOT (Tubo Orotraqueal)', detailLabel: 'Nº / Fixação' },
  { id: 'tqt', name: 'TQT (Traqueostomia)', detailLabel: 'Nº / Detalhes' },
  { id: 'dreno', name: 'Dreno', detailLabel: 'Tipo / Local' },
  { id: 'nora', name: 'Noradrenalina', detailLabel: 'ml/h' },
  { id: 'dopa', name: 'Dopamina', detailLabel: 'ml/h' },
  { id: 'dobuta', name: 'Dobutamina', detailLabel: 'ml/h' },
  { id: 'nitro', name: 'Nitroglicerina', detailLabel: 'ml/h' },
  { id: 'vasopressina', name: 'Vasopressina', detailLabel: 'ml/h' },
  { id: 'midazolam', name: 'Midazolam', detailLabel: 'ml/h' },
  { id: 'fentanil', name: 'Fentanil', detailLabel: 'ml/h' },
  { id: 'propofol', name: 'Propofol', detailLabel: 'ml/h' },
  { id: 'ketamina', name: 'Ketamina', detailLabel: 'ml/h' },
  { id: 'adrenalina', name: 'Adrenalina', detailLabel: 'ml/h' },
  { id: 'nipride', name: 'Nitroprussiato (Nipride)', detailLabel: 'ml/h' },
  { id: 'amiodarona', name: 'Amiodarona', detailLabel: 'ml/h' },
  { id: 'vm', name: 'Ventilação Mecânica', detailLabel: 'Modo / Parâmetros' },
  { id: 'vni', name: 'VNI (Ventilação Não Invasiva)', detailLabel: 'Modo / Parâmetros' },
  { id: 'o2', name: 'O₂ Suplementar', detailLabel: 'Litros/min / Dispositivo' },
  { id: 'dialise', name: 'Diálise', detailLabel: 'Tipo / Detalhes' },
];

const DRUG_SOLUTIONS = {
  'nora': { name: 'Noradrenalina', options: [{ label: 'Padrão (5 amp - 20mg/200mL)', concMcgMl: 100 }, { label: 'Dobrada (10 amp - 40mg/200mL)', concMcgMl: 200 }], calcType: 'mcg/kg/min' },
  'adrenalina': { name: 'Adrenalina', options: [{ label: 'Padrão (20 amp - 20mg/200mL)', concMcgMl: 100 }], calcType: 'mcg/kg/min' },
  'dobuta': { name: 'Dobutamina', options: [{ label: 'Padrão (1 amp - 250mg/250mL)', concMcgMl: 1000 }, { label: 'Dobrada (2 amp - 500mg/250mL)', concMcgMl: 2000 }], calcType: 'mcg/kg/min' },
  'dopa': { name: 'Dopamina', options: [{ label: 'Padrão (5 amp - 250mg/250mL)', concMcgMl: 1000 }], calcType: 'mcg/kg/min' },
  'nitro': { name: 'Nitroglicerina (Tridil)', options: [{ label: 'Padrão (1 fr - 50mg/250mL)', concMcgMl: 200 }], calcType: 'mcg/min' },
  'nipride': { name: 'Nitroprussiato (Nipride)', options: [{ label: 'Padrão (1 fr - 50mg/250mL)', concMcgMl: 200 }], calcType: 'mcg/kg/min' },
  'fentanil': { name: 'Fentanil', options: [{ label: 'Padrão (4 fr - 2000mcg/200mL)', concMcgMl: 10 }], calcType: 'mcg/kg/min' },
  'midazolam': { name: 'Midazolam', options: [{ label: 'Padrão (4 amp - 200mg/200mL)', concMcgMl: 1000 }], calcType: 'mg/kg/h' },
  'propofol': { name: 'Propofol', options: [{ label: 'Puro 1% (10mg/mL)', concMcgMl: 10000 }, { label: 'Puro 2% (20mg/mL)', concMcgMl: 20000 }], calcType: 'mg/kg/h' },
  'ketamina': { name: 'Ketamina', options: [{ label: 'Padrão (4 fr - 2000mg/200mL)', concMcgMl: 10000 }], calcType: 'mg/kg/h' },
  'amiodarona': { name: 'Amiodarona', options: [{ label: 'Manutenção (6 amp - 900mg/238mL)', concMcgMl: 3781.5 }], calcType: 'mg/min' }
};

const EXAM_FIELDS = [
  // Hemograma
  { id: 'hb', name: 'Hb', unit: 'g/dL' },
  { id: 'ht', name: 'Ht', unit: '%' },
  { id: 'leuco', name: 'Global', unit: '/mm³' },
  { id: 'mielocitos', name: 'Mielócitos', unit: '' },
  { id: 'metamielocitos', name: 'Metamielócitos', unit: '' },
  { id: 'bastonetes', name: 'Bastonetes', unit: '' },
  { id: 'segmentados', name: 'Segmentados', unit: '' },
  { id: 'eosinofilos', name: 'Eosinófilos', unit: '' },
  { id: 'linf', name: 'Linfócitos', unit: '' },
  { id: 'mono', name: 'Monócitos', unit: '' },
  { id: 'plaq', name: 'Plaquetas', unit: 'mil' },
  // Gasometria
  { id: 'ph', name: 'pH', unit: '' },
  { id: 'po2', name: 'pO2', unit: 'mmHg' },
  { id: 'pco2', name: 'pCO2', unit: 'mmHg' },
  { id: 'hco3', name: 'HCO3', unit: 'mEq/L' },
  { id: 'be', name: 'BE', unit: 'mEq/L' },
  { id: 'sat', name: 'Sat', unit: '%' },
  // Função Renal e Outros
  { id: 'ur', name: 'Ur', unit: 'mg/dL' },
  { id: 'cr', name: 'Cr', unit: 'mg/dL' },
  { id: 'na', name: 'Na', unit: 'mEq/L' },
  { id: 'k', name: 'K', unit: 'mEq/L' },
  { id: 'ca', name: 'Ca', unit: 'mEq/L' },
  { id: 'mg', name: 'Mg', unit: 'mEq/L' },
  { id: 'cl', name: 'Cl', unit: 'mEq/L' },
  { id: 'p', name: 'P', unit: 'mEq/L' },
  { id: 'tppa', name: 'TPPa', unit: '' },
  { id: 'inr', name: 'INR', unit: '' },
  { id: 'cpk', name: 'CPK', unit: 'U/L' },
  { id: 'tgo', name: 'TGO', unit: 'U/L' },
  { id: 'tgp', name: 'TGP', unit: 'U/L' },
  { id: 'bd', name: 'BD', unit: 'mg/dL' },
  { id: 'bi', name: 'BI', unit: 'mg/dL' },
  { id: 'ggt', name: 'GGT', unit: 'U/L' },
  { id: 'fa', name: 'FA', unit: 'U/L' },
  { id: 'alb', name: 'Alb', unit: 'g/dL' },
  { id: 'pcr', name: 'PCR', unit: 'mg/L' },
  { id: 'lactato', name: 'Lactato', unit: 'mmol/L' },
  { id: 'svo2', name: 'SVO2', unit: '%' },
  { id: 'gap_co2', name: 'GAP CO2', unit: 'mmHg' },
  { id: 'troponina', name: 'Troponina', unit: 'ng/mL' }
];

// ===== SMART CASE =====
const MEDICAL_ACRONYMS = new Set([
  'CVC','PAM','SVD','SNG','SNE','TOT','TQT','VM','VNI','NIV','CPAP','BiPAP',
  'PCR','RCP','DEA','IOT','PICC','PAI','PVC','BIA','DPOC','HAS','DM','DM2',
  'ICC','IAM','IAMCSST','IAMSSST','AVE','AVC','AVCi','AVCh','TEP','TVP','FA',
  'FV','BAVT','BCRE','BCRD','BRE','BRD','IAo','IM','IT','EP','EAo','SAo',
  'SARA','IRA','IRC','DRC','ELA','SRIS','SEPSE','SDRA','COVID','HIV','TB',
  'EI','EAP','ECA','SC','SCA','SAF','LES','AR','Hb','Ht','Na','Cl','Mg','Ca',
  'Fe','K','VHS','INR','TAP','TTPA','TGO','TGP','BT','BD','BI','GGT','FA',
  'LDH','CPK','CKMB','BNP','NTproBNP','pH','PaO2','PaCO2','HCO3','BE','SpO2',
  'SatO2','FiO2','PAO2','PEEP','PS','FR','FC','PA','PAS','PAD','DC','IC',
  'SVR','PCP','FEVE','FE','VE','AE','Ao','VD','AD','TAPSE','VTI','IVT','FAC',
  'ATB','EV','VO','SN','SF','SG','RL','NaCl','KCl','MgSO4','NPT','NE','TPN',
  'HHF','HBPM','HNF','AAS','IECA','BRA','BCC','BB','MTX','CTC','AINE','IBP',
  'UTI','UPP','PA','PS','CTI','CC','BO','CME','CCIH','SAMU','COREN','CFM',
  'CRM','NIR','SAME','HD','DDI','HPP','HMA','DUM','IG','DN','RG','CPF','SUS',
  'ANS','UBS','HGT','ECG','ECO','RX','TC','RNM','USG','EDA','EDB','CPRE',
  'BPEG','CDI','MP','PM','BIC','ISDN','NAC',
]);

function smartCase(text) {
  if (!text) return text;
  const letters = text.replace(/[^a-zA-ZÀ-ú]/g, '');
  if (letters.length === 0) return text;
  const upperCount = (letters.match(/[A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝ]/g) || []).length;
  if (upperCount / letters.length <= 0.6) return text;

  return text.split(/(\s+)/).map(token => {
    if (/^\s+$/.test(token)) return token;
    const upper = token.toUpperCase();
    if (MEDICAL_ACRONYMS.has(upper)) return upper;
    // Preserve original case for mixed-case acronyms like AVCi, PaO2
    if (MEDICAL_ACRONYMS.has(token)) return token;
    if (token.length <= 2) return token;
    return token.charAt(0).toUpperCase() + token.slice(1).toLowerCase();
  }).join('');
}

// ===== STATE =====
let state = {
  beds: [],
  currentBed: null,
  currentTab: 'historia',
  charts: {},
};

function createEmptyBed(number) {
  return {
    number,
    name: '',
    age: '',
    plan: '',
    dataInternacao: '',
    diagnosticos: '',
    pendencias: '',
    hpp: '',
    hma: '',
    evolutions: [],
    antibiotics: [],
    exams: [],
    customExams: [],
    devices: {},
  };
}

function initState() {
  state.beds = [];
  for (let i = 1; i <= TOTAL_BEDS; i++) {
    state.beds.push(createEmptyBed(i));
  }
}

// ===== PERSISTENCE =====
let saveTimeout = null;
let firebaseReady = false;

function showSaveIndicator(type, text) {
  const el = document.getElementById('save-indicator');
  if (!el) return;
  el.className = 'save-indicator show ' + type;
  el.textContent = text;
  setTimeout(() => {
    el.classList.remove('show');
  }, 2000);
}

function saveLocal() {
  try {
    localStorage.setItem('passometro_data', JSON.stringify(state.beds));
  } catch (e) { console.warn('localStorage save failed:', e); }
}

function loadLocal() {
  try {
    const d = localStorage.getItem('passometro_data');
    if (d) {
      const parsed = JSON.parse(d);
      if (Array.isArray(parsed) && parsed.length === TOTAL_BEDS) {
        state.beds = parsed;
        return true;
      }
    }
  } catch (e) { console.warn('localStorage load failed:', e); }
  return false;
}

async function saveFirebase() {
  if (!window.firebaseDb || !window.firebaseFirestore || !window.firebaseAuth?.currentUser) return;
  try {
    const { doc, setDoc } = window.firebaseFirestore;
    const db = window.firebaseDb;
    const ref = doc(db, 'passometro/leitos');
    await setDoc(ref, {
      beds: JSON.parse(JSON.stringify(state.beds)),
      lastUpdate: new Date().toISOString(),
      updatedBy: window.firebaseAuth.currentUser.email,
    });
    showSaveIndicator('saved', '✓ Salvo');
  } catch (e) {
    console.error('Firebase save error:', e);
    showSaveIndicator('error', '✗ Erro ao salvar');
  }
}

async function loadFirebase() {
  if (!window.firebaseDb || !window.firebaseFirestore || !window.firebaseAuth?.currentUser) return false;
  try {
    const { doc, getDoc } = window.firebaseFirestore;
    const db = window.firebaseDb;
    const ref = doc(db, 'passometro/leitos');
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data();
      if (data.beds && Array.isArray(data.beds) && data.beds.length === TOTAL_BEDS) {
        state.beds = data.beds;
        saveLocal(); // sync to local
        return true;
      }
    }
  } catch (e) { console.error('Firebase load error:', e); }
  return false;
}

function triggerSave() {
  saveLocal();
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    showSaveIndicator('saving', '⟳ Salvando...');
    saveFirebase();
  }, 1500);
}

// ===== BALANÇO INTEGRATION =====
let balancoData = {};

async function loadBalancoData() {
  if (!window.firebaseDb || !window.firebaseFirestore || !window.firebaseAuth?.currentUser) {
    console.warn('[PASS] Cannot load balanco: Firebase not ready or not logged in');
    return;
  }
  try {
    const { doc, getDoc } = window.firebaseFirestore;
    const ref = doc(window.firebaseDb, 'passometro/balanco');
    console.log('[PASS] Loading balance data from passometro/balanco...');
    const snap = await getDoc(ref);
    if (snap.exists() && snap.data().data) {
      balancoData = snap.data().data;
      console.log('[PASS] ✓ Loaded balance data:', Object.keys(balancoData).length, 'shift keys');
    } else {
      console.log('[PASS] No balance data found in Firebase');
    }
  } catch (e) { console.warn('[PASS] Could not load balanco:', e); }
}

function getBalancoSummaryForBed(bedIdx) {
  const today = formatDateISO(new Date());
  const parts = [];

  ['diurno', 'noturno'].forEach(shift => {
    const key = `${bedIdx}_${today}_${shift}`;
    const data = balancoData[key];
    if (!data) return;

    // Temperature
    let maxTemp = 0, hasTemp = false, feverEps = 0, hypothermiaEps = 0;
    Object.values(data.sinaisVitais || {}).forEach(sv => {
      const t = parseFloat((sv.tax || '').replace(',', '.'));
      if (!isNaN(t)) { hasTemp = true; if (t > maxTemp) maxTemp = t; if (t >= 37.8) feverEps++; if (t < 36.0) hypothermiaEps++; }
    });
    if (hasTemp) {
      if (feverEps === 0 && hypothermiaEps === 0) {
        parts.push('Afebril');
      } else {
        if (feverEps > 0) parts.push(`${feverEps} episódio${feverEps > 1 ? 's' : ''} febril${feverEps > 1 ? 's' : ''}`);
        if (hypothermiaEps > 0) parts.push(`${hypothermiaEps} episódio${hypothermiaEps > 1 ? 's' : ''} de hipotermia`);
      }
    }

    // Hemodynamic
    let maxPAS = 0, minPAS = 999, maxFC = 0, minFC = 999, hasPAS = false, hasFC = false;
    Object.values(data.sinaisVitais || {}).forEach(sv => {
      if (sv.pa) { const p = parseInt(sv.pa.split('/')[0]); if (!isNaN(p)) { hasPAS = true; if (p > maxPAS) maxPAS = p; if (p < minPAS) minPAS = p; } }
      const fc = parseInt(sv.fc); if (!isNaN(fc)) { hasFC = true; if (fc > maxFC) maxFC = fc; if (fc < minFC) minFC = fc; }
    });
    if (hasPAS) parts.push(`PA ${minPAS}–${maxPAS} mmHg (Δ${maxPAS - minPAS})`);
    if (hasFC) parts.push(`FC ${minFC}–${maxFC} bpm (Δ${maxFC - minFC})`);

    // Glycemia delta
    let maxGlic = 0, minGlic = 9999, hasGlic = false;
    (data.glicemia || []).forEach(g => {
      const v = parseFloat(g.valor); if (!isNaN(v)) { hasGlic = true; if (v > maxGlic) maxGlic = v; if (v < minGlic) minGlic = v; }
    });
    if (hasGlic) parts.push(`Glicemia ${minGlic}–${maxGlic} mg/dL (Δ${maxGlic - minGlic})`);

    // BH
    const ganhos = (data.ganhos || []).reduce((s, g) => s + (parseFloat(g.volume) || 0), 0);
    const diurese = (data.diurese || []).reduce((s, d) => s + (parseFloat(d.volume) || 0), 0);
    const drenos = (data.drenos || []).reduce((s, d) => s + (parseFloat(d.volume) || 0), 0);
    const hd = parseFloat(data.hd?.ufReal) || 0;
    const evac = (data.evacuacoes || []).length * 200;
    const perdas = diurese + drenos + hd + evac;
    const bh = ganhos - perdas;
    if (ganhos > 0 || perdas > 0) {
      const sign = bh >= 0 ? '+' : '';
      parts.push(`BH ${sign}${bh}mL`);
      if (diurese > 0) parts.push(`Diurese ${diurese}mL`);
    }
  });

  return parts.length > 0 ? parts.join(' • ') : '';
}

// ===== RENDERING ===== 

function renderDashboard() {
  const grid = document.getElementById('beds-grid');
  if (!grid) return;

  // Print view
  let printHTML = '<div class="print-view" style="display:none;">';
  printHTML += '<div class="print-header">PASSÔMETRO UTI – HSJ</div>';
  printHTML += `<div class="print-date">${formatDateBR(new Date())} – Impresso às ${formatTime(new Date())}</div>`;

  let cardsHTML = '';

  state.beds.forEach((bed, idx) => {
    const occupied = bed.name.trim() !== '';
    const planClass = bed.plan ? `plan-${bed.plan.toLowerCase()}` : '';
    const allAtbs = (bed.antibiotics || []).filter(a => a.name.trim());
    const activeAtbs = allAtbs.filter(a => !a.endDate);
    const activeDevices = DEVICES_LIST.filter(d => bed.devices && bed.devices[d.id]?.active);

    if (occupied) {
      // DDI calculation
      const ddi = bed.dataInternacao ? calcDays(bed.dataInternacao) : null;
      const ddiText = ddi ? `DDI: ${ddi}` : '';

      // HD = first line of diagnosticos
      const hdText = bed.diagnosticos ? bed.diagnosticos.split('\n')[0].split(',')[0].trim() : '';

      // Meta line: age • DDI • HD
      const metaParts = [];
      if (bed.age) metaParts.push(`${bed.age} anos`);
      if (ddiText) metaParts.push(ddiText);
      if (hdText) metaParts.push(`HD: ${hdText}`);
      const metaLine = metaParts.length ? `<div class="bed-meta-line">${escapeHTML(metaParts.join(' • '))}</div>` : '';

      // Suporte pills (devices that are not DVA/sedation)
      const suporteDeviceIds = ['cvc', 'pam', 'svd', 'sng', 'sne', 'tot', 'tqt', 'dreno', 'vm', 'vni', 'o2', 'dialise'];
      const dvaDeviceIds = ['nora', 'dopa', 'dobuta', 'nitro', 'vasopressina'];
      const sedacaoDeviceIds = ['midazolam', 'fentanil', 'propofol'];

      const suporteDevices = activeDevices.filter(d => suporteDeviceIds.includes(d.id));
      const dvaDevices = activeDevices.filter(d => dvaDeviceIds.includes(d.id));
      const sedDevices = activeDevices.filter(d => sedacaoDeviceIds.includes(d.id));

      let suporteHTML = '';
      if (suporteDevices.length > 0) {
        suporteHTML = '<div class="bed-suporte"><span class="bed-section-label">SUPORTE</span><div class="suporte-pills">';
        suporteDevices.forEach(d => {
          const dev = bed.devices[d.id];
          const shortName = d.id.toUpperCase();
          const detail = dev?.detail ? ` (${dev.detail})` : '';
          suporteHTML += `<span class="suporte-pill">${shortName}${escapeHTML(detail)}</span>`;
        });
        suporteHTML += '</div></div>';
      }

      // DVA / Sedação line
      let dvaHTML = '';
      if (dvaDevices.length > 0 || sedDevices.length > 0) {
        dvaHTML = '<div class="bed-dva"><span class="bed-section-label">DVA / SEDAÇÃO</span><div class="dva-text">';
        const dvaParts = dvaDevices.map(d => {
          const dev = bed.devices[d.id];
          return dev?.detail ? `${d.name.split('(')[0].trim()} ${dev.detail}` : d.name.split('(')[0].trim();
        });
        const sedParts = sedDevices.map(d => {
          const dev = bed.devices[d.id];
          const shortName = d.name.split('(')[0].trim().substring(0, 5);
          return dev?.detail ? `${shortName} ${dev.detail}` : shortName;
        });
        const allParts = [...dvaParts, ...sedParts];
        dvaHTML += escapeHTML(allParts.join(' | '));
        dvaHTML += '</div></div>';
      }

      // ATB summary
      let atbHTML = '';
      if (activeAtbs.length > 0) {
        atbHTML = '<div class="bed-atb-summary">';
        activeAtbs.forEach(a => {
          const dCount = calcDays(a.startDate);
          atbHTML += `<span class="atb-pill">${escapeHTML(a.name)} D${dCount}</span>`;
        });
        atbHTML += '</div>';
      }

      // Pendências
      let pendHTML = '';
      if (bed.pendencias && bed.pendencias.trim()) {
        const pendItems = bed.pendencias.split('\n').filter(l => l.trim());
        pendHTML = '<div class="bed-pendencias"><span class="pend-label">📋 PENDÊNCIAS P/ PLANTÃO</span><ul>';
        pendItems.forEach(p => { pendHTML += `<li>${escapeHTML(p.trim())}</li>`; });
        pendHTML += '</ul></div>';
      }

      // Balanço summary from nursing
      let balancoHTML = '';
      const balancoSummary = getBalancoSummaryForBed(idx);
      if (balancoSummary) {
        balancoHTML = `<div class="bed-balanco"><span class="bed-section-label">BALANÇO</span><div class="balanco-text">${escapeHTML(balancoSummary)}</div></div>`;
      }

      cardsHTML += `
        <div class="bed-card ${planClass} occupied" onclick="openBed(${idx})">
          <div class="bed-number">Leito ${bed.number}</div>
          <div class="bed-patient-name">${escapeHTML(bed.name)}</div>
          ${metaLine}
          ${suporteHTML}
          ${dvaHTML}
          ${atbHTML}
          ${balancoHTML}
          ${pendHTML}
        </div>
      `;

      // Print block
      const latestEvo = getLatestEvolution(bed);
      printHTML += `<div class="print-patient-block">`;
      const printDdi = bed.dataInternacao ? ` – DDI: ${calcDays(bed.dataInternacao)}` : '';
      const printHd = bed.diagnosticos ? ` – HD: ${escapeHTML(bed.diagnosticos.split('\n')[0].split(',')[0].trim())}` : '';
      printHTML += `<h4>Leito ${bed.number} – ${escapeHTML(bed.name)} (${bed.age || '?'}a)${printDdi}${printHd} – ${(bed.plan || '').toUpperCase()}</h4>`;

      if (bed.diagnosticos) printHTML += `<div class="print-section"><span class="print-section-title">Dx:</span><span class="print-section-content">${escapeHTML(bed.diagnosticos)}</span></div>`;
      if (bed.hpp) printHTML += `<div class="print-section"><span class="print-section-title">HPP:</span><span class="print-section-content">${escapeHTML(bed.hpp)}</span></div>`;
      if (bed.hma) printHTML += `<div class="print-section"><span class="print-section-title">HMA:</span><span class="print-section-content">${escapeHTML(bed.hma)}</span></div>`;

      // Devices
      if (activeDevices.length > 0) {
        const devTexts = activeDevices.map(d => {
          const detail = bed.devices[d.id]?.detail || '';
          return detail ? `${d.name.split('(')[0].trim()}: ${detail}` : d.name.split('(')[0].trim();
        });
        printHTML += `<div class="print-section"><span class="print-section-title">Dispositivos:</span><span class="print-section-content print-devices">${devTexts.join(' | ')}</span></div>`;
      }

      // Antibiotics
      if (allAtbs.length > 0) {
        const atbTexts = allAtbs.map(a => {
          if (a.endDate) {
            const endStr = a.endDate.split('-').reverse().join('/');
            return `${a.name} (Finalizado: ${endStr}, D${calcDays(a.startDate, a.endDate)})`;
          } else {
            return `${a.name} D${calcDays(a.startDate)}`;
          }
        });
        printHTML += `<div class="print-section"><span class="print-section-title">ATB:</span><span class="print-section-content print-atb-inline">${atbTexts.join(', ')}</span></div>`;
      }

      // AI Summary / Latest evolution
      if (bed.resumoEvolucoes) {
        printHTML += `<div class="print-evo-latest" style="border-left: 3px solid #0d5b8f;"><strong style="color: #0d5b8f;">✨ Resumo Automático (IA):</strong><div style="white-space:pre-wrap; margin-top:4px;">${escapeHTML(bed.resumoEvolucoes)}</div></div>`;
      } else if (latestEvo) {
        printHTML += `<div class="print-evo-latest"><strong>${latestEvo.shift === 'day' ? '☀ Dia' : '🌙 Noite'} ${latestEvo.date}:</strong> ${escapeHTML(latestEvo.text)}</div>`;
      }

      // Balanço summary (from nursing)
      const printBalanco = getBalancoSummaryForBed(idx);
      if (printBalanco) {
        printHTML += `<div class="print-section"><span class="print-section-title">Balanço:</span><span class="print-section-content">${escapeHTML(printBalanco)}</span></div>`;
      }

      // Pendências
      if (bed.pendencias && bed.pendencias.trim()) {
        const pendItems = bed.pendencias.split('\n').filter(l => l.trim());
        printHTML += `<div class="print-section"><span class="print-section-title">Pendências:</span><span class="print-section-content">${pendItems.map(p => escapeHTML(p.trim())).join('; ')}</span></div>`;
      }

      printHTML += '</div>';
    } else {
      cardsHTML += `
        <div class="bed-card" onclick="openBed(${idx})">
          <div class="bed-number">Leito ${bed.number}</div>
          <div class="bed-empty">
            <span class="bed-empty-icon">🛏️</span>
            Vago
          </div>
        </div>
      `;
    }
  });

  printHTML += '</div>';
  grid.innerHTML = cardsHTML + printHTML;
}

function openBed(idx) {
  state.currentBed = idx;
  state.currentTab = 'historia';
  document.getElementById('view-dashboard').style.display = 'none';
  document.getElementById('view-patient').style.display = 'block';
  renderPatientView();
}

function closeBed() {
  state.currentBed = null;
  document.getElementById('view-dashboard').style.display = 'block';
  document.getElementById('view-patient').style.display = 'none';
  destroyCharts();
  renderDashboard();
}

function renderPatientView() {
  const bed = state.beds[state.currentBed];
  if (!bed) return;

  // Header
  document.getElementById('patient-bed-number').textContent = `Leito ${bed.number}`;
  document.getElementById('patient-name').value = bed.name || '';
  document.getElementById('patient-age').value = bed.age || '';
  document.getElementById('patient-weight').value = bed.peso || '';
  document.getElementById('patient-plan').value = bed.plan || '';
  document.getElementById('patient-data-internacao').value = bed.dataInternacao || '';

  // Update DDI display
  const ddiEl = document.getElementById('patient-ddi');
  if (ddiEl) {
    ddiEl.textContent = bed.dataInternacao ? `DDI: ${calcDays(bed.dataInternacao)}` : '';
  }

  // Set active tab
  renderTabs();
  renderActiveTabContent();
}

function renderTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === state.currentTab);
  });
  document.querySelectorAll('.tab-content').forEach(tc => {
    tc.classList.toggle('active', tc.id === `tab-${state.currentTab}`);
  });
}

function switchTab(tab) {
  state.currentTab = tab;
  renderTabs();
  renderActiveTabContent();
}

function renderActiveTabContent() {
  const bed = state.beds[state.currentBed];
  if (!bed) return;

  switch (state.currentTab) {
    case 'historia': renderHistoria(bed); break;
    case 'evolucao': renderEvolucao(bed); break;
    case 'antibioticos': renderAntibioticos(bed); break;
    case 'dispositivos': renderDispositivos(bed); break;
    case 'exames': renderExames(bed); break;
    case 'balanco': renderBalancoDetail(); break;
  }
}

async function renderBalancoDetail() {
  const container = document.getElementById('balanco-detail-content');
  if (!container) return;

  container.innerHTML = '<p style="color:var(--text-muted);font-style:italic;">Carregando dados do balanço...</p>';
  await loadBalancoData();

  const bedIdx = state.currentBed;
  const today = formatDateISO(new Date());
  let html = '';
  let hasData = false;
  
  const chartsToRender = [];

  ['diurno', 'noturno'].forEach(shift => {
    const key = `${bedIdx}_${today}_${shift}`;
    const data = balancoData[key];
    if (!data) return;

    const shiftLabel = shift === 'diurno' ? '☀️ Diurno (07h–19h)' : '🌙 Noturno (19h–07h)';
    const shiftHours = shift === 'diurno'
      ? ['07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18']
      : ['19', '20', '21', '22', '23', '00', '01', '02', '03', '04', '05', '06'];

    const hasSV = Object.keys(data.sinaisVitais || {}).length > 0;
    const hasGanhos = (data.ganhos || []).length > 0;
    const hasDiurese = (data.diurese || []).length > 0;
    const hasDrenos = (data.drenos || []).length > 0;
    const hasGlic = (data.glicemia || []).length > 0;
    const hasHD = parseFloat(data.hd?.ufReal) > 0;

    if (!hasSV && !hasGanhos && !hasDiurese && !hasDrenos && !hasGlic && !hasHD) return;
    hasData = true;

    html += `<div style="margin-bottom:30px;">`;
    html += `<h4 style="color:var(--accent);margin-bottom:16px;">${shiftLabel}</h4>`;

    // 1. Gráfico Hemodinâmico
    html += `<div style="margin-bottom: 20px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 8px; padding: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
      <h5 style="margin-top: 0; margin-bottom: 12px; font-size: 13px; color: var(--text-secondary);">📉 Evolução Hemodinâmica</h5>
      <div style="height: 220px; position: relative;">
         <canvas id="chart-hemo-${shift}"></canvas>
      </div>
    </div>`;

    // Coleta de dados para o gráfico
    const chartData = { shift, hours: shiftHours, pas: [], pad: [], fc: [], nora: [] };
    shiftHours.forEach(h => {
        const pa = (data.sinaisVitais && data.sinaisVitais[h]) ? data.sinaisVitais[h].pa : null;
        if (pa && pa.includes('/')) {
            const [sys, dia] = pa.split('/');
            chartData.pas.push(sys ? parseInt(sys) : null);
            chartData.pad.push(dia ? parseInt(dia) : null);
        } else {
            chartData.pas.push(null);
            chartData.pad.push(null);
        }

        const fc = (data.sinaisVitais && data.sinaisVitais[h]) ? data.sinaisVitais[h].fc : null;
        chartData.fc.push(fc ? parseInt(fc) : null);

        let vasoDose = 0;
        if (data.ganhos) {
            const noraGanho = data.ganhos.find(g => g.descricao && g.descricao.toLowerCase().includes('nora'));
            if (noraGanho && noraGanho.volumes && noraGanho.volumes[h]) {
                vasoDose = parseFloat(noraGanho.volumes[h]);
            }
        }
        chartData.nora.push(vasoDose);
    });
    chartsToRender.push(chartData);

    // 2. Mapa de Fluxo (Flowsheet)
    html += `<div style="overflow-x: auto; background: var(--bg-card); border: 1px solid var(--border); border-radius: 8px; margin-bottom: 16px; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
      <table class="atb-table" style="min-width: 700px; margin: 0; font-size: 12px;">
        <thead>
          <tr>
            <th style="width: 160px; position: sticky; left: 0; background: var(--surface); z-index: 2; border-right: 1px solid var(--border);">Parâmetro</th>
            ${shiftHours.map(h => `<th style="text-align: center; min-width: 45px;">${h}h</th>`).join('')}
            <th style="text-align: center; min-width: 60px; background: rgba(0,0,0,0.02);">Total</th>
          </tr>
        </thead>
        <tbody>
    `;

    // --- SINAIS VITAIS ---
    html += `<tr><td colspan="${shiftHours.length + 2}" style="background: rgba(0,0,0,0.04); font-weight: 700; padding: 6px 10px; color: var(--text-primary);">Sinais Vitais</td></tr>`;
    
    // PA
    html += `<tr><td style="position: sticky; left: 0; background: var(--bg-card); font-weight: 600; border-right: 1px solid var(--border);">PA (mmHg)</td>`;
    shiftHours.forEach(h => {
        const val = (data.sinaisVitais && data.sinaisVitais[h]) ? data.sinaisVitais[h].pa : '';
        html += `<td style="text-align: center;">${val || '-'}</td>`;
    });
    html += `<td style="background: rgba(0,0,0,0.02);"></td></tr>`;

    // FC
    html += `<tr><td style="position: sticky; left: 0; background: var(--bg-card); font-weight: 600; border-right: 1px solid var(--border);">FC (bpm)</td>`;
    shiftHours.forEach(h => {
        const val = (data.sinaisVitais && data.sinaisVitais[h]) ? data.sinaisVitais[h].fc : '';
        html += `<td style="text-align: center;">${val || '-'}</td>`;
    });
    html += `<td style="background: rgba(0,0,0,0.02);"></td></tr>`;

    // SpO2
    html += `<tr><td style="position: sticky; left: 0; background: var(--bg-card); font-weight: 600; border-right: 1px solid var(--border);">SpO₂ (%)</td>`;
    shiftHours.forEach(h => {
        const val = (data.sinaisVitais && data.sinaisVitais[h]) ? data.sinaisVitais[h].spo2 : '';
        html += `<td style="text-align: center;">${val || '-'}</td>`;
    });
    html += `<td style="background: rgba(0,0,0,0.02);"></td></tr>`;

    // Temp
    html += `<tr><td style="position: sticky; left: 0; background: var(--bg-card); font-weight: 600; border-right: 1px solid var(--border);">Temp (°C)</td>`;
    shiftHours.forEach(h => {
        const val = (data.sinaisVitais && data.sinaisVitais[h]) ? data.sinaisVitais[h].tax : '';
        html += `<td style="text-align: center;">${val || '-'}</td>`;
    });
    html += `<td style="background: rgba(0,0,0,0.02);"></td></tr>`;

    // --- INFUSÕES ---
    if (data.ganhos && data.ganhos.length > 0) {
      html += `<tr><td colspan="${shiftHours.length + 2}" style="background: rgba(13,91,143,0.08); color: var(--accent); font-weight: 700; padding: 6px 10px;">Infusões e Ganhos</td></tr>`;
      
      data.ganhos.forEach(g => {
         const desc = g.descricao ? g.descricao.trim() : 'S/ Descrição';
         if (!desc) return;
         let rowTotal = 0;
         html += `<tr><td style="position: sticky; left: 0; background: var(--bg-card); font-weight: 600; color: var(--accent); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; border-right: 1px solid var(--border);" title="${desc}">${desc}</td>`;
         shiftHours.forEach(h => {
            const val = (g.volumes && g.volumes[h]) ? parseFloat(g.volumes[h]) : 0;
            if (val > 0) rowTotal += val;
            html += `<td style="text-align: center; color: var(--accent);">${val > 0 ? val : '-'}</td>`;
         });
         // Fallback
         if (rowTotal === 0 && parseFloat(g.volume) > 0) rowTotal = parseFloat(g.volume);
         html += `<td style="text-align: center; font-weight: 700; color: var(--accent); background: rgba(0,0,0,0.02);">${rowTotal > 0 ? rowTotal : '-'}</td></tr>`;
      });
    }

    // --- PERDAS ---
    html += `<tr><td colspan="${shiftHours.length + 2}" style="background: rgba(220,38,38,0.08); color: var(--danger); font-weight: 700; padding: 6px 10px;">Perdas</td></tr>`;
    
    // Diurese
    let totalDiurese = 0;
    html += `<tr><td style="position: sticky; left: 0; background: var(--bg-card); font-weight: 600; color: var(--danger); border-right: 1px solid var(--border);">Diurese</td>`;
    shiftHours.forEach(h => {
       let valH = 0;
       (data.diurese || []).forEach(d => { if (d.volumes && d.volumes[h]) valH += parseFloat(d.volumes[h]) || 0; });
       if (valH > 0) totalDiurese += valH;
       html += `<td style="text-align: center; color: var(--danger);">${valH > 0 ? valH : '-'}</td>`;
    });
    if (totalDiurese === 0) totalDiurese = (data.diurese || []).reduce((s, d) => s + (parseFloat(d.volume) || 0), 0);
    html += `<td style="text-align: center; font-weight: 700; color: var(--danger); background: rgba(0,0,0,0.02);">${totalDiurese > 0 ? totalDiurese : '-'}</td></tr>`;

    // Drenos
    let totalDrenos = 0;
    html += `<tr><td style="position: sticky; left: 0; background: var(--bg-card); font-weight: 600; color: var(--danger); border-right: 1px solid var(--border);">Drenos</td>`;
    shiftHours.forEach(h => {
       let valH = 0;
       (data.drenos || []).forEach(d => { if (d.volumes && d.volumes[h]) valH += parseFloat(d.volumes[h]) || 0; });
       if (valH > 0) totalDrenos += valH;
       html += `<td style="text-align: center; color: var(--danger);">${valH > 0 ? valH : '-'}</td>`;
    });
    if (totalDrenos === 0) totalDrenos = (data.drenos || []).reduce((s, d) => s + (parseFloat(d.volume) || 0), 0);
    html += `<td style="text-align: center; font-weight: 700; color: var(--danger); background: rgba(0,0,0,0.02);">${totalDrenos > 0 ? totalDrenos : '-'}</td></tr>`;

    // --- BALANÇO HÍDRICO ---
    html += `<tr><td colspan="${shiftHours.length + 2}" style="background: rgba(0,0,0,0.04); font-weight: 700; padding: 6px 10px;">Resumo Balanço</td></tr>`;
    html += `<tr><td style="position: sticky; left: 0; background: var(--bg-card); font-weight: 700; border-right: 1px solid var(--border);">Balanço da Hora</td>`;
    
    let totalGanhosCalc = 0;
    let totalPerdasCalc = 0;
    
    shiftHours.forEach(h => {
       let gH = 0, diuH = 0, dreH = 0;
       (data.ganhos || []).forEach(g => { if (g.volumes && g.volumes[h]) gH += parseFloat(g.volumes[h]) || 0; });
       (data.diurese || []).forEach(d => { if (d.volumes && d.volumes[h]) diuH += parseFloat(d.volumes[h]) || 0; });
       (data.drenos || []).forEach(d => { if (d.volumes && d.volumes[h]) dreH += parseFloat(d.volumes[h]) || 0; });
       
       let bhH = gH - diuH - dreH;
       let bhColor = bhH > 0 ? 'color: var(--accent);' : (bhH < 0 ? 'color: var(--danger);' : 'color: var(--text-muted);');
       html += `<td style="text-align: center; font-weight: 700; ${bhColor}">${bhH !== 0 ? (bhH > 0 ? '+' : '') + bhH : '-'}</td>`;
       
       totalGanhosCalc += gH;
       totalPerdasCalc += (diuH + dreH);
    });

    if (totalGanhosCalc === 0) totalGanhosCalc = (data.ganhos || []).reduce((s, g) => s + (parseFloat(g.volume) || 0), 0);
    if (totalPerdasCalc === 0) {
      const evac = (data.evacuacoes || []).length * 200;
      const hd = parseFloat(data.hd?.ufReal) || 0;
      totalPerdasCalc = totalDiurese + totalDrenos + evac + hd;
    }

    const bhTotal = totalGanhosCalc - totalPerdasCalc;
    const signTotal = bhTotal >= 0 ? '+' : '';
    const bhTotalColor = bhTotal > 0 ? 'color: var(--accent);' : (bhTotal < 0 ? 'color: var(--danger);' : 'color: var(--text-primary);');
    
    html += `<td style="text-align: center; font-weight: 800; font-size: 14px; ${bhTotalColor}; background: rgba(0,0,0,0.03); border-left: 2px solid var(--border);">${signTotal}${bhTotal}</td></tr>`;

    html += `</tbody></table></div>`;

    // Clinical summary badges
    const badges = [];
    let maxTemp2 = 0, hasTemp2 = false, feverEps2 = 0, hypothermiaEps2 = 0;
    Object.values(data.sinaisVitais || {}).forEach(sv => {
      const t = parseFloat((sv.tax || '').replace(',', '.'));
      if (!isNaN(t)) { hasTemp2 = true; if (t > maxTemp2) maxTemp2 = t; if (t >= 37.8) feverEps2++; if (t < 36.0) hypothermiaEps2++; }
    });
    if (hasTemp2) {
      if (feverEps2 === 0 && hypothermiaEps2 === 0) {
        badges.push(`<span class="resumo-badge resumo-success">Afebril</span>`);
      } else {
        if (feverEps2 > 0) badges.push(`<span class="resumo-badge resumo-danger">${feverEps2} episódio${feverEps2 > 1 ? 's' : ''} febril${feverEps2 > 1 ? 's' : ''}</span>`);
        if (hypothermiaEps2 > 0) badges.push(`<span class="resumo-badge resumo-warning">${hypothermiaEps2} episódio${hypothermiaEps2 > 1 ? 's' : ''} de hipotermia</span>`);
      }
    }
    let maxPAS = 0, minPAS = 999, maxFC = 0, minFC = 999, hasPAS = false, hasFC = false;
    Object.values(data.sinaisVitais || {}).forEach(sv => {
      if (sv.pa) { const p = parseInt(sv.pa.split('/')[0]); if (!isNaN(p)) { hasPAS = true; if (p > maxPAS) maxPAS = p; if (p < minPAS) minPAS = p; } }
      const fc = parseInt(sv.fc); if (!isNaN(fc)) { hasFC = true; if (fc > maxFC) maxFC = fc; if (fc < minFC) minFC = fc; }
    });
    if (hasPAS) badges.push(`<span class="resumo-badge resumo-info">ΔPA: ${minPAS}–${maxPAS} mmHg (Δ${maxPAS - minPAS})</span>`);
    if (hasFC) badges.push(`<span class="resumo-badge resumo-info">ΔFC: ${minFC}–${maxFC} bpm (Δ${maxFC - minFC})</span>`);
    let maxGlic2 = 0, minGlic2 = 9999, hasGlic2 = false;
    (data.glicemia || []).forEach(g => {
      const v = parseFloat(g.valor); if (!isNaN(v)) { hasGlic2 = true; if (v > maxGlic2) maxGlic2 = v; if (v < minGlic2) minGlic2 = v; }
    });
    if (hasGlic2) badges.push(`<span class="resumo-badge resumo-info">ΔGlicemia: ${minGlic2}–${maxGlic2} mg/dL (Δ${maxGlic2 - minGlic2})</span>`);

    if (badges.length > 0) {
      html += `<div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px;">${badges.join('')}</div>`;
    }

    html += `</div><hr style="border:none;border-top:1px solid var(--border);margin:24px 0;">`;
  });

  if (!hasData) {
    html = `<p style="color:var(--text-muted);font-style:italic;">Nenhum dado de balanço registrado para hoje.</p>`;
  }

  container.innerHTML = html;

  // Renderizar gráficos após inserir no DOM
  setTimeout(() => {
    chartsToRender.forEach(c => {
      const canvas = document.getElementById(`chart-hemo-${c.shift}`);
      if (!canvas) return;

      // Destruir gráfico anterior se existir (limpeza)
      if (window[`chart_hemo_${c.shift}`]) {
          window[`chart_hemo_${c.shift}`].destroy();
      }

      window[`chart_hemo_${c.shift}`] = new Chart(canvas, {
        type: 'line',
        data: {
          labels: c.hours.map(h => `${h}h`),
          datasets: [
            {
              label: 'PA Sistólica',
              data: c.pas,
              borderColor: '#b91c1c', // red-700
              backgroundColor: '#b91c1c',
              tension: 0.3,
              spanGaps: true,
              yAxisID: 'y'
            },
            {
              label: 'PA Diastólica',
              data: c.pad,
              borderColor: '#ef4444', // red-500
              backgroundColor: '#ef4444',
              tension: 0.3,
              spanGaps: true,
              yAxisID: 'y'
            },
            {
              label: 'FC',
              data: c.fc,
              borderColor: '#0284c7', // sky-600
              backgroundColor: '#0284c7',
              tension: 0.3,
              spanGaps: true,
              yAxisID: 'y'
            },
            {
              type: 'bar',
              label: 'Noradrenalina (ml/h)',
              data: c.nora,
              backgroundColor: 'rgba(245, 158, 11, 0.5)', // amber-500
              borderColor: '#f59e0b',
              borderWidth: 1,
              yAxisID: 'y1'
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: 'index', intersect: false },
          scales: {
            y: {
              type: 'linear',
              display: true,
              position: 'left',
              title: { display: true, text: 'PA / FC' },
              min: 0,
              max: 200
            },
            y1: {
              type: 'linear',
              display: true,
              position: 'right',
              grid: { drawOnChartArea: false },
              title: { display: true, text: 'Nora (ml/h)' },
              min: 0,
              suggestedMax: 20
            }
          },
          plugins: {
            legend: { position: 'top', labels: { boxWidth: 12, font: { size: 10 } } }
          }
        }
      });
    });
  }, 50);
}

function renderHistoria(bed) {
  document.getElementById('input-diagnosticos').value = bed.diagnosticos || '';
  document.getElementById('input-pendencias').value = bed.pendencias || '';
  document.getElementById('input-hpp').value = bed.hpp || '';
  document.getElementById('input-hma').value = bed.hma || '';
}

function renderEvolucao(bed) {
  const list = document.getElementById('evolution-list');
  if (!list) return;

  if (!bed.evolutions || bed.evolutions.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <span class="icon">📝</span>
        <p>Nenhuma evolução registrada ainda.<br>Adicione a primeira evolução abaixo.</p>
      </div>
    `;
    return;
  }

  // Sort by date desc
  const sorted = [...bed.evolutions].sort((a, b) => {
    const da = new Date(a.date.split('/').reverse().join('-') + 'T' + (a.shift === 'day' ? '07:00' : '19:00'));
    const db_ = new Date(b.date.split('/').reverse().join('-') + 'T' + (b.shift === 'day' ? '07:00' : '19:00'));
    return db_ - da;
  });

  let aiSummaryHTML = '';
  if (bed.resumoEvolucoes) {
    aiSummaryHTML = `
      <div style="background: rgba(13,91,143,0.05); border-left: 4px solid var(--accent); padding: 12px; margin-bottom: 20px; border-radius: 4px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <h4 style="margin:0; color:var(--accent); font-size:13px; display:flex; align-items:center; gap:6px;">✨ Resumo Automático (IA)</h4>
          <span id="ai-summary-loading" style="display:none; font-size:11px; color:var(--text-muted);">⟳ Atualizando resumo...</span>
        </div>
        <textarea onchange="updateResumoEvolucoes(this.value)" style="width: 100%; min-height: 100px; font-size: 13px; line-height: 1.5; color: var(--text-primary); background: rgba(255,255,255,0.7); border: 1px solid rgba(13,91,143,0.2); border-radius: 4px; padding: 8px; resize: vertical; font-family: inherit; box-sizing: border-box;">${escapeHTML(bed.resumoEvolucoes)}</textarea>
      </div>
    `;
  } else if (bed.evolutions && bed.evolutions.length > 0) {
    aiSummaryHTML = `
      <div style="background: rgba(0,0,0,0.02); border: 1px dashed var(--border); padding: 12px; margin-bottom: 20px; border-radius: 4px; display:flex; justify-content:space-between; align-items:center;">
         <span style="font-size:13px; color:var(--text-muted);">Nenhum resumo gerado ainda.</span>
         <span id="ai-summary-loading" style="display:none; font-size:11px; color:var(--text-muted);">⟳ Gerando resumo...</span>
      </div>
    `;
  }

  list.innerHTML = aiSummaryHTML + sorted.map((evo, i) => `
    <div class="evolution-item">
      <button class="evo-delete" onclick="deleteEvolution(${bed.evolutions.indexOf(evo)})" title="Excluir">✕</button>
      <div class="evo-header">
        <div style="display: flex; gap: 8px; align-items: center;">
          <span class="${evo.shift === 'day' ? 'evo-badge-day' : 'evo-badge-night'}">
            ${evo.shift === 'day' ? '☀️ Diurno' : '🌙 Noturno'}
          </span>
          <span class="evo-date">${evo.date}</span>
        </div>
        <button class="btn btn-sm" style="font-size:11px; padding:3px 8px; margin-right: 25px; border:1px solid var(--border); border-radius:4px; background:var(--bg-card); color:var(--text-primary); cursor:pointer;" onclick="copyEvolutionFormat(${bed.evolutions.indexOf(evo)})">📋 Copiar Evolução</button>
      </div>
      <div class="evo-text">${escapeHTML(evo.text)}</div>
    </div>
  `).join('');
}

function addEvolution() {
  const bedIdx = state.currentBed;
  const bed = state.beds[bedIdx];
  if (!bed) return;

  let text = document.getElementById('new-evo-text').value.trim();
  if (!text) { alert('A evolução não pode ficar vazia. É obrigatória!'); return; }
  text = smartCase(text);

  const shift = document.querySelector('.shift-toggle button.active-day, .shift-toggle button.active-night')?.dataset.shift || 'day';
  const date = document.getElementById('new-evo-date').value || formatDateBR(new Date());

  if (!bed.evolutions) bed.evolutions = [];
  bed.evolutions.push({ shift, date, text, timestamp: Date.now() });

  document.getElementById('new-evo-text').value = '';
  renderEvolucao(bed);
  triggerSave();
  requestEvolutionSummary(bedIdx);
}

function deleteEvolution(idx) {
  const bedIdx = state.currentBed;
  const bed = state.beds[bedIdx];
  if (!bed || !confirm('Excluir esta evolução?')) return;
  bed.evolutions.splice(idx, 1);
  renderEvolucao(bed);
  triggerSave();
  requestEvolutionSummary(bedIdx);
}

async function requestEvolutionSummary(bedIdx) {
  const bed = state.beds[bedIdx];
  if (!bed) return;
  
  if (!bed.evolutions || bed.evolutions.length === 0) {
    bed.resumoEvolucoes = '';
    renderEvolucao(bed);
    triggerSave();
    return;
  }

  try {
    if (!window.firebaseFunctions) return;
    const { getFunctions, httpsCallable } = window.firebaseFunctions;
    const functions = getFunctions(window.firebaseDb.app);
    const gerarResumo = httpsCallable(functions, 'gerarResumoEvolucoes');
    
    // UI Feedback
    showSaveIndicator('saving', '✨ Gerando resumo via IA...');
    const loadingEl = document.getElementById('ai-summary-loading');
    if (loadingEl) loadingEl.style.display = 'inline-block';

    const result = await gerarResumo({ evolutions: bed.evolutions, antibiotics: bed.antibiotics });
    if (result.data && result.data.resumo) {
       bed.resumoEvolucoes = result.data.resumo;
       triggerSave();
       if (state.currentBed === bedIdx) {
           renderEvolucao(bed);
       }
       showSaveIndicator('saved', '✓ Resumo IA salvo!');
    }
  } catch(e) {
    console.error("Erro ao gerar resumo IA:", e);
    showSaveIndicator('error', 'Erro na IA do Resumo');
    const loadingEl = document.getElementById('ai-summary-loading');
    if (loadingEl) loadingEl.style.display = 'none';
  }
}

window.updateResumoEvolucoes = function(newText) {
  const bed = state.beds[state.currentBed];
  if (!bed) return;
  bed.resumoEvolucoes = newText;
  triggerSave();
};

async function copyEvolutionFormat(idx) {
  const bed = state.beds[state.currentBed];
  if (!bed || !bed.evolutions || !bed.evolutions[idx]) return;
  const evo = bed.evolutions[idx];
  
  const shiftName = evo.shift === 'day' ? 'diurno' : 'noturno';
  let formattedText = `# Evolução do plantão ${shiftName}\n`;
  if (evo.date) formattedText += `Data: ${evo.date}\n\n`;

  // Diagnósticos
  if (bed.diagnosticos && bed.diagnosticos.trim()) {
    formattedText += `Lista de Diagnósticos:\n${bed.diagnosticos.trim()}\n\n`;
  }
  
  // HMA e HPP
  if (bed.hma && bed.hma.trim()) {
    formattedText += `HMA:\n${bed.hma.trim()}\n\n`;
  }
  
  if (bed.hpp && bed.hpp.trim()) {
    formattedText += `HPP:\n${bed.hpp.trim()}\n\n`;
  }
  
  // Evolução do plantão
  formattedText += `# Avaliação Diária\n${evo.text.trim()}\n`;

  try {
    await navigator.clipboard.writeText(formattedText);
    showSaveIndicator('saved', '✓ Evolução copiada!');
  } catch (err) {
    console.error('Falha ao copiar texto: ', err);
    alert('Não foi possível copiar a evolução.');
  }
}

async function inserirBalancoNaEvolucao() {
  const bedIdx = state.currentBed;
  if (bedIdx === null) return;
  
  // Sempre recarregar os dados do Firebase para garantir o valor mais recente inserido pela enfermagem
  await loadBalancoData();
  
  let dateStr = document.getElementById('new-evo-date').value.trim();
  let searchDateISO = formatDateISO(new Date());
  
  if (dateStr) {
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      searchDateISO = `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
  }

  const shiftBtn = document.querySelector('.shift-toggle button.active-day') || document.querySelector('.shift-toggle button.active-night');
  const evoShift = shiftBtn ? shiftBtn.dataset.shift : 'day';
  const dataShift = evoShift === 'day' ? 'diurno' : 'noturno';
  
  const key = `${bedIdx}_${searchDateISO}_${dataShift}`;
  const data = balancoData[key];
  
  if (!data) {
    alert(`Nenhum dado de balanço encontrado para o turno ${dataShift === 'diurno' ? 'Diurno' : 'Noturno'} na data ${searchDateISO}.`);
    return;
  }
  
  let textoEvo = [];
  
  // Sinais Vitais
  let maxTemp = 0, feverEps = 0, hypothermiaEps = 0;
  let maxPAS = 0, minPAS = 999, maxFC = 0, minFC = 999;
  let hasTemp = false, hasPAS = false, hasFC = false;
  
  Object.values(data.sinaisVitais || {}).forEach(sv => {
    const t = parseFloat((sv.tax || '').replace(',', '.'));
    if (!isNaN(t)) { hasTemp = true; if (t > maxTemp) maxTemp = t; if (t >= 37.8) feverEps++; if (t < 36.0) hypothermiaEps++; }
    if (sv.pa) { const p = parseInt(sv.pa.split('/')[0]); if (!isNaN(p)) { hasPAS = true; if (p > maxPAS) maxPAS = p; if (p < minPAS) minPAS = p; } }
    const fc = parseInt(sv.fc); if (!isNaN(fc)) { hasFC = true; if (fc > maxFC) maxFC = fc; if (fc < minFC) minFC = fc; }
  });
  
  const vitalsText = [];
  if (hasTemp) {
    if (feverEps === 0 && hypothermiaEps === 0) vitalsText.push('Afebril');
    else {
      if (feverEps > 0) vitalsText.push(`${feverEps} pico(s) febril`);
      if (hypothermiaEps > 0) vitalsText.push(`${hypothermiaEps} ep. hipotermia`);
    }
  }
  if (hasPAS) vitalsText.push(`ΔPA: ${minPAS}-${maxPAS} mmHg (Δ${maxPAS-minPAS})`);
  if (hasFC) vitalsText.push(`ΔFC: ${minFC}-${maxFC} bpm (Δ${maxFC-minFC})`);
  
  if (vitalsText.length) textoEvo.push('- Sinais Vitais: ' + vitalsText.join(' | '));
  
  // Glicemia
  let maxGlic = 0, minGlic = 9999, hasGlic = false;
  (data.glicemia || []).forEach(g => {
    const v = parseFloat(g.valor); if (!isNaN(v)) { hasGlic = true; if (v > maxGlic) maxGlic = v; if (v < minGlic) minGlic = v; }
  });
  if (hasGlic) textoEvo.push(`- ΔGlicemia: ${minGlic}-${maxGlic} mg/dL (Δ${maxGlic-minGlic})`);
  
  // Balanço
  const ganhos = (data.ganhos || []).reduce((s, g) => s + (parseFloat(g.volume) || 0), 0);
  const diurese = (data.diurese || []).reduce((s, d) => s + (parseFloat(d.volume) || 0), 0);
  const drenos = (data.drenos || []).reduce((s, d) => s + (parseFloat(d.volume) || 0), 0);
  const hd = parseFloat(data.hd?.ufReal) || 0;
  const evac = (data.evacuacoes || []).length * 200;
  const perdas = diurese + drenos + hd + evac;
  const bh = ganhos - perdas;
  const sign = bh >= 0 ? '+' : '';
  
  textoEvo.push(`- Balanço Hídrico: ${sign}${bh} mL`);
  const details = [];
  if (ganhos > 0) details.push(`Ganhos: ${ganhos}mL`);
  if (perdas > 0) {
    let pDetail = `Perdas: ${perdas}mL (Diurese: ${diurese}mL`;
    if (drenos > 0) pDetail += `, Drenos: ${drenos}mL`;
    if (hd > 0) pDetail += `, HD: ${hd}mL`;
    if (evac > 0) pDetail += `, Evac: ${(data.evacuacoes||[]).length}x`;
    pDetail += `)`;
    details.push(pDetail);
  }
  if (details.length) textoEvo.push('  ' + details.join(' | '));
  
  const textarea = document.getElementById('new-evo-text');
  const addTxt = textoEvo.join('\n');
  if (textarea.value.trim() !== '') {
    textarea.value += '\n\n' + addTxt;
  } else {
    textarea.value = addTxt;
  }
}

async function inserirInfusoesNaEvolucao() {
  const bedIdx = state.currentBed;
  if (bedIdx === null) return;
  
  await loadBalancoData();
  
  let dateStr = document.getElementById('new-evo-date').value.trim();
  let searchDateISO = formatDateISO(new Date());
  
  if (dateStr) {
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      searchDateISO = `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
  }

  // Vamos analisar ambos os turnos do dia para ter uma visão de "24h"
  const shifts = ['diurno', 'noturno'];
  const allGanhos = {};

  shifts.forEach(shift => {
    const key = `${bedIdx}_${searchDateISO}_${shift}`;
    const data = balancoData[key];
    if (data && data.ganhos) {
      data.ganhos.forEach(g => {
        const desc = g.descricao ? g.descricao.trim() : 'Sem descrição';
        if (!desc) return;
        
        if (!allGanhos[desc]) {
          allGanhos[desc] = { hourlyValues: [], totalVolume: 0 };
        }
        
        // Coletar valores hora a hora
        if (g.volumes) {
          const hours = shift === 'diurno' 
            ? ['07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18']
            : ['19', '20', '21', '22', '23', '00', '01', '02', '03', '04', '05', '06'];
            
          hours.forEach(h => {
            if (g.volumes[h] !== undefined && g.volumes[h] !== '') {
              const val = parseFloat(g.volumes[h]);
              if (!isNaN(val)) {
                allGanhos[desc].hourlyValues.push(val);
                allGanhos[desc].totalVolume += val;
              }
            }
          });
        } else {
          // Fallback if no hourly volumes but has total volume
          const val = parseFloat(g.volume);
          if (!isNaN(val) && val > 0) {
             allGanhos[desc].totalVolume += val;
          }
        }
      });
    }
  });

  const infusoesText = [];
  
  Object.keys(allGanhos).forEach(desc => {
    if (desc === 'Sem descrição') return; // Ignorar ganhos vazios
    const info = allGanhos[desc];
    const values = info.hourlyValues;
    const nonZeroValues = values.filter(v => v > 0);
    
    if (nonZeroValues.length === 0) {
      if (info.totalVolume > 0) {
        infusoesText.push(`- ${desc}: volume total ${info.totalVolume} ml`);
      }
      return;
    }

    const first = nonZeroValues[0];
    const last = nonZeroValues[nonZeroValues.length - 1];
    const min = Math.min(...nonZeroValues);
    const max = Math.max(...nonZeroValues);

    let status = '';
    if (nonZeroValues.length <= 2 && values.length > 2) {
      // Muito poucos valores não-zero comparado ao total -> intermitente
      status = `intermitente (total ${info.totalVolume} ml)`;
    } else if (max === min) {
      status = `dose estável (${max} ml/h)`;
    } else if (last > first) {
      status = `dose crescente (${min} a ${max} ml/h)`;
    } else if (last < first) {
      status = `dose decrescente (${max} a ${min} ml/h)`;
    } else {
      status = `dose variável (${min} a ${max} ml/h)`;
    }

    infusoesText.push(`- ${desc}: ${status}`);
  });

  if (infusoesText.length === 0) {
    alert(`Nenhuma infusão encontrada para a data ${searchDateISO}.`);
    return;
  }

  const textarea = document.getElementById('new-evo-text');
  const addTxt = "Infusões em 24h:\n" + infusoesText.join('\n');
  if (textarea.value.trim() !== '') {
    textarea.value += '\n\n' + addTxt;
  } else {
    textarea.value = addTxt;
  }
}

function selectShift(shift) {
  document.querySelectorAll('.shift-toggle button').forEach(btn => {
    btn.className = btn.dataset.shift === shift
      ? (shift === 'day' ? 'active-day' : 'active-night')
      : '';
  });
}

function renderAntibioticos(bed) {
  const tbody = document.getElementById('atb-tbody');
  if (!tbody) return;

  if (!bed.antibiotics) bed.antibiotics = [];

  const rows = bed.antibiotics.map((atb, i) => {
    const dCount = calcDays(atb.startDate, atb.endDate);
    const opacity = atb.endDate ? '0.6' : '1';
    return `
      <tr style="opacity: ${opacity}">
        <td><input type="text" value="${escapeAttr(atb.name)}" onchange="updateAtb(${i},'name',this.value)" placeholder="Nome do ATB"></td>
        <td><input type="date" value="${atb.startDate || ''}" onchange="updateAtb(${i},'startDate',this.value)"></td>
        <td><input type="date" value="${atb.endDate || ''}" onchange="updateAtb(${i},'endDate',this.value)" title="Data de término (se finalizado)"></td>
        <td style="text-align:center"><span class="d-count">${dCount}</span></td>
        <td><input type="text" value="${escapeAttr(atb.notes || '')}" onchange="updateAtb(${i},'notes',this.value)" placeholder="Obs."></td>
        <td><button class="btn btn-danger btn-sm btn-icon" onclick="deleteAtb(${i})">✕</button></td>
      </tr>
    `;
  }).join('');

  tbody.innerHTML = rows;
}

function addAtb() {
  const bed = state.beds[state.currentBed];
  if (!bed) return;
  if (!bed.antibiotics) bed.antibiotics = [];
  bed.antibiotics.push({ name: '', startDate: formatDateISO(new Date()), endDate: '', notes: '' });
  renderAntibioticos(bed);
  triggerSave();
}

function updateAtb(idx, field, value) {
  const bed = state.beds[state.currentBed];
  if (!bed || !bed.antibiotics[idx]) return;
  bed.antibiotics[idx][field] = value;
  if (field === 'startDate') renderAntibioticos(bed); // refresh D count
  triggerSave();
}

function deleteAtb(idx) {
  const bed = state.beds[state.currentBed];
  if (!bed || !confirm('Remover este antibiótico?')) return;
  bed.antibiotics.splice(idx, 1);
  renderAntibioticos(bed);
  triggerSave();
}

function getActiveDrugsFromBalanco(bedIdx) {
  const active = {};
  const todayISO = formatDateISO(new Date());
  const shifts = ['diurno', 'noturno'];
  
  const aliases = {
    'noradrenalina': 'nora',
    'adrenalina': 'adrenalina',
    'dobutamina': 'dobuta',
    'dopamina': 'dopa',
    'nitroglicerina': 'nitro',
    'tridil': 'nitro',
    'nitroprussiato': 'nipride',
    'nipride': 'nipride',
    'fentanil': 'fentanil',
    'midazolam': 'midazolam',
    'propofol': 'propofol',
    'ketamina': 'ketamina',
    'vasopressina': 'vasopressina',
    'amiodarona': 'amiodarona'
  };

  shifts.forEach(shift => {
    const key = `${bedIdx}_${todayISO}_${shift}`;
    const data = balancoData[key];
    if (data && data.ganhos) {
      data.ganhos.forEach(g => {
        if (!g.descricao) return;
        const descLower = g.descricao.toLowerCase();
        
        let foundId = null;
        for (const [alias, id] of Object.entries(aliases)) {
          if (descLower.includes(alias)) {
            foundId = id;
            break;
          }
        }
        
        if (foundId) {
          let lastRate = 0;
          if (g.volumes) {
             const hours = Object.keys(g.volumes).sort((a,b) => parseInt(a) - parseInt(b));
             for (let h of hours) {
                if (g.volumes[h] !== null && g.volumes[h] !== '') {
                   lastRate = parseFloat(g.volumes[h]) || 0;
                }
             }
          }
          if (lastRate > 0) {
             active[foundId] = lastRate;
          }
        }
      });
    }
  });
  return active;
}

function renderDispositivos(bed) {
  const container = document.getElementById('devices-grid');
  if (!container) return;
  if (!bed.devices) bed.devices = {};
  
  const bedIdx = state.currentBed;
  const importedDrugs = getActiveDrugsFromBalanco(bedIdx);
  const peso = parseFloat(bed.peso) || 0;

  container.innerHTML = DEVICES_LIST.map(d => {
    const isImported = importedDrugs.hasOwnProperty(d.id);
    const importedRate = isImported ? importedDrugs[d.id] : null;
    
    let dev = bed.devices[d.id] || { active: false, detail: '', calc: null };
    if (isImported) {
      dev.active = true;
    }

    const isDrug = DRUG_SOLUTIONS.hasOwnProperty(d.id);
    const drugInfo = isDrug ? DRUG_SOLUTIONS[d.id] : null;

    let calcHtml = '';
    if (isDrug && dev.active) {
      if (!dev.calc) dev.calc = { type: '0', customConc: 0 };
      
      const optionsHtml = drugInfo.options.map((opt, i) => 
        `<option value="${i}" ${dev.calc.type === String(i) ? 'selected' : ''}>${opt.label}</option>`
      ).join('');
      
      let currentConc = 0;
      if (dev.calc.type === 'custom') {
         currentConc = parseFloat(dev.calc.customConc) || 0;
      } else {
         const optIdx = parseInt(dev.calc.type) || 0;
         if (drugInfo.options[optIdx]) currentConc = drugInfo.options[optIdx].concMcgMl;
      }
      
      const rateMlH = isImported ? importedRate : (parseFloat(dev.detail.replace(',','.')) || 0);
      
      let doseStr = '-';
      if (rateMlH > 0 && currentConc > 0) {
        if (drugInfo.calcType === 'mcg/kg/min') {
           if (peso > 0) doseStr = `${((rateMlH * currentConc) / (peso * 60)).toFixed(2)} mcg/kg/min`;
           else doseStr = `Peso ind.`;
        } else if (drugInfo.calcType === 'mcg/min') {
           doseStr = `${((rateMlH * currentConc) / 60).toFixed(1)} mcg/min`;
        } else if (drugInfo.calcType === 'mg/kg/h') {
           if (peso > 0) doseStr = `${((rateMlH * (currentConc / 1000)) / peso).toFixed(2)} mg/kg/h`;
           else doseStr = `Peso ind.`;
        } else if (drugInfo.calcType === 'mg/min') {
           doseStr = `${((rateMlH * (currentConc / 1000)) / 60).toFixed(2)} mg/min`;
        }
      }

      calcHtml = `
        <div class="drug-calc-box" style="margin-top:8px; padding:8px; background:var(--bg-input); border-radius:4px; border:1px solid var(--border); font-size:12px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
             <span style="font-weight:600; color:var(--text-secondary);">Solução:</span>
             <select onchange="updateDrugCalc('${d.id}', 'type', this.value)" style="font-size:11px; padding:2px; border:1px solid var(--border); border-radius:4px;">
                ${optionsHtml}
                <option value="custom" ${dev.calc.type === 'custom' ? 'selected' : ''}>Personalizada...</option>
             </select>
          </div>
          ${dev.calc.type === 'custom' ? `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
               <span style="color:var(--text-muted);">Conc (mcg/mL):</span>
               <input type="number" value="${dev.calc.customConc}" onchange="updateDrugCalc('${d.id}', 'customConc', this.value)" style="width:70px; padding:2px 4px; font-size:11px;">
            </div>
          ` : ''}
          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:4px;">
             <span style="color:var(--text-primary);">Dose atual:</span>
             <span style="font-weight:700; color:var(--accent);">${doseStr}</span>
          </div>
          <div style="margin-top:6px; text-align:right;">
             <button onclick="openDrugCalculator('${d.id}')" style="font-size:11px; padding:4px 8px; background:var(--bg-card); border:1px solid var(--accent); color:var(--accent); border-radius:4px; cursor:pointer;">🧮 Calculadora</button>
          </div>
        </div>
      `;
    }

    return `
      <div class="device-card ${dev.active ? 'active' : ''} ${isImported ? 'imported-device' : ''}" style="${isImported ? 'border: 1px dashed var(--accent);' : ''}">
        <div class="device-card-header">
          <button class="device-toggle ${dev.active ? 'on' : ''}" 
                  onclick="${isImported ? `alert('Droga ativa no balanço hídrico. Para desligar, pare no balanço ou aguarde atualização.')` : `toggleDevice('${d.id}')`}"></button>
          <span class="device-name">${d.name} ${isImported ? '<span style="font-size:10px;color:var(--accent);margin-left:4px;">(Balanço)</span>' : ''}</span>
        </div>
        ${dev.active ? `
          <div class="device-detail">
            ${isImported ? `
              <div style="padding:4px 0; font-size:13px; font-weight:600; color:var(--text-primary);">Vazão Atual: ${importedRate} ml/h</div>
            ` : `
              <input type="text" value="${escapeAttr(dev.detail)}" 
                     onchange="updateDeviceDetail('${d.id}', this.value)"
                     placeholder="${d.detailLabel}">
            `}
          </div>
          ${calcHtml}
        ` : ''}
      </div>
    `;
  }).join('');
}

function updateDrugCalc(deviceId, field, value) {
  const bed = state.beds[state.currentBed];
  if (!bed || !bed.devices || !bed.devices[deviceId]) return;
  if (!bed.devices[deviceId].calc) bed.devices[deviceId].calc = { type: '0', customConc: 0 };
  bed.devices[deviceId].calc[field] = value;
  triggerSave();
  renderDispositivos(bed);
}

function openDrugCalculator(deviceId) {
  const bed = state.beds[state.currentBed];
  if (!bed || !DRUG_SOLUTIONS[deviceId]) return;
  const drugInfo = DRUG_SOLUTIONS[deviceId];
  const dev = bed.devices[deviceId];
  
  if (!dev || !dev.calc) return;
  
  let currentConc = 0;
  if (dev.calc.type === 'custom') {
     currentConc = parseFloat(dev.calc.customConc) || 0;
  } else {
     const optIdx = parseInt(dev.calc.type) || 0;
     if (drugInfo.options[optIdx]) currentConc = drugInfo.options[optIdx].concMcgMl;
  }
  
  if (currentConc <= 0) {
     alert('Defina a concentração da solução (ou escolha uma padrão) para usar a calculadora.');
     return;
  }
  
  const peso = parseFloat(bed.peso) || 0;
  if (peso <= 0 && (drugInfo.calcType.includes('/kg/'))) {
     alert('Preencha o peso do paciente no cabeçalho para calcular essa droga.');
     return;
  }

  state.activeCalc = {
     deviceId,
     drugInfo,
     concMcgMl: currentConc,
     peso
  };
  
  document.getElementById('calc-modal-title').textContent = `Calculadora: ${drugInfo.name}`;
  document.getElementById('calc-label-dose').textContent = drugInfo.calcType;
  document.getElementById('calc-input-dose').value = '';
  document.getElementById('calc-input-mlh').value = '';
  document.getElementById('calc-result-mlh').textContent = '-- ml/h';
  document.getElementById('calc-result-dose').textContent = '-- ' + drugInfo.calcType;
  
  document.getElementById('drug-calc-modal').style.display = 'flex';
}

function calculateDrugFromDose() {
  if (!state.activeCalc) return;
  const dose = parseFloat(document.getElementById('calc-input-dose').value.replace(',','.'));
  if (isNaN(dose) || dose <= 0) {
     document.getElementById('calc-result-mlh').textContent = '-- ml/h';
     return;
  }
  
  const { drugInfo, concMcgMl, peso } = state.activeCalc;
  let mlh = 0;
  
  // dose = (mlh * conc) / (peso * 60) -> mlh = (dose * peso * 60) / conc
  if (drugInfo.calcType === 'mcg/kg/min') {
     mlh = (dose * peso * 60) / concMcgMl;
  } else if (drugInfo.calcType === 'mcg/min') {
     mlh = (dose * 60) / concMcgMl;
  } else if (drugInfo.calcType === 'mg/kg/h') {
     // dose = (mlh * (conc/1000)) / peso -> mlh = (dose * peso) / (conc/1000)
     mlh = (dose * peso) / (concMcgMl / 1000);
  } else if (drugInfo.calcType === 'mg/min') {
     mlh = (dose * 60) / (concMcgMl / 1000);
  }
  
  document.getElementById('calc-result-mlh').textContent = `${mlh.toFixed(1)} ml/h`;
}

function calculateDrugFromMlh() {
  if (!state.activeCalc) return;
  const mlh = parseFloat(document.getElementById('calc-input-mlh').value.replace(',','.'));
  if (isNaN(mlh) || mlh <= 0) {
     document.getElementById('calc-result-dose').textContent = '-- ' + state.activeCalc.drugInfo.calcType;
     return;
  }
  
  const { drugInfo, concMcgMl, peso } = state.activeCalc;
  let dose = 0;
  
  if (drugInfo.calcType === 'mcg/kg/min') {
     dose = (mlh * concMcgMl) / (peso * 60);
  } else if (drugInfo.calcType === 'mcg/min') {
     dose = (mlh * concMcgMl) / 60;
  } else if (drugInfo.calcType === 'mg/kg/h') {
     dose = (mlh * (concMcgMl / 1000)) / peso;
  } else if (drugInfo.calcType === 'mg/min') {
     dose = (mlh * (concMcgMl / 1000)) / 60;
  }
  
  let doseStr = drugInfo.calcType.includes('/min') && drugInfo.calcType.includes('mg') ? dose.toFixed(2) : dose.toFixed(2);
  if (drugInfo.calcType === 'mcg/min') doseStr = dose.toFixed(1);
  
  document.getElementById('calc-result-dose').textContent = `${doseStr} ${drugInfo.calcType}`;
}

function applyDrugMlh() {
  if (!state.activeCalc) return;
  
  const mlhNode = document.getElementById('calc-result-mlh').textContent;
  const inputMlh = document.getElementById('calc-input-mlh').value;
  
  let finalMlh = '';
  if (mlhNode && mlhNode !== '-- ml/h') {
     finalMlh = mlhNode.replace(' ml/h', '');
  } else if (inputMlh && parseFloat(inputMlh) > 0) {
     finalMlh = inputMlh;
  }
  
  if (finalMlh) {
     const bedIdx = state.currentBed;
     const importedDrugs = getActiveDrugsFromBalanco(bedIdx);
     if (importedDrugs.hasOwnProperty(state.activeCalc.deviceId)) {
        alert('Atenção: A vazão foi calculada (' + finalMlh + ' ml/h). Ajuste a bomba física. Como este dado é importado do balanço, ele atualizará no passômetro apenas após o lançamento da enfermagem.');
     } else {
        updateDeviceDetail(state.activeCalc.deviceId, finalMlh);
     }
  }
  
  document.getElementById('drug-calc-modal').style.display = 'none';
}

function toggleDevice(deviceId) {
  const bed = state.beds[state.currentBed];
  if (!bed) return;
  if (!bed.devices) bed.devices = {};
  if (!bed.devices[deviceId]) bed.devices[deviceId] = { active: false, detail: '' };
  bed.devices[deviceId].active = !bed.devices[deviceId].active;
  renderDispositivos(bed);
  triggerSave();
}

function updateDeviceDetail(deviceId, value) {
  const bed = state.beds[state.currentBed];
  if (!bed || !bed.devices || !bed.devices[deviceId]) return;
  bed.devices[deviceId].detail = value;
  triggerSave();
}

function renderExames(bed) {
  const container = document.getElementById('exam-entries');
  if (!container) return;
  try {
    if (!bed.exams) bed.exams = [];
    else if (!Array.isArray(bed.exams)) bed.exams = Object.values(bed.exams);
    
    if (!bed.customExams) bed.customExams = [];
    else if (!Array.isArray(bed.customExams)) bed.customExams = Object.values(bed.customExams);

    // Sort exams by date so columns are ordered properly
    const sortedExams = [...bed.exams].sort((a, b) => (a.date || '').localeCompare(b.date || ''));

    let html = '<div class="table-responsive" style="overflow-x:auto; margin-bottom:16px;">';
    html += '<table class="exams-table" style="width:100%; border-collapse:collapse; min-width:800px;">';
    
    // -- THEAD: Header row with dates
    html += '<thead><tr>';
  html += '<th style="text-align:left; padding:8px; background:var(--bg-card); position:sticky; left:0; z-index:2; border-bottom:2px solid var(--border); min-width:140px;">Exames</th>';
  
  // Date columns
  sortedExams.forEach((exam) => {
    // find original index to pass to update/delete
    const origIdx = bed.exams.findIndex(e => e === exam);
    html += '<th style="padding:8px; font-weight:normal; border-bottom:2px solid var(--border); text-align:center; min-width: 140px;">';
    html += '<div style="display:flex; gap:4px; align-items:center; justify-content:center;">';
    html += `<input type="date" value="${exam.date || ''}" onchange="updateExam(${origIdx},'date',this.value)" style="width:100%; padding:4px 6px; font-size:12px; border:1px solid var(--border); border-radius:4px; background:var(--bg-input);">`;
    html += `<button class="btn btn-danger btn-sm btn-icon" onclick="deleteExam(${origIdx})" style="padding:4px 8px; font-size:10px;" title="Excluir Coluna">✕</button>`;
    html += '</div></th>';
  });
  html += '<th style="width:100%; border-bottom:2px solid var(--border);"></th>';
  html += '</tr></thead>';

  // -- TBODY: Rows for each field
  html += '<tbody>';
  
  // Default list
  EXAM_FIELDS.forEach((f, rIndex) => {
    const bg = (rIndex % 2 === 0) ? '' : 'background: rgba(0,0,0,0.02);';
    html += `<tr style="border-bottom:1px solid var(--border); ${bg}">`;
    html += `<td style="padding:8px; font-size:13px; font-weight:600; color:var(--text-primary); position:sticky; left:0; background:var(--bg-card); z-index:1; border-right:1px solid var(--border);">${f.name} <span style="font-size:10px; color:var(--text-muted); font-weight:normal;">${f.unit ? `(${f.unit})` : ''}</span></td>`;
    
    sortedExams.forEach((exam, cIdx) => {
      const origIdx = bed.exams.findIndex(e => e === exam);
      html += `<td style="padding:6px; border-right:1px solid var(--border);">`;
      html += `<input type="text" value="${escapeAttr(exam[f.id] || '')}" onchange="updateExam(${origIdx},'${f.id}',this.value)" class="exam-value-input" data-row="${rIndex}" data-col="${cIdx}" style="width:100%; padding:6px; font-size:13px; border:1px solid var(--border); border-radius:4px; text-align:center;">`;
      html += `</td>`;
    });
    html += `<td></td></tr>`;
  });

  // Custom List
  bed.customExams.forEach((cExam, cIdx) => {
    const rIndex = EXAM_FIELDS.length + cIdx;
    const bg = (rIndex % 2 === 0) ? '' : 'background: rgba(0,0,0,0.02);';
    html += `<tr style="border-bottom:1px solid var(--border); ${bg}">`;
    html += `<td style="padding:8px; position:sticky; left:0; background:var(--bg-card); z-index:1; border-right:1px solid var(--border);">`;
    html += `<div style="display:flex; gap:4px; align-items:center;">`;
    html += `<input type="text" value="${escapeAttr(cExam.name)}" onchange="updateCustomExamName(${cIdx}, this.value)" style="width:100%; padding:4px 6px; font-size:12px; border:1px solid var(--border); border-radius:4px;" placeholder="Novo Exame">`;
    html += `<button class="btn btn-danger btn-sm btn-icon" onclick="deleteCustomExam(${cIdx})" style="padding:4px 8px; font-size:10px;" title="Excluir Linha">✕</button>`;
    html += `</div></td>`;
    
    sortedExams.forEach((exam, cIdx) => {
      const origIdx = bed.exams.findIndex(e => e === exam);
      html += `<td style="padding:6px; border-right:1px solid var(--border);">`;
      html += `<input type="text" value="${escapeAttr(exam[cExam.id] || '')}" onchange="updateExam(${origIdx},'${cExam.id}',this.value)" class="exam-value-input" data-row="${rIndex}" data-col="${cIdx}" style="width:100%; padding:6px; font-size:13px; border:1px solid var(--border); border-radius:4px; text-align:center;">`;
      html += `</td>`;
    });
    html += `<td></td></tr>`;
  });

  html += '</tbody></table></div>';

    // Action Buttons
    html += '<div style="margin-top:16px;display:flex;gap:12px;flex-wrap:wrap;">';
    html += '<button class="btn btn-primary" onclick="addExam()">+ Adicionar Data (Coluna)</button>';
    html += '<button class="btn" style="border: 1px solid var(--accent); color: var(--accent); background: transparent;" onclick="addCustomExam()">+ Adicionar Exame Extra (Linha)</button>';
    html += '</div>';

    container.innerHTML = html;

    // Setup vertical navigation for exam inputs
    setupExamNavigation(container);

    // Render charts
    renderExamCharts(bed);
  } catch (e) {
    container.innerHTML = '<div style="color:var(--danger); padding: 15px; border: 1px solid var(--danger);"><strong>Erro ao renderizar tabela de exames:</strong><br>' + e.message + '</div>';
    console.error(e);
  }
}

function setupExamNavigation(container) {
  container.addEventListener('keydown', function(e) {
    const input = e.target;
    if (!input.classList.contains('exam-value-input')) return;
    
    if (e.key === 'Tab' || e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      
      // Dispara o onchange manualmente para salvar o valor atual
      input.dispatchEvent(new Event('change'));
      
      const r = parseInt(input.dataset.row);
      const c = parseInt(input.dataset.col);
      const nextRow = e.shiftKey ? (r - 1) : (r + 1);
      
      const nextInput = container.querySelector(`.exam-value-input[data-row="${nextRow}"][data-col="${c}"]`);
      if (nextInput) {
        nextInput.focus();
        nextInput.select();
      }
      // Se não encontrar próxima linha, permanece no campo atual (sem mudar de coluna)
    }
  }, true); // 'true' = capturing phase, intercepta ANTES do comportamento padrão do Tab
}

function parseTextExams() {
  const textInput = document.getElementById('import-text-exams');
  if (!textInput) return;
  const rawText = textInput.value;
  if (!rawText.trim()) return;

  const bed = state.beds[state.currentBed];
  if (!bed) return;
  if (!bed.exams) bed.exams = [];

  const dtStr = formatDateISO(new Date());
  let targetEntry = bed.exams.find(e => e.date === dtStr);
  if (!targetEntry) {
    targetEntry = { date: dtStr };
    EXAM_FIELDS.forEach(f => { targetEntry[f.id] = ''; });
    bed.exams.push(targetEntry);
  }

  let foundCount = 0;

  const findVal = (aliases) => {
    for (let alias of aliases) {
      if (!alias) continue;
      const regexStr = `\\b${alias}(?![a-zA-Zá-úÁ-Ú])\\s*[:=\\-]?\\s*([0-9]+(?:[,.][0-9]+)?)`;
      const regex = new RegExp(regexStr, 'i');
      const match = rawText.match(regex);
      if (match && match[1]) {
        return match[1].replace(',', '.');
      }
    }
    return null;
  };

  const idMap = {
    'hb': ['hb', 'hemoglobina'],
    'ht': ['ht', 'hematocrito', 'hematócrito'],
    'leuco': ['leuco', 'leucocitos', 'leucócitos', 'global', 'gb'],
    'mielocitos': ['mielocitos', 'mielócitos', 'mielo'],
    'metamielocitos': ['metamielocitos', 'metamielócitos', 'meta'],
    'bastonetes': ['bast', 'bastonetes', 'bastões', 'bastoes'],
    'segmentados': ['seg', 'segmentados'],
    'eosinofilos': ['eos', 'eosinofilos', 'eosinófilos'],
    'linf': ['linf', 'linfocitos', 'linfócitos'],
    'mono': ['mono', 'monocitos', 'monócitos'],
    'plaq': ['plaq', 'plaquetas'],
    'ph': ['ph'],
    'po2': ['po2', 'pao2'],
    'pco2': ['pco2', 'paco2'],
    'hco3': ['hco3', 'bicarbonato', 'bic'],
    'sat': ['sat', 'sato2', 'sat o2', 'saturação', 'saturacao'],
    'ur': ['ur', 'ureia', 'uréia'],
    'cr': ['cr', 'creatinina', 'creat'],
    'na': ['na', 'sodio', 'sódio'],
    'k': ['k', 'potassio', 'potássio'],
    'tppa': ['tppa', 'ttpa'],
    'inr': ['inr', 'tap'],
    'cpk': ['cpk', 'ck'],
    'alb': ['alb', 'albumina'],
    'pcr': ['pcr', 'proteina c reativa'],
    'lactato': ['lactato', 'lac'],
    'svo2': ['svo2'],
    'gap_co2': ['gap co2', 'gapco2', 'gap'],
    'troponina': ['tropo', 'troponina', 'trop']
  };

  for (const [fieldId, aliases] of Object.entries(idMap)) {
    const val = findVal(aliases);
    if (val) {
      targetEntry[fieldId] = val;
      foundCount++;
    }
  }

  // BE can be negative
  const matchBE = rawText.match(/\bbe(?![a-zA-Z])\s*[:=\\-]?\s*([+\-]?[0-9]+(?:[,.][0-9]+)?)/i) || 
                  rawText.match(/\bbase excess(?![a-zA-Z])\s*[:=\\-]?\s*([+\-]?[0-9]+(?:[,.][0-9]+)?)/i);
  if (matchBE && matchBE[1]) {
    targetEntry['be'] = matchBE[1].replace(',', '.');
    foundCount++;
  }

  // Composites
  let ca = findVal(['ca', 'calcio', 'cálcio']);
  let mg = findVal(['mg', 'magnesio', 'magnésio']);
  let compMatch = rawText.match(/\b(?:ca.*mg|c[aá]lcio.*magn[ée]sio)(?![a-zA-Z])\s*[:=\\-]?\s*([0-9.,]+)[\s/]+([0-9.,]+)/i);
  if (compMatch && (!ca && !mg)) {
    ca = compMatch[1];
    mg = compMatch[2];
  }
  if (ca) { targetEntry['ca'] = ca; foundCount++; }
  if (mg) { targetEntry['mg'] = mg; foundCount++; }

  let cl = findVal(['cl', 'cloro']);
  let pVal = findVal(['p', 'fosforo', 'fósforo']);
  compMatch = rawText.match(/\b(?:cl.*p|cloro.*f[oó]sforo)(?![a-zA-Z])\s*[:=\\-]?\s*([0-9.,]+)[\s/]+([0-9.,]+)/i);
  if (compMatch && (!cl && !pVal)) {
    cl = compMatch[1];
    pVal = compMatch[2];
  }
  if (cl) { targetEntry['cl'] = cl; foundCount++; }
  if (pVal) { targetEntry['p'] = pVal; foundCount++; }
  
  let tgo = findVal(['tgo', 'ast']);
  let tgp = findVal(['tgp', 'alt']);
  compMatch = rawText.match(/\b(?:tgo.*tgp|ast.*alt)(?![a-zA-Z])\s*[:=\\-]?\s*([0-9.,]+)[\s/]+([0-9.,]+)/i);
  if (compMatch && (!tgo && !tgp)) {
    tgo = compMatch[1];
    tgp = compMatch[2];
  }
  if (tgo) { targetEntry['tgo'] = tgo; foundCount++; }
  if (tgp) { targetEntry['tgp'] = tgp; foundCount++; }
  
  let bd = findVal(['bd', 'bilirrubina direta']);
  let bi = findVal(['bi', 'bilirrubina indireta']);
  compMatch = rawText.match(/\b(?:bd.*bi)(?![a-zA-Z])\s*[:=\\-]?\s*([0-9.,]+)[\s/]+([0-9.,]+)/i);
  if (compMatch && (!bd && !bi)) {
    bd = compMatch[1];
    bi = compMatch[2];
  }
  if (bd) { targetEntry['bd'] = bd; foundCount++; }
  if (bi) { targetEntry['bi'] = bi; foundCount++; }
  
  let ggt = findVal(['ggt', 'gama', 'gama gt']);
  let fa = findVal(['fa', 'fosfatase', 'fosfatase alcalina']);
  compMatch = rawText.match(/\b(?:ggt.*fa)(?![a-zA-Z])\s*[:=\\-]?\s*([0-9.,]+)[\s/]+([0-9.,]+)/i);
  if (compMatch && (!ggt && !fa)) {
    ggt = compMatch[1];
    fa = compMatch[2];
  }
  if (ggt) { targetEntry['ggt'] = ggt; foundCount++; }
  if (fa) { targetEntry['fa'] = fa; foundCount++; }

  if (foundCount > 0) {
    renderExames(bed);
    triggerSave();
    showSaveIndicator('saved', `✓ ${foundCount} exames processados`);
  } else {
    alert('Não foi possível extrair valores. Tente o formato: "Hb 10, Ht 30, Ur 40"');
  }
}

function addCustomExam() {
  const bed = state.beds[state.currentBed];
  if (!bed) return;
  if (!bed.customExams) bed.customExams = [];
  const newId = 'custom_' + Date.now();
  bed.customExams.push({ id: newId, name: '' });
  renderExames(bed);
  triggerSave();
}

function updateCustomExamName(idx, value) {
  const bed = state.beds[state.currentBed];
  if (!bed || !bed.customExams[idx]) return;
  bed.customExams[idx].name = value;
  triggerSave();
}

function deleteCustomExam(idx) {
  const bed = state.beds[state.currentBed];
  if (!bed || !bed.customExams[idx]) return;
  if (!confirm('Remover esta linha de exame extra?')) return;
  bed.customExams.splice(idx, 1);
  renderExames(bed);
  triggerSave();
}

function addExam() {
  const bed = state.beds[state.currentBed];
  if (!bed) return;
  if (!bed.exams) bed.exams = [];
  const entry = { date: formatDateISO(new Date()) };
  EXAM_FIELDS.forEach(f => { entry[f.id] = ''; });
  bed.exams.push(entry);
  renderExames(bed);
  triggerSave();
}

function updateExam(idx, field, value) {
  const bed = state.beds[state.currentBed];
  if (!bed || !bed.exams[idx]) return;
  bed.exams[idx][field] = value;
  triggerSave();
  // Debounced chart refresh
  clearTimeout(state._examChartTimeout);
  state._examChartTimeout = setTimeout(() => renderExamCharts(bed), 500);
}

function deleteExam(idx) {
  const bed = state.beds[state.currentBed];
  if (!bed || !confirm('Remover este exame?')) return;
  bed.exams.splice(idx, 1);
  renderExames(bed);
  triggerSave();
}

function destroyCharts() {
  Object.values(state.charts).forEach(c => { try { c.destroy(); } catch (e) { } });
  state.charts = {};
}

function renderExamCharts(bed) {
  if (!bed.exams || bed.exams.length < 1) return;
  if (typeof Chart === 'undefined') return;

  destroyCharts();

  const chartGroups = [
    { id: 'chart-hemograma', title: 'Hemograma', fields: ['hb', 'ht', 'leuco', 'plaq'] },
    { id: 'chart-renal', title: 'Função Renal / Inflamação', fields: ['ur', 'cr', 'pcr', 'lactato'] },
    { id: 'chart-ions', title: 'Eletrólitos / Hepático', fields: ['na', 'k', 'tgo', 'tgp'] },
  ];

  const colors = ['#0d5b8f', '#16a34a', '#d97706', '#dc2626', '#7c3aed', '#0891b2'];
  const sorted = [...bed.exams].sort((a, b) => (a.date || '').localeCompare(b.date || ''));
  const labels = sorted.map(e => e.date ? formatDateBR(new Date(e.date + 'T12:00:00')) : '?');

  chartGroups.forEach(group => {
    const canvas = document.getElementById(group.id);
    if (!canvas) return;

    const datasets = group.fields.map((fid, ci) => {
      const field = EXAM_FIELDS.find(f => f.id === fid);
      const data = sorted.map(e => {
        const v = parseFloat(e[fid]);
        return isNaN(v) ? null : v;
      });
      return {
        label: field ? `${field.name} (${field.unit})` : fid,
        data,
        borderColor: colors[ci % colors.length],
        backgroundColor: colors[ci % colors.length] + '15',
        tension: 0.3,
        pointRadius: 4,
        pointHoverRadius: 6,
        spanGaps: true,
      };
    });

    state.charts[group.id] = new Chart(canvas, {
      type: 'line',
      data: { labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top', labels: { color: '#6c757d', font: { size: 11 } } },
          title: { display: true, text: group.title, color: '#1a2332', font: { size: 14, weight: 700 } },
        },
        scales: {
          x: { ticks: { color: '#9ca3af', font: { size: 10 } }, grid: { color: '#e5e7eb' } },
          y: { ticks: { color: '#9ca3af', font: { size: 10 } }, grid: { color: '#e5e7eb' } },
        },
      },
    });
  });
}

// ===== PATIENT HEADER UPDATES =====
function updatePatientField(field, value) {
  const bed = state.beds[state.currentBed];
  if (!bed) return;
  const smartCaseFields = ['diagnosticos', 'pendencias', 'hpp', 'hma'];
  if (smartCaseFields.includes(field)) value = smartCase(value);
  bed[field] = value;
  triggerSave();
}

function clearPatient() {
  if (!confirm('Deseja realmente limpar todos os dados deste leito? Esta ação não pode ser desfeita.')) return;
  const bed = state.beds[state.currentBed];
  const num = bed.number;
  state.beds[state.currentBed] = createEmptyBed(num);
  renderPatientView();
  triggerSave();
}

// ===== HELPERS =====
function calcDays(startDate, endDate) {
  if (!startDate) return 0;
  const start = new Date(startDate + 'T00:00:00');
  let end = new Date();
  if (endDate) {
    const parsedEnd = new Date(endDate + 'T00:00:00');
    if (parsedEnd < end) end = parsedEnd;
  }
  end.setHours(0, 0, 0, 0);
  const diff = Math.floor((end - start) / (1000 * 60 * 60 * 24));
  return Math.max(diff + 1, 1);
}

function formatDateBR(d) {
  if (!(d instanceof Date) || isNaN(d)) return '';
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

function formatDateISO(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatTime(d) {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function escapeHTML(str) {
  if (str == null) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function escapeAttr(str) {
  if (str == null) return '';
  return String(str).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function getLatestEvolution(bed) {
  if (!bed.evolutions || bed.evolutions.length === 0) return null;
  return [...bed.evolutions].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))[0];
}

// ===== PRINT =====
function printPassometro() {
  window.print();
}

// ===== LOGOUT =====
function logout() {
  if (window.firebaseAuthModule) {
    window.firebaseAuthModule.signOut(window.firebaseAuth)
      .then(() => {
        document.getElementById('app-container').style.display = 'none';
        document.getElementById('login-screen').style.display = 'flex';
      })
      .catch(e => console.error('Logout error:', e));
  }
}

// ===== INIT =====
async function initApp() {
  initState();

  // Try loading from Firebase first, fallback to local
  const firebaseLoaded = await loadFirebase();
  if (!firebaseLoaded) {
    loadLocal();
    // IMPORTANT: If we loaded from local but Firebase had nothing,
    // push local data to Firebase so the nursing page can see it
    console.log('[PASS] Firebase had no data, syncing local data to Firebase...');
    await saveFirebase();
  }

  // Load nursing balance data
  await loadBalancoData();

  // Update header date
  const dateEl = document.getElementById('header-date');
  if (dateEl) {
    dateEl.textContent = formatDateBR(new Date());
  }

  renderDashboard();

  // Set default evolution date
  const evoDate = document.getElementById('new-evo-date');
  if (evoDate) {
    evoDate.value = formatDateBR(new Date());
  }
}

// Called from index.html after Firebase auth resolves
window.startApp = initApp;
