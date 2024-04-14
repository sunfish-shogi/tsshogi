import { Color } from "./color";
import { Piece, PieceType, pieceTypeToSFEN } from "./piece";
import { Square } from "./square";

/**
 * 指し手
 */
export class Move {
  constructor(
    public from: Square | PieceType,
    public to: Square,
    public promote: boolean,
    public color: Color,
    public pieceType: PieceType,
    public capturedPieceType: PieceType | null,
  ) {}

  /**
   * 指し手が等しいかどうかを判定します。
   * @param move
   */
  equals(move: Move | null | undefined): boolean {
    if (!move) {
      return false;
    }
    return (
      ((this.from instanceof Square &&
        move.from instanceof Square &&
        this.from.equals(move.from)) ||
        (!(this.from instanceof Square) &&
          !(move.from instanceof Square) &&
          this.from === move.from)) &&
      this.to.equals(move.to) &&
      this.promote === move.promote &&
      this.color === move.color &&
      this.pieceType === move.pieceType &&
      this.capturedPieceType === move.capturedPieceType
    );
  }

  /**
   * 成る手を返します。
   */
  withPromote(): Move {
    return new Move(this.from, this.to, true, this.color, this.pieceType, this.capturedPieceType);
  }

  /**
   * USI形式の文字列を取得します。
   */
  get usi(): string {
    let ret = "";
    if (this.from instanceof Square) {
      ret += this.from.sfen;
    } else {
      ret += pieceTypeToSFEN(this.from) + "*";
    }
    ret += this.to.sfen;
    if (this.promote) {
      ret += "+";
    }
    return ret;
  }
}

/**
 * USI形式の文字列を解析します。
 * @param usiMove
 */
export function parseUSIMove(usiMove: string): {
  from: Square | PieceType;
  to: Square;
  promote: boolean;
} | null {
  let from: PieceType | Square;
  if (usiMove[1] === "*") {
    const piece = Piece.newBySFEN(usiMove[0]);
    if (!piece) {
      return null;
    }
    from = piece.type;
  } else {
    const square = Square.parseSFENSquare(usiMove);
    if (!square) {
      return null;
    }
    from = square;
  }
  const to = Square.parseSFENSquare(usiMove.substring(2));
  if (!to) {
    return null;
  }
  const promote = usiMove.length >= 5 && usiMove[4] === "+";
  return { from, to, promote };
}

export enum SpecialMoveType {
  START = "start",
  INTERRUPT = "interrupt",
  RESIGN = "resign",
  IMPASS = "impass",
  DRAW = "draw",
  REPETITION_DRAW = "repetitionDraw",
  MATE = "mate",
  NO_MATE = "noMate",
  TIMEOUT = "timeout",
  FOUL_WIN = "foulWin", // 手番側の勝ち(直前の指し手が反則手)
  FOUL_LOSE = "foulLose", // 手番側の負け
  ENTERING_OF_KING = "enteringOfKing",
  WIN_BY_DEFAULT = "winByDefault",
  LOSE_BY_DEFAULT = "loseByDefault",
  TRY = "try", // トライ成立,
}

export type PredefinedSpecialMove = {
  type: SpecialMoveType;
};

export type AnySpecialMove = {
  type: "any";
  name: string;
};

export type SpecialMove = PredefinedSpecialMove | AnySpecialMove;

/**
 * 定義済みの特殊な指し手を作成します。
 * @param type
 */
export function specialMove(type: SpecialMoveType): PredefinedSpecialMove {
  return { type };
}

/**
 * 未定義の特殊な指し手を作成します。
 * @param name
 */
export function anySpecialMove(name: string): AnySpecialMove {
  return { type: "any", name };
}

/**
 * 定義済みの特殊な指し手かどうかを判定します。
 * @param move
 */
export function isKnownSpecialMove(move: Move | SpecialMove): move is PredefinedSpecialMove {
  return !(move instanceof Move) && move.type !== "any";
}

export function areSameSpecialMoves(a: SpecialMove, b: SpecialMove): boolean {
  if (a.type === "any" && b.type === "any") {
    return a.name === b.name;
  }
  return a.type === b.type;
}

export function areSameMoves(a: Move | SpecialMove, b: Move | SpecialMove): boolean {
  if (a instanceof Move && b instanceof Move) {
    return a.equals(b);
  }
  if (a instanceof Move || b instanceof Move) {
    return false;
  }
  return areSameSpecialMoves(a, b);
}
