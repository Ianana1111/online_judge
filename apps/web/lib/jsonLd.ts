/**
 * Serializes a value for `dangerouslySetInnerHTML` inside a `<script type="application/ld+json">`
 * tag. Plain `JSON.stringify` does NOT escape `<`, so any admin-authored string reaching this
 * (a problem title, a post body preview, a discussion author handle) that happens to contain
 * `</script><script>...` would close the JSON-LD tag early and inject a real, executing script —
 * stored XSS scoped to whoever wrote that content having admin access. Escaping `<` to its Unicode
 * escape is the standard fix: it's invisible to the JSON-LD parser (which sees the same character
 * after unescaping) but can never form a literal `</script>` sequence in the raw HTML.
 */
export function jsonLdScript(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
