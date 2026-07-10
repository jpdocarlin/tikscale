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
    const {
      description,
      outfitImageUrl,
      personaDescription,
      personaImageUrl,
      scenario,
      videoBase64,
      videoMimeType,
      videoUrl,
    } = req.body;

    const [outfitPart, personaPart] = await Promise.all([
      outfitImageUrl ? urlToInlineData(outfitImageUrl) : Promise.resolve(null),
      personaImageUrl ? urlToInlineData(personaImageUrl) : Promise.resolve(null),
    ]);

    // Build video inline data if provided as base64
    let videoInlinePart = null;
    if (videoBase64 && videoMimeType) {
      videoInlinePart = { mimeType: videoMimeType, data: videoBase64 };
    } else if (videoUrl) {
      videoInlinePart = await urlToInlineData(videoUrl);
    }

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
1. Write ENTIRELY in English
2. Start with: "Cinematic vertical smartphone video, 4K, shallow depth of field, natural soft lighting."
3. Describe the subject briefly (gender, approximate age, hair, expression — NO names)
4. Describe ALL movements in chronological order with PRECISE timing and speed
5. Describe the SCENE/BACKGROUND if provided
6. End with: "Static front-facing camera, eye-level, stable framing on the subject."
7. Always include: "The subject's mouth remains closed, not speaking, silent throughout."
8. The video prompt MUST be between 80 and 120 words. Single flowing paragraph, no formatting.

CRITICAL OUTPUT RULES:
- The image scene prompts MUST be in PORTUGUESE.
- The video prompt (Google Flow) MUST be in ENGLISH.
- Output ONLY the requested format. No introductions, no filler.`;

    const inputSections = [];
    if (personaDescription) inputSections.push(`CHARACTER: ${personaDescription}`);
    if (outfitPart) inputSections.push(`OUTFIT: [See outfit image provided]`);
    else if (outfitImageUrl) inputSections.push(`OUTFIT: A stylish outfit`);

    const movementsText = (videoInlinePart ? '[See video provided - analyze ALL movements]' : '') + (description ? ` ${description}` : '');
    inputSections.push(`MOVEMENTS: ${movementsText || 'Natural content creator movements looking at camera'}`);

    if (scenario) inputSections.push(`SCENE/BACKGROUND: ${scenario}`);

    const userMessage = `Create a complete video generation prompt combining ALL these elements:\n\n${inputSections.join('\n\n')}`;

    const userParts = [];
    if (videoInlinePart) {
      userParts.push({ text: '=== VIDEO TO ANALYZE — describe ALL movements from this video ===' });
      userParts.push({ inlineData: videoInlinePart });
    }
    if (personaPart) userParts.push({ inlineData: personaPart });
    if (outfitPart) {
      userParts.push({ text: '=== OUTFIT REFERENCE IMAGE ===' });
      userParts.push({ inlineData: outfitPart });
    }
    userParts.push({ text: userMessage });

    const genRes = await fetchWithTimeout(`${API_BASE}/${GEMINI_TEXT_MODEL}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: 'user', parts: userParts }],
      }),
    });

    if (!genRes.ok) {
      const errTxt = await genRes.text();
      console.error('Gemini Error:', errTxt);
      throw new Error('Erro ao gerar prompt.');
    }

    const genData = await genRes.json();
    const prompt = genData.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!prompt) throw new Error('Nenhum prompt gerado.');
    return res.json({ prompt });
  } catch (error) {
    console.error('generate-real-prompt error:', error);
    return res.status(500).json({ error: error.message });
  }
}
