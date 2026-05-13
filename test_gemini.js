const fetch = require('node-fetch');
const API_KEY = "AIzaSyA974eFCZcRQ6U8NbTMxKasxT0-9i_Z9gU";
const MODEL = "gemini-2.0-flash-exp-image-generation";
const API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

async function test() {
  const res = await fetch(`${API_BASE}/${MODEL}:generateContent?key=${API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: "Draw a cat" }] }],
    }),
  });
  console.log(res.status, await res.text());
}
test();
