import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MODEL = "gemini-2.0-flash";
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

    const systemPrompt = `Você é um expert em roteiros virais e ULTRA CURTOS para vídeos de TikTok.
Você deve gerar APENAS as falas que serão narradas por uma inteligência artificial (fala de 10 a 15 segundos no máximo).
NUNCA escreva ações, emojis, nem cenários. Apenas escreva o TEXTO FALADO, direto ao ponto. Use português do Brasil bem natural.`;

    let userPrompt = "";

    if (topic === "frutas") {
      userPrompt = `Escreva uma piada ou fofoca viral super curta (máximo 30 palavras) na perspectiva de uma ${subOption || "fruta"} falante com personalidade debochada ou sarcástica.`;
    } else if (topic === "roca") {
      userPrompt = `Escreva uma reflexão ou relato super curto (máximo 30 palavras) de uma mulher da roça orgulhosa do seu estilo de vida no campo, usando gírias sertanejas autênticas (sô, uai, trem).`;
    } else if (topic === "religioso") {
      userPrompt = `Escreva uma mensagem ou reflexão cristã muito impactante e edificante, super curta (máximo 30 palavras), falando sobre não desistir e ter fé em Deus.`;
    } else {
      userPrompt = `Escreva um texto de curiosidade impactante sobre ${topic} (máximo 30 palavras).`;
    }

    const response = await fetch(`${API_BASE}/${MODEL}:generateContent?key=${GOOGLE_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      }),
    });

    if (!response.ok) throw new Error("Erro na API da LLM");

    const data = await response.json();
    const script = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!script) throw new Error("Nenhum script gerado");

    return new Response(JSON.stringify({ script }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Erro" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
