import { Square } from "../";

describe("square", () => {
  it("getters", () => {
    const square = new Square(3, 8);
    expect(square.file).toBe(3);
    expect(square.rank).toBe(8);
    expect(square.x).toBe(6);
    expect(square.y).toBe(7);
    expect(square.index).toBe(69);
    expect(square.valid).toBeTruthy();
  });

  it("border", () => {
    expect(new Square(1, 4).valid).toBeTruthy();
    expect(new Square(0, 4).valid).toBeFalsy();

    expect(new Square(9, 4).valid).toBeTruthy();
    expect(new Square(10, 4).valid).toBeFalsy();

    expect(new Square(4, 1).valid).toBeTruthy();
    expect(new Square(4, 0).valid).toBeFalsy();

    expect(new Square(4, 9).valid).toBeTruthy();
    expect(new Square(4, 10).valid).toBeFalsy();
  });

  it("neighbor", () => {
    const square = new Square(2, 7);
    expect(square.neighbor(1, 2)).toStrictEqual(new Square(1, 9));
    expect(square.neighbor(-3, -5)).toStrictEqual(new Square(5, 2));
  });

  it("comparison", () => {
    const square = new Square(2, 7);
    expect(square.equals(square)).toBeTruthy();
    expect(square.equals(new Square(2, 7))).toBeTruthy();
    expect(square.equals(new Square(3, 7))).toBeFalsy();
    expect(square.equals(new Square(2, 6))).toBeFalsy();
  });

  it("sfen", () => {
    expect(new Square(1, 6).usi).toBe("1f");
    expect(new Square(2, 7).usi).toBe("2g");
    expect(new Square(3, 8).usi).toBe("3h");
    expect(new Square(4, 9).usi).toBe("4i");
    expect(new Square(5, 1).usi).toBe("5a");
    expect(new Square(6, 2).usi).toBe("6b");
    expect(new Square(7, 3).usi).toBe("7c");
    expect(new Square(8, 4).usi).toBe("8d");
    expect(new Square(9, 5).usi).toBe("9e");

    expect(Square.newByUSI("1e")).toStrictEqual(new Square(1, 5));
    expect(Square.newByUSI("2f")).toStrictEqual(new Square(2, 6));
    expect(Square.newByUSI("3g")).toStrictEqual(new Square(3, 7));
    expect(Square.newByUSI("4h")).toStrictEqual(new Square(4, 8));
    expect(Square.newByUSI("5i")).toStrictEqual(new Square(5, 9));
    expect(Square.newByUSI("6a")).toStrictEqual(new Square(6, 1));
    expect(Square.newByUSI("7b")).toStrictEqual(new Square(7, 2));
    expect(Square.newByUSI("8c")).toStrictEqual(new Square(8, 3));
    expect(Square.newByUSI("9d")).toStrictEqual(new Square(9, 4));

    // sfen is deprecated
    expect(new Square(1, 6).sfen).toBe("1f");
    expect(new Square(2, 7).sfen).toBe("2g");
    expect(new Square(3, 8).sfen).toBe("3h");
    expect(new Square(4, 9).sfen).toBe("4i");
    expect(new Square(5, 1).sfen).toBe("5a");
    expect(new Square(6, 2).sfen).toBe("6b");
    expect(new Square(7, 3).sfen).toBe("7c");
    expect(new Square(8, 4).sfen).toBe("8d");
    expect(new Square(9, 5).sfen).toBe("9e");

    // parseSFENSquare is deprecated
    expect(Square.parseSFENSquare("1e")).toStrictEqual(new Square(1, 5));
    expect(Square.parseSFENSquare("2f")).toStrictEqual(new Square(2, 6));
    expect(Square.parseSFENSquare("3g")).toStrictEqual(new Square(3, 7));
    expect(Square.parseSFENSquare("4h")).toStrictEqual(new Square(4, 8));
    expect(Square.parseSFENSquare("5i")).toStrictEqual(new Square(5, 9));
    expect(Square.parseSFENSquare("6a")).toStrictEqual(new Square(6, 1));
    expect(Square.parseSFENSquare("7b")).toStrictEqual(new Square(7, 2));
    expect(Square.parseSFENSquare("8c")).toStrictEqual(new Square(8, 3));
    expect(Square.parseSFENSquare("9d")).toStrictEqual(new Square(9, 4));
  });

  it("builder", () => {
    expect(Square.newByXY(3, 4)).toStrictEqual(new Square(6, 5));
    expect(Square.newByIndex(67)).toStrictEqual(new Square(5, 8));
  });

  it("static", () => {
    expect(Square.all).toHaveLength(81);
    expect(Square.all[0]).toStrictEqual(new Square(9, 1));
    expect(Square.all[8]).toStrictEqual(new Square(1, 1));
    expect(Square.all[9]).toStrictEqual(new Square(9, 2));
    expect(Square.all[80]).toStrictEqual(new Square(1, 9));
  });
});
