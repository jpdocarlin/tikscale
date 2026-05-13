import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Models to try in order (fallback)
const MODELS = ["google/gemini-3-flash-preview", "google/gemini-2.5-flash"];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate the request
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Não autorizado. Faça login para continuar." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    // Use getUser() for more reliable auth (same as generate-video-prompts)
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError || !user) {
      console.error("Auth error:", userError);
      return new Response(
        JSON.stringify({ error: "Sessão inválida. Faça login novamente." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Authenticated user:", user.id);

    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "Mensagens inválidas" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = `Você é um assistente conversacional especialista em criação de conteúdo viral para TikTok, focado em ajudar afiliados.

## REGRA PRINCIPAL: RESPOSTAS CURTAS E CONVERSACIONAIS
- NUNCA envie tudo de uma vez. Vá ajudando aos poucos.
- Responda de forma CURTA e FOCADA (máximo 3-4 itens por vez)
- Faça perguntas para entender melhor o que a pessoa quer
- Seja como um amigo que está ajudando, não um robô que despeja informação

## Como responder cada tipo de pedido:

### Se pedirem LEGENDAS/CAPTIONS:
- Pergunte primeiro: "Quer uma legenda curta ou mais elaborada? Pra qual tipo de produto?"
- Envie 1-2 opções por vez
- Pergunte se quer mais variações

### Se pedirem GANCHOS/HOOKS:
- Pergunte primeiro: "Qual o produto/nicho? Quer gancho de curiosidade, polêmico ou direto?"
- Envie 2-3 ganchos por vez
- Pergunte: "Curtiu algum? Quer mais nesse estilo ou diferente?"

### Se pedirem HASHTAGS:
- Pergunte o produto/nicho primeiro
- Envie 4-5 hashtags por vez (mix de populares + nichadas)
- Pergunte se quer mais ou de outro estilo

### Se pedirem ESTRUTURA DE VÍDEO:
- Pergunte o produto e objetivo (venda direta, engajamento, etc)
- Explique UMA parte por vez (gancho, meio, CTA)
- Pergunte se entendeu antes de passar pro próximo

## Tom e estilo:
- Linguagem jovem e acessível
- Use emojis com moderação (2-3 por mensagem)
- Seja amigável: "Bora lá!", "Show!", "Entendi!"
- Faça a pessoa se sentir guiada, não sobrecarregada

## Importante:
- Se a pessoa pedir "me ajuda com X", primeiro pergunte detalhes
- Nunca liste mais de 3-4 itens de uma vez
- Sempre termine oferecendo ajuda adicional: "Quer mais opções?" ou "Posso ajudar com mais alguma coisa?"

Você conhece produtos: suplementos, beleza, tecnologia, moda, casa e decoração.`;

    // Try models with fallback
    let response: Response | null = null;
    let lastError: string = "";

    for (const model of MODELS) {
      console.log(`Trying model: ${model}`);
      
      try {
        response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: "system", content: systemPrompt },
              ...messages,
            ],
            stream: true,
          }),
        });

        if (response.ok) {
          console.log(`Model ${model} succeeded`);
          break;
        }

        // If rate limited or payment required, don't try other models
        if (response.status === 429 || response.status === 402) {
          break;
        }

        lastError = `${model} failed with status ${response.status}`;
        console.error(lastError);
        response = null;
      } catch (err) {
        lastError = `${model} threw: ${err instanceof Error ? err.message : "unknown"}`;
        console.error(lastError);
        response = null;
      }
    }

    if (!response) {
      console.error("All models failed:", lastError);
      return new Response(JSON.stringify({ error: "Erro ao conectar com IA. Tente novamente." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Muitas requisições. Aguarde um momento e tente novamente." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos esgotados. Adicione mais créditos à sua conta." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "Erro ao conectar com IA" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("video-content-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
