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
  { id: 'vm', name: 'Ventilação Mecânica', detailLabel: 'Modo / Parâmetros' },
  { id: 'vni', name: 'VNI (Ventilação Não Invasiva)', detailLabel: 'Modo / Parâmetros' },
  { id: 'o2', name: 'O₂ Suplementar', detailLabel: 'Litros/min / Dispositivo' },
  { id: 'dialise', name: 'Diálise', detailLabel: 'Tipo / Detalhes' },
];

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
    const activeAtbs = (bed.antibiotics || []).filter(a => a.name.trim());
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
      if (activeAtbs.length > 0) {
        const atbTexts = activeAtbs.map(a => `${a.name} D${calcDays(a.startDate)}`);
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

  // Always refresh balance data from Firebase when tab is opened
  container.innerHTML = '<p style="color:var(--text-muted);font-style:italic;">Carregando dados do balanço...</p>';
  await loadBalancoData();

  const bedIdx = state.currentBed;
  const today = formatDateISO(new Date());
  let html = '';
  let hasData = false;

  ['diurno', 'noturno'].forEach(shift => {
    const key = `${bedIdx}_${today}_${shift}`;
    const data = balancoData[key];
    if (!data) return;

    const shiftLabel = shift === 'diurno' ? '☀️ Diurno (07h–19h)' : '🌙 Noturno (19h–07h)';
    const shiftHours = shift === 'diurno'
      ? ['07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18']
      : ['19', '20', '21', '22', '23', '00', '01', '02', '03', '04', '05', '06'];

    // Check if there's any actual data
    const hasSV = Object.keys(data.sinaisVitais || {}).length > 0;
    const hasGanhos = (data.ganhos || []).length > 0;
    const hasDiurese = (data.diurese || []).length > 0;
    const hasDrenos = (data.drenos || []).length > 0;
    const hasGlic = (data.glicemia || []).length > 0;
    const hasHD = parseFloat(data.hd?.ufReal) > 0;

    if (!hasSV && !hasGanhos && !hasDiurese && !hasDrenos && !hasGlic && !hasHD) return;
    hasData = true;

    html += `<div style="margin-bottom:20px;">`;
    html += `<h4 style="color:var(--accent);margin-bottom:12px;">${shiftLabel}</h4>`;

    // Vital signs table
    if (hasSV) {
      html += `<div style="overflow-x:auto;margin-bottom:16px;"><table class="sv-table"><thead><tr>
        <th>Hora</th><th>PA</th><th>FC</th><th>FR</th><th>SpO₂</th><th>Tax</th><th>Obs</th>
      </tr></thead><tbody>`;
      shiftHours.forEach(h => {
        const sv = data.sinaisVitais[h];
        if (sv && (sv.pa || sv.fc || sv.fr || sv.spo2 || sv.tax)) {
          html += `<tr>
            <td style="font-weight:700;color:var(--accent);">${h}:00</td>
            <td>${sv.pa || '-'}</td><td>${sv.fc || '-'}</td>
            <td>${sv.fr || '-'}</td><td>${sv.spo2 || '-'}</td>
            <td>${sv.tax || '-'}</td><td>${sv.obs || ''}</td>
          </tr>`;
        }
      });
      html += `</tbody></table></div>`;
    }

    // Glycemia
    if (hasGlic) {
      html += `<p style="font-weight:700;font-size:12px;color:var(--text-muted);margin:8px 0 4px;">GLICEMIA</p>`;
      data.glicemia.forEach(g => {
        html += `<span style="display:inline-block;margin-right:12px;font-size:13px;">${g.hora || '?'}: <strong>${g.valor || '-'}</strong> mg/dL${g.insulina ? ` (${g.insulina}UI)` : ''}</span>`;
      });
    }

    // BH calculation
    const ganhos = (data.ganhos || []).reduce((s, g) => s + (parseFloat(g.volume) || 0), 0);
    const diurese = (data.diurese || []).reduce((s, d) => s + (parseFloat(d.volume) || 0), 0);
    const drenos = (data.drenos || []).reduce((s, d) => s + (parseFloat(d.volume) || 0), 0);
    const hd = parseFloat(data.hd?.ufReal) || 0;
    const evac = (data.evacuacoes || []).length * 200;
    const perdas = diurese + drenos + hd + evac;
    const bh = ganhos - perdas;
    const sign = bh >= 0 ? '+' : '';

    html += `<div style="display:flex;gap:24px;margin:12px 0;flex-wrap:wrap;">`;
    if (hasGanhos) html += `<div class="bal-total" style="flex:1;min-width:150px;">Ganhos: ${ganhos} mL</div>`;
    html += `<div class="bal-total" style="flex:1;min-width:150px;">Perdas: ${perdas} mL (Diurese ${diurese}${drenos > 0 ? ` | Drenos ${drenos}` : ''}${hd > 0 ? ` | HD ${hd}` : ''})</div>`;
    html += `</div>`;
    html += `<div class="bal-total" style="font-size:16px;font-weight:800;background:${bh >= 0 ? 'rgba(13,91,143,0.08)' : 'rgba(220,38,38,0.08)'};color:${bh >= 0 ? 'var(--accent)' : 'var(--danger)'};border-color:${bh >= 0 ? 'rgba(13,91,143,0.2)' : 'rgba(220,38,38,0.2)'};">BH: ${sign}${bh} mL</div>`;

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
      html += `<div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:12px;">${badges.join('')}</div>`;
    }

    html += `</div><hr style="border:none;border-top:1px solid var(--border);margin:16px 0;">`;
  });

  if (!hasData) {
    html = `<p style="color:var(--text-muted);font-style:italic;">Nenhum dado de balanço registrado para hoje.</p>`;
  }

  container.innerHTML = html;
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
        <div style="font-size:13px; line-height:1.5; color:var(--text-primary); white-space:pre-wrap;">${escapeHTML(bed.resumoEvolucoes)}</div>
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

    const result = await gerarResumo({ evolutions: bed.evolutions });
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
    const dCount = calcDays(atb.startDate);
    return `
      <tr>
        <td><input type="text" value="${escapeAttr(atb.name)}" onchange="updateAtb(${i},'name',this.value)" placeholder="Nome do ATB"></td>
        <td><input type="date" value="${atb.startDate || ''}" onchange="updateAtb(${i},'startDate',this.value)"></td>
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
  bed.antibiotics.push({ name: '', startDate: formatDateISO(new Date()), notes: '' });
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

function renderDispositivos(bed) {
  const container = document.getElementById('devices-grid');
  if (!container) return;
  if (!bed.devices) bed.devices = {};

  container.innerHTML = DEVICES_LIST.map(d => {
    const dev = bed.devices[d.id] || { active: false, detail: '' };
    return `
      <div class="device-card ${dev.active ? 'active' : ''}">
        <div class="device-card-header">
          <button class="device-toggle ${dev.active ? 'on' : ''}" 
                  onclick="toggleDevice('${d.id}')"></button>
          <span class="device-name">${d.name}</span>
        </div>
        ${dev.active ? `
          <div class="device-detail">
            <input type="text" value="${escapeAttr(dev.detail)}" 
                   onchange="updateDeviceDetail('${d.id}', this.value)"
                   placeholder="${d.detailLabel}">
          </div>
        ` : ''}
      </div>
    `;
  }).join('');
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
function calcDays(startDate) {
  if (!startDate) return 0;
  const start = new Date(startDate + 'T00:00:00');
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const diff = Math.floor((now - start) / (1000 * 60 * 60 * 24));
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
