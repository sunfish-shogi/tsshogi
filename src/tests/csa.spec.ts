import {
  exportCSA,
  importCSA,
  InitialPositionSFEN,
  Move,
  Position,
  Record,
  RecordMetadataKey,
  specialMove,
  SpecialMoveType,
} from "../";

describe("shogi/csa", () => {
  it("import/standard", () => {
    const data = `
' CSA形式棋譜ファイル Generated by Electron Shogi
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
'無視すべきコメント
'*初手に対するコメント
'*初手に対するコメント2
'** 読み筋と評価値
-3334FU
T0
+8822UM
T10
-3122GI
T20
+0045KA
T30
%TORYO
'*特殊な手に対するコメント
T40
`;
    const record = importCSA(data) as Record;
    expect(record).toBeInstanceOf(Record);
    expect(record.metadata.getStandardMetadata(RecordMetadataKey.BLACK_NAME)).toBe("Electron John");
    expect(record.metadata.getStandardMetadata(RecordMetadataKey.WHITE_NAME)).toBe("Mr.Vue");
    expect(record.initialPosition.sfen).toBe(
      "lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL b - 1",
    );
    expect(record.current.ply).toBe(0);
    expect(record.current.move).toStrictEqual(specialMove(SpecialMoveType.START));
    record.goto(1);
    expect(record.current.displayText).toBe("☗７六歩");
    expect(record.current.comment).toBe(
      "初手に対するコメント\n初手に対するコメント2\n* 読み筋と評価値\n",
    );
    record.goto(2);
    expect(record.current.displayText).toBe("☖３四歩");
    record.goto(3);
    expect(record.current.displayText).toBe("☗２二角成");
    expect(record.current.elapsedMs).toBe(10000);
    record.goto(4);
    expect(record.current.displayText).toBe("☖同　銀");
    expect(record.current.elapsedMs).toBe(20000);
    record.goto(5);
    expect(record.current.displayText).toBe("☗４五角");
    expect(record.current.elapsedMs).toBe(30000);
    record.goto(6);
    expect(record.current.move).toStrictEqual(specialMove(SpecialMoveType.RESIGN));
    expect(record.current.comment).toBe("特殊な手に対するコメント\n");
    expect(record.current.elapsedMs).toBe(40000);
  });

  it("import/standard2", () => {
    const data = `'----------棋譜ファイルの例"example.csa"-----------------
'バージョン
V2.2
'対局者名
N+NAKAHARA
N-YONENAGA
'棋譜情報
'棋戦名
$EVENT:13th World Computer Shogi Championship
'対局場所
$SITE:KAZUSA ARC
'開始日時
$START_TIME:2003/05/03 10:30:00
'終了日時
$END_TIME:2003/05/03 11:11:05
'持ち時間:25分、切れ負け
$TIME_LIMIT:00:25+00
'戦型:矢倉
$OPENING:YAGURA
'平手の局面
P1-KY-KE-GI-KI-OU-KI-GI-KE-KY
P2 * -HI *  *  *  *  * -KA * 
P3-FU-FU-FU-FU-FU-FU-FU-FU-FU
P4 *  *  *  *  *  *  *  *  * 
P5 *  *  *  *  *  *  *  *  * 
P6 *  *  *  *  *  *  *  *  * 
P7+FU+FU+FU+FU+FU+FU+FU+FU+FU
P8 * +KA *  *  *  *  * +HI * 
P9+KY+KE+GI+KI+OU+KI+GI+KE+KY
'先手番
+
'指し手と消費時間
+2726FU
T12
-3334FU
T6
%CHUDAN
'---------------------------------------------------------`;
    const record = importCSA(data) as Record;
    expect(record).toBeInstanceOf(Record);
    expect(record.initialPosition.sfen).toBe(
      "lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL b - 1",
    );
    expect(record.metadata.getStandardMetadata(RecordMetadataKey.BLACK_NAME)).toBe("NAKAHARA");
    expect(record.metadata.getStandardMetadata(RecordMetadataKey.WHITE_NAME)).toBe("YONENAGA");
    expect(record.metadata.getStandardMetadata(RecordMetadataKey.TITLE)).toBe(
      "13th World Computer Shogi Championship",
    );
    expect(record.metadata.getStandardMetadata(RecordMetadataKey.PLACE)).toBe("KAZUSA ARC");
    expect(record.metadata.getStandardMetadata(RecordMetadataKey.START_DATETIME)).toBe(
      "2003/05/03 10:30:00",
    );
    expect(record.metadata.getStandardMetadata(RecordMetadataKey.END_DATETIME)).toBe(
      "2003/05/03 11:11:05",
    );
    expect(record.metadata.getStandardMetadata(RecordMetadataKey.TIME_LIMIT)).toBe("00:25+00");
    expect(record.metadata.getStandardMetadata(RecordMetadataKey.STRATEGY)).toBe("YAGURA");
    expect(record.moves).toHaveLength(4);
    expect(record.moves[0].move).toStrictEqual(specialMove(SpecialMoveType.START));
    expect((record.moves[1].move as Move).usi).toBe("2g2f");
    expect((record.moves[2].move as Move).usi).toBe("3c3d");
    expect(record.moves[3].move).toStrictEqual(specialMove(SpecialMoveType.INTERRUPT));
  });

  it("import/illegal_move", () => {
    const data = `V2.2
PI
+
+7776FU
-3334FU
%ILLEGAL_MOVE
`;
    const record = importCSA(data) as Record;
    expect(record).toBeInstanceOf(Record);
    record.goto(3);
    expect(record.current.move).toStrictEqual(specialMove(SpecialMoveType.FOUL_LOSE));
  });

  it("import/jishogi", () => {
    const data = `V2.2
PI
+
+7776FU
-3334FU
%JISHOGI
`;
    const record = importCSA(data) as Record;
    expect(record).toBeInstanceOf(Record);
    record.goto(3);
    expect(record.current.move).toStrictEqual(specialMove(SpecialMoveType.IMPASS));
  });

  it("import/kachi", () => {
    const data = `V2.2
PI
+
+7776FU
-3334FU
%KACHI
`;
    const record = importCSA(data) as Record;
    expect(record).toBeInstanceOf(Record);
    record.goto(3);
    expect(record.current.move).toStrictEqual(specialMove(SpecialMoveType.ENTERING_OF_KING));
  });

  it("import/custom-position", () => {
    const data = `
V2.2
P1 *  *  *  *  *  *  * -KE * 
P2 *  *  *  *  *  * -KI-OU * 
P3 *  *  *  *  *  * -KI-FU+KE
P4 *  *  *  *  *  *  *  *  * 
P5 *  *  *  *  *  *  *  *  * 
P6 *  *  *  *  *  * -KA * +FU
P7 *  *  *  *  *  *  *  *  * 
P8 *  *  *  *  *  *  *  *  * 
P9 *  *  *  *  *  *  *  *  * 
P+00HI00HI00KI00KI
P-00AL
+
+1321NK,T0
-2221OU,T0
+0013KE,T0
-2122OU,T0
+0012KI,T0
-2212OU,T0
+0011HI,T0
-1211OU,T0
+0021KI,T0
-1112OU,T0
+0011HI,T0
%TSUMI,T0
`;
    const record = importCSA(data) as Record;
    expect(record).toBeInstanceOf(Record);
    expect(record.initialPosition.sfen).toBe("7n1/6gk1/6gpN/9/9/6b1P/9/9/9 b 2R2Gb4s2n4l16p 1");
    expect(record.current.ply).toBe(0);
    expect(record.current.move).toStrictEqual(specialMove(SpecialMoveType.START));
    record.goto(1);
    expect(record.current.displayText).toBe("☗２一桂成");
    record.goto(10);
    expect(record.current.displayText).toBe("☖１二玉");
    record.goto(11);
    expect(record.current.displayText).toBe("☗１一飛");
    record.goto(12);
    expect(record.current.move).toStrictEqual(specialMove(SpecialMoveType.MATE));
  });

  it("import/wcsc32", () => {
    // http://www2.computer-shogi.org/kifu/kifu.html より
    const data = `V2.2
N+二番絞り
N-dlshogi with HEROZ
$START_TIME:2022/05/05 16:11:27
PI
+
+2726FU
T41
-8384FU
T0
+2625FU
T14
-8485FU
T0
+7776FU
T62
-4132KI
T0
+8877KA
T2
-3334FU
T0
+7988GI
T11
-2277UM
T0
+8877GI
T3
-3122GI
T0
+6978KI
T28
-2233GI
T0
+3938GI
T23
-7374FU
T0
+3736FU
T72
-7162GI
T0
+4746FU
T62
-5142OU
T0
+3847GI
T42
-1314FU
T0
+1716FU
T53
-9394FU
T0
+9796FU
T3
-8173KE
T0
+5968OU
T10
-6364FU
T0
+2937KE
T5
-6263GI
T0
+4948KI
T7
-6162KI
T0
+4756GI
T30
-8281HI
T0
+6766FU
T5
-6354GI
T0
+2829HI
T4
-4252OU
T0
+6879OU
T12
-4344FU
T0
+7988OU
T39
-8141HI
T0
+2928HI
T113
-4181HI
T0
+4858KI
T20
-6465FU
T17
+6665FU
T3
-7365KE
T15
+7766GI
T3
-0064FU
T6
+5868KI
T3
-8586FU
T4
+8786FU
T3
-8186HI
T4
+0087FU
T3
-8681HI
T4
+4645FU
T3
-4445FU
T4
+3745KE
T30
-3344GI
T0
+2524FU
T3
-2324FU
T4
+2824HI
T3
-0046KA
T96
+3635FU
T3
-0023FU
T103
+2434HI
T3
-5443GI
T3
+3432RY
T25
-4332GI
T0
+0022FU
T13
-0086FU
T0
+8786FU
T3
-0085FU
T3
+8685FU
T19
-4619UM
T0
+2221TO
T3
-0086KY
T28
+0087KI
T12
-8687KY
T25
+7887KI
T8
-0048HI
T0
+0069FU
T21
-1946UM
T0
+0078KE
T29
-8121HI
T0
+0034KY
T47
-0033FU
T0
+4533NK
T3
-4433GI
T35
+3433NY
T32
-3233GI
T0
+0025KA
T7
-5242OU
T0
+0044FU
T8
-3344GI
T0
+0043GI
T34
-4231OU
T0
+0045FU
T12
-4433GI
T0
+3534FU
T10
-3322GI
T0
+6665GI
T7
-4624UM
T0
+0033KE
T6
-0051KI
T0
+3321NK
T47
-3121OU
T0
+0026FU
T28
-6465FU
T2
+0081HI
T11
-0061KY
T13
+8191RY
T1
-0064KE
T12
+9192RY
T1
-0072KE
T96
+0063KY
T31
-0032FU
T0
+6362NY
T1
-5162KI
T4
+9272RY
T10
-6272KI
T28
+4332NG
T1
-2132OU
T25
+0044KE
T1
-3221OU
T12
+0032KI
T1
-2112OU
T4
+3222KI
T1
-1222OU
T4
+0033GI
T1
-2213OU
T4
+3324NG
T1
-1324OU
T41
+3433TO
T1
-2435OU
T5
+0037KA
T1
-6456KE
T3
+3748KA
T1
-5648NK
T3
+0036HI
T1
-3545OU
T3
+0046FU
T1
-4554OU
T3
+2561UM
T1
-0062KI
T3
+6172UM
T1
-6272KI
T24
+3343TO
T1
-0086FU
T12
+3633RY
T1
-0055KA
T8
+0077KY
T1
-8687TO
T23
+8887OU
T1
-0061KY
T84
+4353TO
T1
-5464OU
T3
+0054KI
T9
-6473OU
T0
+5455KI
T5
-7382OU
T0
+0045KA
T5
-7271KI
T0
+7886KE
T5
-0049KA
T1
+5363TO
T42
-8291OU
T0
+6878KI
T15
-0066KI
T6
+8788OU
T26
-0067GI
T0
+8897OU
T32
-6778GI
T4
+4578KA
T2
-0079HI
T7
%TORYO
T16
`;
    const record = importCSA(data) as Record;
    expect(record).toBeInstanceOf(Record);
    expect(record.metadata.getStandardMetadata(RecordMetadataKey.BLACK_NAME)).toBe("二番絞り");
    expect(record.metadata.getStandardMetadata(RecordMetadataKey.WHITE_NAME)).toBe(
      "dlshogi with HEROZ",
    );
    expect(record.initialPosition.sfen).toBe(
      "lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL b - 1",
    );
    record.goto(177);
    expect(record.current.move).toStrictEqual(specialMove(SpecialMoveType.RESIGN));
    expect(record.position.sfen).toBe(
      "k1gl4l/9/3+P2+Rp1/p1p2N2p/1P1pG4/PNPg1P1PP/K1L1P4/2B2+n3/LNrP1b3 b S4Pg3s 1",
    );
  });

  it("import/handicap", () => {
    const data = `V2.2
PI82HI
-
`;
    const record = importCSA(data) as Record;
    expect(record).toBeInstanceOf(Record);
    expect(record.initialPosition.sfen).toBe(
      "lnsgkgsnl/7b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL w - 1",
    );
  });

  it("import/multi-records", () => {
    const data = `V2.2
PI
+
+2726FU
-3334FU
%CHUDAN
/
V2.2
PI
+
+7776FU
-8384FU
+5756FU
%CHUDAN`;
    const record = importCSA(data) as Record;
    expect(record).toBeInstanceOf(Record);
    expect(record.moves).toHaveLength(4);
  });

  it("import/wcsc34", () => {
    // 世界コンピューター将棋選手権棋譜中継サイトより
    // http://live4.computer-shogi.org/wcsc34/kifu/WCSC34+U2_1-900-5F+koron+dlshogi+20240504104030.csa
    const data = `V2.2
N+koron
N-dlshogi
$START_TIME:2024/05/04 10:40:30
PI
+
+2726FU
T0
'** 66 -9394FU
-8384FU
T0
+7776FU
T0
'** 66 -9394FU
-4132KI
T0
+2625FU
T0
'** 66 -9394FU
-8485FU
T0
+8877KA
T0
'** 66 -3334FU
-3334FU
T0
+7988GI
T0
'** 66 -2277UM
-2277UM
T0
+8877GI
T0
'** 66 -3122GI
-3122GI
T0
+6978KI
T0
'** 66 -9394FU
-2233GI
T0
+1716FU
T0
'** 66 -9394FU
-1314FU
T0
+3938GI
T0
'** 66 -9394FU
-7162GI
T0
+3736FU
T0
'** 70 -6364FU
-6364FU
T0
+5968OU
T0
'** 70 -7374FU
-6263GI
T0
+4746FU
T0
'** 70 -7374FU
-5142OU
T0
+2937KE
T0
'** 70 -7374FU
-7374FU
T0
+9796FU
T0
'** 70 -8173KE
-8173KE
T0
+3635FU
T0
'** 70 -6152KI
-6162KI
T0
+3534FU
T0
'** 86 -3334GI
-3334GI
T0
+2524FU
T0
'** 86 -2324FU
-2324FU
T0
+2824HI
T0
'** 86 -3423GI
-3423GI
T0
+2429HI
T9
'** 53 -0024FU +3847GI -7365KE +7766GI -8586FU +8786FU -8286HI +4958KI -9394FU +0022FU -2133KE +8977KE -0087KA +7765KE -8778UM +6878OU -6465FU +6677GI -0087KI +7868OU -8683HI +0086FU -0036FU +4736GI -7475FU +0034FU -2334GI +0026KE -8777KI +6877OU -7576FU +7776OU -3423GI +0034FU -3325KE +3725KE -2425FU +0075KE
-0024FU
T0
+3847GI
T34
'** 18 -7475FU +4948KI -7576FU +7776GI -8281HI +0033FU -2133KE +0034FU -2334GI +0056KA -3423GI +0034FU -3325KE +3725KE -2425FU +2925HI -0024FU +2529HI -0074FU +0035KE -2312GI +0075FU -0084KE +7877KI -8586FU +7574FU -8687TO +7687GI -7365KE +0083FU -0076FU +7766KI -0088KA +6858OU -8899UM +6665KI -6465FU +0045KE -4252OU +3433TO -3233KI +4533NK -9933UM +0073KI -7677TO +8977KE -3377UM +8382TO -0068KI +5849OU -8131HI
-7475FU
T0
+4948KI
T0
'** 93 -7576FU +7776GI -8281HI +0033FU -2133KE +0034FU -2334GI +0056KA -3435GI +0036FU -3544GI +2924HI -0077FU +7888KI -8586FU +8786FU -8186HI +7687GI -8681HI +0083FU -0034FU +5634KA -0086FU +8786GI -8183HI +0087FU -8381HI +3423UM
-7576FU
T0
+7776GI
T0
'** 93 -8281HI +0033FU -2133KE +0034FU -2334GI +0056KA -3435GI +0036FU -3544GI +2924HI -0077FU +7888KI -8586FU +8786FU -8186HI +7687GI -8681HI +0083FU -0034FU +5634KA -0086FU +8786GI -8183HI +0087FU -8381HI +3423UM
-8281HI
T0
+0056KA
T0
'** 93 -6465FU +0025FU -2425FU +0033FU -3222KI +4736GI -0075FU +5645KA -7576FU +4563UM -6263KI +0072GI -0054KA +0024FU -2324GI +3625GI -0028FU +2939HI -2425GI +3725KE -8184HI +0075GI -7677TO +8977KE
-0074FU
T0
+0075FU
T16
'** 185 -6465FU +7574FU -6374GI +0075FU -7463GI +0034FU -0035FU +8977KE -8586FU +8786FU -8186HI +7887KI -8681HI +0086FU -5354FU +6766FU -4344FU +4645FU -4445FU +0022FU -3222KI +6665FU -0067FU +7667GI -0085FU +8685FU -7385KE +7785KE -8185HI +0086FU -8575HI +0076FU -7571HI +6564FU -6364GI +5683UM -0055KE +4758GI -7181HI +8374UM -6273KI +7456UM -2334GI +3745KE -0044FU
-7475FU
T0
+7675GI
T13
'** 225 -0074FU +7574GI -6374GI +5674KA -8586FU +8786FU -8186HI +0063GI -0041KA +0087FU -8681HI +6362GI -4174KA +3745KE -0044GI +6273NG -7447UM +4847KI -0038KA +2939HI -3847UM +0063KA -4748UM +3929HI -0088FU +6381UM -8889TO +2924HI -4445GI +8145UM -2324GI +0034KE -4233OU +0042GI -3242KI +0031HI -0032GI +3442NK -0058HI
-0074FU
T0
+7574GI
T12
'** 252 -6374GI +5674KA -7365KE +0025FU -0073FU +2524FU -2324GI +0092GI -8151HI +7465KA -6465FU +2924HI -0033KA +2464HI -0063GI +6484HI -3399UM +0033FU -3233KI +3725KE -3344KI +4645FU -4435KI +8424HI -5354FU +4544FU -9944UM +2444HI -4344FU +0024KA -0033FU +2435KA -0029HI +3544KA -0059KA +6858OU -6253KI
-6374GI
T0
+5674KA
T15
'** 262 -7365KE +0025FU -0073FU +0092GI -8151HI +7483UM -2425FU +6766FU -8586FU +8786FU -9192KY +6665FU -0036FU +3725KE -0037GI +4858KI -0038GI +2969HI -3847NG +5847KI -2334GI +6564FU -3425GI +8356UM -0038GI +0063GI -6263KI +6463TO -3847GI +5647UM -0066KE +0067GI -6678NK +6878OU -4233OU +4756UM -3324OU +0017KE -2516GI +0038FU -3726NG
-7365KE
T0
+0025FU
T15
'** 317 -2425FU +0033FU -2133KE +0024FU -2324GI +0034FU -0073FU +3433TO -3233KI +0063GI -7374FU +6362GI -4344FU +6766FU -8586FU +8786FU -0036FU +3725KE -3334KI +0055KE -0054KA +0033KI -3433KI +2533NK -4233OU +0034FU -3323OU +0025FU -0076KE +6858OU -2435GI +0024KI -3524GI +2524FU -2334OU +0025GI -3433OU +6253NG -0028FU +2928HI -0039GI +5354NG -3928GI +5543NK -3322OU +5444NG
-2425FU
T0
+0033FU
T15
'** 411 -2133KE +0024FU -2324GI +0034FU -0073FU +3433TO -3233KI +0063GI -7374FU +6362GI -4344FU +6766FU -3334KI +6665FU -6465FU +4645FU -8586FU +8786FU -6566FU +0046KE -0067GI +6859OU -3435KI +7867KI -8186HI +4544FU -8689RY +0069FU -0087KA +6768KI -6667TO +0043GI -4233OU +5949OU -6768TO +0034KI -3322OU +3435KI
-2133KE
T0
+0024FU
T28
'** 420 -2324GI +0034FU -0073FU +3433TO -3233KI +0063GI -7374FU +6362GI -4344FU +6766FU -8586FU +8786FU -0023KA +6665FU -8186HI +0077KI -8683HI +0086FU -4252OU +3725KE -3334KI +6564FU -5262OU +0055KE -0054GI +4756GI -0028FU +2939HI -5455GI +5655GI -0067FU +7867KI -0075KE +0063GI -6251OU +6374NG -2829TO +3929HI -7567NK +6867OU -3425KI +0045KE -8382HI +6463TO -5141OU +0035KE -2334KA +6353TO -4445FU +3543NK -4546FU +6766OU -4131OU +0033FU -3122OU +3332TO -2223OU +4333NK -2433GI +3233TO -2333OU +0035FU
-2334GI
T0
+0063GI
T36
'** 378 -6261KI +0035FU -3435GI +8977KE -8586FU +8786FU -8186HI +7765KE -6465FU +0034FU -0036FU +2423TO -3223KI +3433TO -2333KI +0045KE -3334KI +3725KE -0028FU +2928HI -0027FU +2827HI -0026FU +2729HI -6566FU +0087FU -6667TO +6867OU -0076GI +6758OU -7687NG +4533NK -3433KI +2533NK -4233OU +0034FU -3323OU +0024FU -2324OU +0025FU -2425OU +0017KE -2534OU +7456KA -8656HI +4756GI -0076KA +5847OU -0055KE +5655GI -3637TO +4837KI -0058KA +4738OU
-6261KI
T0
+0035FU
T16
'** 395 -3435GI +8977KE -8586FU +8786FU -8186HI +7765KE -6465FU +0034FU -0076KE +6858OU -0028GI +2928HI -8689RY +0069GI -0086KA +0077KE -7688NK +7868KI -8879NK +3433TO -4233OU +7465KA -7969NK +6869KI -8677UM +3725KE -3342OU +0079FU -0078GI +5849OU -7869GI +0033FU -7767UM +4939OU -3231KI +0055KE -0051KE +4756GI -6958NG +0034KE -4241OU +5667GI -8979RY +0049KA -0027FU +2827HI -0038FU +6538KA -5163KE +5563NK -5848NG +3948OU -7968RY +4958KA -0059GI +4847OU -0036FU +2423TO -3637TO +2737HI
-3435GI
T0
+8977KE
T12
'** 401 -8586FU +8786FU -8186HI +7765KE -6465FU +0034FU -0036FU +2423TO -3223KI +3433TO -2333KI +0045KE -3334KI +3725KE -0028FU +2928HI -0027FU +2827HI -0026FU +2729HI -3425KI +0034FU -0021KE +0022FU -4344FU +0087FU -0076KE +6877OU -8684HI +7465KA -4445FU +6374NG -0055KA +6766FU -0064GI +4756GI -6465GI +5665GI
-8586FU
T0
+8786FU
T43
'** 380 -8186HI +7765KE -6465FU +0034FU -0036FU +2423TO -3223KI +3433TO -2333KI +0045KE -3334KI +3725KE -0028FU +2928HI -0027FU +2827HI -0026FU +2729HI -0077FU +6877OU -0094KE +0076FU -0044KA +6766FU -4466KA +7767OU -0077FU +7465KA -6644KA +2533NK -3433KI +4533NK -4233OU +0025KE -3324OU +6543UM
-8186HI
T0
+7765KE
T31
'** 348 -6465FU +0034FU -0076KE +6858OU -0028GI +2928HI -8689RY +0069GI -2526FU +2829HI -0073FU +3433TO -4233OU +0045KE -3324OU +6372GI -0027KA +4838KI -7374FU +7261NG -2423OU +0025KI -0034FU +3827KI -2627TO +2535KI -3435FU +2927HI -0024FU +0033GI
-6465FU
T0
+0034FU
T50
'** 207 -0076KE +6858OU -0028GI +2928HI -8689RY +0069GI -2526FU +2829HI -0036FU +3433TO -4233OU +2423TO -3223KI +3745KE -3334OU +4553KE -0077FU +7877KI -2627TO +2927HI -7668NK +5868OU -0076FU +7776KI -0087KA +2729HI -8776UM +6858OU -0037KI +0038FU -0028FU +2939HI -8988RY +0078FU -7667UM +5867OU -3748KI +6776OU -4839KI +5361NK -0066HI +7675OU -0073KI +0045KI -3425OU
-0076KE
T14
+6858OU
T12
'** 197 -0028GI +2928HI -8689RY +0069GI -2526FU +2829HI -0036FU +2423TO -3223KI +3433TO -4233OU +3745KE -3334OU +4553NK -0077FU +7877KI -2627TO +2927HI -7668NK +5868OU -0076FU +7776KI -0087KA +2729HI -8776UM +6858OU -0027FU +6354GI -6566FU +5445GI -3433OU +4756GI -0026KI +0047KE -3546GI +0035KE -3637TO +5343NK -7643UM +3543NK -3343OU +0049FU -0036KE +0098KA -0076KE +9876KA -4342OU +4837KI -2637KI +0034KE -4253OU +7632UM -5362OU +3254UM -0076FU +7463UM -6271OU +5444UM -7182OU +6364UM -8292OU +6446UM
-0028GI
T9
+2928HI
T3
'** 248 -8689RY +0069GI -2526FU +3433TO -4233OU +2829HI -0036FU +2423TO -3223KI +3745KE -3322OU +0025KE -0034KA +0017KE -0073FU +7465KA -0068FU +7868KI -7668NK +5868OU -0066FU +6556KA -6667TO +6867OU -0066FU +6776OU -8984RY +2533NK -2333KI +4533NK -2233OU +0025KE -3344OU +5634KA -0064KE +7677OU -8475RY +7768OU -4434OU +6859OU -6667TO +0042KA -0077KA +0068FU -0037KE
-8689RY
T10
+0069GI
T1
'** 332 -2526FU +3433TO -4233OU +2829HI -0036FU +2423TO -3223KI +3745KE -3334OU +4553NK -0077FU +7877KI -2627TO +2927HI -7668NK +5868OU -0076FU +7776KI -0087KA +2729HI -8776UM +6858OU -0027FU +6354GI -6566FU +5445GI -3433OU +4756GI -0026KI +0047KE -3546GI +0038KE -3637TO +3846KE -6667TO +5667GI -3748TO +5848OU -7667UM +0034GI -2334KI +4534GI -6734UM +4634KE -0037GI +4858OU -0048KI +5867OU -4847KI +6776OU -0064KE +7675OU -0084GI +7564OU -0073GI +6454OU -7374GI +5343NK -3324OU
-0077FU
T15
+3433TO
T10
'** 781 -3233KI +3725KE -3334KI +7877KI -0027FU +2829HI -3524GI +4736GI -2425GI +3625GI -3425KI +0045KE -0044GI +7776KI -0034KE +0037KE -2535KI +0036FU -3536KI +5756FU -8988RY +0078FU -0026KA +0024KE -8879RY +7465KA -4445GI +4645FU -4233OU +0035FU -3635KI +2927HI -0046KE +5857OU -7969RY +2726HI
-3233KI
T0
+3725KE
T14
'** 1226 -3334KI +2533NK -3433KI +2423TO -0066KE +5849OU -8969RY +0059KE -0034GI +6352NG -6152KI +2333TO -4233OU +7452UM -0027FU +6766FU -0044GI +2838HI -0037FU +3837HI -7778TO +0025KE -3323OU +0033KI -4433GI +2533NK -2333OU +0045KE -3322OU +0033KI -2213OU +0022GI -1312OU +3735HI -6959RY +4959OU -7868TO +5949OU -0037KE +4938OU -2728TO +3828OU -0027KI +2827OU -0026FU +2726OU -3435GI +2635OU -0044KI +3536OU -0035HI +3627OU -0026FU +2738OU
-3324KI
T0
+6352NG
T14
'** 1920 -6152KI +2533NK -4233OU +7452UM -0027FU +0045KE -3322OU +2827HI -0026FU +5243UM -0021KE +0025KE -2425KI +0032KI -2213OU +4325UM -0044GI +1615FU -0022KE +0024FU -3524GI +2726HI -2425GI +2625HI -0024FU +0033GI -4433GI +4533NK -2133KE +3233KI -8969RY +5869OU -7778TO +6958OU
-6152KI
T25
+2533NK
T1
'** 2286 -4233OU +7452UM -0027FU +0045KE -3322OU +2827HI -0026FU +5243UM -0021KE +0025KE -2425KI +0032KI -2213OU +4325UM -0024GI +4533NK -0066KE +6766FU -2133KE +3233KI -8969RY +5869OU -7778TO +6978OU -0089KA +7887OU -2425GI +0021HI -0078KA +8786OU -7812UM +0045KE -0024KI +1615FU -1415FU +1915KY -0014FU +0037KE -1415FU +3725KE -1314OU +0013KI -1425OU +0036GI -3536GI +4736GI -2536OU +4837KI -3635OU +2124RY -3524OU +2726HI -0025FU
-4233OU
T18
+7452UM
T1
'** 2532 -0027FU +0045KE -3323OU +5243UM -0022GI +0033KI -2233GI +4533NK -2312OU +0023GI -2423KI +3323NK -1223OU +2827HI -0026FU +0033KI -2313OU +0025KE -1312OU +4334UM -1221OU +3435UM -8969RY +5869OU -7778TO +6959OU -7868TO +5949OU -0058GI +4939OU -0049KI +3929OU -0017KE +1917KY -0018GI +2918OU -2627TO +1827OU -0028KI +2736OU -0018KA
-0027FU
T11
+0045KE
T1
'** 2668 -3323OU +5243UM -0032FU +0025FU -2434KI +2827HI -0026FU +0024KI -3524GI +2524FU -3424KI +2726HI -0025FU +4325UM -2425KI +2625HI -0024FU +0035KE -2322OU +2524HI -2231OU +0043GI -8969RY +5869OU -7778TO +6959OU -7668NK +5949OU -0058KI +4858KI -6858NK +4758GI -0048GI +4948OU -0056KE +4847OU -0036GI +4736OU -0037KI +3637OU -0048KA +3736OU -0037KI +3625OU
-3323OU
T13
+5243UM
T1
'** 2824 -0044GI +0025FU -2434KI +0024KI -3424KI +2524FU -2324OU +2827HI -0026FU +0025KI -2413OU +2535KI -0059KI +5859OU -0068KA +5949OU -8969RY +4938OU -2627TO +3827OU -0026FU +2736OU -4435GI +3635OU -6939RY +0037FU -0024KI +3544OU -0035GI +4453OU -0083HI +0063KE -3948RY +7868KI
-0032FU
T37
+0025FU
T18
'** 3060 -2434KI +2827HI -0013GI +0033FU -0031KE +4332UM -2312OU +7877KI -7668NK +5868OU -0076FU +7776KI -6566FU +2729HI -0054KA +7666KI -0077FU +0079KI -8999RY +0089FU -0021KY +1615FU -5432KA +3332TO -0097KA +0024KE -2124KY +1514FU -9779UM +6879OU
-2434KI
T20
+2827HI
T1
'** 3180 -0026FU +0024KI -3524GI +2524FU -2324OU +0036KE -2423OU +2726HI -0025FU +0024FU -2313OU +4334UM -8969RY +5869OU -7778TO +6958OU -7668NK +5849OU -0058KI +4758GI -6858NK +4858KI -0037KE +4948OU -0039GI +4839OU -0029KI +3948OU -3749NK +4849OU -0038KA +4938OU -0027GI +2627HI -2928KI +2728HI -0027GI +2827HI -1322OU +2423TO -2231OU +0022GI
-0026FU
T74
+0024KI
T1
'** 3180 -3524GI +2524FU -3424KI +2726HI -0025FU +4325UM -2425KI +2625HI -2334OU +0035GI -3443OU +2523RY -0033KI +0044KI -4352OU +4553NK -5261OU +2333RY -0051KA +5363NK -0066KE +6766FU -7668NK +5849OU -0094KA +4938OU -3233FU +0064KE -0029GI +3829OU -8969RY +0039FU -0081GI +0042GI -0021HI +0024FU -5184KA +7868KI -6959RY +2423TO -5968RY +6665FU
-3424KI
T34
+2524FU
T53
'** 3252 -2324OU +0034KI -2413OU +3435KI -0066KE +6766FU -8969RY +5869OU -7778TO +6959OU -7668NK +5949OU -0067KA +4939OU -0049KI +3929OU -0039KI +2918OU -2627TO +1827OU -0029HI +0028FU -0018GI +1918KY -6745UM +3545KI -0026FU +2736OU -0027GI +3635OU -2928RY +0024GI -1322OU +4344UM
-2324OU
T0
+0034KI
T23
'** 3252 -2413OU +3435KI -0025KE +4325UM -8969RY +5869OU -7778TO +6959OU -7668NK +5949OU -6859NK +4939OU -0049KI +4849KI -5949NK +3949OU -0058GI +4958OU -7868TO +5868OU -0086KA +0077GI -0059GI +6859OU -8677UM +5948OU -0037KI +2737HI -0038KI +4738GI -2627TO +0043HI -0023FU
-2413OU
T9
+3435KI
T27
'** 3252 -8969RY +5869OU -7778TO +6978OU -0077FU +7877OU -0088KA +7776OU -0084KE +7665OU -8855UM +6555OU -0054KI +4354UM -5354FU +5564OU -0042KA +6454OU -0053FU +4553NK -0045GI +4645FU -0043GI +5343NK -2627TO +0024GI -4224KA +0025KE -1312OU +0013KI -2413KA +0024KE -1324KA
-0025KE
T31
+4325UM
T34
'** 3282 -8969RY +5869OU -7778TO +6958OU -7668NK +5849OU -6859NK +4939OU -0049KI +3929OU -0039KI +2918OU -2627TO +1827OU -0038GI +4738GI -0028HI +2728OU -3938KI +2827OU -0018GI +1918KY -0026FU +2526UM -3848KI +0043HI -0033GI +0025KE
-0068KI
T15
+6968GI
T8
'** 3316 -0069KA +5849OU -6947UM +0079FU -0058GI +4939OU -4748UM +3948OU -0049KI +4858OU -7668NK +7868KI -0069GI +5849OU -0048FU +4948OU -0037GI +4837OU -2627TO +3727OU -0029HI +2738OU -8979RY +3524KI -1322OU +0034KE -2231OU
-0069KA
T33
+5849OU
T1
'** 31111 -6947UM +0079FU -0058GI +4939OU -4748UM +3948OU -0047FU +2747HI -5847NG +4847OU -0048KI +4748OU -0047FU +4847OU
-6947UM
T21
+0079FU
T50
'** 31111 -0058GI +4939OU -4748UM +3948OU -0047FU +2747HI -5847NG +4847OU -0048KI +4748OU -0047FU +4847OU
-0058GI
T38
+4939OU
T47
'** 31111 -4748UM +3948OU -0047FU +2747HI -5847NG +4847OU -0048KI +4748OU -0047FU +4847OU
-4748UM
T61
+3948OU
T45
'** 31111 -0047FU +2747HI -5847GI +4847OU -0048KI +4748OU -0047FU +4847OU
-0047FU
T0
+2747HI
T10
'** 31111 -5847NG +4847OU -0037KI +4737OU -0027HI +3738OU -2737RY +3837OU
-5847NG
T80
+4847OU
T1
'** 31111 -0037KI +4737OU -0027HI +3738OU -2737RY +3837OU
-0041FU
T99
+3524KI
T0
-1312OU
T21
+0013GI
T0
-1221OU
T20
+0022KI
T0
%TORYO
T0
$END_TIME:2024/05/04 11:05:12
`;
    const record = importCSA(data) as Record;
    expect(record).toBeInstanceOf(Record);
    expect(record.moves).toHaveLength(127);
  });

  it("import/v3", () => {
    // http://www2.computer-shogi.org/protocol/record_v3.html より
    const data = `
'CSA encoding=UTF-8
'----------棋譜ファイルの例 "example.csa"---------------
'バージョン
V3.0
'対局者名
N+先手
N-後手
'棋譜情報
'棋戦名
$EVENT:34th World Computer Shogi Championship
'対局場所
$SITE:INTERNET
'開始日時
$START_TIME:2024/05/05 15:05:40
'終了日時
$END_TIME:2024/05/05 15:31:22
'持ち時間：フイッシャー方式、初期持ち時間：900秒、加算：5秒
$TIME:900+0+5
'戦型：矢倉
$OPENING:YAGURA
'最大手数：320
$MAX_MOVES:320
'持将棋ルールは、27点法
$JISHOGI:27
'備考
$NOTE:備考１行目\n２行目
'平手の初期局面
P1-KY-KE-GI-KI-OU-KI-GI-KE-KY
P2 * -HI * * * * * -KA * 
P3-FU-FU-FU-FU-FU-FU-FU-FU-FU
P4 * * * * * * * * * 
P5 * * * * * * * * * 
P6 * * * * * * * * * 
P7+FU+FU+FU+FU+FU+FU+FU+FU+FU
P8 * +KA * * * * * +HI * 
P9+KY+KE+GI+KI+OU+KI+GI+KE+KY
'先手番
+
'指し手と消費時間
+2726FU,T0
'評価値、読み筋、ノード数
'** 30 -8384FU +2625FU -8485FU +6978KI -4132KI +3938GI -7172GI #1234
-3334FU
'ミリ秒単位の消費時間
T6.123
'*プログラムが読むコメント１行目
'*プログラムが読むコメント２行目
  %CHUDAN
`;
    const record = importCSA(data) as Record;
    expect(record).toBeInstanceOf(Record);
    expect(record.metadata.getStandardMetadata(RecordMetadataKey.BLACK_NAME)).toBe("先手");
    expect(record.metadata.getStandardMetadata(RecordMetadataKey.WHITE_NAME)).toBe("後手");
    expect(record.metadata.getStandardMetadata(RecordMetadataKey.TITLE)).toBe(
      "34th World Computer Shogi Championship",
    );
    expect(record.metadata.getStandardMetadata(RecordMetadataKey.PLACE)).toBe("INTERNET");
    expect(record.metadata.getStandardMetadata(RecordMetadataKey.TIME_LIMIT)).toBe("900+0+5");
    expect(record.metadata.getStandardMetadata(RecordMetadataKey.MAX_MOVES)).toBe("320");
    expect(record.metadata.getStandardMetadata(RecordMetadataKey.JISHOGI)).toBe("27");
    record.goto(1);
    expect(record.current.elapsedMs).toBe(0);
    expect(record.current.comment).toBe(
      "* 30 -8384FU +2625FU -8485FU +6978KI -4132KI +3938GI -7172GI #1234\n",
    );
    record.goto(2);
    expect(record.current.elapsedMs).toBe(6123);
    expect(record.current.comment).toBe(
      "プログラムが読むコメント１行目\nプログラムが読むコメント２行目\n",
    );
  });

  it("import/time_handicap", () => {
    const data = `V2.2
$TIME+:150+00+10
$TIME-:600+00+10
PI
+
`;
    const record = importCSA(data) as Record;
    expect(record).toBeInstanceOf(Record);
    expect(record.metadata.getStandardMetadata(RecordMetadataKey.BLACK_TIME_LIMIT)).toBe(
      "150+00+10",
    );
    expect(record.metadata.getStandardMetadata(RecordMetadataKey.WHITE_TIME_LIMIT)).toBe(
      "600+00+10",
    );
  });

  it("export/standard", () => {
    const record = new Record();
    record.metadata.setStandardMetadata(RecordMetadataKey.BLACK_NAME, "Electron John");
    record.metadata.setStandardMetadata(RecordMetadataKey.WHITE_NAME, "Mr.Vue");
    record.metadata.setStandardMetadata(RecordMetadataKey.TITLE, "TypeScript Festival");
    record.metadata.setStandardMetadata(RecordMetadataKey.TIME_LIMIT, "01:30+60");
    record.current.comment = "初期局面へのコメント\n";
    record.append(record.position.createMoveByUSI("7g7f") as Move);
    record.append(record.position.createMoveByUSI("3c3d") as Move);
    record.current.comment = "2手目へのコメント\n2手目へのコメント2";
    record.append(record.position.createMoveByUSI("8h2b+") as Move);
    record.append(record.position.createMoveByUSI("3a2b") as Move);
    record.current.setElapsedMs(12345); // 12.345 seconds
    record.append(record.position.createMoveByUSI("B*4e") as Move);
    record.current.setElapsedMs(34567); // 34.567 seconds
    record.append(SpecialMoveType.RESIGN);
    record.current.setElapsedMs(56789); // 56.789 seconds
    expect(exportCSA(record)).toBe(`V2.2
N+Electron John
N-Mr.Vue
$EVENT:TypeScript Festival
$TIME_LIMIT:01:30+60
PI
+
'*初期局面へのコメント
+7776FU
T0
-3334FU
T0
'*2手目へのコメント
'*2手目へのコメント2
+8822UM
T0
-3122GI
T12
+0045KA
T34
%TORYO
T56
`);
  });

  it("export/with-comment", () => {
    const record = new Record();
    record.append(record.position.createMoveByUSI("7g7f") as Move);
    expect(exportCSA(record, { comment: "written by TypeScript\nenjoy shogi" }))
      .toBe(`'written by TypeScript
'enjoy shogi
V2.2
PI
+
+7776FU
T0
`);
  });

  it("export/custom-position", () => {
    const position = Position.newBySFEN(
      "7n1/6gk1/6gpN/9/9/6b1P/9/9/9 b 2R2Gb4s2n4l16p 1",
    ) as Position;
    const record = new Record(position) as Record;
    record.append(record.position.createMoveByUSI("1c2a+") as Move);
    record.append(record.position.createMoveByUSI("2b2a") as Move);
    expect(exportCSA(record)).toBe(`V2.2
P1 *  *  *  *  *  *  * -KE * 
P2 *  *  *  *  *  * -KI-OU * 
P3 *  *  *  *  *  * -KI-FU+KE
P4 *  *  *  *  *  *  *  *  * 
P5 *  *  *  *  *  *  *  *  * 
P6 *  *  *  *  *  * -KA * +FU
P7 *  *  *  *  *  *  *  *  * 
P8 *  *  *  *  *  *  *  *  * 
P9 *  *  *  *  *  *  *  *  * 
P+00KI00KI00HI00HI
P-00FU00FU00FU00FU00FU00FU00FU00FU00FU00FU00FU00FU00FU00FU00FU00FU00KY00KY00KY00KY00KE00KE00GI00GI00GI00GI00KA
+
+1321NK
T0
-2221OU
T0
`);
  });

  it("export/time_up", () => {
    const record = new Record();
    record.append(record.position.createMoveByUSI("7g7f") as Move);
    record.append(record.position.createMoveByUSI("3c3d") as Move);
    record.append(SpecialMoveType.TIMEOUT);
    expect(exportCSA(record)).toBe(`V2.2
PI
+
+7776FU
T0
-3334FU
T0
%TIME_UP
T0
`);
  });

  it("export/illegal_move", () => {
    const record = new Record();
    record.append(record.position.createMoveByUSI("7g7f") as Move);
    record.append(record.position.createMoveByUSI("3c3d") as Move);
    record.append(SpecialMoveType.FOUL_LOSE);
    expect(exportCSA(record)).toBe(`V2.2
PI
+
+7776FU
T0
-3334FU
T0
%ILLEGAL_MOVE
T0
`);
  });

  it("export/jishogi", () => {
    const record = new Record();
    record.append(record.position.createMoveByUSI("7g7f") as Move);
    record.append(record.position.createMoveByUSI("3c3d") as Move);
    record.append(SpecialMoveType.IMPASS);
    expect(exportCSA(record)).toBe(`V2.2
PI
+
+7776FU
T0
-3334FU
T0
%JISHOGI
T0
`);
  });

  it("export/kachi", () => {
    const record = new Record();
    record.append(record.position.createMoveByUSI("7g7f") as Move);
    record.append(record.position.createMoveByUSI("3c3d") as Move);
    record.append(SpecialMoveType.ENTERING_OF_KING);
    expect(exportCSA(record)).toBe(`V2.2
PI
+
+7776FU
T0
-3334FU
T0
%KACHI
T0
`);
  });

  it("export/v3", () => {
    const record = new Record();
    record.metadata.setStandardMetadata(RecordMetadataKey.BLACK_NAME, "Electron John");
    record.metadata.setStandardMetadata(RecordMetadataKey.WHITE_NAME, "Mr.Vue");
    record.metadata.setStandardMetadata(RecordMetadataKey.TITLE, "TypeScript Festival");
    record.metadata.setStandardMetadata(RecordMetadataKey.TIME_LIMIT, "600+00+10");
    record.current.comment = "初期局面へのコメント\n";
    record.append(record.position.createMoveByUSI("7g7f") as Move);
    record.append(record.position.createMoveByUSI("3c3d") as Move);
    record.current.comment = "2手目へのコメント\n2手目へのコメント2\n";
    record.append(record.position.createMoveByUSI("8h2b+") as Move);
    record.append(record.position.createMoveByUSI("3a2b") as Move);
    record.current.setElapsedMs(12345); // 12.345 seconds
    record.append(record.position.createMoveByUSI("B*4e") as Move);
    record.current.setElapsedMs(34567); // 34.567 seconds
    record.append(SpecialMoveType.RESIGN);
    record.current.setElapsedMs(56789); // 56.789 seconds
    expect(exportCSA(record, { v3: { milliseconds: true } })).toBe(`'CSA encoding=UTF-8
V3.0
N+Electron John
N-Mr.Vue
$EVENT:TypeScript Festival
$TIME:600+00+10
PI
+
'*初期局面へのコメント
+7776FU
T0
-3334FU
T0
'*2手目へのコメント
'*2手目へのコメント2
+8822UM
T0
-3122GI
T12.345
+0045KA
T34.567
%TORYO
T56.789
`);
  });

  it("export/v3/shift_jis", () => {
    const record = new Record();
    record.append(record.position.createMoveByUSI("7g7f") as Move);
    expect(exportCSA(record, { v3: { encoding: "SHIFT_JIS" } })).toBe(`'CSA encoding=SHIFT_JIS
V3.0
PI
+
+7776FU
T0
`);
  });

  it("export/time_handicap", () => {
    const record = new Record();
    record.metadata.setStandardMetadata(RecordMetadataKey.BLACK_TIME_LIMIT, "150+00+10");
    record.metadata.setStandardMetadata(RecordMetadataKey.WHITE_TIME_LIMIT, "600+00+10");
    expect(exportCSA(record)).toBe(`V2.2
$TIME+:150+00+10
$TIME-:600+00+10
PI
+
`);
  });

  it("predefeindInitialPosition", () => {
    [
      InitialPositionSFEN.STANDARD,
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
    ].forEach((sfen) => {
      const org = Record.newByUSI("sfen " + sfen) as Record;
      const data = exportCSA(org);
      expect(data).toContain("PI");
      const record = importCSA(data) as Record;
      expect(record.initialPosition.sfen).toBe(sfen);
    });
  });
});
