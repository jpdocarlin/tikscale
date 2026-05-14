const fs = require('fs');
const envFile = fs.readFileSync('.env', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const [key, ...values] = line.split('=');
  if (key && values.length > 0) env[key.trim()] = values.join('=').trim();
});

const supabaseUrl = env['VITE_SUPABASE_URL'];
const supabaseKey = env['VITE_SUPABASE_PUBLISHABLE_KEY'];

async function test() {
  const authResponse = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { 'apikey': supabaseKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: "testewebhook123@gmail.com", password: "12345678" })
  });
  const authData = await authResponse.json();
  const token = authData.access_token;

  // Test 1: OLD format (what cached browsers send)
  console.log("=== TEST 1: Old payload format ===");
  const oldPayload = {
    productName: "Sérum Vitamina C",
    influencerDescription: "young Brazilian woman, age 25, blonde hair",
    pose: "frontal",
    environment: "casa",
    style: "casual",
    enhancements: "realismo-detalhamento",
    aspectRatio: "9:16"
  };

  const res1 = await fetch(`${supabaseUrl}/functions/v1/generate-ugc-image`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
      "apikey": supabaseKey
    },
    body: JSON.stringify(oldPayload)
  });
  console.log("Status:", res1.status);
  const text1 = await res1.text();
  console.log("Response:", text1.substring(0, 500));

  // Test 2: NEW format (what updated browsers send)
  console.log("\n=== TEST 2: New payload format ===");
  const newPayload = {
    productName: "Sérum Vitamina C",
    influencer: {
      name: "Brenda",
      description: "young Brazilian woman, age 25, blonde hair"
    },
    pose: "frontal",
    environment: "casa",
    style: "casual",
    enhancements: ["realismo-detalhamento"],
    aspectRatio: "9:16"
  };

  const res2 = await fetch(`${supabaseUrl}/functions/v1/generate-ugc-image`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
      "apikey": supabaseKey
    },
    body: JSON.stringify(newPayload)
  });
  console.log("Status:", res2.status);
  const text2 = await res2.text();
  console.log("Response:", text2.substring(0, 500));
}

test();
