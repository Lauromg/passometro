const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { GoogleGenAI } = require("@google/genai");
const admin = require("firebase-admin");

admin.initializeApp();

// Instanciar o cliente do Gemini
// Ele buscará automaticamente a chave da variável de ambiente GEMINI_API_KEY
const ai = new GoogleGenAI({});

exports.gerarResumoEvolucoes = onCall({ cors: true }, async (request) => {
  // Garantir que o usuário está autenticado
  if (!request.auth) {
    throw new HttpsError(
      "unauthenticated",
      "É necessário estar logado para gerar o resumo."
    );
  }

  const { evolutions, antibiotics } = request.data;

  if (!evolutions || !Array.isArray(evolutions) || evolutions.length === 0) {
    throw new HttpsError(
      "invalid-argument",
      "A lista de evoluções não foi fornecida ou está vazia."
    );
  }

  // Formatar as evoluções para o prompt
  const evolucoesTexto = evolutions
    .map((evo) => {
      const turno = evo.shift === "day" ? "Diurno" : "Noturno";
      return `[Data: ${evo.date} | Turno: ${turno}]\nTexto: ${evo.text}`;
    })
    .join("\n\n---\n\n");

  let atbTexto = "Nenhum antibiótico registrado.";
  if (antibiotics && Array.isArray(antibiotics) && antibiotics.length > 0) {
     atbTexto = antibiotics.filter(a => a.name && a.name.trim()).map(a => {
        const fim = a.endDate ? ` (Finalizado em ${a.endDate})` : " (Ativo)";
        return `- ${a.name}, Início: ${a.startDate}${fim}`;
     }).join("\n");
  }

  const prompt = `Atue como um médico intensivista muito experiente.
Abaixo está o histórico de evoluções de um paciente internado na UTI, bem como a lista de antibióticos utilizados.
Sua tarefa é criar um resumo médico conciso, objetivo e muito bem estruturado do quadro atual do paciente para a passagem de plantão (passômetro).
Destaque as informações mais relevantes, a evolução do quadro clínico, as intercorrências, e inclua os dados dos antibióticos em uso ou recém-finalizados, se forem relevantes.
Não invente informações, use apenas o que está no texto fornecido.
Seja direto e use linguagem técnica adequada.
Não responda com "Aqui está o resumo..." ou similares. Apenas forneça o resumo diretamente.

💊 Antibióticos:
${atbTexto}

📋 Histórico de Evoluções:
${evolucoesTexto}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    if (response && response.text) {
      return { resumo: response.text };
    } else {
      throw new HttpsError("internal", "Resposta do modelo estava vazia.");
    }
  } catch (error) {
    console.error("Erro ao chamar Gemini API:", error);
    throw new HttpsError(
      "internal",
      "Ocorreu um erro ao processar as evoluções com a IA."
    );
  }
});
