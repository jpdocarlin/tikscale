import { createClient } from '@supabase/supabase-js';

/**
 * Applyfy Webhook — Vercel Serverless Function
 * 
 * Quando a Applyfy envia notificação de pagamento:
 * - Pagamento aprovado → cria o usuário no Supabase Auth
 * - Reembolso/cancelamento → deleta o usuário e seus dados
 * 
 * URL para configurar na Applyfy: https://seudominio.vercel.app/api/applyfy-webhook
 */

// ─── Helpers para extrair dados do payload ──────────────────────────

function extractEmail(payload) {
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

function extractName(payload) {
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

function extractStatus(payload) {
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

// ─── Handler principal ──────────────────────────────────────────────

export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "authorization, x-client-info, apikey, content-type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const payload = req.body;

    console.log("Applyfy webhook received:", JSON.stringify(payload, null, 2));

    const status = extractStatus(payload);
    const customerEmail = extractEmail(payload);
    const customerName = extractName(payload);

    if (!customerEmail) {
      console.error("No customer email found in payload");
      return res.status(400).json({ error: "No customer email provided" });
    }

    // Supabase admin client (service role para criar/deletar usuários)
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
      return res.status(500).json({ error: "Server configuration error" });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // ─── REFUND / CHARGEBACK / CANCELAMENTO ─────────────────────────
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

      const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
      const userToDelete = existingUsers?.users?.find(u => u.email === customerEmail);

      if (!userToDelete) {
        console.log(`User not found for deletion: ${customerEmail}`);
        return res.status(200).json({ message: "User not found, nothing to delete", email: customerEmail });
      }

      // Deleta dados do usuário nas tabelas
      await supabaseAdmin.from("profiles").delete().eq("user_id", userToDelete.id);
      await supabaseAdmin.from("user_stats").delete().eq("user_id", userToDelete.id);
      await supabaseAdmin.from("posting_goals").delete().eq("user_id", userToDelete.id);
      await supabaseAdmin.from("post_history").delete().eq("user_id", userToDelete.id);

      // Deleta o usuário do auth
      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userToDelete.id);

      if (deleteError) {
        console.error("Error deleting user:", deleteError);
        return res.status(500).json({ error: "Failed to delete user", details: deleteError.message });
      }

      console.log(`User deleted successfully: ${customerEmail}`);
      return res.status(200).json({
        success: true,
        message: "User deleted due to refund",
        email: customerEmail,
      });
    }

    // ─── PAGAMENTO APROVADO ─────────────────────────────────────────
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
      return res.status(200).json({ message: "Payment not approved, no action taken", status });
    }

    // Checa se o usuário já existe
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const userExists = existingUsers?.users?.some(u => u.email === customerEmail);

    if (userExists) {
      console.log(`User already exists: ${customerEmail}`);
      return res.status(200).json({ message: "User already exists", email: customerEmail });
    }

    // Cria o usuário com senha padrão
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
      return res.status(500).json({ error: "Failed to create user", details: createError.message });
    }

    console.log(`User created successfully: ${customerEmail}`);

    return res.status(200).json({
      success: true,
      message: "User created successfully",
      email: customerEmail,
      userId: newUser.user?.id,
    });

  } catch (error) {
    console.error("Applyfy webhook error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({ error: "Internal server error", details: errorMessage });
  }
}
