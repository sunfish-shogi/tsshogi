import { Board, ImmutableBoard } from "./board";
import { Color, reverseColor, colorToSFEN, parseSFENColor, isValidSFENColor } from "./color";
import { Move, parseUSIMove } from "./move";
import { Square } from "./square";
import { Hand, ImmutableHand } from "./hand";
import { Piece, PieceType } from "./piece";
import {
  Direction,
  movableDirections,
  MoveType,
  resolveMoveType,
  vectorToDirectionAndDistance,
} from "./direction";

// Deprecated: Use InitialPositionSFEN instead.
// NOTICE: ShogiHomeのgame_setting.jsonで使用しているため互換性のために残す。
export enum InitialPositionType {
  STANDARD = "standard",
  EMPTY = "empty",
  HANDICAP_LANCE = "handicapLance",
  HANDICAP_RIGHT_LANCE = "handicapRightLance",
  HANDICAP_BISHOP = "handicapBishop",
  HANDICAP_ROOK = "handicapRook",
  HANDICAP_ROOK_LANCE = "handicapRookLance",
  HANDICAP_2PIECES = "handicap2Pieces",
  HANDICAP_4PIECES = "handicap4Pieces",
  HANDICAP_6PIECES = "handicap6Pieces",
  HANDICAP_8PIECES = "handicap8Pieces",
  HANDICAP_10PIECES = "handicap10Pieces",
  TSUME_SHOGI = "tsumeShogi",
  TSUME_SHOGI_2KINGS = "tsumeShogi2Kings",
}

export enum InitialPositionSFEN {
  STANDARD = "lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL b - 1",
  EMPTY = "9/9/9/9/9/9/9/9/9 b - 1",
  HANDICAP_LANCE = "lnsgkgsn1/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w - 1",
  HANDICAP_RIGHT_LANCE = "1nsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w - 1",
  HANDICAP_BISHOP = "lnsgkgsnl/1r7/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w - 1",
  HANDICAP_ROOK = "lnsgkgsnl/7b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w - 1",
  HANDICAP_ROOK_LANCE = "lnsgkgsn1/7b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w - 1",
  HANDICAP_2PIECES = "lnsgkgsnl/9/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w - 1",
  HANDICAP_4PIECES = "1nsgkgsn1/9/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w - 1",
  HANDICAP_6PIECES = "2sgkgs2/9/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w - 1",
  HANDICAP_8PIECES = "3gkg3/9/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w - 1",
  HANDICAP_10PIECES = "4k4/9/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w - 1",
  TSUME_SHOGI = "4k4/9/9/9/9/9/9/9/9 b 2r2b4g4s4n4l18p 1",
  TSUME_SHOGI_2KINGS = "4k4/9/9/9/9/9/9/9/4K4 b 2r2b4g4s4n4l18p 1",
}

/**
 * InitialPositionType から SFEN 形式の文字列に変換します。
 * @param type
 */
export function initialPositionTypeToSFEN(type: InitialPositionType): string {
  return {
    [InitialPositionType.STANDARD]: InitialPositionSFEN.STANDARD,
    [InitialPositionType.EMPTY]: InitialPositionSFEN.EMPTY,
    [InitialPositionType.HANDICAP_LANCE]: InitialPositionSFEN.HANDICAP_LANCE,
    [InitialPositionType.HANDICAP_RIGHT_LANCE]: InitialPositionSFEN.HANDICAP_RIGHT_LANCE,
    [InitialPositionType.HANDICAP_BISHOP]: InitialPositionSFEN.HANDICAP_BISHOP,
    [InitialPositionType.HANDICAP_ROOK]: InitialPositionSFEN.HANDICAP_ROOK,
    [InitialPositionType.HANDICAP_ROOK_LANCE]: InitialPositionSFEN.HANDICAP_ROOK_LANCE,
    [InitialPositionType.HANDICAP_2PIECES]: InitialPositionSFEN.HANDICAP_2PIECES,
    [InitialPositionType.HANDICAP_4PIECES]: InitialPositionSFEN.HANDICAP_4PIECES,
    [InitialPositionType.HANDICAP_6PIECES]: InitialPositionSFEN.HANDICAP_6PIECES,
    [InitialPositionType.HANDICAP_8PIECES]: InitialPositionSFEN.HANDICAP_8PIECES,
    [InitialPositionType.HANDICAP_10PIECES]: InitialPositionSFEN.HANDICAP_10PIECES,
    [InitialPositionType.TSUME_SHOGI]: InitialPositionSFEN.TSUME_SHOGI,
    [InitialPositionType.TSUME_SHOGI_2KINGS]: InitialPositionSFEN.TSUME_SHOGI_2KINGS,
  }[type];
}

function isInvalidRank(color: Color, type: PieceType, rank: number): boolean {
  if (color === Color.BLACK) {
    if (type === PieceType.PAWN || type === PieceType.LANCE) return rank === 1;
    if (type === PieceType.KNIGHT) return rank <= 2;
  } else {
    if (type === PieceType.PAWN || type === PieceType.LANCE) return rank === 9;
    if (type === PieceType.KNIGHT) return rank >= 8;
  }
  return false;
}

export function isPromotableRank(color: Color, rank: number): boolean {
  if (color === Color.BLACK) {
    return rank <= 3;
  }
  return rank >= 7;
}

function pawnExists(color: Color, board: Board, file: number): boolean {
  for (let rank = 1; rank <= 9; rank += 1) {
    const piece = board.at(new Square(file, rank));
    if (piece && piece.type === PieceType.PAWN && piece.color === color) {
      return true;
    }
  }
  return false;
}

export type PositionChange = {
  move?: {
    /**
     * 移動元のマスまたは持ち駒を指定します。
     */
    from: Square | Piece;
    /**
     * 移動先のマスまたは駒台を指定します。
     */
    to: Square | Color;
  };
  /**
   * 指定したマスの駒をローテートします。
   */
  rotate?: Square;
};

/**
 * 局面(読み取り専用)
 */
export interface ImmutablePosition {
  /**
   * 盤面
   */
  readonly board: ImmutableBoard;
  /**
   * 手番
   */
  readonly color: Color;
  /**
   * 先手の持ち駒
   */
  readonly blackHand: ImmutableHand;
  /**
   * 後手の持ち駒
   */
  readonly whiteHand: ImmutableHand;
  /**
   * 指定した手番の持ち駒を取得します。
   * @param color
   */
  hand(color: Color): ImmutableHand;
  /**
   * 王手がかかっているかどうかを判定します。
   */
  readonly checked: boolean;
  /**
   * 現在の局面における指し手を生成します。
   * @param from
   * @param to
   */
  createMove(from: Square | PieceType, to: Square): Move | null;
  /**
   * USI形式の指し手から Move オブジェクトを生成します。
   * @param usiMove
   */
  createMoveByUSI(usiMove: string): Move | null;
  /**
   * 打ち歩詰めかどうかを判定します。
   * @param move
   */
  isPawnDropMate(move: Move): boolean;
  /**
   * 指定したマスに利いている駒のマス目を列挙します。
   * @param to
   * @param piece
   */
  listAttackers(to: Square): Square[];
  /**
   * 指定したマスに利いている指定した駒のマス目を列挙します。
   * @param to
   * @param piece
   */
  listAttackersByPiece(to: Square, piece: Piece): Square[];
  /**
   * 合法手かどうかを判定します。
   * @param move
   */
  isValidMove(move: Move): boolean;
  /**
   * 有効な編集作業かどうかを判定します。
   * @param from 移動元のマスまたは持ち駒を指定します。
   * @param to 移動先のマスまたは駒台を指定します。
   */
  isValidEditing(from: Square | Piece, to: Square | Color): boolean;
  /**
   * SFEN形式の文字列を返します。
   */
  readonly sfen: string;
  /**
   * 手数を指定してSFEN形式の文字列を取得します。
   * @param nextPly
   */
  getSFEN(nextPly: number): string;
  /**
   * クローンを生成します。
   */
  clone(): Position;
}

export type DoMoveOption = {
  ignoreValidation?: boolean;
};

/**
 * 局面
 */
export class Position {
  private _board = new Board();
  private _color = Color.BLACK;
  private _blackHand = new Hand();
  private _whiteHand = new Hand();

  /**
   * 盤面
   */
  get board(): Board {
    return this._board;
  }

  /**
   * 手番
   */
  get color(): Color {
    return this._color;
  }

  /**
   * 先手の持ち駒
   */
  get blackHand(): Hand {
    return this._blackHand;
  }

  /**
   * 後手の持ち駒
   */
  get whiteHand(): Hand {
    return this._whiteHand;
  }

  /**
   * 指定した手番の持ち駒を取得します。
   * @param color
   */
  hand(color: Color): Hand {
    if (color === Color.BLACK) {
      return this._blackHand;
    }
    return this._whiteHand;
  }

  /**
   * 王手がかかっているかどうかを判定します。
   */
  get checked(): boolean {
    return this._board.isChecked(this.color);
  }

  /**
   * 現在の局面における指し手を生成します。
   * @param from
   * @param to
   */
  createMove(from: Square | PieceType, to: Square): Move | null {
    const fromNum = from instanceof Square ? from.index : 81 + from;
    const toNum = to.index;
    let pieceType: PieceType;
    if (from instanceof Square) {
      const piece = this._board.at(from);
      if (!piece) {
        return null;
      }
      pieceType = piece.type;
    } else {
      pieceType = from;
    }
    const capturedPiece = this._board.at(to);
    return new Move(
      fromNum,
      toNum,
      false,
      this.color,
      pieceType,
      capturedPiece ? capturedPiece.type : null,
    );
  }

  /**
   * USI形式の指し手から Move オブジェクトを生成します。
   * @param usiMove
   */
  createMoveByUSI(usiMove: string): Move | null {
    const m = parseUSIMove(usiMove);
    if (!m) {
      return null;
    }
    const from: Square | PieceType = m.from > 80 ? (m.from - 81) as PieceType : Square.all[m.from];
    let move = this.createMove(from, Square.all[m.to]);
    if (!move) {
      return null;
    }
    if (m.promote) {
      move = move.withPromote();
    }
    return move;
  }

  /**
   * 打ち歩詰めかどうかを判定します。
   * @param move
   */
  isPawnDropMate(move: Move): boolean {
    if (!move.isDrop) {
      return false;
    }
    if (move.pieceType !== PieceType.PAWN) {
      return false;
    }
    const toSquare = move.toSquare;
    const kingSquare = toSquare.neighbor(move.color === Color.BLACK ? Direction.UP : Direction.DOWN);
    const king = this.board.at(kingSquare);
    if (!king || king.type !== PieceType.KING || king.color === move.color) {
      return false;
    }
    const movable = movableDirections(king).find((dir) => {
      const to = kingSquare.neighbor(dir);
      if (!to.valid) {
        return false;
      }
      const piece = this.board.at(to);
      if (piece && piece.color == king.color) {
        return false;
      }
      return !this.board.hasPower(to, move.color, { filled: toSquare });
    });
    if (movable !== undefined) {
      return false;
    }
    return !this.board.listSquaresByColor(king.color).find((from) => {
      return (
        !from.equals(kingSquare) &&
        this.isMovable(from, toSquare) &&
        !this.board.isChecked(king.color, {
          filled: toSquare,
          ignore: from,
        })
      );
    });
  }

  /**
   * 指定したマスに利いている駒のマス目を列挙します。
   * @param to
   * @param piece
   */
  listAttackers(to: Square): Square[] {
    return this.board.listNonEmptySquares().filter((from) => {
      return this.isMovable(from, to);
    });
  }

  /**
   * 指定したマスに利いている指定した駒のマス目を列挙します。
   * @param to
   * @param piece
   */
  listAttackersByPiece(to: Square, piece: Piece): Square[] {
    return this.board.listSquaresByPiece(piece).filter((from) => {
      return this.isMovable(from, to);
    });
  }

  /**
   * 合法手かどうかを判定します。
   * @param move
   */
  isValidMove(move: Move): boolean {
    const toSquare = move.toSquare;
    if (!move.isDrop) {
      const fromSquare = move.fromSquare;
      const target = this._board.atByIndex(move.from);
      if (!target || target.color !== this.color || target.type !== move.pieceType) {
        return false;
      }
      if (!this.isMovable(fromSquare, toSquare)) {
        return false;
      }
      const captured = this._board.atByIndex(move.to);
      if (captured && captured.color === this.color) {
        return false;
      }
      if ((captured === null) !== (move.capturedPieceType === null)) {
        return false;
      }
      if (captured && move.capturedPieceType !== null && captured.type !== move.capturedPieceType) {
        return false;
      }
      if (move.promote) {
        if (!target.isPromotable()) {
          return false;
        }
        if (
          !isPromotableRank(this.color, fromSquare.rank) &&
          !isPromotableRank(this.color, toSquare.rank)
        ) {
          return false;
        }
      } else if (isInvalidRank(this.color, target.type, toSquare.rank)) {
        return false;
      }
      if (
        move.pieceType !== PieceType.KING
          ? this._board.isChecked(this.color, {
              filled: toSquare,
              ignore: fromSquare,
            })
          : this._board.hasPower(toSquare, reverseColor(this.color), {
              ignore: fromSquare,
            })
      ) {
        return false;
      }
    } else {
      const dropType = move.dropPieceType;
      if (move.promote) {
        return false;
      }
      if (move.color !== this.color) {
        return false;
      }
      if (this.hand(this.color).count(dropType) === 0) {
        return false;
      }
      if (this._board.atByIndex(move.to)) {
        return false;
      }
      if (isInvalidRank(this.color, dropType, toSquare.rank)) {
        return false;
      }
      if (dropType === PieceType.PAWN && pawnExists(this.color, this._board, toSquare.file)) {
        return false;
      }
      if (this._board.isChecked(this.color, { filled: toSquare })) {
        return false;
      }
      if (this.isPawnDropMate(move)) {
        return false;
      }
    }
    return true;
  }

  /**
   * 指定した指し手で駒を動かします。
   * @param move
   * @param opt
   */
  doMove(move: Move, opt?: DoMoveOption): boolean {
    if (!(opt && opt.ignoreValidation) && !this.isValidMove(move)) {
      return false;
    }
    if (!move.isDrop) {
      const target = this._board.atByIndex(move.from) as Piece;
      const captured = this._board.atByIndex(move.to);
      this._board.removeByIndex(move.from);
      this._board.setByIndex(move.to, move.promote ? target.promoted() : target);
      if (captured && captured.type !== PieceType.KING) {
        this.hand(this.color).add(captured.unpromoted().type, 1);
      }
    } else {
      const dropType = move.dropPieceType;
      this.hand(this.color).reduce(dropType, 1);
      this._board.setByIndex(move.to, new Piece(this.color, dropType));
    }
    this._color = reverseColor(this.color);
    return true;
  }

  /**
   * 指定した指し手を元に戻します。
   * @param move
   * @param opt
   */
  undoMove(move: Move): void {
    this._color = reverseColor(this.color);
    if (!move.isDrop) {
      this._board.setByIndex(move.from, new Piece(this.color, move.pieceType));
      if (move.capturedPieceType !== null) {
        const capturedPiece = new Piece(reverseColor(this.color), move.capturedPieceType);
        this._board.setByIndex(move.to, capturedPiece);
        if (capturedPiece.type !== PieceType.KING) {
          this.hand(this.color).reduce(capturedPiece.unpromoted().type, 1);
        }
      } else {
        this._board.removeByIndex(move.to);
      }
    } else {
      this.hand(this.color).add(move.dropPieceType, 1);
      this._board.removeByIndex(move.to);
    }
  }

  /**
   * 有効な編集作業かどうかを判定します。
   * @param from
   * @param to
   */
  isValidEditing(from: Square | Piece, to: Square | Color): boolean {
    if (from instanceof Square) {
      const piece = this._board.at(from);
      if (!piece) {
        return false;
      }
      if (to instanceof Square) {
        if (from.equals(to)) {
          return false;
        }
      } else if (piece.type === PieceType.KING) {
        return false;
      }
    } else {
      if (from.color === undefined) {
        return false;
      }
      if (this.hand(from.color).count(from.type) === 0) {
        return false;
      }
      if (to instanceof Square) {
        if (this._board.at(to)) {
          return false;
        }
      } else if (from.color === to) {
        return false;
      }
    }
    return true;
  }

  /**
   * 盤面を編集します。
   * @param change
   */
  edit(change: PositionChange): boolean {
    if (change.move) {
      if (!this.isValidEditing(change.move.from, change.move.to)) {
        return false;
      }
      if (!(change.move.from instanceof Square)) {
        this.hand(change.move.from.color).reduce(change.move.from.type, 1);
        if (change.move.to instanceof Square) {
          this._board.set(change.move.to, change.move.from);
        } else {
          this.hand(change.move.to).add(change.move.from.type, 1);
        }
      } else if (!(change.move.to instanceof Square)) {
        const piece = this._board.remove(change.move.from) as Piece;
        this.hand(change.move.to).add(piece.unpromoted().type, 1);
      } else {
        this._board.swap(change.move.from, change.move.to);
      }
    }
    if (change.rotate) {
      const piece = this._board.at(change.rotate);
      if (piece) {
        this._board.set(change.rotate, piece.rotate());
      }
    }
    return true;
  }

  // Deprecated: Use resetBySFEN() instead.
  reset(type: InitialPositionType): void {
    this.resetBySFEN(initialPositionTypeToSFEN(type));
  }

  /**
   * SFEN形式の文字列を返します。
   */
  get sfen(): string {
    return this.getSFEN(1);
  }

  /**
   * 手数を指定してSFEN形式の文字列を取得します。
   * @param nextPly
   */
  getSFEN(nextPly: number): string {
    let ret = `${this._board.sfen} ${colorToSFEN(this.color)} `;
    ret += Hand.formatSFEN(this._blackHand, this._whiteHand);
    ret += " " + Math.max(nextPly, 1);
    return ret;
  }

  /**
   * SFENで盤面を初期化します。
   * @param sfen
   */
  resetBySFEN(sfen: string): boolean {
    if (!Position.isValidSFEN(sfen)) {
      return false;
    }
    const sections = sfen.split(" ");
    if (sections[0] === "sfen") {
      sections.shift();
    }
    this._board.resetBySFEN(sections[0]);
    this._color = parseSFENColor(sections[1]);
    const hands = Hand.parseSFEN(sections[2]) as { black: Hand; white: Hand };
    this._blackHand = hands.black;
    this._whiteHand = hands.white;
    return true;
  }

  /**
   * 手番を設定します。
   * @param color
   */
  setColor(color: Color): void {
    this._color = color;
  }

  /**
   * 正しいSFEN形式の文字列かどうかを判定します。
   * @param sfen
   */
  static isValidSFEN(sfen: string): boolean {
    const sections = sfen.split(" ");
    if ((sections.length === 5 || sections.length === 4) && sections[0] === "sfen") {
      sections.shift();
    }
    if (sections.length !== 4 && sections.length !== 3) {
      return false;
    }
    if (!Board.isValidSFEN(sections[0])) {
      return false;
    }
    if (!isValidSFENColor(sections[1])) {
      return false;
    }
    if (!Hand.isValidSFEN(sections[2])) {
      return false;
    }
    if (sections.length === 4 && !/[0-9]+/.test(sections[3])) {
      return false;
    }
    return true;
  }

  /**
   * SFEN形式の文字列から局面を生成します。
   */
  static newBySFEN(sfen: string): Position | null {
    const position = new Position();
    return position.resetBySFEN(sfen) ? position : null;
  }

  private isMovable(from: Square, to: Square): boolean {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const { direction, distance, ok } = vectorToDirectionAndDistance(dx, dy);
    if (!ok) {
      return false;
    }
    const piece = this._board.at(from);
    if (!piece) {
      return false;
    }
    switch (resolveMoveType(piece, direction)) {
      default:
        return false;
      case MoveType.SHORT:
        return distance === 1;
      case MoveType.LONG: {
        for (
          let square = from.neighbor(direction);
          square.valid;
          square = square.neighbor(direction)
        ) {
          if (square.equals(to)) {
            return true;
          }
          if (this._board.at(square)) {
            return false;
          }
        }
        return false;
      }
    }
  }

  /**
   * 別のオブジェクトからコピーします。
   * @param position
   */
  copyFrom(position: Position): void {
    this._board.copyFrom(position._board);
    this._color = position.color;
    this._blackHand.copyFrom(position._blackHand);
    this._whiteHand.copyFrom(position._whiteHand);
  }

  /**
   * クローンを生成します。
   */
  clone(): Position {
    const position = new Position();
    position.copyFrom(this);
    return position;
  }
}

type PieceCounts = {
  pawn: number;
  lance: number;
  knight: number;
  silver: number;
  gold: number;
  bishop: number;
  rook: number;
  king: number;
  promPawn: number;
  promLance: number;
  promKnight: number;
  promSilver: number;
  horse: number;
  dragon: number;
};

// PieceType 数値インデックス → PieceCounts プロパティ名
const PIECE_COUNT_KEYS: (keyof PieceCounts)[] = [
  "pawn", "lance", "knight", "silver", "gold", "bishop", "rook", "king",
  "promPawn", "promLance", "promKnight", "promSilver", "horse", "dragon",
];

/**
 * PieceType から PieceCounts の値を取得します。
 */
export function getPieceCount(counts: PieceCounts, pieceType: PieceType): number {
  return counts[PIECE_COUNT_KEYS[pieceType]];
}

export function countExistingPieces(position: ImmutablePosition): PieceCounts {
  const c = new Array(14).fill(0) as number[];
  Square.all.forEach((square) => {
    const piece = position.board.at(square);
    if (piece) {
      c[piece.type] += 1;
    }
  });
  position.blackHand.forEach((pieceType, n) => {
    c[pieceType] += n;
  });
  position.whiteHand.forEach((pieceType, n) => {
    c[pieceType] += n;
  });
  return {
    pawn: c[PieceType.PAWN],
    lance: c[PieceType.LANCE],
    knight: c[PieceType.KNIGHT],
    silver: c[PieceType.SILVER],
    gold: c[PieceType.GOLD],
    bishop: c[PieceType.BISHOP],
    rook: c[PieceType.ROOK],
    king: c[PieceType.KING],
    promPawn: c[PieceType.PROM_PAWN],
    promLance: c[PieceType.PROM_LANCE],
    promKnight: c[PieceType.PROM_KNIGHT],
    promSilver: c[PieceType.PROM_SILVER],
    horse: c[PieceType.HORSE],
    dragon: c[PieceType.DRAGON],
  };
}

export function countNotExistingPieces(position: ImmutablePosition): PieceCounts {
  const existed = countExistingPieces(position);
  return {
    pawn: 18 - existed.pawn - existed.promPawn,
    lance: 4 - existed.lance - existed.promLance,
    knight: 4 - existed.knight - existed.promKnight,
    silver: 4 - existed.silver - existed.promSilver,
    gold: 4 - existed.gold,
    bishop: 2 - existed.bishop - existed.horse,
    rook: 2 - existed.rook - existed.dragon,
    king: 2 - existed.king,
    promPawn: 0,
    promLance: 0,
    promKnight: 0,
    promSilver: 0,
    horse: 0,
    dragon: 0,
  };
}

export enum JishogiDeclarationRule {
  GENERAL24 = "general24", // 24点法
  GENERAL27 = "general27", // 27点法
}

export enum JishogiDeclarationResult {
  WIN = "win",
  LOSE = "lose",
  DRAW = "draw",
}

function invadingPieces(board: ImmutableBoard, color: Color): Piece[] {
  return board
    .listNonEmptySquares()
    .filter((square) => {
      if (!isPromotableRank(color, square.rank)) {
        return false;
      }
      const piece = board.at(square);
      return piece?.color === color && piece?.type !== PieceType.KING;
    })
    .map((square) => board.at(square) as Piece);
}

/**
 * 時将棋指し直し判定の点数を計算します。
 * 入玉宣言法と異なり、敵陣に侵入していない駒も加点対象となります。
 * 時将棋指し直しは原則として対局者の合意によって成立し、ここで求められる点数はあくまで参考値です。
 * @param position
 * @param color 計算対象のプレイヤー
 * @returns
 */
export function countJishogiPoint(position: ImmutablePosition, color: Color): number {
  let point = 0;
  Square.all.forEach((square) => {
    const piece = position.board.at(square);
    if (piece?.color === color && piece.type !== PieceType.KING) {
      const type = piece.unpromoted().type;
      point += type === PieceType.BISHOP || type === PieceType.ROOK ? 5 : 1;
    }
  });
  const hand = position.hand(color);
  point +=
    hand.count(PieceType.PAWN) +
    hand.count(PieceType.LANCE) +
    hand.count(PieceType.KNIGHT) +
    hand.count(PieceType.SILVER) +
    hand.count(PieceType.GOLD) +
    hand.count(PieceType.BISHOP) * 5 +
    hand.count(PieceType.ROOK) * 5;
  if (color === Color.WHITE) {
    // 駒落ちの場合は上手に落とした駒を加点する。
    const notExisting = countNotExistingPieces(position);
    point +=
      notExisting.pawn +
      notExisting.lance +
      notExisting.knight +
      notExisting.silver +
      notExisting.gold +
      notExisting.bishop * 5 +
      notExisting.rook * 5;
  }
  return point;
}

/**
 * 入玉宣言法に基づいて宣言する際の点数を計算します。
 * 敵陣に侵入している駒と持ち駒だけが対象となり、それ以外の駒は加点対象になりません。
 * @param position
 * @param color 宣言するプレイヤー
 */
export function countJishogiDeclarationPoint(position: ImmutablePosition, color: Color): number {
  let point = 0;
  for (const piece of invadingPieces(position.board, color)) {
    const type = piece.unpromoted().type;
    point += type === PieceType.BISHOP || type === PieceType.ROOK ? 5 : 1;
  }
  const hand = position.hand(color);
  point +=
    hand.count(PieceType.PAWN) +
    hand.count(PieceType.LANCE) +
    hand.count(PieceType.KNIGHT) +
    hand.count(PieceType.SILVER) +
    hand.count(PieceType.GOLD) +
    hand.count(PieceType.BISHOP) * 5 +
    hand.count(PieceType.ROOK) * 5;
  if (color === Color.WHITE) {
    // 駒落ちの場合は上手に落とした駒を加点する。
    const notExisting = countNotExistingPieces(position);
    point +=
      notExisting.pawn +
      notExisting.lance +
      notExisting.knight +
      notExisting.silver +
      notExisting.gold +
      notExisting.bishop * 5 +
      notExisting.rook * 5;
  }
  return point;
}

/**
 * 入玉宣言法に基づいて宣言した場合の結果を判定します。
 * @param rule
 * @param position
 * @param color 宣言するプレイヤー
 */
export function judgeJishogiDeclaration(
  rule: JishogiDeclarationRule,
  position: ImmutablePosition,
  color: Color,
): JishogiDeclarationResult {
  // 自分の手番か。
  if (position.color !== color) {
    return JishogiDeclarationResult.LOSE;
  }

  // 玉が敵陣に入っているか。
  const king = position.board.findKing(color);
  if (!king || !isPromotableRank(color, king.rank)) {
    return JishogiDeclarationResult.LOSE;
  }

  // 王手されていないか。
  if (position.board.isChecked(color)) {
    return JishogiDeclarationResult.LOSE;
  }

  // 敵陣に 10 枚以上駒が侵入しているか。
  if (invadingPieces(position.board, color).length < 10) {
    return JishogiDeclarationResult.LOSE;
  }

  // 点数を計算する。
  const point = countJishogiDeclarationPoint(position, color);

  // 24 点法
  if (rule === JishogiDeclarationRule.GENERAL24) {
    return point >= 31
      ? JishogiDeclarationResult.WIN
      : point >= 24
        ? JishogiDeclarationResult.DRAW
        : JishogiDeclarationResult.LOSE;
  }

  // 27 点法
  if (color === Color.BLACK) {
    // 先手は 28 点以上で勝ち
    return point >= 28 ? JishogiDeclarationResult.WIN : JishogiDeclarationResult.DRAW;
  } else {
    // 後手は 27 点以上で勝ち
    return point >= 27 ? JishogiDeclarationResult.WIN : JishogiDeclarationResult.DRAW;
  }
}
