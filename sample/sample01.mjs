import fs from "node:fs";
import { importKIF } from "../dist/cjs/index.cjs";

/*
 * .kifu ファイルを読み込む。
 */
// NOTE: .kif ファイルの場合は Shift-JIS から UTF-8 に変換する必要がある。
const data = fs.readFileSync("sample.kifu", "utf-8");
const record = importKIF(data);
if (record instanceof Error) {
  throw record;
}

/*
 * 指し手を表示用の形式で出力する。
 *
 * 出力:
 *   1 ☗２六歩
 *   2 ☖８四歩
 *   3 ☗２五歩
 *   4 ☖８五歩
 *   5 ☗７八金
 *   6 中断
 */
while (record.goForward()) {
  // NOTE: record.current は現在の指し手、record.position は現在の局面を表す。
  console.log(record.current.ply, record.current.displayText);
}

/*
 * 指し手を追加する。
 */
const move = record.position.createMoveByUSI("4a3b");
if (!move) {
  throw new Error("Invalid SFEN");
}
// NOTE: 合法手チェックをしない場合は ignoreValidation オプションを指定する。
if (!record.append(move)) {
  throw new Error("Illegal move");
}
