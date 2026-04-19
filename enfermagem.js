// ===== BALANÇO HÍDRICO – ENFERMAGEM UTI =====
// Separate app for nursing staff to track 24h fluid balance

const TOTAL_BEDS = 10;

// ===== HELPERS =====
function escapeHTML(str) { if (!str) return ''; return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

function formatDateISO(d) {
    return d.getFullYear() + '-' +
        String(d.getMonth() + 1).padStart(2, '0') + '-' +
        String(d.getDate()).padStart(2, '0');
}

function formatDateBR(d) {
    return String(d.getDate()).padStart(2, '0') + '/' +
        String(d.getMonth() + 1).padStart(2, '0') + '/' +
        d.getFullYear();
}

function todayISO() { return formatDateISO(new Date()); }

// ===== STATE =====
let state = {
    beds: [],         // { number, firstName, initial } – minimal info loaded from passometro
    balanco: {},      // keyed by "bedIdx_date" → shift data
    currentBed: null,
    currentShift: 'diurno',
    currentDate: todayISO(),
};

// ===== SHIFT HOURS =====
const SHIFT_HOURS = {
    diurno: ['07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18'],
    noturno: ['19', '20', '21', '22', '23', '00', '01', '02', '03', '04', '05', '06'],
};

// ===== EMPTY BALANCE TEMPLATE =====
function createEmptyShift() {
    return {
        sinaisVitais: {},   // keyed by hour: { pa, fc, fr, spo2, tax, obs }
        glicemia: [],       // [{ hora, valor, insulina, obs }]
        ganhos: [],         // [{ descricao, volume }]
        diurese: [],        // [{ hora, volume }]
        evacuacoes: [],     // [{ hora, obs }]
        drenos: [],         // [{ nome, volume, aspecto }]
        hd: { ufProg: '', ufReal: '', duracao: '' },
    };
}

function getShiftKey(bedIdx, date, shift) {
    return `${bedIdx}_${date}_${shift}`;
}

function getCurrentShiftData() {
    const key = getShiftKey(state.currentBed, state.currentDate, state.currentShift);
    if (!state.balanco[key]) {
        state.balanco[key] = createEmptyShift();
    }
    return state.balanco[key];
}

// ===== PERSISTENCE =====
let saveTimeout = null;

function showSaveIndicator(type, text) {
    const el = document.getElementById('save-indicator');
    if (!el) return;
    el.className = 'save-indicator show ' + type;
    el.textContent = text;
    setTimeout(() => { el.classList.remove('show'); }, 2000);
}

function saveLocal() {
    try {
        localStorage.setItem('enfermagem_balanco', JSON.stringify(state.balanco));
    } catch (e) { console.warn('localStorage save failed:', e); }
}

function loadLocal() {
    try {
        const d = localStorage.getItem('enfermagem_balanco');
        if (d) { state.balanco = JSON.parse(d); return true; }
    } catch (e) { console.warn('localStorage load failed:', e); }
    return false;
}

async function saveFirebase() {
    if (!window.firebaseDb || !window.firebaseFirestore) {
        console.warn('[ENF] Cannot save: Firebase not ready');
        return;
    }
    if (!window.firebaseAuth?.currentUser) {
        console.warn('[ENF] Cannot save: No user logged in');
        return;
    }
    try {
        const { doc, setDoc } = window.firebaseFirestore;
        const db = window.firebaseDb;
        const ref = doc(db, 'passometro/balanco');
        const payload = {
            data: JSON.parse(JSON.stringify(state.balanco)),
            lastUpdate: new Date().toISOString(),
            updatedBy: window.firebaseAuth.currentUser.email,
        };
        console.log('[ENF] Saving to Firebase passometro/balanco...', Object.keys(state.balanco).length, 'shift keys');
        await setDoc(ref, payload);
        console.log('[ENF] ✓ Saved successfully');
        showSaveIndicator('saved', '✓ Salvo');
    } catch (e) {
        console.error('[ENF] Firebase save error:', e);
        showSaveIndicator('error', '✗ Erro ao salvar');
    }
}

async function loadFirebase() {
    if (!window.firebaseDb || !window.firebaseFirestore || !window.firebaseAuth?.currentUser) return false;
    try {
        const { doc, getDoc } = window.firebaseFirestore;
        const db = window.firebaseDb;
        const ref = doc(db, 'passometro/balanco');
        const snap = await getDoc(ref);
        if (snap.exists() && snap.data().data) {
            state.balanco = snap.data().data;
            saveLocal();
            return true;
        }
    } catch (e) { console.error('Firebase load error:', e); }
    return false;
}

async function loadPatientNames() {
    if (!window.firebaseDb || !window.firebaseFirestore) {
        console.warn('[ENF] Firebase not available yet');
        return false;
    }
    if (!window.firebaseAuth?.currentUser) {
        console.warn('[ENF] User not logged in yet');
        return false;
    }
    try {
        const { doc, getDoc } = window.firebaseFirestore;
        const db = window.firebaseDb;
        const ref = doc(db, 'passometro/leitos');
        console.log('[ENF] Loading patient names from passometro/leitos...');
        const snap = await getDoc(ref);
        if (snap.exists() && snap.data().beds) {
            const beds = snap.data().beds;
            console.log('[ENF] Found', beds.length, 'beds');
            beds.forEach((bed, idx) => {
                if (idx < TOTAL_BEDS && bed.name && bed.name.trim()) {
                    const parts = bed.name.trim().split(/\s+/);
                    const firstName = parts[0];
                    const lastInitial = parts.length > 1 ? parts[parts.length - 1][0] + '.' : '';
                    state.beds[idx] = { number: bed.number || idx + 1, firstName, initial: lastInitial, fullName: bed.name.trim() };
                } else if (idx < TOTAL_BEDS) {
                    state.beds[idx] = { number: bed.number || idx + 1, firstName: '', initial: '', fullName: '' };
                }
            });
            return true;
        } else {
            console.warn('[ENF] passometro/leitos document not found or empty');
        }
    } catch (e) { console.error('[ENF] Load patient names error:', e); }
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

// ===== RENDERING: DASHBOARD =====
function renderDashboard() {
    const grid = document.getElementById('beds-grid');
    if (!grid) return;

    let html = '';
    for (let idx = 0; idx < TOTAL_BEDS; idx++) {
        const bed = state.beds[idx] || { number: idx + 1, firstName: '', initial: '' };
        const occupied = bed.firstName !== '';
        const displayName = occupied ? `${bed.firstName} ${bed.initial}` : '';

        // Quick summary for today
        const summary = getShiftSummary(idx, todayISO());

        if (occupied) {
            html += `
        <div class="bed-card occupied" onclick="openBed(${idx})">
          <div class="bed-number">Leito ${bed.number}</div>
          <div class="bed-patient-name">${escapeHTML(displayName)}</div>
          ${summary ? `<div class="bed-meta-line">${escapeHTML(summary)}</div>` : ''}
        </div>
      `;
        } else {
            html += `
        <div class="bed-card" onclick="openBed(${idx})" style="cursor:pointer;">
          <div class="bed-number">Leito ${bed.number}</div>
          <div class="bed-empty"><span class="bed-empty-icon">🛏️</span>Vago</div>
          <div style="font-size:11px;color:var(--text-muted);margin-top:8px;">Toque para registrar balanço</div>
        </div>
      `;
        }
    }
    grid.innerHTML = html;
}

// ===== SHIFT SUMMARY TEXT =====
function getShiftSummary(bedIdx, date) {
    const parts = [];
    ['diurno', 'noturno'].forEach(shift => {
        const key = getShiftKey(bedIdx, date, shift);
        const data = state.balanco[key];
        if (!data) return;
        const g = calcTotalGanhos(data);
        const p = calcTotalPerdas(data);
        if (g > 0 || p > 0) {
            const bh = g - p;
            const sign = bh >= 0 ? '+' : '';
            parts.push(`${shift === 'diurno' ? '☀️' : '🌙'} BH: ${sign}${bh}mL`);
        }
    });
    return parts.join(' | ');
}

// ===== OPEN BED =====
function openBed(idx) {
    state.currentBed = idx;
    // Auto-select shift based on current hour
    const hour = new Date().getHours();
    state.currentShift = (hour >= 7 && hour < 19) ? 'diurno' : 'noturno';
    state.currentDate = todayISO();

    document.getElementById('view-dashboard').style.display = 'none';
    document.getElementById('view-balance').style.display = 'block';

    const bed = state.beds[idx] || { number: idx + 1, firstName: '', initial: '' };
    document.getElementById('bal-bed-title').textContent = `Leito ${bed.number}`;
    document.getElementById('bal-patient-name').textContent = bed.firstName ? `${bed.firstName} ${bed.initial}` : `Leito ${bed.number}`;
    document.getElementById('bal-shift').value = state.currentShift;
    document.getElementById('bal-date').value = state.currentDate;

    renderAllTabs();
}

function goBack() {
    state.currentBed = null;
    document.getElementById('view-balance').style.display = 'none';
    document.getElementById('view-dashboard').style.display = 'block';
    renderDashboard();
}

function switchShift(val) { state.currentShift = val; renderAllTabs(); }
function switchDate(val) { state.currentDate = val; renderAllTabs(); }

// ===== TAB SWITCHING =====
function switchTab(tabId, btn) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('tab-' + tabId).classList.add('active');
    if (btn) btn.classList.add('active');

    if (tabId === 'resumo') updateResumo();
}

// ===== RENDER ALL TABS =====
function renderAllTabs() {
    renderSinaisVitais();
    renderGlicemia();
    renderGanhos();
    renderPerdas();
    updateResumo();
}

// ===== SINAIS VITAIS =====
function renderSinaisVitais() {
    const data = getCurrentShiftData();
    const hours = SHIFT_HOURS[state.currentShift];
    const tbody = document.getElementById('sv-tbody');

    let html = '';
    hours.forEach(h => {
        const sv = data.sinaisVitais[h] || {};
        html += `<tr>
      <td class="sv-hour">${h}:00</td>
      <td><input type="text" value="${escapeHTML(sv.pa || '')}" placeholder="120/80" onchange="updateSV('${h}','pa',this.value)"></td>
      <td><input type="number" value="${sv.fc || ''}" placeholder="78" onchange="updateSV('${h}','fc',this.value)"></td>
      <td><input type="number" value="${sv.fr || ''}" placeholder="18" onchange="updateSV('${h}','fr',this.value)"></td>
      <td><input type="number" value="${sv.spo2 || ''}" placeholder="97" onchange="updateSV('${h}','spo2',this.value)"></td>
      <td><input type="text" value="${escapeHTML(sv.tax || '')}" placeholder="36.5" onchange="updateSV('${h}','tax',this.value)"></td>
      <td><input type="text" value="${escapeHTML(sv.obs || '')}" placeholder="" onchange="updateSV('${h}','obs',this.value)"></td>
    </tr>`;
    });
    tbody.innerHTML = html;
}

function updateSV(hour, field, value) {
    const data = getCurrentShiftData();
    if (!data.sinaisVitais[hour]) data.sinaisVitais[hour] = {};
    data.sinaisVitais[hour][field] = value;
    triggerSave();
}

// ===== GLICEMIA =====
function renderGlicemia() {
    const data = getCurrentShiftData();
    const tbody = document.getElementById('glic-tbody');
    let html = '';
    data.glicemia.forEach((g, i) => {
        html += `<tr>
      <td><input type="time" value="${g.hora || ''}" onchange="updateGlic(${i},'hora',this.value)"></td>
      <td><input type="number" value="${g.valor || ''}" placeholder="120" onchange="updateGlic(${i},'valor',this.value)"></td>
      <td><input type="number" value="${g.insulina || ''}" placeholder="0" onchange="updateGlic(${i},'insulina',this.value)"></td>
      <td><input type="text" value="${escapeHTML(g.obs || '')}" onchange="updateGlic(${i},'obs',this.value)">
          <button class="row-delete" onclick="deleteGlic(${i})">✕</button></td>
    </tr>`;
    });
    tbody.innerHTML = html;
}

function addGlicRow() {
    const data = getCurrentShiftData();
    data.glicemia.push({ hora: '', valor: '', insulina: '', obs: '' });
    renderGlicemia();
    triggerSave();
}

function updateGlic(i, field, val) { getCurrentShiftData().glicemia[i][field] = val; triggerSave(); }
function deleteGlic(i) { getCurrentShiftData().glicemia.splice(i, 1); renderGlicemia(); triggerSave(); }

// ===== GANHOS (Líquidos Infundidos) =====
function renderGanhos() {
    const data = getCurrentShiftData();
    const hours = SHIFT_HOURS[state.currentShift];
    const thead = document.getElementById('ganhos-thead');
    const tbody = document.getElementById('ganhos-tbody');

    // Mapear colunas de horas
    let headHtml = `<tr>
        <th style="min-width: 200px;">Solução / Droga</th>
        <th style="min-width: 70px; text-align: center;">Total</th>`;
    hours.forEach(h => { headHtml += `<th style="text-align:center;">${h}h</th>`; });
    headHtml += `<th></th></tr>`;
    thead.innerHTML = headHtml;

    let html = '';
    data.ganhos.forEach((g, i) => {
        // Garantir preenchimento seguro de propriedades antigas/novas
        if (!g.volumes) g.volumes = {};

        // Calcular total da linha
        let rowTotal = 0;
        if (Object.keys(g.volumes).length > 0) {
            rowTotal = Object.values(g.volumes).reduce((s, v) => s + (parseFloat(v) || 0), 0);
        } else if (g.volume) {
            // Migração de dados velhos: se tem 'volume' geral mas sem detalhe por hora
            rowTotal = parseFloat(g.volume) || 0;
        }

        html += `<tr>
      <td>
        <input list="drogas-uti" value="${escapeHTML(g.descricao || '')}" placeholder="Noradrenalina, SF 0.9%..." onchange="updateGanhoDesc(${i},this.value)">
        <button class="btn btn-header" style="font-size:10px;padding:2px 6px;margin-top:4px;" onclick="autoFillGanho(${i})">➔ Copiar Infusão p/ Frente</button>
      </td>
      <td style="text-align:center; font-weight:bold; color:var(--accent);">${rowTotal}</td>`;

        hours.forEach(h => {
            const v = g.volumes[h] || '';
            html += `<td><input type="number" style="width:50px; text-align:center;" value="${v}" placeholder="0" onchange="updateGanhoVol(${i},'${h}',this.value)"></td>`;
        });

        html += `<td><button class="row-delete" onclick="deleteGanho(${i})">✕</button></td>
    </tr>`;
    });
    tbody.innerHTML = html;
    updateGanhoTotal();
}

function addGanhoRow() {
    // Nova linha vazia
    getCurrentShiftData().ganhos.push({ descricao: '', volume: 0, volumes: {} });
    renderGanhos();
    triggerSave();
}

function updateGanhoDesc(i, val) {
    getCurrentShiftData().ganhos[i].descricao = val;
    triggerSave();
}

function updateGanhoVol(i, hour, val) {
    const ganho = getCurrentShiftData().ganhos[i];
    if (!ganho.volumes) ganho.volumes = {};
    ganho.volumes[hour] = val;
    syncGanhoTotal(ganho);
    renderGanhos(); // Recalcula a linha
    triggerSave();
}

function syncGanhoTotal(ganho) {
    // Atualiza o .volume base para o passômetro ler
    ganho.volume = Object.values(ganho.volumes).reduce((s, v) => s + (parseFloat(v) || 0), 0);
}

function autoFillGanho(i) {
    const ganho = getCurrentShiftData().ganhos[i];
    if (!ganho.volumes) return;
    const hours = SHIFT_HOURS[state.currentShift];
    let currentValue = null;

    // Encontra o primeiro valor e arrasta ele para as seguintes vazias
    hours.forEach(h => {
        const val = parseFloat(ganho.volumes[h]);
        if (!isNaN(val)) {
            currentValue = val; // Define o novo valor atual a copiar
        } else if (currentValue !== null) {
            ganho.volumes[h] = currentValue; // Preenche celula vazia se temos um valor arrastando
        }
    });
    syncGanhoTotal(ganho);
    renderGanhos();
    triggerSave();
}

function deleteGanho(i) {
    getCurrentShiftData().ganhos.splice(i, 1);
    renderGanhos();
    triggerSave();
}

function updateGanhoTotal() {
    const total = calcTotalGanhos(getCurrentShiftData());
    document.getElementById('ganhos-total').textContent = `Total Ganhos: ${total} mL`;
}

function calcTotalGanhos(data) {
    return (data.ganhos || []).reduce((s, g) => s + (parseFloat(g.volume) || 0), 0);
}

// ===== PERDAS: DIURESE =====
function renderPerdas() {
    renderDiurese();
    renderEvac();
    renderDrenos();
    renderHD();
    updatePerdasTotal();
}

function renderDiurese() {
    const data = getCurrentShiftData();
    const tbody = document.getElementById('diurese-tbody');
    let html = '';
    data.diurese.forEach((d, i) => {
        html += `<tr>
      <td><input type="time" value="${d.hora || ''}" onchange="updateDiurese(${i},'hora',this.value)"></td>
      <td><input type="number" value="${d.volume || ''}" placeholder="200" onchange="updateDiurese(${i},'volume',this.value)">
          <button class="row-delete" onclick="deleteDiurese(${i})">✕</button></td>
    </tr>`;
    });
    tbody.innerHTML = html;
    const total = calcTotalDiurese(getCurrentShiftData());
    document.getElementById('diurese-total').textContent = `Total Diurese: ${total} mL`;
}

function addDiureseRow() { getCurrentShiftData().diurese.push({ hora: '', volume: '' }); renderDiurese(); triggerSave(); }
function updateDiurese(i, f, v) { getCurrentShiftData().diurese[i][f] = v; renderDiurese(); updatePerdasTotal(); triggerSave(); }
function deleteDiurese(i) { getCurrentShiftData().diurese.splice(i, 1); renderDiurese(); updatePerdasTotal(); triggerSave(); }

function calcTotalDiurese(data) {
    return (data.diurese || []).reduce((s, d) => s + (parseFloat(d.volume) || 0), 0);
}

// ===== PERDAS: EVACUAÇÕES =====
function renderEvac() {
    const data = getCurrentShiftData();
    const tbody = document.getElementById('evac-tbody');
    let html = '';
    data.evacuacoes.forEach((e, i) => {
        html += `<tr>
      <td><input type="time" value="${e.hora || ''}" onchange="updateEvac(${i},'hora',this.value)"></td>
      <td><input type="text" value="${escapeHTML(e.obs || '')}" placeholder="Pastosa, pequeno vol." onchange="updateEvac(${i},'obs',this.value)">
          <button class="row-delete" onclick="deleteEvac(${i})">✕</button></td>
    </tr>`;
    });
    tbody.innerHTML = html;
}

function addEvacRow() { getCurrentShiftData().evacuacoes.push({ hora: '', obs: '' }); renderEvac(); triggerSave(); }
function updateEvac(i, f, v) { getCurrentShiftData().evacuacoes[i][f] = v; triggerSave(); }
function deleteEvac(i) { getCurrentShiftData().evacuacoes.splice(i, 1); renderEvac(); triggerSave(); }

// ===== PERDAS: DRENOS =====
function renderDrenos() {
    const data = getCurrentShiftData();
    const tbody = document.getElementById('dreno-tbody');
    let html = '';
    data.drenos.forEach((d, i) => {
        html += `<tr>
      <td><input type="text" value="${escapeHTML(d.nome || '')}" placeholder="Dreno 1" onchange="updateDreno(${i},'nome',this.value)"></td>
      <td><input type="number" value="${d.volume || ''}" placeholder="50" onchange="updateDreno(${i},'volume',this.value)"></td>
      <td><input type="text" value="${escapeHTML(d.aspecto || '')}" placeholder="Seroso" onchange="updateDreno(${i},'aspecto',this.value)"></td>
      <td><button class="row-delete" onclick="deleteDreno(${i})">✕</button></td>
    </tr>`;
    });
    tbody.innerHTML = html;
    const total = calcTotalDrenos(getCurrentShiftData());
    document.getElementById('dreno-total').textContent = `Total Drenos: ${total} mL`;
}

function addDrenoRow() { getCurrentShiftData().drenos.push({ nome: '', volume: '', aspecto: '' }); renderDrenos(); triggerSave(); }
function updateDreno(i, f, v) { getCurrentShiftData().drenos[i][f] = v; renderDrenos(); updatePerdasTotal(); triggerSave(); }
function deleteDreno(i) { getCurrentShiftData().drenos.splice(i, 1); renderDrenos(); updatePerdasTotal(); triggerSave(); }

function calcTotalDrenos(data) {
    return (data.drenos || []).reduce((s, d) => s + (parseFloat(d.volume) || 0), 0);
}

// ===== PERDAS: HEMODIÁLISE =====
function renderHD() {
    const data = getCurrentShiftData();
    document.getElementById('hd-uf-prog').value = data.hd.ufProg || '';
    document.getElementById('hd-uf-real').value = data.hd.ufReal || '';
    document.getElementById('hd-duracao').value = data.hd.duracao || '';
}

function updateHD() {
    const data = getCurrentShiftData();
    data.hd.ufProg = document.getElementById('hd-uf-prog').value;
    data.hd.ufReal = document.getElementById('hd-uf-real').value;
    data.hd.duracao = document.getElementById('hd-duracao').value;
    updatePerdasTotal();
    triggerSave();
}

// ===== TOTAL PERDAS =====
function calcTotalPerdas(data) {
    const diurese = calcTotalDiurese(data);
    const drenos = calcTotalDrenos(data);
    const hd = parseFloat(data.hd?.ufReal) || 0;
    // Evacuações: estimate ~200mL per episode
    const evac = (data.evacuacoes || []).length * 200;
    return diurese + drenos + hd + evac;
}

function updatePerdasTotal() {
    const total = calcTotalPerdas(getCurrentShiftData());
    const el = document.getElementById('perdas-total');
    if (el) el.textContent = `Total Perdas: ${total} mL`;
}

// ===== RESUMO / BH =====
function updateResumo() {
    const data = getCurrentShiftData();
    const ganhos = calcTotalGanhos(data);
    const perdas = calcTotalPerdas(data);
    const bh = ganhos - perdas;

    document.getElementById('bh-ganhos').textContent = `${ganhos} mL`;
    document.getElementById('bh-perdas').textContent = `${perdas} mL`;

    const resultEl = document.getElementById('bh-result');
    const sign = bh >= 0 ? '+' : '';
    resultEl.textContent = `${sign}${bh} mL`;
    resultEl.className = 'bh-value ' + (bh >= 0 ? 'bh-positive' : 'bh-negative');

    // Clinical summary badges
    const badges = generateClinicalSummary(data, bh);
    document.getElementById('resumo-badges').innerHTML = badges;
}

function generateClinicalSummary(data, bh) {
    const badges = [];

    // Temperature analysis
    let maxTemp = 0, hasTemp = false;
    Object.values(data.sinaisVitais || {}).forEach(sv => {
        const t = parseFloat((sv.tax || '').replace(',', '.'));
        if (!isNaN(t)) { hasTemp = true; if (t > maxTemp) maxTemp = t; }
    });
    if (hasTemp) {
        if (maxTemp >= 37.8) badges.push({ text: `Febril (${maxTemp}°C)`, type: 'danger' });
        else if (maxTemp < 35.5) badges.push({ text: `Hipotérmico (${maxTemp}°C)`, type: 'warning' });
        else badges.push({ text: 'Afebril', type: 'success' });
    }

    // Hemodynamic analysis
    let maxPAS = 0, minPAS = 999, maxFC = 0, hasSV = false;
    Object.values(data.sinaisVitais || {}).forEach(sv => {
        if (sv.pa) {
            const parts = sv.pa.split('/');
            const pas = parseInt(parts[0]);
            if (!isNaN(pas)) { hasSV = true; if (pas > maxPAS) maxPAS = pas; if (pas < minPAS) minPAS = pas; }
        }
        const fc = parseInt(sv.fc);
        if (!isNaN(fc) && fc > maxFC) maxFC = fc;
    });

    if (hasSV) {
        if (maxPAS > 140) badges.push({ text: `Hipertenso (max ${maxPAS})`, type: 'warning' });
        else if (minPAS < 90) badges.push({ text: `Hipotenso (min ${minPAS})`, type: 'danger' });
        else badges.push({ text: 'PA Estável', type: 'success' });

        if (maxFC > 100) badges.push({ text: `Taquicárdico (max ${maxFC})`, type: 'warning' });
        else if (maxFC > 0) badges.push({ text: 'FC Normal', type: 'success' });
    }

    // BH
    const sign = bh >= 0 ? '+' : '';
    badges.push({ text: `BH: ${sign}${bh} mL`, type: bh > 1000 ? 'warning' : bh < -500 ? 'warning' : 'info' });

    // Diurese
    const diurese = calcTotalDiurese(data);
    if (diurese > 0) badges.push({ text: `Diurese: ${diurese} mL`, type: 'info' });

    // Glycemia
    let maxGlic = 0, minGlic = 999;
    (data.glicemia || []).forEach(g => {
        const v = parseFloat(g.valor);
        if (!isNaN(v)) { if (v > maxGlic) maxGlic = v; if (v < minGlic) minGlic = v; }
    });
    if (maxGlic > 180) badges.push({ text: `Hiperglicemia (max ${maxGlic})`, type: 'warning' });
    else if (minGlic < 70 && minGlic < 999) badges.push({ text: `Hipoglicemia (min ${minGlic})`, type: 'danger' });

    return badges.map(b => `<span class="resumo-badge resumo-${b.type}">${b.text}</span>`).join('');
}

// ===== GENERATE SUMMARY FOR PASSÔMETRO =====
// This creates a text summary that the passômetro can read
function getBalancoSummaryText(bedIdx, date) {
    const parts = [];
    ['diurno', 'noturno'].forEach(shift => {
        const key = getShiftKey(bedIdx, date, shift);
        const data = state.balanco[key];
        if (!data) return;

        const ganhos = calcTotalGanhos(data);
        const perdas = calcTotalPerdas(data);
        const bh = ganhos - perdas;

        // Temperature
        let maxTemp = 0, hasTemp = false;
        Object.values(data.sinaisVitais || {}).forEach(sv => {
            const t = parseFloat((sv.tax || '').replace(',', '.'));
            if (!isNaN(t)) { hasTemp = true; if (t > maxTemp) maxTemp = t; }
        });

        const tempText = hasTemp ? (maxTemp >= 37.8 ? 'Febril' : 'Afebril') : '';
        const sign = bh >= 0 ? '+' : '';
        if (ganhos > 0 || perdas > 0) {
            parts.push(`${tempText} | BH ${sign}${bh}mL`);
        }
    });
    return parts.join(' • ');
}

// ===== PRINT =====
function printBalanco() {
    if (state.currentBed === null) {
        alert('Selecione um leito primeiro.');
        return;
    }

    const bed = state.beds[state.currentBed] || { number: state.currentBed + 1, firstName: '', initial: '' };
    const data = getCurrentShiftData();
    const ganhos = calcTotalGanhos(data);
    const perdas = calcTotalPerdas(data);
    const bh = ganhos - perdas;
    const sign = bh >= 0 ? '+' : '';
    const shiftLabel = state.currentShift === 'diurno' ? 'Diurno (07h–19h)' : 'Noturno (19h–07h)';
    const hours = SHIFT_HOURS[state.currentShift];

    let html = `
    <div class="print-balanco">
      <div class="print-bal-header">
        <h2>BALANÇO HÍDRICO – UTI HSJ</h2>
        <div class="print-bal-info">
          <span>Leito ${bed.number} – ${escapeHTML(bed.firstName)} ${escapeHTML(bed.initial)}</span>
          <span>Data: ${formatDateBR(new Date(state.currentDate + 'T12:00:00'))}</span>
          <span>Turno: ${shiftLabel}</span>
        </div>
      </div>

      <h4>Sinais Vitais</h4>
      <table class="print-table">
        <thead><tr><th>Hora</th><th>PA</th><th>FC</th><th>FR</th><th>SpO₂</th><th>Tax</th><th>Obs</th></tr></thead>
        <tbody>`;

    hours.forEach(h => {
        const sv = data.sinaisVitais[h] || {};
        if (sv.pa || sv.fc || sv.fr || sv.spo2 || sv.tax) {
            html += `<tr><td>${h}:00</td><td>${sv.pa || ''}</td><td>${sv.fc || ''}</td><td>${sv.fr || ''}</td><td>${sv.spo2 || ''}</td><td>${sv.tax || ''}</td><td>${sv.obs || ''}</td></tr>`;
        }
    });

    html += `</tbody></table>`;

    // Glicemia
    if (data.glicemia.length > 0) {
        html += `<h4>Glicemia</h4><table class="print-table"><thead><tr><th>Hora</th><th>Valor</th><th>Insulina</th><th>Obs</th></tr></thead><tbody>`;
        data.glicemia.forEach(g => {
            html += `<tr><td>${g.hora || ''}</td><td>${g.valor || ''}</td><td>${g.insulina || ''}</td><td>${g.obs || ''}</td></tr>`;
        });
        html += `</tbody></table>`;
    }

    // Ganhos
    html += `<h4>Ganhos (Líquidos Infundidos)</h4><table class="print-table"><thead><tr><th>Descrição</th>`;
    hours.forEach(h => { html += `<th>${h}h</th>`; });
    html += `<th>Total</th></tr></thead><tbody>`;

    data.ganhos.forEach(g => {
        html += `<tr><td>${escapeHTML(g.descricao)}</td>`;
        hours.forEach(h => { html += `<td>${g.volumes?.[h] || ''}</td>`; });
        html += `<td><strong>${g.volume || 0}</strong></td></tr>`;
    });
    html += `<tr class="print-total"><td colspan="${hours.length + 1}"><strong>TOTAL GANHOS</strong></td><td><strong>${ganhos}</strong></td></tr>`;
    html += `</tbody></table>`;

    // Perdas
    html += `<h4>Perdas</h4><table class="print-table" style="width:50%;"><thead><tr><th>Descrição</th><th>Vol (mL)</th></tr></thead><tbody>`;
    html += `<tr><td>Diurese</td><td>${calcTotalDiurese(data)}</td></tr>`;
    html += `<tr><td>Drenos</td><td>${calcTotalDrenos(data)}</td></tr>`;
    const hdReal = parseFloat(data.hd?.ufReal) || 0;
    if (hdReal > 0) html += `<tr><td>Hemodiálise (UF)</td><td>${hdReal}</td></tr>`;
    const evacCount = data.evacuacoes.length;
    if (evacCount > 0) html += `<tr><td>Evacuações (${evacCount}x)</td><td>~${evacCount * 200}</td></tr>`;
    html += `<tr class="print-total"><td><strong>TOTAL PERDAS</strong></td><td><strong>${perdas}</strong></td></tr>`;
    html += `</tbody></table>`;

    // BH Result
    html += `<div class="print-bh-result"><strong>BALANÇO HÍDRICO: ${sign}${bh} mL</strong></div>`;

    // Signature
    html += `
    <div class="print-signature">
      <div class="print-sig-line">
        <span>Enf. Responsável: ______________________________</span>
        <span>COREN: ______________</span>
      </div>
    </div>
  </div>`;

    const container = document.getElementById('print-container');
    container.innerHTML = html;
    container.style.display = 'block';
    window.print();
    setTimeout(() => { container.style.display = 'none'; }, 500);
}

// ===== LOGOUT =====
function logout() {
    if (window.firebaseAuth && window.firebaseAuthModule) {
        window.firebaseAuthModule.signOut(window.firebaseAuth);
    }
}

// ===== STARTUP =====
window.startApp = async function () {
    console.log('[ENF] Starting app...');

    // Init beds
    state.beds = [];
    for (let i = 0; i < TOTAL_BEDS; i++) {
        state.beds.push({ number: i + 1, firstName: '', initial: '', fullName: '' });
    }

    // Load balance data
    loadLocal();
    const loaded = await loadFirebase();
    if (!loaded) loadLocal();

    // Load patient names (minimal info) - retry a few times for Firebase timing
    let namesLoaded = await loadPatientNames();
    if (!namesLoaded) {
        // Retry after a short delay (Firebase might not be ready)
        console.log('[ENF] Retrying patient name load in 1s...');
        await new Promise(r => setTimeout(r, 1000));
        namesLoaded = await loadPatientNames();
    }

    // Set date
    document.getElementById('header-date').textContent = formatDateBR(new Date());

    console.log('[ENF] Rendering dashboard with', state.beds.filter(b => b.firstName).length, 'occupied beds');
    renderDashboard();
};
