import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export function getGoogleApiKey() {
  const key = process.env.GOOGLE_API_KEY;
  if (!key) throw new Error('GOOGLE_API_KEY not configured on backend.');
  return key;
}

export async function requireAuth(req) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.split(' ')[1];
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  return user;
}

export async function fetchWithTimeout(url, options = {}, timeoutMs = 55000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('A requisição à IA excedeu o tempo limite. Tente novamente.');
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

export function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const len = bytes.byteLength;
  const chunkSize = 8192;
  for (let i = 0; i < len; i += chunkSize) {
    const chunk = bytes.subarray(i, Math.min(i + chunkSize, len));
    binary += String.fromCharCode.apply(null, chunk);
  }
  return btoa(binary);
}

export async function urlToInlineData(imageUrl) {
  try {
    if (imageUrl.startsWith('data:')) {
      const m = imageUrl.match(/^data:([^;]+);base64,(.+)$/);
      if (m) return { mimeType: m[1], data: m[2] };
      return null;
    }
    const r = await fetch(imageUrl);
    if (!r.ok) return null;
    const buf = await r.arrayBuffer();
    return {
      mimeType: r.headers.get('content-type') || 'image/jpeg',
      data: arrayBufferToBase64(buf)
    };
  } catch (e) {
    console.warn('Failed to convert image:', e);
    return null;
  }
}

export function extractImageFromGeminiResponse(data) {
  const parts = data.candidates?.[0]?.content?.parts;
  if (parts) {
    for (const p of parts) {
      if (p.inlineData?.data) {
        return `data:${p.inlineData.mimeType || 'image/png'};base64,${p.inlineData.data}`;
      }
    }
  }
  return null;
}

export const API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
export const GEMINI_IMAGE_MODEL = 'gemini-2.5-flash-image';
export const GEMINI_TEXT_MODEL = 'gemini-2.5-flash';
export const IMAGEN_MODEL = 'imagen-4.0-generate-001';
