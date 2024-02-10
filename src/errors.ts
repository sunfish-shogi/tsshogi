export class InvalidPieceNameError extends Error {
  constructor(public data: string) {
    super(`Invalid piece name: ${data}`);
    this.name = "InvalidPieceNameError";
  }
}

export class InvalidTurnError extends Error {
  constructor(public data: string) {
    super(`Invalid turn: ${data}`);
    this.name = "InvalidTurnError";
  }
}

export class InvalidMoveError extends Error {
  constructor(public data: string) {
    super(`Invalid move: ${data}`);
    this.name = "InvalidMoveError";
  }
}

export class InvalidMoveNumberError extends Error {
  constructor(public data: string) {
    super(`Invalid move number: ${data}`);
    this.name = "InvalidMoveNumberError";
  }
}

export class InvalidDestinationError extends Error {
  constructor(public data: string) {
    super(`Invalid destination: ${data}`);
    this.name = "InvalidDestinationError";
  }
}

export class PieceNotExistsError extends Error {
  constructor(public data: string) {
    super(`Piece not exists: ${data}`);
    this.name = "PieceNotExistsError";
  }
}

export class InvalidLineError extends Error {
  constructor(public data: string) {
    super(`Invalid line: ${data}`);
    this.name = "InvalidLineError";
  }
}

/**
 * @deprecated
 */
export class InvalidHandicapError extends Error {
  constructor(public data: string) {
    super(`Invalid handicap: ${data}`);
    this.name = "InvalidHandicapError";
  }
}

export class InvalidBoardError extends Error {
  constructor(public data: string) {
    super(`Invalid board: ${data}`);
    this.name = "InvalidBoardError";
  }
}

export class InvalidHandPieceError extends Error {
  constructor(public data: string) {
    super(`Invalid hand piece: ${data}`);
    this.name = "InvalidHandPieceError";
  }
}

export class InvalidUSIError extends Error {
  constructor(public data: string) {
    super(`Invalid USI: ${data}`);
    this.name = "InvalidUSIError";
  }
}
