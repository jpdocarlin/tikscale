import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MODEL = "imagen-3.0-generate-001";
const API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GOOGLE_API_KEY = Deno.env.get("GOOGLE_API_KEY");
    if (!GOOGLE_API_KEY) throw new Error("Google API key not configured");

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

    const { topic, subOption, timestamp } = await req.json();

    // Map subOption to English to avoid Imagen hallucinating mixed languages
    const translationMap: Record<string, string> = {
      "Maçã": "apple", "Laranja": "orange", "Morango": "strawberry", 
      "Banana": "banana", "Abacaxi": "pineapple", "Melancia": "watermelon",
      "Loira": "blonde", "Morena": "brunette", "Ruiva": "redhead",
    };
    
    const translatedSubOption = translationMap[subOption] || subOption || "";
    const seedBreaker = timestamp ? `[Unique ID: ${timestamp}]` : "";

    let prompt = "";
    
    // Explicit extreme enforcement inside the prompt string itself because AI Studio often ignores parameters
    if (topic === "frutas") {
      prompt = `A highly realistic, plain, and normal photograph of a single fresh ${translatedSubOption || "fruit"} resting on a plain bright background. 
CRITICAL: PURE REALISM. ABSOLUTELY NO CARTOON FACES, NO EYES, NO MOUTH. DO NOT ADD ANY TEXT, LETTERS, TYPOGRAPHY OR LABELS. JUST THE BORING REAL FRUIT. ${seedBreaker}`;
    } else if (topic === "roca") {
      prompt = `A highly realistic photograph of a Brazilian country woman (${translatedSubOption || "woman"}) working on an authentic rural farm. Wearing rustic clothes. 
CRITICAL: PURE REALISM. DO NOT ADD ANY TEXT, LETTERS, TYPOGRAPHY OR LABELS. ${seedBreaker}`;
    } else if (topic === "religioso") {
      prompt = `A realistic, beautiful and divine cinematic portrait of Jesus Christ looking compassionate. Warm lighting.
CRITICAL: DO NOT ADD ANY TEXT, LETTERS, TYPOGRAPHY OR LABELS. ${seedBreaker}`;
    } else {
      prompt = `A realistic image of ${topic} and ${translatedSubOption}. 
CRITICAL: DO NOT ADD ANY TEXT, LETTERS, TYPOGRAPHY OR LABELS. ${seedBreaker}`;
    }

    const response = await fetch(`${API_BASE}/${MODEL}:predict?key=${GOOGLE_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        instances: [{ prompt }],
        parameters: { 
          sampleCount: 1, 
          aspectRatio: "9:16"
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Google API error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "Erro ao gerar imagem. Tente novamente." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const data = await response.json();
    const b64 = data.predictions?.[0]?.bytesBase64Encoded;
    if (!b64) throw new Error("Nenhuma imagem gerada.");

    return new Response(JSON.stringify({ success: true, imageUrl: `data:image/jpeg;base64,${b64}` }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Erro" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
