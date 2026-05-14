const fs = require('fs');
const envFile = fs.readFileSync('.env', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const [key, ...values] = line.split('=');
  if (key && values.length > 0) env[key.trim()] = values.join('=').trim();
});

// Check if there's a GOOGLE_API_KEY in env
console.log("Local GOOGLE_API_KEY:", env['GOOGLE_API_KEY'] ? "Found (length: " + env['GOOGLE_API_KEY'].length + ")" : "NOT FOUND");

// Test Gemini Flash Image directly
const apiKey = env['GOOGLE_API_KEY'];
if (!apiKey) {
  console.log("No local Google API key found. The key is set as a Supabase secret.");
  console.log("Testing Supabase edge function logs...");
}

// Let's test the models via the Supabase function with more detail
const supabaseUrl = env['VITE_SUPABASE_URL'];
const supabaseKey = env['VITE_SUPABASE_PUBLISHABLE_KEY'];

async function test() {
  // Login
  const authResponse = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { 'apikey': supabaseKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: "testewebhook123@gmail.com", password: "12345678" })
  });
  const authData = await authResponse.json();
  const token = authData.access_token;

  // Simple text-only test with new format
  const payload = {
    productName: "Test",
    influencer: { name: "Test", description: "a person" },
    pose: "frontal",
    environment: "casa",
    style: "casual",
    enhancements: [],
    aspectRatio: "1:1"
  };

  console.log("\nTesting generate-ugc-image...");
  const res = await fetch(`${supabaseUrl}/functions/v1/generate-ugc-image`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
      "apikey": supabaseKey
    },
    body: JSON.stringify(payload)
  });
  
  const text = await res.text();
  console.log("Status:", res.status);
  console.log("Headers:", Object.fromEntries(res.headers.entries()));
  console.log("Response:", text);
}

test();
