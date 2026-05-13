const API_KEY = "AIzaSyA974eFCZcRQ6U8NbTMxKasxT0-9i_Z9gU";
const API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

async function test(model) {
  const res = await fetch(`${API_BASE}/${model}:generateContent?key=${API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: "Draw a simple circle. Return an image." }] }],
      generationConfig: { responseModalities: ["IMAGE"] }
    }),
  });
  console.log(model, res.status, await res.text());
}
await test("gemini-2.5-flash-image");
