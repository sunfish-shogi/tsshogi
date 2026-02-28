import { Piece, PieceType, pieceTypeToSFEN } from "./piece";
import { Color } from "./color";

/**
 * 持ち駒(読み取り専用)
 */
export interface ImmutableHand {
  /**
   * 持ち駒の枚数を取得します。
   * @param pieceType
   */
  count(pieceType: PieceType): number;
  /**
   * 駒の種類ごとにハンドラーを呼び出します。
   * @param handler
   */
  forEach(handler: (pieceType: PieceType, n: number) => void): void;
  /**
   * 持ち駒の種類と枚数の一覧を取得します。
   */
  readonly counts: { type: PieceType; count: number }[];
  /**
   * 先手の持ち駒に対してSFEN形式の文字列を取得します。
   */
  readonly sfenBlack: string;
  /**
   * 後手の持ち駒に対してSFEN形式の文字列を取得します。
   */
  readonly sfenWhite: string;
  /**
   * SFEN形式の文字列を取得します。
   * @param color
   */
  formatSFEN(color: Color): string;
}

// 持ち駒の SFEN 文字 (PieceType インデックス順, 後手は toLowerCase)
// PieceType.PAWN=0 .. PieceType.ROOK=6
// handPieceTypes の SFEN 出力順: R, B, G, S, N, L, P (降順)
const HAND_ORDER: PieceType[] = [
  PieceType.ROOK,
  PieceType.BISHOP,
  PieceType.GOLD,
  PieceType.SILVER,
  PieceType.KNIGHT,
  PieceType.LANCE,
  PieceType.PAWN,
];

/**
 * 持ち駒
 */
export class Hand {
  // Int32Array でインデックスアクセス: index = PieceType (0=PAWN .. 6=ROOK)
  private pieces: Int32Array;

  constructor() {
    this.pieces = new Int32Array(7);
  }

  /**
   * 持ち駒の種類と枚数の一覧を取得します。
   */
  get counts(): { type: PieceType; count: number }[] {
    return [
      { type: PieceType.ROOK, count: this.count(PieceType.ROOK) },
      { type: PieceType.BISHOP, count: this.count(PieceType.BISHOP) },
      { type: PieceType.GOLD, count: this.count(PieceType.GOLD) },
      { type: PieceType.SILVER, count: this.count(PieceType.SILVER) },
      { type: PieceType.KNIGHT, count: this.count(PieceType.KNIGHT) },
      { type: PieceType.LANCE, count: this.count(PieceType.LANCE) },
      { type: PieceType.PAWN, count: this.count(PieceType.PAWN) },
    ];
  }

  /**
   * 持ち駒の枚数を取得します。
   * @param pieceType
   */
  count(pieceType: PieceType): number {
    return Math.max(this.pieces[pieceType], 0);
  }

  /**
   * 持ち駒の枚数を設定します。
   * @param pieceType
   * @param count
   */
  set(pieceType: PieceType, count: number): void {
    this.pieces[pieceType] = count;
  }

  /**
   * 持ち駒を追加します。
   * @param pieceType
   * @param n
   */
  add(pieceType: PieceType, n: number): number {
    return (this.pieces[pieceType] += n);
  }

  /**
   * 持ち駒を減らします。
   * @param pieceType
   * @param n
   */
  reduce(pieceType: PieceType, n: number): number {
    return (this.pieces[pieceType] -= n);
  }

  /**
   * 駒の種類ごとにハンドラーを呼び出します。
   * @param handler
   */
  forEach(handler: (pieceType: PieceType, n: number) => void): void {
    handler(PieceType.PAWN, this.pieces[PieceType.PAWN]);
    handler(PieceType.LANCE, this.pieces[PieceType.LANCE]);
    handler(PieceType.KNIGHT, this.pieces[PieceType.KNIGHT]);
    handler(PieceType.SILVER, this.pieces[PieceType.SILVER]);
    handler(PieceType.GOLD, this.pieces[PieceType.GOLD]);
    handler(PieceType.BISHOP, this.pieces[PieceType.BISHOP]);
    handler(PieceType.ROOK, this.pieces[PieceType.ROOK]);
  }

  /**
   * 先手の持ち駒に対してSFEN形式の文字列を取得します。
   */
  get sfenBlack(): string {
    return this.formatSFEN(Color.BLACK);
  }

  /**
   * 後手の持ち駒に対してSFEN形式の文字列を取得します。
   */
  get sfenWhite(): string {
    return this.formatSFEN(Color.WHITE);
  }

  /**
   * SFEN形式の文字列を取得します。
   * @param color
   */
  formatSFEN(color: Color): string {
    const isBlack = color === Color.BLACK;
    let ret = "";
    for (const type of HAND_ORDER) {
      const n = this.pieces[type];
      if (n > 0) {
        const ch = pieceTypeToSFEN(type);
        ret += (n !== 1 ? n : "") + (isBlack ? ch : ch.toLowerCase());
      }
    }
    return ret || "-";
  }

  /**
   * SFEN形式の文字列を取得します。
   * @param black
   * @param white
   */
  static formatSFEN(black: Hand, white: Hand): string {
    const b = black.sfenBlack;
    const w = white.sfenWhite;
    if (b === "-" && w === "-") {
      return "-";
    }
    if (w === "-") {
      return b;
    }
    if (b === "-") {
      return w;
    }
    return b + w;
  }

  /**
   * 指定した文字列が正しい持ち駒のSFENであるかどうかを判定します。
   * @param sfen
   */
  static isValidSFEN(sfen: string): boolean {
    if (sfen === "-") {
      return true;
    }
    return /^(?:[0-9]{0,2}[PLNSGBRplnsgbr])+$/.test(sfen);
  }

  /**
   * 持ち駒のSFENを解析します。
   * @param sfen
   */
  static parseSFEN(sfen: string): { black: Hand; white: Hand } | null {
    if (sfen === "-") {
      return { black: new Hand(), white: new Hand() };
    }
    const sections = sfen.match(/([0-9]{0,2}[PLNSGBRplnsgbr])/g) as RegExpMatchArray;
    if (!sections) {
      return null;
    }
    const black = new Hand();
    const white = new Hand();
    for (let i = 0; i < sections.length; i += 1) {
      const section = sections[i];
      let n = 1;
      if (section.length >= 2) {
        n = Number(section.substring(0, section.length - 1));
      }
      const piece = Piece.newBySFEN(section[section.length - 1]) as Piece;
      if (piece.color === Color.BLACK) {
        black.add(piece.type, n);
      } else {
        white.add(piece.type, n);
      }
    }
    return { black, white };
  }

  /**
   * 別のオブジェクトからコピーします。
   * @param hand
   */
  copyFrom(hand: Hand): void {
    this.pieces.set(hand.pieces); // Int32Array.set = memcpy
  }
}
