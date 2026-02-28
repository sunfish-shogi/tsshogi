import { Direction, vectorToDirectionAndDistance } from "./direction";

function usiFileToNumber(usi: string): number | null {
  return usi >= "1" && usi <= "9" ? Number(usi) : null;
}

function usiRankToNumber(usi: string): number | null {
  switch (usi) {
    case "a":
      return 1;
    case "b":
      return 2;
    case "c":
      return 3;
    case "d":
      return 4;
    case "e":
      return 5;
    case "f":
      return 6;
    case "g":
      return 7;
    case "h":
      return 8;
    case "i":
      return 9;
    default:
      return null;
  }
}

const sfenRanks = ["a", "b", "c", "d", "e", "f", "g", "h", "i"];

/**
 * マス目
 */
export class Square {
  constructor(
    public file: number,
    public rank: number,
  ) {}

  /**
   * 9筋を0としたx座標
   */
  get x(): number {
    return 9 - this.file;
  }

  /**
   * 1段目を0としたy座標
   */
  get y(): number {
    return this.rank - 1;
  }

  /**
   * 0～80のインデックス
   * 0=「9一」, 1=「8一」, ..., 80=「1九」
   */
  get index(): number {
    return this.y * 9 + this.x;
  }

  /**
   * 先後を反転したマスを取得します。
   */
  get opposite(): Square {
    return new Square(10 - this.file, 10 - this.rank);
  }

  /**
   * 相対座標を指定して近隣のマスを取得します。
   * @param dx
   * @param dy
   */
  neighbor(dx: number, dy: number): Square;
  /**
   * 方向を指定して隣接(桂馬とびを含む)のマスを取得します。
   * @param dir
   */
  neighbor(dir: Direction): Square;
  neighbor(arg0: number | Direction, arg1?: number): Square {
    if (arg1 !== undefined) {
      // neighbor(dx, dy) overload
      return new Square(this.file - (arg0 as number), this.rank + arg1);
    }
    const idx = this.index;
    if (idx >= 0 && idx < 81) {
      return NEIGHBOR_TABLE[idx * 12 + (arg0 as number)];
    }
    return INVALID_SQUARE;
  }

  /** 指定したマスへの方向を返します。 */
  directionTo(square: Square): Direction {
    return vectorToDirectionAndDistance(square.x - this.x, square.y - this.y).direction;
  }

  /** 有効なマス目であるか判定します。 */
  get valid(): boolean {
    return this.file >= 1 && this.file <= 9 && this.rank >= 1 && this.rank <= 9;
  }

  /** 同じマス目か判定します。 */
  equals(square: Square | null | undefined): boolean {
    return !!square && this.file === square.file && this.rank === square.rank;
  }

  /**
   * 座標を指定してマスを取得します。
   * @param x
   * @param y
   */
  static newByXY(x: number, y: number): Square {
    return new Square(9 - x, y + 1);
  }

  /**
   * インデクスを指定してマスを取得します。
   * @param index
   */
  static newByIndex(index: number): Square {
    return new Square(9 - (index % 9), Math.trunc(index / 9) + 1);
  }

  /**
   * 全てのマス目の一覧
   */
  static all: Square[] = [];

  /**
   * SFEN形式の文字列を取得します。
   * @deprecated Use usi instead.
   */
  get sfen(): string {
    return this.usi;
  }

  /**
   * USI形式の文字列を取得します。
   */
  get usi(): string {
    return this.file + sfenRanks[this.rank - 1];
  }

  /**
   * SFEN形式のマス目をパースします。
   * @param sfen
   * @deprecated Use newByUSI instead.
   */
  static parseSFENSquare(sfen: string): Square | null {
    return Square.newByUSI(sfen);
  }

  /**
   * USI形式のマス目をパースします。
   * @param usi
   */
  static newByUSI(usi: string): Square | null {
    const file = usiFileToNumber(usi[0]);
    const rank = usiRankToNumber(usi[1]);
    if (!file || !rank) {
      return null;
    }
    return new Square(file, rank);
  }
}

for (let index = 0; index < 81; index += 1) {
  Square.all.push(Square.newByIndex(index));
}

// 盤外を示すセンチネル
const INVALID_SQUARE = new Square(-1, -1);

// 隣接マス事前計算テーブル: [squareIndex * 12 + direction] → Square (盤外は INVALID_SQUARE)
const NEIGHBOR_TABLE: Square[] = new Array(81 * 12);

for (let i = 0; i < 81; i++) {
  const sq = Square.all[i];
  for (let dir = 0; dir < 12; dir++) {
    // 方向ごとの計算 (neighbor メソッドと同じロジック)
    let f: number, r: number;
    switch (dir) {
      case 0:  f = sq.file;     r = sq.rank - 1; break; // UP
      case 1:  f = sq.file;     r = sq.rank + 1; break; // DOWN
      case 2:  f = sq.file + 1; r = sq.rank;     break; // LEFT
      case 3:  f = sq.file - 1; r = sq.rank;     break; // RIGHT
      case 4:  f = sq.file + 1; r = sq.rank - 1; break; // LEFT_UP
      case 5:  f = sq.file - 1; r = sq.rank - 1; break; // RIGHT_UP
      case 6:  f = sq.file + 1; r = sq.rank + 1; break; // LEFT_DOWN
      case 7:  f = sq.file - 1; r = sq.rank + 1; break; // RIGHT_DOWN
      case 8:  f = sq.file + 1; r = sq.rank - 2; break; // LEFT_UP_KNIGHT
      case 9:  f = sq.file - 1; r = sq.rank - 2; break; // RIGHT_UP_KNIGHT
      case 10: f = sq.file + 1; r = sq.rank + 2; break; // LEFT_DOWN_KNIGHT
      default: f = sq.file - 1; r = sq.rank + 2; break; // RIGHT_DOWN_KNIGHT
    }
    if (f >= 1 && f <= 9 && r >= 1 && r <= 9) {
      const idx = (r - 1) * 9 + (9 - f);
      NEIGHBOR_TABLE[i * 12 + dir] = Square.all[idx];
    } else {
      NEIGHBOR_TABLE[i * 12 + dir] = INVALID_SQUARE;
    }
  }
}
