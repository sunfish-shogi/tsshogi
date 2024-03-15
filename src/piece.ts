import { Color, reverseColor } from "./color";

export enum PieceType {
  PAWN = "pawn",
  LANCE = "lance",
  KNIGHT = "knight",
  SILVER = "silver",
  GOLD = "gold",
  BISHOP = "bishop",
  ROOK = "rook",
  KING = "king",
  PROM_PAWN = "promPawn",
  PROM_LANCE = "promLance",
  PROM_KNIGHT = "promKnight",
  PROM_SILVER = "promSilver",
  HORSE = "horse",
  DRAGON = "dragon",
}

const standardPieceNameMap: { [pieceType in PieceType]: string } = {
  pawn: "歩",
  lance: "香",
  knight: "桂",
  silver: "銀",
  gold: "金",
  bishop: "角",
  rook: "飛",
  king: "玉",
  promPawn: "と",
  promLance: "成香",
  promKnight: "成桂",
  promSilver: "成銀",
  horse: "馬",
  dragon: "竜",
};

/**
 * 標準的な駒の名前を返します。
 * @param type
 */
export function standardPieceName(type: PieceType): string {
  const val = standardPieceNameMap[type];
  return val || "";
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
];

export const handPieceTypes: PieceType[] = [
  PieceType.PAWN,
  PieceType.LANCE,
  PieceType.KNIGHT,
  PieceType.SILVER,
  PieceType.GOLD,
  PieceType.BISHOP,
  PieceType.ROOK,
];

const promotable: { [pieceType in PieceType]: boolean } = {
  pawn: true,
  lance: true,
  knight: true,
  silver: true,
  gold: false,
  bishop: true,
  rook: true,
  king: false,
  promPawn: false,
  promLance: false,
  promKnight: false,
  promSilver: false,
  horse: false,
  dragon: false,
};

/**
 * 成ることができる駒かどうかを返します。
 * @param pieceType
 */
export function isPromotable(pieceType: PieceType): boolean {
  return !!promotable[pieceType];
}

const promoteMap: { [pieceType: string]: PieceType } = {
  pawn: PieceType.PROM_PAWN,
  lance: PieceType.PROM_LANCE,
  knight: PieceType.PROM_KNIGHT,
  silver: PieceType.PROM_SILVER,
  bishop: PieceType.HORSE,
  rook: PieceType.DRAGON,
};

/**
 * 成った時の駒の種類を返します。
 * @param pieceType
 */
export function promotedPieceType(pieceType: PieceType): PieceType {
  return promoteMap[pieceType] || pieceType;
}

const unpromoteMap: { [pieceType in PieceType]?: PieceType } = {
  promPawn: PieceType.PAWN,
  promLance: PieceType.LANCE,
  promKnight: PieceType.KNIGHT,
  promSilver: PieceType.SILVER,
  horse: PieceType.BISHOP,
  dragon: PieceType.ROOK,
};

/**
 * 成る前の駒の種類を返します。
 * @param pieceType
 */
export function unpromotedPieceType(pieceType: PieceType): PieceType {
  return unpromoteMap[pieceType] || pieceType;
}

const toSFENCharBlack: { [pieceType in PieceType]: string } = {
  pawn: "P",
  lance: "L",
  knight: "N",
  silver: "S",
  gold: "G",
  bishop: "B",
  rook: "R",
  king: "K",
  promPawn: "+P",
  promLance: "+L",
  promKnight: "+N",
  promSilver: "+S",
  horse: "+B",
  dragon: "+R",
};

/**
 * SFEN形式の駒種を表す文字列を返します。
 * @param type
 */
export function pieceTypeToSFEN(type: PieceType): string {
  return toSFENCharBlack[type];
}

const toSFENCharWhite: { [pieceType in PieceType]: string } = {
  pawn: "p",
  lance: "l",
  knight: "n",
  silver: "s",
  gold: "g",
  bishop: "b",
  rook: "r",
  king: "k",
  promPawn: "+p",
  promLance: "+l",
  promKnight: "+n",
  promSilver: "+s",
  horse: "+b",
  dragon: "+r",
};

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

type RotateResult = {
  type: PieceType;
  reverseColor: boolean;
};

const rotateMap = new Map<PieceType, RotateResult>();
rotateMap.set(PieceType.PAWN, {
  type: PieceType.PROM_PAWN,
  reverseColor: false,
});
rotateMap.set(PieceType.LANCE, {
  type: PieceType.PROM_LANCE,
  reverseColor: false,
});
rotateMap.set(PieceType.KNIGHT, {
  type: PieceType.PROM_KNIGHT,
  reverseColor: false,
});
rotateMap.set(PieceType.SILVER, {
  type: PieceType.PROM_SILVER,
  reverseColor: false,
});
rotateMap.set(PieceType.GOLD, { type: PieceType.GOLD, reverseColor: true });
rotateMap.set(PieceType.BISHOP, { type: PieceType.HORSE, reverseColor: false });
rotateMap.set(PieceType.ROOK, { type: PieceType.DRAGON, reverseColor: false });
rotateMap.set(PieceType.KING, { type: PieceType.KING, reverseColor: true });
rotateMap.set(PieceType.PROM_PAWN, {
  type: PieceType.PAWN,
  reverseColor: true,
});
rotateMap.set(PieceType.PROM_LANCE, {
  type: PieceType.LANCE,
  reverseColor: true,
});
rotateMap.set(PieceType.PROM_KNIGHT, {
  type: PieceType.KNIGHT,
  reverseColor: true,
});
rotateMap.set(PieceType.PROM_SILVER, {
  type: PieceType.SILVER,
  reverseColor: true,
});
rotateMap.set(PieceType.HORSE, { type: PieceType.BISHOP, reverseColor: true });
rotateMap.set(PieceType.DRAGON, { type: PieceType.ROOK, reverseColor: true });

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
    const type = promoteMap[this.type];
    return new Piece(this.color, type || this.type);
  }

  /**
   * 成る前の駒を返します。
   */
  unpromoted(): Piece {
    const type = unpromoteMap[this.type];
    return new Piece(this.color, type || this.type);
  }

  /**
   * 成ることが可能な駒かどうかを返します。
   */
  isPromotable(): boolean {
    return isPromotable(this.type);
  }

  /**
   * 駒の向きと種類をローテートします。
   * ex) 先手・歩 -> 先手・と -> 後手・歩 -> 後手・と -> 先手・歩
   */
  rotate(): Piece {
    const r = rotateMap.get(this.type);
    const piece = new Piece(this.color, r ? r.type : this.type);
    if (r && r.reverseColor) {
      piece.color = reverseColor(this.color);
    }
    return piece;
  }

  /**
   * 手番と種類を一意に識別する ID を返します。
   */
  get id(): string {
    return this.color + "_" + this.type;
  }

  /**
   * SFEN形式の文字列を取得します。
   */
  get sfen(): string {
    switch (this.color) {
      default:
      case Color.BLACK:
        return toSFENCharBlack[this.type] as string;
      case Color.WHITE:
        return toSFENCharWhite[this.type] as string;
    }
  }

  /**
   * 指定した文字列が正しいSFEN形式の駒かどうかを判定します。
   * @param sfen
   */
  static isValidSFEN(sfen: string): boolean {
    return !!sfenCharToTypeMap[sfen];
  }

  /**
   * SFEN形式の文字列から駒を生成します。
   * @param sfen
   */
  static newBySFEN(sfen: string): Piece | null {
    const type = sfenCharToTypeMap[sfen];
    if (!type) {
      return null;
    }
    const color = sfenCharToColorMap[sfen];
    if (!color) {
      return null;
    }
    return new Piece(color, type);
  }
}
