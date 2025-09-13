import { bench } from "vitest";
import { Move } from "../move";
import { formatPV } from "../text";
import { Record } from "../record";

describe("text", () => {
  const formatPVBenchCases = [
    "position startpos moves 7g7f 3c3d 2g2f 5c5d 2f2e 8b5b 4i5h 5d5e 3i4h 2b3c 5i6h 5a6b 6h7h 6b7b 6i6h",
    "position sfen l3k2nl/1r2g1gp1/p1ns1p2p/2p1psp2/Pp7/2PS1SP2/1P2PPN1P/2G1G2R1/LNK5L b B2Pbp 1 moves 4f4e 8e8f 8g8f B*6d B*1e 5a4a P*6e 6d8f P*8g 8f3a 4e4d 4c4d 3g2e 6c7b 5h6g P*6d 8i7g 6d6e 7g6e 3a6d 2h2i 7c6e 6f6e 6d5e N*6d",
    "position sfen l4k1nl/4g1gp1/p1n2p2p/2pspsp2/P8/2PS1SP2/+rGN1PPN1P/3G3R1/L1K5L b 2P2b3p 1 moves 9i9g P*6e R*7a 4a4b 7a2a+ B*9h 8g8h 9h7f+ N*2d 6e6f 2d3b+ 4b5c 2a6a 6f6g+ P*6e 6g6h 2h6h",
  ].map((usi) => {
    const record = Record.newByUSI(usi) as Record;
    return {
      position: record.initialPosition,
      moves: record.moves.map((node) => node.move).filter((move) => move instanceof Move),
    };
  });

  bench("formatPV", () => {
    for (const { position, moves } of formatPVBenchCases) {
      formatPV(position, moves);
    }
  });
});
