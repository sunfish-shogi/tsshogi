import { bench } from "vitest";
import { Position } from "../position";
import { squareNeighbor, SQ_11, SQ_48, SQ_49, SQ_55, SQ_59, SQ_77, SQ_99 } from "../square";
import { Move } from "../move";
import { Piece, PieceType } from "../piece";
import { Color } from "../color";
import { Direction } from "../direction";

const BENCH_OPTS = { iterations: 5, warmupIterations: 1 };

describe("position", () => {
  const position1 = Position.newBySFEN(
    "l+Rsg2snl/4k1g2/p1+Nppp2p/5l3/9/1pG6/P2PPPP1P/1B2K2+r1/L1S2G3 b BN3Psn3p 45",
  ) as Position;
  const validMove1 = position1.createMove(SQ_49, SQ_48) as Move; // valid
  const validMove2 = position1.createDropMove(PieceType.KNIGHT, SQ_48) as Move; // valid
  const invalidMove1 = position1.createMove(
    SQ_49,
    SQ_59,
  ) as Move; // invalid

  const position2 = Position.newBySFEN(
    "l3kg1nl/3sg4/p2p1s1pp/4p1p2/2Pn1SPP1/1rl6/P1BPPP2P/1SKG5/LN1G3NR w B3Pp 42",
  ) as Position;

  bench("isValidMove", () => {
    position1.isValidMove(validMove1);
    position1.isValidMove(validMove2);
    position1.isValidMove(invalidMove1);
  }, BENCH_OPTS);

  bench("doMove", () => {
    position1.doMove(validMove1);
    position1.undoMove(validMove1);
    position1.doMove(validMove2);
    position1.undoMove(validMove2);
    position1.doMove(invalidMove1);
  }, BENCH_OPTS);

  bench("new Position", () => {
    new Position();
  }, BENCH_OPTS);

  bench("newBySFEN", () => {
    Position.newBySFEN(
      "l+Rsg2snl/4k1g2/p1+Nppp2p/5l3/9/1pG6/P2PPPP1P/1B2K2+r1/L1S2G3 b BN3Psn3p 45",
    );
  }, BENCH_OPTS);

  bench("listAttackers", () => {
    position1.listAttackers(SQ_55);
    position2.listAttackers(SQ_77);
  }, BENCH_OPTS);

  bench("Position.clone", () => {
    position1.clone();
  }, BENCH_OPTS);

  bench("Position.sfen", () => {
    position1.sfen;
  }, BENCH_OPTS);

  const blackPawn = new Piece(Color.BLACK, PieceType.PAWN);
  const blackRook = new Piece(Color.BLACK, PieceType.ROOK);
  const blackBishop = new Piece(Color.BLACK, PieceType.BISHOP);

  bench("Piece creation", () => {
    new Piece(Color.BLACK, PieceType.PAWN);
    new Piece(Color.WHITE, PieceType.ROOK);
    new Piece(Color.BLACK, PieceType.KING);
  }, BENCH_OPTS);

  bench("Piece.promoted / unpromoted", () => {
    blackPawn.promoted();
    blackRook.promoted();
    blackBishop.promoted();
    blackPawn.promoted().unpromoted();
  }, BENCH_OPTS);

  bench("Piece.id", () => {
    blackPawn.id;
    blackRook.id;
    blackBishop.id;
  }, BENCH_OPTS);

  bench("Piece.sfen", () => {
    blackPawn.sfen;
    blackRook.sfen;
    blackBishop.sfen;
  }, BENCH_OPTS);

  const sq55 = SQ_55;
  const sq11 = SQ_11;
  const sq99 = SQ_99;

  bench("squareNeighbor (8方向)", () => {
    squareNeighbor(sq55, Direction.UP);
    squareNeighbor(sq55, Direction.DOWN);
    squareNeighbor(sq55, Direction.LEFT);
    squareNeighbor(sq55, Direction.RIGHT);
    squareNeighbor(sq55, Direction.LEFT_UP);
    squareNeighbor(sq55, Direction.RIGHT_UP);
    squareNeighbor(sq55, Direction.LEFT_DOWN);
    squareNeighbor(sq55, Direction.RIGHT_DOWN);
  }, BENCH_OPTS);

  bench("squareNeighbor (端マス 8方向)", () => {
    squareNeighbor(sq11, Direction.UP);
    squareNeighbor(sq11, Direction.DOWN);
    squareNeighbor(sq11, Direction.LEFT);
    squareNeighbor(sq11, Direction.RIGHT);
    squareNeighbor(sq99, Direction.LEFT_UP);
    squareNeighbor(sq99, Direction.RIGHT_UP);
    squareNeighbor(sq99, Direction.LEFT_DOWN);
    squareNeighbor(sq99, Direction.RIGHT_DOWN);
  }, BENCH_OPTS);

  bench("Board.sfen", () => {
    position1.board.sfen;
    position2.board.sfen;
  }, BENCH_OPTS);

  bench("Board.copyFrom", () => {
    const pos = new Position();
    pos.board.copyFrom(position1.board);
  }, BENCH_OPTS);

  bench("Board.listNonEmptySquares", () => {
    position1.board.listNonEmptySquares();
  }, BENCH_OPTS);

  bench("Board.isChecked", () => {
    position1.board.isChecked(Color.BLACK);
    position2.board.isChecked(Color.WHITE);
  }, BENCH_OPTS);

  bench("Hand.count", () => {
    position1.blackHand.count(PieceType.PAWN);
    position1.blackHand.count(PieceType.ROOK);
    position1.blackHand.count(PieceType.BISHOP);
    position1.whiteHand.count(PieceType.GOLD);
  }, BENCH_OPTS);

  bench("Hand.add / reduce", () => {
    position1.blackHand.add(PieceType.PAWN, 1);
    position1.blackHand.reduce(PieceType.PAWN, 1);
    position1.blackHand.add(PieceType.ROOK, 1);
    position1.blackHand.reduce(PieceType.ROOK, 1);
  }, BENCH_OPTS);

  bench("Hand.formatSFEN", () => {
    position1.blackHand.formatSFEN(Color.BLACK);
    position1.whiteHand.formatSFEN(Color.WHITE);
  }, BENCH_OPTS);
});
