import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 50000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new Error('A requisição à IA excedeu o tempo limite. Tente novamente.');
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

const MODEL = "gemini-2.5-flash";
const API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";
const UPLOAD_BASE = "https://generativelanguage.googleapis.com/upload/v1beta/files";
const FILE_API_BASE = "https://generativelanguage.googleapis.com/v1beta/files";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GOOGLE_API_KEY = Deno.env.get("GOOGLE_API_KEY");
    if (!GOOGLE_API_KEY) {
      throw new Error("Google API key not configured");
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
        return new Response(JSON.stringify({ error: "Você atingiu o limite diário de 5 gerações na aba Prompts Reais." }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
    }

    const { videoUrl, context, outfitImageUrl } = await req.json();
    if (!videoUrl) {
      return new Response(JSON.stringify({ error: "URL do vídeo é obrigatória" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    console.log("Analyzing video:", videoUrl);

    // 1. Fetch the video
    const videoRes = await fetch(videoUrl);
    if (!videoRes.ok) {
      throw new Error(`Failed to fetch video: ${videoRes.status}`);
    }
    const videoBuffer = await videoRes.arrayBuffer();
    const sizeBytes = videoBuffer.byteLength;
    const mimeType = videoRes.headers.get("content-type") || "video/mp4";

    console.log(`Video fetched, size: ${sizeBytes} bytes, type: ${mimeType}`);

    // 2. Upload to Gemini File API
    const uploadRes = await fetchWithTimeout(`${UPLOAD_BASE}?uploadType=media&key=${GOOGLE_API_KEY}`, {
      method: "POST",
      headers: {
        "X-Goog-Upload-Command": "start, upload",
        "X-Goog-Upload-Header-Content-Length": sizeBytes.toString(),
        "X-Goog-Upload-Header-Content-Type": mimeType,
        "Content-Type": mimeType,
      },
      body: videoBuffer,
    });

    if (!uploadRes.ok) {
      const errText = await uploadRes.text();
      console.error("Gemini Upload error:", uploadRes.status, errText);
      throw new Error("Erro ao fazer upload do vídeo para a IA");
    }

    const uploadData = await uploadRes.json();
    const fileUri = uploadData.file?.uri;
    const fileName = uploadData.file?.name;

    if (!fileUri || !fileName) {
      throw new Error("Falha ao obter o URI do vídeo");
    }

    console.log(`Uploaded to Gemini: ${fileUri}, Name: ${fileName}`);

    // 3. Poll until state is ACTIVE
    let isReady = false;
    let attempts = 0;
    while (!isReady && attempts < 10) {
      const checkRes = await fetchWithTimeout(`https://generativelanguage.googleapis.com/v1beta/${fileName}?key=${GOOGLE_API_KEY}`, {}, 10000);
      if (!checkRes.ok) break;
      const fileData = await checkRes.json();
      if (fileData.state === "ACTIVE") {
        isReady = true;
      } else if (fileData.state === "FAILED") {
        throw new Error("Processamento do vídeo falhou na IA");
      } else {
        // Wait 2 seconds
        await new Promise(r => setTimeout(r, 2000));
        attempts++;
      }
    }

    if (!isReady) {
      throw new Error("Tempo esgotado ao processar o vídeo. Tente um vídeo menor.");
    }

    console.log("Video is ACTIVE, generating content...");

    // 4. Fetch outfit image if provided and convert to base64
    let outfitInlinePart: { inlineData: { mimeType: string; data: string } } | null = null;

    if (outfitImageUrl) {
      try {
        const outfitRes = await fetch(outfitImageUrl);
        if (outfitRes.ok) {
          const outfitBuffer = await outfitRes.arrayBuffer();
          const outfitMime = outfitRes.headers.get("content-type") || "image/jpeg";
          const outfitBase64 = btoa(
            String.fromCharCode(...new Uint8Array(outfitBuffer))
          );
          outfitInlinePart = { inlineData: { mimeType: outfitMime, data: outfitBase64 } };
          console.log(`Outfit image fetched (${outfitBuffer.byteLength} bytes, ${outfitMime})`);
        } else {
          console.warn("Could not fetch outfit image, proceeding without it");
        }
      } catch (e) {
        console.warn("Error fetching outfit image:", e);
      }
    }

    // 5. Generate Content
    const clothingRule = outfitInlinePart
      ? `DO NOT describe the clothing visible in the video. Instead, look at the outfit image provided alongside this video and describe that outfit VERY BRIEFLY (maximum 5 words). Incorporate this outfit description naturally into the motion prompt.`
      : `DO NOT describe the subject's clothing, outfits, colors of clothing, or any apparel under any circumstances. Focus purely on the mechanics of the body: head, hands, feet, waist, and full body motion.`;

    let systemInstruction = `You are a world-class AI video prompt engineer. Analyze the provided video and extract the EXACT physical movements to create perfect prompts for Google Flow (Veo) video generation.

Your task is to produce output in EXACTLY this Markdown format:

### Prompts para Imagens (Cena por Cena)

**Cena 1:**
> "Breve descrição em português. MÁXIMO 20 PALAVRAS."

**Cena 2:**
> "Breve descrição em português. MÁXIMO 20 PALAVRAS."

[IMPORTANT: CREATE EXACTLY 2 SCENES. NEVER MORE. KEEP SCENE DESCRIPTIONS EXTREMELY SHORT AND TELEGRAPHIC IN PORTUGUESE.]

### Prompt para Vídeo (Google Flow)

**Prompt do Vídeo:**
> "[Write the FULL video prompt HERE in ENGLISH. This prompt will be pasted directly into Google Flow.]"

RULES FOR THE VIDEO PROMPT (Google Flow section):
1. Write ENTIRELY in English — Google Flow performs significantly better with English prompts.
2. Start with the visual style: "Cinematic vertical smartphone video, 4K, shallow depth of field, natural soft lighting."
3. Then describe the subject briefly (gender, approximate age, hair, expression — NO names).
4. Then describe ALL movements in chronological order with PRECISE timing and speed:
   - Exactly what the hands do (gestures, gripping, pointing, waving, holding objects).
   - Exactly what the head does (tilting, turning left/right, nodding).
   - Exactly what the eyes do (looking at camera, glancing sideways, looking down at product).
   - Body posture transitions (leaning forward, stepping back, shifting weight).
   - Movement speed qualifiers (slowly, quickly, abruptly, smoothly, with a fluid motion).
5. ${clothingRule}
6. End with camera description: "Static front-facing camera, eye-level, stable framing on the subject."
7. The character does NOT speak — always include: "The subject's mouth remains closed, not speaking, silent throughout."
8. The video prompt MUST be between 80 and 120 words. Be descriptive but not verbose.
9. Do NOT use any formatting, bullet points, or line breaks inside the video prompt — it must be a single flowing paragraph.

STRICT CONTENT SAFETY RULES (violations will cause rejection):
- NEVER use words like: revealing, tight, low-cut, bikini, underwear, lingerie, nude, sheer, transparent, topless, sexy, seductive.
- NEVER mention tattoos, piercings, or body marks.
- NEVER describe body parts in a sexualized way.
- For clothing: use only conservative, respectful descriptions. E.g.: "elegant dress", "stylish outfit", "fashionable blouse".
- Keep character descriptions professional: focus on hair, facial expression, and general posture.

CRITICAL OUTPUT RULES:
- The image scene prompts (Cena 1, Cena 2) MUST be in PORTUGUESE.
- The video prompt (Google Flow) MUST be in ENGLISH.
- Output ONLY the requested format. No introductions, no filler, no opinions.
- Do NOT wrap the output in code blocks or add any extra formatting.`;

    if (context && context.trim().length > 0) {
      systemInstruction += `\n\nAdditional user instructions to incorporate into the final prompt: ${context}`;
    }

    // Build user message parts: video + optional outfit image
    const userParts: object[] = [
      { fileData: { fileUri, mimeType } },
    ];

    if (outfitInlinePart) {
      userParts.push(outfitInlinePart);
      userParts.push({ text: "The image above is the desired outfit. Generate the English movement prompt based on this video, using the movements from the video and describing the outfit shown in the image." });
    } else {
      userParts.push({ text: "Generate the English movement prompt based on this video." });
    }

    const genRes = await fetchWithTimeout(`${API_BASE}/${MODEL}:generateContent?key=${GOOGLE_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemInstruction }] },
        contents: [
          {
            role: "user",
            parts: userParts
          }
        ]
      }),
    });

    if (!genRes.ok) {
      const errText = await genRes.text();
      console.error("Generate error:", genRes.status, errText);
      throw new Error("Erro ao analisar movimentos do vídeo.");
    }

    const genData = await genRes.json();
    const promptText = genData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!promptText) {
      throw new Error("Resposta vazia da IA");
    }

    // 5. Cleanup: Delete the file from Gemini
    try {
      await fetch(`https://generativelanguage.googleapis.com/v1beta/${fileName}?key=${GOOGLE_API_KEY}`, { method: "DELETE" });
      console.log(`Cleaned up ${fileName}`);
    } catch (e) {
      console.warn("Failed to delete video from Gemini", e);
    }

    // Record usage log after successful generation
    await supabaseClient.from("growth_usage").insert({
      user_id: userId,
      type: "real_prompt"
    });

    return new Response(JSON.stringify({ prompt: promptText.trim() }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (error) {
    console.error("analyze-video-movements error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
