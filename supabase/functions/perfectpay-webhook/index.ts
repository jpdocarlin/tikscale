import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    
    console.log("PerfectPay webhook received:", JSON.stringify(payload, null, 2));

    const status = payload.sale_status_enum || payload.status;
    const customerEmail = payload.customer?.email || payload.email;
    const customerName = payload.customer?.full_name || payload.customer?.name || payload.name;

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

    // Check if this is a REFUND event
    const refundStatuses = ["refunded", "refund", "chargeback", "chargedback", "canceled", "cancelled", "8", 8, "10", 10];
    const isRefund = refundStatuses.includes(status) || 
                     status?.toLowerCase?.()?.includes("refund") ||
                     status?.toLowerCase?.()?.includes("chargeback") ||
                     status?.toLowerCase?.()?.includes("cancel");

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

    // Check if payment is approved (PerfectPay uses different status codes)
    const approvedStatuses = ["approved", "paid", "complete", "2", 2];
    const isApproved = approvedStatuses.includes(status) || 
                       status?.toLowerCase?.()?.includes("approved") ||
                       status?.toLowerCase?.()?.includes("paid");

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
        name: customerName || "",
        created_via: "perfectpay_webhook",
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
    console.error("Webhook error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: "Internal server error", details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
