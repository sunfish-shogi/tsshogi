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
    switch (arg0) {
      case Direction.UP:
        return new Square(this.file, this.rank - 1);
      case Direction.DOWN:
        return new Square(this.file, this.rank + 1);
      case Direction.LEFT:
        return new Square(this.file + 1, this.rank);
      case Direction.RIGHT:
        return new Square(this.file - 1, this.rank);
      case Direction.LEFT_UP:
        return new Square(this.file + 1, this.rank - 1);
      case Direction.RIGHT_UP:
        return new Square(this.file - 1, this.rank - 1);
      case Direction.LEFT_DOWN:
        return new Square(this.file + 1, this.rank + 1);
      case Direction.RIGHT_DOWN:
        return new Square(this.file - 1, this.rank + 1);
      case Direction.LEFT_UP_KNIGHT:
        return new Square(this.file + 1, this.rank - 2);
      case Direction.RIGHT_UP_KNIGHT:
        return new Square(this.file - 1, this.rank - 2);
      case Direction.LEFT_DOWN_KNIGHT:
        return new Square(this.file + 1, this.rank + 2);
      case Direction.RIGHT_DOWN_KNIGHT:
        return new Square(this.file - 1, this.rank + 2);
    }
    const dx = arg0 as number;
    const dy = arg1 as number;
    return new Square(this.file - dx, this.rank + dy);
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
