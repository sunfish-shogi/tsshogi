import { bench } from "vitest";
import { Record } from "../record";
import { Move } from "../move";

// text.bench.ts でも使用されている動作確認済みの USI 文字列
const USI_15_MOVES =
  "position startpos moves 7g7f 3c3d 2g2f 5c5d 2f2e 8b5b 4i5h 5d5e 3i4h 2b3c 5i6h 5a6b 6h7h 6b7b 6i6h";

const USI_24_MOVES =
  "position sfen l3k2nl/1r2g1gp1/p1ns1p2p/2p1psp2/Pp7/2PS1SP2/1P2PPN1P/2G1G2R1/LNK5L b B2Pbp 1 moves 4f4e 8e8f 8g8f B*6d B*1e 5a4a P*6e 6d8f P*8g 8f3a 4e4d 4c4d 3g2e 6c7b 5h6g P*6d 8i7g 6d6e 7g6e 3a6d 2h2i 7c6e 6f6e 6d5e N*6d";

const USI_16_MOVES =
  "position sfen l4k1nl/4g1gp1/p1n2p2p/2pspsp2/P8/2PS1SP2/+rGN1PPN1P/3G3R1/L1K5L b 2P2b3p 1 moves 9i9g P*6e R*7a 4a4b 7a2a+ B*9h 8g8h 9h7f+ N*2d 6e6f 2d3b+ 4b5c 2a6a 6f6g+ P*6e 6g6h 2h6h";

const BENCH_OPTS = { iterations: 5, warmupIterations: 1 };

describe("record", () => {
  const record15 = Record.newByUSI(USI_15_MOVES) as Record;
  const record24 = Record.newByUSI(USI_24_MOVES) as Record;
  const record16 = Record.newByUSI(USI_16_MOVES) as Record;

  bench("Record.newByUSI (15手・平手)", () => {
    Record.newByUSI(USI_15_MOVES);
  }, BENCH_OPTS);

  bench("Record.newByUSI (24手・駒落ち)", () => {
    Record.newByUSI(USI_24_MOVES);
  }, BENCH_OPTS);

  bench("Record.getUSI (15手)", () => {
    record15.getUSI();
  }, BENCH_OPTS);

  bench("Record.getUSI (24手)", () => {
    record24.getUSI();
  }, BENCH_OPTS);

  bench("Record.sfen (現局面)", () => {
    record15.sfen;
    record24.sfen;
    record16.sfen;
  }, BENCH_OPTS);

  bench("Record.goto (先頭 ↔ 末尾)", () => {
    record24.goto(0);
    record24.goto(record24.moves.length);
  }, BENCH_OPTS);

  bench("Record.moves 配列生成", () => {
    record15.moves;
    record24.moves;
  }, BENCH_OPTS);

  // NodeImpl が各ノードに sfen 文字列を保持するコストを計測
  bench("全ノードの sfen プロパティ参照 (15手)", () => {
    let node: typeof record15.first | null = record15.first;
    while (node) {
      void node.sfen;
      node = node.next;
    }
  }, BENCH_OPTS);

  bench("全ノードの sfen プロパティ参照 (24手)", () => {
    let node: typeof record24.first | null = record24.first;
    while (node) {
      void node.sfen;
      node = node.next;
    }
  }, BENCH_OPTS);

  // append の速度: 現局面に指し手を追加してすぐ戻す
  bench("Record.append + goBack (1手)", () => {
    const r = Record.newByUSI(
      "position startpos moves 7g7f 3c3d",
    ) as Record;
    const move = r.current.move as Move;
    r.goBack();
    r.append(move);
  }, BENCH_OPTS);
});
