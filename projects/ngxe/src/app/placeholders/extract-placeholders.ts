export function extractPlaceholders(source: string): string[] {
  if (!source) {
    return [];
  }
  return [...source.matchAll(/{\$.*?}/g)].map(r => r.toString());
}
