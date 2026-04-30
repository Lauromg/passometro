const GRUPOS_EXAMES = [
  {
    nome: "Hemograma",
    exames: [
      { id: "ht", label: "Ht", unidade: "%", apelidos: ["hematócrito", "hematocrito"] }
    ]
  },
  {
    nome: "Gasometria",
    exames: [
      { id: "po2",   label: "pO2",   unidade: "mmHg",   apelidos: ["po2", "pao2"] },
      { id: "pco2",  label: "pCO2",  unidade: "mmHg",   apelidos: ["pco2", "paco2"] },
      { id: "sat",   label: "Sat",   unidade: "%",      apelidos: ["saturação", "saturacao", "sato2", "so2"] },
      { id: "be",    label: "BE",    unidade: "mEq/L",  apelidos: ["base excess", "excesso de base", "be"] }
    ]
  },
  {
    nome: "Eletrólitos",
    exames: [
      { id: "p",   label: "P",   unidade: "mg/dL", apelidos: ["fósforo", "fosforo"] }
    ]
  }
];

function removerAcentos(str) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function processarTexto(texto) {
  const mapaApelidos = {};
  GRUPOS_EXAMES.forEach(grupo => {
    grupo.exames.forEach(exame => {
      const labelNormalizado = removerAcentos(exame.label.toLowerCase());
      if (labelNormalizado !== 'p') {
          mapaApelidos[labelNormalizado] = exame.id;
      }
      exame.apelidos.forEach(ap => {
        mapaApelidos[removerAcentos(ap.toLowerCase())] = exame.id;
      });
    });
  });

  const reconhecidos = {};
  
  const reLetra = '[a-zÀ-ÿ0-9]+';
  const regex = new RegExp(
    '(' + reLetra + '(?:\\s+' + reLetra + '){0,3})' +
    '\\s*[:\\-=]?\\s*' +
    '(-?\\d+[.,]?\\d*)',
    'gi'
  );
  
  let match;
  while ((match = regex.exec(texto)) !== null) {
    const termoRaw = match[1].trim();
    const valor = match[2].replace(",", ".");
    const termo = removerAcentos(termoRaw.toLowerCase());
    const termoSemEspaco = termo.replace(/\s+/g, '');

    if (mapaApelidos[termo]) {
      reconhecidos[mapaApelidos[termo]] = parseFloat(valor);
    } else if (mapaApelidos[termoSemEspaco]) {
      reconhecidos[mapaApelidos[termoSemEspaco]] = parseFloat(valor);
    } else {
      for (const palavra of termo.split(/\s+/)) {
        if (mapaApelidos[palavra]) {
          reconhecidos[mapaApelidos[palavra]] = parseFloat(valor);
          break;
        }
      }
    }
  }
  return reconhecidos;
}

console.log("TEST 1 - hematócrito 45:", processarTexto("hematócrito 45"));
console.log("TEST 2 - pco2 40:", processarTexto("pco2 40"));
console.log("TEST 3 - po2 90:", processarTexto("po2 90"));
console.log("TEST 4 - p o 2 95:", processarTexto("p o 2 95"));
console.log("TEST 5 - sat 99:", processarTexto("sat 99"));
console.log("TEST 6 - so2 98:", processarTexto("so2 98"));
console.log("TEST 7 - be -2:", processarTexto("be -2"));
console.log("TEST 8 - fósforo 4.5:", processarTexto("fósforo 4.5"));
