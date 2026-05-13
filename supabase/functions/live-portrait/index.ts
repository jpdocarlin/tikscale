import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Validate auth
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Não autorizado' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Sessão inválida' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const REPLICATE_API_TOKEN = Deno.env.get('REPLICATE_API_TOKEN')
    console.log('[live-portrait] Token present:', !!REPLICATE_API_TOKEN, 'Length:', REPLICATE_API_TOKEN?.length)
    if (!REPLICATE_API_TOKEN) {
      return new Response(JSON.stringify({ error: 'REPLICATE_API_TOKEN não configurado' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const url = new URL(req.url)
    const action = url.searchParams.get('action')

    if (action === 'generate') {
      const body = await req.json()
      const { faceImageUrl, drivingVideoUrl } = body

      if (!faceImageUrl || !drivingVideoUrl) {
        return new Response(JSON.stringify({ error: 'faceImageUrl e drivingVideoUrl são obrigatórios' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      console.log(`[live-portrait] Starting prediction for user ${user.id}`)

      // Create prediction using version endpoint
      const response = await fetch('https://api.replicate.com/v1/predictions', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${REPLICATE_API_TOKEN}`,
          'Content-Type': 'application/json',
          'Prefer': 'respond-async',
        },
        body: JSON.stringify({
          version: 'cd7ed192aa7cf6687d77c6494a2027ca1a76d06f524a02f5faee1727280c6a9e',
          input: {
            face_image: faceImageUrl,
            driving_video: drivingVideoUrl,
            live_portrait_dsize: 512,
            live_portrait_stitching: true,
            video_select_every_n_frames: 1,
          },
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('[live-portrait] Replicate error:', errorText)
        return new Response(JSON.stringify({ error: 'Erro ao iniciar geração no Replicate', details: errorText }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const data = await response.json()
      console.log(`[live-portrait] Prediction created: ${data.id}`)
      return new Response(JSON.stringify({ predictionId: data.id, status: data.status }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action === 'status') {
      const predictionId = url.searchParams.get('predictionId')
      if (!predictionId) {
        return new Response(JSON.stringify({ error: 'predictionId é obrigatório' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const response = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
        headers: {
          'Authorization': `Token ${REPLICATE_API_TOKEN}`,
        },
      })

      if (!response.ok) {
        return new Response(JSON.stringify({ error: 'Erro ao verificar status' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const data = await response.json()
      console.log(`[live-portrait] Status for ${predictionId}: ${data.status}`)

      let videoUrl = null
      if (data.status === 'succeeded' && data.output) {
        // Output can be a string URL or an object
        videoUrl = typeof data.output === 'string' ? data.output : data.output?.output_video || data.output
      }

      return new Response(JSON.stringify({
        status: data.status,
        videoUrl,
        error: data.error,
        logs: data.logs?.slice(-500),
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ error: 'Ação inválida. Use ?action=generate ou ?action=status' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error: unknown) {
    console.error('[live-portrait] Error:', error)
    const msg = error instanceof Error ? error.message : 'Erro interno'
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
