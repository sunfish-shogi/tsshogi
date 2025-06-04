// KIF file format (.kif or .kifu)
// See http://kakinoki.o.oo7.jp/kif_format.html

import { appendLine } from "./helpers/string";
import { millisecondsToHHMMSS, millisecondsToMSS } from "./helpers/time";
import { Board } from "./board";
import { Color } from "./color";
import {
  InvalidBoardError,
  InvalidDestinationError,
  InvalidHandPieceError,
  InvalidLineError,
  InvalidMoveError,
  InvalidMoveNumberError,
} from "./errors";
import { Hand, ImmutableHand } from "./hand";
import {
  Move,
  SpecialMove,
  SpecialMoveType,
  anySpecialMove,
  isKnownSpecialMove,
  specialMove,
} from "./move";
import { Piece, PieceType } from "./piece";
import { ImmutablePosition, InitialPositionSFEN, Position } from "./position";
import {
  ImmutableRecord,
  ImmutableRecordMetadata,
  Record,
  RecordMetadata,
  RecordMetadataKey,
} from "./record";
import { Square } from "./square";
import {
  fileToMultiByteChar,
  formatMove,
  numberToKanji,
  parseMoves,
  pieceTypeToStringForBoard,
  pieceTypeToStringForMove,
  rankToKanji,
  stringToNumber,
  stringToPieceType,
} from "./text";

export enum KakinokiFormatType {
  KIF = "KIF",
  KI2 = "KI2",
}

const metadataKeyMap: { [key: string]: RecordMetadataKey | undefined } = {
  先手: RecordMetadataKey.BLACK_NAME,
  後手: RecordMetadataKey.WHITE_NAME,
  下手: RecordMetadataKey.SHITATE_NAME,
  上手: RecordMetadataKey.UWATE_NAME,
  開始日時: RecordMetadataKey.START_DATETIME,
  終了日時: RecordMetadataKey.END_DATETIME,
  対局日: RecordMetadataKey.DATE,
  棋戦: RecordMetadataKey.TOURNAMENT,
  戦型: RecordMetadataKey.STRATEGY,
  表題: RecordMetadataKey.TITLE,
  持ち時間: RecordMetadataKey.TIME_LIMIT,
  秒読み: RecordMetadataKey.BYOYOMI,
  消費時間: RecordMetadataKey.TIME_SPENT,
  場所: RecordMetadataKey.PLACE,
  掲載: RecordMetadataKey.POSTED_ON,
  備考: RecordMetadataKey.NOTE,
  先手省略名: RecordMetadataKey.BLACK_SHORT_NAME,
  後手省略名: RecordMetadataKey.WHITE_SHORT_NAME,
  記録係: RecordMetadataKey.SCOREKEEPER,
  作品番号: RecordMetadataKey.OPUS_NO,
  作品名: RecordMetadataKey.OPUS_NAME,
  作者: RecordMetadataKey.AUTHOR,
  発表誌: RecordMetadataKey.PUBLISHED_BY,
  発表年月: RecordMetadataKey.PUBLISHED_AT,
  出典: RecordMetadataKey.SOURCE,
  手数: RecordMetadataKey.LENGTH,
  完全性: RecordMetadataKey.INTEGRITY,
  分類: RecordMetadataKey.CATEGORY,
  受賞: RecordMetadataKey.AWARD,

  // CSA 形式で規定されている項目
  先手持ち時間: RecordMetadataKey.BLACK_TIME_LIMIT,
  後手持ち時間: RecordMetadataKey.WHITE_TIME_LIMIT,
  最大手数: RecordMetadataKey.MAX_MOVES,
  持将棋: RecordMetadataKey.JISHOGI,
};

/**
 * 柿木形式のメタデータのキー名を RecordMetadataKey へ変換します。
 * @param key
 */
export function kakinokiToMetadataKey(key: string): RecordMetadataKey | undefined {
  return metadataKeyMap[key];
}

const metadataNameMap: {
  [recordMetadataKey in RecordMetadataKey]: string;
} = {
  [RecordMetadataKey.BLACK_NAME]: "先手",
  [RecordMetadataKey.WHITE_NAME]: "後手",
  [RecordMetadataKey.SHITATE_NAME]: "下手",
  [RecordMetadataKey.UWATE_NAME]: "上手",
  [RecordMetadataKey.START_DATETIME]: "開始日時",
  [RecordMetadataKey.END_DATETIME]: "終了日時",
  [RecordMetadataKey.DATE]: "対局日",
  [RecordMetadataKey.TOURNAMENT]: "棋戦",
  [RecordMetadataKey.STRATEGY]: "戦型",
  [RecordMetadataKey.TITLE]: "表題",
  [RecordMetadataKey.TIME_LIMIT]: "持ち時間",
  [RecordMetadataKey.BYOYOMI]: "秒読み",
  [RecordMetadataKey.TIME_SPENT]: "消費時間",
  [RecordMetadataKey.PLACE]: "場所",
  [RecordMetadataKey.POSTED_ON]: "掲載",
  [RecordMetadataKey.NOTE]: "備考",
  [RecordMetadataKey.BLACK_SHORT_NAME]: "先手省略名",
  [RecordMetadataKey.WHITE_SHORT_NAME]: "後手省略名",
  [RecordMetadataKey.SCOREKEEPER]: "記録係",
  [RecordMetadataKey.OPUS_NO]: "作品番号",
  [RecordMetadataKey.OPUS_NAME]: "作品名",
  [RecordMetadataKey.AUTHOR]: "作者",
  [RecordMetadataKey.PUBLISHED_BY]: "発表誌",
  [RecordMetadataKey.PUBLISHED_AT]: "発表年月",
  [RecordMetadataKey.SOURCE]: "出典",
  [RecordMetadataKey.LENGTH]: "手数",
  [RecordMetadataKey.INTEGRITY]: "完全性",
  [RecordMetadataKey.CATEGORY]: "分類",
  [RecordMetadataKey.AWARD]: "受賞",

  // CSA 形式で規定されている項目
  [RecordMetadataKey.BLACK_TIME_LIMIT]: "先手持ち時間",
  [RecordMetadataKey.WHITE_TIME_LIMIT]: "後手持ち時間",
  [RecordMetadataKey.MAX_MOVES]: "最大手数",
  [RecordMetadataKey.JISHOGI]: "持将棋",
};

/**
 * RecordMetadataKey を柿木形式のメタデータのキー名へ変換します。
 * @param key
 */
export function metadataKeyToKakinoki(key: RecordMetadataKey): string {
  return metadataNameMap[key];
}

enum LineType {
  PROGRAM_COMMENT,
  METADATA,
  HANDICAP,
  BLACK_HAND,
  WHITE_HAND,
  BOARD,
  BLACK_TURN,
  WHITE_TURN,
  MOVE,
  MOVE2,
  BRANCH,
  COMMENT,
  BOOKMARK,
  END_OF_GAME,
  UNKNOWN,
}

const linePatterns: {
  prefix: RegExp;
  type: LineType;
  removePrefix: boolean;
  isPosition: boolean;
}[] = [
  {
    prefix: /^#/,
    type: LineType.PROGRAM_COMMENT,
    removePrefix: false,
    isPosition: false,
  },
  {
    prefix: /^手合割[：:]/,
    type: LineType.HANDICAP,
    removePrefix: true,
    isPosition: true,
  },
  {
    prefix: /^(先|下)手の持駒[：:]/,
    type: LineType.BLACK_HAND,
    removePrefix: true,
    isPosition: true,
  },
  {
    prefix: /^(後|上)手の持駒[：:]/,
    type: LineType.WHITE_HAND,
    removePrefix: true,
    isPosition: true,
  },
  {
    prefix: /^\|/,
    type: LineType.BOARD,
    removePrefix: false,
    isPosition: true,
  },
  {
    prefix: /^(先|下)手番/,
    type: LineType.BLACK_TURN,
    removePrefix: false,
    isPosition: true,
  },
  {
    prefix: /^(後|上)手番/,
    type: LineType.WHITE_TURN,
    removePrefix: false,
    isPosition: true,
  },
  {
    prefix: /^ *[0-9]+ +/,
    type: LineType.MOVE,
    removePrefix: false,
    isPosition: false,
  },
  {
    prefix: /^[ \u3000]*[▲△▼▽☗☖]/,
    type: LineType.MOVE2,
    removePrefix: false,
    isPosition: false,
  },
  {
    prefix: /^[ \u3000]*変化[：:][ \u3000]*/,
    type: LineType.BRANCH,
    removePrefix: true,
    isPosition: false,
  },
  {
    prefix: /^\*/,
    type: LineType.COMMENT,
    removePrefix: true,
    isPosition: false,
  },
  {
    prefix: /^&/,
    type: LineType.BOOKMARK,
    removePrefix: true,
    isPosition: false,
  },
  {
    prefix: /^まで、?([0-9]+手で)?/,
    type: LineType.END_OF_GAME,
    removePrefix: true,
    isPosition: false,
  },
];

type Line = {
  type: LineType;
  data: string;
  isPosition: boolean;
  metadataKey: string;
};

function parseLine(line: string): Line {
  for (let i = 0; i < linePatterns.length; i++) {
    const pattern = linePatterns[i];
    const matched = line.match(pattern.prefix);
    if (matched) {
      const begin = pattern.removePrefix ? matched[0].length : 0;
      return {
        type: pattern.type,
        data: line.substring(begin),
        isPosition: pattern.isPosition,
        metadataKey: "",
      };
    }
  }
  const metadataPrefix = line.match(/^[^ ：:]+[：:]/);
  if (metadataPrefix) {
    const prefix = metadataPrefix[0];
    return {
      type: LineType.METADATA,
      data: line.substring(prefix.length),
      isPosition: false,
      metadataKey: prefix.substring(0, prefix.length - 1),
    };
  }
  return {
    type: LineType.UNKNOWN,
    data: line,
    isPosition: false,
    metadataKey: "",
  };
}

function readHandicap(position: Position, data: string) {
  switch (data.trim()) {
    case "平手":
      position.resetBySFEN(InitialPositionSFEN.STANDARD);
      return;
    case "香落ち":
      position.resetBySFEN(InitialPositionSFEN.HANDICAP_LANCE);
      return;
    case "右香落ち":
      position.resetBySFEN(InitialPositionSFEN.HANDICAP_RIGHT_LANCE);
      return;
    case "角落ち":
      position.resetBySFEN(InitialPositionSFEN.HANDICAP_BISHOP);
      return;
    case "飛車落ち":
      position.resetBySFEN(InitialPositionSFEN.HANDICAP_ROOK);
      return;
    case "飛香落ち":
      position.resetBySFEN(InitialPositionSFEN.HANDICAP_ROOK_LANCE);
      return;
    case "二枚落ち":
      position.resetBySFEN(InitialPositionSFEN.HANDICAP_2PIECES);
      return;
    case "四枚落ち":
      position.resetBySFEN(InitialPositionSFEN.HANDICAP_4PIECES);
      return;
    case "六枚落ち":
      position.resetBySFEN(InitialPositionSFEN.HANDICAP_6PIECES);
      return;
    case "八枚落ち":
      position.resetBySFEN(InitialPositionSFEN.HANDICAP_8PIECES);
      return;
    case "十枚落ち":
      position.resetBySFEN(InitialPositionSFEN.HANDICAP_10PIECES);
      return;
    case "その他":
      position.resetBySFEN(InitialPositionSFEN.EMPTY);
      return;
  }
  // マイナビ系のソフトウェアは「手合割：詰将棋」を使用する場合がある。
  // それを含め柿木将棋で規定していない値が使われるケースがしばしばあり、
  // それらに対して適切な処理を判断しようがなく、
  // エラーを返すわけにも行かないためここでは何もしない。
}

const stringToSpecialMoveType: { [move: string]: SpecialMoveType | undefined } = {
  中断: SpecialMoveType.INTERRUPT,
  投了: SpecialMoveType.RESIGN,
  持将棋: SpecialMoveType.IMPASS,
  千日手: SpecialMoveType.REPETITION_DRAW,
  詰み: SpecialMoveType.MATE,
  詰: SpecialMoveType.MATE,
  不詰: SpecialMoveType.NO_MATE,
  切れ負け: SpecialMoveType.TIMEOUT,
  反則勝ち: SpecialMoveType.FOUL_WIN,
  反則負け: SpecialMoveType.FOUL_LOSE,
  入玉勝ち: SpecialMoveType.ENTERING_OF_KING,
  不戦勝: SpecialMoveType.WIN_BY_DEFAULT,
  不戦敗: SpecialMoveType.LOSE_BY_DEFAULT,
};

const moveRegExp =
  /^ *([0-9]+) +[▲△▼▽]?([１２３４５６７８９][一二三四五六七八九]|同\u3000*)(王|玉|飛|龍|竜|角|馬|金|銀|成銀|全|桂|成桂|圭|香|成香|杏|歩|と)\u3000*(成?)(打|\([1-9][1-9]\)) *([^ ].*|$)/;

const timeRegExp = /\( *([0-9]+):([0-9]+)\/[0-9: ]*\)/;

const specialMoveRegExp = /^ *([0-9]+) +([^ \u3000]+) *([^ ].*|$)/;

const branchRegExp = /^ *([0-9]+)/;

function readBoard(board: Board, data: string): Error | undefined {
  if (data.length < 21) {
    return new InvalidBoardError(data);
  }
  const rankStr = data[20];
  const rank = stringToNumber(rankStr);
  if (!rank) {
    return new InvalidBoardError(data);
  }
  for (let x = 0; x < 9; x += 1) {
    const file = 9 - x;
    const square = new Square(file, rank);
    const index = x * 2 + 1;
    const pieceStr = data[index + 1];
    const pieceType = stringToPieceType(pieceStr);
    if (!pieceType) {
      board.remove(square);
      continue;
    }
    const color = data[index] !== "v" ? Color.BLACK : Color.WHITE;
    board.set(square, new Piece(color, pieceType));
  }
}

function readHand(hand: Hand, data: string): Error | undefined {
  // NOTE:
  //   スペースで区切られていないものでも Kifu for Windows や ShogiGUI は読み込める。
  //   See: https://github.com/sunfish-shogi/shogihome/issues/572
  const sections = data.split(/[ 　]/);
  for (const section of sections) {
    if (!section || section === "なし") {
      continue;
    }
    const pieceStr = section[0];
    const numberStr = section.substring(1);
    const pieceType = stringToPieceType(pieceStr);
    const n = stringToNumber(numberStr) || 1;
    if (!pieceType) {
      return new InvalidHandPieceError(section);
    }
    hand.add(pieceType, n);
  }
  return;
}

function readMoveTime(record: Record, data: string): void {
  const timeResult = timeRegExp.exec(data);
  if (timeResult) {
    const minutes = timeResult[1];
    const seconds = timeResult[2];
    const s = Number.parseInt(minutes) * 60 + Number.parseInt(seconds);
    record.current.setElapsedMs(s * 1e3);
  }
}

function readMove(record: Record, data: string): Error | undefined {
  const result = readRegularMove(record, data);
  if (result instanceof Error) {
    return result;
  } else if (result) {
    return;
  }

  if (readSpecialMove(record, data)) {
    return;
  }

  return new InvalidMoveError(data);
}

function readRegularMove(record: Record, data: string): Error | boolean {
  const result = moveRegExp.exec(data);
  if (!result) {
    return false;
  }
  const num = Number(result[1]);
  const toStr = result[2];
  const pieceTypeStr = result[3];
  const promStr = result[4];
  const fromStr = result[5];
  const time = result[6];

  if (num === 0) {
    return new InvalidMoveNumberError(data);
  }
  record.goto(num - 1);
  let to: Square;
  let from: Square | PieceType;
  if (toStr.startsWith("同")) {
    if (!(record.current.move instanceof Move)) {
      return new InvalidDestinationError(data);
    }
    to = record.current.move.to;
  } else {
    const file = stringToNumber(toStr[0]);
    const rank = stringToNumber(toStr[1]);
    to = new Square(file, rank);
  }
  if (fromStr === "打") {
    from = stringToPieceType(pieceTypeStr);
  } else {
    const file = stringToNumber(fromStr[1]);
    const rank = stringToNumber(fromStr[2]);
    from = new Square(file, rank);
  }
  let move = record.position.createMove(from, to);
  if (!move) {
    return new InvalidMoveError(data);
  }
  if (promStr === "成") {
    move = move.withPromote();
  }
  record.append(move, {
    ignoreValidation: true,
  });
  readMoveTime(record, time);
  return true;
}

function readSpecialMove(record: Record, data: string): boolean {
  const result = specialMoveRegExp.exec(data);
  if (!result) {
    return false;
  }
  const num = Number(result[1]);
  const type = stringToSpecialMoveType[result[2]];
  const time = result[3];
  record.goto(num - 1);
  let move: SpecialMove;
  if (type) {
    move = specialMove(type);
  } else {
    move = anySpecialMove(result[2]);
  }
  record.append(move, {
    ignoreValidation: true,
  });
  readMoveTime(record, time);
  return true;
}

function readMove2(record: Record, data: string): Error | undefined {
  const lastMove = record.current.move instanceof Move ? record.current.move : undefined;
  const [moves, e] = parseMoves(record.position, data, lastMove);
  if (e) {
    return e;
  }
  for (const move of moves) {
    record.append(move, { ignoreValidation: true });
  }
}

function readBranch(record: Record, data: string): Error | undefined {
  const result = branchRegExp.exec(data);
  if (!result) {
    return new InvalidMoveNumberError(data);
  }
  const num = Number(result[1]);
  if (num === 0 || num > record.current.ply + 1) {
    return new InvalidMoveNumberError(data);
  }
  record.goto(num - 1);
}

function readEndOfGame(record: Record, data: string): void {
  const clean = data.replaceAll(/[\s\u3000]/g, "");
  // NOTE: 末尾 "勝ち" は "時間切れにより...の勝ち" "反則勝ち" ともマッチするので最後に判定する必要がある。
  if (clean.startsWith("時間切れ")) {
    record.append(specialMove(SpecialMoveType.TIMEOUT));
  } else if (clean.endsWith("反則勝ち")) {
    record.append(specialMove(SpecialMoveType.FOUL_WIN));
  } else if (clean.endsWith("反則負け")) {
    record.append(specialMove(SpecialMoveType.FOUL_LOSE));
  } else if (clean.endsWith("入玉勝ち")) {
    record.append(specialMove(SpecialMoveType.ENTERING_OF_KING));
  } else if (clean.endsWith("勝ち")) {
    record.append(specialMove(SpecialMoveType.RESIGN));
  } else {
    const type = stringToSpecialMoveType[clean];
    if (type) {
      record.append(specialMove(type));
    } else {
      record.append(anySpecialMove(clean));
    }
  }
}

/**
 * KIF 形式の文字列を読み込みます。
 * @param data
 */
export function importKIF(data: string): Record | Error {
  return importKakinoki(data, KakinokiFormatType.KIF);
}

/**
 * KI2 形式の文字列を読み込みます。
 * @param data
 */
export function importKI2(data: string): Record | Error {
  return importKakinoki(data, KakinokiFormatType.KI2);
}

function importKakinoki(data: string, formatType: KakinokiFormatType): Record | Error {
  const metadata = new RecordMetadata();
  const record = new Record();
  const lines = data.split(/\r?\n/);
  const position = new Position();
  let preMoveComment = "";
  let preMoveBookmark = "";
  let isMoveSection = false;
  const startMoveSectionIfNot = () => {
    if (isMoveSection) {
      return;
    }
    record.clear(position);
    record.first.comment = preMoveComment;
    record.first.bookmark = preMoveBookmark;
    isMoveSection = true;
  };
  for (const line of lines) {
    if (line === "") {
      continue;
    }
    const parsed = parseLine(line);
    if (isMoveSection && parsed.isPosition) {
      return new InvalidLineError(line);
    }
    let e: Error | undefined;
    switch (parsed.type) {
      case LineType.METADATA: {
        const standardKey = metadataKeyMap[parsed.metadataKey];
        if (standardKey) {
          metadata.setStandardMetadata(standardKey, parsed.data);
        } else {
          metadata.setCustomMetadata(parsed.metadataKey, parsed.data);
        }
        break;
      }
      case LineType.HANDICAP:
        readHandicap(position, parsed.data);
        break;
      case LineType.BLACK_HAND:
        e = readHand(position.blackHand, parsed.data);
        break;
      case LineType.WHITE_HAND:
        e = readHand(position.whiteHand, parsed.data);
        break;
      case LineType.BOARD:
        e = readBoard(position.board, parsed.data);
        break;
      case LineType.BLACK_TURN:
        position.setColor(Color.BLACK);
        break;
      case LineType.WHITE_TURN:
        position.setColor(Color.WHITE);
        break;
      case LineType.MOVE:
        if (formatType !== KakinokiFormatType.KIF) {
          return new InvalidLineError(line);
        }
        startMoveSectionIfNot();
        e = readMove(record, parsed.data);
        break;
      case LineType.MOVE2:
        if (formatType !== KakinokiFormatType.KI2) {
          return new InvalidLineError(line);
        }
        startMoveSectionIfNot();
        e = readMove2(record, parsed.data);
        break;
      case LineType.BRANCH:
        // NOTE:
        //   KIF では指し手の先頭に手数が付与されるので必要ない。
        //   https://github.com/sunfish-shogi/shogihome/issues/570
        //   の不具合により、ヘッダー部に "変化：" で始まる行が存在する場合がある。
        //   指し手が始まるより前に "変化：" が出現しても無視しなければならない。
        if (isMoveSection && formatType === KakinokiFormatType.KI2) {
          e = readBranch(record, parsed.data);
        }
        break;
      case LineType.COMMENT:
        if (isMoveSection) {
          record.current.comment = appendLine(record.current.comment, parsed.data);
        } else {
          preMoveComment = appendLine(preMoveComment, parsed.data);
        }
        break;
      case LineType.BOOKMARK:
        if (isMoveSection) {
          record.current.bookmark = parsed.data;
        } else {
          preMoveBookmark = parsed.data;
        }
        break;
      case LineType.END_OF_GAME:
        // NOTE:
        //   KI2 では "までn手で" で始まる行から終局理由を読み取らなければいけない。
        //   KIF では指し手の一つとしても記載されるので必要ない。
        if (formatType === KakinokiFormatType.KI2) {
          startMoveSectionIfNot();
          readEndOfGame(record, parsed.data);
        }
        break;
      case LineType.PROGRAM_COMMENT:
        break;
      case LineType.UNKNOWN:
        break;
    }
    if (e) {
      return e;
    }
  }
  startMoveSectionIfNot();
  record.goto(0);
  record.resetAllBranchSelection();
  record.metadata = metadata;
  return record;
}

const specialMoveToString: {
  [specialMoveType in SpecialMoveType]: string;
} = {
  [SpecialMoveType.START]: "",
  [SpecialMoveType.RESIGN]: "投了",
  [SpecialMoveType.INTERRUPT]: "中断",
  [SpecialMoveType.MAX_MOVES]: "持将棋",
  [SpecialMoveType.IMPASS]: "持将棋",
  [SpecialMoveType.DRAW]: "持将棋",
  [SpecialMoveType.REPETITION_DRAW]: "千日手",
  [SpecialMoveType.MATE]: "詰み",
  [SpecialMoveType.NO_MATE]: "不詰",
  [SpecialMoveType.TIMEOUT]: "切れ負け",
  [SpecialMoveType.FOUL_WIN]: "反則勝ち",
  [SpecialMoveType.FOUL_LOSE]: "反則負け",
  [SpecialMoveType.ENTERING_OF_KING]: "入玉勝ち",
  [SpecialMoveType.WIN_BY_DEFAULT]: "不戦勝",
  [SpecialMoveType.LOSE_BY_DEFAULT]: "不戦敗",
  [SpecialMoveType.TRY]: "トライ",
};

type KIFExportOptions = {
  returnCode?: string;
  comment?: string;
};

function formatMetadata(metadata: ImmutableRecordMetadata, options?: KIFExportOptions): string {
  let ret = "";
  const returnCode = options?.returnCode || "\n";
  for (const key of metadata.standardMetadataKeys) {
    ret += metadataNameMap[key] + "：" + metadata.getStandardMetadata(key) + returnCode;
  }
  for (const key of metadata.customMetadataKeys) {
    ret += key + "：" + metadata.getCustomMetadata(key) + returnCode;
  }
  return ret;
}

function formatPosition(position: ImmutablePosition, options?: KIFExportOptions): string {
  const returnCode = options?.returnCode || "\n";

  switch (position.sfen) {
    case InitialPositionSFEN.STANDARD:
      return "手合割：平手" + returnCode;
    case InitialPositionSFEN.HANDICAP_LANCE:
      return "手合割：香落ち" + returnCode;
    case InitialPositionSFEN.HANDICAP_RIGHT_LANCE:
      return "手合割：右香落ち" + returnCode;
    case InitialPositionSFEN.HANDICAP_BISHOP:
      return "手合割：角落ち" + returnCode;
    case InitialPositionSFEN.HANDICAP_ROOK:
      return "手合割：飛車落ち" + returnCode;
    case InitialPositionSFEN.HANDICAP_ROOK_LANCE:
      return "手合割：飛香落ち" + returnCode;
    case InitialPositionSFEN.HANDICAP_2PIECES:
      return "手合割：二枚落ち" + returnCode;
    case InitialPositionSFEN.HANDICAP_4PIECES:
      return "手合割：四枚落ち" + returnCode;
    case InitialPositionSFEN.HANDICAP_6PIECES:
      return "手合割：六枚落ち" + returnCode;
    case InitialPositionSFEN.HANDICAP_8PIECES:
      return "手合割：八枚落ち" + returnCode;
    case InitialPositionSFEN.HANDICAP_10PIECES:
      return "手合割：十枚落ち" + returnCode;
  }
  return formatBOD(position, options);
}

function formatBOD(position: ImmutablePosition, options?: KIFExportOptions): string {
  const returnCode = options?.returnCode || "\n";
  let ret = "";
  ret += "後手の持駒：" + formatHand(position.whiteHand) + returnCode;
  ret += "  ９ ８ ７ ６ ５ ４ ３ ２ １" + returnCode;
  ret += "+---------------------------+" + returnCode;
  for (let y = 0; y < 9; y++) {
    ret += "|";
    for (let x = 0; x < 9; x++) {
      const square = Square.newByXY(x, y);
      const piece = position.board.at(square);
      if (!piece) {
        ret += " ・";
      } else if (piece.color === Color.BLACK) {
        ret += " " + pieceTypeToStringForBoard(piece.type);
      } else {
        ret += "v" + pieceTypeToStringForBoard(piece.type);
      }
    }
    ret += "|" + rankToKanji(y + 1) + returnCode;
  }
  ret += "+---------------------------+" + returnCode;
  ret += "先手の持駒：" + formatHand(position.blackHand) + returnCode;
  if (position.color === Color.BLACK) {
    ret += "先手番" + returnCode;
  } else {
    ret += "後手番" + returnCode;
  }
  return ret;
}

/**
 * KIF 形式の指し手を出力します。
 * @param move 対象の指し手
 * @param prev 直前の指し手 ("同"の判定に使用)
 */
export function formatKIFMove(move: Move, options?: { prev?: Move; padding?: boolean }): string {
  let ret = "";
  if (options?.prev && move.to.equals(options.prev.to)) {
    ret += "同\u3000";
  } else {
    ret += fileToMultiByteChar(move.to.file);
    ret += rankToKanji(move.to.rank);
  }
  ret += pieceTypeToStringForMove(move.pieceType);
  if (move.promote) {
    ret += "成";
  }
  if (move.from instanceof Square) {
    ret += "(" + move.from.file + move.from.rank + ")";
    ret += ret.length === 7 && options?.padding ? "  " : "";
  } else {
    ret += "打";
    ret += options?.padding ? "    " : "";
  }
  return ret;
}

function formatHand(hand: ImmutableHand): string {
  let ret = "";
  hand.forEach((pieceType, n) => {
    if (n >= 1) {
      ret += pieceTypeToStringForBoard(pieceType);
      if (n >= 2) {
        ret += numberToKanji(n);
      }
      ret += "　";
    }
  });
  if (ret === "") {
    ret = "なし";
  }
  return ret;
}

/**
 * KIF形式の文字列を出力します。
 * @param record
 * @param options
 */
export function exportKIF(record: ImmutableRecord, options?: KIFExportOptions): string {
  let ret = "";
  const returnCode = options?.returnCode || "\n";
  if (options?.comment) {
    for (const line of options.comment.split("\n")) {
      ret += "#" + line + returnCode;
    }
  }
  ret += formatMetadata(record.metadata, options);
  ret += formatPosition(record.initialPosition, options);
  ret += "手数----指手---------消費時間--" + returnCode;
  record.forEach((node) => {
    if (node.ply !== 0) {
      if (!node.isFirstBranch) {
        ret += returnCode;
        ret += "変化：" + node.ply + "手" + returnCode;
      }
      ret += String(node.ply).padStart(4, " ") + " ";
      if (node.move instanceof Move) {
        const prev = node.prev?.move instanceof Move ? node.prev.move : undefined;
        ret += formatKIFMove(node.move, { prev, padding: true });
      } else if (isKnownSpecialMove(node.move)) {
        const s = specialMoveToString[node.move.type];
        ret += s + " ".repeat(Math.max(12 - s.length * 2, 0));
      } else {
        ret += node.move.name + " ".repeat(Math.max(12 - node.move.name.length * 2, 0));
      }
      const elapsed = millisecondsToMSS(node.elapsedMs);
      const totalElapsed = millisecondsToHHMMSS(node.totalElapsedMs);
      ret += ` (${elapsed}/${totalElapsed})`;
      if (node.branch) {
        // Kifu for Windows にならい、後続の分岐が存在する場合は行末に "+" を付ける。
        ret += "+";
      }
      ret += returnCode;
    }
    if (node.comment.length !== 0) {
      const comment = node.comment.endsWith("\n") ? node.comment.slice(0, -1) : node.comment;
      ret += "*" + comment.replaceAll("\n", returnCode + "*") + returnCode;
    }
    if (node.bookmark.length !== 0) {
      ret += "&" + node.bookmark + returnCode;
    }
  });
  return ret;
}

type KI2ExportOptions = {
  returnCode?: string;
};

/**
 * KI2形式の文字列を出力します。
 * @param record
 * @param options
 */
export function exportKI2(record: ImmutableRecord, options?: KI2ExportOptions): string {
  let ret = "";
  let moveCountInLine = 0;
  let lastMoveLength = 0;
  const returnCode = options?.returnCode ? options.returnCode : "\n";
  ret += formatMetadata(record.metadata, options);
  ret += formatPosition(record.initialPosition, options);
  record.forEach((node, pos) => {
    if (node.ply !== 0) {
      if (!node.isFirstBranch) {
        if (!ret.endsWith(returnCode)) {
          ret += returnCode;
        }
        ret += returnCode;
        ret += "変化：" + node.ply + "手" + returnCode;
      }
      if (node.move instanceof Move) {
        const str = formatMove(pos, node.move, {
          lastMove: node.prev?.move instanceof Move ? node.prev.move : undefined,
          compatible: true,
        });
        if (ret.endsWith(returnCode)) {
          moveCountInLine = 0;
        } else {
          ret += " ".repeat(Math.max(12 - lastMoveLength * 2, 0));
        }
        ret += str;
        lastMoveLength = str.length;
        moveCountInLine++;
        if (moveCountInLine >= 6) {
          ret += returnCode;
        }
      } else {
        if (!ret.endsWith(returnCode)) {
          ret += returnCode;
        }
        ret += `まで${node.ply - 1}手で`;
        if (isKnownSpecialMove(node.move)) {
          const [next, last] = node.nextColor === Color.BLACK ? ["先手", "後手"] : ["後手", "先手"];
          switch (node.move.type) {
            case SpecialMoveType.RESIGN:
              ret += `${last}の勝ち`;
              break;
            case SpecialMoveType.TIMEOUT:
              ret += `時間切れにより${last}の勝ち`;
              break;
            case SpecialMoveType.ENTERING_OF_KING:
              ret += `${next}の入玉勝ち`;
              break;
            case SpecialMoveType.FOUL_WIN:
              ret += `${next}の反則勝ち`;
              break;
            case SpecialMoveType.FOUL_LOSE:
              ret += `${next}の反則負け`;
              break;
            default:
              ret += specialMoveToString[node.move.type];
              break;
          }
        } else {
          ret += node.move.name;
        }
        ret += returnCode;
      }
    }
    if (node.comment.length !== 0) {
      if (!ret.endsWith(returnCode)) {
        ret += returnCode;
      }
      const comment = node.comment.endsWith("\n") ? node.comment.slice(0, -1) : node.comment;
      ret += "*" + comment.replaceAll("\n", returnCode + "*") + returnCode;
    }
    if (node.bookmark.length !== 0) {
      if (!ret.endsWith(returnCode)) {
        ret += returnCode;
      }
      ret += "&" + node.bookmark + returnCode;
    }
  });
  return ret;
}

export function exportBOD(record: ImmutableRecord, options?: KIFExportOptions): string {
  let ret = "";
  const returnCode = options?.returnCode || "\n";
  ret += formatBOD(record.position, options);
  const ply = record.current.ply;
  const lastMove = record.current.move instanceof Move ? record.current.move : undefined;
  const lastMoveStr = lastMove ? formatKIFMove(lastMove) : "";
  ret += `手数＝${ply}  ${lastMoveStr}  まで` + returnCode;
  return ret;
}
