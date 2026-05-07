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
        alimentacao: [],    // [{ hora, obs }]
        diurese: [],        // [{ hora, volume }]
        evacuacoes: [],     // [{ hora, volume, obs }]
        drenos: [],         // [{ nome, volume, aspecto }]
        hd: { ufProg: '', ufReal: '', duracao: '' },
    };
}

function getShiftKey(bedIdx, date, shift) {
    return `${bedIdx}_${date}_${shift}`;
}

function getPreviousShiftKey(bedIdx, dateStr, shift) {
    if (shift === 'noturno') {
        return getShiftKey(bedIdx, dateStr, 'diurno');
    } else {
        const d = new Date(dateStr + 'T12:00:00');
        d.setDate(d.getDate() - 1);
        return getShiftKey(bedIdx, formatDateISO(d), 'noturno');
    }
}

function getCurrentShiftData() {
    const key = getShiftKey(state.currentBed, state.currentDate, state.currentShift);
    if (!state.balanco[key]) {
        const newShift = createEmptyShift();
        
        // Inherit active infusions from the previous shift
        const prevKey = getPreviousShiftKey(state.currentBed, state.currentDate, state.currentShift);
        const prevData = state.balanco[prevKey];
        
        if (prevData && prevData.ganhos && prevData.ganhos.length > 0) {
            const prevShiftName = state.currentShift === 'noturno' ? 'diurno' : 'noturno';
            const prevHours = SHIFT_HOURS[prevShiftName];
            
            prevData.ganhos.forEach(g => {
                if (!g.descricao) return;
                
                let lastVol = 0;
                let hasRecord = false;
                
                if (g.volumes) {
                    for (let i = prevHours.length - 1; i >= 0; i--) {
                        const h = prevHours[i];
                        if (g.volumes[h] !== undefined && g.volumes[h] !== '') {
                            lastVol = parseFloat(g.volumes[h]);
                            hasRecord = true;
                            break;
                        }
                    }
                }
                
                let shouldKeep = false;
                if (hasRecord) {
                    shouldKeep = lastVol > 0;
                } else if (parseFloat(g.volume) > 0) {
                    shouldKeep = true;
                }
                
                if (shouldKeep) {
                    newShift.ganhos.push({
                        descricao: g.descricao,
                        volume: 0,
                        volumes: {}
                    });
                }
            });
        }
        
        state.balanco[key] = newShift;
    }
    return state.balanco[key];
}

// ===== PERSISTENCE =====
let saveTimeout = null;

function showSaveIndicator(type, text) {
    const el = document.getElementById('save-indicator');
    const inlineEl = document.getElementById('inline-save-status');

    if (el) {
        el.className = 'save-indicator show ' + type;
        el.textContent = text;
        setTimeout(() => { el.classList.remove('show'); }, 2000);
    }
    
    if (inlineEl) {
        if (type === 'saving') {
            inlineEl.innerHTML = '<span style="color:var(--accent);">⟳ Salvando...</span>';
        } else if (type === 'saved') {
            const time = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            inlineEl.innerHTML = `<span style="color:var(--success);">✓ Salvo às ${time}</span>`;
        } else if (type === 'error') {
            inlineEl.innerHTML = '<span style="color:var(--danger);">✗ Erro ao salvar</span>';
        }
    }
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

async function saveFirebase(keyToSave = null) {
    if (!window.firebaseDb || !window.firebaseFirestore) {
        console.warn('[ENF] Cannot save: Firebase not ready');
        return;
    }
    if (!window.firebaseAuth?.currentUser) {
        console.warn('[ENF] Cannot save: No user logged in');
        return;
    }

    if (!keyToSave) {
        if (state.currentBed !== null && state.currentDate && state.currentShift) {
            keyToSave = getShiftKey(state.currentBed, state.currentDate, state.currentShift);
        } else {
            return;
        }
    }

    try {
        const { doc, updateDoc, setDoc } = window.firebaseFirestore;
        const db = window.firebaseDb;
        const ref = doc(db, 'passometro/balanco');
        
        const shiftData = state.balanco[keyToSave];
        if (!shiftData) return;

        const payload = {
            [`data.${keyToSave}`]: JSON.parse(JSON.stringify(shiftData)),
            lastUpdate: new Date().toISOString(),
            updatedBy: window.firebaseAuth.currentUser.email,
        };
        console.log('[ENF] Updating Firebase passometro/balanco for key:', keyToSave);
        
        try {
            await updateDoc(ref, payload);
        } catch (e) {
            if (e.code === 'not-found') {
                await setDoc(ref, {
                    data: { [keyToSave]: JSON.parse(JSON.stringify(shiftData)) },
                    lastUpdate: new Date().toISOString(),
                    updatedBy: window.firebaseAuth.currentUser.email,
                });
            } else {
                throw e;
            }
        }
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
        const { doc, onSnapshot } = window.firebaseFirestore;
        const db = window.firebaseDb;
        const ref = doc(db, 'passometro/balanco');
        
        return new Promise((resolve) => {
            if (window.unsubFirebaseBalanco) window.unsubFirebaseBalanco();
            
            window.unsubFirebaseBalanco = onSnapshot(ref, (snap) => {
                if (snap.exists() && snap.data().data) {
                    const dbData = snap.data().data;
                    Object.keys(dbData).forEach(key => {
                        const currentKey = state.currentBed !== null ? getShiftKey(state.currentBed, state.currentDate, state.currentShift) : null;
                        if (key !== currentKey || !state.balanco[key]) {
                            state.balanco[key] = dbData[key];
                        }
                    });
                    saveLocal();
                    
                    const viewDash = document.getElementById('view-dashboard');
                    if (viewDash && viewDash.style.display !== 'none') {
                        renderDashboard();
                    }
                }
                resolve(true);
            }, (error) => {
                console.error('[ENF] Firebase onSnapshot error:', error);
                resolve(false);
            });
        });
    } catch (e) { 
        console.error('Firebase load error:', e); 
        return false;
    }
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
                    state.beds[idx] = { number: bed.number || idx + 1, firstName, initial: lastInitial, fullName: bed.name.trim(), peso: bed.peso || '' };
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

let lastEditedKey = null;
function triggerSave() {
    saveLocal();
    if (state.currentBed !== null && state.currentDate && state.currentShift) {
        lastEditedKey = getShiftKey(state.currentBed, state.currentDate, state.currentShift);
    }
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
        showSaveIndicator('saving', '⟳ Salvando...');
        saveFirebase(lastEditedKey);
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

    const inlineEl = document.getElementById('inline-save-status');
    if (inlineEl) inlineEl.innerHTML = '';

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
    if (tabId === 'consolidado') renderConsolidadoTab();
}

// ===== RENDER ALL TABS =====
function renderAllTabs() {
    renderSinaisVitais();
    renderGlicemia();
    renderGanhos();
    renderAlimentacao();
    renderPerdas();
    updateResumo();
    renderConsolidadoTab();
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
      </td>
      <td style="text-align:center; font-weight:bold; color:var(--accent);">${rowTotal}</td>`;

        let lastFilledIdx = -1;
        hours.forEach((h, idx) => {
            if (g.volumes[h] && g.volumes[h] !== '') lastFilledIdx = idx;
        });

        hours.forEach((h, idx) => {
            const v = g.volumes[h] || '';
            let arrowBtn = '';
            if (idx === lastFilledIdx && idx < hours.length - 1) {
                const nextHour = hours[idx + 1];
                arrowBtn = `<button title="Copiar p/ próximo" style="position:absolute; right: -5px; top: 50%; transform: translateY(-50%); background: var(--accent); color: white; border: none; border-radius: 50%; width: 20px; height: 20px; font-size: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center; z-index: 10; padding:0; box-shadow: 0 1px 3px rgba(0,0,0,0.2);" onclick="copyNextHour(${i}, '${h}', '${nextHour}')">➔</button>`;
            }
            html += `<td style="position:relative; min-width:65px;"><input type="number" style="width:100%; text-align:center; padding: 6px 4px;" value="${v}" placeholder="0" onchange="updateGanhoVol(${i},'${h}',this.value)">${arrowBtn}</td>`;
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

function copyNextHour(i, fromHour, toHour) {
    const ganho = getCurrentShiftData().ganhos[i];
    if (!ganho.volumes) return;
    ganho.volumes[toHour] = ganho.volumes[fromHour];
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
    return (data.ganhos || []).reduce((s, g) => {
        let gVol = parseFloat(g.volume) || 0;
        if (gVol === 0 && g.volumes && Object.keys(g.volumes).length > 0) {
            gVol = Object.values(g.volumes).reduce((sum, v) => sum + (parseFloat(v) || 0), 0);
        }
        return s + gVol;
    }, 0);
}

// ===== ALIMENTAÇÃO SÓLIDA =====
function renderAlimentacao() {
    const data = getCurrentShiftData();
    const tbody = document.getElementById('alim-tbody');
    let html = '';
    (data.alimentacao || []).forEach((a, i) => {
        html += `<tr>
      <td><input type="time" value="${a.hora || ''}" onchange="updateAlim(${i},'hora',this.value)"></td>
      <td><input type="text" value="${escapeHTML(a.obs || '')}" placeholder="Almoço, bem aceito..." onchange="updateAlim(${i},'obs',this.value)">
          <button class="row-delete" onclick="deleteAlim(${i})">✕</button></td>
    </tr>`;
    });
    tbody.innerHTML = html;
}

function addAlimRow() {
    const data = getCurrentShiftData();
    if (!data.alimentacao) data.alimentacao = [];
    data.alimentacao.push({ hora: '', obs: '' });
    renderAlimentacao();
    triggerSave();
}

function updateAlim(i, f, v) { getCurrentShiftData().alimentacao[i][f] = v; triggerSave(); }
function deleteAlim(i) { getCurrentShiftData().alimentacao.splice(i, 1); renderAlimentacao(); triggerSave(); }

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
      <td><input type="number" value="${e.volume || ''}" placeholder="200" onchange="updateEvac(${i},'volume',this.value)"></td>
      <td><input type="text" value="${escapeHTML(e.obs || '')}" placeholder="Pastosa, pequeno vol." onchange="updateEvac(${i},'obs',this.value)">
          <button class="row-delete" onclick="deleteEvac(${i})">✕</button></td>
    </tr>`;
    });
    tbody.innerHTML = html;
}

function addEvacRow() { getCurrentShiftData().evacuacoes.push({ hora: '', volume: '', obs: '' }); renderEvac(); triggerSave(); }
function updateEvac(i, f, v) { getCurrentShiftData().evacuacoes[i][f] = v; renderEvac(); updatePerdasTotal(); triggerSave(); }
function deleteEvac(i) { getCurrentShiftData().evacuacoes.splice(i, 1); renderEvac(); updatePerdasTotal(); triggerSave(); }

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
    // Evacuações: sum the volume, fallback to 200mL per episode if not specified
    const evac = (data.evacuacoes || []).reduce((s, e) => s + (parseFloat(e.volume) || 200), 0);
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

    renderPesoNutri();
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

    if (data.alimentacao && data.alimentacao.length > 0) {
        badges.push({ text: `🍎 Alimentação Sólida (${data.alimentacao.length}x)`, type: 'success' });
    }
    if (data.evacuacoes && data.evacuacoes.length > 0) {
        const evacVol = data.evacuacoes.reduce((s, e) => s + (parseFloat(e.volume) || 200), 0);
        badges.push({ text: `🔄 Evac (${data.evacuacoes.length}x - ${evacVol}mL)`, type: 'warning' });
    }

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

// ===== PESO PACIENTE (Nutricionista) =====
function renderPesoNutri() {
    const el = document.getElementById('peso-paciente');
    if (!el) return;
    const peso = (state.currentBed !== null && state.beds[state.currentBed]) ? (state.beds[state.currentBed].peso || '') : '';
    el.value = peso;
    const statusEl = document.getElementById('peso-save-status');
    if (statusEl && !statusEl.textContent) statusEl.textContent = '';
}

let pesoSaveTimeout = null;
function savePesoNutri(valor) {
    if (state.currentBed === null) return;
    if (state.beds[state.currentBed]) {
        state.beds[state.currentBed].peso = valor;
    }
    const statusEl = document.getElementById('peso-save-status');
    if (statusEl) { statusEl.textContent = '⟳ Salvando...'; statusEl.style.color = 'var(--accent)'; }
    clearTimeout(pesoSaveTimeout);
    pesoSaveTimeout = setTimeout(() => savePesoToFirebase(valor), 1500);
}

async function savePesoToFirebase(peso) {
    if (!window.firebaseDb || !window.firebaseFirestore || !window.firebaseAuth?.currentUser) return;
    if (state.currentBed === null) return;
    try {
        const { doc, getDoc, updateDoc } = window.firebaseFirestore;
        const db = window.firebaseDb;
        const ref = doc(db, 'passometro/leitos');
        const snap = await getDoc(ref);
        if (snap.exists() && snap.data().beds) {
            const beds = snap.data().beds;
            if (beds[state.currentBed] !== undefined) {
                beds[state.currentBed].peso = peso;
                await updateDoc(ref, { beds, lastUpdate: new Date().toISOString() });
                const statusEl = document.getElementById('peso-save-status');
                if (statusEl) {
                    const time = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                    statusEl.textContent = `✓ Salvo às ${time}`;
                    statusEl.style.color = 'var(--success)';
                }
            }
        }
    } catch (e) {
        console.error('[ENF] Erro ao salvar peso:', e);
        const statusEl = document.getElementById('peso-save-status');
        if (statusEl) { statusEl.textContent = '✗ Erro ao salvar'; statusEl.style.color = 'var(--danger)'; }
    }
}

// ===== ÚLTIMOS BALANÇOS CONSOLIDADOS =====
function getLastTwoCompletedShiftInfos() {
    const bedIdx = state.currentBed;
    const currentDate = state.currentDate;
    const currentShift = state.currentShift;

    const d = new Date(currentDate + 'T12:00:00');
    const yesterday = new Date(d);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayISO = formatDateISO(yesterday);

    if (currentShift === 'diurno') {
        return [
            {
                key: getShiftKey(bedIdx, yesterdayISO, 'noturno'),
                label: `🌙 Noturno — ${formatDateBR(yesterday)} (19h) → ${formatDateBR(d)} (07h)`,
                hours: SHIFT_HOURS.noturno,
            },
            {
                key: getShiftKey(bedIdx, yesterdayISO, 'diurno'),
                label: `☀️ Diurno — ${formatDateBR(yesterday)} (07h–19h)`,
                hours: SHIFT_HOURS.diurno,
            },
        ];
    } else {
        return [
            {
                key: getShiftKey(bedIdx, currentDate, 'diurno'),
                label: `☀️ Diurno — ${formatDateBR(d)} (07h–19h)`,
                hours: SHIFT_HOURS.diurno,
            },
            {
                key: getShiftKey(bedIdx, yesterdayISO, 'noturno'),
                label: `🌙 Noturno — ${formatDateBR(yesterday)} (19h) → ${formatDateBR(d)} (07h)`,
                hours: SHIFT_HOURS.noturno,
            },
        ];
    }
}

function renderShiftReadOnly(data, shiftHours) {
    if (!data) return `<p style="color:var(--text-muted);font-style:italic;padding:8px 0;">Sem dados registrados para este turno.</p>`;

    const hasAnyData =
        Object.keys(data.sinaisVitais || {}).length > 0 ||
        (data.ganhos || []).length > 0 ||
        (data.diurese || []).length > 0 ||
        (data.drenos || []).length > 0 ||
        (data.glicemia || []).length > 0 ||
        (data.alimentacao || []).length > 0 ||
        parseFloat(data.hd?.ufReal) > 0;

    if (!hasAnyData) return `<p style="color:var(--text-muted);font-style:italic;padding:8px 0;">Sem dados registrados para este turno.</p>`;

    let html = '';

    // Sinais Vitais
    const hasSV = shiftHours.some(h => {
        const sv = (data.sinaisVitais || {})[h] || {};
        return sv.pa || sv.fc || sv.fr || sv.spo2 || sv.tax;
    });
    if (hasSV) {
        html += `<h5 style="margin:0 0 6px;font-size:12px;color:var(--text-secondary);text-transform:uppercase;letter-spacing:.05em;">🫀 Sinais Vitais</h5>
        <div style="overflow-x:auto;margin-bottom:16px;">
        <table class="sv-table" style="font-size:11px;">
        <thead><tr><th>Hora</th><th>PA</th><th>FC</th><th>FR</th><th>SpO₂</th><th>Tax</th><th>Obs</th></tr></thead><tbody>`;
        shiftHours.forEach(h => {
            const sv = (data.sinaisVitais || {})[h] || {};
            if (sv.pa || sv.fc || sv.fr || sv.spo2 || sv.tax) {
                html += `<tr><td>${h}:00</td><td>${escapeHTML(sv.pa || '—')}</td><td>${sv.fc || '—'}</td><td>${sv.fr || '—'}</td><td>${sv.spo2 || '—'}</td><td>${escapeHTML(sv.tax || '—')}</td><td>${escapeHTML(sv.obs || '')}</td></tr>`;
            }
        });
        html += `</tbody></table></div>`;
    }

    // Glicemia
    if ((data.glicemia || []).length > 0) {
        html += `<h5 style="margin:0 0 6px;font-size:12px;color:var(--text-secondary);text-transform:uppercase;letter-spacing:.05em;">🩸 Glicemia Capilar</h5>
        <table class="sv-table" style="font-size:11px;margin-bottom:16px;">
        <thead><tr><th>Hora</th><th>Valor (mg/dL)</th><th>Insulina (UI)</th><th>Obs</th></tr></thead><tbody>`;
        data.glicemia.forEach(g => {
            html += `<tr><td>${g.hora || '—'}</td><td>${g.valor || '—'}</td><td>${g.insulina || '—'}</td><td>${escapeHTML(g.obs || '')}</td></tr>`;
        });
        html += `</tbody></table>`;
    }

    // Ganhos / Infusões
    if ((data.ganhos || []).length > 0) {
        let totalGanhos = 0;
        html += `<h5 style="margin:0 0 6px;font-size:12px;color:var(--accent);text-transform:uppercase;letter-spacing:.05em;">💧 Líquidos Infundidos (Ganhos)</h5>
        <div style="overflow-x:auto;margin-bottom:16px;">
        <table class="sv-table" style="font-size:11px;min-width:500px;">
        <thead><tr><th>Solução / Droga</th><th style="text-align:center;">Total (mL)</th>`;
        shiftHours.forEach(h => { html += `<th style="text-align:center;">${h}h</th>`; });
        html += `</tr></thead><tbody>`;
        data.ganhos.forEach(g => {
            let rowTotal = 0;
            if (g.volumes && Object.keys(g.volumes).length > 0) {
                rowTotal = Object.values(g.volumes).reduce((s, v) => s + (parseFloat(v) || 0), 0);
            }
            if (rowTotal === 0) rowTotal = parseFloat(g.volume) || 0;
            totalGanhos += rowTotal;
            html += `<tr><td>${escapeHTML(g.descricao || '')}</td><td style="text-align:center;font-weight:700;color:var(--accent);">${rowTotal > 0 ? rowTotal : '—'}</td>`;
            shiftHours.forEach(h => {
                const val = (g.volumes && g.volumes[h]) ? parseFloat(g.volumes[h]) : 0;
                html += `<td style="text-align:center;color:var(--accent);">${val > 0 ? val : '—'}</td>`;
            });
            html += `</tr>`;
        });
        html += `<tr style="background:rgba(13,91,143,0.07);font-weight:700;"><td>TOTAL GANHOS</td><td style="text-align:center;color:var(--accent);">${totalGanhos} mL</td><td colspan="${shiftHours.length}"></td></tr>`;
        html += `</tbody></table></div>`;
    }

    // Alimentação Sólida / Nutrição
    if ((data.alimentacao || []).length > 0) {
        html += `<h5 style="margin:0 0 6px;font-size:12px;color:#10b981;text-transform:uppercase;letter-spacing:.05em;">🍎 Alimentação Sólida / Nutrição</h5>
        <table class="sv-table" style="font-size:11px;margin-bottom:16px;">
        <thead><tr><th>Hora</th><th>Refeição / Aceitação / Obs</th></tr></thead><tbody>`;
        data.alimentacao.forEach(a => {
            html += `<tr><td>${a.hora || '—'}</td><td>${escapeHTML(a.obs || '')}</td></tr>`;
        });
        html += `</tbody></table>`;
    }

    // Perdas
    const totalDiurese = calcTotalDiurese(data);
    const totalDrenos = calcTotalDrenos(data);
    const totalHD = parseFloat(data.hd?.ufReal) || 0;
    const totalEvac = (data.evacuacoes || []).reduce((s, e) => s + (parseFloat(e.volume) || 200), 0);
    const totalPerdas = totalDiurese + totalDrenos + totalHD + totalEvac;

    if (totalPerdas > 0 || (data.evacuacoes || []).length > 0) {
        html += `<h5 style="margin:0 0 6px;font-size:12px;color:var(--danger);text-transform:uppercase;letter-spacing:.05em;">📤 Perdas</h5>
        <table class="sv-table" style="font-size:11px;margin-bottom:16px;width:auto;">
        <tbody>`;
        if (totalDiurese > 0) html += `<tr><td>Diurese</td><td><strong>${totalDiurese} mL</strong></td></tr>`;
        if (totalDrenos > 0) html += `<tr><td>Drenos</td><td><strong>${totalDrenos} mL</strong></td></tr>`;
        if (totalHD > 0) {
            const ufProg = parseFloat(data.hd?.ufProg) || 0;
            html += `<tr><td>Hemodiálise (UF real${ufProg > 0 ? ` / prog: ${ufProg}` : ''})</td><td><strong>${totalHD} mL</strong></td></tr>`;
        }
        if ((data.evacuacoes || []).length > 0) html += `<tr><td>Evacuações (${data.evacuacoes.length}x)</td><td><strong>${totalEvac} mL</strong></td></tr>`;
        html += `<tr style="background:rgba(220,38,38,0.06);font-weight:700;"><td>TOTAL PERDAS</td><td style="color:var(--danger);">${totalPerdas} mL</td></tr>`;
        html += `</tbody></table>`;
    }

    // BH do turno
    const totalGanhosFinal = calcTotalGanhos(data);
    const bh = totalGanhosFinal - totalPerdas;
    const bhSign = bh >= 0 ? '+' : '';
    const bhColor = bh > 0 ? 'var(--accent)' : (bh < 0 ? 'var(--danger)' : 'var(--text-primary)');
    const bhBg = bh > 200 ? 'rgba(13,91,143,0.07)' : (bh < -200 ? 'rgba(220,38,38,0.07)' : 'rgba(0,0,0,0.03)');

    html += `<div style="background:${bhBg};border-radius:8px;padding:12px 16px;margin-top:4px;display:flex;gap:24px;flex-wrap:wrap;align-items:center;">
        <div style="text-align:center;"><div style="font-size:10px;color:var(--text-muted);text-transform:uppercase;letter-spacing:.04em;">Ganhos</div><strong style="font-size:16px;color:var(--accent);">${totalGanhosFinal} mL</strong></div>
        <div style="font-size:18px;color:var(--text-muted);">–</div>
        <div style="text-align:center;"><div style="font-size:10px;color:var(--text-muted);text-transform:uppercase;letter-spacing:.04em;">Perdas</div><strong style="font-size:16px;color:var(--danger);">${totalPerdas} mL</strong></div>
        <div style="font-size:18px;color:var(--text-muted);">=</div>
        <div style="text-align:center;"><div style="font-size:10px;color:var(--text-muted);text-transform:uppercase;letter-spacing:.04em;">Balanço Hídrico</div><strong style="font-size:22px;color:${bhColor};">${bhSign}${bh} mL</strong></div>
    </div>`;

    return html;
}

function renderConsolidadoTab() {
    const container = document.getElementById('consolidado-content');
    if (!container || state.currentBed === null) return;

    const shifts = getLastTwoCompletedShiftInfos();
    const bed = state.beds[state.currentBed] || { number: state.currentBed + 1 };
    const peso = bed.peso ? `<span style="font-weight:700;color:#10b981;">⚖️ Peso registrado: ${bed.peso} kg</span>` : '';

    let html = `<div style="margin-bottom:16px;display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:8px;">
        <p style="font-size:12px;color:var(--text-muted);margin:0;">Exibindo os 2 últimos balanços de 12h completos (modo de leitura). Turno atual não está incluído aqui.</p>
        ${peso}
    </div>`;

    const hasAny = shifts.some(s => !!state.balanco[s.key]);

    if (!hasAny) {
        html += `<div class="section-card"><p style="color:var(--text-muted);font-style:italic;">Nenhum balanço anterior encontrado para este leito na data selecionada.</p></div>`;
        container.innerHTML = html;
        return;
    }

    shifts.forEach((shiftInfo, i) => {
        const data = state.balanco[shiftInfo.key];
        const headerBg = i === 0 ? 'var(--accent)' : '#64748b';
        html += `<div style="margin-bottom:24px;border:1px solid var(--border);border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.05);">
            <div style="background:${headerBg};padding:12px 16px;">
                <h4 style="margin:0;color:white;font-size:14px;">${shiftInfo.label}</h4>
                <div style="color:rgba(255,255,255,0.75);font-size:11px;margin-top:2px;">Balanço ${i === 0 ? 'mais recente' : 'anterior'} fechado</div>
            </div>
            <div style="padding:16px;background:var(--bg-card);">
                ${renderShiftReadOnly(data, shiftInfo.hours)}
            </div>
        </div>`;
    });

    container.innerHTML = html;
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

    // Alimentação Sólida
    if (data.alimentacao && data.alimentacao.length > 0) {
        html += `<h4>Alimentação Sólida</h4><table class="print-table"><thead><tr><th>Hora</th><th>Refeição / Obs</th></tr></thead><tbody>`;
        data.alimentacao.forEach(a => {
            html += `<tr><td>${a.hora || ''}</td><td>${escapeHTML(a.obs || '')}</td></tr>`;
        });
        html += `</tbody></table>`;
    }

    // Perdas
    html += `<h4>Perdas</h4><table class="print-table" style="width:50%;"><thead><tr><th>Descrição</th><th>Vol (mL)</th></tr></thead><tbody>`;
    html += `<tr><td>Diurese</td><td>${calcTotalDiurese(data)}</td></tr>`;
    html += `<tr><td>Drenos</td><td>${calcTotalDrenos(data)}</td></tr>`;
    const hdReal = parseFloat(data.hd?.ufReal) || 0;
    if (hdReal > 0) html += `<tr><td>Hemodiálise (UF)</td><td>${hdReal}</td></tr>`;
    const evacCount = data.evacuacoes.length;
    if (evacCount > 0) {
        const evacVol = data.evacuacoes.reduce((s, e) => s + (parseFloat(e.volume) || 200), 0);
        html += `<tr><td>Evacuações (${evacCount}x)</td><td>${evacVol}</td></tr>`;
    }
    html += `<tr class="print-total"><td><strong>TOTAL PERDAS</strong></td><td><strong>${perdas}</strong></td></tr>`;
    html += `</tbody></table>`;

    // BH 24h Result
    let ganhos24h = 0;
    let perdas24h = 0;
    ['diurno', 'noturno'].forEach(shift => {
        const key = getShiftKey(state.currentBed, state.currentDate, shift);
        const shiftData = state.balanco[key];
        if (shiftData) {
            ganhos24h += calcTotalGanhos(shiftData);
            perdas24h += calcTotalPerdas(shiftData);
        }
    });
    const bh24h = ganhos24h - perdas24h;
    const sign24h = bh24h >= 0 ? '+' : '';

    html += `<div class="print-bh-result" style="margin-top: 15px;">
      <div style="margin-bottom: 5px;"><strong>BALANÇO HÍDRICO (Turno Atual): ${sign}${bh} mL</strong></div>
      <div style="font-size: 1.2em;"><strong>BALANÇO HÍDRICO (24h - Dia ${formatDateBR(new Date(state.currentDate + 'T12:00:00'))}): ${sign24h}${bh24h} mL</strong></div>
    </div>`;

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

// ===== MIGRATE BALANCO =====
function openMigrateModal() {
  if (state.currentBed === null) {
    alert('Selecione um leito primeiro.');
    return;
  }

  const bed = state.beds[state.currentBed] || { number: state.currentBed + 1, firstName: '', initial: '' };
  const bedName = bed.firstName ? `${bed.firstName} ${bed.initial}` : `Leito ${bed.number}`;
  document.getElementById('migrate-origin-label').textContent = `Leito ${bed.number} — ${bedName}`;

  // Populate destination select
  const select = document.getElementById('migrate-dest-select');
  let html = '<option value="">Selecione o leito de destino...</option>';
  for (let idx = 0; idx < TOTAL_BEDS; idx++) {
    if (idx === state.currentBed) continue;
    const b = state.beds[idx] || { number: idx + 1, firstName: '', initial: '' };
    const occupied = b.firstName && b.firstName.trim() !== '';
    const label = occupied ? `${b.firstName} ${b.initial}` : 'Vago';
    html += `<option value="${idx}">Leito ${b.number} — ${label}</option>`;
  }
  select.innerHTML = html;

  // Reset options
  const currentRadio = document.querySelector('input[name="migrate-scope"][value="current"]');
  if (currentRadio) currentRadio.checked = true;
  document.getElementById('migrate-delete-origin').checked = false;

  document.getElementById('migrate-modal').style.display = 'flex';
}

function closeMigrateModal() {
  document.getElementById('migrate-modal').style.display = 'none';
}

async function confirmMigrateBalanco() {
  const destIdx = parseInt(document.getElementById('migrate-dest-select').value);
  if (isNaN(destIdx)) {
    alert('Selecione um leito de destino.');
    return;
  }

  const scopeEl = document.querySelector('input[name="migrate-scope"]:checked');
  const scope = scopeEl ? scopeEl.value : 'current';
  const deleteOrigin = document.getElementById('migrate-delete-origin').checked;
  const srcIdx = state.currentBed;
  const today = todayISO();

  // Build list of {date, shift} entries based on scope
  const entries = [];
  if (scope === 'current') {
    entries.push({ date: state.currentDate, shift: state.currentShift });
  } else if (scope === 'today') {
    entries.push({ date: today, shift: 'diurno' });
    entries.push({ date: today, shift: 'noturno' });
  } else {
    for (let d = 0; d < 3; d++) {
      const dt = new Date(today + 'T12:00:00');
      dt.setDate(dt.getDate() - d);
      const dateStr = formatDateISO(dt);
      entries.push({ date: dateStr, shift: 'diurno' });
      entries.push({ date: dateStr, shift: 'noturno' });
    }
  }

  // Filter to entries that actually have data
  const toMigrate = entries.filter(({ date, shift }) =>
    !!state.balanco[getShiftKey(srcIdx, date, shift)]
  );

  if (toMigrate.length === 0) {
    alert('Nenhum dado de balanço encontrado para os turnos selecionados.');
    closeMigrateModal();
    return;
  }

  // Build Firestore update payload
  const { doc, updateDoc, setDoc, deleteField } = window.firebaseFirestore;
  const updatePayload = {};

  toMigrate.forEach(({ date, shift }) => {
    const srcKey = getShiftKey(srcIdx, date, shift);
    const destKey = getShiftKey(destIdx, date, shift);
    const srcData = JSON.parse(JSON.stringify(state.balanco[srcKey]));

    updatePayload[`data.${destKey}`] = srcData;
    state.balanco[destKey] = srcData;

    if (deleteOrigin) {
      updatePayload[`data.${srcKey}`] = deleteField();
      delete state.balanco[srcKey];
    }
  });

  try {
    showSaveIndicator('saving', '⟳ Migrando...');

    if (window.firebaseDb && window.firebaseFirestore) {
      const db = window.firebaseDb;
      const ref = doc(db, 'passometro/balanco');
      try {
        await updateDoc(ref, updatePayload);
      } catch (e) {
        if (e.code === 'not-found') {
          // Document doesn't exist yet — create with migrated data only
          const setPayload = { data: {} };
          toMigrate.forEach(({ date, shift }) => {
            const destKey = getShiftKey(destIdx, date, shift);
            if (state.balanco[destKey]) setPayload.data[destKey] = state.balanco[destKey];
          });
          await setDoc(ref, setPayload);
        } else throw e;
      }
    }

    saveLocal();
    showSaveIndicator('saved', `✓ ${toMigrate.length} turno(s) migrado(s)`);
    closeMigrateModal();

    const destBed = state.beds[destIdx] || { number: destIdx + 1 };
    alert(
      `✓ ${toMigrate.length} turno(s) migrado(s) para Leito ${destBed.number} com sucesso!` +
      (deleteOrigin ? '\nDados do leito de origem removidos.' : '')
    );

  } catch (e) {
    console.error('[ENF] Migrate error:', e);
    showSaveIndicator('error', '✗ Erro ao migrar');
    alert('Erro ao migrar dados. Tente novamente.');
  }
}

