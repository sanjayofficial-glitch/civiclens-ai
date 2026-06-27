import { db } from '../lib/firebase';
import type { DuplicateMatch } from '../types';

function normalize(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function similarity(left: string, right: string) {
  const a = new Set(normalize(left).split(' ').filter(Boolean));
  const b = new Set(normalize(right).split(' ').filter(Boolean));
  if (a.size === 0 || b.size === 0) {
    return 0;
  }

  let intersection = 0;
  for (const token of a) {
    if (b.has(token)) {
      intersection += 1;
    }
  }

  return intersection / Math.max(a.size, b.size);
}

export async function detectDuplicateIssue(input: {
  title: string;
  description: string;
  category: string;
  geohash: string;
}) {
  const prefix = input.geohash.slice(0, 5);
  const snapshot = await db
    .collection('issues')
    .where('category', '==', input.category)
    .limit(25)
    .get();

  const matches: DuplicateMatch[] = [];

  snapshot.forEach((doc) => {
    const data = doc.data();
    const geohash = String(data.location?.geohash ?? '');
    const titleScore = similarity(input.title, String(data.title ?? ''));
    const descriptionScore = similarity(input.description, String(data.description ?? ''));
    const locationScore = geohash.startsWith(prefix) ? 1 : 0;
    const score = Math.min(1, titleScore * 0.45 + descriptionScore * 0.35 + locationScore * 0.2);

    if (score >= 0.45) {
      matches.push({
        issueId: doc.id,
        score,
        reason: 'Similar title, description, or nearby geohash detected.',
      });
    }
  });

  matches.sort((left, right) => right.score - left.score);
  return matches[0] ?? null;
}

