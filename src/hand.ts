import { Piece, PieceType } from "./piece";
import { Color } from "./color";

function buildSFEN(n: number, piece: Piece): string {
  if (n === 0) {
    return "";
  }
  return (n !== 1 ? n : "") + piece.sfen;
}

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

/**
 * 持ち駒
 */
export class Hand {
  private pieces: Map<PieceType, number>;

  constructor() {
    this.pieces = new Map<PieceType, number>();
    this.pieces.set(PieceType.PAWN, 0);
    this.pieces.set(PieceType.LANCE, 0);
    this.pieces.set(PieceType.KNIGHT, 0);
    this.pieces.set(PieceType.SILVER, 0);
    this.pieces.set(PieceType.GOLD, 0);
    this.pieces.set(PieceType.BISHOP, 0);
    this.pieces.set(PieceType.ROOK, 0);
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
    return Math.max(this.pieces.get(pieceType) as number, 0);
  }

  /**
   * 持ち駒の枚数を設定します。
   * @param pieceType
   * @param count
   */
  set(pieceType: PieceType, count: number): void {
    this.pieces.set(pieceType, count);
  }

  /**
   * 持ち駒を追加します。
   * @param pieceType
   * @param n
   */
  add(pieceType: PieceType, n: number): number {
    let c = this.pieces.get(pieceType) as number;
    c += n;
    this.pieces.set(pieceType, c);
    return c;
  }

  /**
   * 持ち駒を減らします。
   * @param pieceType
   * @param n
   */
  reduce(pieceType: PieceType, n: number): number {
    let c = this.pieces.get(pieceType) as number;
    c -= n;
    this.pieces.set(pieceType, c);
    return c;
  }

  /**
   * 駒の種類ごとにハンドラーを呼び出します。
   * @param handler
   */
  forEach(handler: (pieceType: PieceType, n: number) => void): void {
    handler(PieceType.PAWN, this.pieces.get(PieceType.PAWN) as number);
    handler(PieceType.LANCE, this.pieces.get(PieceType.LANCE) as number);
    handler(PieceType.KNIGHT, this.pieces.get(PieceType.KNIGHT) as number);
    handler(PieceType.SILVER, this.pieces.get(PieceType.SILVER) as number);
    handler(PieceType.GOLD, this.pieces.get(PieceType.GOLD) as number);
    handler(PieceType.BISHOP, this.pieces.get(PieceType.BISHOP) as number);
    handler(PieceType.ROOK, this.pieces.get(PieceType.ROOK) as number);
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
    let ret = "";
    ret += buildSFEN(this.count(PieceType.ROOK) as number, new Piece(color, PieceType.ROOK));
    ret += buildSFEN(this.count(PieceType.BISHOP) as number, new Piece(color, PieceType.BISHOP));
    ret += buildSFEN(this.count(PieceType.GOLD) as number, new Piece(color, PieceType.GOLD));
    ret += buildSFEN(this.count(PieceType.SILVER) as number, new Piece(color, PieceType.SILVER));
    ret += buildSFEN(this.count(PieceType.KNIGHT) as number, new Piece(color, PieceType.KNIGHT));
    ret += buildSFEN(this.count(PieceType.LANCE) as number, new Piece(color, PieceType.LANCE));
    ret += buildSFEN(this.count(PieceType.PAWN) as number, new Piece(color, PieceType.PAWN));
    if (ret === "") {
      return "-";
    }
    return ret;
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
    hand.pieces.forEach((n, pieceType) => {
      this.pieces.set(pieceType, n);
    });
  }
}
