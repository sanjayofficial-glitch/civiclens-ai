import { GoogleGenAI, Type, Schema } from '@google/genai';
import type { IssueAiAnalysis } from '@blockseblock/shared';

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    category: {
      type: Type.STRING,
      description: "Must be one of: pothole, streetlight, water_leak, garbage, graffiti, sidewalk, other",
      enum: ["pothole", "streetlight", "water_leak", "garbage", "graffiti", "sidewalk", "other"],
    },
    severity: {
      type: Type.STRING,
      description: "Must be one of: low, medium, high, critical",
      enum: ["low", "medium", "high", "critical"],
    },
    confidence: {
      type: Type.NUMBER,
      description: "Confidence level of the analysis between 0.0 and 1.0",
    },
    suggestedTitle: {
      type: Type.STRING,
      description: "A short, descriptive title for the issue",
    },
    suggestedDescription: {
      type: Type.STRING,
      description: "A detailed description of the issue based on the image",
    },
    suggestedTags: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "An array of 2-4 tags describing the issue",
    },
    duplicateProbability: {
      type: Type.NUMBER,
      description: "Probability that this issue is a duplicate of a common problem (0.0 to 1.0)",
    },
  },
  required: ["category", "severity", "confidence", "suggestedTitle", "suggestedDescription", "suggestedTags", "duplicateProbability"],
};

export const AiService = {
  analyzeIssueImage: async (base64Image: string, mimeType: string = 'image/jpeg'): Promise<IssueAiAnalysis> => {
    if (!import.meta.env.VITE_GEMINI_API_KEY) {
      throw new Error("Missing VITE_GEMINI_API_KEY in environment. Please add it to your .env.local file.");
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: "Analyze this image of a civic issue. Provide structured data describing the issue accurately." },
            {
              inlineData: {
                data: base64Image,
                mimeType,
              },
            },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
      },
    });

    if (!response.text) {
      throw new Error("No text returned from Gemini");
    }

    return JSON.parse(response.text) as IssueAiAnalysis;
  },
};
