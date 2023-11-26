export function appendLine(base: string, newLine: string): string {
  return (base ? appendReturnIfNotExists(base) : "") + appendReturnIfNotExists(newLine);
}

export function appendReturnIfNotExists(str: string): string {
  return str + (str.endsWith("\n") ? "" : "\n");
}
