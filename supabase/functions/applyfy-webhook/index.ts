import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Extrai o email do cliente de vários campos possíveis do payload.
 * Plataformas brasileiras costumam variar a estrutura.
 */
function extractEmail(payload: any): string | null {
  const candidates = [
    payload.customer?.email,
    payload.data?.customer?.email,
    payload.buyer?.email,
    payload.data?.buyer?.email,
    payload.email,
    payload.data?.email,
  ];
  for (const c of candidates) {
    if (typeof c === "string" && c.includes("@")) {
      return c.toLowerCase().trim();
    }
  }
  return null;
}

/**
 * Extrai o nome do cliente de vários campos possíveis do payload.
 */
function extractName(payload: any): string {
  const candidates = [
    payload.customer?.name,
    payload.customer?.full_name,
    payload.data?.customer?.name,
    payload.data?.customer?.full_name,
    payload.buyer?.name,
    payload.data?.buyer?.name,
    payload.name,
    payload.data?.name,
  ];
  for (const c of candidates) {
    if (typeof c === "string" && c.trim()) {
      return c.trim();
    }
  }
  return "";
}

/**
 * Extrai o status do pagamento de vários campos possíveis.
 */
function extractStatus(payload: any): string {
  const candidates = [
    payload.event,
    payload.sale_status_enum,
    payload.status,
    payload.data?.status,
    payload.sale_status,
    payload.data?.sale_status,
    payload.payment_status,
    payload.data?.payment_status,
  ];
  for (const c of candidates) {
    if (c !== undefined && c !== null) {
      return String(c).toLowerCase().trim();
    }
  }
  return "";
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload = await req.json();

    console.log("Applyfy webhook received:", JSON.stringify(payload, null, 2));

    const status = extractStatus(payload);
    const customerEmail = extractEmail(payload);
    const customerName = extractName(payload);

    if (!customerEmail) {
      console.error("No customer email found in payload");
      return new Response(
        JSON.stringify({ error: "No customer email provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // ─── REFUND / CHARGEBACK / CANCELAMENTO ───────────────────────────
    const refundKeywords = [
      "refund", "refunded", "chargeback", "chargedback",
      "canceled", "cancelled", "cancel",
      "order_refunded", "sale_refunded", "payment_refunded",
      "order_canceled", "order_cancelled",
    ];
    const refundStatusCodes = ["8", "10"];

    const isRefund = refundKeywords.some(kw => status.includes(kw)) ||
                     refundStatusCodes.includes(status);

    if (isRefund) {
      console.log(`Refund detected for: ${customerEmail}. Deleting user...`);

      // Find and delete the user
      const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
      const userToDelete = existingUsers?.users?.find(u => u.email === customerEmail);

      if (!userToDelete) {
        console.log(`User not found for deletion: ${customerEmail}`);
        return new Response(
          JSON.stringify({ message: "User not found, nothing to delete", email: customerEmail }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Delete user data from tables first (profiles, user_stats, etc.)
      await supabaseAdmin.from("profiles").delete().eq("user_id", userToDelete.id);
      await supabaseAdmin.from("user_stats").delete().eq("user_id", userToDelete.id);
      await supabaseAdmin.from("posting_goals").delete().eq("user_id", userToDelete.id);
      await supabaseAdmin.from("post_history").delete().eq("user_id", userToDelete.id);

      // Delete the user from auth
      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userToDelete.id);

      if (deleteError) {
        console.error("Error deleting user:", deleteError);
        return new Response(
          JSON.stringify({ error: "Failed to delete user", details: deleteError.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log(`User deleted successfully: ${customerEmail}`);

      return new Response(
        JSON.stringify({
          success: true,
          message: "User deleted due to refund",
          email: customerEmail
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ─── PAGAMENTO APROVADO ───────────────────────────────────────────
    const approvedKeywords = [
      "approved", "paid", "complete", "completed",
      "order_approved", "sale_approved", "payment_approved",
      "order_paid",
    ];
    const approvedStatusCodes = ["2"];

    const isApproved = approvedKeywords.some(kw => status.includes(kw)) ||
                       approvedStatusCodes.includes(status);

    if (!isApproved) {
      console.log(`Payment not approved. Status: ${status}`);
      return new Response(
        JSON.stringify({ message: "Payment not approved, no action taken", status }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if user already exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const userExists = existingUsers?.users?.some(u => u.email === customerEmail);

    if (userExists) {
      console.log(`User already exists: ${customerEmail}`);
      return new Response(
        JSON.stringify({ message: "User already exists", email: customerEmail }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create new user with default password
    const defaultPassword = "12345678";

    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: customerEmail,
      password: defaultPassword,
      email_confirm: true,
      user_metadata: {
        name: customerName,
        created_via: "applyfy_webhook",
      },
    });

    if (createError) {
      console.error("Error creating user:", createError);
      return new Response(
        JSON.stringify({ error: "Failed to create user", details: createError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`User created successfully: ${customerEmail}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "User created successfully",
        email: customerEmail,
        userId: newUser.user?.id
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("Applyfy webhook error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: "Internal server error", details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
