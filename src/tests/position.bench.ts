import { bench } from "vitest";
import { Position } from "../position";
import { Square } from "../square";
import { Move } from "../move";
import { PieceType } from "../piece";

describe("position", () => {
  const position = Position.newBySFEN(
    "l+Rsg2snl/4k1g2/p1+Nppp2p/5l3/9/1pG6/P2PPPP1P/1B2K2+r1/L1S2G3 b BN3Psn3p 45",
  ) as Position;
  const validMove1 = position.createMove(new Square(4, 9), new Square(4, 8)) as Move; // valid
  const validMove2 = position.createMove(PieceType.KNIGHT, new Square(4, 8)) as Move; // valid
  const invalidMove1 = position.createMove(new Square(4, 9), new Square(5, 9)) as Move; // invalid

  bench("isValidMove", () => {
    position.isValidMove(validMove1);
    position.isValidMove(validMove2);
    position.isValidMove(invalidMove1);
  });

  bench("doMove", () => {
    position.doMove(validMove1);
    position.undoMove(validMove1);
    position.doMove(validMove2);
    position.undoMove(validMove2);
    position.doMove(invalidMove1);
  });

  bench("new Position", () => {
    new Position();
  });

  bench("newBySFEN", () => {
    Position.newBySFEN(
      "l+Rsg2snl/4k1g2/p1+Nppp2p/5l3/9/1pG6/P2PPPP1P/1B2K2+r1/L1S2G3 b BN3Psn3p 45",
    );
  });
});
