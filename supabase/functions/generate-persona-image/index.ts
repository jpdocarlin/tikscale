import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MODEL = "gemini-2.0-flash-exp-image-generation";
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

    const { description, referenceImageUrl } = await req.json();
    if (!description && !referenceImageUrl) {
      return new Response(JSON.stringify({ error: "Descrição ou imagem de referência é obrigatória" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    console.log("Generating persona for user:", userData.user.id, "ref:", !!referenceImageUrl);

    const parts: any[] = [];

    if (referenceImageUrl) {
      parts.push({ text: `IDENTITY PRESERVATION - HIGHEST PRIORITY:
The attached image shows a REAL person. Generate a FULL-BODY portrait of THIS EXACT SAME PERSON.

MANDATORY: Replicate EXACT facial structure, skin tone, features, hair. The person MUST be immediately recognizable.
Show complete person head to feet, natural relaxed pose, casual modern clothes, clean neutral background, natural studio light, genuine smile, professional fashion photography, Shot on iPhone aesthetic, vertical 9:16.

DO NOT: Create cartoons/illustrations/anime/3D, add watermarks/text, create multiple people, change face/ethnicity, overly airbrushed skin.` });

      if (referenceImageUrl.startsWith("data:")) {
        const m = referenceImageUrl.match(/^data:([^;]+);base64,(.+)$/);
        if (m) parts.push({ inlineData: { mimeType: m[1], data: m[2] } });
      } else {
        try {
          const r = await fetch(referenceImageUrl);
          if (r.ok) {
            const buf = await r.arrayBuffer();
            const b64 = btoa(new Uint8Array(buf).reduce((d, b) => d + String.fromCharCode(b), ""));
            parts.push({ inlineData: { mimeType: r.headers.get("content-type") || "image/jpeg", data: b64 } });
          }
        } catch (e) { console.warn("Failed to fetch ref image:", e); }
      }
    } else {
      parts.push({ text: `Generate a PHOTOREALISTIC full-body portrait of a ${description}.
AUTHENTIC smartphone photo (Shot on iPhone), real human with natural skin, natural lighting, standing natural pose, clean neutral background, full body head to feet, casual modern clothes, genuine smile, high resolution, professional fashion photography.
Vertical portrait 9:16, full body shot.
DO NOT: Create cartoons/illustrations/anime/3D, add watermarks/text, create multiple people, unrealistic lighting, overly airbrushed skin.` });
    }

    const response = await fetch(`${API_BASE}/${MODEL}:generateContent?key=${GOOGLE_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts }],
        generationConfig: { responseModalities: ["TEXT", "IMAGE"] },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Google API error:", response.status, errorText);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Muitas requisições. Aguarde 30 segundos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      return new Response(JSON.stringify({ error: "Erro ao gerar imagem." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const data = await response.json();
    let imageUrl: string | null = null;
    const rParts = data.candidates?.[0]?.content?.parts;
    if (rParts) {
      for (const p of rParts) {
        if (p.inlineData?.data) {
          imageUrl = `data:${p.inlineData.mimeType || "image/png"};base64,${p.inlineData.data}`;
          break;
        }
      }
    }

    if (!imageUrl) {
      console.error("No image in response:", JSON.stringify(data));
      return new Response(JSON.stringify({ error: "Nenhuma imagem gerada. Tente novamente." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    console.log("Persona generated successfully via Google Gemini API");
    return new Response(JSON.stringify({ success: true, imageUrl }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
