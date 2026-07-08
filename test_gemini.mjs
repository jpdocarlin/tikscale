const API_KEY = "AIzaSyCPcIzharZJ3lgaGoru2OZfzs2fcWIrvkk";
const API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

async function testGenerateContent(model) {
  try {
    const res = await fetch(`${API_BASE}/${model}:generateContent?key=${API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: "Responda com apenas uma palavra: OK" }] }]
      }),
    });
    console.log(`[generateContent] ${model}: Status ${res.status}`, await res.text());
  } catch (e) {
    console.error(`[generateContent] ${model} failed:`, e);
  }
}

async function testImageGen(model) {
  try {
    const res = await fetch(`${API_BASE}/${model}:generateContent?key=${API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: "A photo of a happy brown puppy." }] }],
        generationConfig: { responseModalities: ["TEXT", "IMAGE"] }
      }),
    });
    console.log(`[ImageGen] ${model}: Status ${res.status}`, await res.text().then(t => t.substring(0, 300) + "..."));
  } catch (e) {
    console.error(`[ImageGen] ${model} failed:`, e);
  }
}

async function testPredict(model) {
  try {
    const res = await fetch(`${API_BASE}/${model}:predict?key=${API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        instances: [{ prompt: "A photo of a happy brown puppy." }],
        parameters: { sampleCount: 1, aspectRatio: "1:1" }
      }),
    });
    console.log(`[predict] ${model}: Status ${res.status}`, await res.text().then(t => t.substring(0, 300) + "..."));
  } catch (e) {
    console.error(`[predict] ${model} failed:`, e);
  }
}

console.log("--- STARTING TESTS ---");
await testGenerateContent("gemini-2.5-flash");
await testImageGen("gemini-2.5-flash-image");
await testPredict("imagen-4.0-generate-001");



