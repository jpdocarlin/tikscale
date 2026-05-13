import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PhotoAvatarRequest {
  action?: 'generate' | 'status' | 'list-talking-photos' | 'voices' | 'list-avatars';
  script: string;
  photoUrl?: string; // Base64 data URL of the photo (for talking_photo mode)
  avatarId?: string; // Pre-built avatar ID (for avatar mode)
  avatarType?: 'talking_photo' | 'avatar'; // Which mode to use
  aspectRatio?: '16:9' | '9:16' | '1:1';
  voiceGender?: 'male' | 'female';
  voiceId?: string; // optional override
}

type HeyGenVoice = {
  voice_id?: string;
  id?: string;
  name?: string;
  language?: string;
  locale?: string;
  gender?: string;
  type?: string;
};

let cachedVoices: { voices: HeyGenVoice[]; fetchedAt: number } | null = null;
const VOICES_CACHE_TTL_MS = 1000 * 60 * 10; // 10 minutes

async function fetchHeyGenVoices(apiKey: string): Promise<HeyGenVoice[]> {
  const now = Date.now();
  if (cachedVoices && now - cachedVoices.fetchedAt < VOICES_CACHE_TTL_MS) {
    return cachedVoices.voices;
  }

  const resp = await fetch('https://api.heygen.com/v2/voices', {
    method: 'GET',
    headers: {
      'X-Api-Key': apiKey,
      'Content-Type': 'application/json',
    },
  });

  const text = await resp.text();
  if (!resp.ok) {
    console.error('[heygen-video] Failed to list voices:', resp.status, text.substring(0, 500));
    throw new Error(`Failed to list voices (${resp.status})`);
  }

  let json: any;
  try {
    json = JSON.parse(text);
  } catch {
    console.error('[heygen-video] Voices response is not JSON:', text.substring(0, 200));
    throw new Error('Invalid voices response');
  }

  // Tolerant extraction (HeyGen has changed shapes across versions)
  const voices: HeyGenVoice[] =
    json?.data?.voices ??
    json?.data ??
    json?.voices ??
    [];

  cachedVoices = { voices, fetchedAt: now };
  return voices;
}

function normalizeGender(g?: string): 'male' | 'female' | null {
  const v = (g || '').toLowerCase().trim();
  // Check female FIRST because "female" contains "male"
  if (v === 'female' || v === 'f' || v.includes('female') || v.includes('feminino') || v.includes('mulher')) return 'female';
  if (v === 'male' || v === 'm' || v.includes('masculino') || v.includes('homem')) return 'male';
  return null;
}

function isPortugueseBR(v: HeyGenVoice): boolean {
  const lang = (v.language || '').toLowerCase();
  const locale = (v.locale || '').toLowerCase();
  const name = (v.name || '').toLowerCase();
  return (
    lang === 'pt-br' ||
    locale === 'pt-br' ||
    lang.includes('portuguese') ||
    locale.includes('pt') ||
    name.includes('portugu') ||
    name.includes('brasil') ||
    name.includes('brasileir') ||
    name.includes('brazil')
  );
}

function getVoiceId(v: HeyGenVoice): string | null {
  return (v.voice_id || v.id || '').trim() || null;
}

async function resolveVoiceId(params: {
  apiKey: string;
  requestedGender: 'male' | 'female';
  overrideVoiceId?: string;
}): Promise<{ voiceId: string; usedFallback: boolean; note?: string }> {
  // 1) explicit override from client
  if (params.overrideVoiceId && params.overrideVoiceId.trim().length > 0) {
    return { voiceId: params.overrideVoiceId.trim(), usedFallback: false };
  }

  const voices = await fetchHeyGenVoices(params.apiKey);
  const voicesWithIds = voices
    .map((v) => ({ v, id: getVoiceId(v), gender: normalizeGender(v.gender) }))
    .filter((x) => !!x.id);

  const pick = (predicate: (x: { v: HeyGenVoice; id: string | null; gender: 'male' | 'female' | null }) => boolean) =>
    voicesWithIds.find(predicate)?.id as string | undefined;

  // 2) try pt-BR + gender
  const preferred = pick((x) => !!x.id && x.gender === params.requestedGender && isPortugueseBR(x.v));
  if (preferred) return { voiceId: preferred, usedFallback: false };

  // 3) try any pt-BR (any gender)
  const anyPt = pick((x) => !!x.id && isPortugueseBR(x.v));
  if (anyPt) {
    return {
      voiceId: anyPt,
      usedFallback: true,
      note: `Requested ${params.requestedGender} voice not available for pt-BR; falling back to an available pt voice.`,
    };
  }

  // 4) try any voice with requested gender
  const anyGender = pick((x) => !!x.id && x.gender === params.requestedGender);
  if (anyGender) {
    return {
      voiceId: anyGender,
      usedFallback: true,
      note: `pt-BR voices unavailable; falling back to a ${params.requestedGender} voice in another language.`,
    };
  }

  // 5) final fallback: first available voice
  const first = voicesWithIds[0]?.id;
  if (first) {
    return { voiceId: first, usedFallback: true, note: 'No matching voices found; falling back to first available voice.' };
  }

  throw new Error('No voices available for this API key');
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth validation
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      console.error('[heygen-video] No authorization header');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      console.error('[heygen-video] Invalid token:', claimsError?.message);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = claimsData.claims.sub;
    console.log(`[heygen-video] Authenticated user: ${userId}`);

    const HEYGEN_API_KEY = Deno.env.get('HEYGEN_API_KEY');
    if (!HEYGEN_API_KEY) {
      console.error('[heygen-video] HEYGEN_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'HeyGen API not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[heygen-video] API Key present: ${HEYGEN_API_KEY.substring(0, 12)}...`);

    const url = new URL(req.url);
    let parsedBody: any | null = null;
    if (req.method === 'POST') {
      // Read body ONCE (edge-runtime safe) and parse JSON if possible.
      // This also allows { action: "voices" } without relying on query params.
      const raw = await req.text();
      if (raw && raw.trim().length > 0) {
        try {
          parsedBody = JSON.parse(raw);
        } catch {
          parsedBody = null;
        }
      }
    }

    const actionFromQuery = url.searchParams.get('action');
    const actionFromBody = typeof parsedBody?.action === 'string' ? String(parsedBody.action) : null;
    const action = (actionFromQuery || actionFromBody || 'generate') as string;

    // Check video status
    if (action === 'status') {
      const videoId = url.searchParams.get('videoId');
      if (!videoId) {
        return new Response(
          JSON.stringify({ error: 'videoId is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`[heygen-video] Checking status for video: ${videoId}`);
      
      const response = await fetch(`https://api.heygen.com/v1/video_status.get?video_id=${videoId}`, {
        method: 'GET',
        headers: {
          'X-Api-Key': HEYGEN_API_KEY,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[heygen-video] Status check error:', errorText);
        return new Response(
          JSON.stringify({ error: 'Failed to check video status', details: errorText }),
          { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const data = await response.json();
      console.log(`[heygen-video] Video status: ${data.data?.status}`);
      console.log(`[heygen-video] Full status response: ${JSON.stringify(data)}`);
      
      // Capture error details if video failed
      const errorMessage = data.data?.error?.message || data.data?.error || data.message || null;
      if (data.data?.status === 'failed') {
        console.error(`[heygen-video] Video generation failed: ${errorMessage || 'Unknown reason'}`);
      }
      
      return new Response(
        JSON.stringify({ 
          status: data.data?.status,
          videoUrl: data.data?.video_url,
          thumbnailUrl: data.data?.thumbnail_url,
          duration: data.data?.duration,
          error: errorMessage,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // List talking photos (existing ones in user's account)
    if (action === 'list-talking-photos') {
      console.log(`[heygen-video] Fetching talking photos...`);
      
      const response = await fetch('https://api.heygen.com/v2/talking_photo', {
        method: 'GET',
        headers: {
          'X-Api-Key': HEYGEN_API_KEY,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[heygen-video] List talking photos error:', errorText);
        return new Response(
          JSON.stringify({ error: 'Failed to list talking photos', details: errorText }),
          { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const data = await response.json();
      console.log(`[heygen-video] Found ${data.data?.talking_photos?.length || 0} talking photos`);
      
      return new Response(
        JSON.stringify({ talkingPhotos: data.data?.talking_photos || [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // List available voices for this API key (debug)
    if (action === 'voices') {
      console.log('[heygen-video] Fetching voices...');
      try {
        const voices = await fetchHeyGenVoices(HEYGEN_API_KEY);
        const simplified = voices
          .map((v) => ({
            id: getVoiceId(v),
            name: v.name,
            gender: v.gender,
            language: v.language,
            locale: v.locale,
            type: v.type,
          }))
          .filter((v) => !!v.id);

        console.log(`[heygen-video] Voices available: ${simplified.length}`);
        return new Response(JSON.stringify({ voices: simplified }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (e) {
        console.error('[heygen-video] Voices list error:', e);
        return new Response(JSON.stringify({ error: 'Failed to list voices', details: String(e) }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // List pre-built avatars with full body animation
    if (action === 'list-avatars') {
      console.log('[heygen-video] Fetching pre-built avatars...');
      try {
        const response = await fetch('https://api.heygen.com/v2/avatars', {
          method: 'GET',
          headers: {
            'X-Api-Key': HEYGEN_API_KEY,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('[heygen-video] List avatars error:', errorText);
          return new Response(
            JSON.stringify({ error: 'Failed to list avatars', details: errorText }),
            { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const data = await response.json();
        const avatars = data.data?.avatars || [];
        
        // Filter and simplify avatar data - prioritize avatars with body animation
        const simplified = avatars
          .filter((a: any) => a.avatar_id && a.preview_image_url)
          .map((a: any) => ({
            id: a.avatar_id,
            name: a.avatar_name || a.name || 'Avatar',
            gender: a.gender,
            previewUrl: a.preview_image_url,
            previewVideoUrl: a.preview_video_url,
          }));

        console.log(`[heygen-video] Avatars available: ${simplified.length}`);
        return new Response(JSON.stringify({ avatars: simplified }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (e) {
        console.error('[heygen-video] Avatars list error:', e);
        return new Response(JSON.stringify({ error: 'Failed to list avatars', details: String(e) }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Generate video with talking photo OR pre-built avatar
    if (action === 'generate') {
      const body: PhotoAvatarRequest = (parsedBody as PhotoAvatarRequest) || ({} as PhotoAvatarRequest);
      
      if (!body.script || body.script.trim().length === 0) {
        return new Response(
          JSON.stringify({ error: 'Script is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Determine avatar type
      const avatarType = body.avatarType || 'talking_photo';
      
      // Validate inputs based on avatar type
      if (avatarType === 'talking_photo' && !body.photoUrl) {
        return new Response(
          JSON.stringify({ error: 'Photo is required for talking photo mode' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (avatarType === 'avatar' && !body.avatarId) {
        return new Response(
          JSON.stringify({ error: 'Avatar ID is required for avatar mode' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (body.script.length > 1000) {
        return new Response(
          JSON.stringify({ error: 'Script muito longo para 30 segundos. Use no máximo 1000 caracteres.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Validate voice gender
      const voiceGender = body.voiceGender || 'female';
      if (!['male', 'female'].includes(voiceGender)) {
        return new Response(
          JSON.stringify({ error: 'voiceGender deve ser "male" ou "female"' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`[heygen-video] Generating video with ${avatarType}`);
      console.log(`[heygen-video] Script length: ${body.script.length} chars`);
      console.log(`[heygen-video] Voice gender: ${voiceGender}`);

      // Map aspect ratio to HeyGen dimensions - Using 720p to support more plans
      const dimensionMap: Record<string, { width: number; height: number }> = {
        '16:9': { width: 1280, height: 720 },
        '9:16': { width: 720, height: 1280 },
        '1:1': { width: 720, height: 720 },
      };
      const dimensions = dimensionMap[body.aspectRatio || '9:16'] || dimensionMap['9:16'];
      console.log(`[heygen-video] Using dimensions: ${dimensions.width}x${dimensions.height}`);

      // Resolve a valid voice_id for THIS API key
      let resolvedVoice: { voiceId: string; usedFallback: boolean; note?: string };
      try {
        resolvedVoice = await resolveVoiceId({
          apiKey: HEYGEN_API_KEY,
          requestedGender: voiceGender as 'male' | 'female',
          overrideVoiceId: body.voiceId,
        });
      } catch (e) {
        console.error('[heygen-video] Could not resolve voice:', e);
        return new Response(
          JSON.stringify({
            error: 'No valid voice available for this account',
            details: String(e),
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(
        `[heygen-video] Using voice ID: ${resolvedVoice.voiceId} for ${voiceGender} (fallback=${resolvedVoice.usedFallback})`
      );
      if (resolvedVoice.note) console.log(`[heygen-video] Voice note: ${resolvedVoice.note}`);

      let characterConfig: any;
      let talkingPhotoId: string | null = null;

      if (avatarType === 'avatar') {
        // Use pre-built avatar with full body animation
        console.log(`[heygen-video] Using pre-built avatar: ${body.avatarId}`);
        characterConfig = {
          type: 'avatar',
          avatar_id: body.avatarId,
          avatar_style: 'normal', // normal style for body animation
        };
      } else {
        // Upload photo and create talking photo (head animation only)
        console.log(`[heygen-video] Step 1: Creating talking photo from base64...`);
        
        // Extract base64 data
        const base64Match = body.photoUrl!.match(/^data:image\/[^;]+;base64,(.+)$/);
        if (!base64Match) {
          return new Response(
            JSON.stringify({ error: 'Invalid photo format. Expected base64 data URL.' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const base64Data = base64Match[1];
        
        // Convert base64 to binary for upload
        const binaryString = atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        // Get mime type from data URL
        const mimeMatch = body.photoUrl!.match(/^data:(image\/[^;]+);base64/);
        const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';

        // Create blob for v1 talking_photo upload
        const blob = new Blob([bytes], { type: mimeType });

        const uploadResponse = await fetch('https://upload.heygen.com/v1/talking_photo', {
          method: 'POST',
          headers: {
            'x-api-key': HEYGEN_API_KEY,
            'Content-Type': mimeType,
          },
          body: blob,
        });

        const uploadText = await uploadResponse.text();
        console.log(`[heygen-video] Talking photo upload status: ${uploadResponse.status}`);
        console.log(`[heygen-video] Talking photo upload response: ${uploadText.substring(0, 500)}`);

        if (!uploadResponse.ok) {
          console.error('[heygen-video] Talking photo upload error:', uploadText);
          return new Response(
            JSON.stringify({ error: 'Failed to create talking photo', details: uploadText }),
            { status: uploadResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const uploadData = JSON.parse(uploadText);
        talkingPhotoId = uploadData.data?.talking_photo_id;

        if (!talkingPhotoId) {
          console.error('[heygen-video] No talking_photo_id in response:', uploadText);
          return new Response(
            JSON.stringify({ error: 'Failed to get talking photo ID', details: uploadText }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log(`[heygen-video] Got talking_photo_id: ${talkingPhotoId}`);
        
        characterConfig = {
          type: 'talking_photo',
          talking_photo_id: talkingPhotoId,
        };
      }

      // Generate video
      console.log(`[heygen-video] Generating video...`);

      const videoPayload = {
        video_inputs: [
          {
            character: characterConfig,
            voice: {
              type: 'text',
              input_text: body.script,
              voice_id: resolvedVoice.voiceId,
              speed: 1.0,
            },
          },
        ],
        dimension: dimensions,
        test: false,
      };

      console.log(`[heygen-video] Sending video generation request...`);
      
      const response = await fetch('https://api.heygen.com/v2/video/generate', {
        method: 'POST',
        headers: {
          'X-Api-Key': HEYGEN_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(videoPayload),
      });

      const responseText = await response.text();
      console.log(`[heygen-video] Video generation response status: ${response.status}`);
      console.log(`[heygen-video] Video generation response: ${responseText.substring(0, 500)}`);

      if (!response.ok) {
        console.error('[heygen-video] HeyGen generate error:', responseText);
        return new Response(
          JSON.stringify({ error: 'Failed to generate video', details: responseText }),
          { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const data = JSON.parse(responseText);
      console.log(`[heygen-video] Video created: ${data.data?.video_id}`);
      
      return new Response(
        JSON.stringify({ 
          videoId: data.data?.video_id,
          talkingPhotoId: talkingPhotoId,
          voiceIdUsed: resolvedVoice.voiceId,
          voiceFallbackUsed: resolvedVoice.usedFallback,
          voiceNote: resolvedVoice.note,
          message: 'Video generation started. Use status endpoint to check progress.',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[heygen-video] Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
