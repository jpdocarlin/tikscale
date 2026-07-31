import { createClient } from '@supabase/supabase-js';

/**
 * Applyfy Webhook — Vercel Serverless Function
 * 
 * Quando a Applyfy envia notificação de pagamento:
 * - Pagamento aprovado → cria o usuário no Supabase Auth
 * - Reembolso/cancelamento → deleta o usuário e seus dados
 * 
 * URL para configurar na Applyfy: https://www.tikiaa.site/api/applyfy-webhook
 */

// ─── Helpers para extrair dados do payload ──────────────────────────

function extractEmail(payload) {
  const candidates = [
    payload.customer?.email,
    payload.data?.customer?.email,
    payload.buyer?.email,
    payload.data?.buyer?.email,
    payload.cliente?.email,
    payload.data?.cliente?.email,
    payload.email,
    payload.data?.email,
    payload.customer_email,
    payload.buyer_email,
  ];
  for (const c of candidates) {
    if (typeof c === "string" && c.includes("@")) {
      return c.toLowerCase().trim();
    }
  }
  // Fallback: procura qualquer campo que pareça email no payload inteiro
  const json = JSON.stringify(payload);
  const emailMatch = json.match(/[\w.-]+@[\w.-]+\.\w{2,}/);
  if (emailMatch) return emailMatch[0].toLowerCase().trim();
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
    payload.cliente?.nome,
    payload.data?.cliente?.nome,
    payload.customer_name,
    payload.buyer_name,
    payload.name,
    payload.data?.name,
    payload.full_name,
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
    payload.type,
    payload.action,
    payload.sale_status_enum,
    payload.status,
    payload.data?.status,
    payload.sale_status,
    payload.data?.sale_status,
    payload.payment_status,
    payload.data?.payment_status,
    payload.transaction_status,
    payload.data?.transaction_status,
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
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Supabase admin client
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    return res.status(500).json({ error: "Server configuration error" });
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  try {
    // Aceitar tanto body JSON quanto query params (GET) ou form-urlencoded
    let payload = {};
    if (req.method === "GET") {
      payload = req.query || {};
    } else {
      payload = req.body || {};
      // Se body vier como string, tentar parsear
      if (typeof payload === "string") {
        try { payload = JSON.parse(payload); } catch { payload = { raw: payload }; }
      }
    }

    console.log("Applyfy webhook received:", JSON.stringify(payload, null, 2));
    console.log("Method:", req.method);
    console.log("Content-Type:", req.headers["content-type"]);

    // ─── SALVAR LOG DO PAYLOAD (debug) ──────────────────────────────
    // Salva cada request recebida pra poder debugar o formato da Applyfy
    try {
      await supabaseAdmin.from("webhook_logs").insert({
        source: "applyfy",
        method: req.method,
        content_type: req.headers["content-type"] || "unknown",
        payload: payload,
        headers: {
          "user-agent": req.headers["user-agent"],
          "content-type": req.headers["content-type"],
          "x-forwarded-for": req.headers["x-forwarded-for"],
        },
      });
    } catch (logErr) {
      // Se a tabela não existir, só loga no console
      console.log("Could not save webhook log (table may not exist):", logErr.message);
    }

    const status = extractStatus(payload);
    const customerEmail = extractEmail(payload);
    const customerName = extractName(payload);

    console.log("Extracted - status:", status, "email:", customerEmail, "name:", customerName);

    if (!customerEmail) {
      console.error("No customer email found in payload");
      return res.status(200).json({ 
        error: "No customer email provided",
        received_payload: payload,
      });
    }

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
      // Se não reconhece o status, tenta criar o usuario mesmo assim
      // (muitas plataformas enviam só os dados sem status explícito)
      if (customerEmail) {
        console.log(`Status não reconhecido (${status}), mas email encontrado. Tentando criar usuário...`);
      } else {
        console.log(`Payment not approved. Status: ${status}`);
        return res.status(200).json({ message: "Payment not approved, no action taken", status });
      }
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
    return res.status(200).json({ error: "Internal server error", details: errorMessage });
  }
}
