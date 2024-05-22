import {
  Color,
  importKIF,
  InitialPositionType,
  Move,
  Piece,
  Position,
  Record,
  Square,
  PieceType,
  InitialPositionSFEN,
  judgeJishogiDeclaration,
  JishogiDeclarationRule,
  JishogiDeclarationResult,
  countJishogiDeclarationPoint,
  countJishogiPoint,
} from "../";

describe("shogi/position", () => {
  it("getters", () => {
    const position = new Position();
    expect(position.color).toBe(Color.BLACK);
    expect(position.board.at(new Square(8, 2))).toStrictEqual(
      new Piece(Color.WHITE, PieceType.ROOK),
    );
    expect(position.hand(Color.BLACK).count(PieceType.PAWN)).toBe(0);
    expect(position.hand(Color.WHITE).count(PieceType.PAWN)).toBe(0);

    position.blackHand.add(PieceType.PAWN, 1);
    position.whiteHand.add(PieceType.PAWN, 2);
    expect(position.hand(Color.BLACK).count(PieceType.PAWN)).toBe(1);
    expect(position.hand(Color.WHITE).count(PieceType.PAWN)).toBe(2);
  });

  it("reset", () => {
    const position = new Position();
    position.reset(InitialPositionType.EMPTY);
    expect(position.sfen).toBe("9/9/9/9/9/9/9/9/9 b - 1");
    position.reset(InitialPositionType.STANDARD);
    expect(position.sfen).toBe("lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL b - 1");
    position.reset(InitialPositionType.HANDICAP_LANCE);
    expect(position.sfen).toBe("lnsgkgsn1/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w - 1");
    position.reset(InitialPositionType.HANDICAP_RIGHT_LANCE);
    expect(position.sfen).toBe("1nsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w - 1");
    position.reset(InitialPositionType.HANDICAP_BISHOP);
    expect(position.sfen).toBe("lnsgkgsnl/1r7/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w - 1");
    position.reset(InitialPositionType.HANDICAP_ROOK);
    expect(position.sfen).toBe("lnsgkgsnl/7b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w - 1");
    position.reset(InitialPositionType.HANDICAP_ROOK_LANCE);
    expect(position.sfen).toBe("lnsgkgsn1/7b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w - 1");
    position.reset(InitialPositionType.HANDICAP_2PIECES);
    expect(position.sfen).toBe("lnsgkgsnl/9/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w - 1");
    position.reset(InitialPositionType.HANDICAP_4PIECES);
    expect(position.sfen).toBe("1nsgkgsn1/9/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w - 1");
    position.reset(InitialPositionType.HANDICAP_6PIECES);
    expect(position.sfen).toBe("2sgkgs2/9/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w - 1");
    position.reset(InitialPositionType.HANDICAP_8PIECES);
    expect(position.sfen).toBe("3gkg3/9/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w - 1");
    position.reset(InitialPositionType.HANDICAP_10PIECES);
    expect(position.sfen).toBe("4k4/9/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w - 1");
    position.reset(InitialPositionType.TSUME_SHOGI);
    expect(position.sfen).toBe("4k4/9/9/9/9/9/9/9/9 b 2r2b4g4s4n4l18p 1");
    position.reset(InitialPositionType.TSUME_SHOGI_2KINGS);
    expect(position.sfen).toBe("4k4/9/9/9/9/9/9/9/4K4 b 2r2b4g4s4n4l18p 1");
  });

  it("resetBySFEN", () => {
    const testCases = [
      InitialPositionSFEN.STANDARD,
      InitialPositionSFEN.EMPTY,
      InitialPositionSFEN.HANDICAP_LANCE,
      InitialPositionSFEN.HANDICAP_RIGHT_LANCE,
      InitialPositionSFEN.HANDICAP_BISHOP,
      InitialPositionSFEN.HANDICAP_ROOK,
      InitialPositionSFEN.HANDICAP_ROOK_LANCE,
      InitialPositionSFEN.HANDICAP_2PIECES,
      InitialPositionSFEN.HANDICAP_4PIECES,
      InitialPositionSFEN.HANDICAP_6PIECES,
      InitialPositionSFEN.HANDICAP_8PIECES,
      InitialPositionSFEN.HANDICAP_10PIECES,
      InitialPositionSFEN.TSUME_SHOGI,
      InitialPositionSFEN.TSUME_SHOGI_2KINGS,
      "l+B5nl/4g1gk1/2b1p2p1/p1p2pp2/3s1P2p/P1P3PP1/1P2PSN1P/2G2GK2/L7L b RSNPrsn2p 1",
    ];
    for (const tc of testCases) {
      const position = Position.newBySFEN(tc);
      expect(position).toBeInstanceOf(Position);
      expect(position?.sfen).toBe(tc);
    }
  });

  it("doMove", () => {
    const position = new Position();
    // 26FU(27)
    let move = position.createMove(new Square(2, 7), new Square(2, 6));
    expect(move).toBeInstanceOf(Move);
    expect(move?.color).toBe(Color.BLACK);
    expect(position.isValidMove(move as Move)).toBeTruthy();
    expect(position.doMove(move as Move)).toBeTruthy();
    expect(position.board.at(new Square(2, 7))).toBeNull();
    expect(position.board.at(new Square(2, 6))).toStrictEqual(
      new Piece(Color.BLACK, PieceType.PAWN),
    );
    // 34FU(33)
    move = position.createMove(new Square(3, 3), new Square(3, 4));
    expect(move?.color).toBe(Color.WHITE);
    expect(position.doMove(move as Move)).toBeTruthy();
    expect(position.board.at(new Square(3, 3))).toBeNull();
    expect(position.board.at(new Square(3, 4))).toStrictEqual(
      new Piece(Color.WHITE, PieceType.PAWN),
    );
    // Invalid
    move = position.createMove(new Square(2, 8), new Square(2, 6));
    expect(position.doMove(move as Move)).toBeFalsy();
    expect(position.color).toBe(Color.BLACK);
    expect(
      position.doMove(move as Move, {
        ignoreValidation: true,
      }),
    ).toBeTruthy();
    expect(position.color).toBe(Color.WHITE);
    expect(position.board.at(new Square(2, 8))).toBe(null);
    expect(position.board.at(new Square(2, 6))).toStrictEqual(
      new Piece(Color.BLACK, PieceType.ROOK),
    );
  });

  describe("isValidMove", () => {
    it("black", () => {
      const data = `
後手の持駒：歩八　香　桂二　銀二　金二　角　
| ・ ・ ・ ・v玉 ・ ・ ・ ・|一
| ・ ・ ・ ・ ・ ・ ・ ・ ・|二
| ・ ・ ・v香 角 ・ ・ ・ ・|三
| ・ ・ ・ ・v歩 ・ ・ ・ ・|四
| ・ ・ ・ 銀 ・ ・ ・ ・ ・|五
| ・ ・ ・ 玉 ・ ・ ・v龍 ・|六
| ・ ・ 歩 ・ 金 歩 ・ 歩 ・|七
| ・ ・ ・ ・ ・ ・ 桂 ・ ・|八
| ・ ・ ・ ・ ・ ・ ・ ・ ・|九
先手の持駒：歩六　香二　桂　銀　金　飛　
先手番
`;
      const position = (importKIF(data) as Record).position;
      const move = (ff: number, fr: number, tf: number, tr: number) =>
        position.createMove(new Square(ff, fr), new Square(tf, tr)) as Move;
      const drop = (type: PieceType, tf: number, tr: number) =>
        position.createMove(type, new Square(tf, tr)) as Move;
      // 合法手
      expect(position.isValidMove(move(2, 7, 2, 6))).toBeTruthy();
      expect(position.isValidMove(move(4, 7, 4, 6))).toBeTruthy();
      expect(position.isValidMove(move(3, 8, 2, 6))).toBeTruthy();
      expect(position.isValidMove(move(3, 8, 4, 6))).toBeTruthy();
      expect(position.isValidMove(move(5, 7, 4, 6))).toBeTruthy();
      expect(position.isValidMove(move(5, 7, 5, 6))).toBeTruthy();
      expect(position.isValidMove(move(5, 3, 2, 6))).toBeTruthy();
      expect(position.isValidMove(move(5, 3, 2, 6).withPromote())).toBeTruthy();
      expect(position.isValidMove(move(6, 6, 6, 7))).toBeTruthy();
      expect(position.isValidMove(move(6, 6, 7, 5))).toBeTruthy();
      expect(position.isValidMove(drop(PieceType.PAWN, 3, 6))).toBeTruthy();
      expect(position.isValidMove(drop(PieceType.LANCE, 4, 6))).toBeTruthy();
      // 王手放置
      expect(position.isValidMove(move(7, 7, 7, 6))).toBeFalsy();
      expect(position.isValidMove(move(5, 3, 3, 5))).toBeFalsy();
      expect(position.isValidMove(move(6, 5, 5, 6))).toBeFalsy();
      expect(position.isValidMove(move(6, 6, 5, 5))).toBeFalsy();
      expect(position.isValidMove(move(6, 6, 5, 6))).toBeFalsy();
      expect(position.isValidMove(move(6, 6, 7, 6))).toBeFalsy();
      // 筋違い
      expect(position.isValidMove(move(5, 3, 1, 7))).toBeFalsy();
      expect(position.isValidMove(move(5, 3, 3, 6))).toBeFalsy();
      // 味方の駒
      expect(position.isValidMove(move(6, 6, 5, 7))).toBeFalsy();
      expect(position.isValidMove(move(6, 6, 7, 7))).toBeFalsy();
      // 打てないマス
      expect(position.isValidMove(drop(PieceType.PAWN, 2, 6))).toBeFalsy();
      // 二歩
      expect(position.isValidMove(drop(PieceType.PAWN, 4, 6))).toBeFalsy();
      // 存在しない駒
      expect(position.isValidMove(drop(PieceType.BISHOP, 3, 6))).toBeFalsy();
      // 相手の駒
      expect(position.isValidMove(move(2, 6, 2, 5))).toBeFalsy();
    });

    it("white", () => {
      const data = `
後手の持駒：歩六　香　桂　銀　金　
  ９ ８ ７ ６ ５ ４ ３ ２ １
+---------------------------+
| ・ ・ ・ ・ 玉 ・ ・ ・ ・|一
| 馬 ・ ・ ・ ・ ・ ・ 龍 ・|二
| ・ ・ ・ ・ ・ ・ ・ ・ ・|三
| ・ ・ ・ ・ ・ ・ ・ ・ ・|四
| ・v香 ・ ・ ・ ・v角 ・ ・|五
|v桂 ・ ・ ・ ・ 歩 ・ ・ ・|六
| ・ ・ ・ ・ ・v歩v歩v銀 ・|七
|v歩 ・v金v飛 ・ ・ ・ ・ ・|八
| ・ ・ ・ ・ ・ ・ ・v玉 ・|九
+---------------------------+
先手の持駒：歩八　香二　桂二　銀二　金二　
後手番
`;
      const position = (importKIF(data) as Record).position;
      const move = (ff: number, fr: number, tf: number, tr: number) =>
        position.createMove(new Square(ff, fr), new Square(tf, tr)) as Move;
      const drop = (type: PieceType, tf: number, tr: number) =>
        position.createMove(type, new Square(tf, tr)) as Move;
      // 合法手
      expect(position.isValidMove(move(2, 7, 2, 8))).toBeTruthy();
      expect(position.isValidMove(move(2, 7, 2, 8).withPromote())).toBeTruthy();
      expect(position.isValidMove(move(3, 7, 3, 8))).toBeTruthy();
      expect(position.isValidMove(move(3, 7, 3, 8).withPromote())).toBeTruthy();
      expect(position.isValidMove(move(9, 8, 9, 9).withPromote())).toBeTruthy();
      expect(position.isValidMove(move(8, 5, 8, 8))).toBeTruthy();
      expect(position.isValidMove(move(8, 5, 8, 9).withPromote())).toBeTruthy();
      expect(position.isValidMove(move(9, 6, 8, 8).withPromote())).toBeTruthy();
      expect(position.isValidMove(move(7, 8, 7, 9))).toBeTruthy();
      expect(position.isValidMove(move(3, 5, 1, 3))).toBeTruthy();
      expect(position.isValidMove(move(3, 5, 2, 6))).toBeTruthy();
      expect(position.isValidMove(move(3, 5, 1, 7).withPromote())).toBeTruthy();
      expect(position.isValidMove(move(3, 5, 4, 6))).toBeTruthy();
      expect(position.isValidMove(move(6, 8, 5, 8).withPromote())).toBeTruthy();
      expect(position.isValidMove(move(6, 8, 1, 8).withPromote())).toBeTruthy();
      expect(position.isValidMove(drop(PieceType.PAWN, 8, 8))).toBeTruthy();
      expect(position.isValidMove(drop(PieceType.LANCE, 8, 8))).toBeTruthy();
      expect(position.isValidMove(drop(PieceType.KNIGHT, 8, 7))).toBeTruthy();
      // 王手放置
      expect(position.isValidMove(move(2, 7, 3, 8))).toBeFalsy();
      expect(position.isValidMove(move(4, 7, 4, 8).withPromote())).toBeFalsy();
      // 筋違い
      expect(position.isValidMove(move(2, 7, 2, 6))).toBeFalsy();
      expect(position.isValidMove(move(3, 5, 5, 7).withPromote())).toBeFalsy();
      expect(position.isValidMove(move(6, 8, 7, 8).withPromote())).toBeFalsy();
      expect(position.isValidMove(move(6, 8, 8, 8).withPromote())).toBeFalsy();
      // 行き所の無い駒
      expect(position.isValidMove(move(9, 8, 9, 9))).toBeFalsy();
      expect(position.isValidMove(move(8, 5, 8, 9))).toBeFalsy();
      expect(position.isValidMove(move(9, 6, 8, 8))).toBeFalsy();
      expect(position.isValidMove(drop(PieceType.PAWN, 8, 9))).toBeFalsy();
      expect(position.isValidMove(drop(PieceType.LANCE, 8, 9))).toBeFalsy();
      expect(position.isValidMove(drop(PieceType.KNIGHT, 8, 8))).toBeFalsy();
      expect(position.isValidMove(drop(PieceType.KNIGHT, 8, 9))).toBeFalsy();
      // 成れない駒
      expect(position.isValidMove(move(3, 5, 2, 6).withPromote())).toBeFalsy();
      expect(position.isValidMove(move(7, 8, 7, 9).withPromote())).toBeFalsy();
    });

    it("black/pawn_drop_mate", () => {
      const data = `
後手の持駒：なし
  ９ ８ ７ ６ ５ ４ ３ ２ １
+---------------------------+
| ・ ・ ・ ・ ・ ・ ・ 角 ・|一
| ・ ・ ・ 飛 ・ ・v桂 ・ ・|二
| ・ ・ ・ ・ ・v玉v桂 ・ ・|三
| ・ ・ ・ ・ 歩 ・ ・ ・ ・|四
| ・ ・ ・ ・ ・ 金 ・ ・ ・|五
| ・ ・ ・ ・ ・ ・ ・ ・ ・|六
| ・ ・ ・ ・ ・ ・ ・ ・ ・|七
| ・ ・ ・ ・ ・ ・ ・ ・ ・|八
| ・ ・ ・ ・ 玉 ・ ・ ・ ・|九
+---------------------------+
先手の持駒：歩 
`;
      const position = (importKIF(data) as Record).position;
      const move = position.createMove(PieceType.PAWN, new Square(4, 4)) as Move;
      expect(position.isPawnDropMate(move)).toBeTruthy();
      expect(position.isValidMove(move)).toBeFalsy();
    });

    it("black/no_pawn_drop_mate/capture", () => {
      const data = `
後手の持駒：なし
  ９ ８ ７ ６ ５ ４ ３ ２ １
+---------------------------+
| ・ ・ ・ ・ ・ ・ ・ ・ ・|一
| ・ ・ ・ 飛 ・ ・v桂 ・ ・|二
| ・ ・ ・ ・ ・v玉v桂 ・ ・|三
| ・ ・ ・ ・ 歩 ・ ・ ・ ・|四
| ・ ・ ・ ・ ・ 金 ・ ・ ・|五
| ・ ・ ・ ・ ・ ・ ・ ・ ・|六
| ・ ・ ・ ・ ・ ・ ・ ・ ・|七
| ・ ・ ・ ・ ・ ・ ・ ・ ・|八
| ・ ・ ・ ・ 玉 ・ ・ ・ ・|九
+---------------------------+
先手の持駒：歩 
`;
      const position = (importKIF(data) as Record).position;
      const move = position.createMove(PieceType.PAWN, new Square(4, 4)) as Move;
      expect(position.isPawnDropMate(move)).toBeFalsy();
      expect(position.isValidMove(move)).toBeTruthy();
    });

    it("black/no_pawn_drop_mate/king_movable", () => {
      const data = `
後手の持駒：なし
  ９ ８ ７ ６ ５ ４ ３ ２ １
+---------------------------+
| ・ ・ ・ ・ ・ ・ ・ 角 ・|一
| ・ ・ ・ 飛 ・ ・v桂 ・ ・|二
| ・ ・ ・ ・ ・v玉v桂 ・ ・|三
| ・ ・ ・ ・ 歩 ・ ・ ・ ・|四
| ・ ・ ・ ・ ・ ・ 金 ・ ・|五
| ・ ・ ・ ・ ・ ・ ・ ・ ・|六
| ・ ・ ・ ・ ・ ・ ・ ・ ・|七
| ・ ・ ・ ・ ・ ・ ・ ・ ・|八
| ・ ・ ・ ・ 玉 ・ ・ ・ ・|九
+---------------------------+
先手の持駒：歩 
`;
      const position = (importKIF(data) as Record).position;
      const move = position.createMove(PieceType.PAWN, new Square(4, 4)) as Move;
      expect(position.isPawnDropMate(move)).toBeFalsy();
      expect(position.isValidMove(move)).toBeTruthy();
    });

    it("black/no_pawn_drop_mate/block_dragon_effect", () => {
      const data = `
後手の持駒：なし
  ９ ８ ７ ６ ５ ４ ３ ２ １
+---------------------------+
| ・ ・ ・ ・ ・ ・ ・ 角 ・|一
| ・ ・ ・ 飛 ・ ・v桂 ・ ・|二
| ・ ・ ・ ・ ・v玉v桂 ・ ・|三
| ・ ・ ・ 竜 ・ ・ ・ ・ ・|四
| ・ ・ ・ ・ ・ ・ ・ ・ ・|五
| ・ ・ ・ ・ ・ ・ ・ ・ ・|六
| ・ ・ ・ ・ ・ ・ ・ ・ ・|七
| ・ ・ ・ ・ ・ ・ ・ ・ ・|八
| ・ ・ ・ ・ 玉 ・ ・ ・ ・|九
+---------------------------+
先手の持駒：歩 
`;
      const position = (importKIF(data) as Record).position;
      const move = position.createMove(PieceType.PAWN, new Square(4, 4)) as Move;
      expect(position.isPawnDropMate(move)).toBeFalsy();
      expect(position.isValidMove(move)).toBeTruthy();
    });

    it("white/pawn_drop_mate", () => {
      const data = `
後手の持駒：歩 
  ９ ８ ７ ６ ５ ４ ３ ２ １
+---------------------------+
| ・ ・ ・ ・v玉 ・ ・ ・ ・|一
| ・ ・v香 ・ ・ ・ ・ ・ ・|二
| ・ ・ ・ ・ ・ ・ ・ ・ ・|三
| ・ ・ ・ ・ ・ ・v飛 ・ ・|四
| ・ ・ ・ 玉 銀 ・ ・v飛 ・|五
| ・ ・ ・ 歩 ・ ・ ・ ・ ・|六
| ・ ・ ・ ・vと ・ ・ ・ ・|七
| ・ ・ ・ ・ ・ ・ ・ ・ ・|八
| ・ ・ ・ ・ ・ ・ ・ ・ ・|九
+---------------------------+
先手の持駒：なし
後手番
`;
      const position = (importKIF(data) as Record).position;
      const move = position.createMove(PieceType.PAWN, new Square(6, 4)) as Move;
      expect(position.isPawnDropMate(move)).toBeTruthy();
      expect(position.isValidMove(move)).toBeFalsy();
    });

    it("white/no_pawn_drop_mate/capture", () => {
      const data = `
後手の持駒：歩 
  ９ ８ ７ ６ ５ ４ ３ ２ １
+---------------------------+
| ・ ・ ・ ・v玉 ・ ・ ・ ・|一
| ・ ・v香 ・ ・ ・ ・ ・ ・|二
| ・ ・ ・ ・ ・ ・ ・ ・ ・|三
| ・ ・ ・ ・ ・ ・v飛 ・ ・|四
| ・ ・ ・ 玉 銀 ・ ・ ・ ・|五
| ・ ・ ・ 歩 ・ ・ ・ ・ ・|六
| ・ ・ ・ ・vと ・ ・ ・ ・|七
| ・ ・ ・ ・ ・ ・ ・ ・ ・|八
| ・ ・ ・ ・ ・ ・ ・ ・ ・|九
+---------------------------+
先手の持駒：なし
後手番
`;
      const position = (importKIF(data) as Record).position;
      const move = position.createMove(PieceType.PAWN, new Square(6, 4)) as Move;
      expect(position.isPawnDropMate(move)).toBeFalsy();
      expect(position.isValidMove(move)).toBeTruthy();
    });

    it("white/no_pawn_drop_mate/king_movable", () => {
      const data = `
後手の持駒：歩 
  ９ ８ ７ ６ ５ ４ ３ ２ １
+---------------------------+
| ・ ・ ・ ・v玉 ・ ・ ・ ・|一
| ・ ・v香 ・ ・ ・ ・ ・ ・|二
| ・ ・ ・ ・ ・ ・ ・ ・ ・|三
| ・ ・ ・ ・ ・ ・v飛 ・ ・|四
| ・ ・ ・ 玉 銀 ・ ・v飛 ・|五
| ・ ・ ・ ・ ・ ・ ・ ・ ・|六
| ・ ・ ・ ・vと ・ ・ ・ ・|七
| ・ ・ ・ ・ ・ ・ ・ ・ ・|八
| ・ ・ ・ ・ ・ ・ ・ ・ ・|九
+---------------------------+
先手の持駒：なし
後手番
`;
      const position = (importKIF(data) as Record).position;
      const move = position.createMove(PieceType.PAWN, new Square(6, 4)) as Move;
      expect(position.isPawnDropMate(move)).toBeFalsy();
      expect(position.isValidMove(move)).toBeTruthy();
    });

    it("white/no_pawn_drop_mate/block_bishop_effect", () => {
      const data = `
後手の持駒：歩 
  ９ ８ ７ ６ ５ ４ ３ ２ １
+---------------------------+
| ・ ・ ・ ・v玉 ・ ・ ・ ・|一
| ・ ・ ・ ・ ・ ・ ・ ・ ・|二
| ・ ・ ・ ・ ・ ・ ・ ・ ・|三
| ・ ・ ・ ・ ・ ・v飛 ・ ・|四
| ・v金 ・ 玉 銀 ・ ・v飛 ・|五
| ・ ・ ・ 歩 ・ ・ ・ ・ ・|六
| ・ ・ ・ ・vと ・ ・ ・ ・|七
| ・ ・ ・ ・ ・ ・ ・ ・ ・|八
| ・ ・ ・ ・ ・ ・ ・ ・ ・|九
+---------------------------+
先手の持駒：なし
後手番
`;
      const position = (importKIF(data) as Record).position;
      const move = position.createMove(PieceType.PAWN, new Square(6, 4)) as Move;
      expect(position.isPawnDropMate(move)).toBeFalsy();
      expect(position.isValidMove(move)).toBeTruthy();
    });
  });

  it("isValidEditing", () => {
    const position = Position.newBySFEN(
      "ln1gkg1nl/1r1s3s1/pppppp1pp/6B2/9/2P4P1/PP1PPPP1P/1S5R1/LN1GKGSNL w Pb 10",
    ) as Position;
    // Good: ☗49金 => 85
    expect(position.isValidEditing(new Square(4, 9), new Square(8, 5))).toBeTruthy();
    // Good: ☗49金 <=> ⛉83歩
    expect(position.isValidEditing(new Square(4, 9), new Square(8, 3))).toBeTruthy();
    // Bad: 48 => 85
    expect(position.isValidEditing(new Square(4, 8), new Square(8, 5))).toBeFalsy();
    // Good: ⛉82飛 => ☗
    expect(position.isValidEditing(new Square(8, 2), Color.BLACK)).toBeTruthy();
    // Good: ⛉82飛 => ⛉
    expect(position.isValidEditing(new Square(8, 2), Color.WHITE)).toBeTruthy();
    // Bad: 72 => ⛉
    expect(position.isValidEditing(new Square(7, 2), Color.WHITE)).toBeFalsy();
    // Good: ☗持歩 => ⛉
    expect(
      position.isValidEditing(new Piece(Color.BLACK, PieceType.PAWN), Color.WHITE),
    ).toBeTruthy();
    // Bad: ☗持銀 => ⛉
    expect(
      position.isValidEditing(new Piece(Color.BLACK, PieceType.BISHOP), Color.WHITE),
    ).toBeFalsy();
    // Good: ⛉持角 => ☗
    expect(
      position.isValidEditing(new Piece(Color.WHITE, PieceType.BISHOP), Color.BLACK),
    ).toBeTruthy();
    // Bad: ⛉持銀 => ☗
    expect(
      position.isValidEditing(new Piece(Color.WHITE, PieceType.PAWN), Color.BLACK),
    ).toBeFalsy();
    // Good: ☗持歩 => 31
    expect(
      position.isValidEditing(new Piece(Color.BLACK, PieceType.PAWN), new Square(3, 1)),
    ).toBeTruthy();
    // Bad: ☗持歩 => ⛉41金
    expect(
      position.isValidEditing(new Piece(Color.BLACK, PieceType.PAWN), new Square(4, 1)),
    ).toBeFalsy();
    // Bad: ⛉51玉 => ⛉
    expect(position.isValidEditing(new Square(5, 1), Color.WHITE)).toBeFalsy();
  });

  it("edit", () => {
    const position = Position.newBySFEN(
      "ln1gkg1nl/1r1s3s1/pppppp1pp/6B2/9/2P4P1/PP1PPPP1P/1S5R1/LN1GKGSNL w Pb 10",
    ) as Position;
    // Good: ☗49金 => 85
    expect(position.edit({ move: { from: new Square(4, 9), to: new Square(8, 5) } })).toBeTruthy();
    expect(position.board.at(new Square(4, 9))).toBeNull();
    expect(position.board.at(new Square(8, 5))).toStrictEqual(
      new Piece(Color.BLACK, PieceType.GOLD),
    );
    // Bad: ☗49金 => 85
    expect(position.edit({ move: { from: new Square(4, 9), to: new Square(8, 5) } })).toBeFalsy();
    expect(position.board.at(new Square(4, 9))).toBeNull();
    expect(position.board.at(new Square(8, 5))).toStrictEqual(
      new Piece(Color.BLACK, PieceType.GOLD),
    );
    // Good: ☗持歩 => 31
    expect(
      position.edit({
        move: { from: new Piece(Color.BLACK, PieceType.PAWN), to: new Square(3, 1) },
      }),
    ).toBeTruthy();
    expect(position.board.at(new Square(3, 1))).toStrictEqual(
      new Piece(Color.BLACK, PieceType.PAWN),
    );
    // Good: ☗31歩 => ☗31と
    expect(position.edit({ rotate: new Square(3, 1) })).toBeTruthy();
    expect(position.board.at(new Square(3, 1))).toStrictEqual(
      new Piece(Color.BLACK, PieceType.PROM_PAWN),
    );
    // Good: ☗31と => ⛉31歩
    expect(position.edit({ rotate: new Square(3, 1) })).toBeTruthy();
    expect(position.board.at(new Square(3, 1))).toStrictEqual(
      new Piece(Color.WHITE, PieceType.PAWN),
    );
    // Good: ⛉持角 => ☗
    expect(
      position.edit({ move: { from: new Piece(Color.WHITE, PieceType.BISHOP), to: Color.BLACK } }),
    ).toBeTruthy();
    expect(position.hand(Color.WHITE).count(PieceType.BISHOP)).toBe(0);
    expect(position.hand(Color.BLACK).count(PieceType.BISHOP)).toBe(1);
    // Good: ⛉81桂 => ⛉
    expect(position.edit({ move: { from: new Square(8, 1), to: Color.WHITE } })).toBeTruthy();
    expect(position.board.at(new Square(8, 1))).toBeNull();
    expect(position.hand(Color.WHITE).count(PieceType.KNIGHT)).toBe(1);
  });

  it("sfen", () => {
    const sfen = "l2R2s1+P/4gg1k1/p1+P2lPp1/4p1p+b1/1p3G3/3pP1nS1/PP3KSP1/R8/L4G2+b b NL4Ps2np 1";
    const position = Position.newBySFEN(sfen);
    expect(position).toBeInstanceOf(Position);
    expect(position?.color).toBe(Color.BLACK);
    expect(position?.board.at(new Square(4, 7))).toStrictEqual(
      new Piece(Color.BLACK, PieceType.KING),
    );
    expect(position?.board.at(new Square(4, 3))).toStrictEqual(
      new Piece(Color.WHITE, PieceType.LANCE),
    );
    expect(position?.board.at(new Square(2, 4))).toStrictEqual(
      new Piece(Color.WHITE, PieceType.HORSE),
    );
    expect(position?.blackHand.count(PieceType.PAWN)).toBe(4);
    expect(position?.blackHand.count(PieceType.LANCE)).toBe(1);
    expect(position?.blackHand.count(PieceType.KNIGHT)).toBe(1);
    expect(position?.blackHand.count(PieceType.SILVER)).toBe(0);
    expect(position?.whiteHand.count(PieceType.PAWN)).toBe(1);
    expect(position?.whiteHand.count(PieceType.LANCE)).toBe(0);
    expect(position?.whiteHand.count(PieceType.KNIGHT)).toBe(2);
    expect(position?.whiteHand.count(PieceType.SILVER)).toBe(1);
    expect(position?.sfen).toBe(sfen);
  });

  describe("judgeJishogiDeclaration", () => {
    const testCases = [
      {
        // https://denryu-sen.jp/denryusen/dr3_production/dist/#/dr3prd+t_test1_test2-600-2F+aobazero+aobazerotest+20221201210630
        title: "sente_10pieces_28points",
        sfen: "2GK1+L3/2+P+S+R1G+N1/3+B1GG2/9/+r8/1+bs6/+p+p3+n3/2+n2k3/6+p2 b 2SN7P3l7p 375",
        blackInvading: 10,
        whiteInvading: 5,
        blackTotalPoint: 28,
        whiteTotalPoint: 26,
        blackPoint: 28,
        whitePoint: 15,
        black24: JishogiDeclarationResult.DRAW,
        black27: JishogiDeclarationResult.WIN,
        white24: JishogiDeclarationResult.LOSE,
        white27: JishogiDeclarationResult.LOSE,
      },
      {
        // https://denryu-sen.jp/denryusen/dr3_production/dist/#/dr3prd+t_test1_test2-600-2F+aobazero+aobazerotest+20221201210630 (終局1手前)
        title: "gote_5pieces_15points",
        sfen: "2GK1+L3/2+P+S+R1G+N1/3+B1GG2/9/9/+r+bs6/+p+p3+n3/2+n2k3/6+p2 w 2SN7P3l7p 374",
        blackInvading: 10,
        whiteInvading: 5,
        blackTotalPoint: 28,
        whiteTotalPoint: 26,
        blackPoint: 28,
        whitePoint: 15,
        black24: JishogiDeclarationResult.LOSE,
        black27: JishogiDeclarationResult.LOSE,
        white24: JishogiDeclarationResult.LOSE,
        white27: JishogiDeclarationResult.LOSE,
      },
      {
        // https://denryu-sen.jp/denryusen/dr3_production/dist/#/dr3prd+dr3prda-8-top_joyful_dlshogi30b-600-2F+joyful+dlshogi30b+20221204183543
        title: "gote_10pieces_44points",
        sfen: "1+N2+N4/1K7/1+N+P6/9/5g3/4L1s2/1+l2pPg1+s/1s2b1b1+p/1+r4+p1k w 2Pr2gsn2l11p 378",
        blackInvading: 4,
        whiteInvading: 10,
        blackTotalPoint: 8,
        whiteTotalPoint: 46,
        blackPoint: 6,
        whitePoint: 44,
        black24: JishogiDeclarationResult.LOSE,
        black27: JishogiDeclarationResult.LOSE,
        white24: JishogiDeclarationResult.WIN,
        white27: JishogiDeclarationResult.WIN,
      },
      {
        // https://denryu-sen.jp/denryusen/dr3_production/dist/#/dr3prd+t_test1_test2-600-2F+irohakiramekitest+aobazero+20221203014727/306
        title: "gote_10pieces_28points",
        sfen: "1+N4+B1+P/1K4+N+P1/1+L+P3B2/7P1/2G6/9/2G3+l1g/1+r1sppppg/1+l6k w 7Pr3s2nl3p 306",
        blackInvading: 8,
        whiteInvading: 10,
        blackTotalPoint: 26,
        whiteTotalPoint: 28,
        blackPoint: 23,
        whitePoint: 28,
        black24: JishogiDeclarationResult.LOSE,
        black27: JishogiDeclarationResult.LOSE,
        white24: JishogiDeclarationResult.DRAW,
        white27: JishogiDeclarationResult.WIN,
      },
      {
        // https://denryu-sen.jp/denryusen/dr3_production/dist/#/dr3prd+dr3prdb-10_shotgun_aobazero-600-2F+shotgun+aobazero+20221204151512/411
        title: "gote_10pieces_39points",
        sfen: "K6n1/+PG7/+P3G4/1P+P6/9/4P4/9/3p+bp+pps/3+pk1rr+b w SNL4P2g2s2n3l4p 416",
        blackInvading: 4,
        whiteInvading: 10,
        blackTotalPoint: 14,
        whiteTotalPoint: 40,
        blackPoint: 11,
        whitePoint: 39,
        black24: JishogiDeclarationResult.LOSE,
        black27: JishogiDeclarationResult.LOSE,
        white24: JishogiDeclarationResult.WIN,
        white27: JishogiDeclarationResult.WIN,
      },
      {
        // https://denryu-sen.jp/denryusen/dr3_production/dist/#/dr3prd+dr3prdb-10_shotgun_aobazero-600-2F+shotgun+aobazero+20221204151512/411 (終局2手前)
        title: "gote_10pieces_38points_cheked", // 点数は足りているが先手による王手がかかっている。
        sfen: "K6n1/+PG7/+P3G4/1P+P6/9/9/4P4/3pGp+pps/3+pkbrr+b w SNL4Pg2s2n3l4p 414",
        blackInvading: 4,
        whiteInvading: 10,
        blackTotalPoint: 15,
        whiteTotalPoint: 39,
        blackPoint: 11,
        whitePoint: 38,
        black24: JishogiDeclarationResult.LOSE,
        black27: JishogiDeclarationResult.LOSE,
        white24: JishogiDeclarationResult.LOSE,
        white27: JishogiDeclarationResult.LOSE,
      },
      {
        // https://denryu-sen.jp/denryusen/dr3_production/dist/#/dr3prd+dr3prdb-10_shotgun_aobazero-600-2F+shotgun+aobazero+20221204151512/411 (終局4手前)
        title: "gote_9pieces_38points",
        sfen: "K6n1/+PG7/+P3G4/1P+P6/9/9/4P4/3p1p+pps/3+pkbr1+b w GSNL4Prg2s2n3l4p 412",
        blackInvading: 4,
        whiteInvading: 9,
        blackTotalPoint: 15,
        whiteTotalPoint: 39,
        blackPoint: 12,
        whitePoint: 38,
        black24: JishogiDeclarationResult.LOSE,
        black27: JishogiDeclarationResult.LOSE,
        white24: JishogiDeclarationResult.LOSE,
        white27: JishogiDeclarationResult.LOSE,
      },
      {
        title: "uwate_9pieces_38points",
        sfen: "K6n1/+PG7/+P3G4/1P+P6/9/9/4P4/2+pp1p+ppp/1+p1+pkb3 w GSNL4Pr2n3lp 1", // 6枚落ち
        blackInvading: 4,
        whiteInvading: 9,
        blackTotalPoint: 15,
        whiteTotalPoint: 39,
        blackPoint: 12,
        whitePoint: 38,
        black24: JishogiDeclarationResult.LOSE,
        black27: JishogiDeclarationResult.LOSE,
        white24: JishogiDeclarationResult.LOSE,
        white27: JishogiDeclarationResult.LOSE,
      },
      {
        title: "uwate_10pieces_38points",
        sfen: "K6n1/+PG1P5/+P3G4/1P+P6/9/9/4P4/1p+pp1p+ppp/1+p1+pkb3 w GSNL3Pr2n3l 1", // 6枚落ち
        blackInvading: 4,
        whiteInvading: 10,
        blackTotalPoint: 15,
        whiteTotalPoint: 39,
        blackPoint: 12,
        whitePoint: 38,
        black24: JishogiDeclarationResult.LOSE,
        black27: JishogiDeclarationResult.LOSE,
        white24: JishogiDeclarationResult.WIN,
        white27: JishogiDeclarationResult.WIN,
      },
      {
        title: "hirate_initial",
        sfen: InitialPositionSFEN.STANDARD,
        blackInvading: 0,
        whileInvading: 0,
        blackTotalPoint: 27,
        whiteTotalPoint: 27,
        blackPoint: 0,
        whitePoint: 0,
        black24: JishogiDeclarationResult.LOSE,
        black27: JishogiDeclarationResult.LOSE,
        white24: JishogiDeclarationResult.LOSE,
        white27: JishogiDeclarationResult.LOSE,
      },
    ];
    for (const tc of testCases) {
      it(tc.title, () => {
        const position = Position.newBySFEN(tc.sfen) as Position;
        expect(countJishogiPoint(position, Color.BLACK)).toBe(tc.blackTotalPoint);
        expect(countJishogiPoint(position, Color.WHITE)).toBe(tc.whiteTotalPoint);
        expect(countJishogiDeclarationPoint(position, Color.BLACK)).toBe(tc.blackPoint);
        expect(countJishogiDeclarationPoint(position, Color.WHITE)).toBe(tc.whitePoint);
        expect(
          judgeJishogiDeclaration(JishogiDeclarationRule.GENERAL24, position, Color.BLACK),
        ).toBe(tc.black24);
        expect(
          judgeJishogiDeclaration(JishogiDeclarationRule.GENERAL27, position, Color.BLACK),
        ).toBe(tc.black27);
        expect(
          judgeJishogiDeclaration(JishogiDeclarationRule.GENERAL24, position, Color.WHITE),
        ).toBe(tc.white24);
        expect(
          judgeJishogiDeclaration(JishogiDeclarationRule.GENERAL27, position, Color.WHITE),
        ).toBe(tc.white27);
      });
    }
  });
});
