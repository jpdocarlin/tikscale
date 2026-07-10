import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const upload = multer({
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("CRITICAL: Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables!");
}

const supabase = createClient(SUPABASE_URL || '', SUPABASE_ANON_KEY || '');

function getGoogleApiKey() {
  const key = process.env.GOOGLE_API_KEY;
  if (!key) {
    throw new Error("GOOGLE_API_KEY environment variable not configured on backend.");
  }
  return key;
}

// Auth Middleware
async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Não autorizado. Cabeçalho de autorização ausente.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ error: 'Sessão inválida ou expirada.' });
    }
    req.user = user;
    next();
  } catch (err) {
    console.error("Auth error:", err);
    return res.status(401).json({ error: 'Erro de autenticação.' });
  }
}

// Helpers
async function fetchWithTimeout(url, options = {}, timeoutMs = 50000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('A requisição à IA excedeu o tempo limite no servidor. Tente novamente.');
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const len = bytes.byteLength;
  const chunkSize = 8192;
  for (let i = 0; i < len; i += chunkSize) {
    const chunk = bytes.subarray(i, Math.min(i + chunkSize, len));
    binary += String.fromCharCode.apply(null, chunk);
  }
  return btoa(binary);
}

async function urlToInlineData(imageUrl) {
  try {
    if (imageUrl.startsWith("data:")) {
      const m = imageUrl.match(/^data:([^;]+);base64,(.+)$/);
      if (m) return { mimeType: m[1], data: m[2] };
      return null;
    }
    const r = await fetch(imageUrl);
    if (!r.ok) return null;
    const buf = await r.arrayBuffer();
    return {
      mimeType: r.headers.get("content-type") || "image/jpeg",
      data: arrayBufferToBase64(buf)
    };
  } catch (e) {
    console.warn("Failed to convert image:", e);
    return null;
  }
}

function extractImageFromGeminiResponse(data) {
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

// Gemini File upload helper
async function uploadToGemini(buffer, mimeType) {
  const apiKey = getGoogleApiKey();
  const sizeBytes = buffer.byteLength;

  const uploadRes = await fetchWithTimeout(`https://generativelanguage.googleapis.com/upload/v1beta/files?uploadType=media&key=${apiKey}`, {
    method: "POST",
    headers: {
      "X-Goog-Upload-Command": "start, upload",
      "X-Goog-Upload-Header-Content-Length": sizeBytes.toString(),
      "X-Goog-Upload-Header-Content-Type": mimeType,
      "Content-Type": mimeType,
    },
    body: buffer,
  }, 60000);

  if (!uploadRes.ok) {
    const errText = await uploadRes.text();
    throw new Error(`Erro ao fazer upload do arquivo para a IA: ${errText}`);
  }

  const uploadData = await uploadRes.json();
  const fileUri = uploadData.file?.uri;
  const fileName = uploadData.file?.name;

  if (!fileUri || !fileName) {
    throw new Error("Falha ao obter URI do arquivo");
  }

  // Poll until active
  let isReady = false;
  let attempts = 0;
  while (!isReady && attempts < 15) {
    const checkRes = await fetchWithTimeout(`https://generativelanguage.googleapis.com/v1beta/${fileName}?key=${apiKey}`, {}, 10000);
    if (!checkRes.ok) break;
    const fileData = await checkRes.json();
    if (fileData.state === "ACTIVE") {
      isReady = true;
    } else if (fileData.state === "FAILED") {
      throw new Error("Processamento do arquivo falhou na IA");
    } else {
      await new Promise(r => setTimeout(r, 2000));
      attempts++;
    }
  }

  if (!isReady) {
    throw new Error("Tempo esgotado ao processar arquivo na IA.");
  }

  return { fileUri, fileName, mimeType };
}

async function deleteGeminiFile(fileName) {
  const apiKey = getGoogleApiKey();
  try {
    await fetch(`https://generativelanguage.googleapis.com/v1beta/${fileName}?key=${apiKey}`, { method: "DELETE" });
  } catch (e) {
    console.warn("Failed to delete video from Gemini", e);
  }
}

// 1. Generate Persona Image Endpoint
app.post('/api/generate-persona-image', requireAuth, async (req, res) => {
  try {
    const apiKey = getGoogleApiKey();
    const { description, referenceImageUrl } = req.body;
    const parts = [];

    if (referenceImageUrl) {
      parts.push({
        text: `IDENTITY PRESERVATION - HIGHEST PRIORITY:
The attached image shows a REAL person. Generate a FULL-BODY portrait of THIS EXACT SAME PERSON.

MANDATORY: Replicate EXACT facial structure, skin tone, features, hair. The person MUST be immediately recognizable.
Show complete person head to feet, natural relaxed pose, casual modern clothes, clean neutral background, natural studio light, genuine smile, professional fashion photography, Shot on iPhone aesthetic, vertical 9:16.

DO NOT: Create cartoons/illustrations/anime/3D, add watermarks/text, create multiple people, change face/ethnicity, overly airbrushed skin.`
      });

      const inlineData = await urlToInlineData(referenceImageUrl);
      if (inlineData) {
        parts.push({ inlineData });
      }
    } else {
      parts.push({
        text: `Generate a PHOTOREALISTIC full-body portrait of a ${description}.
AUTHENTIC smartphone photo (Shot on iPhone), real human with natural skin, natural lighting, standing natural pose, clean neutral background, full body head to feet, casual modern clothes, genuine smile, high resolution, professional fashion photography.
Vertical portrait 9:16, full body shot.
DO NOT: Create cartoons/illustrations/anime/3D, add watermarks/text, create multiple people, unrealistic lighting, overly airbrushed skin.`
      });
    }

    const response = await fetch(`${API_BASE}/gemini-2.5-flash-image:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts }],
        generationConfig: { responseModalities: ["TEXT", "IMAGE"] },
      })
    });

    if (!response.ok) {
      if (response.status === 429) {
        return res.status(429).json({ error: "Muitas requisições. Aguarde 30 segundos." });
      }
      const errTxt = await response.text();
      console.error("Gemini Error:", response.status, errTxt);
      return res.status(500).json({ error: "Erro ao gerar imagem de persona." });
    }

    const data = await response.json();
    const imageUrl = extractImageFromGeminiResponse(data);

    if (!imageUrl) {
      return res.status(500).json({ error: "Nenhuma imagem gerada. Tente novamente." });
    }

    return res.json({ success: true, imageUrl });
  } catch (error) {
    console.error("generate-persona-image error:", error);
    return res.status(500).json({ error: error.message });
  }
});

// Helper descriptions for UGC Image
const API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";
const IMAGEN_MODEL = "imagen-4.0-generate-001";
const GEMINI_IMAGE_MODEL = "gemini-2.5-flash-image";
const GEMINI_TEXT_MODEL = "gemini-2.5-flash";

function getPoseDescription(pose) {
  const poses = {
    "frontal": "facing the camera directly, showing the product to the viewer",
    "selfie": "taking a selfie while holding the product, casual social media style",
    "hands": "close-up of hands holding and presenting the product, first-person POV",
    "wearing": "wearing the product on their body as clothing, modeling the outfit naturally"
  };
  return poses[pose] || poses["frontal"];
}

function getEnvironmentDescription(env) {
  const environments = {
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

function getStyleDescription(style) {
  const styles = {
    "casual": "wearing casual everyday clothes, relaxed and approachable vibe",
    "profissional": "wearing professional business attire, polished and trustworthy",
    "esportivo": "wearing athletic/sportswear, energetic and healthy appearance",
    "glamouroso": "wearing elegant glamorous outfit, luxurious and sophisticated look",
    "minimalista": "wearing simple minimalist clothing, clean and refined aesthetic"
  };
  return styles[style] || styles["casual"];
}

function getEnhancementDescription(enhancement) {
  const enhancements = {
    "pele-realista": "ultra realistic skin texture with natural pores and imperfections",
    "iluminacao-natural": "beautiful natural soft lighting with subtle shadows",
    "realismo-detalhamento": "photorealistic details, 8K quality, ultra sharp",
    "cores-vibrantes": "vibrant saturated colors that pop",
    "profundidade-campo": "shallow depth of field with beautiful bokeh background blur",
    "maos-perfeitas": "anatomically correct and natural-looking hands with five fingers"
  };
  return enhancements[enhancement] || "";
}

function buildImagePrompt(params) {
  const arText = {
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

  let prompt;

  if (handsOnly) {
    prompt = `ULTRA-REALISTIC PHOTOGRAPH, 8k resolution, DSLR camera, sharp focus. Close-up of HANDS ONLY holding ${productRef}. First-person POV, ${params.environment}. NO face/body visible. Product clearly visible, authentic natural hands with skin texture and pores. Professional UGC aesthetic.`;
  } else if (wearing) {
    prompt = `ULTRA-REALISTIC PHOTOGRAPH, 8k resolution, raw DSLR photo. Virtual try-on / clothing swap: The PERSON is ${influencerDesc} (see INFLUENCER REFERENCE IMAGE — use this person's face and body). The GARMENT to wear is shown in the PRODUCT REFERENCE IMAGE (ignore any model/person visible in that product photo — extract only the clothing item). Dress the influencer person in that exact garment. Reproduce the garment with perfect accuracy: same color, pattern, texture, cut, logos. ${params.environment}. The influencer's face must be clearly visible and recognizable. Natural authentic pose. Cinematic lighting, highly detailed skin texture. Professional fashion UGC aesthetic.`;
  } else {
    prompt = `ULTRA-REALISTIC PHOTOGRAPH, 8k resolution, raw DSLR photo. Image of ${influencerDesc}. ${params.pose}. ${params.environment}. Clothing: ${params.style}. HOLDING ${productRef} at chest level. Product clearly visible. Face CLEARLY VISIBLE, genuine smile, authentic natural skin texture, highly detailed eyes. Professional UGC aesthetic.`;
  }

  if (params.enhancements) prompt += ` Quality: ${params.enhancements}.`;
  if (params.additionalInfo) prompt += ` Extra: ${params.additionalInfo}`;
  prompt += ` Ensure the composition perfectly fits a ${aspectRatioText} format. DO NOT: Create cartoons/illustrations/anime/3D/CGI, no plastic skin, no watermarks, no text, no phone frames. Must look like a real unfiltered photo.`;

  return prompt;
}

// 2. Generate UGC Image Endpoint
app.post('/api/generate-ugc-image', requireAuth, async (req, res) => {
  try {
    const apiKey = getGoogleApiKey();
    const requestData = req.body;

    let normalizedEnhancements = requestData.enhancements;
    if (typeof normalizedEnhancements === 'string') {
      normalizedEnhancements = normalizedEnhancements.split(',').map(s => s.trim()).filter(Boolean);
    }
    if (!Array.isArray(normalizedEnhancements)) {
      normalizedEnhancements = [];
    }

    const hasReferenceImages = !!(requestData.influencer?.imageUrl || requestData.productImageUrl || requestData.scenarioImageUrl);

    const poseDesc = requestData.customPose || getPoseDescription(requestData.pose);
    const envDesc = requestData.customEnvironment || getEnvironmentDescription(requestData.environment);
    const styleDesc = getStyleDescription(requestData.style);
    const enhDesc = normalizedEnhancements.map(e => getEnhancementDescription(e)).filter(Boolean).join(", ");

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

    let imageUrl = null;

    if (hasReferenceImages) {
      if (requestData.pose === "wearing" && requestData.productImageUrl && requestData.influencer.imageUrl) {
        // STEP 1 — Describe garment
        const productInlineData = await urlToInlineData(requestData.productImageUrl);
        let garmentDescription = "";

        if (productInlineData) {
          const describeResponse = await fetchWithTimeout(
            `${API_BASE}/${GEMINI_TEXT_MODEL}:generateContent?key=${apiKey}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [{
                  role: "user",
                  parts: [
                    { text: "Look at this clothing/fashion product image. Describe ONLY the garment item itself in extreme detail for use in an image generation prompt. Include: garment type, exact colors, patterns, fabric texture, cut/silhouette, fit (tight/loose/etc), length, neckline, sleeve type, any logos, prints, embellishments, buttons, zippers, stitching details, and overall style. Do NOT mention any person, model, mannequin or body — describe only the clothing item itself. Output a single dense descriptive paragraph suitable for an image generation prompt. Be very specific and visual." },
                    { inlineData: productInlineData },
                  ],
                }],
                generationConfig: { responseMimeType: "text/plain" },
              }),
            }
          );

          if (describeResponse.ok) {
            const describeData = await describeResponse.json();
            garmentDescription = describeData.candidates?.[0]?.content?.parts
              ?.filter(p => p.text)
              ?.map(p => p.text)
              ?.join(" ")
              ?.trim() || "";
          }
        }

        // STEP 2 — Generate final image
        const influencerInlineData = await urlToInlineData(requestData.influencer.imageUrl);
        const influencerDesc2 = requestData.influencer.description.includes("persona salva") || !requestData.influencer.description.trim()
          ? "the person shown in the reference photo"
          : `the person shown in the reference photo (${requestData.influencer.description})`;

        const garmentText = garmentDescription || `a ${requestData.productName} clothing item`;

        const step2Prompt = `ULTRA-REALISTIC PHOTOGRAPH, 8k resolution, raw DSLR photo. Virtual fashion try-on.

SUBJECT: ${influencerDesc2}. Replicate this person's EXACT face, exact skin tone, exact hair color and style, exact eye color — they are the ONLY person in the image.

OUTFIT: Dress this person in the following clothing item: ${garmentText}. Reproduce this garment faithfully on their body.

SCENE: ${envDesc}. Natural authentic pose. Face clearly visible and recognizable. Genuine expression.
${enhDesc ? `QUALITY: ${enhDesc}.` : ""}
${requestData.additionalInfo ? `EXTRA: ${requestData.additionalInfo}` : ""}

RULES:
- The person MUST match the reference photo provided exactly.
- Reproduce the garment description faithfully on the person's body.
- Do NOT add extra clothing layers. Do NOT change the garment.
- Result must look like a real unfiltered DSLR photograph.
- NO cartoons, NO illustrations, NO watermarks, NO text overlays.
- Composition must fit a ${requestData.aspectRatio} format.`;

        const step2Parts = [{ text: step2Prompt }];
        if (influencerInlineData) {
          step2Parts.push({ text: "=== PERSON REFERENCE IMAGE — replicate this person's face and body exactly ===" });
          step2Parts.push({ inlineData: influencerInlineData });
        }

        const step2Response = await fetchWithTimeout(
          `${API_BASE}/${GEMINI_IMAGE_MODEL}:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ role: "user", parts: step2Parts }],
              generationConfig: { responseModalities: ["TEXT", "IMAGE"] },
            }),
          }
        );

        if (!step2Response.ok) {
          const errTxt = await step2Response.text();
          console.error("Step 2 Gemini Error:", errTxt);
          throw new Error("Erro ao gerar imagem de vestuário.");
        }

        const step2Data = await step2Response.json();
        imageUrl = extractImageFromGeminiResponse(step2Data);
      } else {
        const parts = [];
        let textContent = prompt;

        if (requestData.productImageUrl) {
          textContent += `\n\nPRODUCT REPLICATION — ABSOLUTE HIGHEST PRIORITY:
The FIRST attached image (labeled PRODUCT REFERENCE IMAGE) shows the EXACT product that must appear in the generated image.
- The product MUST be an IDENTICAL, PIXEL-PERFECT copy of the reference image.
- Replicate EVERY detail: exact shape, exact colors, exact packaging, exact labels, exact logos, exact text, exact branding, exact proportions.
- Do NOT change, simplify, redesign, or reinterpret ANY aspect of the product.
- The product must look like a PHOTOGRAPH of the real item — same materials, same finish, same reflections.
- If the product has text or logos, reproduce them EXACTLY as shown.
- The viewer must be able to confirm this is the EXACT SAME product from the reference photo.
- The SECOND attached image (labeled INFLUENCER / PERSON REFERENCE IMAGE) shows the FACE and identity of the person holding the product.`;
        }

        if (requestData.influencer.imageUrl) {
          textContent += `\n\nFACE REPLICATION - HIGHEST PRIORITY:
The image labeled INFLUENCER / PERSON REFERENCE IMAGE shows the EXACT person who MUST appear. Replicate EXACT facial structure, skin tone, hair, and all unique characteristics. The generated person MUST be immediately recognizable as the SAME person from that reference photo.`;
        }

        if (requestData.scenarioImageUrl) {
          textContent += "\n\nIMPORTANT: Place the person naturally inside the real environment shown in the background photo. Match lighting, perspective and shadows.";
        }

        parts.push({ text: textContent });

        if (requestData.productImageUrl) {
          parts.push({ text: "=== PRODUCT REFERENCE IMAGE (replicate this EXACTLY) ===" });
          const inlineData = await urlToInlineData(requestData.productImageUrl);
          if (inlineData) parts.push({ inlineData });
        }

        if (requestData.influencer.imageUrl) {
          parts.push({ text: "=== INFLUENCER / PERSON REFERENCE IMAGE (use this face and identity) ===" });
          const inlineData = await urlToInlineData(requestData.influencer.imageUrl);
          if (inlineData) parts.push({ inlineData });
        }

        if (requestData.scenarioImageUrl) {
          parts.push({ text: "=== BACKGROUND / SCENARIO IMAGE ===" });
          const inlineData = await urlToInlineData(requestData.scenarioImageUrl);
          if (inlineData) parts.push({ inlineData });
        }

        const response = await fetchWithTimeout(
          `${API_BASE}/${GEMINI_IMAGE_MODEL}:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ role: "user", parts }],
              generationConfig: { responseModalities: ["TEXT", "IMAGE"] },
            }),
          }
        );

        if (!response.ok) {
          const errTxt = await response.text();
          console.error("Gemini UGC Error:", errTxt);
          throw new Error("Erro ao gerar imagem UGC.");
        }

        const data = await response.json();
        imageUrl = extractImageFromGeminiResponse(data);
      }
    } else {
      // Pure text-to-image
      const aspectMap = {
        "9:16": "9:16", "1:1": "1:1", "3:4": "3:4", "16:9": "16:9"
      };

      const response = await fetchWithTimeout(
        `${API_BASE}/${IMAGEN_MODEL}:predict?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            instances: [{ prompt }],
            parameters: {
              sampleCount: 1,
              aspectRatio: aspectMap[requestData.aspectRatio] || "9:16",
            },
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const b64 = data.predictions?.[0]?.bytesBase64Encoded;
        if (b64) {
          imageUrl = `data:image/png;base64,${b64}`;
        }
      } else {
        console.warn("Imagen 4 failed - falling back to Gemini Flash Image");
        const fallbackResponse = await fetchWithTimeout(
          `${API_BASE}/${GEMINI_IMAGE_MODEL}:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ role: "user", parts: [{ text: prompt }] }],
              generationConfig: { responseModalities: ["TEXT", "IMAGE"] },
            }),
          }
        );

        if (!fallbackResponse.ok) {
          throw new Error("Erro ao gerar imagem UGC.");
        }

        const fallbackData = await fallbackResponse.json();
        imageUrl = extractImageFromGeminiResponse(fallbackData);
      }
    }

    if (!imageUrl) {
      throw new Error("Nenhuma imagem gerada. Tente novamente.");
    }

    return res.json({ success: true, imageUrl, prompt });
  } catch (error) {
    console.error("generate-ugc-image error:", error);
    return res.status(500).json({ error: error.message });
  }
});

// 3. Generate Real Prompt Endpoint
app.post('/api/generate-real-prompt', requireAuth, upload.fields([{ name: 'video', maxCount: 1 }]), async (req, res) => {
  let uploadedFileName = null;
  try {
    const apiKey = getGoogleApiKey();
    const {
      description,
      outfitImageUrl,
      personaDescription,
      personaImageUrl,
      scenario
    } = req.body;

    let extractedMovements = null;

    // Check if video file is uploaded or videoUrl is sent
    const videoFile = req.files?.['video']?.[0];
    const videoUrl = req.body.videoUrl;

    if (videoFile) {
      const { fileUri, fileName, mimeType } = await uploadToGemini(videoFile.buffer, videoFile.mimetype);
      uploadedFileName = fileName;

      const movRes = await fetchWithTimeout(`${API_BASE}/${GEMINI_TEXT_MODEL}:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: `You are an expert at analyzing video movements. Watch this video and describe in detail ALL the physical movements, gestures, facial expressions, and body language of the main character. Focus on: head movements, hand gestures, body posture changes, eye direction, facial expressions, and movement timing. Be very specific and detailed. Output in English as a structured paragraph. Do NOT describe clothing or background.` }] },
          contents: [{ role: "user", parts: [{ fileData: { fileUri, mimeType } }, { text: "Describe all the movements and expressions of the main character in this video." }] }],
        }),
      });

      if (movRes.ok) {
        const movData = await movRes.json();
        extractedMovements = movData.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
      }
    } else if (videoUrl) {
      // If it's a URL, download it first, then upload to Gemini
      console.log("Fetching video from URL:", videoUrl);
      const videoRes = await fetch(videoUrl);
      if (!videoRes.ok) throw new Error("Falha ao buscar vídeo da URL");
      const videoBuffer = await videoRes.arrayBuffer();
      const mimeType = videoRes.headers.get("content-type") || "video/mp4";

      const { fileUri, fileName } = await uploadToGemini(Buffer.from(videoBuffer), mimeType);
      uploadedFileName = fileName;

      const movRes = await fetchWithTimeout(`${API_BASE}/${GEMINI_TEXT_MODEL}:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: `You are an expert at analyzing video movements. Watch this video and describe in detail ALL the physical movements, gestures, facial expressions, and body language of the main character. Focus on: head movements, hand gestures, body posture changes, eye direction, facial expressions, and movement timing. Be very specific and detailed. Output in English as a structured paragraph. Do NOT describe clothing or background.` }] },
          contents: [{ role: "user", parts: [{ fileData: { fileUri, mimeType } }, { text: "Describe all the movements and expressions of the main character in this video." }] }],
        }),
      });

      if (movRes.ok) {
        const movData = await movRes.json();
        extractedMovements = movData.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
      }
    }

    const [outfitPart, personaPart] = await Promise.all([
      outfitImageUrl ? urlToInlineData(outfitImageUrl) : Promise.resolve(null),
      personaImageUrl ? urlToInlineData(personaImageUrl) : Promise.resolve(null),
    ]);

    const systemPrompt = `You are a world-class AI video prompt engineer, specializing in creating complete cinematic prompts for models like Google Flow (Veo).

You will receive information about: character, outfit, movements, and scene. Your task is to produce output in EXACTLY this Markdown format:

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
3. Then describe the subject briefly (gender, approximate age, hair, expression — NO names), based on the CHARACTER and OUTFIT inputs.
4. Then describe ALL movements from the MOVEMENTS input in chronological order with PRECISE timing and speed.
5. Then describe the SCENE/BACKGROUND if provided.
6. End with camera description: "Static front-facing camera, eye-level, stable framing on the subject."
7. The character does NOT speak — always include: "The subject's mouth remains closed, not speaking, silent throughout."
8. The video prompt MUST be between 80 and 120 words. Be descriptive but not verbose.
9. Do NOT use any formatting, bullet points, or line breaks inside the video prompt — it must be a single flowing paragraph.

STRICT CONTENT SAFETY RULES (violations will cause rejection):
- NEVER use words like: revealing, tight, low-cut, bikini, underwear, lingerie, nude, sheer, transparent, topless, sexy, seductive.
- NEVER mention tattoos, piercings, or body marks.
- NEVER describe body parts in a sexualized way.
- For clothing: use only conservative, respectful descriptions.
- Keep character descriptions professional.

CRITICAL OUTPUT RULES:
- The image scene prompts (Cena 1, Cena 2) MUST be in PORTUGUESE.
- The video prompt (Google Flow) MUST be in ENGLISH.
- Output ONLY the requested format. No introductions, no filler.`;

    const inputSections = [];
    if (personaDescription) inputSections.push(`CHARACTER: ${personaDescription}`);
    if (outfitPart) inputSections.push(`OUTFIT: [See outfit image provided]`);
    else if (outfitImageUrl) inputSections.push(`OUTFIT: A stylish outfit (image unavailable, describe generically)`);

    const movementsText = extractedMovements || description || "";
    inputSections.push(`MOVEMENTS: ${movementsText}`);

    if (scenario) inputSections.push(`SCENE/BACKGROUND: ${scenario}`);

    const userMessage = `Create a complete video generation prompt combining ALL these elements:\n\n${inputSections.join("\n\n")}`;

    const userParts = [];
    if (personaPart) userParts.push(personaPart);
    if (outfitPart) userParts.push(outfitPart);
    userParts.push({ text: userMessage });

    const genRes = await fetchWithTimeout(`${API_BASE}/${GEMINI_TEXT_MODEL}:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: "user", parts: userParts }],
      }),
    });

    if (uploadedFileName) {
      deleteGeminiFile(uploadedFileName);
    }

    if (!genRes.ok) {
      const errTxt = await genRes.text();
      console.error("Gemini Error:", errTxt);
      throw new Error("Erro ao gerar prompt.");
    }

    const genData = await genRes.json();
    const prompt = genData.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!prompt) {
      throw new Error("Nenhum prompt gerado.");
    }

    return res.json({ prompt });
  } catch (error) {
    console.error("generate-real-prompt error:", error);
    if (uploadedFileName) {
      deleteGeminiFile(uploadedFileName);
    }
    return res.status(500).json({ error: error.message });
  }
});

// 4. Analyze Video Movements Endpoint
app.post('/api/analyze-video-movements', requireAuth, upload.single('video'), async (req, res) => {
  let uploadedFileName = null;
  try {
    const apiKey = getGoogleApiKey();
    const { context, outfitImageUrl } = req.body;

    const videoFile = req.file;
    const videoUrl = req.body.videoUrl;
    let fileUri, fileName, mimeType;

    if (videoFile) {
      const result = await uploadToGemini(videoFile.buffer, videoFile.mimetype);
      fileUri = result.fileUri;
      fileName = result.fileName;
      mimeType = result.mimeType;
      uploadedFileName = fileName;
    } else if (videoUrl) {
      console.log("Fetching video for analysis:", videoUrl);
      const videoRes = await fetch(videoUrl);
      if (!videoRes.ok) throw new Error("Falha ao buscar vídeo da URL");
      const videoBuffer = await videoRes.arrayBuffer();
      mimeType = videoRes.headers.get("content-type") || "video/mp4";

      const result = await uploadToGemini(Buffer.from(videoBuffer), mimeType);
      fileUri = result.fileUri;
      fileName = result.fileName;
      mimeType = result.mimeType;
      uploadedFileName = fileName;
    } else {
      return res.status(400).json({ error: "Vídeo ou URL do vídeo é obrigatório" });
    }

    let outfitInlinePart = null;
    if (outfitImageUrl) {
      outfitInlinePart = await urlToInlineData(outfitImageUrl);
    }

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

    const userParts = [
      { fileData: { fileUri, mimeType } },
    ];

    if (outfitInlinePart) {
      userParts.push(outfitInlinePart);
      userParts.push({ text: "The image above is the desired outfit. Generate the English movement prompt based on this video, using the movements from the video and describing the outfit shown in the image." });
    } else {
      userParts.push({ text: "Generate the English movement prompt based on this video." });
    }

    const genRes = await fetchWithTimeout(`${API_BASE}/${GEMINI_TEXT_MODEL}:generateContent?key=${apiKey}`, {
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

    if (uploadedFileName) {
      deleteGeminiFile(uploadedFileName);
    }

    if (!genRes.ok) {
      const errTxt = await genRes.text();
      console.error("Gemini Error:", errTxt);
      throw new Error("Erro ao analisar movimentos do vídeo.");
    }

    const genData = await genRes.json();
    const promptText = genData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!promptText) {
      throw new Error("Resposta vazia da IA");
    }

    return res.json({ prompt: promptText.trim() });
  } catch (error) {
    console.error("analyze-video-movements error:", error);
    if (uploadedFileName) {
      deleteGeminiFile(uploadedFileName);
    }
    return res.status(500).json({ error: error.message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
