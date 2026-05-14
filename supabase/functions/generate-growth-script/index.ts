import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

    const systemPrompt = `Você é um especialista e redator de elite em roteiros virais ultra-curtos para TikTok.
Seu objetivo absoluto é criar a FALA PERFEITA para ser narrada por uma IA (exatamente 10 segundos de duração).

REGRAS CRÍTICAS E OBRIGATÓRIAS PARA NARRADOR IA:
1. TAMANHO EXATO (10 SEGUNDOS): O script deve ter OBRIGATORIAMENTE entre 20 e 25 palavras. Nem mais, nem menos.
2. APENAS O TEXTO FALADO: Não use NENHUM emoji, hashtag, parênteses, descrições de ação, sons ou cenários. Apenas a fala direta.
3. PRONÚNCIA PERFEITA: Nunca use abreviações (ex: escreva "você", não "vc"). Não use palavras difíceis, travas-línguas ou estrangeirismos de difícil dicção.
4. PERSONIFICAÇÃO TOTAL: O texto deve incorporar o personagem da imagem 100%. Se for fruta, fale como a própria fruta. Se for roça, fale como o personagem da roça.`;

    let userPrompt = "";

    if (topic === "frutas") {
      const fruta = subOption || "fruta";
      userPrompt = `Você é uma ${fruta} viva, sarcástica e muito debochada.
Fale sobre si mesma (como uma ${fruta}) de forma cômica para quem está te vendo agora.
O texto deve ter entre 20 e 25 palavras no total. Escreva exatamente as palavras que você dirá.`;
    } else if (topic === "roca") {
      const perfil = subOption || "mulher da roça";
      userPrompt = `Você é uma ${perfil} carismática orgulhosa da vida simples na roça.
Fale algo autêntico e curto sobre o cheirinho do café ou o amanhecer no campo. Use 'uai' ou 'sô' naturalmente.
O texto deve ter entre 20 e 25 palavras no total.`;
    } else if (topic === "religioso") {
      userPrompt = `Escreva uma reflexão cristã e motivacional extremamente impactante e emocionante sobre fé, oração e força divina.
O texto deve dar esperança e força ao ouvinte, de forma poética e direta.
O texto deve ter entre 20 e 25 palavras no total.`;
    } else {
      userPrompt = `Escreva uma reflexão ou curiosidade impactante sobre ${topic} (${subOption}).
O texto deve ter entre 20 e 25 palavras no total.`;
    }

    const response = await fetch(`${API_BASE}/${MODEL}:generateContent?key=${GOOGLE_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: "user", parts: [{ text: userPrompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 100,
        }
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Erro na API Gemini (${response.status}):`, errorBody);
      throw new Error(`Erro da API da IA: ${response.status}. ${errorBody}`);
    }

    const data = await response.json();
    let script = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
    
    // Limpeza de segurança secundária para remover aspas e possíveis emojis remanescentes
    script = script.replace(/[""«»]/g, '').trim();
    
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
