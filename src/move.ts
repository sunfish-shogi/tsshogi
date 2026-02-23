import { Color } from "./color";
import { Piece, PieceType, pieceTypeToSFEN } from "./piece";
import { Square, squareByUSI, squareUSI } from "./square";

/**
 * 指し手
 * from: 0-80 = 盤上の移動元 (Square.index), 81+ = 持ち駒打ち (PieceType + 81)
 * to:   0-80 = 移動先 (Square.index)
 */
export class Move {
  constructor(
    public from: number,
    public to: number,
    public promote: boolean,
    public color: Color,
    public pieceType: PieceType,
    public capturedPieceType: PieceType | null,
  ) {}

  /** 持ち駒打ちかどうか */
  get isDrop(): boolean {
    return this.from > 80;
  }

  /** 移動元のマス (盤上の指し手のみ有効) */
  get fromSquare(): Square {
    return this.from;
  }

  /** 打つ駒の種類 (持ち駒打ちのみ有効) */
  get dropPieceType(): PieceType {
    return (this.from - 81) as PieceType;
  }

  /** 移動先のマス */
  get toSquare(): Square {
    return this.to;
  }

  /**
   * 指し手が等しいかどうかを判定します。
   * @param move
   */
  equals(move: Move | null | undefined): boolean {
    if (!move) {
      return false;
    }
    return (
      this.from === move.from &&
      this.to === move.to &&
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
    if (this.isDrop) {
      ret += pieceTypeToSFEN(this.dropPieceType) + "*";
    } else {
      ret += squareUSI(this.from);
    }
    ret += squareUSI(this.to);
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
  from: number;
  to: number;
  promote: boolean;
} | null {
  let from: number;
  if (usiMove[1] === "*") {
    const piece = Piece.newBySFEN(usiMove[0]);
    if (!piece) {
      return null;
    }
    from = 81 + piece.type;
  } else {
    const square = squareByUSI(usiMove);
    if (square === null) {
      return null;
    }
    from = square;
  }
  const toSquare = squareByUSI(usiMove.substring(2));
  if (toSquare === null) {
    return null;
  }
  const promote = usiMove.length >= 5 && usiMove[4] === "+";
  return { from, to: toSquare, promote };
}

export enum SpecialMoveType {
  START = "start",
  INTERRUPT = "interrupt",
  RESIGN = "resign",
  MAX_MOVES = "maxMoves",
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
