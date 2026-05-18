import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Imagen 4 for pure text-to-image, Gemini 3 Pro Image for reference-based
const IMAGEN_MODEL = "imagen-4.0-generate-001";
const GEMINI_IMAGE_MODEL = "gemini-2.5-flash-image";
const API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

interface GenerateImageRequest {
  productName: string;
  productImageUrl?: string;
  influencer: { name: string; description: string; imageUrl?: string; };
  pose: string;
  customPose?: string;
  environment: string;
  customEnvironment?: string;
  style: string;
  enhancements: string[];
  aspectRatio: string;
  additionalInfo?: string;
  scenarioImageUrl?: string;
}

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

    const requestData: GenerateImageRequest = await req.json();
    console.log("Generating UGC image for:", requestData.productName);

    // Backward compatibility for old cached frontend payloads
    const flatData = requestData as any;
    const fallbackInfluencerImageUrl = flatData.influencerImageUrl || flatData.influencerImageBase64;
    const fallbackProductImageUrl = flatData.productImageBase64;

    if (!requestData.influencer) {
      requestData.influencer = {
        name: "",
        description: flatData.influencerDescription || "",
        imageUrl: fallbackInfluencerImageUrl
      };
    } else if (!requestData.influencer.imageUrl && fallbackInfluencerImageUrl) {
      requestData.influencer.imageUrl = fallbackInfluencerImageUrl;
    }

    if (!requestData.productImageUrl && fallbackProductImageUrl) {
      requestData.productImageUrl = fallbackProductImageUrl;
    }

    // Normalize enhancements: accept both string and array
    if (typeof requestData.enhancements === 'string') {
      requestData.enhancements = (requestData.enhancements as string).split(',').map(s => s.trim()).filter(Boolean);
    }
    if (!Array.isArray(requestData.enhancements)) {
      requestData.enhancements = [];
    }

    const hasReferenceImages = !!(requestData.influencer?.imageUrl || requestData.productImageUrl || requestData.scenarioImageUrl);

    // Build prompt
    const poseDesc = requestData.customPose || getPoseDescription(requestData.pose);
    const envDesc = requestData.customEnvironment || getEnvironmentDescription(requestData.environment);
    const styleDesc = getStyleDescription(requestData.style);
    const enhDesc = requestData.enhancements.map(e => getEnhancementDescription(e)).filter(Boolean).join(", ");

    const prompt = buildImagePrompt({
      productName: requestData.productName,
      influencer: requestData.influencer,
      pose: poseDesc,
      poseType: requestData.pose,
      environment: envDesc,
      style: styleDesc,
      enhancements: enhDesc,
      aspectRatio: requestData.aspectRatio,
      additionalInfo: requestData.additionalInfo,
      hasProductImage: !!requestData.productImageUrl,
    });

    let imageUrl: string | null = null;

    if (hasReferenceImages) {
      // Use Gemini generateContent for reference-based generation
      const parts: any[] = [];
      let textContent = prompt;

      if (requestData.productImageUrl) {
        if (requestData.pose === "wearing") {
          textContent += `\n\nPRODUCT REPLICATION — ABSOLUTE HIGHEST PRIORITY:
One of the attached images shows the EXACT clothing/fashion item. The person MUST BE WEARING this EXACT item.
- Replicate EVERY detail: exact colors, exact patterns, exact fabric texture, exact stitching, exact logos, exact labels.
- Do NOT change, simplify, or reinterpret ANY aspect of the clothing. It must be a PIXEL-PERFECT match.
- Show ONLY ONE single piece — do NOT duplicate it. Hands must be EMPTY.
- The viewer must be able to identify this as the EXACT SAME product from the reference photo.`;
        } else {
          textContent += `\n\nPRODUCT REPLICATION — ABSOLUTE HIGHEST PRIORITY:
One of the attached images shows the EXACT product that must appear in the generated image.
- The product MUST be an IDENTICAL, PIXEL-PERFECT copy of the reference image.
- Replicate EVERY detail: exact shape, exact colors, exact packaging, exact labels, exact logos, exact text, exact branding, exact proportions.
- Do NOT change, simplify, redesign, or reinterpret ANY aspect of the product.
- The product must look like a PHOTOGRAPH of the real item — same materials, same finish, same reflections.
- If the product has text or logos, reproduce them EXACTLY as shown.
- The viewer must be able to confirm this is the EXACT SAME product from the reference photo.`;
        }
      }

      if (requestData.influencer.imageUrl) {
        textContent += `\n\nFACE REPLICATION - HIGHEST PRIORITY:
The first attached image shows the EXACT person who MUST appear. Replicate EXACT facial structure, skin tone, all unique characteristics. The generated person MUST be immediately recognizable as the SAME person.`;
      }

      if (requestData.scenarioImageUrl) {
        textContent += "\n\nIMPORTANT: Place the person naturally inside the real environment shown in the background photo. Match lighting, perspective and shadows.";
      }

      parts.push({ text: textContent });

      // Add reference images as inlineData
      const imageUrls = [
        requestData.influencer.imageUrl,
        requestData.productImageUrl,
        requestData.scenarioImageUrl,
      ].filter(Boolean) as string[];

      for (const imgUrl of imageUrls) {
        const inlineData = await urlToInlineData(imgUrl);
        if (inlineData) parts.push({ inlineData });
      }

      const response = await fetch(`${API_BASE}/${GEMINI_IMAGE_MODEL}:generateContent?key=${GOOGLE_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts }],
          generationConfig: { responseModalities: ["TEXT", "IMAGE"] },
        }),
      });

      if (!response.ok) {
        return handleApiError(response);
      }

      const data = await response.json();
      imageUrl = extractImageFromGeminiResponse(data);

    } else {
      // Try Imagen 4 first, fallback to Gemini Flash Image
      const aspectMap: Record<string, string> = {
        "9:16": "9:16", "1:1": "1:1", "3:4": "3:4", "16:9": "16:9"
      };

      const response = await fetch(`${API_BASE}/${IMAGEN_MODEL}:predict?key=${GOOGLE_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instances: [{ prompt }],
          parameters: {
            sampleCount: 1,
            aspectRatio: aspectMap[requestData.aspectRatio] || "9:16",
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
        // Imagen 4 failed (quota/credits), fallback to Gemini Flash Image
        console.warn("Imagen 4 failed with status", response.status, "- falling back to Gemini Flash Image");
        const fallbackResponse = await fetch(`${API_BASE}/${GEMINI_IMAGE_MODEL}:generateContent?key=${GOOGLE_API_KEY}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: { responseModalities: ["TEXT", "IMAGE"] },
          }),
        });

        if (!fallbackResponse.ok) {
          return handleApiError(fallbackResponse);
        }

        const fallbackData = await fallbackResponse.json();
        imageUrl = extractImageFromGeminiResponse(fallbackData);
      }
    }

    if (!imageUrl) {
      return new Response(JSON.stringify({ error: "Nenhuma imagem gerada. Tente novamente." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    console.log("Image generated successfully via Google API");
    return new Response(JSON.stringify({ success: true, imageUrl, prompt }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (error) {
    console.error("Error generating image:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});

// --- Helper functions ---

async function handleApiError(response: Response) {
  const errorText = await response.text();
  console.error("Google API error:", response.status, errorText);

  if (response.status === 429) {
    return new Response(JSON.stringify({ error: "Muitas requisições. Aguarde 30 segundos.", code: "RATE_LIMIT" }),
      { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
  if (response.status === 402 || response.status === 403) {
    return new Response(JSON.stringify({ error: "Limite de uso atingido ou API key inválida.", code: "CREDIT_LIMIT" }),
      { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
  return new Response(JSON.stringify({ error: "Erro ao gerar imagem. Tente novamente.", code: "UNKNOWN" }),
    { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}

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

async function urlToInlineData(imageUrl: string): Promise<{ mimeType: string; data: string } | null> {
  try {
    if (imageUrl.startsWith("data:")) {
      const m = imageUrl.match(/^data:([^;]+);base64,(.+)$/);
      if (m) return { mimeType: m[1], data: m[2] };
      return null;
    }
    const r = await fetch(imageUrl);
    if (!r.ok) return null;
    const buf = await r.arrayBuffer();
    const b64 = btoa(new Uint8Array(buf).reduce((d, b) => d + String.fromCharCode(b), ""));
    return { mimeType: r.headers.get("content-type") || "image/jpeg", data: b64 };
  } catch (e) {
    console.warn("Failed to convert image:", e);
    return null;
  }
}

function getPoseDescription(pose: string): string {
  const poses: Record<string, string> = {
    "frontal": "facing the camera directly, showing the product to the viewer",
    "selfie": "taking a selfie while holding the product, casual social media style",
    "hands": "close-up of hands holding and presenting the product, first-person POV",
    "wearing": "wearing the product on their body as clothing, modeling the outfit naturally"
  };
  return poses[pose] || poses["frontal"];
}

function getEnvironmentDescription(env: string): string {
  const environments: Record<string, string> = {
    "casa": "in a cozy home living room with natural window light and modern decor",
    "estudio": "in a professional photo studio with soft lighting and neutral backdrop",
    "ar-livre": "outdoors in a beautiful natural setting with soft sunlight",
    "academia": "in a modern gym environment with fitness equipment visible",
    "cozinha": "in a modern kitchen with clean countertops and natural light",
    "cenario-real": "in the real environment shown in the attached background photo",
    "outros": "in a clean, well-lit neutral environment"
  };
  return environments[env] || environments["casa"];
}

function getStyleDescription(style: string): string {
  const styles: Record<string, string> = {
    "casual": "wearing casual everyday clothes, relaxed and approachable vibe",
    "profissional": "wearing professional business attire, polished and trustworthy",
    "esportivo": "wearing athletic/sportswear, energetic and healthy appearance",
    "glamouroso": "wearing elegant glamorous outfit, luxurious and sophisticated look",
    "minimalista": "wearing simple minimalist clothing, clean and refined aesthetic"
  };
  return styles[style] || styles["casual"];
}

function getEnhancementDescription(enhancement: string): string {
  const enhancements: Record<string, string> = {
    "pele-realista": "ultra realistic skin texture with natural pores and imperfections",
    "iluminacao-natural": "beautiful natural soft lighting with subtle shadows",
    "realismo-detalhamento": "photorealistic details, 8K quality, ultra sharp",
    "cores-vibrantes": "vibrant saturated colors that pop",
    "profundidade-campo": "shallow depth of field with beautiful bokeh background blur",
    "maos-perfeitas": "anatomically correct and natural-looking hands with five fingers"
  };
  return enhancements[enhancement] || "";
}

function buildImagePrompt(params: {
  productName: string;
  influencer: { name: string; description: string };
  pose: string;
  poseType?: string;
  environment: string;
  style: string;
  enhancements: string;
  aspectRatio: string;
  additionalInfo?: string;
  hasProductImage?: boolean;
}): string {
  const arText: Record<string, string> = {
    "9:16": "vertical portrait (9:16 for TikTok/Reels/Stories)",
    "1:1": "square (1:1 for Instagram feed)",
    "3:4": "portrait (3:4 for Pinterest/Posts)",
    "16:9": "horizontal landscape (16:9 for YouTube thumbnails)"
  };
  const aspectRatioText = arText[params.aspectRatio] || "vertical portrait";
  const handsOnly = params.poseType === "hands";
  const wearing = params.poseType === "wearing";

  const productRef = params.hasProductImage
    ? `the EXACT item shown in the reference image (DO NOT generate a generic box, DO NOT generate text labels, replicate the reference image EXACTLY)`
    : `"${params.productName}"`;

  const influencerDesc = params.influencer.description.includes("persona salva") || !params.influencer.description.trim()
    ? "a highly detailed real person"
    : `a real Brazilian person: ${params.influencer.description}`;

  let prompt: string;

  if (handsOnly) {
    prompt = `ULTRA-REALISTIC PHOTOGRAPH, 8k resolution, DSLR camera, sharp focus. Close-up of HANDS ONLY holding ${productRef}. First-person POV, ${params.environment}. NO face/body visible. Product clearly visible, authentic natural hands with skin texture and pores. Professional UGC aesthetic.`;
  } else if (wearing) {
    prompt = `ULTRA-REALISTIC PHOTOGRAPH, 8k resolution, raw DSLR photo. Image of ${influencerDesc}. WEARING ${productRef} as clothing. ${params.environment}. Show ONLY ONE garment, hands EMPTY. Natural authentic pose, genuine expression, highly detailed skin texture, pores, cinematic lighting. Face CLEARLY VISIBLE. Professional fashion UGC aesthetic.`;
  } else {
    prompt = `ULTRA-REALISTIC PHOTOGRAPH, 8k resolution, raw DSLR photo. Image of ${influencerDesc}. ${params.pose}. ${params.environment}. Clothing: ${params.style}. HOLDING ${productRef} at chest level. Product clearly visible. Face CLEARLY VISIBLE, genuine smile, authentic natural skin texture, highly detailed eyes. Professional UGC aesthetic.`;
  }

  if (params.enhancements) prompt += ` Quality: ${params.enhancements}.`;
  if (params.additionalInfo) prompt += ` Extra: ${params.additionalInfo}`;
  prompt += ` Ensure the composition perfectly fits a ${aspectRatioText} format. DO NOT: Create cartoons/illustrations/anime/3D/CGI, no plastic skin, no watermarks, no text, no phone frames. Must look like a real unfiltered photo.`;

  return prompt;
}