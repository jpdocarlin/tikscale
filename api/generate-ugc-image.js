import { requireAuth, getGoogleApiKey, urlToInlineData, extractImageFromGeminiResponse, fetchWithTimeout, API_BASE, GEMINI_IMAGE_MODEL, GEMINI_TEXT_MODEL, IMAGEN_MODEL } from './_lib.js';

export const config = { maxDuration: 60 };

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
    ? `the EXACT item shown in the reference image (DO NOT generate a generic box, replicate the reference image EXACTLY)`
    : `"${params.productName}"`;

  const influencerDesc = params.influencer.description.includes("persona salva") || !params.influencer.description.trim()
    ? "a highly detailed real person"
    : `a real Brazilian person: ${params.influencer.description}`;

  let prompt;
  if (handsOnly) {
    prompt = `ULTRA-REALISTIC PHOTOGRAPH, 8k resolution, DSLR camera, sharp focus. Close-up of HANDS ONLY holding ${productRef}. First-person POV, ${params.environment}. NO face/body visible. Product clearly visible, authentic natural hands with skin texture and pores. Professional UGC aesthetic.`;
  } else if (wearing) {
    prompt = `ULTRA-REALISTIC PHOTOGRAPH, 8k resolution, raw DSLR photo. Virtual try-on: The PERSON is ${influencerDesc}. The GARMENT is shown in the PRODUCT REFERENCE IMAGE. Dress the influencer in that exact garment. ${params.environment}. Natural authentic pose. Cinematic lighting.`;
  } else {
    prompt = `ULTRA-REALISTIC PHOTOGRAPH, 8k resolution, raw DSLR photo. Image of ${influencerDesc}. ${params.pose}. ${params.environment}. Clothing: ${params.style}. HOLDING ${productRef} at chest level. Product clearly visible. Face CLEARLY VISIBLE, genuine smile, authentic natural skin texture. Professional UGC aesthetic.`;
  }

  if (params.enhancements) prompt += ` Quality: ${params.enhancements}.`;
  if (params.additionalInfo) prompt += ` Extra: ${params.additionalInfo}`;
  prompt += ` Ensure the composition perfectly fits a ${aspectRatioText} format. DO NOT: Create cartoons/illustrations/anime/3D/CGI, no plastic skin, no watermarks, no text, no phone frames.`;

  return prompt;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const user = await requireAuth(req);
  if (!user) return res.status(401).json({ error: 'Não autorizado.' });

  try {
    const apiKey = getGoogleApiKey();
    const requestData = req.body;

    let normalizedEnhancements = requestData.enhancements;
    if (typeof normalizedEnhancements === 'string') {
      normalizedEnhancements = normalizedEnhancements.split(',').map(s => s.trim()).filter(Boolean);
    }
    if (!Array.isArray(normalizedEnhancements)) normalizedEnhancements = [];

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
      const parts = [];
      let textContent = prompt;

      if (requestData.productImageUrl) {
        textContent += `\n\nPRODUCT REPLICATION — HIGHEST PRIORITY: The FIRST attached image shows the EXACT product that must appear. Replicate EVERY detail: exact shape, colors, packaging, labels, logos.`;
      }
      if (requestData.influencer?.imageUrl) {
        textContent += `\n\nFACE REPLICATION - HIGHEST PRIORITY: The INFLUENCER image shows the EXACT person who MUST appear. Replicate EXACT facial structure, skin tone, hair.`;
      }
      if (requestData.scenarioImageUrl) {
        textContent += "\n\nPlace the person naturally inside the real environment shown in the background photo.";
      }

      parts.push({ text: textContent });

      if (requestData.productImageUrl) {
        parts.push({ text: "=== PRODUCT REFERENCE IMAGE (replicate this EXACTLY) ===" });
        const inlineData = await urlToInlineData(requestData.productImageUrl);
        if (inlineData) parts.push({ inlineData });
      }
      if (requestData.influencer?.imageUrl) {
        parts.push({ text: "=== INFLUENCER / PERSON REFERENCE IMAGE ===" });
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
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts }],
            generationConfig: { responseModalities: ['TEXT', 'IMAGE'] },
          }),
        }
      );

      if (!response.ok) throw new Error('Erro ao gerar imagem UGC.');
      const data = await response.json();
      imageUrl = extractImageFromGeminiResponse(data);
    } else {
      // Pure text-to-image via Imagen 4
      const aspectMap = { "9:16": "9:16", "1:1": "1:1", "3:4": "3:4", "16:9": "16:9" };
      const response = await fetchWithTimeout(
        `${API_BASE}/${IMAGEN_MODEL}:predict?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            instances: [{ prompt }],
            parameters: { sampleCount: 1, aspectRatio: aspectMap[requestData.aspectRatio] || "9:16" },
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const b64 = data.predictions?.[0]?.bytesBase64Encoded;
        if (b64) imageUrl = `data:image/png;base64,${b64}`;
      }

      if (!imageUrl) {
        // Fallback to Gemini Flash Image
        const fallbackResponse = await fetchWithTimeout(
          `${API_BASE}/${GEMINI_IMAGE_MODEL}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ role: 'user', parts: [{ text: prompt }] }],
              generationConfig: { responseModalities: ['TEXT', 'IMAGE'] },
            }),
          }
        );
        if (!fallbackResponse.ok) throw new Error('Erro ao gerar imagem UGC.');
        const fallbackData = await fallbackResponse.json();
        imageUrl = extractImageFromGeminiResponse(fallbackData);
      }
    }

    if (!imageUrl) throw new Error('Nenhuma imagem gerada. Tente novamente.');
    return res.json({ success: true, imageUrl, prompt });
  } catch (error) {
    console.error('generate-ugc-image error:', error);
    return res.status(500).json({ error: error.message });
  }
}
