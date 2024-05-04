// CSA file format (.csa)
// See http://www2.computer-shogi.org/protocol/record_v22.html

import { appendLine } from "./helpers/string";
import {
  InvalidLineError,
  InvalidMoveError,
  InvalidPieceNameError,
  InvalidTurnError,
  PieceNotExistsError,
} from "./errors";
import { Color, reverseColor } from "./color";
import { ImmutableHand } from "./hand";
import { Move, SpecialMove, SpecialMoveType } from "./move";
import { Piece, PieceType, promotedPieceType } from "./piece";
import {
  Position,
  countNotExistingPieces,
  ImmutablePosition,
  InitialPositionSFEN,
} from "./position";
import {
  ImmutableRecord,
  ImmutableRecordMetadata,
  Record,
  RecordMetadata,
  RecordMetadataKey,
  getBlackPlayerName,
  getWhitePlayerName,
} from "./record";
import { Square } from "./square";

enum LineType {
  VERSION,
  EXTENDED_COMMENT,
  COMMENT,
  BLACK_NAME,
  WHITE_NAME,
  METADATA,
  POSITION,
  RANK,
  PIECES,
  FIRST_TURN,
  MOVE,
  SPECIAL_MOVE,
  ELAPSED,
}

enum SectionType {
  HEADER,
  MOVE,
  NEUTRAL,
}

const linePatterns: {
  pattern: RegExp;
  type: LineType;
  sectionType: SectionType;
}[] = [
  {
    pattern: /^V/,
    type: LineType.VERSION,
    sectionType: SectionType.HEADER,
  },
  {
    pattern: /^'\*(.+)$/,
    type: LineType.EXTENDED_COMMENT,
    sectionType: SectionType.NEUTRAL,
  },
  {
    pattern: /^'(.+)$/,
    type: LineType.COMMENT,
    sectionType: SectionType.NEUTRAL,
  },
  {
    pattern: /^N\+(.+)$/,
    type: LineType.BLACK_NAME,
    sectionType: SectionType.HEADER,
  },
  {
    pattern: /^N-(.+)$/,
    type: LineType.WHITE_NAME,
    sectionType: SectionType.HEADER,
  },
  {
    pattern: /^\$([^:]+):(.+)$/,
    type: LineType.METADATA,
    sectionType: SectionType.HEADER,
  },
  {
    pattern: /^PI([1-9]{2}[A-Z]{2})*$/,
    type: LineType.POSITION,
    sectionType: SectionType.HEADER,
  },
  {
    pattern: /^P[1-9]( \* |[-+][A-Z][A-Z]){9}$/,
    type: LineType.RANK,
    sectionType: SectionType.HEADER,
  },
  {
    pattern: /^P[-+]([0-9]{2}[A-Z]{2})*/,
    type: LineType.PIECES,
    sectionType: SectionType.HEADER,
  },
  {
    pattern: /^[-+]$/,
    type: LineType.FIRST_TURN,
    sectionType: SectionType.HEADER,
  },
  {
    pattern: /^[-+][0-9]{4}[A-Z]{2}/,
    type: LineType.MOVE,
    sectionType: SectionType.MOVE,
  },
  {
    pattern: /^%[-+A-Z_]+/,
    type: LineType.SPECIAL_MOVE,
    sectionType: SectionType.MOVE,
  },
  {
    pattern: /^T([0-9]+)/,
    type: LineType.ELAPSED,
    sectionType: SectionType.MOVE,
  },
];

type Line = {
  type: LineType;
  line: string;
  args: string[];
  sectionType: SectionType;
};

function parseLine(line: string): Line[] {
  const results = [];
  const lines = line.match(/^['N$]/) ? [line] : line.split(",");
  for (const line of lines) {
    for (let i = 0; i < linePatterns.length; i++) {
      const matched = linePatterns[i].pattern.exec(line);
      if (matched) {
        results.push({
          type: linePatterns[i].type,
          line: line,
          args: matched.slice(1),
          sectionType: linePatterns[i].sectionType,
        });
        break;
      }
    }
  }
  return results;
}

const csaNameToRecordMetadataKey: { [key: string]: RecordMetadataKey } = {
  EVENT: RecordMetadataKey.TITLE,
  SITE: RecordMetadataKey.PLACE,
  START_TIME: RecordMetadataKey.START_DATETIME,
  END_TIME: RecordMetadataKey.END_DATETIME,
  TIME_LIMIT: RecordMetadataKey.TIME_LIMIT,
  OPENING: RecordMetadataKey.STRATEGY,
};

const csaNameToPieceType: { [name: string]: PieceType } = {
  FU: PieceType.PAWN,
  KY: PieceType.LANCE,
  KE: PieceType.KNIGHT,
  GI: PieceType.SILVER,
  KI: PieceType.GOLD,
  KA: PieceType.BISHOP,
  HI: PieceType.ROOK,
  OU: PieceType.KING,
  TO: PieceType.PROM_PAWN,
  NY: PieceType.PROM_LANCE,
  NK: PieceType.PROM_KNIGHT,
  NG: PieceType.PROM_SILVER,
  UM: PieceType.HORSE,
  RY: PieceType.DRAGON,
};

function parsePosition(line: string, position: Position): void {
  position.resetBySFEN(InitialPositionSFEN.STANDARD);
  for (let i = 2; i + 4 <= line.length; i += 4) {
    const file = Number(line[i]);
    const rank = Number(line[i + 1]);
    position.board.remove(new Square(file, rank));
  }
}

function parseRank(line: string, position: Position): Error | undefined {
  const rank = Number(line[1]);
  for (let x = 0; x < 9; x += 1) {
    const file = 9 - x;
    const begin = x * 3 + 2;
    const section = line.slice(begin, begin + 3);
    if (section[0] === " ") {
      continue;
    }
    const color = section[0] === "+" ? Color.BLACK : Color.WHITE;
    const pieceType = csaNameToPieceType[section.slice(1)];
    if (!pieceType) {
      return new InvalidPieceNameError(section);
    }
    position.board.set(new Square(file, rank), new Piece(color, pieceType));
  }
}

function parsePieces(line: string, position: Position): Error | undefined {
  const color = line[1] === "+" ? Color.BLACK : Color.WHITE;
  for (let begin = 2; begin + 4 <= line.length; begin += 4) {
    const section = line.slice(begin, begin + 4);
    if (section === "00AL") {
      const counts = countNotExistingPieces(position);
      if (color === Color.BLACK) {
        position.blackHand.forEach((pieceType) => {
          position.blackHand.add(pieceType, counts[pieceType]);
        });
      } else {
        position.whiteHand.forEach((pieceType) => {
          position.whiteHand.add(pieceType, counts[pieceType]);
        });
      }
      return;
    }
    const file = Number(section[0]);
    const rank = Number(section[1]);
    const pieceType = csaNameToPieceType[section.slice(2)];
    if (!pieceType) {
      return new InvalidPieceNameError(section);
    }
    if (file !== 0 && rank !== 0) {
      position.board.set(new Square(file, rank), new Piece(color, pieceType));
    } else if (color === Color.BLACK) {
      position.blackHand.add(pieceType, 1);
    } else {
      position.whiteHand.add(pieceType, 1);
    }
  }
}

function parseMove(line: string, position: ImmutablePosition): Move | Error {
  const color = line[0] === "+" ? Color.BLACK : Color.WHITE;
  if (color != position.color) {
    return new InvalidTurnError(line);
  }
  const fromFile = Number(line[1]);
  const fromRank = Number(line[2]);
  const toFile = Number(line[3]);
  const toRank = Number(line[4]);
  const pieceType = csaNameToPieceType[line.slice(5, 7)];
  if (!pieceType) {
    return new InvalidPieceNameError(line);
  }
  const from = fromFile === 0 && fromRank === 0 ? pieceType : new Square(fromFile, fromRank);
  const to = new Square(toFile, toRank);
  let move = position.createMove(from, to);
  if (!move) {
    return new InvalidMoveError(line);
  }
  if (from instanceof Square) {
    const basePiece = position.board.at(from);
    if (!basePiece) {
      return new PieceNotExistsError(line);
    }
    if (basePiece.type !== pieceType) {
      if (basePiece.promoted().type === pieceType) {
        move = move.withPromote();
      } else {
        return new PieceNotExistsError(line);
      }
    }
  }
  return move;
}

/**
 * CSA形式の特殊な指し手の名前をSpecialMoveTypeに変換します。
 * @param name 先頭の % 記号を含めない名前をしていします。
 * @param color 手番を指定します。 +ILLEGAL_ACTION や -ILLEGAL_ACTION の読み取りに使用します。
 */
export function getSpecialMoveByName(name: string, color: Color): SpecialMoveType | undefined {
  switch (name) {
    case "CHUDAN":
      return SpecialMoveType.INTERRUPT;
    case "TORYO":
      return SpecialMoveType.RESIGN;
    case "JISHOGI":
      return SpecialMoveType.IMPASS;
    case "HIKIWAKE":
      return SpecialMoveType.DRAW;
    case "SENNICHITE":
      return SpecialMoveType.REPETITION_DRAW;
    case "TSUMI":
      return SpecialMoveType.MATE;
    case "FUZUMI":
      return SpecialMoveType.NO_MATE;
    case "TIME_UP":
      return SpecialMoveType.TIMEOUT;
    case "ILLEGAL_MOVE":
      return SpecialMoveType.FOUL_LOSE;
    case "+ILLEGAL_ACTION":
      return color == Color.BLACK ? SpecialMoveType.FOUL_WIN : SpecialMoveType.FOUL_LOSE;
    case "-ILLEGAL_ACTION":
      return color == Color.WHITE ? SpecialMoveType.FOUL_WIN : SpecialMoveType.FOUL_LOSE;
    case "KACHI":
      return SpecialMoveType.ENTERING_OF_KING;
  }
}

/**
 * CSA形式の指し手を読み取ります。
 * @param position
 * @param line
 */
export function parseCSAMove(position: ImmutablePosition, line: string): Move | Error {
  return parseMove(line, position);
}

/**
 * CSA形式の棋譜を読み取ります。
 * @param data
 */
export function importCSA(data: string): Record | Error {
  const metadata = new RecordMetadata();
  const record = new Record();
  const position = new Position();
  position.resetBySFEN(InitialPositionSFEN.EMPTY);
  let preMoveComment = "";
  let inMoveSection = false;
  const lines = data.replace(/\r?\n\/(\r?\n[\s\S]*)?$/, "").split(/\r?\n/);
  for (const line of lines) {
    for (const parsed of parseLine(line)) {
      if (parsed.sectionType === SectionType.MOVE && !inMoveSection) {
        return new InvalidLineError(parsed.line);
      }
      // NOTE:
      //   WCSC の棋譜中継ではファイルの末尾に $END_TIME が書かれる。
      //   V2.2 の仕様上は認められないはずだが、エラーにすると実用上困るので無視する。
      if (parsed.sectionType === SectionType.HEADER && inMoveSection) {
        continue;
      }
      switch (parsed.type) {
        case LineType.VERSION:
          break;
        case LineType.EXTENDED_COMMENT:
          if (inMoveSection) {
            record.current.comment = appendLine(record.current.comment, parsed.args[0]);
          } else {
            preMoveComment = appendLine(preMoveComment, parsed.args[0]);
          }
          break;
        case LineType.COMMENT:
          break;
        case LineType.BLACK_NAME:
          metadata.setStandardMetadata(RecordMetadataKey.BLACK_NAME, parsed.args[0]);
          break;
        case LineType.WHITE_NAME:
          metadata.setStandardMetadata(RecordMetadataKey.WHITE_NAME, parsed.args[0]);
          break;
        case LineType.METADATA: {
          const key = csaNameToRecordMetadataKey[parsed.args[0]];
          if (key) {
            metadata.setStandardMetadata(key, parsed.args[1]);
          } else {
            metadata.setCustomMetadata(parsed.args[0], parsed.args[1]);
          }
          break;
        }
        case LineType.POSITION:
          parsePosition(parsed.line, position);
          break;
        case LineType.RANK: {
          const error = parseRank(parsed.line, position);
          if (error) {
            return error;
          }
          break;
        }
        case LineType.PIECES: {
          const error = parsePieces(parsed.line, position);
          if (error) {
            return error;
          }
          break;
        }
        case LineType.FIRST_TURN:
          if (parsed.line[0] === "+") {
            position.setColor(Color.BLACK);
          } else {
            position.setColor(Color.WHITE);
          }
          record.clear(position);
          record.first.comment = preMoveComment;
          inMoveSection = true;
          break;
        case LineType.MOVE: {
          const moveOrError = parseMove(parsed.line, record.position);
          if (moveOrError instanceof Error) {
            return moveOrError;
          }
          record.append(moveOrError, { ignoreValidation: true });
          break;
        }
        case LineType.SPECIAL_MOVE: {
          const specialMove = getSpecialMoveByName(parsed.line.slice(1), record.position.color);
          if (specialMove) {
            record.append(specialMove, { ignoreValidation: true });
          }
          break;
        }
        case LineType.ELAPSED:
          record.current.setElapsedMs(Number(parsed.args[0]) * 1e3);
          break;
      }
    }
  }
  if (!inMoveSection) {
    record.clear(position);
    record.first.comment = preMoveComment;
  }
  record.goto(0);
  record.resetAllBranchSelection();
  record.metadata = metadata;
  return record;
}

type CSAExportOptions = {
  returnCode?: string;
};

function formatMetadata(metadata: ImmutableRecordMetadata, options: CSAExportOptions): string {
  let ret = "";
  const returnCode = options.returnCode ? options.returnCode : "\n";
  const blackName = getBlackPlayerName(metadata);
  if (blackName) {
    ret += "N+" + blackName + returnCode;
  }
  const whiteName = getWhitePlayerName(metadata);
  if (whiteName) {
    ret += "N-" + whiteName + returnCode;
  }
  const event =
    metadata.getStandardMetadata(RecordMetadataKey.TOURNAMENT) ||
    metadata.getStandardMetadata(RecordMetadataKey.TITLE) ||
    metadata.getStandardMetadata(RecordMetadataKey.OPUS_NAME) ||
    metadata.getStandardMetadata(RecordMetadataKey.PUBLISHED_BY);
  if (event) {
    ret += "$EVENT:" + event + returnCode;
  }
  const site = metadata.getStandardMetadata(RecordMetadataKey.PLACE);
  if (site) {
    ret += "$SITE:" + site + returnCode;
  }
  const startTime =
    metadata.getStandardMetadata(RecordMetadataKey.START_DATETIME) ||
    metadata.getStandardMetadata(RecordMetadataKey.DATE);
  if (startTime) {
    // 年月日 YYYY/MM/DD (10文字) については KIF 形式と共通
    ret += "$START_TIME:" + startTime.slice(10) + returnCode;
  }
  const endTime = metadata.getStandardMetadata(RecordMetadataKey.DATE);
  if (endTime) {
    ret += "$END_TIME:" + endTime.slice(10) + returnCode;
  }
  const opening = metadata.getStandardMetadata(RecordMetadataKey.STRATEGY);
  if (opening) {
    ret += "$OPENING:" + opening + returnCode;
  }
  // TODO: 持ち時間（CSA形式に合致する場合のみ）
  return ret;
}

const pieceTypeToString: {
  [pieceType in PieceType]: string;
} = {
  king: "OU",
  rook: "HI",
  dragon: "RY",
  bishop: "KA",
  horse: "UM",
  gold: "KI",
  silver: "GI",
  promSilver: "NG",
  knight: "KE",
  promKnight: "NK",
  lance: "KY",
  promLance: "NY",
  pawn: "FU",
  promPawn: "TO",
};

function formatHand(hand: ImmutableHand): string {
  let ret = "";
  hand.forEach((pieceType, n) => {
    for (let i = 0; i < n; i++) {
      ret += "00" + pieceTypeToString[pieceType];
    }
  });
  return ret;
}

const sfenToPCommand: { [sfen: string]: [string, string] } = {
  [InitialPositionSFEN.STANDARD]: ["PI", "+"],
  [InitialPositionSFEN.HANDICAP_LANCE]: ["PI11KY", "-"],
  [InitialPositionSFEN.HANDICAP_RIGHT_LANCE]: ["PI91KY", "-"],
  [InitialPositionSFEN.HANDICAP_BISHOP]: ["PI22KA", "-"],
  [InitialPositionSFEN.HANDICAP_ROOK]: ["PI82HI", "-"],
  [InitialPositionSFEN.HANDICAP_ROOK_LANCE]: ["PI82HI11KY", "-"],
  [InitialPositionSFEN.HANDICAP_2PIECES]: ["PI82HI22KA", "-"],
  [InitialPositionSFEN.HANDICAP_4PIECES]: ["PI82HI22KA11KY91KY", "-"],
  [InitialPositionSFEN.HANDICAP_6PIECES]: ["PI82HI22KA21KE81KE11KY91KY", "-"],
  [InitialPositionSFEN.HANDICAP_8PIECES]: ["PI82HI22KA31GI71GI21KE81KE11KY91KY", "-"],
  [InitialPositionSFEN.HANDICAP_10PIECES]: ["PI82HI22KA41KI61KI31GI71GI21KE81KE11KY91KY", "-"],
};

function formatPosition(position: ImmutablePosition, options: CSAExportOptions): string {
  const returnCode = options.returnCode ? options.returnCode : "\n";

  const p = sfenToPCommand[position.sfen];
  if (p) {
    return p[0] + returnCode + p[1] + returnCode;
  }

  let ret = "";
  for (let rank = 1; rank <= 9; rank += 1) {
    ret += "P" + rank;
    for (let file = 9; file >= 1; file -= 1) {
      const piece = position.board.at(new Square(file, rank));
      if (!piece) {
        ret += " * ";
      } else if (piece.color === Color.BLACK) {
        ret += "+" + pieceTypeToString[piece.type];
      } else {
        ret += "-" + pieceTypeToString[piece.type];
      }
    }
    ret += returnCode;
  }
  ret += "P+" + formatHand(position.blackHand) + returnCode;
  ret += "P-" + formatHand(position.whiteHand) + returnCode;
  ret += (position.color === Color.BLACK ? "+" : "-") + returnCode;
  return ret;
}

function formatSquare(square: Square | PieceType): string {
  return square instanceof Square ? `${square.file}${square.rank}` : "00";
}

/**
 * 特殊な指し手のCSA形式文字列を取得します。
 * 先頭の % は含みません。
 * @param move
 * @param color 手番を指定します。 +ILLEGAL_ACTION や -ILLEGAL_ACTION の出力に使用します。
 */
export function getCSASpecialMoveName(move: SpecialMove, color: Color): string | undefined {
  switch (move.type) {
    case SpecialMoveType.INTERRUPT:
      return "CHUDAN";
    case SpecialMoveType.RESIGN:
      return "TORYO";
    case SpecialMoveType.IMPASS:
      return "JISHOGI";
    case SpecialMoveType.DRAW:
      return "HIKIWAKE";
    case SpecialMoveType.REPETITION_DRAW:
      return "SENNICHITE";
    case SpecialMoveType.MATE:
      return "TSUMI";
    case SpecialMoveType.NO_MATE:
      return "FUZUMI";
    case SpecialMoveType.TIMEOUT:
      return "TIME_UP";
    case SpecialMoveType.FOUL_LOSE:
      return "ILLEGAL_MOVE";
    case SpecialMoveType.FOUL_WIN:
      return color == Color.BLACK ? "+ILLEGAL_ACTION" : "-ILLEGAL_ACTION";
    case SpecialMoveType.ENTERING_OF_KING:
      return "KACHI";
  }
}

/**
 * CSA形式の指し手を出力します。
 * @param move
 */
export function formatCSAMove(move: Move): string {
  return (
    (move.color === Color.BLACK ? "+" : "-") +
    formatSquare(move.from) +
    formatSquare(move.to) +
    pieceTypeToString[move.promote ? promotedPieceType(move.pieceType) : move.pieceType]
  );
}

/**
 * CSA形式の棋譜を出力します。
 * @param record
 * @param options
 */
export function exportCSA(record: ImmutableRecord, options: CSAExportOptions): string {
  let ret = "";
  const returnCode = options.returnCode ? options.returnCode : "\n";
  ret += "' CSA形式棋譜ファイル Generated by Electron Shogi" + returnCode;
  ret += "V2.2" + returnCode;
  ret += formatMetadata(record.metadata, options);
  ret += formatPosition(record.initialPosition, options);
  record.moves.forEach((node) => {
    if (node.ply !== 0) {
      let move: string | undefined;
      if (node.move instanceof Move) {
        move = formatCSAMove(node.move);
      } else {
        const name = getCSASpecialMoveName(node.move, reverseColor(node.nextColor));
        if (name) {
          move = "%" + name;
        }
      }
      if (move) {
        ret += move + returnCode;
        ret += "T" + Math.floor(node.elapsedMs / 1e3) + returnCode;
      }
    }
    if (node.comment) {
      const comment = node.comment.endsWith("\n") ? node.comment.slice(0, -1) : node.comment;
      comment.split("\n").forEach((line) => {
        ret += "'*" + line + returnCode;
      });
    }
  });
  return ret;
}
