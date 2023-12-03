import { Color } from "./color";
import {
  HDirection,
  VDirection,
  directionToHDirection,
  directionToVDirection,
  reverseDirection,
} from "./direction";
import { InvalidMoveError } from "./errors";
import { Move, SpecialMove, SpecialMoveType, isKnownSpecialMove } from "./move";
import { PieceType, Piece, isPromotable } from "./piece";
import { ImmutablePosition, isPromotableRank } from "./position";
import { Square } from "./square";

const stringToNumberMap: { [s: string]: number } = {
  "1": 1,
  "2": 2,
  "3": 3,
  "4": 4,
  "5": 5,
  "6": 6,
  "7": 7,
  "8": 8,
  "9": 9,
  "１": 1,
  "２": 2,
  "３": 3,
  "４": 4,
  "５": 5,
  "６": 6,
  "７": 7,
  "８": 8,
  "９": 9,
  一: 1,
  二: 2,
  三: 3,
  四: 4,
  五: 5,
  六: 6,
  七: 7,
  八: 8,
  九: 9,
  十: 10,
  十一: 11,
  十二: 12,
  十三: 13,
  十四: 14,
  十五: 15,
  十六: 16,
  十七: 17,
  十八: 18,
};

const stringToPieceTypeMap: { [kanji: string]: PieceType } = {
  王: PieceType.KING,
  玉: PieceType.KING,
  飛: PieceType.ROOK,
  龍: PieceType.DRAGON,
  竜: PieceType.DRAGON,
  角: PieceType.BISHOP,
  馬: PieceType.HORSE,
  金: PieceType.GOLD,
  銀: PieceType.SILVER,
  成銀: PieceType.PROM_SILVER,
  全: PieceType.PROM_SILVER,
  桂: PieceType.KNIGHT,
  成桂: PieceType.PROM_KNIGHT,
  圭: PieceType.PROM_KNIGHT,
  香: PieceType.LANCE,
  成香: PieceType.PROM_LANCE,
  杏: PieceType.PROM_LANCE,
  歩: PieceType.PAWN,
  と: PieceType.PROM_PAWN,
};

export function stringToNumber(s: string): number {
  return stringToNumberMap[s];
}

export function stringToPieceType(piece: string): PieceType {
  return stringToPieceTypeMap[piece];
}

const kanjiNumberStrings = [
  "一",
  "二",
  "三",
  "四",
  "五",
  "六",
  "七",
  "八",
  "九",
  "十",
  "十一",
  "十二",
  "十三",
  "十四",
  "十五",
  "十六",
  "十七",
  "十八",
];
const fileStrings = ["１", "２", "３", "４", "５", "６", "７", "８", "９"];

export function numberToKanji(n: number): string {
  return kanjiNumberStrings[n - 1];
}

export function fileToMultiByteChar(file: number): string {
  return fileStrings[file - 1];
}

export function rankToKanji(rank: number): string {
  return kanjiNumberStrings[rank - 1];
}

const pieceTypeToStringForMoveMap = {
  king: "玉",
  rook: "飛",
  dragon: "龍",
  bishop: "角",
  horse: "馬",
  gold: "金",
  silver: "銀",
  promSilver: "成銀",
  knight: "桂",
  promKnight: "成桂",
  lance: "香",
  promLance: "成香",
  pawn: "歩",
  promPawn: "と",
};

export function pieceTypeToStringForMove(pieceType: PieceType): string {
  return pieceTypeToStringForMoveMap[pieceType];
}

const pieceTypeToStringForBoardMap = {
  king: "玉",
  rook: "飛",
  dragon: "龍",
  bishop: "角",
  horse: "馬",
  gold: "金",
  silver: "銀",
  promSilver: "全",
  knight: "桂",
  promKnight: "圭",
  lance: "香",
  promLance: "杏",
  pawn: "歩",
  promPawn: "と",
};

export function pieceTypeToStringForBoard(pieceType: PieceType): string {
  return pieceTypeToStringForBoardMap[pieceType];
}

const specialMoveToDisplayStringMap = {
  [SpecialMoveType.START]: "開始局面",
  [SpecialMoveType.RESIGN]: "投了",
  [SpecialMoveType.INTERRUPT]: "中断",
  [SpecialMoveType.IMPASS]: "持将棋",
  [SpecialMoveType.DRAW]: "引き分け",
  [SpecialMoveType.REPETITION_DRAW]: "千日手",
  [SpecialMoveType.MATE]: "詰み",
  [SpecialMoveType.NO_MATE]: "不詰",
  [SpecialMoveType.TIMEOUT]: "切れ負け",
  [SpecialMoveType.FOUL_WIN]: "反則勝ち",
  [SpecialMoveType.FOUL_LOSE]: "反則負け",
  [SpecialMoveType.ENTERING_OF_KING]: "入玉",
  [SpecialMoveType.WIN_BY_DEFAULT]: "不戦勝",
  [SpecialMoveType.LOSE_BY_DEFAULT]: "不戦敗",
};

/**
 * 特殊な指し手の表示用の文字列を返します。
 * @param move
 */
export function formatSpecialMove(move: SpecialMove | SpecialMoveType): string {
  if (typeof move === "string") {
    return specialMoveToDisplayStringMap[move];
  }
  if (isKnownSpecialMove(move)) {
    return specialMoveToDisplayStringMap[move.type];
  }
  return move.name;
}

/**
 * 「上」や「引」など指し手の移動方向を修飾する文字列を返します。
 * @param move
 * @param position
 */
export function getDirectionModifier(move: Move, position: ImmutablePosition): string {
  const piece = new Piece(move.color, move.pieceType);

  // 同じマス目へ移動可能な同種の駒を列挙
  const others = position.listAttackersByPiece(move.to, piece).filter((square) => {
    return !(move.from instanceof Square) || !square.equals(move.from);
  });

  // 移動可能な同じ駒がある場合に移動元を区別する文字を付ける。
  if (move.from instanceof Square) {
    let ret = "";
    // この指し手の移動方向
    let myDir = move.from.directionTo(move.to);
    myDir = move.color === Color.BLACK ? myDir : reverseDirection(myDir);
    const myVDir = directionToVDirection(myDir);
    const myHDir = directionToHDirection(myDir);
    // 他の駒の移動方向
    const otherDirs = others.map((square) => {
      const dir = square.directionTo(move.to);
      return move.color === Color.BLACK ? dir : reverseDirection(dir);
    });
    // 水平方向がこの指し手と同じものを列挙して、その垂直方向を保持する。
    const vDirections = otherDirs
      .filter((dir) => directionToHDirection(dir) == myHDir)
      .map((dir) => directionToVDirection(dir));
    // 垂直方向がこの指し手と同じものを列挙して、その水平方向を保持する。
    const hDirections = otherDirs
      .filter((dir) => directionToVDirection(dir) == myVDir)
      .map((dir) => directionToHDirection(dir));
    // 水平方向で区別すべき駒がある場合
    let noVertical = false;
    if (hDirections.length) {
      if (move.pieceType === PieceType.HORSE || move.pieceType === PieceType.DRAGON) {
        // 竜や馬の場合は2枚しかないので「直」は使わない。
        if (
          myHDir === HDirection.LEFT ||
          (myHDir === HDirection.NONE && hDirections[0] === HDirection.RIGHT)
        ) {
          ret += "右";
        } else if (
          myHDir === HDirection.RIGHT ||
          (myHDir === HDirection.NONE && hDirections[0] === HDirection.LEFT)
        ) {
          ret += "左";
        }
      } else {
        switch (myHDir) {
          case HDirection.LEFT:
            ret += "右";
            break;
          case HDirection.NONE:
            ret += "直";
            // 後ろへ3方向移動できてなおかつ3枚以上ある駒は存在しないため「直」と垂直方向の区別は同時に使用しない。
            noVertical = true;
            break;
          case HDirection.RIGHT:
            ret += "左";
            break;
        }
      }
    }
    // 垂直方向で区別すべき駒がある場合
    if (!noVertical && (vDirections.length || (!hDirections.length && others.length))) {
      switch (myVDir) {
        case VDirection.DOWN:
          ret += "引";
          break;
        case VDirection.NONE:
          ret += "寄";
          break;
        case VDirection.UP:
          ret += "上";
          break;
      }
    }
    return ret;
  } else if (others.length) {
    // 盤上に移動可能な同じ駒がある場合は、駒台から打つことを明示する。
    return "打";
  }
  return "";
}

/**
 * 指し手を表す文字列を返します。
 * @param position 指し手の直前の局面
 * @param move 対象の指し手
 */
export function formatMove(
  position: ImmutablePosition,
  move: Move,
  opt?: {
    lastMove?: Move; // 直前の指し手を指定します。移動先が同じ場合に "同" を使った表記を使用します。
    compatible?: boolean; // Shift_JIS で文字化けしない記号を使用します。 true の場合 KI2 形式と同等です。
  },
): string {
  let ret = "";

  // 手番を表す記号を付与する。
  switch (move.color) {
    case Color.BLACK:
      ret += opt?.compatible ? "▲" : "☗";
      break;
    case Color.WHITE:
      ret += opt?.compatible ? "△" : "☖";
      break;
  }

  // 移動先の筋・段を付与する。
  if (opt?.lastMove && opt.lastMove.to.equals(move.to)) {
    ret += "同　";
  } else {
    ret += fileToMultiByteChar(move.to.file);
    ret += rankToKanji(move.to.rank);
  }
  ret += pieceTypeToStringForMove(move.pieceType);
  ret += getDirectionModifier(move, position);

  if (move.from instanceof Square) {
    // 「成」または「不成」を付ける。
    if (move.promote) {
      ret += "成";
    } else if (
      move.from instanceof Square &&
      isPromotable(move.pieceType) &&
      (isPromotableRank(move.color, move.from.rank) || isPromotableRank(move.color, move.to.rank))
    ) {
      ret += "不成";
    }
  }
  return ret;
}

export function formatPV(position: ImmutablePosition, pv: Move[]): string {
  let ret = "";
  let lastMove: Move | undefined;
  const p = position.clone();
  for (const move of pv) {
    ret += `${formatMove(p, move, {
      lastMove,
      compatible: true,
    })}`;
    p.doMove(move, { ignoreValidation: true });
    lastMove = move;
  }
  return ret;
}

const moveRegExp =
  /^[▲△▼▽☗☖]?([１２３４５６７８９一二三四五六七八九1-9]{2}|同)(王|玉|飛|龍|竜|角|馬|金|銀|成銀|全|桂|成桂|圭|香|成香|杏|歩|と)(左|直|右|)(引|寄|上|)(成|不成|打|)(\([1-9][1-9]\)|)/;

export function parsePV(position: ImmutablePosition, text: string): Move[] {
  return parseMoves(position, text)[0];
}

/**
 * テキストから指し手を読み込みます。 KI2 と互換性があります。
 * @param position 指し手の直前の局面
 * @param text 対象の文字列
 * @param lastMove 直前の指し手（1 手目が "同" を使った表記の場合に使用する。）
 */
export function parseMoves(
  position: ImmutablePosition,
  text: string,
  lastMove?: Move,
): [Move[], Error | undefined] {
  const clean = text.replaceAll(/[\s\u3000]/g, "");

  // 1手ずつ分割する。
  const sections = [];
  let lastIndex = 0;
  for (let i = 1; i <= clean.length; i++) {
    const char = clean[i];
    if (
      !char ||
      char === "▲" ||
      char === "△" ||
      char === "▼" ||
      char === "▽" ||
      char === "☗" ||
      char === "☖"
    ) {
      sections.push(clean.substring(lastIndex, i));
      lastIndex = i;
    }
  }

  // 指し手を読み込む。
  const p = position.clone();
  const pv: Move[] = [];
  for (const section of sections) {
    const result = moveRegExp.exec(section);
    if (!result) {
      return [pv, new InvalidMoveError(section)];
    }
    const toStr = result[1];
    const pieceType = stringToPieceType(result[2]);
    const horStr = result[3];
    const verStr = result[4];
    const promOrDropStr = result[5];
    const fromStr = result[6]; // 古い表記の場合のみ

    let to: Square;
    if (toStr.startsWith("同")) {
      if (pv.length > 0) {
        to = pv[pv.length - 1].to;
      } else if (lastMove) {
        to = lastMove.to;
      } else {
        return [pv, new InvalidMoveError(section)];
      }
    } else {
      const file = stringToNumber(toStr[0]);
      const rank = stringToNumber(toStr[1]);
      to = new Square(file, rank);
    }
    let from: Square | PieceType;
    if (promOrDropStr === "打") {
      from = pieceType;
    } else if (fromStr) {
      const file = stringToNumber(fromStr[1]);
      const rank = stringToNumber(fromStr[2]);
      from = new Square(file, rank);
    } else {
      let squares = p.listAttackersByPiece(to, new Piece(p.color, pieceType)).filter((square) => {
        let dir = square.directionTo(to);
        dir = p.color === Color.BLACK ? dir : reverseDirection(dir);
        const vDir = directionToVDirection(dir);
        const hDir = directionToHDirection(dir);
        if (verStr.indexOf("引") >= 0 && vDir !== VDirection.DOWN) {
          return false;
        }
        if (verStr.indexOf("寄") >= 0 && vDir !== VDirection.NONE) {
          return false;
        }
        if ((verStr.indexOf("上") >= 0 || verStr.indexOf("行") >= 0) && vDir !== VDirection.UP) {
          return false;
        }
        if (horStr.indexOf("直") >= 0 && (hDir !== HDirection.NONE || vDir !== VDirection.UP)) {
          return false;
        }
        if (pieceType === PieceType.HORSE || pieceType === PieceType.DRAGON) {
          // 馬や龍の場合は "左" や "右" でも真っ直ぐ進む場合があるので明らかに違うものだけを除外する。
          if (horStr.indexOf("左") >= 0 && hDir === HDirection.LEFT) {
            return false;
          }
          if (horStr.indexOf("右") >= 0 && hDir === HDirection.RIGHT) {
            return false;
          }
        } else {
          if (horStr.indexOf("左") >= 0 && hDir !== HDirection.RIGHT) {
            return false;
          }
          if (horStr.indexOf("右") >= 0 && hDir !== HDirection.LEFT) {
            return false;
          }
        }
        return true;
      });
      if (
        squares.length === 2 &&
        (pieceType === PieceType.HORSE || pieceType === PieceType.DRAGON)
      ) {
        // 馬や龍で "左" や "右" が使われ、 1 つに絞れなかった場合は真っ直ぐ進むものを除外する。
        squares = squares.filter((square) => {
          let dir = square.directionTo(to);
          dir = p.color === Color.BLACK ? dir : reverseDirection(dir);
          const hDir = directionToHDirection(dir);
          return hDir !== HDirection.NONE;
        });
      }
      if (squares.length === 1) {
        from = squares[0];
      } else if (squares.length === 0 && p.hand(p.color).count(pieceType) !== 0) {
        from = pieceType;
      } else {
        return [pv, new InvalidMoveError(section)];
      }
    }
    let move = p.createMove(from, to);
    if (!move) {
      return [pv, new InvalidMoveError(section)];
    }
    if (promOrDropStr === "成") {
      move = move.withPromote();
    }
    if (!p.doMove(move, { ignoreValidation: true })) {
      return [pv, new InvalidMoveError(section)];
    }
    pv.push(move);
  }
  return [pv, undefined];
}
