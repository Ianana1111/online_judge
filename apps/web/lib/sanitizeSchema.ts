import { defaultSchema } from "hast-util-sanitize";
import type { Schema } from "hast-util-sanitize";

/**
 * Extends the default (safe) sanitize schema with the handful of tags/classes
 * remark-math's mdast output needs (span.math-inline / span.math-display),
 * which rehype-katex later expands into trusted <span class="katex …"> markup.
 * Runs BEFORE rehype-katex so we never need to special-case katex's own output.
 */
export const statementSanitizeSchema: Schema = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames ?? []), "span"],
  attributes: {
    ...defaultSchema.attributes,
    span: [...((defaultSchema.attributes?.span as any[]) ?? []), "className"],
    code: [...((defaultSchema.attributes?.code as any[]) ?? []), "className"],
    "*": [...((defaultSchema.attributes?.["*"] as any[]) ?? []), "className"],
  },
};
