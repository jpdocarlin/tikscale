const fetch = require('node:fetch');

const GOOGLE_API_KEY = "AIzaSyACwXUzLZEymQ6DHhnPmukWACkyw2vj1vk";
const MODEL = "gemini-2.0-flash";
const API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

async function run() {
  const systemPrompt = "Você é um especialista em criar prompts de IA.";
  const userPrompt = "Transforme esta descrição de movimentos em um prompt perfeito em inglês para IA de vídeo:\n\n\"A personagem deve sorrir suavemente, virar o rosto para a direita e piscar lentamente...\"";

  try {
    const response = await fetch(`${API_BASE}/${MODEL}:generateContent?key=${GOOGLE_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      }),
    });

    console.log("Status:", response.status);
    const data = await response.json();
    console.log("Data:", JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Error:", err);
  }
}

run();
