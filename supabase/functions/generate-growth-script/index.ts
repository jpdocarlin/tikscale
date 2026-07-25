import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MODEL = "gemini-2.5-flash";
const API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

function cleanText(text: string): string {
  let cleaned = text
    .replace(/["""«»'']/g, "")
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, "")
    .replace(/^(Narração:|Frase:|Exemplo:|Script:|Texto:|Fala:)\s*/i, "")
    .trim();
  
  // Garantir que termina com pontuação completa para não cortar palavras
  if (cleaned && !/[.!?]$/.test(cleaned)) {
    cleaned += ".";
  }
  return cleaned;
}

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

    let systemInstruction = "";
    let prompt = "";

    const translationMap: Record<string, string> = {
      "Maçã": "apple", "Laranja": "orange", "Morango": "strawberry", 
      "Banana": "banana", "Abacaxi": "pineapple", "Melancia": "watermelon",
      "Loira": "blonde", "Morena": "brunette", "Ruiva": "redhead",
    };
    const translatedSub = translationMap[subOption] || subOption || "";

    if (topic === "frutas") {
      const frutaPt = subOption || "fruta";
      const frutaEn = translatedSub || "fruit";
      systemInstruction = `You are an expert AI prompt engineer and viral content writer for TikTok.
Your task is to generate TWO outputs in a JSON object:
1. "videoPrompt": A cinematic AI video prompt in ENGLISH explicitly specifying a 10-second video duration for generating a 3D animated ${frutaEn} character in tools like Hedra, Kling, Luma, Runway, or Vidu.
2. "speechScript": The exact 10-second spoken dialogue in PORTUGUESE for the ${frutaPt}.

RULES FOR "videoPrompt" (ENGLISH):
- MUST explicitly start or include: "Cinematic 10-second video of..."
- Describe a 3D Pixar/Disney style animated ${frutaEn} character with expressive human-like eyes and mouth seamlessly integrated into the fruit texture.
- The fruit is wearing a sports headband, talking to camera with lively movements. Studio lighting, bright colorful background.
- Length: 60-90 words. Single flowing paragraph.

RULES FOR "speechScript" (PORTUGUESE):
- Speak in 1st person as the ${frutaPt} ("Oi! Eu sou a ${frutaPt}...").
- Strong scroll-stopping hook in the first 3 seconds.
- State 1 or 2 real health benefits or funny facts.
- STRICT WORD COUNT: Between 22 and 28 words total. This exact timing guarantees 10 seconds of speech at a natural speaking speed.
- CRITICAL: MUST be complete, well-punctuated sentences ending in (.), (!), or (?). NEVER leave words cut off, NEVER truncate phrases mid-sentence. NO hashtags, NO emojis, NO quotes.`;

      prompt = `Generate the JSON output with videoPrompt and speechScript for ${frutaPt} (${frutaEn}).`;

    } else if (topic === "roca") {
      const cabeloPt = subOption || "morena";
      const cabeloEn = translatedSub || "brunette";
      systemInstruction = `You are an expert AI prompt engineer and viral content writer for TikTok.
Your task is to generate TWO outputs in a JSON object:
1. "videoPrompt": A cinematic AI video prompt in ENGLISH explicitly specifying a 10-second video duration featuring an authentic young Brazilian country woman with ${cabeloEn} hair.
2. "speechScript": The exact 10-second spoken line in PORTUGUESE for this country woman.

RULES FOR "videoPrompt" (ENGLISH):
- MUST explicitly start or include: "Ultra-realistic 10-second video of..."
- Describe an authentic young Brazilian farm woman with ${cabeloEn} hair in rustic farm clothes, looking at the camera and talking with natural, friendly hand gestures.
- Golden hour lighting, authentic farm landscape background, 10-second video duration.
- Length: 60-90 words. Single flowing paragraph.

RULES FOR "speechScript" (PORTUGUESE):
- Speak in 1st person as a woman from the countryside.
- Catchy hook in the first 3 seconds (funny, relatable, or witty countryside comment).
- Authentic, warm, caipira/nordestina tone.
- STRICT WORD COUNT: Between 22 and 28 words total. This exact timing guarantees 10 seconds of speech at a natural speaking speed.
- CRITICAL: MUST be complete, well-punctuated sentences ending in (.), (!), or (?). NEVER leave words cut off, NEVER truncate phrases mid-sentence. NO hashtags, NO emojis, NO quotes.`;

      prompt = `Generate the JSON output with videoPrompt and speechScript for country woman with ${cabeloPt} (${cabeloEn}) hair.`;

    } else if (topic === "religioso") {
      systemInstruction = `You are an expert AI prompt engineer and viral content writer for TikTok.
Your task is to generate TWO outputs in a JSON object:
1. "videoPrompt": A cinematic AI video prompt in ENGLISH explicitly specifying a 10-second video duration for a divine portrait of Jesus Christ.
2. "speechScript": The exact 10-second spoken Christian narration in PORTUGUESE.

RULES FOR "videoPrompt" (ENGLISH):
- MUST explicitly start or include: "Cinematic 10-second video portrait of..."
- Describe a sacred, beautiful, and divine representation of Jesus Christ looking with compassion at the viewer with gentle hand gestures.
- Heavenly glowing light, warm soft ambient lighting, serene atmosphere, 10-second video duration.
- Length: 60-90 words. Single flowing paragraph.

RULES FOR "speechScript" (PORTUGUESE):
- Inspiring Christian reflection or promise of faith.
- Emotional hook in the first 3 seconds.
- Poetic, hopeful, uplifting tone.
- STRICT WORD COUNT: Between 22 and 28 words total. This exact timing guarantees 10 seconds of speech at a natural speaking speed.
- CRITICAL: MUST be complete, well-punctuated sentences ending in (.), (!), or (?). NEVER leave words cut off, NEVER truncate phrases mid-sentence. NO hashtags, NO emojis, NO quotes.`;

      prompt = `Generate the JSON output with videoPrompt and speechScript for a religious Christian video.`;

    } else {
      systemInstruction = `Generate a JSON object with "videoPrompt" (English, 10-second video prompt) and "speechScript" (Portuguese, 10-second spoken text, 22-28 words, complete sentences).`;
      prompt = `Generate prompts for topic ${topic} (${subOption}).`;
    }

    const response = await fetch(`${API_BASE}/${MODEL}:generateContent?key=${GOOGLE_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemInstruction }] },
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 600,
          responseMimeType: "application/json",
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
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

    let videoPrompt = "";
    let speechScript = "";

    try {
      const jsonParsed = JSON.parse(rawText);
      videoPrompt = jsonParsed.videoPrompt || "";
      speechScript = jsonParsed.speechScript || jsonParsed.script || "";
    } catch {
      speechScript = rawText;
    }

    videoPrompt = videoPrompt.trim();
    speechScript = cleanText(speechScript);

    if (!speechScript) throw new Error("Nenhum script foi gerado pela inteligência artificial.");

    return new Response(JSON.stringify({
      videoPrompt,
      speechScript,
      script: speechScript
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Erro no edge function:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Erro interno" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
