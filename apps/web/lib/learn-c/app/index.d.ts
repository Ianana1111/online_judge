// Types for the plain-JS learning-map entry (lib/learn-c/app/index.js).
export interface LearnCContent {
  chapters: unknown[];
  problems: unknown[];
  practice: unknown[];
}
export function mountLearnC(content: LearnCContent): () => void;
