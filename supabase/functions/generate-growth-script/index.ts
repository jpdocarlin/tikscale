import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MODEL = "gemini-2.5-flash";
const API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const GOOGLE_API_KEY = Deno.env.get("GOOGLE_API_KEY");
    if (!GOOGLE_API_KEY) throw new Error("Google API key not configured");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Não autorizado" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { topic, subOption } = await req.json();

    let prompt = "";

    if (topic === "frutas") {
      const fruta = subOption || "fruta";
      prompt = `Você é uma ${fruta} animada e carismática falando em 1ª pessoa num vídeo viral de TikTok de até 10 segundos.

REGRAS:
- Fale COMO a ${fruta}, em primeira pessoa ("Eu sou a ${fruta}...")
- Começa com um HOOK chamativo nos primeiros 3 segundos que pare o scroll (ex: "Oi! Eu sou a ${fruta}!" ou algo surpreendente sobre ela)
- Depois conte 1 ou 2 benefícios/curiosidades dela de forma animada e divertida
- Tom: alegre, simpático, engraçado
- Máximo 35 palavras no total
- SEM emojis, SEM hashtags, SEM perguntas ao espectador no final
- Linguagem simples e descontraída

EXEMPLO DO QUE QUERO:
"Oi! Eu sou a banana! Sou rica em potássio, dou energia de sobra e ainda ajudo o seu humor. Acredite, sem mim o seu dia seria bem mais triste."

Escreva APENAS o texto falado. Sem aspas. Sem explicações.`;

    } else if (topic === "roca") {
      const cabelo = subOption || "morena";
      prompt = `Você é uma mulher ${cabelo} da roça falando em 1ª pessoa num vídeo viral de TikTok de até 10 segundos.

REGRAS:
- Fale EM PRIMEIRA PESSOA, como essa mulher da roça
- Começa com um HOOK chamativo nos primeiros 3 segundos — algo relatable, engraçado ou um lamento irônico (ex: "A maioria dos homens prefere as mulheres da cidade e deixa nós da roça sozinha, desse jeito...")
- Continue com algo que prenda a atenção até o fim: humor, ironia ou orgulho da vida simples
- Tom: espontâneo, engraçado, autêntico, nordestino/caipira natural
- Máximo 35 palavras no total
- SEM emojis, SEM hashtags
- Linguagem natural e regional (pode usar "nós", "uai", "sô", "danado", etc.)

EXEMPLO DO QUE QUERO:
"A maioria dos homens tudo gostam das mulheres da cidade e deixa nós da roça sozinha, desse jeito. Mas tá bom não, porque homem da roça vale muito mais."

Escreva APENAS o texto falado. Sem aspas. Sem explicações.`;

    } else if (topic === "religioso") {
      prompt = `Escreva uma narração cristã impactante para um vídeo TikTok de até 10 segundos.

REGRAS:
- Começa com um HOOK emocional poderoso nos primeiros 3 segundos
- Tom: poético, esperançoso, emocionante, que faça querer compartilhar
- Máximo 35 palavras no total
- SEM emojis, SEM hashtags
- Pode ser em 1ª ou 3ª pessoa

EXEMPLO DO QUE QUERO:
"Quando tudo parecia perdido, Deus entrou em cena. Ele não chegou atrasado, chegou no tempo certo. E vai chegar no seu também."

Escreva APENAS o texto falado. Sem aspas. Sem explicações.`;

    } else {
      prompt = `Escreva um script viral em português para TikTok de até 10 segundos sobre ${topic} (${subOption}). Hook forte nos primeiros 3 segundos. Máximo 35 palavras. Sem emojis. Só o texto falado.`;
    }

    const response = await fetch(`${API_BASE}/${MODEL}:generateContent?key=${GOOGLE_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 1.0,
          maxOutputTokens: 200,
          thinkingConfig: { thinkingBudget: 0 },
        }
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Erro na API Gemini (${response.status}):`, errorBody);
      throw new Error(`Erro da API da IA: ${response.status}`);
    }

    const data = await response.json();
    let script = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

    // Limpeza: remove aspas, emojis e prefixos desnecessários
    script = script
      .replace(/["""«»'']/g, "")
      .replace(/^(Narração:|Frase:|Exemplo:|Script:|Texto:)\s*/i, "")
      .replace(/\n\n.*/s, "")
      .trim();

    if (!script) throw new Error("Nenhum script foi gerado pela inteligência artificial.");

    return new Response(JSON.stringify({ script }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Erro no edge function:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Erro interno" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
