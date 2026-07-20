/**
 * el-tiempo.net serves some free-text fields (forecast paragraphs) double
 * UTF-8 encoded: the original bytes were decoded as Latin-1 and then
 * re-encoded as UTF-8, turning e.g. "mantendrá" into "mantendrÃ¡". This
 * reverses that specific corruption. Falls back to the original text for
 * anything that isn't actually mojibake, so it's safe even if the API
 * fixes the bug later.
 */
export function fixMojibake(text: string): string {
  if (!/[ÃÂ]/.test(text)) {
    return text;
  }

  try {
    const bytes = Uint8Array.from(text, (char) => char.charCodeAt(0));
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    return text;
  }
}
