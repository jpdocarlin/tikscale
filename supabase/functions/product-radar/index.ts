
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const categories = [
  {
    key: "crescimento",
    label: "Mais Cresceram 24h",
    prompt: `Gere uma lista de 8 produtos REAIS que estão em alta no TikTok Shop Brasil agora. Foque em produtos que tiveram crescimento explosivo nas últimas 24 horas. Para cada produto inclua: name (nome do produto real e específico), category (categoria), price (preço em reais, número), commission (comissão em reais, número), growth (percentual de crescimento, número), videoCount (quantidade estimada de vídeos), competitionLevel ("baixa", "média" ou "alta"). Retorne APENAS um array JSON válido, sem markdown.`,
  },
  {
    key: "virais",
    label: "Mais Vídeos Virais",
    prompt: `Gere uma lista de 8 produtos REAIS que têm os vídeos mais virais no TikTok Shop Brasil agora. Produtos que criadores estão fazendo muitos vídeos sobre. Para cada produto inclua: name (nome do produto real e específico), category (categoria), price (preço em reais, número), commission (comissão em reais, número), growth (percentual de crescimento, número), videoCount (quantidade estimada de vídeos virais), competitionLevel ("baixa", "média" ou "alta"). Retorne APENAS um array JSON válido, sem markdown.`,
  },
  {
    key: "comissao",
    label: "Melhor Comissão",
    prompt: `Gere uma lista de 8 produtos REAIS do TikTok Shop Brasil com as melhores comissões para afiliados. Produtos que pagam bem e vendem consistentemente. Para cada produto inclua: name (nome do produto real e específico), category (categoria), price (preço em reais, número), commission (comissão em reais, número alto), growth (percentual de crescimento, número), videoCount (quantidade estimada de vídeos), competitionLevel ("baixa", "média" ou "alta"). Retorne APENAS um array JSON válido, sem markdown.`,
  },
  {
    key: "oportunidade",
    label: "Pouca Concorrência",
    prompt: `Gere uma lista de 8 produtos REAIS do TikTok Shop Brasil que são oportunidades com pouca concorrência. Produtos que vendem bem mas poucos afiliados estão promovendo. Para cada produto inclua: name (nome do produto real e específico), category (categoria), price (preço em reais, número), commission (comissão em reais, número), growth (percentual de crescimento, número), videoCount (quantidade estimada de vídeos, número baixo), competitionLevel ("baixa"). Retorne APENAS um array JSON válido, sem markdown.`,
  },
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const today = new Date().toISOString().split("T")[0];

    // Check if we already have today's data
    const { data: existing } = await supabase
      .from("product_radar")
      .select("category")
      .eq("radar_date", today);

    const existingCategories = new Set(
      (existing || []).map((r: any) => r.category)
    );

    const missingCategories = categories.filter(
      (c) => !existingCategories.has(c.key)
    );

    // Generate missing categories
    for (const cat of missingCategories) {
      try {
        const aiResponse = await fetch(
          "https://ai.gateway.lovable.dev/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
            },
            body: JSON.stringify({
              model: "google/gemini-2.5-flash",
              messages: [
                {
                  role: "system",
                  content:
                    "Você é um especialista em TikTok Shop Brasil e e-commerce. Gere dados realistas e atualizados sobre produtos trending. Responda APENAS com JSON válido, sem markdown, sem ```.",
                },
                { role: "user", content: cat.prompt },
              ],
              temperature: 0.8,
            }),
          }
        );

        const rawText = await aiResponse.text();
        console.log(`AI raw response for ${cat.key}:`, rawText.substring(0, 200));
        
        let aiData;
        try {
          aiData = JSON.parse(rawText);
        } catch {
          console.error(`Failed to parse AI response for ${cat.key}:`, rawText.substring(0, 500));
          continue;
        }
        
        const content = aiData.choices?.[0]?.message?.content || "[]";
        
        // Clean markdown if present
        let cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        const products = JSON.parse(cleaned);

        await supabase.from("product_radar").insert({
          radar_date: today,
          category: cat.key,
          products,
        });
      } catch (e) {
        console.error(`Error generating ${cat.key}:`, e);
      }
    }

    // Fetch all today's data
    const { data: radarData } = await supabase
      .from("product_radar")
      .select("category, products")
      .eq("radar_date", today);

    const result: Record<string, any[]> = {};
    for (const row of radarData || []) {
      result[row.category] = row.products;
    }

    return new Response(JSON.stringify({ success: true, data: result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Radar error:", error);
    return new Response(
      JSON.stringify({ success: false, error: String(error) }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
