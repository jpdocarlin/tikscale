import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Mapeamento dos produtos CenterPag => quantidade de créditos
const PRODUCT_CREDITS: Record<string, number> = {
  PPU38CQB2MS: 50,   // Pacote 50 créditos (R$ 59,90)
  PPU38CQB2N0: 100,  // Pacote 100 créditos (R$ 99,90)
};

function extractProductCode(payload: any): string | null {
  // Tenta vários campos possíveis dependendo do gateway
  const candidates = [
    payload.product_code,
    payload.product?.code,
    payload.product?.id,
    payload.plan?.code,
    payload.checkout_code,
    payload.offer_code,
    payload.code,
  ];
  for (const c of candidates) {
    if (typeof c === "string") {
      // Procura código PPU... dentro da string
      const match = c.match(/PPU[A-Z0-9]+/i);
      if (match) return match[0].toUpperCase();
      if (PRODUCT_CREDITS[c]) return c;
    }
  }
  // Fallback: procura PPU em qualquer campo string do payload
  const json = JSON.stringify(payload);
  const match = json.match(/PPU[A-Z0-9]+/);
  return match ? match[0].toUpperCase() : null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    console.log("Credits webhook received:", JSON.stringify(payload, null, 2));

    const status = payload.sale_status_enum || payload.status;
    const customerEmail = (payload.customer?.email || payload.email || "").toLowerCase().trim();

    if (!customerEmail) {
      return new Response(
        JSON.stringify({ error: "No customer email" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Apenas pagamentos aprovados
    const approvedStatuses = ["approved", "paid", "complete", "completed", "2", 2];
    const isApproved = approvedStatuses.includes(status) ||
                       (typeof status === "string" && (status.toLowerCase().includes("approved") || status.toLowerCase().includes("paid")));

    if (!isApproved) {
      console.log(`Pagamento não aprovado. Status: ${status}`);
      return new Response(
        JSON.stringify({ message: "Payment not approved", status }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const productCode = extractProductCode(payload);
    if (!productCode || !PRODUCT_CREDITS[productCode]) {
      console.error(`Produto não reconhecido: ${productCode}`);
      return new Response(
        JSON.stringify({ error: "Unknown product code", productCode }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const creditsToAdd = PRODUCT_CREDITS[productCode];

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Localiza o usuário pelo email
    const { data: usersList } = await supabaseAdmin.auth.admin.listUsers();
    let user = usersList?.users?.find(u => u.email?.toLowerCase() === customerEmail);

    // Cria o usuário se não existir (com senha padrão)
    if (!user) {
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: customerEmail,
        password: "12345678",
        email_confirm: true,
        user_metadata: {
          name: payload.customer?.full_name || payload.customer?.name || "",
          created_via: "credits_webhook",
        },
      });
      if (createError || !newUser.user) {
        console.error("Erro ao criar usuário:", createError);
        return new Response(
          JSON.stringify({ error: "Failed to create user", details: createError?.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      user = newUser.user;
      console.log(`Usuário criado: ${customerEmail}`);
    }

    // Adiciona os créditos diretamente (sem RPC, pois RPC exige admin auth.uid)
    const { data: existingCredits } = await supabaseAdmin
      .from("user_credits")
      .select("paid_credits, total_purchased")
      .eq("user_id", user.id)
      .maybeSingle();

    if (existingCredits) {
      const { error: updError } = await supabaseAdmin
        .from("user_credits")
        .update({
          paid_credits: existingCredits.paid_credits + creditsToAdd,
          total_purchased: existingCredits.total_purchased + creditsToAdd,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);
      if (updError) throw updError;
    } else {
      const { error: insError } = await supabaseAdmin
        .from("user_credits")
        .insert({
          user_id: user.id,
          paid_credits: creditsToAdd,
          total_purchased: creditsToAdd,
        });
      if (insError) throw insError;
    }

    // Log da transação
    await supabaseAdmin.from("credit_transactions").insert({
      user_id: user.id,
      amount: creditsToAdd,
      type: "purchase",
      description: `Compra de ${creditsToAdd} créditos (${productCode})`,
    });

    console.log(`✓ ${creditsToAdd} créditos adicionados para ${customerEmail}`);

    return new Response(
      JSON.stringify({
        success: true,
        email: customerEmail,
        credits_added: creditsToAdd,
        product_code: productCode,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("Webhook error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: "Internal server error", details: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
