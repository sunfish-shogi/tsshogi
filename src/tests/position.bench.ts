import { bench } from "vitest";
import { Position } from "../position";
import { Square } from "../square";
import { Move } from "../move";
import { PieceType } from "../piece";

describe("position", () => {
  const position1 = Position.newBySFEN(
    "l+Rsg2snl/4k1g2/p1+Nppp2p/5l3/9/1pG6/P2PPPP1P/1B2K2+r1/L1S2G3 b BN3Psn3p 45",
  ) as Position;
  const validMove1 = position1.createMove(new Square(4, 9), new Square(4, 8)) as Move; // valid
  const validMove2 = position1.createMove(PieceType.KNIGHT, new Square(4, 8)) as Move; // valid
  const invalidMove1 = position1.createMove(new Square(4, 9), new Square(5, 9)) as Move; // invalid

  const position2 = Position.newBySFEN(
    "l3kg1nl/3sg4/p2p1s1pp/4p1p2/2Pn1SPP1/1rl6/P1BPPP2P/1SKG5/LN1G3NR w B3Pp 42",
  ) as Position;

  bench("isValidMove", () => {
    position1.isValidMove(validMove1);
    position1.isValidMove(validMove2);
    position1.isValidMove(invalidMove1);
  });

  bench("doMove", () => {
    position1.doMove(validMove1);
    position1.undoMove(validMove1);
    position1.doMove(validMove2);
    position1.undoMove(validMove2);
    position1.doMove(invalidMove1);
  });

  bench("new Position", () => {
    new Position();
  });

  bench("newBySFEN", () => {
    Position.newBySFEN(
      "l+Rsg2snl/4k1g2/p1+Nppp2p/5l3/9/1pG6/P2PPPP1P/1B2K2+r1/L1S2G3 b BN3Psn3p 45",
    );
  });

  bench("listAttackers", () => {
    position1.listAttackers(new Square(5, 5));
    position2.listAttackers(new Square(7, 7));
  });
});
