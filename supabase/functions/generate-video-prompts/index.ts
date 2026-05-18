import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MODEL = "gemini-2.0-flash";
const API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Não autorizado. Faça login para continuar." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const token = authHeader.replace("Bearer ", "");
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !userData?.user?.id) {
      return new Response(JSON.stringify({ error: "Sessão inválida. Faça login novamente." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { productDescription, extraInstructions } = await req.json();
    const GOOGLE_API_KEY = Deno.env.get("GOOGLE_API_KEY");
    if (!GOOGLE_API_KEY) throw new Error("GOOGLE_API_KEY is not configured");

    if (!productDescription || productDescription.trim().length === 0) {
      return new Response(JSON.stringify({ error: "Descrição do produto é obrigatória" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const systemPrompt = `Você é um especialista em criar scripts para vídeos de vendas estilo UGC para TikTok e Reels.

Seu objetivo é criar um script que pareça uma PESSOA REAL falando naturalmente.

REGRAS:
- Script em PORTUGUÊS brasileiro natural
- 80-150 palavras
- Linguagem natural (nada de propaganda tradicional)
- Escolha um estilo: Testemunho Pessoal, Dica de Amiga, ou Descoberta Viral

IMPORTANTE: Retorne a resposta EXATAMENTE neste formato JSON:
{"prompts":[{"title":"...","prompt":"...","style":"..."}]}

Retorne APENAS o JSON, sem texto adicional, sem markdown, sem code blocks.`;

    let userPrompt = `Crie 1 script de vídeo UGC para este produto:\n\n${productDescription}\n\nO script deve parecer uma pessoa comum falando naturalmente na câmera.`;

    if (extraInstructions?.trim()) {
      userPrompt += `\n\nINSTRUÇÕES EXTRAS DO USUÁRIO:\n${extraInstructions}`;
    }

    console.log("Generating UGC-style scripts via Google Gemini API");

    const response = await fetch(`${API_BASE}/${MODEL}:generateContent?key=${GOOGLE_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: "user", parts: [{ text: userPrompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
        },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns segundos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const errorText = await response.text();
      console.error("Google API error:", response.status, errorText);
      throw new Error("Erro ao gerar scripts");
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!content) throw new Error("Resposta vazia da IA");

    let promptsPayload: any;
    try {
      promptsPayload = JSON.parse(content);
    } catch (parseError) {
      // Try extracting JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        promptsPayload = JSON.parse(jsonMatch[0]);
      } else {
        console.error("Parse error:", parseError, "Content:", content);
        throw new Error("Erro ao processar resposta da IA");
      }
    }

    if (!promptsPayload?.prompts || !Array.isArray(promptsPayload.prompts) || promptsPayload.prompts.length === 0) {
      console.error("Invalid payload:", promptsPayload);
      throw new Error("Resposta inválida da IA");
    }

    console.log("Successfully generated scripts:", promptsPayload.prompts.length);

    return new Response(JSON.stringify(promptsPayload), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in generate-video-prompts:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});