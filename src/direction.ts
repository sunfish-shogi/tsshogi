import { Color } from "./color";
import { Piece, PieceType } from "./piece";

export enum Direction {
  UP = 0,
  DOWN = 1,
  LEFT = 2,
  RIGHT = 3,
  LEFT_UP = 4,
  RIGHT_UP = 5,
  LEFT_DOWN = 6,
  RIGHT_DOWN = 7,
  LEFT_UP_KNIGHT = 8,
  RIGHT_UP_KNIGHT = 9,
  LEFT_DOWN_KNIGHT = 10,
  RIGHT_DOWN_KNIGHT = 11,
}

// 反転方向テーブル (index = Direction)
const REVERSE_DIR: Direction[] = [
  Direction.DOWN,              // UP → DOWN
  Direction.UP,                // DOWN → UP
  Direction.RIGHT,             // LEFT → RIGHT
  Direction.LEFT,              // RIGHT → LEFT
  Direction.RIGHT_DOWN,        // LEFT_UP → RIGHT_DOWN
  Direction.LEFT_DOWN,         // RIGHT_UP → LEFT_DOWN
  Direction.RIGHT_UP,          // LEFT_DOWN → RIGHT_UP
  Direction.LEFT_UP,           // RIGHT_DOWN → LEFT_UP
  Direction.RIGHT_DOWN_KNIGHT, // LEFT_UP_KNIGHT → RIGHT_DOWN_KNIGHT
  Direction.LEFT_DOWN_KNIGHT,  // RIGHT_UP_KNIGHT → LEFT_DOWN_KNIGHT
  Direction.RIGHT_UP_KNIGHT,   // LEFT_DOWN_KNIGHT → RIGHT_UP_KNIGHT
  Direction.LEFT_UP_KNIGHT,    // RIGHT_DOWN_KNIGHT → LEFT_UP_KNIGHT
];

/**
 * 反転した方向を返します。
 * @param dir
 */
export function reverseDirection(dir: Direction): Direction {
  return REVERSE_DIR[dir];
}

export const directions: Direction[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] as const;

export enum MoveType {
  SHORT = 1,
  LONG = 2,
}

// 移動可能テーブル: [(color-1) * 14 * 12 + pieceType * 12 + direction] = 0(不可) | MoveType
// Color: BLACK=1, WHITE=2 / PieceType: 0-13 / Direction: 0-11
const movableTable = new Uint8Array(2 * 14 * 12);

function setMoves(
  color: Color,
  pieceType: PieceType,
  moves: [Direction, MoveType][],
): void {
  const base = ((color - 1) * 14 + pieceType) * 12;
  for (const [dir, moveType] of moves) {
    movableTable[base + dir] = moveType;
  }
}

// 先手
setMoves(Color.BLACK, PieceType.PAWN, [
  [Direction.UP, MoveType.SHORT],
]);
setMoves(Color.BLACK, PieceType.LANCE, [
  [Direction.UP, MoveType.LONG],
]);
setMoves(Color.BLACK, PieceType.KNIGHT, [
  [Direction.LEFT_UP_KNIGHT, MoveType.SHORT],
  [Direction.RIGHT_UP_KNIGHT, MoveType.SHORT],
]);
setMoves(Color.BLACK, PieceType.SILVER, [
  [Direction.LEFT_UP, MoveType.SHORT],
  [Direction.UP, MoveType.SHORT],
  [Direction.RIGHT_UP, MoveType.SHORT],
  [Direction.LEFT_DOWN, MoveType.SHORT],
  [Direction.RIGHT_DOWN, MoveType.SHORT],
]);
const goldMoves: [Direction, MoveType][] = [
  [Direction.LEFT_UP, MoveType.SHORT],
  [Direction.UP, MoveType.SHORT],
  [Direction.RIGHT_UP, MoveType.SHORT],
  [Direction.LEFT, MoveType.SHORT],
  [Direction.RIGHT, MoveType.SHORT],
  [Direction.DOWN, MoveType.SHORT],
];
setMoves(Color.BLACK, PieceType.GOLD, goldMoves);
setMoves(Color.BLACK, PieceType.BISHOP, [
  [Direction.LEFT_UP, MoveType.LONG],
  [Direction.RIGHT_UP, MoveType.LONG],
  [Direction.LEFT_DOWN, MoveType.LONG],
  [Direction.RIGHT_DOWN, MoveType.LONG],
]);
setMoves(Color.BLACK, PieceType.ROOK, [
  [Direction.UP, MoveType.LONG],
  [Direction.LEFT, MoveType.LONG],
  [Direction.RIGHT, MoveType.LONG],
  [Direction.DOWN, MoveType.LONG],
]);
setMoves(Color.BLACK, PieceType.KING, [
  [Direction.LEFT_DOWN, MoveType.SHORT],
  [Direction.RIGHT_DOWN, MoveType.SHORT],
  [Direction.LEFT_UP, MoveType.SHORT],
  [Direction.RIGHT_UP, MoveType.SHORT],
  [Direction.DOWN, MoveType.SHORT],
  [Direction.LEFT, MoveType.SHORT],
  [Direction.RIGHT, MoveType.SHORT],
  [Direction.UP, MoveType.SHORT],
]);
setMoves(Color.BLACK, PieceType.PROM_PAWN, goldMoves);
setMoves(Color.BLACK, PieceType.PROM_LANCE, goldMoves);
setMoves(Color.BLACK, PieceType.PROM_KNIGHT, goldMoves);
setMoves(Color.BLACK, PieceType.PROM_SILVER, goldMoves);
setMoves(Color.BLACK, PieceType.HORSE, [
  [Direction.LEFT_UP, MoveType.LONG],
  [Direction.RIGHT_UP, MoveType.LONG],
  [Direction.LEFT_DOWN, MoveType.LONG],
  [Direction.RIGHT_DOWN, MoveType.LONG],
  [Direction.UP, MoveType.SHORT],
  [Direction.LEFT, MoveType.SHORT],
  [Direction.RIGHT, MoveType.SHORT],
  [Direction.DOWN, MoveType.SHORT],
]);
setMoves(Color.BLACK, PieceType.DRAGON, [
  [Direction.UP, MoveType.LONG],
  [Direction.LEFT, MoveType.LONG],
  [Direction.RIGHT, MoveType.LONG],
  [Direction.DOWN, MoveType.LONG],
  [Direction.LEFT_UP, MoveType.SHORT],
  [Direction.RIGHT_UP, MoveType.SHORT],
  [Direction.LEFT_DOWN, MoveType.SHORT],
  [Direction.RIGHT_DOWN, MoveType.SHORT],
]);

// 後手
setMoves(Color.WHITE, PieceType.PAWN, [
  [Direction.DOWN, MoveType.SHORT],
]);
setMoves(Color.WHITE, PieceType.LANCE, [
  [Direction.DOWN, MoveType.LONG],
]);
setMoves(Color.WHITE, PieceType.KNIGHT, [
  [Direction.LEFT_DOWN_KNIGHT, MoveType.SHORT],
  [Direction.RIGHT_DOWN_KNIGHT, MoveType.SHORT],
]);
setMoves(Color.WHITE, PieceType.SILVER, [
  [Direction.LEFT_DOWN, MoveType.SHORT],
  [Direction.DOWN, MoveType.SHORT],
  [Direction.RIGHT_DOWN, MoveType.SHORT],
  [Direction.LEFT_UP, MoveType.SHORT],
  [Direction.RIGHT_UP, MoveType.SHORT],
]);
const goldMovesWhite: [Direction, MoveType][] = [
  [Direction.LEFT_DOWN, MoveType.SHORT],
  [Direction.DOWN, MoveType.SHORT],
  [Direction.RIGHT_DOWN, MoveType.SHORT],
  [Direction.LEFT, MoveType.SHORT],
  [Direction.RIGHT, MoveType.SHORT],
  [Direction.UP, MoveType.SHORT],
];
setMoves(Color.WHITE, PieceType.GOLD, goldMovesWhite);
setMoves(Color.WHITE, PieceType.BISHOP, [
  [Direction.LEFT_DOWN, MoveType.LONG],
  [Direction.RIGHT_DOWN, MoveType.LONG],
  [Direction.LEFT_UP, MoveType.LONG],
  [Direction.RIGHT_UP, MoveType.LONG],
]);
setMoves(Color.WHITE, PieceType.ROOK, [
  [Direction.DOWN, MoveType.LONG],
  [Direction.LEFT, MoveType.LONG],
  [Direction.RIGHT, MoveType.LONG],
  [Direction.UP, MoveType.LONG],
]);
setMoves(Color.WHITE, PieceType.KING, [
  [Direction.LEFT_DOWN, MoveType.SHORT],
  [Direction.RIGHT_DOWN, MoveType.SHORT],
  [Direction.LEFT_UP, MoveType.SHORT],
  [Direction.RIGHT_UP, MoveType.SHORT],
  [Direction.DOWN, MoveType.SHORT],
  [Direction.LEFT, MoveType.SHORT],
  [Direction.RIGHT, MoveType.SHORT],
  [Direction.UP, MoveType.SHORT],
]);
setMoves(Color.WHITE, PieceType.PROM_PAWN, goldMovesWhite);
setMoves(Color.WHITE, PieceType.PROM_LANCE, goldMovesWhite);
setMoves(Color.WHITE, PieceType.PROM_KNIGHT, goldMovesWhite);
setMoves(Color.WHITE, PieceType.PROM_SILVER, goldMovesWhite);
setMoves(Color.WHITE, PieceType.HORSE, [
  [Direction.LEFT_DOWN, MoveType.LONG],
  [Direction.RIGHT_DOWN, MoveType.LONG],
  [Direction.LEFT_UP, MoveType.LONG],
  [Direction.RIGHT_UP, MoveType.LONG],
  [Direction.DOWN, MoveType.SHORT],
  [Direction.LEFT, MoveType.SHORT],
  [Direction.RIGHT, MoveType.SHORT],
  [Direction.UP, MoveType.SHORT],
]);
setMoves(Color.WHITE, PieceType.DRAGON, [
  [Direction.DOWN, MoveType.LONG],
  [Direction.LEFT, MoveType.LONG],
  [Direction.RIGHT, MoveType.LONG],
  [Direction.UP, MoveType.LONG],
  [Direction.LEFT_DOWN, MoveType.SHORT],
  [Direction.RIGHT_DOWN, MoveType.SHORT],
  [Direction.LEFT_UP, MoveType.SHORT],
  [Direction.RIGHT_UP, MoveType.SHORT],
]);

/**
 * 指定した駒の移動可能な方向を返します。
 * @param piece
 */
export function movableDirections(piece: Piece): Direction[] {
  const base = ((piece.color - 1) * 14 + piece.type) * 12;
  const result: Direction[] = [];
  for (let d = 0; d < 12; d++) {
    if (movableTable[base + d]) result.push(d as Direction);
  }
  return result;
}

/**
 * 指定した駒と方向に対して、1マスのみ移動可能か遠距離移動可能かを返します。
 * @param piece
 * @param direction
 */
export function resolveMoveType(piece: Piece, direction: Direction): MoveType | undefined {
  const v = movableTable[((piece.color - 1) * 14 + piece.type) * 12 + direction];
  return v || undefined;
}

// 方向ベクトル (index = Direction) → { x, y }
export const directionToDeltaMap: { x: number; y: number }[] = [
  { x: 0, y: -1 },   // UP (0)
  { x: 0, y: 1 },    // DOWN (1)
  { x: -1, y: 0 },   // LEFT (2)
  { x: 1, y: 0 },    // RIGHT (3)
  { x: -1, y: -1 },  // LEFT_UP (4)
  { x: 1, y: -1 },   // RIGHT_UP (5)
  { x: -1, y: 1 },   // LEFT_DOWN (6)
  { x: 1, y: 1 },    // RIGHT_DOWN (7)
  { x: -1, y: -2 },  // LEFT_UP_KNIGHT (8)
  { x: 1, y: -2 },   // RIGHT_UP_KNIGHT (9)
  { x: -1, y: 2 },   // LEFT_DOWN_KNIGHT (10)
  { x: 1, y: 2 },    // RIGHT_DOWN_KNIGHT (11)
];

/**
 * ベクトルを方向と距離に変換します。
 * @param x
 * @param y
 */
export function vectorToDirectionAndDistance(
  x: number,
  y: number,
): {
  direction: Direction;
  distance: number;
  ok: boolean;
} {
  if (x === 1 && y === -2) {
    return { direction: Direction.RIGHT_UP_KNIGHT, distance: 1, ok: true };
  }
  if (x === -1 && y === -2) {
    return { direction: Direction.LEFT_UP_KNIGHT, distance: 1, ok: true };
  }
  if (x === 1 && y === 2) {
    return { direction: Direction.RIGHT_DOWN_KNIGHT, distance: 1, ok: true };
  }
  if (x === -1 && y === 2) {
    return { direction: Direction.LEFT_DOWN_KNIGHT, distance: 1, ok: true };
  }
  if (x !== 0 && y !== 0 && Math.abs(x) !== Math.abs(y)) {
    return { direction: Direction.UP, distance: 0, ok: false };
  }
  let dx = x;
  let dy = y;
  let distance = 0;
  if (dx !== 0) {
    distance = Math.abs(dx);
    dx /= distance;
  }
  if (dy !== 0) {
    distance = Math.abs(dy);
    dy /= distance;
  }
  if (dx === -1 && dy === -1) {
    return { direction: Direction.LEFT_UP, distance, ok: true };
  }
  if (dx === 0 && dy === -1) {
    return { direction: Direction.UP, distance, ok: true };
  }
  if (dx === 1 && dy === -1) {
    return { direction: Direction.RIGHT_UP, distance, ok: true };
  }
  if (dx === -1 && dy === 0) {
    return { direction: Direction.LEFT, distance, ok: true };
  }
  if (dx === 1 && dy === 0) {
    return { direction: Direction.RIGHT, distance, ok: true };
  }
  if (dx === -1 && dy === 1) {
    return { direction: Direction.LEFT_DOWN, distance, ok: true };
  }
  if (dx === 0 && dy === 1) {
    return { direction: Direction.DOWN, distance, ok: true };
  }
  if (dx === 1 && dy === 1) {
    return { direction: Direction.RIGHT_DOWN, distance, ok: true };
  }
  return { direction: Direction.UP, distance: 0, ok: false };
}

export enum VDirection {
  UP = 0,
  NONE = 1,
  DOWN = 2,
}

/**
 * 垂直方向の動きを取り出します。
 * @param direction
 */
export function directionToVDirection(direction: Direction): VDirection {
  switch (direction) {
    case Direction.UP:
    case Direction.LEFT_UP:
    case Direction.RIGHT_UP:
    case Direction.LEFT_UP_KNIGHT:
    case Direction.RIGHT_UP_KNIGHT:
      return VDirection.UP;
    case Direction.DOWN:
    case Direction.LEFT_DOWN:
    case Direction.RIGHT_DOWN:
    case Direction.LEFT_DOWN_KNIGHT:
    case Direction.RIGHT_DOWN_KNIGHT:
      return VDirection.DOWN;
    default:
      return VDirection.NONE;
  }
}

export enum HDirection {
  LEFT = 0,
  NONE = 1,
  RIGHT = 2,
}

/**
 * 水平方向の動きを取り出します。
 * @param direction
 */
export function directionToHDirection(direction: Direction): HDirection {
  switch (direction) {
    case Direction.LEFT:
    case Direction.LEFT_UP:
    case Direction.LEFT_DOWN:
    case Direction.LEFT_UP_KNIGHT:
    case Direction.LEFT_DOWN_KNIGHT:
      return HDirection.LEFT;
    case Direction.RIGHT:
    case Direction.RIGHT_UP:
    case Direction.RIGHT_DOWN:
    case Direction.RIGHT_UP_KNIGHT:
    case Direction.RIGHT_DOWN_KNIGHT:
      return HDirection.RIGHT;
    default:
      return HDirection.NONE;
  }
}
