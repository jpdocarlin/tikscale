const fs = require('fs');
const envFile = fs.readFileSync('.env', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const [key, ...values] = line.split('=');
  if (key && values.length > 0) env[key.trim()] = values.join('=').trim();
});

const GOOGLE_API_KEY = env['GOOGLE_API_KEY'];
const API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

async function test() {
  const response = await fetch(`${API_BASE}/gemini-2.5-flash-image:generateContent?key=${GOOGLE_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: "A realistic portrait of a man, 9:16 aspect ratio." }] }],
      generationConfig: { 
        responseModalities: ["IMAGE"]
      },
    }),
  });
  
  console.log("Status:", response.status);
  const data = await response.json();
  if (data.error) {
    console.log("Error:", data.error);
    return;
  }
  
  const b64 = data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (b64) {
    const buffer = Buffer.from(b64, 'base64');
    fs.writeFileSync('test_gemini.png', buffer);
    console.log("Saved test_gemini.png. File size:", buffer.length);
  }
}

test();
