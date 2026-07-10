import { getFreshAccessToken } from "@/lib/getFreshAccessToken";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

// Debug: log the backend URL at module load time
console.log('[googleAI] BACKEND_URL configurado:', BACKEND_URL);
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

// 3. Generate Real Prompt
export async function generateRealPrompt(params: GenerateRealPromptParams): Promise<{ prompt: string }> {
  const headers = await getAuthHeader();
  
  let response: Response;

  if (params.videoUrlOrFile instanceof File) {
    const formData = new FormData();
    formData.append("video", params.videoUrlOrFile);
    if (params.description) formData.append("description", params.description);
    if (params.outfitImageUrl) formData.append("outfitImageUrl", params.outfitImageUrl);
    if (params.personaDescription) formData.append("personaDescription", params.personaDescription);
    if (params.personaImageUrl) formData.append("personaImageUrl", params.personaImageUrl);
    if (params.scenario) formData.append("scenario", params.scenario);

    response = await fetch(`${BACKEND_URL}/api/generate-real-prompt`, {
      method: "POST",
      headers,
      body: formData,
    });
  } else {
    const body: any = {
      description: params.description,
      outfitImageUrl: params.outfitImageUrl,
      personaDescription: params.personaDescription,
      personaImageUrl: params.personaImageUrl,
      scenario: params.scenario,
    };
    if (params.videoUrlOrFile) {
      body.videoUrl = params.videoUrlOrFile;
    }

    response = await fetch(`${BACKEND_URL}/api/generate-real-prompt`, {
      method: "POST",
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
  }

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || "Erro ao gerar prompt.");
  }

  return await response.json();
}

// 4. Analyze Video Movements
export async function analyzeVideoMovements(params: AnalyzeVideoMovementsParams): Promise<{ prompt: string }> {
  const headers = await getAuthHeader();
  const formData = new FormData();

  if (params.videoUrlOrFile instanceof File) {
    formData.append("video", params.videoUrlOrFile);
  } else {
    formData.append("videoUrl", params.videoUrlOrFile);
  }

  if (params.context) formData.append("context", params.context);
  if (params.outfitImageUrl) formData.append("outfitImageUrl", params.outfitImageUrl);

  const response = await fetch(`${BACKEND_URL}/api/analyze-video-movements`, {
    method: "POST",
    headers,
    body: formData,
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || "Erro ao analisar vídeo.");
  }

  return await response.json();
}
