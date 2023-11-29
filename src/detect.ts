import { Position } from "./position";

export enum RecordFormatType {
  USI,
  SFEN,
  KIF,
  KI2,
  CSA,
  JKF,
}

export function detectRecordFormat(data: string): RecordFormatType {
  // USI
  if (
    data.startsWith("position sfen ") ||
    data.startsWith("position startpos ") ||
    data.startsWith("sfen ") ||
    data.startsWith("startpos ") ||
    data.startsWith("moves ")
  ) {
    return RecordFormatType.USI;
  }

  // SFEN
  if (Position.isValidSFEN(data)) {
    return RecordFormatType.SFEN;
  }

  // JKF
  if (data.match(/^[\s\r\n]*{/) && data.match(/}[\s\r\n]*$/)) {
    return RecordFormatType.JKF;
  }

  // KIF vs KI2 vs CSA: 行頭の文字の出現頻度を比較する。
  const pattKIF = /(^|\n)[ \u3000]*[#0-9開終棋手戦表持秒記消場掲備先後作発出完分受]/g;
  const pattKI2 = /(^|\n)[ \u3000]*[#▲△▼▽☗☖開終棋手戦表持秒記消場掲備先後作発出完分受]/g;
  const pattCSA = /(^|,|\n)[-+$%'VNPT]/g;
  const matchedKIF = data.match(pattKIF);
  const matchedKI2 = data.match(pattKI2);
  const matchedCSA = data.match(pattCSA);
  const evalKIF = matchedKIF ? matchedKIF.length : 0;
  const evalKI2 = matchedKI2 ? matchedKI2.length : 0;
  const evalCSA = matchedCSA ? matchedCSA.length : 0;
  return evalKIF >= evalCSA && evalKIF >= evalKI2
    ? RecordFormatType.KIF
    : evalKI2 >= evalCSA
      ? RecordFormatType.KI2
      : RecordFormatType.CSA;
}
