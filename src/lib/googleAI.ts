const API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";
const UPLOAD_BASE = "https://generativelanguage.googleapis.com/upload/v1beta/files";

const IMAGEN_MODEL = "imagen-4.0-generate-001";
const GEMINI_IMAGE_MODEL = "gemini-2.5-flash-image";
const GEMINI_TEXT_MODEL = "gemini-2.5-flash";

function getGoogleApiKey() {
  const key = import.meta.env.VITE_GOOGLE_API_KEY;
  if (!key) {
    throw new Error("Chave de API do Google (VITE_GOOGLE_API_KEY) não configurada no frontend.");
  }
  return key;
}

export async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 50000): Promise<Response> {
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

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const len = bytes.byteLength;
  const chunkSize = 8192;
  for (let i = 0; i < len; i += chunkSize) {
    const chunk = bytes.subarray(i, Math.min(i + chunkSize, len));
    binary += String.fromCharCode.apply(null, chunk as any);
  }
  return btoa(binary);
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
    return {
      mimeType: r.headers.get("content-type") || "image/jpeg",
      data: arrayBufferToBase64(buf)
    };
  } catch (e) {
    console.warn("Failed to convert image:", e);
    return null;
  }
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

// 1. Generate Persona Image
export async function generatePersonaImage(description: string, referenceImageUrl?: string, signal?: AbortSignal): Promise<{ success: boolean; imageUrl: string }> {
  const apiKey = getGoogleApiKey();
  const parts: any[] = [];

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

  const response = await fetch(`${API_BASE}/${GEMINI_IMAGE_MODEL}:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts }],
      generationConfig: { responseModalities: ["TEXT", "IMAGE"] },
    }),
    signal
  });

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error("Muitas requisições. Aguarde 30 segundos.");
    }
    throw new Error("Erro ao gerar imagem de persona.");
  }

  const data = await response.json();
  const imageUrl = extractImageFromGeminiResponse(data);

  if (!imageUrl) {
    throw new Error("Nenhuma imagem gerada. Tente novamente.");
  }

  return { success: true, imageUrl };
}

// Helpers for UGC Image
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
    prompt = `ULTRA-REALISTIC PHOTOGRAPH, 8k resolution, raw DSLR photo. Virtual try-on / clothing swap: The PERSON is ${influencerDesc} (see INFLUENCER REFERENCE IMAGE — use this person's face and body). The GARMENT to wear is shown in the PRODUCT REFERENCE IMAGE (ignore any model/person visible in that product photo — extract only the clothing item). Dress the influencer person in that exact garment. Reproduce the garment with perfect accuracy: same color, pattern, texture, cut, logos. ${params.environment}. The influencer's face must be clearly visible and recognizable. Natural authentic pose. Cinematic lighting, highly detailed skin texture. Professional fashion UGC aesthetic.`;
  } else {
    prompt = `ULTRA-REALISTIC PHOTOGRAPH, 8k resolution, raw DSLR photo. Image of ${influencerDesc}. ${params.pose}. ${params.environment}. Clothing: ${params.style}. HOLDING ${productRef} at chest level. Product clearly visible. Face CLEARLY VISIBLE, genuine smile, authentic natural skin texture, highly detailed eyes. Professional UGC aesthetic.`;
  }

  if (params.enhancements) prompt += ` Quality: ${params.enhancements}.`;
  if (params.additionalInfo) prompt += ` Extra: ${params.additionalInfo}`;
  prompt += ` Ensure the composition perfectly fits a ${aspectRatioText} format. DO NOT: Create cartoons/illustrations/anime/3D/CGI, no plastic skin, no watermarks, no text, no phone frames. Must look like a real unfiltered photo.`;

  return prompt;
}

export interface GenerateUGCImageParams {
  productName: string;
  productImageUrl?: string;
  influencer: { name: string; description: string; imageUrl?: string };
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

// 2. Generate UGC Image
export async function generateUGCImage(requestData: GenerateUGCImageParams, signal?: AbortSignal): Promise<{ success: boolean; imageUrl: string; prompt: string }> {
  const apiKey = getGoogleApiKey();

  // Normalize enhancements
  let normalizedEnhancements = requestData.enhancements;
  if (typeof normalizedEnhancements === 'string') {
    normalizedEnhancements = (normalizedEnhancements as string).split(',').map((s: string) => s.trim()).filter(Boolean);
  }
  if (!Array.isArray(normalizedEnhancements)) {
    normalizedEnhancements = [];
  }

  const hasReferenceImages = !!(requestData.influencer?.imageUrl || requestData.productImageUrl || requestData.scenarioImageUrl);

  // Build prompts
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

  let imageUrl: string | null = null;

  if (hasReferenceImages) {
    if (requestData.pose === "wearing" && requestData.productImageUrl && requestData.influencer.imageUrl) {
      // STEP 1 — describe the garment in detail using Gemini text
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
          },
          50000
        );

        if (describeResponse.ok) {
          const describeData = await describeResponse.json();
          garmentDescription = describeData.candidates?.[0]?.content?.parts
            ?.filter((p: any) => p.text)
            ?.map((p: any) => p.text)
            ?.join(" ")
            ?.trim() || "";
        }
      }

      // STEP 2 — generate the final image using persona image + garment text description
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

      const step2Parts: any[] = [{ text: step2Prompt }];
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
        },
        50000
      );

      if (!step2Response.ok) {
        throw new Error("Erro ao gerar imagem de vestuário.");
      }

      const step2Data = await step2Response.json();
      imageUrl = extractImageFromGeminiResponse(step2Data);
    } else {
      const parts: any[] = [];
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
        },
        50000
      );

      if (!response.ok) {
        throw new Error("Erro ao gerar imagem UGC.");
      }

      const data = await response.json();
      imageUrl = extractImageFromGeminiResponse(data);
    }
  } else {
    // Pure text-to-image
    const aspectMap: Record<string, string> = {
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
      },
      50000
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
        },
        50000
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

  return { success: true, imageUrl, prompt };
}

// 3. Upload File to Gemini File API (used for videos)
async function uploadFileToGemini(fileOrUrl: File | string): Promise<{ fileUri: string; fileName: string; mimeType: string }> {
  const apiKey = getGoogleApiKey();
  let buffer: ArrayBuffer;
  let mimeType: string;
  let sizeBytes: number;

  if (typeof fileOrUrl === "string") {
    const res = await fetch(fileOrUrl);
    if (!res.ok) throw new Error("Falha ao buscar mídia");
    buffer = await res.arrayBuffer();
    mimeType = res.headers.get("content-type") || "video/mp4";
    sizeBytes = buffer.byteLength;
  } else {
    buffer = await fileOrUrl.arrayBuffer();
    mimeType = fileOrUrl.type || "video/mp4";
    sizeBytes = fileOrUrl.size;
  }

  const uploadRes = await fetchWithTimeout(`${UPLOAD_BASE}?uploadType=media&key=${apiKey}`, {
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
    throw new Error("Erro ao fazer upload do arquivo para a IA");
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
  while (!isReady && attempts < 10) {
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
    throw new Error("Tempo esgotado ao processar arquivo. Tente um arquivo menor.");
  }

  return { fileUri, fileName, mimeType };
}

// 4. Cleanup File from Gemini File API
async function deleteGeminiFile(fileName: string) {
  const apiKey = getGoogleApiKey();
  try {
    await fetch(`https://generativelanguage.googleapis.com/v1beta/${fileName}?key=${apiKey}`, { method: "DELETE" });
  } catch (e) {
    console.warn("Failed to delete video from Gemini", e);
  }
}

export interface GenerateRealPromptParams {
  description?: string;
  videoUrlOrFile?: string | File;
  outfitImageUrl?: string;
  personaDescription?: string;
  personaImageUrl?: string;
  scenario?: string;
}

// 5. Generate Real Prompt
export async function generateRealPrompt(params: GenerateRealPromptParams): Promise<{ prompt: string }> {
  const apiKey = getGoogleApiKey();
  let extractedMovements: string | null = null;
  let uploadedFileName: string | null = null;

  if (params.videoUrlOrFile) {
    const { fileUri, fileName, mimeType } = await uploadFileToGemini(params.videoUrlOrFile);
    uploadedFileName = fileName;

    // Extract movements
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

  // Fetch inline images
  const [outfitPart, personaPart] = await Promise.all([
    params.outfitImageUrl ? urlToInlineData(params.outfitImageUrl) : Promise.resolve(null),
    params.personaImageUrl ? urlToInlineData(params.personaImageUrl) : Promise.resolve(null),
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

  const inputSections: string[] = [];
  if (params.personaDescription) inputSections.push(`CHARACTER: ${params.personaDescription}`);
  
  if (outfitPart) inputSections.push(`OUTFIT: [See outfit image provided]`);
  else if (params.outfitImageUrl) inputSections.push(`OUTFIT: A stylish outfit (image unavailable, describe generically)`);

  const movementsText = extractedMovements || params.description || "";
  inputSections.push(`MOVEMENTS: ${movementsText}`);

  if (params.scenario) inputSections.push(`SCENE/BACKGROUND: ${params.scenario}`);

  const userMessage = `Create a complete video generation prompt combining ALL these elements:\n\n${inputSections.join("\n\n")}`;

  const userParts: any[] = [];
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

  // Cleanup file in background
  if (uploadedFileName) {
    deleteGeminiFile(uploadedFileName);
  }

  if (!genRes.ok) {
    throw new Error("Erro ao gerar prompt.");
  }

  const genData = await genRes.json();
  const prompt = genData.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

  if (!prompt) {
    throw new Error("Nenhum prompt gerado.");
  }

  return { prompt };
}

export interface AnalyzeVideoMovementsParams {
  videoUrlOrFile: string | File;
  context?: string;
  outfitImageUrl?: string;
}

// 6. Analyze Video Movements
export async function analyzeVideoMovements(params: AnalyzeVideoMovementsParams): Promise<{ prompt: string }> {
  const apiKey = getGoogleApiKey();
  const { fileUri, fileName, mimeType } = await uploadFileToGemini(params.videoUrlOrFile);

  let outfitInlinePart: any = null;
  if (params.outfitImageUrl) {
    outfitInlinePart = await urlToInlineData(params.outfitImageUrl);
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

  if (params.context && params.context.trim().length > 0) {
    systemInstruction += `\n\nAdditional user instructions to incorporate into the final prompt: ${params.context}`;
  }

  const userParts: any[] = [
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

  // Cleanup video in background
  deleteGeminiFile(fileName);

  if (!genRes.ok) {
    throw new Error("Erro ao analisar movimentos do vídeo.");
  }

  const genData = await genRes.json();
  const promptText = genData.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!promptText) {
    throw new Error("Resposta vazia da IA");
  }

  return { prompt: promptText.trim() };
}
