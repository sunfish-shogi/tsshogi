export enum Color {
  /** 先手 */
  BLACK = "black",
  /** 後手 */
  WHITE = "white",
}

/**
 * 反対の手番を返します。
 * @param color 
 */
export function reverseColor(color: Color): Color {
  return color === Color.BLACK ? Color.WHITE : Color.BLACK;
}

/**
 * SFEN形式の手番を取得します。
 * @param color 
 */
export function colorToSFEN(color: Color): string {
  return color === Color.BLACK ? "b" : "w";
}

/**
 * 指定した文字列が正しいSFENの手番かどうかを判定します。 
 * @param sfen 
 */
export function isValidSFENColor(sfen: string): boolean {
  return sfen === "b" || sfen === "w";
}

/**
 * SFEN形式の手番を読み取ります。
 * @param sfen 
 */
export function parseSFENColor(sfen: string): Color {
  return sfen === "b" ? Color.BLACK : Color.WHITE;
}
