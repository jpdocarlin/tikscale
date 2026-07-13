import { requireAuth, getGoogleApiKey, urlToInlineData, fetchWithTimeout, API_BASE, GEMINI_TEXT_MODEL } from './_lib.js';

export const config = { maxDuration: 60 };

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
    const { mode, language, context, outfitImageUrl, videoBase64, videoMimeType, videoUrl } = req.body;

    // Build video inline data
    let videoInlinePart = null;
    if (videoBase64 && videoMimeType) {
      videoInlinePart = { mimeType: videoMimeType, data: videoBase64 };
    } else if (videoUrl) {
      videoInlinePart = await urlToInlineData(videoUrl);
    }

    let outfitInlinePart = null;
    if (outfitImageUrl) {
      outfitInlinePart = await urlToInlineData(outfitImageUrl);
    }

    let systemInstruction = '';

    if (mode === 'movement_only') {
      systemInstruction = `You are a world-class AI video prompt engineer. Analyze the provided video and extract the EXACT physical movements of the main character.

Your task is to output a single paragraph of maximum 40 words describing the body language, head movements, hand gestures, and facial expressions of the character.
- Write the description in ${language === 'pt' ? 'Portuguese' : 'English'}.
- Focus purely on physical motion. Do NOT describe clothing, background, camera settings, or lighting.
- Output ONLY the description. No headers, no introductory text, no markdown wrapping, no bullet points.`;
      if (context) {
        systemInstruction += `\n- Context from user: ${context}`;
      }
    } else {
      const clothingRule = outfitInlinePart
        ? `DO NOT describe the clothing visible in the video. Instead, look at the outfit image provided and describe that outfit VERY BRIEFLY (maximum 5 words). Incorporate this outfit description naturally into the motion prompt.`
        : `DO NOT describe the subject's clothing, outfits, colors of clothing, or any apparel under any circumstances. Focus purely on the mechanics of the body: head, hands, feet, waist, and full body motion.`;

      systemInstruction = `You are a world-class AI video prompt engineer. Analyze the provided video and extract the EXACT physical movements to create perfect prompts for video generation models.

Your task is to produce output in EXACTLY this Markdown format:

### Prompts para Imagens (Cena por Cena)

**Cena 1:**
> "Breve descrição em português. MÁXIMO 20 PALAVRAS."

**Cena 2:**
> "Breve descrição em português. MÁXIMO 20 PALAVRAS."

[IMPORTANT: CREATE EXACTLY 2 SCENES. NEVER MORE. KEEP SCENE DESCRIPTIONS EXTREMELY SHORT AND TELEGRAPHIC IN PORTUGUESE.]

### Prompt para Vídeo

**Prompt do Vídeo:**
> "[Write the FULL video prompt in ENGLISH here — 80 to 120 words, single flowing paragraph, no formatting.]"

RULES:
- ${clothingRule}
- The image scene prompts MUST be in PORTUGUESE.
- The video prompt MUST be in ENGLISH, 80-120 words, single flowing paragraph.
- Describe the overall cinematic style, camera setting, lighting, and mood naturally.
${context ? `- Context from user: ${context}` : ''}`;
    }

    const userParts = [];

    if (videoInlinePart) {
      userParts.push({ text: '=== VIDEO TO ANALYZE — extract ALL physical movements precisely ===' });
      userParts.push({ inlineData: videoInlinePart });
    }

    if (outfitInlinePart) {
      userParts.push({ text: '=== OUTFIT REFERENCE IMAGE ===' });
      userParts.push({ inlineData: outfitInlinePart });
    }

    userParts.push({
      text: videoInlinePart
        ? 'Analyze this video and create the complete prompt output in the required format.'
        : 'Create a realistic natural movement prompt for a content creator speaking to camera, in the required format.'
    });

    const response = await fetchWithTimeout(`${API_BASE}/${GEMINI_TEXT_MODEL}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemInstruction }] },
        contents: [{ role: 'user', parts: userParts }],
      }),
    });

    if (!response.ok) {
      const errTxt = await response.text();
      console.error('Gemini Error:', errTxt);
      throw new Error('Erro ao analisar movimentos.');
    }

    const data = await response.json();
    const prompt = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!prompt) throw new Error('Nenhum prompt gerado.');
    return res.json({ prompt });
  } catch (error) {
    console.error('analyze-video-movements error:', error);
    return res.status(500).json({ error: error.message });
  }
}
