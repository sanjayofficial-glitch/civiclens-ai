import { GoogleGenAI, Type, Schema } from '@google/genai';
import type { IssueAiAnalysis } from '@blockseblock/shared';

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

/**
 * Compress and resize an image blob to reduce AI API payload size.
 * Resizes to max 800px on the longest side and encodes as JPEG at 0.75 quality.
 * Typical reduction: 4MB → ~150KB.
 */
async function compressImage(blob: Blob, maxDim = 800, quality = 0.75): Promise<string> {
  return new Promise((resolve, reject) => {
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
      // Always output as JPEG regardless of input format for smaller payload
      const dataUrl = canvas.toDataURL('image/jpeg', quality);
      resolve(dataUrl.split(',')[1]); // return base64 part only
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image for compression'));
    };

    img.src = url;
  });
}

// Singleton AI client — created once, reused across calls
let _aiClient: InstanceType<typeof GoogleGenAI> | null = null;
function getAiClient() {
  const key = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
  if (!key) throw new Error('Missing VITE_GEMINI_API_KEY in environment.');
  if (!_aiClient) _aiClient = new GoogleGenAI({ apiKey: key });
  return _aiClient;
}

export const AiService = {
  /**
   * Analyze a civic issue image.
   * @param blob  The raw image Blob (from file input or fetch)
   * @returns     Structured AI analysis
   */
  analyzeIssueImage: async (blob: Blob): Promise<IssueAiAnalysis> => {
    const ai = getAiClient();

    // Compress before sending — significantly reduces latency
    const base64 = await compressImage(blob);

    const response = await ai.models.generateContent({
      // gemini-1.5-flash is 2-4× faster than 2.5-flash for structured output
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
        // Lower temperature = faster, more deterministic output
        temperature: 0.1,
      },
    });

    if (!response.text) throw new Error('No response from Gemini.');
    return JSON.parse(response.text) as IssueAiAnalysis;
  },
};
