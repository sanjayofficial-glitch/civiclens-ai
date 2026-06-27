import { GoogleGenAI, Type, Schema } from '@google/genai';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from '@/lib/firebase/firebase';
import type { IssueAiAnalysis } from '@blockseblock/shared';

// ── Schema for structured Gemini output (client-side fallback) ──────────

const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    category: {
      type: Type.STRING,
      enum: ['pothole', 'streetlight', 'water_leak', 'garbage', 'graffiti', 'sidewalk', 'other'],
    },
    severity: {
      type: Type.STRING,
      enum: ['low', 'medium', 'high', 'critical'],
    },
    confidence: { type: Type.NUMBER },
    suggestedTitle: { type: Type.STRING },
    suggestedDescription: { type: Type.STRING },
    suggestedTags: { type: Type.ARRAY, items: { type: Type.STRING } },
    duplicateProbability: { type: Type.NUMBER },
  },
  required: [
    'category',
    'severity',
    'confidence',
    'suggestedTitle',
    'suggestedDescription',
    'suggestedTags',
    'duplicateProbability',
  ],
};

// ── Type for the callable response ──────────────────────────────────────

interface CallableResponse {
  status: string;
  analysis: {
    category: string;
    severity: string;
    confidence: number;
    title: string;
    description: string;
    suggestedTags: string[];
    duplicateScore: number;
    safetyConcern: boolean;
  };
}

/**
 * Attempt to call the server-side `analyzeIssueImage` Cloud Function.
 * Returns the analysis result, or null if the callable is unavailable/errors.
 */
async function analyzeViaCallable(imageUrl: string, title?: string, description?: string): Promise<IssueAiAnalysis | null> {
  try {
    const functions = getFunctions(app, 'us-central1');
    const callable = httpsCallable<{ imageUrl: string; title?: string; description?: string }, CallableResponse>(
      functions,
      'analyzeIssueImage',
    );
    const result = await callable({ imageUrl, title, description });

    if (result.data?.status === 'success' && result.data?.analysis) {
      const a = result.data.analysis;
      return {
        category: a.category as IssueAiAnalysis['category'],
        severity: a.severity as IssueAiAnalysis['severity'],
        confidence: a.confidence,
        suggestedTitle: a.title,
        suggestedDescription: a.description,
        suggestedTags: a.suggestedTags ?? [],
        duplicateProbability: a.duplicateScore ?? 0,
      };
    }
    return null;
  } catch (err) {
    console.warn('[AiService] Callable failed, falling back to client SDK:', err);
    return null;
  }
}

// ── Client-side SDK helpers (fallback) ──────────────────────────────────

/**
 * Compress and resize an image blob to reduce AI API payload size.
 * Resizes to max 800px on the longest side and encodes as JPEG at 0.75 quality.
 */
async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      resolve(base64);
    };
    reader.onerror = () => reject(new Error('FileReader failed'));
    reader.readAsDataURL(blob);
  });
}

async function compressImage(blob: Blob, maxDim = 800, quality = 0.75): Promise<string> {
  try {
    return await new Promise<string>((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(blob);

      img.onload = () => {
        URL.revokeObjectURL(url);
        const { width, height } = img;
        const scale = Math.min(1, maxDim / Math.max(width, height));
        const w = Math.round(width * scale);
        const h = Math.round(height * scale);

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) { reject(new Error('Canvas not supported')); return; }

        ctx.drawImage(img, 0, 0, w, h);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl.split(',')[1]);
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Image load failed'));
      };

      img.src = url;
    });
  } catch {
    console.warn('Canvas compression failed, using raw base64 fallback');
    return blobToBase64(blob);
  }
}

// Singleton AI client — created once, reused across calls
let _aiClient: InstanceType<typeof GoogleGenAI> | null = null;

function getAiClient(): GoogleGenAI {
  const key = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
  if (!key) throw new Error('Missing VITE_GEMINI_API_KEY in environment.');
  if (!_aiClient) _aiClient = new GoogleGenAI({ apiKey: key });
  return _aiClient;
}

async function analyzeViaClientSdk(blob: Blob): Promise<IssueAiAnalysis> {
  const ai = getAiClient();
  const base64 = await compressImage(blob);

  const response = await ai.models.generateContent({
    model: 'gemini-1.5-flash',
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: 'You are a civic issue classifier. Analyze the image and return structured JSON only. Be concise.',
          },
          {
            inlineData: { data: base64, mimeType: 'image/jpeg' },
          },
        ],
      },
    ],
    config: {
      responseMimeType: 'application/json',
      responseSchema: analysisSchema,
      temperature: 0.1,
    },
  });

  const text = response.text
    ?? response.candidates?.[0]?.content?.parts?.[0]?.text
    ?? '';
  if (!text) throw new Error('Empty response from Gemini.');
  return JSON.parse(text) as IssueAiAnalysis;
}

// ── Public API ──────────────────────────────────────────────────────────

export const AiService = {
  /**
   * Analyze a civic issue image using the best available path:
   *
   * 1. **Server-side callable** — secure (API key not exposed to browser).
   *    Requires the image to already be uploaded to Firebase Storage.
   *    Pass `imageUrl` to use this path.
   *
   * 2. **Client-side SDK** — fallback (requires VITE_GEMINI_API_KEY).
   *    Works directly with a Blob without needing a Storage URL.
   *    Pass `blob` to use this path.
   *
   * You can provide both — the callable is preferred.
   *
   * @param options.imageUrl  Firebase Storage URL of the uploaded image (for callable path)
   * @param options.blob      Raw image Blob (for client SDK fallback)
   * @param options.title     Optional report title context
   * @param options.description Optional report description context
   * @returns                 Structured AI analysis
   */
  analyzeIssueImage: async (options: {
    imageUrl?: string;
    blob?: Blob;
    title?: string;
    description?: string;
  }): Promise<IssueAiAnalysis | null> => {
    // Path 1: Server-side callable (preferred — no API key in browser)
    if (options.imageUrl) {
      const callableResult = await analyzeViaCallable(
        options.imageUrl,
        options.title,
        options.description,
      );
      if (callableResult) return callableResult;
    }

    // Path 2: Client-side SDK fallback (needs VITE_GEMINI_API_KEY)
    if (options.blob) {
      try {
        return await analyzeViaClientSdk(options.blob);
      } catch (err) {
        console.error('[AiService] Client SDK analysis failed:', err);
        return null;
      }
    }

    return null;
  },
};
