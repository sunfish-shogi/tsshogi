import { RecordFormatType, detectRecordFormat } from "../";

describe("shogi/detect", () => {
  it("usi", () => {
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
});
