const fs = require('fs');
const envFile = fs.readFileSync('.env', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const [key, ...values] = line.split('=');
  if (key && values.length > 0) env[key.trim()] = values.join('=').trim();
});

const supabaseUrl = env['VITE_SUPABASE_URL'];
const supabaseKey = env['VITE_SUPABASE_PUBLISHABLE_KEY'];

async function testFunction() {
  const authResponse = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      'apikey': supabaseKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: "testewebhook123@gmail.com",
      password: "12345678"
    })
  });
  
  const authData = await authResponse.json();
  const token = authData.access_token;

  const payload = {
    productName: "Test Product",
    influencer: {
      name: "Test Influencer",
      description: "Test Description"
      // not providing imageUrl to see what happens
    },
    pose: "frontal",
    environment: "casa",
    style: "casual",
    enhancements: "realismo-detalhamento",
    aspectRatio: "9:16"
  };

  const response = await fetch(`${supabaseUrl}/functions/v1/generate-ugc-image`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
      "apikey": supabaseKey
    },
    body: JSON.stringify(payload)
  });

  const text = await response.text();
  console.log("Status:", response.status);
  console.log("Response:", text);
}

testFunction();
