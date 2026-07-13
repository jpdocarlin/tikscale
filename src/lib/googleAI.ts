import { getFreshAccessToken } from "@/lib/getFreshAccessToken";

// Use relative /api path for Vercel Serverless Functions
// No external backend URL needed - runs on the same Vercel deployment
const BACKEND_URL = typeof window !== 'undefined'
  ? '' // relative path in browser (same origin)
  : (import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000');

// Debug: log the backend URL at module load time
console.log('[googleAI] BACKEND_URL:', BACKEND_URL || '(relative /api)');
console.log('[googleAI] VITE_BACKEND_URL env:', import.meta.env.VITE_BACKEND_URL);

async function getAuthHeader(): Promise<Record<string, string>> {
  const token = await getFreshAccessToken();
  if (!token) {
    throw new Error("Sessão expirada. Faça login novamente.");
  }
  return {
    Authorization: `Bearer ${token}`
  };
}

export interface GenerateUGCImageParams {
  productName: string;
  productImageUrl?: string;
  influencer: { name: string; description: string; imageUrl?: string };
  pose: string;
  customPose?: string;
  environment: string;
  customEnvironment?: string;
  style: string;
  enhancements: string[];
  aspectRatio: string;
  additionalInfo?: string;
  scenarioImageUrl?: string;
}

export interface GenerateRealPromptParams {
  description?: string;
  videoUrlOrFile?: string | File;
  outfitImageUrl?: string;
  personaDescription?: string;
  personaImageUrl?: string;
  scenario?: string;
}

export interface AnalyzeVideoMovementsParams {
  videoUrlOrFile: string | File;
  context?: string;
  outfitImageUrl?: string;
}

// 1. Generate Persona Image
export async function generatePersonaImage(
  description: string,
  referenceImageUrl?: string,
  signal?: AbortSignal
): Promise<{ success: boolean; imageUrl: string }> {
  const headers = await getAuthHeader();

  const url = `${BACKEND_URL}/api/generate-persona-image`;
  console.log('[googleAI] Chamando Cloud Run:', url);
  console.log('[googleAI] description:', description?.substring(0, 50));

  const response = await fetch(url, {
    method: "POST",
    headers: {
      ...headers,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ description, referenceImageUrl }),
    signal,
  });
  console.log('[googleAI] Resposta do Cloud Run:', response.status, response.ok);

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || "Erro ao gerar imagem de persona.");
  }

  return await response.json();
}

// 2. Generate UGC Image
export async function generateUGCImage(
  requestData: GenerateUGCImageParams,
  signal?: AbortSignal
): Promise<{ success: boolean; imageUrl: string; prompt: string }> {
  const headers = await getAuthHeader();

  const response = await fetch(`${BACKEND_URL}/api/generate-ugc-image`, {
    method: "POST",
    headers: {
      ...headers,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestData),
    signal,
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || "Erro ao gerar imagem UGC.");
  }

  return await response.json();
}

// Helper: convert File to base64 data URL in the browser
async function fileToBase64(file: File): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // result is like "data:video/mp4;base64,AAAA..."
      const mimeType = result.split(';')[0].split(':')[1];
      const base64 = result.split(',')[1];
      resolve({ base64, mimeType });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// 3. Generate Real Prompt
export async function generateRealPrompt(
  params: GenerateRealPromptParams,
  signal?: AbortSignal
): Promise<{ prompt: string }> {
  const headers = await getAuthHeader();

  const body: any = {
    description: params.description,
    outfitImageUrl: params.outfitImageUrl,
    personaDescription: params.personaDescription,
    personaImageUrl: params.personaImageUrl,
    scenario: params.scenario,
  };

  // Convert video File to base64 (works with Vercel Functions JSON body)
  if (params.videoUrlOrFile instanceof File) {
    console.log('[googleAI] Convertendo vídeo para base64...');
    const { base64, mimeType } = await fileToBase64(params.videoUrlOrFile);
    body.videoBase64 = base64;
    body.videoMimeType = mimeType;
  } else if (params.videoUrlOrFile) {
    body.videoUrl = params.videoUrlOrFile;
  }

  const response = await fetch(`${BACKEND_URL}/api/generate-real-prompt`, {
    method: "POST",
    headers: {
      ...headers,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    signal,
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || "Erro ao gerar prompt.");
  }

  return await response.json();
}

// 4. Analyze Video Movements
export async function analyzeVideoMovements(
  params: AnalyzeVideoMovementsParams,
  signal?: AbortSignal
): Promise<{ prompt: string }> {
  const headers = await getAuthHeader();

  const body: any = {
    context: params.context,
    outfitImageUrl: params.outfitImageUrl,
  };

  // Convert video File to base64 (works with Vercel Functions JSON body)
  if (params.videoUrlOrFile instanceof File) {
    console.log('[googleAI] Convertendo vídeo para base64...');
    const { base64, mimeType } = await fileToBase64(params.videoUrlOrFile);
    body.videoBase64 = base64;
    body.videoMimeType = mimeType;
  } else {
    body.videoUrl = params.videoUrlOrFile;
  }

  const response = await fetch(`${BACKEND_URL}/api/analyze-video-movements`, {
    method: "POST",
    headers: {
      ...headers,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    signal,
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || "Erro ao analisar vídeo.");
  }

  return await response.json();
}
