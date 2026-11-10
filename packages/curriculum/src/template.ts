/** Fill {placeholders} in authored text with server-side numeric params. Unknown keys are left as-is. */
export function fillTemplate(text: string, params: Record<string, number | string>): string {
  return text.replace(/\{(\w+)\}/g, (m, k: string) => (k in params ? String(params[k]) : m));
}
