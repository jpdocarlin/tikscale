import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const IMAGEN_MODEL = "imagen-4.0-generate-001";
const GEMINI_IMAGE_MODEL = "gemini-2.5-flash-image";
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
      prompt = `A stylized and humorous CG character photograph of a single fresh ${translatedSubOption || "fruit"} with a funny, expressive face integrated perfectly into the fruit. 
The face skin and features are 100% the exact same color and texture as the fruit skin (e.g. solid red skin for apples). 
CRITICAL: ABSOLUTELY NO HUMAN SKIN COLORS, NO PINK OR BEIGE FLESH. The face has expressive humorous eyes, funny eyebrows, and an expressive mouth, maintaining the fruit's natural round shape. 
It is wearing a simple sports tennis headband. Isolated on a bright clean background. Pixar style character design. ${seedBreaker}`;
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

    let imageUrl = null;

    // Try Imagen 4 first (highest quality)
    const response = await fetch(`${API_BASE}/${IMAGEN_MODEL}:predict?key=${GOOGLE_API_KEY}`, {
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

    if (response.ok) {
      const data = await response.json();
      const b64 = data.predictions?.[0]?.bytesBase64Encoded;
      if (b64) {
        imageUrl = `data:image/png;base64,${b64}`;
      }
    } else {
      // Imagen failed, fallback to Gemini Flash Image
      console.warn("Imagen 4 failed on Growth Image with status", response.status, "- falling back to Gemini Flash Image");
      const fallbackResponse = await fetch(`${API_BASE}/${GEMINI_IMAGE_MODEL}:generateContent?key=${GOOGLE_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { responseModalities: ["TEXT", "IMAGE"] },
        }),
      });

      if (!fallbackResponse.ok) {
        const errorText = await fallbackResponse.text();
        console.error("Fallback API error:", fallbackResponse.status, errorText);
        return new Response(JSON.stringify({ error: "Erro ao gerar imagem com o fallback." }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      const fallbackData = await fallbackResponse.json();
      imageUrl = extractImageFromGeminiResponse(fallbackData);
    }

    if (!imageUrl) {
      throw new Error("Nenhuma imagem gerada.");
    }

    return new Response(JSON.stringify({ success: true, imageUrl }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Erro" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});

function extractImageFromGeminiResponse(data: any): string | null {
  const parts = data.candidates?.[0]?.content?.parts;
  if (parts) {
    for (const p of parts) {
      if (p.inlineData?.data) {
        return `data:${p.inlineData.mimeType || "image/png"};base64,${p.inlineData.data}`;
      }
    }
  }
  return null;
}
