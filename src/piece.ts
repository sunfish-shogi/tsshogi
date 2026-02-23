import { Color, reverseColor } from "./color";

export enum PieceType {
  PAWN = 0,
  LANCE = 1,
  KNIGHT = 2,
  SILVER = 3,
  GOLD = 4,
  BISHOP = 5,
  ROOK = 6,
  KING = 7,
  PROM_PAWN = 8,
  PROM_LANCE = 9,
  PROM_KNIGHT = 10,
  PROM_SILVER = 11,
  HORSE = 12,
  DRAGON = 13,
}

// 駒の標準名 (index = PieceType)
const PIECE_NAMES: string[] = [
  "歩", "香", "桂", "銀", "金", "角", "飛", "玉",
  "と", "成香", "成桂", "成銀", "馬", "竜",
];

/**
 * 標準的な駒の名前を返します。
 * @param type
 */
export function standardPieceName(type: PieceType): string {
  return PIECE_NAMES[type] ?? "";
}

export const pieceTypes: PieceType[] = [
  PieceType.PAWN,
  PieceType.LANCE,
  PieceType.KNIGHT,
  PieceType.SILVER,
  PieceType.GOLD,
  PieceType.BISHOP,
  PieceType.ROOK,
  PieceType.KING,
  PieceType.PROM_PAWN,
  PieceType.PROM_LANCE,
  PieceType.PROM_KNIGHT,
  PieceType.PROM_SILVER,
  PieceType.HORSE,
  PieceType.DRAGON,
] as const;

export const handPieceTypes: PieceType[] = [
  PieceType.PAWN,
  PieceType.LANCE,
  PieceType.KNIGHT,
  PieceType.SILVER,
  PieceType.GOLD,
  PieceType.BISHOP,
  PieceType.ROOK,
] as const;

// 成ることができる駒か (index = PieceType)
const PROMOTABLE: boolean[] = [
  true,  // PAWN
  true,  // LANCE
  true,  // KNIGHT
  true,  // SILVER
  false, // GOLD
  true,  // BISHOP
  true,  // ROOK
  false, // KING
  false, // PROM_PAWN
  false, // PROM_LANCE
  false, // PROM_KNIGHT
  false, // PROM_SILVER
  false, // HORSE
  false, // DRAGON
];

/**
 * 成ることができる駒かどうかを返します。
 * @param pieceType
 */
export function isPromotable(pieceType: PieceType): boolean {
  return PROMOTABLE[pieceType];
}

// 成り先 (index = PieceType, 非成駒はそのまま返す)
const PROMOTE: PieceType[] = [
  PieceType.PROM_PAWN,    // PAWN → PROM_PAWN
  PieceType.PROM_LANCE,   // LANCE → PROM_LANCE
  PieceType.PROM_KNIGHT,  // KNIGHT → PROM_KNIGHT
  PieceType.PROM_SILVER,  // SILVER → PROM_SILVER
  PieceType.GOLD,         // GOLD → GOLD (成不可)
  PieceType.HORSE,        // BISHOP → HORSE
  PieceType.DRAGON,       // ROOK → DRAGON
  PieceType.KING,         // KING → KING (成不可)
  PieceType.PROM_PAWN,    // PROM_PAWN → PROM_PAWN
  PieceType.PROM_LANCE,   // PROM_LANCE → PROM_LANCE
  PieceType.PROM_KNIGHT,  // PROM_KNIGHT → PROM_KNIGHT
  PieceType.PROM_SILVER,  // PROM_SILVER → PROM_SILVER
  PieceType.HORSE,        // HORSE → HORSE
  PieceType.DRAGON,       // DRAGON → DRAGON
];

/**
 * 成った時の駒の種類を返します。
 * @param pieceType
 */
export function promotedPieceType(pieceType: PieceType): PieceType {
  return PROMOTE[pieceType];
}

// 成る前の駒 (index = PieceType)
const UNPROMOTE: PieceType[] = [
  PieceType.PAWN,    // PAWN → PAWN
  PieceType.LANCE,   // LANCE → LANCE
  PieceType.KNIGHT,  // KNIGHT → KNIGHT
  PieceType.SILVER,  // SILVER → SILVER
  PieceType.GOLD,    // GOLD → GOLD
  PieceType.BISHOP,  // BISHOP → BISHOP
  PieceType.ROOK,    // ROOK → ROOK
  PieceType.KING,    // KING → KING
  PieceType.PAWN,    // PROM_PAWN → PAWN
  PieceType.LANCE,   // PROM_LANCE → LANCE
  PieceType.KNIGHT,  // PROM_KNIGHT → KNIGHT
  PieceType.SILVER,  // PROM_SILVER → SILVER
  PieceType.BISHOP,  // HORSE → BISHOP
  PieceType.ROOK,    // DRAGON → ROOK
];

/**
 * 成る前の駒の種類を返します。
 * @param pieceType
 */
export function unpromotedPieceType(pieceType: PieceType): PieceType {
  return UNPROMOTE[pieceType];
}

// SFEN文字 (index = PieceType, 先手)
const SFEN_CHARS_BLACK: string[] = [
  "P", "L", "N", "S", "G", "B", "R", "K",
  "+P", "+L", "+N", "+S", "+B", "+R",
];

// SFEN文字 (index = PieceType, 後手)
const SFEN_CHARS_WHITE: string[] = [
  "p", "l", "n", "s", "g", "b", "r", "k",
  "+p", "+l", "+n", "+s", "+b", "+r",
];

/**
 * SFEN形式の駒種を表す文字列を返します。
 * @param type
 */
export function pieceTypeToSFEN(type: PieceType): string {
  return SFEN_CHARS_BLACK[type];
}

const sfenCharToTypeMap: { [sfen: string]: PieceType } = {
  P: PieceType.PAWN,
  L: PieceType.LANCE,
  N: PieceType.KNIGHT,
  S: PieceType.SILVER,
  G: PieceType.GOLD,
  B: PieceType.BISHOP,
  R: PieceType.ROOK,
  K: PieceType.KING,
  "+P": PieceType.PROM_PAWN,
  "+L": PieceType.PROM_LANCE,
  "+N": PieceType.PROM_KNIGHT,
  "+S": PieceType.PROM_SILVER,
  "+B": PieceType.HORSE,
  "+R": PieceType.DRAGON,
  p: PieceType.PAWN,
  l: PieceType.LANCE,
  n: PieceType.KNIGHT,
  s: PieceType.SILVER,
  g: PieceType.GOLD,
  b: PieceType.BISHOP,
  r: PieceType.ROOK,
  k: PieceType.KING,
  "+p": PieceType.PROM_PAWN,
  "+l": PieceType.PROM_LANCE,
  "+n": PieceType.PROM_KNIGHT,
  "+s": PieceType.PROM_SILVER,
  "+b": PieceType.HORSE,
  "+r": PieceType.DRAGON,
};

const sfenCharToColorMap: { [sfen: string]: Color } = {
  P: Color.BLACK,
  L: Color.BLACK,
  N: Color.BLACK,
  S: Color.BLACK,
  G: Color.BLACK,
  B: Color.BLACK,
  R: Color.BLACK,
  K: Color.BLACK,
  "+P": Color.BLACK,
  "+L": Color.BLACK,
  "+N": Color.BLACK,
  "+S": Color.BLACK,
  "+B": Color.BLACK,
  "+R": Color.BLACK,
  p: Color.WHITE,
  l: Color.WHITE,
  n: Color.WHITE,
  s: Color.WHITE,
  g: Color.WHITE,
  b: Color.WHITE,
  r: Color.WHITE,
  k: Color.WHITE,
  "+p": Color.WHITE,
  "+l": Color.WHITE,
  "+n": Color.WHITE,
  "+s": Color.WHITE,
  "+b": Color.WHITE,
  "+r": Color.WHITE,
};

// rotate 先の駒種 (index = PieceType)
// 先手・歩 → 先手・と → 後手・歩 → 後手・と → 先手・歩 のサイクル
const ROTATE_TYPE: PieceType[] = [
  PieceType.PROM_PAWN,    // PAWN
  PieceType.PROM_LANCE,   // LANCE
  PieceType.PROM_KNIGHT,  // KNIGHT
  PieceType.PROM_SILVER,  // SILVER
  PieceType.GOLD,         // GOLD
  PieceType.HORSE,        // BISHOP
  PieceType.DRAGON,       // ROOK
  PieceType.KING,         // KING
  PieceType.PAWN,         // PROM_PAWN
  PieceType.LANCE,        // PROM_LANCE
  PieceType.KNIGHT,       // PROM_KNIGHT
  PieceType.SILVER,       // PROM_SILVER
  PieceType.BISHOP,       // HORSE
  PieceType.ROOK,         // DRAGON
];

// rotate 時に色を反転するか (index = PieceType)
const ROTATE_REVERSE: boolean[] = [
  false, // PAWN
  false, // LANCE
  false, // KNIGHT
  false, // SILVER
  true,  // GOLD
  false, // BISHOP
  false, // ROOK
  true,  // KING
  true,  // PROM_PAWN
  true,  // PROM_LANCE
  true,  // PROM_KNIGHT
  true,  // PROM_SILVER
  true,  // HORSE
  true,  // DRAGON
];

// Piece.id 用の固定文字列 (index = (color-1) * 14 + type)
const PIECE_IDS: string[] = [
  // color = BLACK (1), type = 0-13
  "black_pawn", "black_lance", "black_knight", "black_silver", "black_gold",
  "black_bishop", "black_rook", "black_king",
  "black_promPawn", "black_promLance", "black_promKnight", "black_promSilver",
  "black_horse", "black_dragon",
  // color = WHITE (1), type = 0-13
  "white_pawn", "white_lance", "white_knight", "white_silver", "white_gold",
  "white_bishop", "white_rook", "white_king",
  "white_promPawn", "white_promLance", "white_promKnight", "white_promSilver",
  "white_horse", "white_dragon",
];

/**
 * 駒(手番を含む)
 */
export class Piece {
  constructor(
    public color: Color,
    public type: PieceType,
  ) {}

  /**
   * 先手番の駒に変換します。
   */
  black(): Piece {
    return this.withColor(Color.BLACK);
  }

  /**
   * 後手番の駒に変換します。
   */
  white(): Piece {
    return this.withColor(Color.WHITE);
  }

  /**
   * 手番を変更した駒を返します。
   */
  withColor(color: Color): Piece {
    return new Piece(color, this.type);
  }

  /**
   * 等しい駒かどうかを判定します。
   */
  equals(piece: Piece): boolean {
    return this.type === piece.type && this.color === piece.color;
  }

  /**
   * 成った駒を返します。
   */
  promoted(): Piece {
    return new Piece(this.color, PROMOTE[this.type]);
  }

  /**
   * 成る前の駒を返します。
   */
  unpromoted(): Piece {
    return new Piece(this.color, UNPROMOTE[this.type]);
  }

  /**
   * 成ることが可能な駒かどうかを返します。
   */
  isPromotable(): boolean {
    return PROMOTABLE[this.type];
  }

  /**
   * 駒の向きと種類をローテートします。
   * ex) 先手・歩 -> 先手・と -> 後手・歩 -> 後手・と -> 先手・歩
   */
  rotate(): Piece {
    const newType = ROTATE_TYPE[this.type];
    const newColor = ROTATE_REVERSE[this.type] ? reverseColor(this.color) : this.color;
    return new Piece(newColor, newType);
  }

  /**
   * 手番と種類を一意に識別する ID を返します。
   */
  get id(): string {
    return PIECE_IDS[(this.color - 1) * 14 + this.type];
  }

  /**
   * SFEN形式の文字列を取得します。
   */
  get sfen(): string {
    return this.color === Color.BLACK
      ? SFEN_CHARS_BLACK[this.type]
      : SFEN_CHARS_WHITE[this.type];
  }

  /**
   * 指定した文字列が正しいSFEN形式の駒かどうかを判定します。
   * @param sfen
   */
  static isValidSFEN(sfen: string): boolean {
    return sfenCharToTypeMap[sfen] !== undefined;
  }

  /**
   * SFEN形式の文字列から駒を生成します。
   * @param sfen
   */
  static newBySFEN(sfen: string): Piece | null {
    const type = sfenCharToTypeMap[sfen];
    if (type === undefined) {
      return null;
    }
    const color = sfenCharToColorMap[sfen];
    if (color === undefined) {
      return null;
    }
    return new Piece(color, type);
  }
}
