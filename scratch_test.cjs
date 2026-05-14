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
  // Login as a normal user
  const authResponse = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { 'apikey': supabaseKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: "testewebhook123@gmail.com", password: "12345678" })
  });
  const authData = await authResponse.json();
  const token = authData.access_token;
  const userId = authData.user?.id;
  console.log("User ID:", userId);

  // Call get_daily_usage RPC
  const usageRes = await fetch(`${supabaseUrl}/rest/v1/rpc/get_daily_usage`, {
    method: 'POST',
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ _user_id: userId })
  });
  const usageData = await usageRes.json();
  console.log("get_daily_usage response:", JSON.stringify(usageData, null, 2));

  // Call increment_usage RPC
  const incRes = await fetch(`${supabaseUrl}/rest/v1/rpc/increment_usage`, {
    method: 'POST',
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ _user_id: userId, _type: 'images' })
  });
  const incData = await incRes.json();
  console.log("increment_usage response:", JSON.stringify(incData, null, 2));
}

test();
