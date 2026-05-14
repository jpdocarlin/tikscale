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

  const payload = {
    productName: "Luz Pisca Pisca Natal",
    influencer: {
      name: "Brenda",
      description: "young Brazilian woman"
    },
    pose: "frontal",
    environment: "casa",
    style: "casual",
    enhancements: [],
    aspectRatio: "9:16",
    productImageUrl: "/products/luz-pisca-pisca.webp"
  };

  console.log("Sending payload with relative product image...");
  const res = await fetch(`${supabaseUrl}/functions/v1/generate-ugc-image`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
      "apikey": supabaseKey
    },
    body: JSON.stringify(payload)
  });
  
  console.log("Status:", res.status);
  const text = await res.text();
  console.log("Response:", text.substring(0, 500));
}

test();
