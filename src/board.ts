import { Color, reverseColor } from "./color";
import { directions, MoveType, resolveMoveType, reverseDirection } from "./direction";
import { Piece, PieceType } from "./piece";
import { Square } from "./square";

function sfenCharToNumber(sfen: string): number | null {
  switch (sfen) {
    case "1":
      return 1;
    case "2":
      return 2;
    case "3":
      return 3;
    case "4":
      return 4;
    case "5":
      return 5;
    case "6":
      return 6;
    case "7":
      return 7;
    case "8":
      return 8;
    case "9":
      return 9;
    default:
      return null;
  }
}

// Piece byte encoding:
//   0       = empty
//   1..14   = BLACK PAWN..DRAGON  (= type + 1)
//   15..28  = WHITE PAWN..DRAGON  (= type + 15)
// encode: (piece.color - 1) * 14 + piece.type + 1
// decode: PIECE_TABLE[byte]

const PIECE_TABLE: readonly (Piece | null)[] = (() => {
  const table: (Piece | null)[] = [null];
  for (let t = 0; t < 14; t++) {
    table.push(new Piece(Color.BLACK, t as PieceType));
  }
  for (let t = 0; t < 14; t++) {
    table.push(new Piece(Color.WHITE, t as PieceType));
  }
  return table;
})();

function encodePiece(piece: Piece): number {
  return (piece.color - 1) * 14 + piece.type + 1;
}

type PowerDetectionOption = {
  filled?: Square;
  ignore?: Square;
};

/**
 * 盤面 (読み取り専用)
 */
export interface ImmutableBoard {
  /**
   * 指定したマスの駒を取得します。
   * @param square
   */
  at(square: Square): Piece | null;
  /**
   * 空ではないマスの一覧を取得します。
   */
  listNonEmptySquares(): Square[];
  /**
   * 指定した手番の玉のマスを返します。
   * @param color
   */
  findKing(color: Color): Square | undefined;
  /**
   * 指定したマスに指定した手番の駒の利きがあるかどうかを判定します。
   * @param target
   * @param color
   * @param option
   */
  hasPower(target: Square, color: Color, option?: PowerDetectionOption): boolean;
  /**
   * 指定した手番の玉に対して王手がかかっているかどうかを判定します。
   * @param kingColor
   * @param option
   */
  isChecked(kingColor: Color, option?: PowerDetectionOption): boolean;
  /**
   * SFEN形式の文字列を取得します。
   */
  readonly sfen: string;
}

/**
 * 盤面
 */
export class Board {
  private squares: Uint8Array;

  constructor() {
    this.squares = new Uint8Array(81);
    this.resetBySFEN("lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL");
  }

  /**
   * 指定したマスの駒を取得します。
   * @param square
   */
  at(square: Square): Piece | null {
    const idx = square.index;
    if (idx < 0 || idx >= 81) return null;
    return PIECE_TABLE[this.squares[idx]];
  }

  /** 有効なインデックス (0-80) で駒を取得します。bounds check なし。 */
  atByIndex(idx: number): Piece | null {
    return PIECE_TABLE[this.squares[idx]];
  }

  /** 有効なインデックス (0-80) で駒を削除します。bounds check なし。 */
  removeByIndex(idx: number): Piece | null {
    const byte = this.squares[idx];
    this.squares[idx] = 0;
    return PIECE_TABLE[byte];
  }

  /** 有効なインデックス (0-80) で駒を配置します。bounds check なし。 */
  setByIndex(idx: number, piece: Piece): void {
    this.squares[idx] = encodePiece(piece);
  }

  /**
   * 指定したマスに駒を配置します。
   * @param square
   * @param piece
   */
  set(square: Square, piece: Piece): void {
    this.squares[square.index] = encodePiece(piece);
  }

  /**
   * 指定した2マスの駒を入れ替えます。
   * @param square1
   * @param square2
   */
  swap(square1: Square, square2: Square): void {
    const tmp = this.squares[square1.index];
    this.squares[square1.index] = this.squares[square2.index];
    this.squares[square2.index] = tmp;
  }

  /**
   * 指定したマスの駒を取り除きます。
   * @param square
   */
  remove(square: Square): Piece | null {
    const idx = square.index;
    const byte = this.squares[idx];
    this.squares[idx] = 0;
    return PIECE_TABLE[byte];
  }

  /**
   * 空ではないマスの一覧を取得します。
   */
  listNonEmptySquares(): Square[] {
    return Square.all.filter((square) => this.squares[square.index] !== 0);
  }

  /**
   * 指定した手番の駒があるマスの一覧を取得します。
   * @param color
   */
  listSquaresByColor(color: Color): Square[] {
    // BLACK: bytes 1..14, WHITE: bytes 15..28
    if (color === Color.BLACK) {
      return Square.all.filter((square) => {
        const byte = this.squares[square.index];
        return byte >= 1 && byte <= 14;
      });
    }
    return Square.all.filter((square) => this.squares[square.index] >= 15);
  }

  /**
   * 指定した駒があるマスの一覧を取得します。
   * @param target
   */
  listSquaresByPiece(target: Piece): Square[] {
    const targetByte = encodePiece(target);
    return Square.all.filter((square) => this.squares[square.index] === targetByte);
  }

  /**
   * 全てのマスの駒を取り除きます。
   */
  clear(): void {
    this.squares.fill(0);
  }

  /**
   * SFEN形式の文字列を取得します。
   */
  get sfen(): string {
    let ret = "";
    let empty = 0;
    for (let y = 0; y < 9; y += 1) {
      for (let x = 0; x < 9; x += 1) {
        const piece = this.at(Square.newByXY(x, y));
        if (piece) {
          if (empty) {
            ret += empty;
            empty = 0;
          }
          ret += piece.sfen;
        } else {
          empty += 1;
        }
      }
      if (empty) {
        ret += empty;
        empty = 0;
      }
      if (y !== 8) {
        ret += "/";
      }
    }
    return ret;
  }

  /**
   * SFENで盤面を初期化します。
   * @param sfen
   */
  resetBySFEN(sfen: string): boolean {
    if (!Board.isValidSFEN(sfen)) {
      return false;
    }
    this.clear();
    const rows = sfen.split("/");
    for (let y = 0; y < 9; y += 1) {
      let x = 0;
      for (let i = 0; i < rows[y].length; i += 1) {
        let c = rows[y][i];
        if (c === "+") {
          i += 1;
          c += rows[y][i];
        }
        const n = sfenCharToNumber(c);
        if (n) {
          x += n;
        } else {
          this.set(Square.newByXY(x, y), Piece.newBySFEN(c) as Piece);
          x += 1;
        }
      }
    }
    return true;
  }

  /**
   * 指定した手番の玉のマスを返します。
   * @param color
   */
  findKing(color: Color): Square | undefined {
    const kingByte = encodePiece(new Piece(color, PieceType.KING));
    return Square.all.find((square) => this.squares[square.index] === kingByte);
  }

  /**
   * 指定したマスに指定した手番の駒の利きがあるかどうかを判定します。
   * @param target
   * @param color
   * @param option
   */
  hasPower(target: Square, color: Color, option?: PowerDetectionOption): boolean {
    return directions.some((dir) => {
      let step = 0;
      for (let square = target.neighbor(dir); square.valid; square = square.neighbor(dir)) {
        step += 1;
        if (option && option.filled && square.equals(option.filled)) {
          break;
        }
        if (option && option.ignore && square.equals(option.ignore)) {
          continue;
        }
        const byte = this.squares[square.index];
        if (byte !== 0) {
          const pieceColor = byte >= 15 ? Color.WHITE : Color.BLACK;
          if (pieceColor !== color) {
            return false;
          }
          const rdir = reverseDirection(dir);
          const type = resolveMoveType(PIECE_TABLE[byte] as Piece, rdir);
          return type === MoveType.LONG || (type === MoveType.SHORT && step === 1);
        }
      }
      return false;
    });
  }

  /**
   * 指定した手番の玉に対して王手がかかっているかどうかを判定します。
   * @param kingColor
   * @param option
   */
  isChecked(kingColor: Color, option?: PowerDetectionOption): boolean {
    const square = this.findKing(kingColor);
    if (!square) {
      return false;
    }
    return this.hasPower(square, reverseColor(kingColor), {
      filled: option && option.filled,
      ignore: option && option.ignore,
    });
  }

  /**
   * 文字列が正しいSFEN形式であるか判定します。
   * @param sfen
   */
  static isValidSFEN(sfen: string): boolean {
    const rows = sfen.split("/");
    if (rows.length !== 9) {
      return false;
    }
    for (let y = 0; y < 9; y += 1) {
      let x = 0;
      for (let i = 0; i < rows[y].length; i += 1) {
        let c = rows[y][i];
        if (c === "+") {
          i += 1;
          c += rows[y][i];
        }
        const n = sfenCharToNumber(c);
        if (n) {
          x += n;
        } else if (Piece.isValidSFEN(c)) {
          x += 1;
        } else {
          return false;
        }
      }
      if (x !== 9) {
        return false;
      }
    }
    return true;
  }

  /**
   * 別のオブジェクトから盤面をコピーします。
   * @param board
   */
  copyFrom(board: Board): void {
    this.squares.set(board.squares); // Uint8Array.set = memcpy
  }
}
