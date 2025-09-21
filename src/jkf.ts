// JSON Kifu Format (.jkf .json)
// See https://github.com/na2hiro/Kifu-for-JS/blob/master/packages/json-kifu-format/README.md

import { Color, reverseColor } from "./color";
import { getSpecialMoveByName, getCSASpecialMoveName } from "./csa";
import { kakinokiToMetadataKey, metadataKeyToKakinoki } from "./kakinoki";
import { Move } from "./move";
import { Piece, PieceType, isPromotable } from "./piece";
import { ImmutablePosition, InitialPositionSFEN, Position, isPromotableRank } from "./position";
import { ImmutableNode, ImmutableRecord, Record } from "./record";
import { Square } from "./square";
import { getDirectionModifier } from "./text";

export type JKF = {
  header: { [key: string]: string };
  initial?: JKFInitial;
  // moves の最初の要素は初期局面を表し、全てのプロパティが無いかあるいは comments だけが存在する。
  moves: JKFMoveWithForksAndInfo[];
};

export type JKFInitial = {
  preset: string; // JKF の仕様では取りうる値が列挙されているが、追加される可能性があるので string にしておく。
  data?: JKFInitialData | null;
};

export type JKFInitialData = {
  color: JKFColor;
  board: JKFSquare[][] | { [key: string]: object }; // JKF の仕様によると駒がない場合は空オブジェクトになるらしい。
  hands: JKFHands;
};

export type JKFSquare = {
  color?: JKFColor | null;
  kind?: JKFKind | null;
};

export type JKFHands = [JKFHand, JKFHand];

export type JKFHand = {
  FU?: number;
  KY?: number;
  KE?: number;
  GI?: number;
  KI?: number;
  KA?: number;
  HI?: number;
  OU?: number;
  TO?: number;
  NY?: number;
  NK?: number;
  NG?: number;
  UM?: number;
  RY?: number;
};

export enum JKFColor {
  BLACK = 0,
  WHITE = 1,
}

export type JKFMoveWithForksAndInfo = {
  comments?: string[] | null;
  move?: JKFMove | null;
  time?: JKFConsumption | null;
  special?: JKFSpecial | null;
  forks?: JKFForks | null;
};

export enum JKFSpecial {
  TORYO = "TORYO",
  CHUDAN = "CHUDAN",
  SENNICHITE = "SENNICHITE",
  TIME_UP = "TIME_UP",
  ILLEGAL_MOVE = "ILLEGAL_MOVE",
  BLACK_ILLEGAL_ACTION = "+ILLEGAL_ACTION", // 先手の反則手
  WHITE_ILLEGAL_ACTION = "-ILLEGAL_ACTION", // 後手の反則手
  JISHOGI = "JISHOGI",
  KACHI = "KACHI",
  HIKIWAKE = "HIKIWAKE",
  MAX_MOVES = "MAX_MOVES", // NOTE: CSA V3 で追加
  MATTA = "MATTA", // NOTE: CSA V3 で廃止
  TSUMI = "TSUMI",
  FUZUMI = "FUZUMI",
  ERROR = "ERROR",
}

export type JKFForks = JKFFork[];

export type JKFFork = JKFMoveWithForksAndInfo[];

export type JKFConsumption = {
  now: JKFTime;
  total: JKFTime;
};

export type JKFMove = {
  color: JKFColor;
  from?: JKFPlaceFormat | null;
  // Schema では to が必須とされているが実装はそうなっていなかった。 same が使われた場合に省略の可能性があると思われる。
  // https://github.com/na2hiro/Kifu-for-JS/blob/master/packages/json-kifu-format/specification/json-kifu-format.schema.json
  // https://github.com/na2hiro/Kifu-for-JS/blob/master/packages/json-kifu-format/src/Formats.ts
  to?: JKFPlaceFormat;
  piece: JKFKind;
  same?: boolean | null;
  promote?: boolean | null;
  capture?: JKFKind | null;
  relative?: string | null; // [LCR]|[UMD]|[LCR][UD]|[LR]M|H
};

export type JKFTime = {
  h?: number | null;
  m: number;
  s: number;
};

export type JKFPlaceFormat = {
  x: number;
  y: number;
};

export enum JKFKind {
  FU = "FU",
  KY = "KY",
  KE = "KE",
  GI = "GI",
  KI = "KI",
  KA = "KA",
  HI = "HI",
  OU = "OU",
  TO = "TO",
  NY = "NY",
  NK = "NK",
  NG = "NG",
  UM = "UM",
  RY = "RY",
}

function msToJKFTimeMS(ms: number): JKFTime {
  return {
    m: Math.floor(ms / (60 * 1000)),
    s: Math.floor(ms / 1000) % 60,
  };
}

function msToJKFTimeHMS(ms: number): JKFTime {
  return {
    h: Math.floor(ms / (60 * 60 * 1000)),
    m: Math.floor(ms / (60 * 1000)) % 60,
    s: Math.floor(ms / 1000) % 60,
  };
}

function jkfTimeToMs(time: JKFTime): number {
  return ((time.h || 0) * 60 * 60 + time.m * 60 + time.s) * 1000;
}

function colorToJKF(color: Color): JKFColor {
  switch (color) {
    case Color.BLACK:
      return JKFColor.BLACK;
    default:
      return JKFColor.WHITE;
  }
}

function jkfToColor(color: JKFColor): Color {
  switch (color) {
    default:
      return Color.BLACK;
    case JKFColor.WHITE:
      return Color.WHITE;
  }
}

function pieceTypeToJKF(type: PieceType): JKFKind {
  switch (type) {
    case PieceType.PAWN:
      return JKFKind.FU;
    case PieceType.LANCE:
      return JKFKind.KY;
    case PieceType.KNIGHT:
      return JKFKind.KE;
    case PieceType.SILVER:
      return JKFKind.GI;
    case PieceType.GOLD:
      return JKFKind.KI;
    case PieceType.BISHOP:
      return JKFKind.KA;
    case PieceType.ROOK:
      return JKFKind.HI;
    case PieceType.KING:
      return JKFKind.OU;
    case PieceType.PROM_PAWN:
      return JKFKind.TO;
    case PieceType.PROM_LANCE:
      return JKFKind.NY;
    case PieceType.PROM_KNIGHT:
      return JKFKind.NK;
    case PieceType.PROM_SILVER:
      return JKFKind.NG;
    case PieceType.HORSE:
      return JKFKind.UM;
    case PieceType.DRAGON:
      return JKFKind.RY;
  }
}

function jkfToPieceType(kind: JKFKind): PieceType {
  switch (kind) {
    case JKFKind.FU:
      return PieceType.PAWN;
    case JKFKind.KY:
      return PieceType.LANCE;
    case JKFKind.KE:
      return PieceType.KNIGHT;
    case JKFKind.GI:
      return PieceType.SILVER;
    case JKFKind.KI:
      return PieceType.GOLD;
    case JKFKind.KA:
      return PieceType.BISHOP;
    case JKFKind.HI:
      return PieceType.ROOK;
    case JKFKind.OU:
      return PieceType.KING;
    case JKFKind.TO:
      return PieceType.PROM_PAWN;
    case JKFKind.NY:
      return PieceType.PROM_LANCE;
    case JKFKind.NK:
      return PieceType.PROM_KNIGHT;
    case JKFKind.NG:
      return PieceType.PROM_SILVER;
    case JKFKind.UM:
      return PieceType.HORSE;
    case JKFKind.RY:
      return PieceType.DRAGON;
  }
}

const directionModifierToJKF: { [m: string]: string } = {
  左: "L",
  直: "C",
  右: "R",
  上: "U",
  寄: "M",
  引: "D",
  打: "H",
};

/**
 * JSON棋譜フォーマットの文字列を読み取ります。
 * @param data
 */
export function importJKFString(data: string): Record | Error {
  try {
    return importJKF(JSON.parse(data) as JKF);
  } catch (e) {
    return new Error("failed to parse JSON: " + e);
  }
}

/**
 * JSON棋譜フォーマットのオブジェクトを読み取ります。
 * @param jkf
 */
export function importJKF(jkf: JKF): Record | Error {
  try {
    const position = new Position();
    if (jkf.initial) {
      switch (jkf.initial.preset) {
        case "HIRATE":
          position.resetBySFEN(InitialPositionSFEN.STANDARD);
          break;
        case "KY":
          position.resetBySFEN(InitialPositionSFEN.HANDICAP_LANCE);
          break;
        case "KY_R":
          position.resetBySFEN(InitialPositionSFEN.HANDICAP_RIGHT_LANCE);
          break;
        case "KA":
          position.resetBySFEN(InitialPositionSFEN.HANDICAP_BISHOP);
          break;
        case "HI":
          position.resetBySFEN(InitialPositionSFEN.HANDICAP_ROOK);
          break;
        case "HIKY":
          position.resetBySFEN(InitialPositionSFEN.HANDICAP_ROOK_LANCE);
          break;
        case "2":
          position.resetBySFEN(InitialPositionSFEN.HANDICAP_2PIECES);
          break;
        case "4":
          position.resetBySFEN(InitialPositionSFEN.HANDICAP_4PIECES);
          break;
        case "6":
          position.resetBySFEN(InitialPositionSFEN.HANDICAP_6PIECES);
          break;
        case "8":
          position.resetBySFEN(InitialPositionSFEN.HANDICAP_8PIECES);
          break;
        case "10":
          position.resetBySFEN(InitialPositionSFEN.HANDICAP_10PIECES);
          break;
        case "OTHER":
          position.resetBySFEN(InitialPositionSFEN.EMPTY);
          if (jkf.initial.data) {
            position.setColor(jkfToColor(jkf.initial.data.color));
            if (Array.isArray(jkf.initial.data.board)) {
              for (let x = 1; x <= 9; x++) {
                for (let y = 1; y <= 9; y++) {
                  const piece = jkf.initial.data.board[x - 1][y - 1];
                  if (piece?.kind) {
                    const square = new Square(x, y);
                    const color = jkfToColor(piece.color);
                    const pieceType = jkfToPieceType(piece.kind);
                    position.board.set(square, new Piece(color, pieceType));
                  }
                }
              }
            }
            for (const kind of Object.values(JKFKind)) {
              const b = jkf.initial.data.hands[0][kind] || 0;
              position.blackHand.set(jkfToPieceType(kind), b);
              const w = jkf.initial.data.hands[1][kind] || 0;
              position.whiteHand.set(jkfToPieceType(kind), w);
            }
          }
          break;
        default:
          return new Error("initial position preset not supported: " + jkf.initial.preset);
      }
    }

    const record = new Record(position);

    Object.entries(jkf.header).forEach(([key, value]) => {
      const metadataKey = kakinokiToMetadataKey(key);
      if (metadataKey) {
        record.metadata.setStandardMetadata(metadataKey, value);
      } else {
        record.metadata.setCustomMetadata(key, value);
      }
    });

    type StackEntry = { ply: number; moves: JKFMoveWithForksAndInfo[] };
    const stack: StackEntry[] = [{ ply: 0, moves: jkf.moves }];
    while (stack.length > 0) {
      const entry = stack.pop() as StackEntry;
      record.goto(entry.ply);
      for (const m of entry.moves) {
        const ply = record.current.ply;
        if (m.move) {
          let from: Square | PieceType;
          if (m.move.from) {
            from = new Square(m.move.from.x, m.move.from.y);
          } else if (m.move.relative && m.move.relative !== "H") {
            return new Error("unnormalized-JKF not supported.");
          } else {
            from = jkfToPieceType(m.move.piece);
          }
          let to: Square;
          if (m.move.to) {
            to = new Square(m.move.to.x, m.move.to.y);
          } else if (m.move.same && record.current.prev?.move instanceof Move) {
            to = record.current.prev.move.to;
          } else {
            return new Error("invalid move: " + JSON.stringify(m.move));
          }
          let move = record.position.createMove(from, to);
          if (!move) {
            return new Error("invalid move: " + JSON.stringify(m.move));
          }
          if (m.move.promote) {
            move = move.withPromote();
          }
          record.append(move, { ignoreValidation: true });
        }
        if (m.special) {
          const move = getSpecialMoveByName(m.special, record.current.nextColor);
          if (move) {
            record.append(move);
          }
        }
        if (m.time) {
          record.current.setElapsedMs(jkfTimeToMs(m.time.now));
        }
        if (m.comments) {
          record.current.comment = m.comments.join("\n");
        }
        if (m.forks) {
          for (let i = m.forks.length - 1; i >= 0; i--) {
            stack.push({ ply: ply, moves: m.forks[i] });
          }
        }
      }
    }
    record.goto(0);
    record.resetAllBranchSelection();
    return record;
  } catch (e) {
    return new Error("failed to  JKF: " + e);
  }
}

function buildJKFMoves(
  node: ImmutableNode | null,
  basePos: ImmutablePosition,
): JKFMoveWithForksAndInfo[] {
  const position = basePos.clone();
  const moves: JKFMoveWithForksAndInfo[] = [];
  for (; node; node = node.next) {
    const entry: JKFMoveWithForksAndInfo = {
      time: {
        now: msToJKFTimeMS(node.elapsedMs),
        total: msToJKFTimeHMS(node.totalElapsedMs),
      },
    };
    if (node.move instanceof Move) {
      const move = node.move;
      entry.move = {
        color: colorToJKF(move.color),
        piece: pieceTypeToJKF(move.pieceType),
        to: {
          x: move.to.file,
          y: move.to.rank,
        },
      };
      if (move.from instanceof Square) {
        entry.move.from = {
          x: move.from.file,
          y: move.from.rank,
        };
        if (node.prev?.move instanceof Move && node.prev.move.to === move.to) {
          entry.move.same = true;
        }
        if (move.promote) {
          entry.move.promote = true;
        } else if (
          isPromotable(move.pieceType) &&
          (isPromotableRank(move.color, move.from.rank) ||
            isPromotableRank(move.color, move.to.rank))
        ) {
          entry.move.promote = false;
        }
        if (move.capturedPieceType) {
          entry.move.capture = pieceTypeToJKF(move.capturedPieceType);
        }
      }
      const relative = getDirectionModifier(move, position)
        .split("")
        .map((s) => {
          return directionModifierToJKF[s] || "";
        })
        .join("");
      if (relative) {
        entry.move.relative = relative;
      }
    } else {
      const command = getCSASpecialMoveName(node.move, reverseColor(node.nextColor));
      if (!command) {
        break;
      }
      entry.special = command as JKFSpecial;
    }
    if (node.comment) {
      entry.comments = node.comment.trimEnd().split("\n");
    }
    if (node.isFirstBranch) {
      const forks: JKFForks = [];
      for (let branch = node.branch; branch; branch = branch.branch) {
        forks.push(buildJKFMoves(branch, position));
      }
      if (forks.length !== 0) {
        entry.forks = forks;
      }
    }
    moves.push(entry);
    if (node.move instanceof Move) {
      position.doMove(node.move, { ignoreValidation: true });
    }
  }
  return moves;
}

/**
 * JSON棋譜フォーマットの文字列を出力します。
 * @param record
 */
export function exportJKFString(record: ImmutableRecord): string {
  return JSON.stringify(exportJKF(record));
}

/**
 * JSON棋譜フォーマットのオブジェクトを出力します。
 * @param record
 */
export function exportJKF(record: ImmutableRecord): JKF {
  const header: { [key: string]: string } = {};
  for (const key of record.metadata.standardMetadataKeys) {
    const value = record.metadata.getStandardMetadata(key);
    if (value) {
      header[metadataKeyToKakinoki(key)] = value;
    }
  }
  for (const key of record.metadata.customMetadataKeys) {
    const value = record.metadata.getCustomMetadata(key);
    if (value) {
      header[key] = value;
    }
  }

  let initial: JKFInitial;
  const blackHand = record.initialPosition.blackHand;
  const whiteHand = record.initialPosition.whiteHand;
  switch (record.initialPosition.sfen) {
    case InitialPositionSFEN.STANDARD:
      initial = { preset: "HIRATE" };
      break;
    case InitialPositionSFEN.HANDICAP_LANCE:
      initial = { preset: "KY" };
      break;
    case InitialPositionSFEN.HANDICAP_RIGHT_LANCE:
      initial = { preset: "KY_R" };
      break;
    case InitialPositionSFEN.HANDICAP_BISHOP:
      initial = { preset: "KA" };
      break;
    case InitialPositionSFEN.HANDICAP_ROOK:
      initial = { preset: "HI" };
      break;
    case InitialPositionSFEN.HANDICAP_ROOK_LANCE:
      initial = { preset: "HIKY" };
      break;
    case InitialPositionSFEN.HANDICAP_2PIECES:
      initial = { preset: "2" };
      break;
    case InitialPositionSFEN.HANDICAP_4PIECES:
      initial = { preset: "4" };
      break;
    case InitialPositionSFEN.HANDICAP_6PIECES:
      initial = { preset: "6" };
      break;
    case InitialPositionSFEN.HANDICAP_8PIECES:
      initial = { preset: "8" };
      break;
    case InitialPositionSFEN.HANDICAP_10PIECES:
      initial = { preset: "10" };
      break;
    default:
      initial = {
        preset: "OTHER",
        data: {
          color: colorToJKF(record.initialPosition.color),
          board: (function () {
            const board: JKFSquare[][] = [[], [], [], [], [], [], [], [], []];
            for (let x = 1; x <= 9; x++) {
              for (let y = 1; y <= 9; y++) {
                const square = new Square(x, y);
                const piece = record.initialPosition.board.at(square);
                board[x - 1][y - 1] = piece
                  ? {
                      color: colorToJKF(piece.color),
                      kind: pieceTypeToJKF(piece.type),
                    }
                  : {};
              }
            }
            return board;
          })(),
          hands: [
            {
              FU: blackHand.count(PieceType.PAWN),
              KY: blackHand.count(PieceType.LANCE),
              KE: blackHand.count(PieceType.KNIGHT),
              GI: blackHand.count(PieceType.SILVER),
              KI: blackHand.count(PieceType.GOLD),
              KA: blackHand.count(PieceType.BISHOP),
              HI: blackHand.count(PieceType.ROOK),
            },
            {
              FU: whiteHand.count(PieceType.PAWN),
              KY: whiteHand.count(PieceType.LANCE),
              KE: whiteHand.count(PieceType.KNIGHT),
              GI: whiteHand.count(PieceType.SILVER),
              KI: whiteHand.count(PieceType.GOLD),
              KA: whiteHand.count(PieceType.BISHOP),
              HI: whiteHand.count(PieceType.ROOK),
            },
          ],
        },
      };
      break;
  }

  const moves: JKFMoveWithForksAndInfo[] = [
    record.first.comment ? { comments: record.first.comment.trimEnd().split("\n") } : {},
    ...(record.first.next ? buildJKFMoves(record.first.next, record.initialPosition) : []),
  ];

  return {
    header,
    initial,
    moves,
  };
}
