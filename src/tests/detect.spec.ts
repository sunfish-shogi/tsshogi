import { RecordFormatType, detectRecordFormat } from "../";

describe("detect", () => {
  it("usi", () => {
    expect(detectRecordFormat(`position startpos`)).toBe(RecordFormatType.USI);
    expect(detectRecordFormat(`position startpos moves`)).toBe(RecordFormatType.USI);
    expect(
      detectRecordFormat(
        `position sfen l2g2snl/2s1k1gb1/p1nppp1pp/2p3p2/2r6/P2P2P2/2S1PPS1P/1BG4R1/LN2KG1NL b 2P2p 1 moves`,
      ),
    ).toBe(RecordFormatType.USI);
    expect(
      detectRecordFormat(
        `sfen l2g2snl/2s1k1gb1/p1nppp1pp/2p3p2/2r6/P2P2P2/2S1PPS1P/1BG4R1/LN2KG1NL b 2P2p 1`,
      ),
    ).toBe(RecordFormatType.USI);
    expect(detectRecordFormat(`startpos`)).toBe(RecordFormatType.USI);
    expect(detectRecordFormat(`startpos `)).toBe(RecordFormatType.USI);
    expect(detectRecordFormat(`moves `)).toBe(RecordFormatType.USI);
  });

  it("sfen", () => {
    expect(
      detectRecordFormat(
        `l2g2snl/2s1k1gb1/p1nppp1pp/2p3p2/2r6/P2P2P2/2S1PPS1P/1BG4R1/LN2KG1NL b 2P2p 1`,
      ),
    ).toBe(RecordFormatType.SFEN);
  });

  it("csa", () => {
    const data = `
V2.2
N+Electron John
N-Mr.Vue
$EVENT:TypeScript Festival
P1-KY-KE-GI-KI-OU-KI-GI-KE-KY
P2 * -HI *  *  *  *  * -KA * 
P3-FU-FU-FU-FU-FU-FU-FU-FU-FU
P4 *  *  *  *  *  *  *  *  * 
P5 *  *  *  *  *  *  *  *  * 
P6 *  *  *  *  *  *  *  *  * 
P7+FU+FU+FU+FU+FU+FU+FU+FU+FU
P8 * +KA *  *  *  *  * +HI * 
P9+KY+KE+GI+KI+OU+KI+GI+KE+KY
P+
P-
+
+7776FU
T0
-3334FU
T0
+8822UM
T0
-3122GI
T0
+0045KA
T0
`;
    expect(detectRecordFormat(data)).toBe(RecordFormatType.CSA);
  });

  it("kif", () => {
    const data = `
# ----  Kifu for Windows V7 V7.50 棋譜ファイル  ----
手合割：平手　　
先手：奨励会員
後手：久保
手数----指手---------消費時間--
   1 ２六歩(27)   ( 0:00/00:00:00)
   2 ８四歩(83)   ( 0:00/00:00:00)
   3 ７六歩(77)   ( 0:00/00:00:00)
   4 ８五歩(84)   ( 0:00/00:00:00)
   5 ７七角(88)   ( 0:00/00:00:00)
   6 ３二金(41)   ( 0:00/00:00:00)
   7 ６八銀(79)   ( 0:00/00:00:00)
   8 ３四歩(33)   ( 0:00/00:00:00)
   9 ７八金(69)   ( 0:00/00:00:00)
  10 ４二銀(31)   ( 0:00/00:00:00)
  11 ４八銀(39)   ( 0:00/00:00:00)
  12 ６二銀(71)   ( 0:00/00:00:00)
  13 ４六歩(47)   ( 0:00/00:00:00)
  14 ６四歩(63)   ( 0:00/00:00:00)
  15 ４七銀(48)   ( 0:00/00:00:00)
`;
    expect(detectRecordFormat(data)).toBe(RecordFormatType.KIF);
  });

  it("ki2", () => {
    const data = `
開始日時：1582/06/02 04:00:00
棋戦：本能寺の変
戦型：中飛車
場所：本能寺
先手：織田信長
後手：明智光秀

&開始局面
▲２六歩    △３四歩    ▲７六歩    △５四歩    ▲４八銀    △５二飛
▲６八玉    △５五歩    ▲７八玉
&第9手、▲７八玉
△４二銀    ▲５六歩
*角が浮いた瞬間に反発する。
△３三銀    ▲５五歩    △４四銀    ▲５七銀    △５五銀    ▲５六歩
△４四銀    ▲５八金右

変化：10手
△３三角    ▲６八銀    △４二銀    ▲５八金右
`;
    expect(detectRecordFormat(data)).toBe(RecordFormatType.KI2);
  });

  it("jkf", () => {
    expect(detectRecordFormat(`{ "header": {}, "moves": [] }`)).toBe(RecordFormatType.JKF);
    expect(detectRecordFormat(` { "header": {}, "moves": [] } `)).toBe(RecordFormatType.JKF);
    expect(detectRecordFormat(`\n{ "header": {}, "moves": [] }\n`)).toBe(RecordFormatType.JKF);
  });

  it("usen", () => {
    expect(detectRecordFormat("~0.6y236e7ku4be.j")).toBe(RecordFormatType.USEN);
    expect(
      detectRecordFormat(
        "~0.7ku2jm6y236e5t24be9co0rs7bq0e48c82sq9qc1s87bo2o69us09o9ma1a48lc1j69h82ss8vc42a6382io7ga56c7bo0i672m0n85xm3om6240dm4o22f2be209k8gs1js9to42o776byo9qqbgm97m775by23k2bek1ek722bgk84219m98m5xkbf22em9ls6z39c4bf48mc3om5t48403j31ek732bg24tk4p45so5yk3rdc469uw21wbf42jmbfm3o27habe28uy9hr7lwbog8lc5ge7pe4ge7kw4bwbgw6kubhu6yibp46t40t43k4bvo2em0e92n8bak2j68pu6gv8ucbys6269mc4x62nqc3wbuu3s71no7ty8qw8ve9ve8yybxu7pebce.r~25.31u72m42a63846u6fu3xq66q3t67bs57a7ksbssbtq5ge7pe22wbgw6jw97mbe85xm3om7262jo4o22f25au4au81kbek3kk0wubgcbge7pe47c776bgw8pw6fcbgc3ay9qc4fy9uw46e8ha05m6c82o48ts49ebf232a3j33nk7cobgu9yu57v6ccbos7ksbgu8qs0isbf42f45r31eoboc1ru04i2k600a1vs626c4ebqu3rs45b0na66s42a6ccbp8bks68b9qa9yx9uebp88mcbhc9uu57cboc1r8c04b96bx2bs40a56gv8pubza7lwbcc8uy7le8yw8kx7qe6lg8ug5ky7uy6pz.p~6.9qc0e49co0rs7bq2sq8c81s87bs09o9ma0i69us31u8lc0n88vc1j46ba2o69h846u6fu0wu57c21w7ga2ss72m1949to09o9qu0dm9uw3t66341no8gs2jo7ty3ay6ti2ai7764y672obfo6343xq66q428beq1j8bg852o72kbfq66q6284o22f2bek1ekbg851s5u409m5oi3fi9200207205ge7pe2robfk3k24ip1e6bvsbzsble9p50nd5y683i1j41wsbf07y02jk5p64y66ke2nqbw6c141j92j82wq3s85febgec046lf6gwbke0935gx8pwbkebp03k005k5gx8uebzsblubx8bbu3z14afbge7kwbvcbhebfwbgi5ge6ge7x86ba3xs7gc9qd7qc578bgsbcs8pwbuu7py9uw7uw637bgk8qx8ve67s9zgblg8yybow6ke32e6fwbce7uebge5ge7hc7py8qublw9uw7uw8lu8uublc8pubgc6kubg6bwm.r",
      ),
    ).toBe(RecordFormatType.USEN);
    expect(
      detectRecordFormat(
        "lnsgkgsnl_9_ppppppppp_9_9_9_PPPPPPPPP_1B5R1_LNSGKGSNL.w.-~0.0rs7ku2sq7761s86260e472m0is9co0nc8c631u5xm09k83m1wu4sm2jm864bem3p431s9qc.",
      ),
    ).toBe(RecordFormatType.USEN);
  });
});
