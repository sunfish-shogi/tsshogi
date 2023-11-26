export enum Color {
  BLACK = "black",
  WHITE = "white",
}

export function reverseColor(color: Color): Color {
  return color === Color.BLACK ? Color.WHITE : Color.BLACK;
}

export function colorToSFEN(color: Color): string {
  return color === Color.BLACK ? "b" : "w";
}

export function isValidSFENColor(sfen: string): boolean {
  return sfen === "b" || sfen === "w";
}

export function parseSFENColor(sfen: string): Color {
  return sfen === "b" ? Color.BLACK : Color.WHITE;
}
