import {
  Color,
  Move,
  PieceType,
  Position,
  Record,
  SpecialMoveType,
  Square,
  formatMove,
  formatPV,
  formatSpecialMove,
  importKIF,
  parsePV,
  specialMove,
  anySpecialMove,
  parseMoves,
} from "../";

describe("shogi/text", () => {
  it("formatSpecialMove", () => {
    expect(formatSpecialMove(SpecialMoveType.RESIGN)).toBe("投了");
    expect(formatSpecialMove(specialMove(SpecialMoveType.TIMEOUT))).toBe("切れ負け");
    expect(formatSpecialMove(anySpecialMove("休憩"))).toBe("休憩");
  });

  it("formatMove/black", () => {
    const record = importKIF(`
後手の持駒：
  ９ ８ ７ ６ ５ ４ ３ ２ １
+---------------------------+
| ・ ・ ・ ・ ・ ・ ・ ・ ・|一
| ・ 銀 ・ ・ ・ ・ 金 ・ ・|二
| ・ ・ ・ ・ ・ ・ ・ ・ ・|三
| ・ 銀 ・ 銀 ・ 金 ・ 金 ・|四
| ・ ・ ・ ・ ・ ・ ・ ・ ・|五
| 馬 馬 ・vと とvと ・ ・ ・|六
| ・ ・ ・ とvと と ・ ・ ・|七
| 龍 龍 ・ と とvと 桂 ・ 桂|八
| ・ ・ ・ ・ ・ ・ ・ ・ ・|九
+---------------------------+
先手の持駒：金　桂二
先手番`) as Record;
    const position = record.position;
    expect(formatMove(position, position.createMoveByUSI("3b2b") as Move)).toBe("☗２二金");
    expect(formatMove(position, position.createMoveByUSI("3b3c") as Move)).toBe("☗３三金引");
    expect(formatMove(position, position.createMoveByUSI("2d3c") as Move)).toBe("☗３三金右");
    expect(formatMove(position, position.createMoveByUSI("4d3c") as Move)).toBe("☗３三金左");
    expect(formatMove(position, position.createMoveByUSI("G*3c") as Move)).toBe("☗３三金打");
    expect(formatMove(position, position.createMoveByUSI("8b7a") as Move)).toBe("☗７一銀不成");
    expect(formatMove(position, position.createMoveByUSI("8b7a+") as Move)).toBe("☗７一銀成");
    expect(formatMove(position, position.createMoveByUSI("8b7c") as Move)).toBe("☗７三銀引不成");
    expect(formatMove(position, position.createMoveByUSI("8b7c+") as Move)).toBe("☗７三銀引成");
    expect(formatMove(position, position.createMoveByUSI("8d7c") as Move)).toBe("☗７三銀左上不成");
    expect(formatMove(position, position.createMoveByUSI("8d7c+") as Move)).toBe("☗７三銀左上成");
    expect(formatMove(position, position.createMoveByUSI("6d7c") as Move)).toBe("☗７三銀右不成");
    expect(formatMove(position, position.createMoveByUSI("6d7c+") as Move)).toBe("☗７三銀右成");
    expect(formatMove(position, position.createMoveByUSI("6d7e") as Move)).toBe("☗７五銀右");
    expect(formatMove(position, position.createMoveByUSI("1h2f") as Move)).toBe("☗２六桂右");
    expect(formatMove(position, position.createMoveByUSI("3h2f") as Move)).toBe("☗２六桂左");
    expect(formatMove(position, position.createMoveByUSI("N*2f") as Move)).toBe("☗２六桂打");
    expect(formatMove(position, position.createMoveByUSI("N*1f") as Move)).toBe("☗１六桂");
    expect(formatMove(position, position.createMoveByUSI("3h4f") as Move)).toBe("☗４六桂");
    expect(formatMove(position, position.createMoveByUSI("5f5g") as Move)).toBe("☗５七と引");
    expect(formatMove(position, position.createMoveByUSI("5h5g") as Move)).toBe("☗５七と直");
    expect(formatMove(position, position.createMoveByUSI("4g5g") as Move)).toBe("☗５七と右");
    expect(formatMove(position, position.createMoveByUSI("6g5g") as Move)).toBe("☗５七と左寄");
    expect(formatMove(position, position.createMoveByUSI("6h5g") as Move)).toBe("☗５七と左上");
    expect(formatMove(position, position.createMoveByUSI("6g7g") as Move)).toBe("☗７七と寄");
    expect(formatMove(position, position.createMoveByUSI("6h7g") as Move)).toBe("☗７七と上");
    expect(formatMove(position, position.createMoveByUSI("8f8g") as Move)).toBe("☗８七馬右");
    expect(formatMove(position, position.createMoveByUSI("9f8g") as Move)).toBe("☗８七馬左");
    expect(formatMove(position, position.createMoveByUSI("8h8g") as Move)).toBe("☗８七龍右");
    expect(formatMove(position, position.createMoveByUSI("9h8g") as Move)).toBe("☗８七龍左");
    expect(
      formatMove(position, position.createMoveByUSI("9h8g") as Move, {
        lastMove: position.createMoveByUSI("9h8g") as Move,
      }),
    ).toBe("☗同　龍左");
    expect(
      formatMove(position, position.createMoveByUSI("9h8g") as Move, {
        compatible: true,
      }),
    ).toBe("▲８七龍左");
  });

  it("formatMove/white", () => {
    const record = importKIF(`
後手の持駒：
  ９ ８ ７ ６ ５ ４ ３ ２ １
+---------------------------+
| ・ ・ ・ ・ ・ ・ ・ ・ ・|一
| ・ ・v金 ・ ・ ・ ・ ・ ・|二
| ・ ・ ・ ・ ・ ・ ・ ・ ・|三
| ・v金 ・ ・ ・v銀 ・ ・ ・|四
| ・ ・ ・ ・ ・ ・ ・ ・ ・|五
|v馬 ・ ・v銀 ・ ・ ・v圭v圭|六
| ・ ・ ・ ・ ・ ・ ・ ・ ・|七
| ・ ・ ・v馬 ・ ・ ・ ・v圭|八
| ・ ・ ・ ・ ・ ・ ・ ・ ・|九
+---------------------------+
先手の持駒：
後手番`) as Record;
    const position = record.position;
    expect(formatMove(position, position.createMoveByUSI("6h6i") as Move)).toBe("☖６九馬左");
    expect(formatMove(position, position.createMoveByUSI("9f6i") as Move)).toBe("☖６九馬右");
    expect(formatMove(position, position.createMoveByUSI("6h9e") as Move)).toBe("☖９五馬左");
    expect(formatMove(position, position.createMoveByUSI("9f9e") as Move)).toBe("☖９五馬右");
    expect(formatMove(position, position.createMoveByUSI("6f5g+") as Move)).toBe("☖５七銀成");
    expect(formatMove(position, position.createMoveByUSI("6f5g") as Move)).toBe("☖５七銀不成");
    expect(formatMove(position, position.createMoveByUSI("6f5e") as Move)).toBe("☖５五銀引");
    expect(formatMove(position, position.createMoveByUSI("4d5e") as Move)).toBe("☖５五銀上");
    expect(formatMove(position, position.createMoveByUSI("1h1g") as Move)).toBe("☖１七成桂引");
    expect(formatMove(position, position.createMoveByUSI("1f1g") as Move)).toBe("☖１七成桂直");
    expect(formatMove(position, position.createMoveByUSI("2f1g") as Move)).toBe("☖１七成桂右");
    expect(formatMove(position, position.createMoveByUSI("7b8c") as Move)).toBe("☖８三金上");
    expect(formatMove(position, position.createMoveByUSI("8d8c") as Move)).toBe("☖８三金引");
  });

  it("formatPV", () => {
    const position = new Position();
    const pv = [
      new Move(new Square(7, 7), new Square(7, 6), false, Color.BLACK, PieceType.PAWN, null),
      new Move(new Square(3, 3), new Square(3, 4), false, Color.WHITE, PieceType.PAWN, null),
      new Move(new Square(4, 9), new Square(5, 8), false, Color.BLACK, PieceType.GOLD, null),
      new Move(new Square(2, 2), new Square(8, 8), true, Color.WHITE, PieceType.BISHOP, null),
      new Move(new Square(7, 9), new Square(8, 8), false, Color.BLACK, PieceType.SILVER, null),
    ];
    expect(formatPV(position, pv)).toBe("▲７六歩△３四歩▲５八金右△８八角成▲同　銀");
  });

  it("parsePV", () => {
    const record = importKIF(`
後手の持駒：
  ９ ８ ７ ６ ５ ４ ３ ２ １
+---------------------------+
|v香v桂 ・ ・ ・ ・v金v桂v玉|一
| ・ ・ ・ ・v金v角 ・v銀v香|二
|v歩 ・v歩 ・ ・v歩 ・v歩 ・|三
|v飛 ・ ・ ・v歩v銀v歩 ・v歩|四
| 角v歩 ・ 銀 ・ ・ ・ 金 ・|五
| ・ ・ 歩 歩 歩 ・ ・ ・ ・|六
| 歩 歩 ・ ・ ・ 歩 歩 歩 歩|七
| ・ ・ ・ ・ 飛 ・ ・ 銀 香|八
| 香 桂 ・ ・ ・ ・ 金 桂 玉|九
+---------------------------+
先手の持駒：歩　
先手番`) as Record;

    const input1 =
      "▲５九角△５三角▲１六歩△４二金寄▲１五歩△同　歩▲１四歩△３二金寄▲５五歩△同　歩▲１五金△４二角▲３六歩";
    const pv1 = parsePV(record.position, input1);
    expect(pv1).toHaveLength(13);
    expect(formatPV(record.position, pv1)).toBe(input1);

    const input2 =
      "▲９六歩(97)△１五歩(14)▲７七桂(89)△８六歩(85)▲８六歩(87)△７四歩(73)▲１六歩(17)△１六歩(15)▲８五歩(86)△３三銀(44)▲５五歩(56)△９五飛(94)▲９五歩(96)△７三桂(81)▲５四歩(55)";
    const pv2 = parsePV(record.position, input2);
    expect(pv2).toHaveLength(15);
    expect(formatPV(record.position, pv2)).toBe(
      "▲９六歩△１五歩▲７七桂△８六歩▲同　歩△７四歩▲１六歩△同　歩▲８五歩△３三銀引▲５五歩△９五飛▲同　歩△７三桂▲５四歩",
    );
  });

  describe("parseMoves", () => {
    const record = importKIF(`
後手の持駒：角　歩二　
  ９ ８ ７ ６ ５ ４ ３ ２ １
+---------------------------+
|v香v桂v銀v金v玉 ・v銀v桂v香|一
| ・ ・ ・ ・ ・ ・v金 ・ ・|二
|v歩 ・v歩v歩v歩v歩 ・ ・v歩|三
| ・ ・ ・ ・ ・ ・ 飛 ・ ・|四
| ・ ・ ・ ・ ・ ・ ・ ・ ・|五
| ・v飛 歩 ・ ・ ・ ・ ・ ・|六
| 歩 ・ ・ 歩 歩 歩 歩 ・ 歩|七
| ・v馬 金 ・ ・ ・ ・ ・ ・|八
| 香 桂 銀 ・ 玉 金 銀 桂 香|九
+---------------------------+
先手の持駒：歩三　
`) as Record;
    const lastMove = new Move(
      new Square(2, 2),
      new Square(8, 8),
      true,
      Color.WHITE,
      PieceType.BISHOP,
      PieceType.BISHOP,
    );

    it("ki2", () => {
      const input =
        "▲同　銀 △７六飛 ▲７七銀 △７四飛 ▲同　飛 △同　歩 ▲４六角 △８二角 ▲同角成 △同　銀 ▲５五角";
      const [moves, e] = parseMoves(record.position, input, lastMove);
      expect(e).toBeUndefined();
      expect(moves).toHaveLength(11);
      expect(moves.map((move) => move.usi)).toStrictEqual([
        "7i8h",
        "8f7f",
        "8h7g",
        "7f7d",
        "3d7d",
        "7c7d",
        "B*4f",
        "B*8b",
        "4f8b+",
        "7a8b",
        "B*5e",
      ]);
    });

    it("ki2-half-size-number", () => {
      const input = "▲同銀 △76飛 ▲77銀 △74飛 ▲同飛 △同歩 ▲46角 △82角 ▲同角成 △同銀 ▲55角";
      const [moves, e] = parseMoves(record.position, input, lastMove);
      expect(e).toBeUndefined();
      expect(moves).toHaveLength(11);
      expect(moves.map((move) => move.usi)).toStrictEqual([
        "7i8h",
        "8f7f",
        "8h7g",
        "7f7d",
        "3d7d",
        "7c7d",
        "B*4f",
        "B*8b",
        "4f8b+",
        "7a8b",
        "B*5e",
      ]);
    });

    it("unicode", () => {
      const input =
        "☗同　銀 ☖７六飛 ☗７七銀 ☖７四飛 ☗同　飛 ☖同　歩 ☗４六角 ☖８二角 ☗同角成 ☖同　銀 ☗５五角";
      const [moves, e] = parseMoves(record.position, input, lastMove);
      expect(e).toBeUndefined();
      expect(moves).toHaveLength(11);
      expect(moves.map((move) => move.usi)).toStrictEqual([
        "7i8h",
        "8f7f",
        "8h7g",
        "7f7d",
        "3d7d",
        "7c7d",
        "B*4f",
        "B*8b",
        "4f8b+",
        "7a8b",
        "B*5e",
      ]);
    });
  });

  it("parseMoves/black", () => {
    const record = importKIF(`
後手の持駒：
  ９ ８ ７ ６ ５ ４ ３ ２ １
+---------------------------+
| ・ ・ ・ ・ ・ ・ ・ ・ ・|一
| ・ 銀 ・ ・ ・ ・ 金 ・ ・|二
| ・ ・ ・ ・ ・ ・ ・ ・ ・|三
| ・ 銀 ・ 銀 ・ 金 ・ 金 ・|四
| ・ ・ ・ ・ ・ ・ ・ ・ ・|五
| 馬 馬 ・vと とvと ・ ・ ・|六
| ・ ・ ・ とvと と ・ ・ ・|七
| 龍 龍 ・ と とvと 桂 ・ 桂|八
| ・ ・ ・ ・ ・ ・ ・ ・ ・|九
+---------------------------+
先手の持駒：金　桂二
先手番`) as Record;
    const position = record.position;
    expect(parseMoves(position, "☗２二金")[0][0].usi).toBe("3b2b");
    expect(parseMoves(position, "☗３三金引")[0][0].usi).toBe("3b3c");
    expect(parseMoves(position, "☗３三金右")[0][0].usi).toBe("2d3c");
    expect(parseMoves(position, "☗３三金左")[0][0].usi).toBe("4d3c");
    expect(parseMoves(position, "☗３三金打")[0][0].usi).toBe("G*3c");
    expect(parseMoves(position, "☗７一銀不成")[0][0].usi).toBe("8b7a");
    expect(parseMoves(position, "☗７一銀成")[0][0].usi).toBe("8b7a+");
    expect(parseMoves(position, "☗７三銀引不成")[0][0].usi).toBe("8b7c");
    expect(parseMoves(position, "☗７三銀引成")[0][0].usi).toBe("8b7c+");
    expect(parseMoves(position, "☗７三銀左上不成")[0][0].usi).toBe("8d7c");
    expect(parseMoves(position, "☗７三銀左上成")[0][0].usi).toBe("8d7c+");
    expect(parseMoves(position, "☗７三銀右不成")[0][0].usi).toBe("6d7c");
    expect(parseMoves(position, "☗７三銀右成")[0][0].usi).toBe("6d7c+");
    expect(parseMoves(position, "☗７五銀右")[0][0].usi).toBe("6d7e");
    expect(parseMoves(position, "☗２六桂右")[0][0].usi).toBe("1h2f");
    expect(parseMoves(position, "☗２六桂左")[0][0].usi).toBe("3h2f");
    expect(parseMoves(position, "☗２六桂打")[0][0].usi).toBe("N*2f");
    expect(parseMoves(position, "☗１六桂")[0][0].usi).toBe("N*1f");
    expect(parseMoves(position, "☗４六桂")[0][0].usi).toBe("3h4f");
    expect(parseMoves(position, "☗５七と引")[0][0].usi).toBe("5f5g");
    expect(parseMoves(position, "☗５七と直")[0][0].usi).toBe("5h5g");
    expect(parseMoves(position, "☗５七と右")[0][0].usi).toBe("4g5g");
    expect(parseMoves(position, "☗５七と左寄")[0][0].usi).toBe("6g5g");
    expect(parseMoves(position, "☗５七と左上")[0][0].usi).toBe("6h5g");
    expect(parseMoves(position, "☗７七と寄")[0][0].usi).toBe("6g7g");
    expect(parseMoves(position, "☗７七と上")[0][0].usi).toBe("6h7g");
    expect(parseMoves(position, "☗８七馬右")[0][0].usi).toBe("8f8g");
    expect(parseMoves(position, "☗８七馬左")[0][0].usi).toBe("9f8g");
    expect(parseMoves(position, "☗８七龍右")[0][0].usi).toBe("8h8g");
    expect(parseMoves(position, "☗８七龍左")[0][0].usi).toBe("9h8g");
  });

  it("parseMoves/white", () => {
    const record = importKIF(`
後手の持駒：
  ９ ８ ７ ６ ５ ４ ３ ２ １
+---------------------------+
| ・ ・ ・ ・ ・ ・ ・ ・ ・|一
| ・ ・v金 ・ ・ ・ ・ ・ ・|二
| ・ ・ ・ ・ ・ ・ ・ ・ ・|三
| ・v金 ・ ・ ・v銀 ・ ・ ・|四
| ・ ・ ・ ・ ・ ・ ・ ・ ・|五
|v馬 ・ ・v銀 ・ ・ ・v圭v圭|六
| ・ ・ ・ ・ ・ ・ ・ ・ ・|七
| ・ ・ ・v馬 ・ ・ ・ ・v圭|八
| ・ ・ ・ ・ ・ ・ ・ ・ ・|九
+---------------------------+
先手の持駒：
後手番`) as Record;
    const position = record.position;
    expect(parseMoves(position, "☖６九馬左")[0][0].usi).toBe("6h6i");
    expect(parseMoves(position, "☖６九馬右")[0][0].usi).toBe("9f6i");
    expect(parseMoves(position, "☖９五馬左")[0][0].usi).toBe("6h9e");
    expect(parseMoves(position, "☖９五馬右")[0][0].usi).toBe("9f9e");
    expect(parseMoves(position, "☖５七銀成")[0][0].usi).toBe("6f5g+");
    expect(parseMoves(position, "☖５七銀不成")[0][0].usi).toBe("6f5g");
    expect(parseMoves(position, "☖５五銀引")[0][0].usi).toBe("6f5e");
    expect(parseMoves(position, "☖５五銀上")[0][0].usi).toBe("4d5e");
    expect(parseMoves(position, "☖１七成桂引")[0][0].usi).toBe("1h1g");
    expect(parseMoves(position, "☖１七成桂直")[0][0].usi).toBe("1f1g");
    expect(parseMoves(position, "☖１七成桂右")[0][0].usi).toBe("2f1g");
    expect(parseMoves(position, "☖８三金上")[0][0].usi).toBe("7b8c");
    expect(parseMoves(position, "☖８三金引")[0][0].usi).toBe("8d8c");
  });
});
