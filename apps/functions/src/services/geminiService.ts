import type { IssueAnalysisResult } from '../types';

import { GEMINI_MAX_RETRIES, GEMINI_MODEL, GEMINI_TIMEOUT_MS } from '../config';
import { fail } from '../lib/errors';

import { fetchFileBuffer } from './storageService';
import { bucket } from '../lib/firebase';

interface GeminiPart {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string;
  };
}

function stripMarkdownJson(input: string) {
  return input
    .replace(/```json\s*/g, '')
    .replace(/```/g, '')
    .trim();
}

function fallbackAnalysis(input: {
  title: string;
  description: string;
  imageUrls: string[];
}): IssueAnalysisResult {
  const text = `${input.title} ${input.description}`.toLowerCase();
  const category = text.includes('pothole')
    ? 'pothole'
    : text.includes('light') || text.includes('streetlight')
      ? 'streetlight'
      : text.includes('water') || text.includes('leak')
        ? 'water_leak'
        : text.includes('trash') || text.includes('garbage')
          ? 'garbage'
          : text.includes('graffiti')
            ? 'graffiti'
            : text.includes('sidewalk')
              ? 'sidewalk'
              : 'other';

  const severity =
    text.includes('critical') ||
    text.includes('danger') ||
    text.includes('urgent')
      ? 'critical'
      : text.includes('high') ||
          text.includes('blocked') ||
          text.includes('broken')
        ? 'high'
        : text.includes('medium')
          ? 'medium'
          : 'low';

  return {
    category,
    severity,
    confidence: input.imageUrls.length > 0 ? 0.55 : 0.35,
    suggestedTitle: input.title.slice(0, 120) || 'Civic issue report',
    suggestedDescription: input.description.slice(0, 500),
    suggestedTags: [category, severity],
    duplicateScore: 0.1,
    safetyConcern:
      text.includes('fire') ||
      text.includes('accident') ||
      text.includes('hazard'),
    usedFallback: true,
  };
}

async function callGemini(parts: GeminiPart[]): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    fail('failed-precondition', 'GEMINI_API_KEY is not configured.');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => {
    controller.abort();
  }, GEMINI_TIMEOUT_MS);

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts,
            },
          ],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: 'application/json',
          },
        }),
        signal: controller.signal,
      },
    );

    if (!response.ok) {
      throw new Error(
        `Gemini request failed with status ${String(response.status)}`,
      );
    }

    const payload = (await response.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };

    const text = payload.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error('Gemini response did not include content.');
    }

    return text;
  } finally {
    clearTimeout(timeout);
  }
}

export async function analyzeIssueMedia(input: {
  title: string;
  description: string;
  imageUrls: string[];
  locationText?: string;
}): Promise<IssueAnalysisResult> {
  const imageParts: GeminiPart[] = [];
  for (const url of input.imageUrls.slice(0, 3)) {
    try {
      let buffer: Buffer;
      const pathMatch = decodeURIComponent(url).match(/\/o\/(.+?)(?:\?|$)/);
      if (pathMatch && pathMatch[1]) {
        const [downloaded] = await bucket.file(pathMatch[1]).download();
        buffer = downloaded;
      } else {
        buffer = await fetchFileBuffer(url);
      }

      imageParts.push({
        inlineData: {
          mimeType: 'image/jpeg',
          data: buffer.toString('base64'),
        },
      });
    } catch {
      continue;
    }
  }

  const prompt = [
    'You are analyzing a civic issue report.',
    'Return strictly valid JSON with this shape:',
    '{ category, severity, confidence, suggestedTitle, suggestedDescription, suggestedTags, duplicateScore, safetyConcern }',
    'category must be one of pothole, streetlight, water_leak, garbage, graffiti, sidewalk, other.',
    'severity must be low, medium, high, or critical.',
    'confidence and duplicateScore must be numbers from 0 to 1.',
    'suggestedTitle and suggestedDescription should be concise and useful.',
    'suggestedTags should be an array of short strings.',
    `Report title: ${input.title}`,
    `Report description: ${input.description}`,
    input.locationText ? `Location: ${input.locationText}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  let lastError: unknown;
  for (let attempt = 0; attempt <= GEMINI_MAX_RETRIES; attempt += 1) {
    try {
      const raw = await callGemini([{ text: prompt }, ...imageParts]);

      const parsed = JSON.parse(stripMarkdownJson(raw)) as IssueAnalysisResult;
      if (!parsed.category || typeof parsed.confidence !== 'number') {
        throw new Error('Gemini response is missing required fields.');
      }

      return parsed;
    } catch (error) {
      lastError = error;
    }
  }

  if (lastError instanceof Error) {
    return fallbackAnalysis(input);
  }

  return fallbackAnalysis(input);
}
