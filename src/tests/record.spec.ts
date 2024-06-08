import {
  Color,
  exportKIF,
  formatMove,
  formatSpecialMove,
  getNextColorFromUSI,
  importKI2,
  importKIF,
  Move,
  Record,
  specialMove,
  SpecialMoveType,
  Square,
  RecordMetadataKey,
  getBlackPlayerName,
  getBlackPlayerNamePreferShort,
  getWhitePlayerName,
  getWhitePlayerNamePreferShort,
  exportKI2,
} from "../";

describe("shogi/record", () => {
  it("getBlackPlayerName", () => {
    const record = new Record();
    record.metadata.setStandardMetadata(RecordMetadataKey.SHITATE_NAME, "羽生結弦");
    expect(getBlackPlayerName(record.metadata)).toBe("羽生結弦");
    expect(getBlackPlayerNamePreferShort(record.metadata)).toBe("羽生結弦");
    record.metadata.setStandardMetadata(RecordMetadataKey.BLACK_SHORT_NAME, "羽生");
    expect(getBlackPlayerName(record.metadata)).toBe("羽生");
    expect(getBlackPlayerNamePreferShort(record.metadata)).toBe("羽生");
    record.metadata.setStandardMetadata(RecordMetadataKey.BLACK_NAME, "羽生善治");
    expect(getBlackPlayerName(record.metadata)).toBe("羽生善治");
    expect(getBlackPlayerNamePreferShort(record.metadata)).toBe("羽生");
  });

  it("getWhitePlayerName", async () => {
    const record = new Record();
    record.metadata.setStandardMetadata(RecordMetadataKey.UWATE_NAME, "羽生結弦");
    expect(getWhitePlayerName(record.metadata)).toBe("羽生結弦");
    expect(getWhitePlayerNamePreferShort(record.metadata)).toBe("羽生結弦");
    record.metadata.setStandardMetadata(RecordMetadataKey.WHITE_SHORT_NAME, "羽生");
    expect(getWhitePlayerName(record.metadata)).toBe("羽生");
    expect(getWhitePlayerNamePreferShort(record.metadata)).toBe("羽生");
    record.metadata.setStandardMetadata(RecordMetadataKey.WHITE_NAME, "羽生善治");
    expect(getWhitePlayerName(record.metadata)).toBe("羽生善治");
    expect(getWhitePlayerNamePreferShort(record.metadata)).toBe("羽生");
  });

  it("constructor", () => {
    const record = new Record();
    expect(record.first.move).toStrictEqual(specialMove(SpecialMoveType.START));
    expect(record.first.next).toBeNull();
    expect(record.first.comment).toBe("");
    expect(record.first.customData).toBeUndefined();
    expect(record.first.nextColor).toBe(Color.BLACK);
    expect(record.current).toBe(record.first);
  });

  it("clear", () => {
    const record = new Record();
    record.first.comment = "abc";
    record.first.customData = "foo bar baz";
    record.append(SpecialMoveType.INTERRUPT);
    expect(record.first.next).toBe(record.current);
    expect(record.first.comment).toBe("abc");
    expect(record.first.customData).toBe("foo bar baz");
    record.clear();
    expect(record.first.move).toStrictEqual(specialMove(SpecialMoveType.START));
    expect(record.first.next).toBeNull();
    expect(record.first.comment).toBe("");
    expect(record.first.customData).toBeUndefined();
    expect(record.current).toBe(record.first);
  });

  it("getUSI", () => {
    const data = `手合割：平手
   1 ２六歩(27)
   2 ８四歩(83)
   3 ７六歩(77)
   4 ８五歩(84)
   5 投了
`;
    const record = importKIF(data) as Record;
    record.goto(2);
    expect(record.usi).toBe("position startpos moves 2g2f 8c8d");
    expect(record.getUSI()).toBe("position startpos moves 2g2f 8c8d");
    expect(record.getUSI({ startpos: true })).toBe("position startpos moves 2g2f 8c8d");
    expect(
      record.getUSI({
        startpos: false,
      }),
    ).toBe(
      "position sfen lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL b - 1 moves 2g2f 8c8d",
    );
    expect(
      record.getUSI({
        startpos: true,
        allMoves: true,
      }),
    ).toBe("position startpos moves 2g2f 8c8d 7g7f 8d8e");
    expect(
      record.getUSI({
        startpos: true,
        resign: true,
        allMoves: true,
      }),
    ).toBe("position startpos moves 2g2f 8c8d 7g7f 8d8e resign");
  });

  it("getNextColorFromUSI", () => {
    expect(getNextColorFromUSI("position startpos")).toBe(Color.BLACK);
    expect(getNextColorFromUSI("position startpos ")).toBe(Color.BLACK);
    expect(getNextColorFromUSI("position startpos moves")).toBe(Color.BLACK);
    expect(getNextColorFromUSI("position startpos moves ")).toBe(Color.BLACK);
    expect(getNextColorFromUSI("position startpos moves 2g2f 8c8d 2f2e")).toBe(Color.WHITE);
    const sfenBlack = "lnsgkgsnl/1r5b1/p1ppppppp/9/1p5P1/9/PPPPPPP1P/1B5R1/LNSGKGSNL b - 1";
    expect(getNextColorFromUSI(`position sfen ${sfenBlack}`)).toBe(Color.BLACK);
    expect(getNextColorFromUSI(`position sfen ${sfenBlack} moves 6i7h 4a3b`)).toBe(Color.BLACK);
    const sfenWhite = "lnsgkgsnl/1r5b1/p1ppppppp/1p7/7P1/9/PPPPPPP1P/1B5R1/LNSGKGSNL w - 1";
    expect(getNextColorFromUSI(`position sfen ${sfenWhite}`)).toBe(Color.WHITE);
    expect(getNextColorFromUSI(`position sfen ${sfenWhite} moves 8d8e`)).toBe(Color.BLACK);
  });

  it("append/goBack/goForward/goto", () => {
    const record = new Record();
    const onChangePosition = vi.fn();
    record.on("changePosition", onChangePosition);
    const move = (ff: number, fr: number, tf: number, tr: number): Move => {
      return record.position.createMove(new Square(ff, fr), new Square(tf, tr)) as Move;
    };
    // 76歩
    expect(record.append(move(7, 7, 7, 6))).toBeTruthy();
    expect(onChangePosition).toBeCalledTimes(1);
    expect(record.current.nextColor).toBe(Color.WHITE);
    // 76歩 -> 34歩
    expect(record.append(move(3, 3, 3, 4))).toBeTruthy();
    expect(onChangePosition).toBeCalledTimes(2);
    expect(record.current.nextColor).toBe(Color.BLACK);
    // 76歩 -> 34歩 -> 26歩
    expect(record.append(move(2, 7, 2, 6))).toBeTruthy();
    expect(onChangePosition).toBeCalledTimes(3);
    expect(record.current.nextColor).toBe(Color.WHITE);
    // go back
    expect(record.goBack()).toBeTruthy();
    expect(onChangePosition).toBeCalledTimes(4);
    // go back
    expect(record.goBack()).toBeTruthy();
    expect(onChangePosition).toBeCalledTimes(5);
    // 76歩 -> 34歩 (again)
    expect(record.append(move(3, 3, 3, 4))).toBeTruthy();
    expect(record.current.hasBranch).toBeFalsy(); // 登録済みの指し手なので分岐は作られない。
    expect(onChangePosition).toBeCalledTimes(6);
    // go back
    expect(record.goBack()).toBeTruthy();
    expect(onChangePosition).toBeCalledTimes(7);
    // 76歩 -> 84歩
    expect(record.append(move(8, 3, 8, 4))).toBeTruthy();
    expect(record.current.hasBranch).toBeTruthy(); // 分岐が作られる。
    expect(onChangePosition).toBeCalledTimes(8);
    // 76歩 -> 84歩 -> 78金
    expect(record.append(move(7, 9, 7, 8))).toBeTruthy();
    expect(onChangePosition).toBeCalledTimes(9);
    // 76歩 -> 84歩 -> 78金 -> 84飛 (invalid move)
    expect(record.append(move(8, 2, 8, 4))).toBeFalsy();
    expect(onChangePosition).toBeCalledTimes(9); // not called

    // go back
    expect(record.goBack()).toBeTruthy();
    expect(onChangePosition).toBeCalledTimes(10);
    // go back
    expect(record.goBack()).toBeTruthy();
    expect(onChangePosition).toBeCalledTimes(11);
    // go back
    expect(record.goBack()).toBeTruthy();
    expect(onChangePosition).toBeCalledTimes(12);
    expect(record.usi).toBe("position startpos");
    // go back (failed)
    expect(record.goBack()).toBeFalsy();
    expect(onChangePosition).toBeCalledTimes(12); // not called

    // go forward
    expect(record.goForward()).toBeTruthy();
    expect(onChangePosition).toBeCalledTimes(13);
    // go end
    record.goto(Number.MAX_SAFE_INTEGER);
    expect(onChangePosition).toBeCalledTimes(14);
    expect(record.usi).toBe("position startpos moves 7g7f 8c8d 7i7h");
    // go forward (failed)
    expect(record.goForward()).toBeFalsy();
    expect(onChangePosition).toBeCalledTimes(14); // not called

    // interrupt
    expect(record.append(SpecialMoveType.INTERRUPT)).toBeTruthy();
    expect(onChangePosition).toBeCalledTimes(15);
    // interrupt (again)
    expect(record.append(SpecialMoveType.INTERRUPT)).toBeTruthy();
    expect(record.current.hasBranch).toBeFalsy(); // 登録済みの指し手なので分岐は増やさない。
    expect(onChangePosition).toBeCalledTimes(16);

    // go to 2nd move
    record.goto(2);
    expect(onChangePosition).toBeCalledTimes(17);
    expect(record.usi).toBe("position startpos moves 7g7f 8c8d");
    // go to 2nd move (no change)
    record.goto(2);
    expect(onChangePosition).toBeCalledTimes(17); // not called
    // switch branch
    expect(record.switchBranchByIndex(0)).toBeTruthy();
    expect(onChangePosition).toBeCalledTimes(18);
    expect(record.usi).toBe("position startpos moves 7g7f 3c3d");
  });

  it("merge", () => {
    const data1 = `手合割：平手
▲２六歩    △８四歩    ▲２五歩    △８五歩
*戦法の分岐点
&第1図
▲７八金
*相掛かりを志向
△３二金`;
    const data2 = `手合割：平手
▲２六歩    △８四歩    ▲２五歩    △８五歩
*戦法の分岐点
&再掲第1図
*相掛かりを目指すなら７八金
*角換わりを目指すなら７六歩
▲７六歩
*角換わりを志向
△３二金    ▲７七角    △３四歩    ▲６八銀
&第2図

変化：8手
△１四歩
*角換わりを拒否`;
    const data3 = `手合割：角落ち
△８四歩    ▲７六歩    △８五歩    ▲７七角    △６二銀    ▲７八銀`;
    const expected = `手合割：平手
▲２六歩    △８四歩    ▲２五歩    △８五歩
*戦法の分岐点
&第1図
▲７八金
*相掛かりを志向
△３二金

変化：5手
▲７六歩
*角換わりを志向
△３二金    ▲７七角    △３四歩    ▲６八銀
&第2図

変化：8手
△１四歩
*角換わりを拒否
`;

    const record1 = importKI2(data1) as Record;
    const record2 = importKI2(data2) as Record;
    const record3 = importKI2(data3) as Record;
    const onChangePosition = vi.fn();
    record1.goto(2);
    record1.on("changePosition", onChangePosition);

    expect(record1.merge(record2)).toBeTruthy();
    expect(exportKI2(record1, {})).toBe(expected);
    expect(record1.current.ply).toBe(2);

    expect(record1.merge(record3)).toBeFalsy();
    expect(exportKI2(record1, {})).toBe(expected);
    expect(record1.current.ply).toBe(2);

    expect(onChangePosition).toBeCalledTimes(0);
  });

  it("merge:withElapsedTime", () => {
    const data1 = `手合割：平手
1 ２六歩(27)   ( 0:03/00:00:03)
2 ３四歩(33)   ( 0:01/00:00:01)
3 ７六歩(77)   ( 0:02/00:00:05)
4 ３二金(41)
5 ２五歩(26)
6 中断`;
    const data2 = `手合割：平手
1 ２六歩(27)   ( 0:05/00:00:05)
2 ３四歩(33)   ( 0:02/00:00:02)
3 ７六歩(77)   ( 0:06/00:00:11)
4 ３二金(41)   ( 0:07/00:00:10)
5 ２五歩(26)   ( 0:02/00:00:14)
6 中断         ( 0:01/00:00:11)`;
    const expected = `# KIF形式棋譜ファイル Generated by Electron Shogi
手合割：平手
手数----指手---------消費時間--
   1 ２六歩(27)   ( 0:03/00:00:03)
   2 ３四歩(33)   ( 0:01/00:00:01)
   3 ７六歩(77)   ( 0:02/00:00:05)
   4 ３二金(41)   ( 0:07/00:00:08)
   5 ２五歩(26)   ( 0:02/00:00:07)
   6 中断         ( 0:01/00:00:09)
`;

    const record1 = importKIF(data1) as Record;
    const record2 = importKIF(data2) as Record;

    expect(record1.merge(record2)).toBeTruthy();
    expect(exportKIF(record1, {})).toBe(expected);
  });

  it("repetition", () => {
    const data = `
手合割：平手
手数----指手---------消費時間--
   1 ２六歩(27)        ( 0:00/00:00:00)
   2 ８四歩(83)        ( 0:00/00:00:00)
   3 ７六歩(77)        ( 0:00/00:00:00)
   4 ８五歩(84)        ( 0:00/00:00:00)
   5 ７七角(88)        ( 0:00/00:00:00)
   6 ３四歩(33)        ( 0:00/00:00:00)
   7 ６八銀(79)        ( 0:00/00:00:00)
   8 ３二金(41)        ( 0:00/00:00:00)
   9 ２五歩(26)        ( 0:00/00:00:00)
  10 ７七角成(22)       ( 0:00/00:00:00)
  11 同　銀(68)        ( 0:00/00:00:00)
  12 ２二銀(31)        ( 0:00/00:00:00)
  13 ４八銀(39)        ( 0:00/00:00:00)
  14 ３三銀(22)        ( 0:00/00:00:00)
  15 ４六歩(47)        ( 0:00/00:00:00)
  16 ６二銀(71)        ( 0:00/00:00:00)
  17 ３六歩(37)        ( 0:00/00:00:00)
  18 ４二玉(51)        ( 0:00/00:00:00)
  19 ３七桂(29)        ( 0:00/00:00:00)
  20 ６四歩(63)        ( 0:00/00:00:00)
  21 ６八玉(59)        ( 0:00/00:00:00)
  22 ６三銀(62)        ( 0:00/00:00:00)
  23 ７八金(69)        ( 0:00/00:00:00)
  24 ７四歩(73)        ( 0:00/00:00:00)
  25 ４七銀(48)        ( 0:00/00:00:00)
  26 ７三桂(81)        ( 0:00/00:00:00)
  27 １六歩(17)        ( 0:00/00:00:00)
  28 １四歩(13)        ( 0:00/00:00:00)
  29 ９六歩(97)        ( 0:00/00:00:00)
  30 ９四歩(93)        ( 0:00/00:00:00)
  31 ４八金(49)        ( 0:00/00:00:00)
  32 ８一飛(82)        ( 0:00/00:00:00)
  33 ２九飛(28)        ( 0:00/00:00:00)
  34 ６二金(61)        ( 0:00/00:00:00)
  35 ５六銀(47)        ( 0:00/00:00:00)
  36 ５四銀(63)        ( 0:00/00:00:00)
  37 ６六歩(67)        ( 0:00/00:00:00)
  38 ６三銀(54)        ( 0:00/00:00:00)
  39 ４七銀(56)        ( 0:00/00:00:00)
  40 ５四銀(63)        ( 0:00/00:00:00)
  41 ５六銀(47)        ( 0:00/00:00:00)
  42 ６三銀(54)        ( 0:00/00:00:00)
  43 ４七銀(56)        ( 0:00/00:00:00)
  44 ５四銀(63)        ( 0:00/00:00:00)
  45 ５六銀(47)        ( 0:00/00:00:00)
  46 ６三銀(54)        ( 0:00/00:00:00)
  47 ４七銀(56)        ( 0:00/00:00:00)
  48 ５四銀(63)        ( 0:00/00:00:00)
  49 ５六銀(47)        ( 0:00/00:00:00)
`;
    const record = importKIF(data) as Record;
    record.goto(49);
    expect(record.repetition).toBeTruthy();
    expect(record.perpetualCheck).toBeFalsy();
    record.goBack();
    expect(record.repetition).toBeFalsy();
    expect(record.perpetualCheck).toBeFalsy();
  });

  it("perpetualCheck/black", () => {
    const data = `
後手の持駒：金 歩五 
  ９ ８ ７ ６ ５ ４ ３ ２ １
+---------------------------+
| 龍 ・ ・ ・ ・ ・ ・v桂v香|一
| ・ ・ ・ ・ ・ ・v銀 ・v玉|二
|v歩 ・v桂 ・ ・v銀 ・v銀 ・|三
| ・v金 ・ ・ ・ 角v歩 ・v歩|四
| ・ ・v歩 歩 歩 桂 歩v歩 ・|五
| 玉 歩v銀 ・ ・ 金 ・ ・ 歩|六
| 桂 ・ ・ ・v歩 ・ ・ ・ ・|七
| ・ 金 ・ ・ ・ ・v龍 ・ ・|八
| 香 香 ・ ・ ・ ・ ・ ・ ・|九
+---------------------------+
先手の持駒：角 香 歩二 
手数----指手---------消費時間--
   1 １三香打           ( 0:00/00:00:00)
   2 同　玉(12)        ( 0:00/00:00:00)
   3 ３一角打           ( 0:00/00:00:00)
   4 ２四玉(13)        ( 0:00/00:00:00)
   5 ４二角成(31)       ( 0:00/00:00:00)
   6 １三玉(24)        ( 0:00/00:00:00)
   7 ３一馬(42)        ( 0:00/00:00:00)
   8 ２四玉(13)        ( 0:00/00:00:00)
   9 ４二馬(31)        ( 0:00/00:00:00)
  10 １三玉(24)        ( 0:00/00:00:00)
  11 ３一馬(42)        ( 0:00/00:00:00)
  12 ２四玉(13)        ( 0:00/00:00:00)
  13 ４二馬(31)        ( 0:00/00:00:00)
  14 １三玉(24)        ( 0:00/00:00:00)
  15 ３一馬(42)        ( 0:00/00:00:00)
  16 ２四玉(13)        ( 0:00/00:00:00)
  17 ４二馬(31)        ( 0:00/00:00:00)
`;
    const record = importKIF(data) as Record;
    record.goto(17);
    expect(record.repetition).toBeTruthy();
    expect(record.perpetualCheck).toBe(Color.BLACK);
    record.goBack();
    expect(record.repetition).toBeFalsy();
    expect(record.perpetualCheck).toBeNull();
  });

  it("perpetualCheck/white", () => {
    const data = `
後手の持駒：歩三 
  ９ ８ ７ ６ ５ ４ ３ ２ １
+---------------------------+
| ・v桂 ・ ・ ・ ・ ・v香v香|一
| ・ ・ ・ ・ 飛 ・ ・v金 ・|二
| ・v金 ・ ・ 歩 ・ ・ ・v桂|三
|v歩 ・ ・ ・ ・ ・ 銀v歩v玉|四
| ・ 玉v歩 ・v歩v歩 歩 ・ ・|五
| 歩 ・ 歩v角 ・ ・ ・ 金 ・|六
| ・ 銀 ・ 銀 ・ ・ 桂 ・ 歩|七
| ・ ・ 銀 ・ ・ ・ ・ ・ ・|八
| 香 桂v馬 ・ ・ ・ ・ ・v龍|九
+---------------------------+
先手の持駒：金 香 歩五 
後手番
手数----指手---------消費時間--
   1 ７三桂(81)        ( 0:00/00:00:00)
   2 ８六玉(85)        ( 0:00/00:00:00)
   3 ６八馬(79)        ( 0:00/00:00:00)
   4 ９七玉(86)        ( 0:00/00:00:00)
   5 ７九馬(68)        ( 0:00/00:00:00)
   6 ８六玉(97)        ( 0:00/00:00:00)
   7 ６八馬(79)        ( 0:00/00:00:00)
   8 ９七玉(86)        ( 0:00/00:00:00)
   9 ７九馬(68)        ( 0:00/00:00:00)
  10 ８六玉(97)        ( 0:00/00:00:00)
  11 ６八馬(79)        ( 0:00/00:00:00)
  12 ９七玉(86)        ( 0:00/00:00:00)
  13 ７九馬(68)        ( 0:00/00:00:00)
  14 ８六玉(97)        ( 0:00/00:00:00)
`;
    const record = importKIF(data) as Record;
    record.goto(14);
    expect(record.repetition).toBeTruthy();
    expect(record.perpetualCheck).toBe(Color.WHITE);
    record.goBack();
    expect(record.repetition).toBeFalsy();
    expect(record.perpetualCheck).toBeNull();
  });

  it("swapWithNextBranch", () => {
    const data = `
# KIF形式棋譜ファイル Generated by Electron Shogi
1 ７六歩(77) ( 0:00/0:00:00)
2 ３四歩(33) ( 0:00/0:00:00)
3 ７五歩(76) ( 0:00/0:00:00)
4 ８四歩(83) ( 0:00/0:00:00)+
5 ７八飛(28) ( 0:00/0:00:00)
変化：4手
4 ６二銀(71) ( 0:00/0:00:00)
5 ７八飛(28) ( 0:00/0:00:00)
変化：4手
4 ３五歩(34) ( 0:00/0:00:00)
5 ７八飛(28) ( 0:00/0:00:00)
6 ３二飛(82) ( 0:00/0:00:00)
`;
    const record = importKIF(data) as Record;
    record.goto(4);
    expect(record.current.branchIndex).toBe(0);
    record.swapWithPreviousBranch();
    expect(record.current.branchIndex).toBe(0);
    record.swapWithNextBranch();
    expect(record.current.branchIndex).toBe(1);
    record.swapWithNextBranch();
    expect(record.current.branchIndex).toBe(2);
    record.swapWithNextBranch();
    expect(record.current.branchIndex).toBe(2);
    record.switchBranchByIndex(1);
    record.swapWithPreviousBranch();
    expect(record.current.branchIndex).toBe(0);
    expect(exportKIF(record, {})).toBe(
      `# KIF形式棋譜ファイル Generated by Electron Shogi
手合割：平手
手数----指手---------消費時間--
   1 ７六歩(77)   ( 0:00/00:00:00)
   2 ３四歩(33)   ( 0:00/00:00:00)
   3 ７五歩(76)   ( 0:00/00:00:00)
   4 ３五歩(34)   ( 0:00/00:00:00)+
   5 ７八飛(28)   ( 0:00/00:00:00)
   6 ３二飛(82)   ( 0:00/00:00:00)

変化：4手
   4 ６二銀(71)   ( 0:00/00:00:00)+
   5 ７八飛(28)   ( 0:00/00:00:00)

変化：4手
   4 ８四歩(83)   ( 0:00/00:00:00)
   5 ７八飛(28)   ( 0:00/00:00:00)
`,
    );
  });

  it("removeCurrentMove", () => {
    const data = `
1 ７六歩(77)
2 ３四歩(33)
3 ７五歩(76)
4 ８四歩(83)
5 ７八飛(28)
`;
    const record = importKIF(data) as Record;

    record.goto(4);
    expect(record.current.ply).toBe(4);
    expect(record.removeCurrentMove()).toBeTruthy();
    expect(record.moves.length).toBe(4);
    expect(record.current.ply).toBe(3);

    record.goto(0);
    expect(record.current.ply).toBe(0);
    expect(record.removeCurrentMove()).toBeTruthy();
    expect(record.moves.length).toBe(1);
    expect(record.current.ply).toBe(0);

    expect(record.removeCurrentMove()).toBeFalsy();
    expect(record.moves.length).toBe(1);
    expect(record.current.ply).toBe(0);
  });

  it("removeNextMove", () => {
    const data = `
1 ７六歩(77)
2 ３四歩(33)
3 ７五歩(76)
4 ８四歩(83)
5 ７八飛(28)
`;
    const record = importKIF(data) as Record;

    record.goto(5);
    expect(record.current.ply).toBe(5);
    expect(record.removeNextMove()).toBeFalsy();
    expect(record.moves.length).toBe(6);
    expect(record.current.ply).toBe(5);

    record.goto(4);
    expect(record.current.ply).toBe(4);
    expect(record.removeNextMove()).toBeTruthy();
    expect(record.moves.length).toBe(5);
    expect(record.current.ply).toBe(4);

    record.goto(0);
    expect(record.current.ply).toBe(0);
    expect(record.removeCurrentMove()).toBeTruthy();
    expect(record.moves.length).toBe(1);
    expect(record.current.ply).toBe(0);

    expect(record.removeCurrentMove()).toBeFalsy();
    expect(record.moves.length).toBe(1);
    expect(record.current.ply).toBe(0);
  });

  it("bookmark", () => {
    const data = `
手合割：平手
手数----指手---------消費時間--
&開始局面
1 ７六歩(77) ( 0:08/0:00:08)
2 ３四歩(33) ( 0:12/0:00:12)
&第1図
3 ２二角成(88) ( 0:15/0:00:23)
4 ２二銀(31) ( 0:03/0:00:15)+
&第2図
5 ４五角打 ( 0:06/0:00:29)
&最終図

変化：4手
4 ２二飛(82) ( 0:05/0:00:17)
&変化図
`;
    const record = importKIF(data) as Record;
    expect(record.bookmarks).toStrictEqual(["開始局面", "第1図", "第2図", "最終図", "変化図"]);
    expect(record.jumpToBookmark("第1図")).toBeTruthy();
    expect(record.current.ply).toBe(2);
    expect((record.current.move as Move).usi).toBe("3c3d");
    expect(record.jumpToBookmark("第1図")).toBeTruthy(); // not changed
    expect(record.current.ply).toBe(2);
    expect((record.current.move as Move).usi).toBe("3c3d");
    expect(record.jumpToBookmark("第2図")).toBeTruthy();
    expect(record.current.ply).toBe(4);
    expect((record.current.move as Move).usi).toBe("3a2b");
    expect(record.jumpToBookmark("第3図")).toBeFalsy(); // not found
    expect(record.current.ply).toBe(4);
    expect((record.current.move as Move).usi).toBe("3a2b");
    expect(record.jumpToBookmark("最終図")).toBeTruthy();
    expect(record.current.ply).toBe(5);
    expect((record.current.move as Move).usi).toBe("B*4e");
    expect(record.jumpToBookmark("変化図")).toBeTruthy();
    expect(record.current.ply).toBe(4);
    expect((record.current.move as Move).usi).toBe("8b2b");
    expect(record.jumpToBookmark("開始局面")).toBeTruthy();
    expect(record.current.ply).toBe(0);
  });

  it("forEach", () => {
    const data = `
手合割：平手
▲５六歩△３四歩▲５八飛△３二飛▲７六歩△４二銀
まで6手で中断
変化：4手
△６二銀▲７六歩
変化：1手
▲７六歩△３四歩▲６六歩△３二飛
`;
    const record = importKI2(data) as Record;
    const results: [string, string][] = [];
    record.forEach((node, pos) => {
      results.push([
        node.move instanceof Move ? formatMove(pos, node.move) : formatSpecialMove(node.move),
        pos.getSFEN(node.ply),
      ]);
    });
    expect(results).toStrictEqual([
      ["開始局面", "lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL b - 1"],
      ["☗５六歩", "lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL b - 1"],
      ["☖３四歩", "lnsgkgsnl/1r5b1/ppppppppp/9/9/4P4/PPPP1PPPP/1B5R1/LNSGKGSNL w - 2"],
      ["☗５八飛", "lnsgkgsnl/1r5b1/pppppp1pp/6p2/9/4P4/PPPP1PPPP/1B5R1/LNSGKGSNL b - 3"],
      ["☖３二飛", "lnsgkgsnl/1r5b1/pppppp1pp/6p2/9/4P4/PPPP1PPPP/1B2R4/LNSGKGSNL w - 4"],
      ["☗７六歩", "lnsgkgsnl/6rb1/pppppp1pp/6p2/9/4P4/PPPP1PPPP/1B2R4/LNSGKGSNL b - 5"],
      ["☖４二銀", "lnsgkgsnl/6rb1/pppppp1pp/6p2/9/2P1P4/PP1P1PPPP/1B2R4/LNSGKGSNL w - 6"],
      ["中断", "lnsgkg1nl/5srb1/pppppp1pp/6p2/9/2P1P4/PP1P1PPPP/1B2R4/LNSGKGSNL b - 7"],
      ["☖６二銀", "lnsgkgsnl/1r5b1/pppppp1pp/6p2/9/4P4/PPPP1PPPP/1B2R4/LNSGKGSNL w - 4"],
      ["☗７六歩", "ln1gkgsnl/1r1s3b1/pppppp1pp/6p2/9/4P4/PPPP1PPPP/1B2R4/LNSGKGSNL b - 5"],
      ["☗７六歩", "lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL b - 1"],
      ["☖３四歩", "lnsgkgsnl/1r5b1/ppppppppp/9/9/2P6/PP1PPPPPP/1B5R1/LNSGKGSNL w - 2"],
      ["☗６六歩", "lnsgkgsnl/1r5b1/pppppp1pp/6p2/9/2P6/PP1PPPPPP/1B5R1/LNSGKGSNL b - 3"],
      ["☖３二飛", "lnsgkgsnl/1r5b1/pppppp1pp/6p2/9/2PP5/PP2PPPPP/1B5R1/LNSGKGSNL w - 4"],
    ]);
  });

  it("newByUSI/position-startpos", () => {
    // 平手100手
    const data =
      "position startpos moves 2g2f 3c3d 7g7f 4c4d 3i4h 3a3b 5g5f 9c9d 9g9f 3b4c 4i5h 2b3c 3g3f 4a3b 7i7h 5c5d 6g6f 8b5b 5i6h 5a6b 6f6e 4d4e 8h3c+ 2a3c 7h6g 5d5e 5f5e 5b5e 6g6f 5e5a 6h7h 6b7b 5h6g 7b8b 6i6h 7a7b 4h5g 4e4f 4g4f B*4g B*1h 3d3e 3f3e P*3h 5g4h 4g5h+ 6f5g 5h4i 1h2g 3h3i+ 2g4i 3i4i 4h4g B*3i 2h1h 5a5g+ 6h5g 4i4h 4g3f S*2h 3e3d 2h2i 3d3c+ 2i1h+ 3c4c R*3h B*1f 4h4g 1f3h 4g5g 6g7g 3i4h+ 4c5b 4h3h 5b6a 3h5f 7h8h 7b6a R*5a N*8e G*7i G*6f R*5b 6a5b 5a5b+ R*7b 5b7b 8b7b R*5b 7b6a 5b5f+ 5g5f 7g7h R*4h B*4d 5f6g S*6b 6a7b 4d6f 6g6f resign";
    const record = Record.newByUSI(data) as Record;
    expect(record).toBeInstanceOf(Record);
    expect(record.length).toBe(100);
  });

  it("newByUSI/position-sfen", () => {
    // 飛車香落ち51手
    const data =
      "position sfen lnsgkgsn1/7b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL b - 1 moves 7g7f 3c3d 2g2f 4c4d 2f2e 2b3c 1g1f 3a4b 1f1e 4b4c 2h1h 4a3b 1e1d 1c1d 1h1d P*1c 1d1h 5a4b 4g4f 6a7b 1h4h 7a6b 3i3h 5c5d 3h4g 6b5c 4g5f 7c7d P*1b 8a7c 4f4e 6c6d 4e4d 5c4d P*4e 4d5e 5f5e 5d5e S*4d 4c4d 4e4d S*5d 1b1a+ 3c1a S*1b 1a3c 1b2a P*4e 2a3b+ 4b3b N*6f";
    const record = Record.newByUSI(data) as Record;
    expect(record).toBeInstanceOf(Record);
    expect(record.length).toBe(51);
  });

  it("newByUSI/startpos", () => {
    // 平手100手
    const data =
      "startpos moves 2g2f 3c3d 7g7f 4c4d 3i4h 3a3b 5g5f 9c9d 9g9f 3b4c 4i5h 2b3c 3g3f 4a3b 7i7h 5c5d 6g6f 8b5b 5i6h 5a6b 6f6e 4d4e 8h3c+ 2a3c 7h6g 5d5e 5f5e 5b5e 6g6f 5e5a 6h7h 6b7b 5h6g 7b8b 6i6h 7a7b 4h5g 4e4f 4g4f B*4g B*1h 3d3e 3f3e P*3h 5g4h 4g5h+ 6f5g 5h4i 1h2g 3h3i+ 2g4i 3i4i 4h4g B*3i 2h1h 5a5g+ 6h5g 4i4h 4g3f S*2h 3e3d 2h2i 3d3c+ 2i1h+ 3c4c R*3h B*1f 4h4g 1f3h 4g5g 6g7g 3i4h+ 4c5b 4h3h 5b6a 3h5f 7h8h 7b6a R*5a N*8e G*7i G*6f R*5b 6a5b 5a5b+ R*7b 5b7b 8b7b R*5b 7b6a 5b5f+ 5g5f 7g7h R*4h B*4d 5f6g S*6b 6a7b 4d6f 6g6f resign";
    const record = Record.newByUSI(data) as Record;
    expect(record).toBeInstanceOf(Record);
    expect(record.length).toBe(100);
  });

  it("newByUSI/sfen", () => {
    // 飛車香落ち51手
    const data =
      "sfen lnsgkgsn1/7b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL b - 1 moves 7g7f 3c3d 2g2f 4c4d 2f2e 2b3c 1g1f 3a4b 1f1e 4b4c 2h1h 4a3b 1e1d 1c1d 1h1d P*1c 1d1h 5a4b 4g4f 6a7b 1h4h 7a6b 3i3h 5c5d 3h4g 6b5c 4g5f 7c7d P*1b 8a7c 4f4e 6c6d 4e4d 5c4d P*4e 4d5e 5f5e 5d5e S*4d 4c4d 4e4d S*5d 1b1a+ 3c1a S*1b 1a3c 1b2a P*4e 2a3b+ 4b3b N*6f";
    const record = Record.newByUSI(data) as Record;
    expect(record).toBeInstanceOf(Record);
    expect(record.length).toBe(51);
  });

  it("newByUSI/moves", () => {
    // 平手100手
    const data =
      "moves 2g2f 3c3d 7g7f 4c4d 3i4h 3a3b 5g5f 9c9d 9g9f 3b4c 4i5h 2b3c 3g3f 4a3b 7i7h 5c5d 6g6f 8b5b 5i6h 5a6b 6f6e 4d4e 8h3c+ 2a3c 7h6g 5d5e 5f5e 5b5e 6g6f 5e5a 6h7h 6b7b 5h6g 7b8b 6i6h 7a7b 4h5g 4e4f 4g4f B*4g B*1h 3d3e 3f3e P*3h 5g4h 4g5h+ 6f5g 5h4i 1h2g 3h3i+ 2g4i 3i4i 4h4g B*3i 2h1h 5a5g+ 6h5g 4i4h 4g3f S*2h 3e3d 2h2i 3d3c+ 2i1h+ 3c4c R*3h B*1f 4h4g 1f3h 4g5g 6g7g 3i4h+ 4c5b 4h3h 5b6a 3h5f 7h8h 7b6a R*5a N*8e G*7i G*6f R*5b 6a5b 5a5b+ R*7b 5b7b 8b7b R*5b 7b6a 5b5f+ 5g5f 7g7h R*4h B*4d 5f6g S*6b 6a7b 4d6f 6g6f resign";
    const record = Record.newByUSI(data) as Record;
    expect(record).toBeInstanceOf(Record);
    expect(record.length).toBe(100);
  });

  it("newByUSI/sfen-no-moves", () => {
    // 平手途中局面・指し手無し
    const data =
      "sfen ln1g2g1l/2s2k3/2ppp3p/5p2b/P2r1N3/2P2P3/1P1PP1P1P/1SGKG2+R1/LN5NL b S5Pbs 57";
    const record = Record.newByUSI(data) as Record;
    expect(record).toBeInstanceOf(Record);
    expect(record.length).toBe(0);
  });
});
