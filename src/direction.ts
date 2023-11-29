import { Piece } from "./piece";

export enum Direction {
  UP = "up",
  DOWN = "down",
  LEFT = "left",
  RIGHT = "right",
  LEFT_UP = "left_up",
  RIGHT_UP = "right_up",
  LEFT_DOWN = "left_down",
  RIGHT_DOWN = "right_down",
  LEFT_UP_KNIGHT = "left_up_knight",
  RIGHT_UP_KNIGHT = "right_up_knight",
  LEFT_DOWN_KNIGHT = "left_down_knight",
  RIGHT_DOWN_KNIGHT = "right_down_knight",
}

const reverseMap = {
  up: Direction.DOWN,
  down: Direction.UP,
  left: Direction.RIGHT,
  right: Direction.LEFT,
  left_up: Direction.RIGHT_DOWN,
  right_up: Direction.LEFT_DOWN,
  left_down: Direction.RIGHT_UP,
  right_down: Direction.LEFT_UP,
  left_up_knight: Direction.RIGHT_DOWN_KNIGHT,
  right_up_knight: Direction.LEFT_DOWN_KNIGHT,
  left_down_knight: Direction.RIGHT_UP_KNIGHT,
  right_down_knight: Direction.LEFT_UP_KNIGHT,
};

export function reverseDirection(dir: Direction): Direction {
  return reverseMap[dir];
}

export const directions = [
  Direction.UP,
  Direction.DOWN,
  Direction.LEFT,
  Direction.RIGHT,
  Direction.LEFT_UP,
  Direction.RIGHT_UP,
  Direction.LEFT_DOWN,
  Direction.RIGHT_DOWN,
  Direction.LEFT_UP_KNIGHT,
  Direction.RIGHT_UP_KNIGHT,
  Direction.LEFT_DOWN_KNIGHT,
  Direction.RIGHT_DOWN_KNIGHT,
];

export enum MoveType {
  SHORT = "short",
  LONG = "long",
}

const movableDirectionMap: {
  [color: string]: {
    [pieceType: string]: { [direction: string]: MoveType | undefined };
  };
} = {
  black: {
    pawn: { up: MoveType.SHORT },
    lance: { up: MoveType.LONG },
    knight: { left_up_knight: MoveType.SHORT, right_up_knight: MoveType.SHORT },
    silver: {
      left_up: MoveType.SHORT,
      up: MoveType.SHORT,
      right_up: MoveType.SHORT,
      left_down: MoveType.SHORT,
      right_down: MoveType.SHORT,
    },
    gold: {
      left_up: MoveType.SHORT,
      up: MoveType.SHORT,
      right_up: MoveType.SHORT,
      left: MoveType.SHORT,
      right: MoveType.SHORT,
      down: MoveType.SHORT,
    },
    bishop: {
      left_up: MoveType.LONG,
      right_up: MoveType.LONG,
      left_down: MoveType.LONG,
      right_down: MoveType.LONG,
    },
    rook: {
      up: MoveType.LONG,
      left: MoveType.LONG,
      right: MoveType.LONG,
      down: MoveType.LONG,
    },
    king: {
      left_down: MoveType.SHORT,
      right_down: MoveType.SHORT,
      left_up: MoveType.SHORT,
      right_up: MoveType.SHORT,
      down: MoveType.SHORT,
      left: MoveType.SHORT,
      right: MoveType.SHORT,
      up: MoveType.SHORT,
    },
    promPawn: {
      left_up: MoveType.SHORT,
      up: MoveType.SHORT,
      right_up: MoveType.SHORT,
      left: MoveType.SHORT,
      right: MoveType.SHORT,
      down: MoveType.SHORT,
    },
    promLance: {
      left_up: MoveType.SHORT,
      up: MoveType.SHORT,
      right_up: MoveType.SHORT,
      left: MoveType.SHORT,
      right: MoveType.SHORT,
      down: MoveType.SHORT,
    },
    promKnight: {
      left_up: MoveType.SHORT,
      up: MoveType.SHORT,
      right_up: MoveType.SHORT,
      left: MoveType.SHORT,
      right: MoveType.SHORT,
      down: MoveType.SHORT,
    },
    promSilver: {
      left_up: MoveType.SHORT,
      up: MoveType.SHORT,
      right_up: MoveType.SHORT,
      left: MoveType.SHORT,
      right: MoveType.SHORT,
      down: MoveType.SHORT,
    },
    horse: {
      left_up: MoveType.LONG,
      right_up: MoveType.LONG,
      left_down: MoveType.LONG,
      right_down: MoveType.LONG,
      up: MoveType.SHORT,
      left: MoveType.SHORT,
      right: MoveType.SHORT,
      down: MoveType.SHORT,
    },
    dragon: {
      up: MoveType.LONG,
      left: MoveType.LONG,
      right: MoveType.LONG,
      down: MoveType.LONG,
      left_up: MoveType.SHORT,
      right_up: MoveType.SHORT,
      left_down: MoveType.SHORT,
      right_down: MoveType.SHORT,
    },
  },
  white: {
    pawn: { down: MoveType.SHORT },
    lance: { down: MoveType.LONG },
    knight: {
      left_down_knight: MoveType.SHORT,
      right_down_knight: MoveType.SHORT,
    },
    silver: {
      left_down: MoveType.SHORT,
      down: MoveType.SHORT,
      right_down: MoveType.SHORT,
      left_up: MoveType.SHORT,
      right_up: MoveType.SHORT,
    },
    gold: {
      left_down: MoveType.SHORT,
      down: MoveType.SHORT,
      right_down: MoveType.SHORT,
      left: MoveType.SHORT,
      right: MoveType.SHORT,
      up: MoveType.SHORT,
    },
    bishop: {
      left_down: MoveType.LONG,
      right_down: MoveType.LONG,
      left_up: MoveType.LONG,
      right_up: MoveType.LONG,
    },
    rook: {
      down: MoveType.LONG,
      left: MoveType.LONG,
      right: MoveType.LONG,
      up: MoveType.LONG,
    },
    king: {
      left_down: MoveType.SHORT,
      right_down: MoveType.SHORT,
      left_up: MoveType.SHORT,
      right_up: MoveType.SHORT,
      down: MoveType.SHORT,
      left: MoveType.SHORT,
      right: MoveType.SHORT,
      up: MoveType.SHORT,
    },
    promPawn: {
      left_down: MoveType.SHORT,
      down: MoveType.SHORT,
      right_down: MoveType.SHORT,
      left: MoveType.SHORT,
      right: MoveType.SHORT,
      up: MoveType.SHORT,
    },
    promLance: {
      left_down: MoveType.SHORT,
      down: MoveType.SHORT,
      right_down: MoveType.SHORT,
      left: MoveType.SHORT,
      right: MoveType.SHORT,
      up: MoveType.SHORT,
    },
    promKnight: {
      left_down: MoveType.SHORT,
      down: MoveType.SHORT,
      right_down: MoveType.SHORT,
      left: MoveType.SHORT,
      right: MoveType.SHORT,
      up: MoveType.SHORT,
    },
    promSilver: {
      left_down: MoveType.SHORT,
      down: MoveType.SHORT,
      right_down: MoveType.SHORT,
      left: MoveType.SHORT,
      right: MoveType.SHORT,
      up: MoveType.SHORT,
    },
    horse: {
      left_down: MoveType.LONG,
      right_down: MoveType.LONG,
      left_up: MoveType.LONG,
      right_up: MoveType.LONG,
      down: MoveType.SHORT,
      left: MoveType.SHORT,
      right: MoveType.SHORT,
      up: MoveType.SHORT,
    },
    dragon: {
      down: MoveType.LONG,
      left: MoveType.LONG,
      right: MoveType.LONG,
      up: MoveType.LONG,
      left_down: MoveType.SHORT,
      right_down: MoveType.SHORT,
      left_up: MoveType.SHORT,
      right_up: MoveType.SHORT,
    },
  },
};

export function movableDirections(piece: Piece): Direction[] {
  return Object.keys(movableDirectionMap[piece.color as string][piece.type]) as Direction[];
}

export function resolveMoveType(piece: Piece, direction: Direction): MoveType | undefined {
  return movableDirectionMap[piece.color as string][piece.type][direction];
}

export const directionToDeltaMap: {
  [direction: string]: { x: number; y: number };
} = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
  left_up: { x: -1, y: -1 },
  right_up: { x: 1, y: -1 },
  left_down: { x: -1, y: 1 },
  right_down: { x: 1, y: 1 },
  left_up_knight: { x: -1, y: -2 },
  right_up_knight: { x: 1, y: -2 },
  left_down_knight: { x: -1, y: 2 },
  right_down_knight: { x: 1, y: 2 },
};

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
    return { direction: "" as Direction, distance: 0, ok: false };
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
  return { direction: "" as Direction, distance: 0, ok: false };
}

export enum VDirection {
  UP = "up",
  NONE = "none",
  DOWN = "down",
}

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
  LEFT = "left",
  NONE = "none",
  RIGHT = "right",
}

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
