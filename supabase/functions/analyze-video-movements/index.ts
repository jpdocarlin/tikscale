import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MODEL = "gemini-2.0-flash";
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

    const { videoUrl, context } = await req.json();
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
    const uploadRes = await fetch(`${UPLOAD_BASE}?uploadType=media&key=${GOOGLE_API_KEY}`, {
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
    while (!isReady && attempts < 15) {
      const checkRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/${fileName}?key=${GOOGLE_API_KEY}`);
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

    // 4. Generate Content
    let systemInstruction = `You are a master AI video prompt engineer. Analyze the provided video and extract the EXACT physical movements to create a perfect motion prompt for video generation models (like Luma, Kling, Sora, or Runway).
Follow these rules strictly:
1. Focus ONLY on the subject's movements, gestures, facial expressions, body language, and the camera movement.
2. DO NOT describe the subject's clothing, outfits, colors of clothing, or any apparel under any circumstances. Focus purely on the mechanics of the body: head, hands, feet, waist, and full body motion.
3. Describe the temporal progression (e.g., "The video starts with... then... finally...").
4. Be highly specific about the speed of movement (e.g., slow motion, rapid, sudden, smooth, fluid).
5. Detail exactly what the hands, head, and eyes are doing.
6. Provide the entire description ONLY in English as a single, highly detailed, coherent paragraph.
7. DO NOT include any introductory text, conversational filler, or subjective opinions. Start directly with the description.`;
    
    if (context && context.trim().length > 0) {
      systemInstruction += `\n\nAdditional user instructions to incorporate into the final prompt: ${context}`;
    }

    const genRes = await fetch(`${API_BASE}/${MODEL}:generateContent?key=${GOOGLE_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemInstruction }] },
        contents: [
          {
            role: "user",
            parts: [
              { fileData: { fileUri, mimeType } },
              { text: "Generate the English movement prompt based on this video." }
            ]
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
