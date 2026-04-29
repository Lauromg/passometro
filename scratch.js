const data = {
  ganhos: [ { volume: 85 } ],
  diurese: [],
  drenos: [],
  evacuacoes: [],
  sinaisVitais: {},
  glicemia: []
};

const parts = [];

const ganhos = (data.ganhos || []).reduce((s, g) => s + (parseFloat(g.volume) || 0), 0);
const diurese = (data.diurese || []).reduce((s, d) => s + (parseFloat(d.volume) || 0), 0);
const drenos = (data.drenos || []).reduce((s, d) => s + (parseFloat(d.volume) || 0), 0);
const hd = parseFloat(data.hd?.ufReal) || 0;
const evac = (data.evacuacoes || []).reduce((s, e) => s + (parseFloat(e.volume) || 200), 0);
const perdas = diurese + drenos + hd + evac;
const bh = ganhos - perdas;
if (ganhos > 0 || perdas > 0) {
  const sign = bh >= 0 ? '+' : '';
  parts.push(`BH ${sign}${bh}mL`);
  if (diurese > 0) parts.push(`Diurese ${diurese}mL`);
}

console.log(parts);
