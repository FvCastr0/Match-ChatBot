import { distance } from "fastest-levenshtein";

export function detectCategory(
  message: string,
  categories: Record<string, string[]>,
  fuzzyLimit = 3
) {
  const text = message.toLowerCase();

  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(kw => text.includes(kw))) {
      return category;
    }
  }

  let best = { category: null as string | null, score: 999 };

  for (const [category, keywords] of Object.entries(categories)) {
    for (const kw of keywords) {
      const d = distance(text, kw);
      if (d < best.score) {
        best = { category, score: d };
      }
    }
  }

  console.log(message, best.category);

  return best.score <= fuzzyLimit ? best.category : "unknown";
}
