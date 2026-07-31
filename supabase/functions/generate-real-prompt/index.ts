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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GOOGLE_API_KEY = Deno.env.get("GOOGLE_API_KEY");
    if (!GOOGLE_API_KEY) throw new Error("Google API key not configured");

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

    // Enforce 5 daily limit except admin
    const adminEmails = ["jpnogueiraz@gmail.com", "contaafiliados@gmail.com", "enmanuelemperdomo.bra@gmail.com", "contatiktkshop@gmail.com", "dudu@gmail.com"];
    if (!adminEmails.includes((userEmail || "").toLowerCase())) {
      const today = new Date(); today.setUTCHours(0, 0, 0, 0);
      const { count, error: countError } = await supabaseClient
        .from("growth_usage").select("*", { count: "exact", head: true })
        .eq("user_id", userId).eq("type", "real_prompt")
        .gte("created_at", today.toISOString());
      if (countError) console.error("Error checking limits:", countError);
      else if (count !== null && count >= 5) {
        return new Response(JSON.stringify({ error: "Você atingiu o limite diário de 5 gerações na aba Prompts Reais." }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
    }

    const body = await req.json();
    const {
      description,       // movement text (optional)
      videoUrl,          // movement video URL (optional)
      outfitImageUrl,    // outfit image URL (optional)
      personaDescription, // persona text description (optional)
      personaImageUrl,   // persona image URL (optional)
      scenario,          // scene/background text (optional)
    } = body;

    if (!description && !videoUrl) {
      return new Response(JSON.stringify({ error: "Informe os movimentos em texto ou envie um vídeo." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    console.log("generate-real-prompt for user:", userId);

    // ── Helper: fetch image URL → base64 inline part ──────────────────────
    const fetchInlineImage = async (url: string): Promise<{ inlineData: { mimeType: string; data: string } } | null> => {
      try {
        const res = await fetch(url);
        if (!res.ok) return null;
        const buf = await res.arrayBuffer();
        const mime = res.headers.get("content-type") || "image/jpeg";
        const base64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
        return { inlineData: { mimeType: mime, data: base64 } };
      } catch (e) {
        console.warn("Failed to fetch image:", url, e);
        return null;
      }
    };

    // ── If videoUrl: extract movements via Gemini File API ────────────────
    let extractedMovements: string | null = null;

    if (videoUrl) {
      console.log("Fetching movement video:", videoUrl);
      const videoRes = await fetch(videoUrl);
      if (!videoRes.ok) throw new Error("Falha ao buscar o vídeo de movimentos");
      const videoBuffer = await videoRes.arrayBuffer();
      const sizeBytes = videoBuffer.byteLength;
      const mimeType = videoRes.headers.get("content-type") || "video/mp4";

      // Upload to Gemini File API
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
      if (!uploadRes.ok) throw new Error("Erro ao fazer upload do vídeo para a IA");
      const uploadData = await uploadRes.json();
      const fileUri = uploadData.file?.uri;
      const fileName = uploadData.file?.name;
      if (!fileUri || !fileName) throw new Error("Falha ao obter URI do vídeo");

      // Poll until ACTIVE
      let isReady = false; let attempts = 0;
      while (!isReady && attempts < 10) {
        const checkRes = await fetchWithTimeout(`https://generativelanguage.googleapis.com/v1beta/${fileName}?key=${GOOGLE_API_KEY}`, {}, 10000);
        if (!checkRes.ok) break;
        const fileData = await checkRes.json();
        if (fileData.state === "ACTIVE") { isReady = true; }
        else if (fileData.state === "FAILED") throw new Error("Processamento do vídeo falhou");
        else { await new Promise(r => setTimeout(r, 2000)); attempts++; }
      }
      if (!isReady) throw new Error("Tempo esgotado ao processar vídeo. Tente um vídeo menor.");

      // Extract movements
      const movRes = await fetchWithTimeout(`${API_BASE}/${MODEL}:generateContent?key=${GOOGLE_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: `You are an expert at analyzing video movements. Watch this video and describe in detail ALL the physical movements, gestures, facial expressions, and body language of the main character. Focus on: head movements, hand gestures, body posture changes, eye direction, facial expressions, and movement timing. Be very specific and detailed. Output in English as a structured paragraph. Do NOT describe clothing or background.` }] },
          contents: [{ role: "user", parts: [{ fileData: { fileUri, mimeType } }, { text: "Describe all the movements and expressions of the main character in this video." }] }],
        }),
      });
      const movData = await movRes.json();
      extractedMovements = movData.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;

      // Cleanup video
      try {
        await fetch(`https://generativelanguage.googleapis.com/v1beta/${fileName}?key=${GOOGLE_API_KEY}`, { method: "DELETE" });
      } catch { /* ignore */ }
    }

    // ── Fetch inline images ───────────────────────────────────────────────
    const [outfitPart, personaPart] = await Promise.all([
      outfitImageUrl ? fetchInlineImage(outfitImageUrl) : Promise.resolve(null),
      personaImageUrl ? fetchInlineImage(personaImageUrl) : Promise.resolve(null),
    ]);

    // ── Build system prompt ───────────────────────────────────────────────
    const systemPrompt = `You are a world-class AI video prompt engineer, specializing in creating complete cinematic prompts for video generation models (like Kling, Luma, Runway, etc.).

You will receive information about: character, outfit, movements, and scene. Your task is to produce output in EXACTLY this Markdown format:

### Prompts para Imagens (Cena por Cena)

**Cena 1:**
> "Breve descrição em português. MÁXIMO 20 PALAVRAS."

**Cena 2:**
> "Breve descrição em português. MÁXIMO 20 PALAVRAS."

[IMPORTANT: CREATE EXACTLY 2 SCENES. NEVER MORE. KEEP SCENE DESCRIPTIONS EXTREMELY SHORT AND TELEGRAPHIC IN PORTUGUESE.]

### Prompt para Vídeo

**Prompt do Vídeo:**
> "[Write the FULL video prompt HERE in ENGLISH. This prompt will be pasted directly into video generation tools.]"

RULES FOR THE VIDEO PROMPT:
1. Write ENTIRELY in English.
2. Describe the overall cinematic style, camera setting, lighting, and mood naturally.
3. Then describe the subject briefly (gender, approximate age, hair, expression — NO names), based on the CHARACTER and OUTFIT inputs.
4. Then describe ALL movements from the MOVEMENTS input in chronological order with natural timing and speed.
5. Then describe the SCENE/BACKGROUND if provided.
6. The video prompt MUST be between 80 and 120 words. Be descriptive but not verbose.
7. Do NOT use any formatting, bullet points, or line breaks inside the video prompt — it must be a single flowing paragraph.

STRICT CONTENT SAFETY RULES (violations will cause rejection):
- NEVER use words like: revealing, tight, low-cut, bikini, underwear, lingerie, nude, sheer, transparent, topless, sexy, seductive.
- NEVER mention tattoos, piercings, or body marks.
- NEVER describe body parts in a sexualized way.
- For clothing: use only conservative, respectful descriptions.
- Keep character descriptions professional.

CRITICAL OUTPUT RULES:
- The image scene prompts (Cena 1, Cena 2) MUST be in PORTUGUESE.
- The video prompt MUST be in ENGLISH.
- Output ONLY the requested format. No introductions, no filler.`;

    // ── Build user message ────────────────────────────────────────────────
    const inputSections: string[] = [];

    if (personaDescription) inputSections.push(`CHARACTER: ${personaDescription}`);
    if (outfitPart) inputSections.push(`OUTFIT: [See outfit image provided]`);
    else if (!outfitPart && outfitImageUrl) inputSections.push(`OUTFIT: A stylish outfit (image unavailable, describe generically)`);

    const movementsText = extractedMovements || description;
    inputSections.push(`MOVEMENTS: ${movementsText}`);

    if (scenario) inputSections.push(`SCENE/BACKGROUND: ${scenario}`);

    const userMessage = `Create a complete video generation prompt combining ALL these elements:\n\n${inputSections.join("\n\n")}`;

    // Build parts array
    const userParts: object[] = [];
    if (personaPart) userParts.push(personaPart);
    if (outfitPart) userParts.push(outfitPart);
    userParts.push({ text: userMessage });

    // ── Generate final prompt ─────────────────────────────────────────────
    const genRes = await fetchWithTimeout(`${API_BASE}/${MODEL}:generateContent?key=${GOOGLE_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: "user", parts: userParts }],
      }),
    });

    if (!genRes.ok) {
      if (genRes.status === 429) {
        return new Response(JSON.stringify({ error: "Muitas requisições. Aguarde alguns segundos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const errText = await genRes.text();
      console.error("Google API error:", genRes.status, errText);
      throw new Error("Erro ao gerar prompt");
    }

    const genData = await genRes.json();
    const prompt = genData.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!prompt) throw new Error("Nenhum prompt gerado");

    // Record usage
    await supabaseClient.from("growth_usage").insert({ user_id: userId, type: "real_prompt" });

    console.log("Complete prompt generated successfully");
    return new Response(JSON.stringify({ prompt }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("generate-real-prompt error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
