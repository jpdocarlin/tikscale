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
  const imgData = fs.readFileSync('public/products/luz-pisca-pisca.webp');
  const b64 = imgData.toString('base64');
  
  const response = await fetch(`${API_BASE}/imagen-3.0-generate-001:generateContent?key=${GOOGLE_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ 
        role: "user", 
        parts: [
          { text: "A realistic portrait of a man holding this product." },
          { inlineData: { mimeType: "image/webp", data: b64 } }
        ] 
      }],
      generationConfig: { 
        responseModalities: ["IMAGE"]
      },
    }),
  });
  
  console.log("Status:", response.status);
  const data = await response.json();
  if (data.error) {
    console.log("Error:", data.error.message);
    return;
  }
  
  const outB64 = data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (outB64) {
    console.log("Generated successfully!");
  } else {
    console.log("No image data:", JSON.stringify(data).substring(0, 500));
  }
}

test();
