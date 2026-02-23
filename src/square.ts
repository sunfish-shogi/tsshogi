import { Direction, vectorToDirectionAndDistance } from "./direction";

/**
 * マス目 (0-80 のインデックス)
 * 0=「9一」, 1=「8一」, ..., 8=「1一」, 9=「9二」, ..., 80=「1九」
 */
export type Square = number;

/** 盤外を示す値 */
export const INVALID_SQUARE = -1;

/** 筋 (1-9) を返します。 */
export function squareFile(sq: Square): number {
  return 9 - (sq % 9);
}

/** 段 (1-9) を返します。 */
export function squareRank(sq: Square): number {
  return Math.trunc(sq / 9) + 1;
}

/** 9筋を0としたx座標を返します。 */
export function squareX(sq: Square): number {
  return 9 - squareFile(sq);
}

/** 1段目を0としたy座標を返します。 */
export function squareY(sq: Square): number {
  return squareRank(sq) - 1;
}

/** 有効なマス目 (0-80) かどうかを返します。 */
export function squareValid(sq: Square): boolean {
  return sq >= 0 && sq <= 80;
}

/** 先後を反転したマスを返します。 */
export function squareOpposite(sq: Square): Square {
  return squareByFileRank(10 - squareFile(sq), 10 - squareRank(sq));
}

/**
 * 筋と段からマスを取得します。
 * 範囲外 (file: 1-9, rank: 1-9) の場合は INVALID_SQUARE を返します。
 */
export function squareByFileRank(file: number, rank: number): Square {
  if (file < 1 || file > 9 || rank < 1 || rank > 9) {
    return INVALID_SQUARE;
  }
  return (rank - 1) * 9 + (9 - file);
}

/** x, y 座標からマスを取得します。 */
export function squareByXY(x: number, y: number): Square {
  return y * 9 + x;
}

const sfenRanks = ["a", "b", "c", "d", "e", "f", "g", "h", "i"];

/** USI 形式の文字列を取得します。 */
export function squareUSI(sq: Square): string {
  return squareFile(sq) + sfenRanks[squareRank(sq) - 1];
}

/** SFEN 形式の文字列を取得します。 @deprecated squareUSI を使用してください。 */
export function squareSFEN(sq: Square): string {
  return squareUSI(sq);
}

function usiFileToNumber(c: string): number | null {
  return c >= "1" && c <= "9" ? Number(c) : null;
}

function usiRankToNumber(c: string): number | null {
  const i = "abcdefghi".indexOf(c);
  return i >= 0 ? i + 1 : null;
}

/** USI 形式のマス目をパースします。 */
export function squareByUSI(usi: string): Square | null {
  const file = usiFileToNumber(usi[0]);
  const rank = usiRankToNumber(usi[1]);
  if (!file || !rank) {
    return null;
  }
  return squareByFileRank(file, rank);
}

/**
 * SFEN 形式のマス目をパースします。
 * @deprecated squareByUSI を使用してください。
 */
export function parseSFENSquare(sfen: string): Square | null {
  return squareByUSI(sfen);
}

/** from から to への方向を返します。 */
export function squareDirectionTo(from: Square, to: Square): Direction {
  return vectorToDirectionAndDistance(squareX(to) - squareX(from), squareY(to) - squareY(from))
    .direction;
}

/**
 * 相対座標 (dx, dy) を指定して隣接マスを返します。
 * 盤外の場合は INVALID_SQUARE を返します。
 */
export function squareNeighborDelta(sq: Square, dx: number, dy: number): Square {
  const newFile = squareFile(sq) - dx;
  const newRank = squareRank(sq) + dy;
  if (newFile < 1 || newFile > 9 || newRank < 1 || newRank > 9) {
    return INVALID_SQUARE;
  }
  return squareByFileRank(newFile, newRank);
}

// 隣接マステーブル: [squareIndex * 12 + direction] → Square (盤外は INVALID_SQUARE)
const NEIGHBOR_TABLE = new Int16Array(81 * 12);
(() => {
  for (let i = 0; i < 81; i++) {
    const f = squareFile(i);
    const r = squareRank(i);
    const neighbors: [number, number][] = [
      [f, r - 1],
      [f, r + 1],
      [f + 1, r],
      [f - 1, r],
      [f + 1, r - 1],
      [f - 1, r - 1],
      [f + 1, r + 1],
      [f - 1, r + 1],
      [f + 1, r - 2],
      [f - 1, r - 2],
      [f + 1, r + 2],
      [f - 1, r + 2],
    ];
    for (let dir = 0; dir < 12; dir++) {
      const [nf, nr] = neighbors[dir];
      NEIGHBOR_TABLE[i * 12 + dir] =
        nf >= 1 && nf <= 9 && nr >= 1 && nr <= 9 ? squareByFileRank(nf, nr) : INVALID_SQUARE;
    }
  }
})();

/**
 * 方向を指定して隣接マスを返します。
 * 盤外の場合は INVALID_SQUARE を返します。
 */
export function squareNeighbor(sq: Square, dir: Direction): Square {
  return NEIGHBOR_TABLE[sq * 12 + (dir as number)];
}

// 全マスの定数 (SQ_{筋}{段})
export const SQ_11: Square = squareByFileRank(1, 1);
export const SQ_12: Square = squareByFileRank(1, 2);
export const SQ_13: Square = squareByFileRank(1, 3);
export const SQ_14: Square = squareByFileRank(1, 4);
export const SQ_15: Square = squareByFileRank(1, 5);
export const SQ_16: Square = squareByFileRank(1, 6);
export const SQ_17: Square = squareByFileRank(1, 7);
export const SQ_18: Square = squareByFileRank(1, 8);
export const SQ_19: Square = squareByFileRank(1, 9);
export const SQ_21: Square = squareByFileRank(2, 1);
export const SQ_22: Square = squareByFileRank(2, 2);
export const SQ_23: Square = squareByFileRank(2, 3);
export const SQ_24: Square = squareByFileRank(2, 4);
export const SQ_25: Square = squareByFileRank(2, 5);
export const SQ_26: Square = squareByFileRank(2, 6);
export const SQ_27: Square = squareByFileRank(2, 7);
export const SQ_28: Square = squareByFileRank(2, 8);
export const SQ_29: Square = squareByFileRank(2, 9);
export const SQ_31: Square = squareByFileRank(3, 1);
export const SQ_32: Square = squareByFileRank(3, 2);
export const SQ_33: Square = squareByFileRank(3, 3);
export const SQ_34: Square = squareByFileRank(3, 4);
export const SQ_35: Square = squareByFileRank(3, 5);
export const SQ_36: Square = squareByFileRank(3, 6);
export const SQ_37: Square = squareByFileRank(3, 7);
export const SQ_38: Square = squareByFileRank(3, 8);
export const SQ_39: Square = squareByFileRank(3, 9);
export const SQ_41: Square = squareByFileRank(4, 1);
export const SQ_42: Square = squareByFileRank(4, 2);
export const SQ_43: Square = squareByFileRank(4, 3);
export const SQ_44: Square = squareByFileRank(4, 4);
export const SQ_45: Square = squareByFileRank(4, 5);
export const SQ_46: Square = squareByFileRank(4, 6);
export const SQ_47: Square = squareByFileRank(4, 7);
export const SQ_48: Square = squareByFileRank(4, 8);
export const SQ_49: Square = squareByFileRank(4, 9);
export const SQ_51: Square = squareByFileRank(5, 1);
export const SQ_52: Square = squareByFileRank(5, 2);
export const SQ_53: Square = squareByFileRank(5, 3);
export const SQ_54: Square = squareByFileRank(5, 4);
export const SQ_55: Square = squareByFileRank(5, 5);
export const SQ_56: Square = squareByFileRank(5, 6);
export const SQ_57: Square = squareByFileRank(5, 7);
export const SQ_58: Square = squareByFileRank(5, 8);
export const SQ_59: Square = squareByFileRank(5, 9);
export const SQ_61: Square = squareByFileRank(6, 1);
export const SQ_62: Square = squareByFileRank(6, 2);
export const SQ_63: Square = squareByFileRank(6, 3);
export const SQ_64: Square = squareByFileRank(6, 4);
export const SQ_65: Square = squareByFileRank(6, 5);
export const SQ_66: Square = squareByFileRank(6, 6);
export const SQ_67: Square = squareByFileRank(6, 7);
export const SQ_68: Square = squareByFileRank(6, 8);
export const SQ_69: Square = squareByFileRank(6, 9);
export const SQ_71: Square = squareByFileRank(7, 1);
export const SQ_72: Square = squareByFileRank(7, 2);
export const SQ_73: Square = squareByFileRank(7, 3);
export const SQ_74: Square = squareByFileRank(7, 4);
export const SQ_75: Square = squareByFileRank(7, 5);
export const SQ_76: Square = squareByFileRank(7, 6);
export const SQ_77: Square = squareByFileRank(7, 7);
export const SQ_78: Square = squareByFileRank(7, 8);
export const SQ_79: Square = squareByFileRank(7, 9);
export const SQ_81: Square = squareByFileRank(8, 1);
export const SQ_82: Square = squareByFileRank(8, 2);
export const SQ_83: Square = squareByFileRank(8, 3);
export const SQ_84: Square = squareByFileRank(8, 4);
export const SQ_85: Square = squareByFileRank(8, 5);
export const SQ_86: Square = squareByFileRank(8, 6);
export const SQ_87: Square = squareByFileRank(8, 7);
export const SQ_88: Square = squareByFileRank(8, 8);
export const SQ_89: Square = squareByFileRank(8, 9);
export const SQ_91: Square = squareByFileRank(9, 1);
export const SQ_92: Square = squareByFileRank(9, 2);
export const SQ_93: Square = squareByFileRank(9, 3);
export const SQ_94: Square = squareByFileRank(9, 4);
export const SQ_95: Square = squareByFileRank(9, 5);
export const SQ_96: Square = squareByFileRank(9, 6);
export const SQ_97: Square = squareByFileRank(9, 7);
export const SQ_98: Square = squareByFileRank(9, 8);
export const SQ_99: Square = squareByFileRank(9, 9);
