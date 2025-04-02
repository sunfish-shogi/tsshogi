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
  Position,
  InitialPositionSFEN,
} from "../";

describe("record", () => {
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

  it("usen/single", () => {
    const data = `手合割：平手
▲２六歩    △８四歩    ▲７六歩    △８五歩
まで4手で持将棋
`;
    const record = importKI2(data) as Record;
    expect(record.usen).toEqual(["~0.6y236e7ku4be.j", 0]);
    const record2 = Record.newByUSEN(record.usen[0]) as Record;
    expect(record2).toBeInstanceOf(Record);
    expect(record2.current.ply).toBe(0);
    expect(exportKI2(record2, {})).toBe(data);
  });

  it("usen/branches", () => {
    const data = `手合割：平手
▲７六歩    △３四歩    ▲２六歩    △８四歩    ▲２五歩    △８五歩
▲４八銀    △６二銀    ▲５六歩    △３二金    ▲５七銀    △５四歩
▲７八金    △５三銀    ▲４六銀    △４四歩    ▲６八銀    △４二銀上
▲６九玉    △３三角    ▲７七銀    △４三銀    ▲５八金    △６四銀
▲７九角    △６五銀    ▲５七銀    △４二角    ▲６六歩    △７四銀
▲４六銀    △４一玉    ▲３六歩    △５二金    ▲３五歩    △同　歩
▲同　銀    △３一玉    ▲２四歩    △同　歩    ▲２二歩    △同　玉
▲６七金右  △６四角    ▲４六角    △同　角    ▲同　歩    △４七角
▲５九玉    △３七歩    ▲同　桂    △３六角成  ▲２六角    △２五歩
▲２三歩    △同　金    ▲２五桂    △２七歩    ▲２九飛    △３二玉
▲３九飛    △２五馬    ▲２四歩    △３三金    ▲６八玉    △２八歩成
▲３七飛    △３四歩    ▲７九玉    △３五歩    ▲同　角    △１九と
▲２三歩成  △同　玉    ▲２七飛    △２六歩    ▲同　角    △３六馬
▲４四角    △２七馬    ▲７一角成  △４九飛    ▲８八玉    △８四飛
▲３四歩    △同　金    ▲３五歩    △２四金    ▲６八金引  △２二歩
▲９八玉    △５九飛成  ▲８八銀    △９四桂    ▲７七金右  △８六歩
▲同　歩    △同　桂    ▲同　金    △同　飛    ▲８七歩    △７六飛
▲７九歩    △１七馬    ▲３六桂    △３五馬    ▲同　馬    △同　金
▲４一角    △３三玉    ▲５二角成  △同　銀    ▲２四金    △４三玉
▲７七金    △同　飛成  ▲同　銀    △６七角    ▲４五歩    △７九龍
▲４四歩    △５三玉    ▲８八飛    △７八銀    ▲４三歩成  △同　銀
▲９六歩    △８九銀不成▲同　飛    △同　龍    ▲９七玉    △７五角
▲８六歩    △８七金
まで134手で後手の勝ち

変化：26手
△７四歩    ▲３六歩    △６五銀    ▲５七銀    △７五歩    ▲同　歩
△５五歩    ▲同　歩    △４五歩    ▲６六銀右  △同　銀    ▲同　銀
△６四銀    ▲５六銀    △８六歩    ▲同　歩    △同　飛    ▲８七歩
△８四飛    ▲３七桂    △５二歩    ▲３五歩    △同　歩    ▲４五桂
△４四角    ▲２四歩    △同　歩    ▲７四歩    △同　飛    ▲２四飛
△２三歩    ▲２六飛    △７三桂    ▲７六歩    △８六歩    ▲同　歩
△７六飛    ▲４六歩    △８七歩    ▲同　金    △７四飛    ▲７六歩
△９四歩    ▲７八玉    △９五歩    ▲８八角    △８四飛    ▲６八金
△３三桂    ▲５七銀    △３四銀    ▲６六角    △８一飛    ▲２四歩
△６五桂    ▲２三歩成  △同　銀    ▲４八銀    △７七歩    ▲同　桂
△同　桂成  ▲同　角    △６五桂    ▲６六角    △７七歩    ▲６九玉
△６二玉    ▲３四歩    △同　銀    ▲２一飛成  △４三金    ▲７四桂
△７二玉    ▲１一龍    △４五桂    ▲６一龍    △同　玉    ▲４五歩
△８九飛    ▲７九桂    △６二角    ▲同　桂成  △同　玉    ▲６五銀
△同　銀    ▲７七角    △５六桂    ▲６六香    △６八桂成  ▲同　玉
△８七飛成  ▲同　桂    △５六桂    ▲７九玉    △７八歩    ▲同　玉
△７六銀    ▲７四桂    △５一玉    ▲３一飛    △４一金    ▲２四角
△３三銀    ▲同　飛成  △７七銀成  ▲同　玉    △６八角    ▲８八玉
△７七金    ▲９八玉    △８七金    ▲同　玉    △８六角成  ▲８八玉
△９七馬    ▲同　玉    △９六歩    ▲９八玉    △９七歩成
まで144手で中断

変化：7手
▲７八金    △３二金    ▲４八銀    △６二銀    ▲５六歩    △５四歩
▲５七銀    △５三銀    ▲６六銀    △４二銀上  ▲６九玉    △４一玉
▲６八銀    △７四歩    ▲７七銀上  △５二金    ▲７九角    △３三銀
▲６五銀    △４四歩    ▲５八金    △７五歩    ▲同　歩    △７三桂
▲７六銀引  △８四飛    ▲６六歩    △６四銀    ▲３六歩    △３一角
▲４六角    △４二角    ▲７九玉    △３一玉    ▲８八玉    △４五歩
▲３七角    △４三金右  ▲６七金右  △４四銀    ▲９六歩    △９四歩
▲１六歩    △１四歩    ▲４六歩    △同　歩    ▲同　角    △４五歩
▲３七角    △５五歩    ▲同　歩    △同　銀右  ▲５三歩    △同　角
▲５六歩    △４六銀    ▲２六角    △５五歩    ▲同　歩    △同　銀引
▲２四歩    △同　歩    ▲２三歩    △同　金    ▲５六歩    △６四銀
▲３七角    △３二玉    ▲１五歩    △同　歩    ▲同　香    △同　香
▲同　角    △８六歩    ▲同　歩    △４二角    ▲２五歩    △同　歩
▲４二角成  △同　玉    ▲６一角    △６九角    ▲８七香    △３六角成
▲７二角成  △４六馬    ▲１八飛    △３三玉    ▲６三馬    △１四歩
▲１六飛    △２四玉    ▲４六飛    △同　歩    ▲８五歩    △５三金
▲４二角    △３三飛    ▲５三角成  △同　飛    ▲同　馬    △同　銀左
▲８四歩    △８六歩    ▲３一飛    △８七歩成  ▲同　銀    △８五香
▲２一飛成  △８七香成  ▲同　金    △８五香    ▲１六桂    △１五玉
▲２三龍    △８七香成  ▲同　玉    △６九角    ▲７八香    △５四角
▲７六金打  △１八角成  ▲８三歩成  △８六歩    ▲同　銀    △７九銀
▲８八歩    △８五歩    ▲１七歩    △８六歩    ▲同　金    △５四馬
▲６五歩    △同　馬    ▲７六金上  △７八角成  ▲同　玉    △５六馬
▲６七歩    △６八金    ▲８七玉    △７八銀    ▲９七玉    △８八銀不成
▲同　玉    △４七歩成  ▲２七歩    △８九銀成  ▲同　玉    △６七馬
▲９八玉    △９七香    ▲同　玉    △８五桂打  ▲同　金直  △同　桂
▲同　金    △８七金    ▲同　玉    △８六歩    ▲同　金    △７八馬
▲９七玉    △７九馬    ▲８八香    △同　馬    ▲同　玉    △７八金
▲同　玉    △７七香    ▲同　玉    △７六歩    ▲同　金    △４六歩
▲３三角
まで181手で先手の勝ち
`;
    const record = importKI2(data) as Record;
    record.goto(26);
    record.switchBranchByIndex(1);
    expect(record.usen).toEqual([
      "~0.7ku2jm6y236e5t24be9co0rs7bq0e48c82sq9qc1s87bo2o69us09o9ma1a48lc1j69h82ss8vc42a6382io7ga56c7bo0i672m0n85xm3om6240dm4o22f2be209k8gs1js9to42o776byo9qqbgm97m775by23k2bek1ek722bgk84219m98m5xkbf22em9ls6z39c4bf48mc3om5t48403j31ek732bg24tk4p45so5yk3rdc469uw21wbf42jmbfm3o27habe28uy9hr7lwbog8lc5ge7pe4ge7kw4bwbgw6kubhu6yibp46t40t43k4bvo2em0e92n8bak2j68pu6gv8ucbys6269mc4x62nqc3wbuu3s71no7ty8qw8ve9ve8yybxu7pebce.r~25.31u72m42a63846u6fu3xq66q3t67bs57a7ksbssbtq5ge7pe22wbgw6jw97mbe85xm3om7262jo4o22f25au4au81kbek3kk0wubgcbge7pe47c776bgw8pw6fcbgc3ay9qc4fy9uw46e8ha05m6c82o48ts49ebf232a3j33nk7cobgu9yu57v6ccbos7ksbgu8qs0isbf42f45r31eoboc1ru04i2k600a1vs626c4ebqu3rs45b0na66s42a6ccbp8bks68b9qa9yx9uebp88mcbhc9uu57cboc1r8c04b96bx2bs40a56gv8pubza7lwbcc8uy7le8yw8kx7qe6lg8ug5ky7uy6pz.p~6.9qc0e49co0rs7bq2sq8c81s87bs09o9ma0i69us31u8lc0n88vc1j46ba2o69h846u6fu0wu57c21w7ga2ss72m1949to09o9qu0dm9uw3t66341no8gs2jo7ty3ay6ti2ai7764y672obfo6343xq66q428beq1j8bg852o72kbfq66q6284o22f2bek1ekbg851s5u409m5oi3fi9200207205ge7pe2robfk3k24ip1e6bvsbzsble9p50nd5y683i1j41wsbf07y02jk5p64y66ke2nqbw6c141j92j82wq3s85febgec046lf6gwbke0935gx8pwbkebp03k005k5gx8uebzsblubx8bbu3z14afbge7kwbvcbhebfwbgi5ge6ge7x86ba3xs7gc9qd7qc578bgsbcs8pwbuu7py9uw7uw637bgk8qx8ve67s9zgblg8yybow6ke32e6fwbce7uebge5ge7hc7py8qublw9uw7uw8lu8uublc8pubgc6kubg6bwm.r",
      1,
    ]);
    const record2 = Record.newByUSEN(record.usen[0], 1, 30) as Record;
    expect(record2).toBeInstanceOf(Record);
    expect(record2.current.ply).toBe(30);
    expect(exportKI2(record2 as Record, {})).toBe(data);
    expect(record2.usi).toBe(
      "position startpos moves 7g7f 3c3d 2g2f 8c8d 2f2e 8d8e 3i4h 7a6b 5g5f 4a3b 4h5g 5c5d 6i7h 6b5c 5g4f 4c4d 7i6h 3a4b 5i6i 2b3c 6h7g 4b4c 4i5h 5c6d 8h7i 7c7d 3g3f 6d6e 4f5g 7d7e",
    );
  });

  it("usen/handicap", () => {
    const data = `手合割：二枚落ち
△６二銀    ▲７六歩    △５四歩    ▲４六歩    △５三銀    ▲４五歩
△３二金    ▲３六歩    △６二玉    ▲４八銀    △７二金    ▲４七銀
△７四歩    ▲３五歩    △２二銀    ▲３八飛    △７三金    ▲３四歩
△同　歩    ▲同　飛    △３三歩    ▲３六飛    △６四金    ▲７八金
`;
    const record = importKI2(data) as Record;
    expect(record.usen).toEqual([
      "lnsgkgsnl_9_ppppppppp_9_9_9_PPPPPPPPP_1B5R1_LNSGKGSNL.w.-~0.0rs7ku2sq7761s86260e472m0is9co0nc8c631u5xm09k83m1wu4sm2jm864bem3p431s9qc.",
      0,
    ]);
    const record2 = Record.newByUSEN(record.usen[0]) as Record;
    expect(record2).toBeInstanceOf(Record);
    expect(record2.current.ply).toBe(0);
    expect(exportKI2(record2 as Record, {})).toBe(data);
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
    const expected = `手合割：平手
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

    // 途中で出現した局面
    const position1 = Position.newBySFEN(
      "ln1g3nl/1r1s1kg2/p1ppppspp/6p2/1p5P1/2P2PP2/PPSPP1N1P/5S1R1/LN1GKG2L w Bb 1",
    ) as Position;
    expect(record.getRepetitionCount(position1)).toBe(1);
    // 存在しない局面
    const position2 = Position.newBySFEN(
      "ln5nl/1r1sgkg2/p1ppppspp/6p2/1p5P1/2P2PP2/PPSPP1N1P/5S1R1/LN1GKG2L b Bb 1",
    ) as Position;
    expect(record.getRepetitionCount(position2)).toBe(0);
    // 48手目着手後の局面
    const position3 = Position.newBySFEN(
      "lr5nl/3g1kg2/2n1ppsp1/p1pps1p1p/1p5P1/P1PP1PP1P/1PS1PSN2/2GK1G3/LN5RL b Bb 1",
    ) as Position;
    expect(record.getRepetitionCount(position3)).toBe(3);
    // 49手目着手後の局面
    const position4 = Position.newBySFEN(
      "lr5nl/3g1kg2/2n1ppsp1/p1pps1p1p/1p5P1/P1PPSPP1P/1PS1P1N2/2GK1G3/LN5RL w Bb 1",
    ) as Position;
    expect(record.getRepetitionCount(position4)).toBe(3);
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
      `手合割：平手
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

  it("resetAllBranchSelection", () => {
    const data = `手合割：平手
▲７六歩 △３四歩 ▲２六歩 △８四歩 ▲２五歩 △８五歩
変化：3手
▲６六歩 △８四歩 ▲６八飛
変化：4手
△５四歩 ▲６八飛
変化：3手
▲７五歩 △８四歩
`;
    const record = importKI2(data) as Record;
    record.goto(3);
    record.switchBranchByIndex(2);
    expect(record.current.branchIndex).toBe(2);
    record.resetAllBranchSelection();
    expect(record.current.branchIndex).toBe(0);
    expect((record.current.move as Move).usi).toBe("2g2f");
  });

  it("newByUSI/startpos-no-moves", () => {
    const inputs = ["position startpos", "position startpos moves", "startpos", "startpos moves"];
    for (const input of inputs) {
      const record = Record.newByUSI(input) as Record;
      expect(record).toBeInstanceOf(Record);
      expect(record.initialPosition.sfen).toBe(InitialPositionSFEN.STANDARD);
      expect(record.length).toBe(0);
      expect(record.position.sfen).toBe(InitialPositionSFEN.STANDARD);
    }
  });

  it("newByUSI/startpos", () => {
    // 平手100手・投了
    const inputs = [
      "position startpos moves 2g2f 3c3d 7g7f 4c4d 3i4h 3a3b 5g5f 9c9d 9g9f 3b4c 4i5h 2b3c 3g3f 4a3b 7i7h 5c5d 6g6f 8b5b 5i6h 5a6b 6f6e 4d4e 8h3c+ 2a3c 7h6g 5d5e 5f5e 5b5e 6g6f 5e5a 6h7h 6b7b 5h6g 7b8b 6i6h 7a7b 4h5g 4e4f 4g4f B*4g B*1h 3d3e 3f3e P*3h 5g4h 4g5h+ 6f5g 5h4i 1h2g 3h3i+ 2g4i 3i4i 4h4g B*3i 2h1h 5a5g+ 6h5g 4i4h 4g3f S*2h 3e3d 2h2i 3d3c+ 2i1h+ 3c4c R*3h B*1f 4h4g 1f3h 4g5g 6g7g 3i4h+ 4c5b 4h3h 5b6a 3h5f 7h8h 7b6a R*5a N*8e G*7i G*6f R*5b 6a5b 5a5b+ R*7b 5b7b 8b7b R*5b 7b6a 5b5f+ 5g5f 7g7h R*4h B*4d 5f6g S*6b 6a7b 4d6f 6g6f resign",
      "startpos moves 2g2f 3c3d 7g7f 4c4d 3i4h 3a3b 5g5f 9c9d 9g9f 3b4c 4i5h 2b3c 3g3f 4a3b 7i7h 5c5d 6g6f 8b5b 5i6h 5a6b 6f6e 4d4e 8h3c+ 2a3c 7h6g 5d5e 5f5e 5b5e 6g6f 5e5a 6h7h 6b7b 5h6g 7b8b 6i6h 7a7b 4h5g 4e4f 4g4f B*4g B*1h 3d3e 3f3e P*3h 5g4h 4g5h+ 6f5g 5h4i 1h2g 3h3i+ 2g4i 3i4i 4h4g B*3i 2h1h 5a5g+ 6h5g 4i4h 4g3f S*2h 3e3d 2h2i 3d3c+ 2i1h+ 3c4c R*3h B*1f 4h4g 1f3h 4g5g 6g7g 3i4h+ 4c5b 4h3h 5b6a 3h5f 7h8h 7b6a R*5a N*8e G*7i G*6f R*5b 6a5b 5a5b+ R*7b 5b7b 8b7b R*5b 7b6a 5b5f+ 5g5f 7g7h R*4h B*4d 5f6g S*6b 6a7b 4d6f 6g6f resign",
      "moves 2g2f 3c3d 7g7f 4c4d 3i4h 3a3b 5g5f 9c9d 9g9f 3b4c 4i5h 2b3c 3g3f 4a3b 7i7h 5c5d 6g6f 8b5b 5i6h 5a6b 6f6e 4d4e 8h3c+ 2a3c 7h6g 5d5e 5f5e 5b5e 6g6f 5e5a 6h7h 6b7b 5h6g 7b8b 6i6h 7a7b 4h5g 4e4f 4g4f B*4g B*1h 3d3e 3f3e P*3h 5g4h 4g5h+ 6f5g 5h4i 1h2g 3h3i+ 2g4i 3i4i 4h4g B*3i 2h1h 5a5g+ 6h5g 4i4h 4g3f S*2h 3e3d 2h2i 3d3c+ 2i1h+ 3c4c R*3h B*1f 4h4g 1f3h 4g5g 6g7g 3i4h+ 4c5b 4h3h 5b6a 3h5f 7h8h 7b6a R*5a N*8e G*7i G*6f R*5b 6a5b 5a5b+ R*7b 5b7b 8b7b R*5b 7b6a 5b5f+ 5g5f 7g7h R*4h B*4d 5f6g S*6b 6a7b 4d6f 6g6f resign",
    ];
    for (const input of inputs) {
      const record = Record.newByUSI(input) as Record;
      expect(record).toBeInstanceOf(Record);
      expect(record.initialPosition.sfen).toBe(InitialPositionSFEN.STANDARD);
      expect(record.length).toBe(101);
      record.goto(101);
      expect(record.current.move).toEqual(specialMove(SpecialMoveType.RESIGN));
      expect(record.position.sfen).toBe(
        "ln6l/2kS2g2/1ppp3pp/p8/1n1P5/P1P+p1PSP1/1P6P/1KG2r2+s/LNG5L b GSN3Pr2bp 1",
      );
    }
  });

  it("newByUSI/handicap", () => {
    // 飛車香落ち106手
    const inputs = [
      "position sfen lnsgkgsn1/7b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w - 1 moves 3c3d 7g7f 2b3c 8h3c+ 2a3c 7i7h 3a2b 3i4h 7c7d 5i6h 8a7c 4i5h 9c9d 9g9f 6a5b 2g2f B*4d 7h7g 9d9e 9f9e 7a7b 6i7h 5c5d 9e9d 7d7e 7f7e 7c6e 7g6f 7b7c 9d9c+ 7c6d 7e7d 5a4b P*9b 4b3b 9b9a+ 6d7e B*8h 7e6f 6g6f 3c4e 6f6e 4d8h+ 7h8h B*4i 4h3i S*6f S*4f 4i5h+ 6h5h 4e5g+ 4f5g G*6g 5h4h 6f5g+ 4h3h 6g5h 3h2g 5g4g 7d7c+ 5h4i 3i3h 4g3h 2h3h S*4g 3h7h 4i3i N*5i S*3h 2g1f 3i2i 5i4g 2i2h P*4h 3h2g 1f2e 5b5c 7c6c N*3c 2e1e 1c1d 1e1d 3b3a 6c5c P*1c 1d1e 3c2e 1e2e 2b3c 7h7b+ 2g1f 2e1f P*6b 7b6b 2h1i S*2b 3c2b S*3b 4a3b G*4b 3b4b 5c4b 3a2a 4b3b 2a1a 3b2b",
      "sfen lnsgkgsn1/7b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w - 1 moves 3c3d 7g7f 2b3c 8h3c+ 2a3c 7i7h 3a2b 3i4h 7c7d 5i6h 8a7c 4i5h 9c9d 9g9f 6a5b 2g2f B*4d 7h7g 9d9e 9f9e 7a7b 6i7h 5c5d 9e9d 7d7e 7f7e 7c6e 7g6f 7b7c 9d9c+ 7c6d 7e7d 5a4b P*9b 4b3b 9b9a+ 6d7e B*8h 7e6f 6g6f 3c4e 6f6e 4d8h+ 7h8h B*4i 4h3i S*6f S*4f 4i5h+ 6h5h 4e5g+ 4f5g G*6g 5h4h 6f5g+ 4h3h 6g5h 3h2g 5g4g 7d7c+ 5h4i 3i3h 4g3h 2h3h S*4g 3h7h 4i3i N*5i S*3h 2g1f 3i2i 5i4g 2i2h P*4h 3h2g 1f2e 5b5c 7c6c N*3c 2e1e 1c1d 1e1d 3b3a 6c5c P*1c 1d1e 3c2e 1e2e 2b3c 7h7b+ 2g1f 2e1f P*6b 7b6b 2h1i S*2b 3c2b S*3b 4a3b G*4b 3b4b 5c4b 3a2a 4b3b 2a1a 3b2b chudan",
    ];
    for (const input of inputs) {
      const record = Record.newByUSI(input) as Record;
      expect(record).toBeInstanceOf(Record);
      expect(record.initialPosition.sfen).toBe(InitialPositionSFEN.HANDICAP_ROOK_LANCE);
      expect(record.length).toBe(106);
      record.goto(106);
      expect(record.position.sfen).toBe(
        "+P7k/3+R3+P1/+Pp3p1pp/4p1p2/3P5/7PK/1P3NP1P/1G3P3/LN6g w 2BG2S2NL3Pg2sl 1",
      );
    }
  });

  it("newByUSI/sfen", () => {
    // 平手途中局面
    const inputs = [
      "position sfen ln1g2g1l/2s2k3/2ppp3p/5p2b/P2r1N3/2P2P3/1P1PP1P1P/1SGKG2+R1/LN5NL b S5Pbs 57 moves S*3c 4b4c 3c4d 4c4d 2h2d",
      "position sfen ln1g2g1l/2s2k3/2ppp3p/5p2b/P2r1N3/2P2P3/1P1PP1P1P/1SGKG2+R1/LN5NL b S5Pbs moves S*3c 4b4c 3c4d 4c4d 2h2d",
    ];
    for (const input of inputs) {
      const record = Record.newByUSI(input) as Record;
      expect(record).toBeInstanceOf(Record);
      expect(record.initialPosition.sfen).toBe(
        "ln1g2g1l/2s2k3/2ppp3p/5p2b/P2r1N3/2P2P3/1P1PP1P1P/1SGKG2+R1/LN5NL b S5Pbs 1",
      );
      expect(record.length).toBe(5);
    }
  });

  it("newByUSI/sfen-no-moves", () => {
    // 平手途中局面
    const inputs = [
      "sfen ln1g2g1l/2s2k3/2ppp3p/5p2b/P2r1N3/2P2P3/1P1PP1P1P/1SGKG2+R1/LN5NL b S5Pbs 57",
      "sfen ln1g2g1l/2s2k3/2ppp3p/5p2b/P2r1N3/2P2P3/1P1PP1P1P/1SGKG2+R1/LN5NL b S5Pbs",
    ];
    for (const input of inputs) {
      const record = Record.newByUSI(input) as Record;
      expect(record).toBeInstanceOf(Record);
      expect(record.initialPosition.sfen).toBe(
        "ln1g2g1l/2s2k3/2ppp3p/5p2b/P2r1N3/2P2P3/1P1PP1P1P/1SGKG2+R1/LN5NL b S5Pbs 1",
      );
      expect(record.length).toBe(0);
    }
  });

  it("newByUSI/invalid", () => {
    const inputs = [
      "",
      "xxx",
      "sfen xxx",
      "position xxx",
      "position",
      "position sfen",
      "position sfen xxx",
      "position sfen xxx b - 1 moves",
      "position startpos xxx",
      "position startpos moves 2e2d",
    ];
    for (const input of inputs) {
      const record = Record.newByUSI(input);
      expect(record).toBeInstanceOf(Error);
    }
  });
});
