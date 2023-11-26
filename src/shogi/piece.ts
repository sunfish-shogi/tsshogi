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

const standardPieceNameMap: { [pieceType: string]: string } = {
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

const promotable: { [pieceType: string]: boolean } = {
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

export function promotedPieceType(pieceType: PieceType): PieceType {
  return promoteMap[pieceType] || pieceType;
}

const unpromoteMap: { [pieceType: string]: PieceType } = {
  promPawn: PieceType.PAWN,
  promLance: PieceType.LANCE,
  promKnight: PieceType.KNIGHT,
  promSilver: PieceType.SILVER,
  horse: PieceType.BISHOP,
  dragon: PieceType.ROOK,
};

export function unpromotedPieceType(pieceType: PieceType): PieceType {
  return unpromoteMap[pieceType] || pieceType;
}

const toSFENCharBlack: { [pieceType: string]: string } = {
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

export function pieceTypeToSFEN(type: PieceType): string {
  return toSFENCharBlack[type];
}

const toSFENCharWhite: { [pieceType: string]: string } = {
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

export class Piece {
  constructor(
    public color: Color,
    public type: PieceType,
  ) {}

  black(): Piece {
    return this.withColor(Color.BLACK);
  }

  white(): Piece {
    return this.withColor(Color.WHITE);
  }

  withColor(color: Color): Piece {
    return new Piece(color, this.type);
  }

  equals(piece: Piece): boolean {
    return this.type === piece.type && this.color === piece.color;
  }

  promoted(): Piece {
    const type = promoteMap[this.type];
    return new Piece(this.color, type || this.type);
  }

  unpromoted(): Piece {
    const type = unpromoteMap[this.type];
    return new Piece(this.color, type || this.type);
  }

  isPromotable(): boolean {
    return isPromotable(this.type);
  }

  rotate(): Piece {
    const r = rotateMap.get(this.type);
    const piece = new Piece(this.color, r ? r.type : this.type);
    if (r && r.reverseColor) {
      piece.color = reverseColor(this.color);
    }
    return piece;
  }

  get id(): string {
    return this.color + "_" + this.type;
  }

  get sfen(): string {
    switch (this.color) {
      default:
      case Color.BLACK:
        return toSFENCharBlack[this.type] as string;
      case Color.WHITE:
        return toSFENCharWhite[this.type] as string;
    }
  }

  static isValidSFEN(sfen: string): boolean {
    return !!sfenCharToTypeMap[sfen];
  }

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
