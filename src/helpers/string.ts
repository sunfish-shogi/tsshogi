/**
 * 文字列に新しい行を連結します。末尾に改行が無い場合だけ改行を追加します。
 * @param base
 * @param newLine
 */
export function appendLine(base: string, newLine: string): string {
  return (base ? appendReturnIfNotExists(base) : "") + appendReturnIfNotExists(newLine);
}

/**
 * 文字列の末尾に改行がなければ追加します。
 * @param str
 */
export function appendReturnIfNotExists(str: string): string {
  return str + (str.endsWith("\n") ? "" : "\n");
}
