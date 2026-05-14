import { createClient } from "@supabase/supabase-js";

// Pegando variaveis do .env local
import * as dotenv from "dotenv";
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testFunction() {
  console.log("Logging in...");
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: "testewebhook123@gmail.com",
    password: "12345678"
  });

  if (authError) {
    console.error("Auth error:", authError.message);
    return;
  }

  const token = authData.session?.access_token;
  console.log("Logged in successfully. Access Token acquired.");

  const payload = {
    productName: "Test Product",
    influencerDescription: "Test Description",
    pose: "frontal",
    environment: "casa",
    style: "casual",
    enhancements: "realismo-detalhamento",
    aspectRatio: "9:16",
    // Not sending the nested influencer object to simulate the old frontend cache
  };

  console.log("Calling generate-ugc-image...");
  const response = await fetch(`${supabaseUrl}/functions/v1/generate-ugc-image`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  const text = await response.text();
  console.log("Status:", response.status);
  console.log("Response:", text);
}

testFunction();
