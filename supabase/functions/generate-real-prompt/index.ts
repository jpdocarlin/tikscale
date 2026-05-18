import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MODEL = "gemini-2.5-flash";
const API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GOOGLE_API_KEY = Deno.env.get("GOOGLE_API_KEY");
    if (!GOOGLE_API_KEY) {
      return new Response(JSON.stringify({ error: "Google API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Não autorizado" }),
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
      return new Response(JSON.stringify({ error: "Sessão inválida" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const userId = userData.user.id;
    const userEmail = userData.user.email;

    // Enforce 5 daily limit except for specified admin
    if (userEmail !== "jpnogueiraz@gmail.com") {
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);

      const { count, error: countError } = await supabaseClient
        .from("growth_usage")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("type", "real_prompt")
        .gte("created_at", today.toISOString());

      if (countError) {
        console.error("Error checking limits:", countError);
      } else if (count !== null && count >= 5) {
        return new Response(JSON.stringify({ error: "Você atingiu o limite diário de 5 prompts gerados na aba Prompts Reais." }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
    }

    const { description } = await req.json();

    if (!description || description.trim().length === 0) {
      return new Response(JSON.stringify({ error: "Descrição é obrigatória" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    console.log("Generating real prompt for user:", userData.user.id);

    const systemPrompt = `Você é um especialista em criar prompts de IA para gerar vídeos e animações de personagens com IA (como Kling, Runway, Pika, Luma, etc.).

O usuário vai descrever em PORTUGUÊS os movimentos, expressões e ações que o personagem deve fazer. Você deve transformar isso em um prompt PERFEITO em INGLÊS otimizado para IAs de geração de vídeo.

REGRAS:
- Retorne APENAS o prompt em inglês, sem explicações
- Use linguagem técnica de prompts de IA para vídeo
- Inclua detalhes de: movimentos, expressões faciais, direção do olhar, timing, câmera
- NÃO descreva roupas, estilo de vestimenta ou a cor de qualquer peça de roupa sob nenhuma circunstância. Foco estritamente na mecânica do corpo: cabeça, mãos, pés, cintura e corpo inteiro.
- Use termos como: cinematic, photorealistic, smooth motion, natural movement
- Seja específico e detalhado sobre cada movimento
- Inclua qualidade: 8K, high resolution, detailed face, smooth animation
- Mantenha o prompt conciso mas completo (máximo 200 palavras)
- NÃO inclua aspas, markdown, ou formatação — apenas o texto do prompt`;

    const userPrompt = `Transforme esta descrição de movimentos em um prompt perfeito em inglês para IA de vídeo:\n\n"${description}"`;

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
        return new Response(JSON.stringify({ error: "Muitas requisições. Aguarde alguns segundos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const errorText = await response.text();
      console.error("Google API error:", response.status, errorText);
      throw new Error("Erro ao gerar prompt");
    }

    const data = await response.json();
    const prompt = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!prompt) throw new Error("Nenhum prompt gerado");

    // Record usage log after successful generation
    await supabaseClient.from("growth_usage").insert({
      user_id: userId,
      type: "real_prompt"
    });

    console.log("Real prompt generated successfully");

    return new Response(JSON.stringify({ prompt }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
