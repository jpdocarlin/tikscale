import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MODEL = "gemini-2.0-flash";
const API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { productName, category, videoType, targetAudience } = await req.json();

    if (!productName || !videoType) {
      return new Response(JSON.stringify({ error: "Nome do produto e tipo de vídeo são obrigatórios" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const GOOGLE_API_KEY = Deno.env.get("GOOGLE_API_KEY");
    if (!GOOGLE_API_KEY) throw new Error("GOOGLE_API_KEY não configurada");

    const videoTypeDescriptions: Record<string, string> = {
      "review": "Review/Testemunho pessoal - A pessoa conta sua experiência real usando o produto",
      "trend": "Trend/Viral - Formato de tendência do TikTok, com hook forte nos primeiros 3 segundos",
      "dica": "Dica de Amiga - Tom conversacional e íntimo, como se estivesse indicando pra uma amiga",
      "unboxing": "Unboxing/Primeira Impressão - Mostra o produto chegando, abrindo a embalagem",
      "comparacao": "Comparação/Antes e Depois - Mostra o antes e depois de usar o produto",
    };

    const typeDescription = videoTypeDescriptions[videoType] || videoType;

    const systemPrompt = `Você é um roteirista expert em vídeos virais ULTRA CURTOS para TikTok e Instagram Reels. Você cria scripts UGC extremamente concisos, naturais e autênticos.

REGRAS OBRIGATÓRIAS:
- O script deve durar EXATAMENTE 10 segundos quando lido em voz alta (MÁXIMO 25-30 palavras)
- Linguagem NATURAL e coloquial brasileira
- Comece com HOOK forte (1-2 segundos)
- Vá DIRETO ao ponto
- Termine com CTA curta ("link na bio", "corre lá")
- NÃO use emojis ou hashtags
- Primeira pessoa, seja PUNCH e específico

ESTRUTURA (10s): 1. HOOK (0-2s) 2. PRODUTO + BENEFÍCIO (2-7s) 3. CTA (7-10s)`;

    const userPrompt = `Crie um script ULTRA CURTO de 10 segundos para o produto "${productName}" (categoria: ${category || "geral"}).
Tipo: ${typeDescription}
${targetAudience ? `Público-alvo: ${targetAudience}` : ""}
Retorne APENAS o texto que a pessoa vai falar. MÁXIMO 25-30 palavras.`;

    const response = await fetch(`${API_BASE}/${MODEL}:generateContent?key=${GOOGLE_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições atingido. Tente novamente em alguns segundos." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("Google API error:", response.status, errorText);
      throw new Error("Erro ao gerar script");
    }

    const data = await response.json();
    const script = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!script) throw new Error("Nenhum script gerado");

    return new Response(JSON.stringify({ script }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
