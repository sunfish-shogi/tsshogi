import {
  INVALID_SQUARE,
  parseSFENSquare,
  squareByFileRank,
  squareByUSI,
  squareByXY,
  squareDirectionTo,
  squareFile,
  squareNeighbor,
  squareNeighborDelta,
  squareOpposite,
  squareRank,
  squareSFEN,
  squareUSI,
  squareValid,
  squareX,
  squareY,
  SQ_11,
  SQ_14,
  SQ_15,
  SQ_16,
  SQ_19,
  SQ_26,
  SQ_27,
  SQ_34,
  SQ_37,
  SQ_38,
  SQ_41,
  SQ_48,
  SQ_49,
  SQ_51,
  SQ_52,
  SQ_53,
  SQ_54,
  SQ_55,
  SQ_56,
  SQ_58,
  SQ_59,
  SQ_61,
  SQ_62,
  SQ_65,
  SQ_72,
  SQ_73,
  SQ_76,
  SQ_83,
  SQ_84,
  SQ_91,
  SQ_92,
  SQ_94,
  SQ_95,
} from "../";
import { Direction } from "../direction";

describe("square", () => {
  it("getters", () => {
    const sq = SQ_38;
    expect(squareFile(sq)).toBe(3);
    expect(squareRank(sq)).toBe(8);
    expect(squareX(sq)).toBe(6);
    expect(squareY(sq)).toBe(7);
    expect(sq).toBe(69);
    expect(squareValid(sq)).toBeTruthy();
  });

  it("border", () => {
    expect(squareValid(SQ_14)).toBeTruthy();
    expect(squareValid(squareByFileRank(0, 4))).toBeFalsy();

    expect(squareValid(SQ_94)).toBeTruthy();
    expect(squareValid(squareByFileRank(10, 4))).toBeFalsy();

    expect(squareValid(SQ_41)).toBeTruthy();
    expect(squareValid(squareByFileRank(4, 0))).toBeFalsy();

    expect(squareValid(SQ_49)).toBeTruthy();
    expect(squareValid(squareByFileRank(4, 10))).toBeFalsy();
  });

  it("neighbor (delta)", () => {
    const sq = SQ_27;
    expect(squareNeighborDelta(sq, 1, 2)).toBe(SQ_19);
    expect(squareNeighborDelta(sq, -3, -5)).toBe(SQ_52);
    expect(squareNeighborDelta(sq, 3, 0)).toBe(INVALID_SQUARE);
  });

  it("neighbor (direction)", () => {
    const sq = SQ_55;
    expect(squareNeighbor(sq, Direction.UP)).toBe(SQ_54);
    expect(squareNeighbor(sq, Direction.DOWN)).toBe(SQ_56);
    // 盤外
    expect(squareNeighbor(SQ_11, Direction.UP)).toBe(INVALID_SQUARE);
  });

  it("comparison", () => {
    const sq = SQ_27;
    expect(sq === sq).toBeTruthy();
    expect(sq === SQ_27).toBeTruthy();
    expect(sq === SQ_37).toBeFalsy();
    expect(sq === SQ_26).toBeFalsy();
  });

  it("directionTo", () => {
    const from = SQ_55;
    const to = SQ_53;
    expect(squareDirectionTo(from, to)).toBe(Direction.UP);
  });

  it("opposite", () => {
    const sq = SQ_34;
    expect(squareOpposite(sq)).toBe(SQ_76);
  });

  it("usi", () => {
    expect(squareUSI(SQ_16)).toBe("1f");
    expect(squareUSI(SQ_27)).toBe("2g");
    expect(squareUSI(SQ_38)).toBe("3h");
    expect(squareUSI(SQ_49)).toBe("4i");
    expect(squareUSI(SQ_51)).toBe("5a");
    expect(squareUSI(SQ_62)).toBe("6b");
    expect(squareUSI(SQ_73)).toBe("7c");
    expect(squareUSI(SQ_84)).toBe("8d");
    expect(squareUSI(SQ_95)).toBe("9e");

    expect(squareByUSI("1e")).toBe(SQ_15);
    expect(squareByUSI("2f")).toBe(SQ_26);
    expect(squareByUSI("3g")).toBe(SQ_37);
    expect(squareByUSI("4h")).toBe(SQ_48);
    expect(squareByUSI("5i")).toBe(SQ_59);
    expect(squareByUSI("6a")).toBe(SQ_61);
    expect(squareByUSI("7b")).toBe(SQ_72);
    expect(squareByUSI("8c")).toBe(SQ_83);
    expect(squareByUSI("9d")).toBe(SQ_94);

    // squareSFEN is deprecated
    expect(squareSFEN(SQ_16)).toBe("1f");
    expect(squareSFEN(SQ_49)).toBe("4i");

    // parseSFENSquare is deprecated
    expect(parseSFENSquare("1e")).toBe(SQ_15);
    expect(parseSFENSquare("9d")).toBe(SQ_94);
  });

  it("builder", () => {
    expect(squareByXY(3, 4)).toBe(SQ_65);
    expect(67).toBe(SQ_58);
  });

});
