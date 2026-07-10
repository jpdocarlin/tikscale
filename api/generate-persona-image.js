import { requireAuth, getGoogleApiKey, urlToInlineData, extractImageFromGeminiResponse, fetchWithTimeout, API_BASE, GEMINI_IMAGE_MODEL } from './_lib.js';

export const config = { maxDuration: 60 };

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const user = await requireAuth(req);
  if (!user) return res.status(401).json({ error: 'Não autorizado.' });

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

    const response = await fetchWithTimeout(`${API_BASE}/${GEMINI_IMAGE_MODEL}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts }],
        generationConfig: { responseModalities: ['TEXT', 'IMAGE'] },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return res.status(429).json({ error: 'Muitas requisições. Aguarde 30 segundos.' });
      }
      const errTxt = await response.text();
      console.error('Gemini Error:', response.status, errTxt);
      return res.status(500).json({ error: 'Erro ao gerar imagem de persona.' });
    }

    const data = await response.json();
    const imageUrl = extractImageFromGeminiResponse(data);

    if (!imageUrl) {
      return res.status(500).json({ error: 'Nenhuma imagem gerada. Tente novamente.' });
    }

    return res.json({ success: true, imageUrl });
  } catch (error) {
    console.error('generate-persona-image error:', error);
    return res.status(500).json({ error: error.message });
  }
}
