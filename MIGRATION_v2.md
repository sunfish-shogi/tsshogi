# tsshogi v2 移行マニュアル

## 概要

v2 はパフォーマンス改善を目的とした破壊的変更リリースです。
主な変更点は次のとおりです。

- `Color` / `PieceType` / `Direction` の各 enum が **文字列 → 数値** に変更
- `Square` クラスが **数値型エイリアス + スタンドアロン関数群** に変更
- `Move.from` / `Move.to` が **数値** に変更（型が `Square | PieceType` → `number`）
- `Position.createMove` のドロップ移動が **`createDropMove`** に分離

---

## 1. Color enum

### 変更前

```ts
Color.BLACK  // "black"
Color.WHITE  // "white"
```

### 変更後

```ts
Color.BLACK  // 1
Color.WHITE  // 2
```

### 影響箇所

文字列リテラルで比較している箇所や、JSON にシリアライズして読み戻している箇所が壊れます。

```ts
// NG: 文字列比較はもう動かない
if (color === "black") { ... }

// OK: enum を使った比較はそのまま動く
if (color === Color.BLACK) { ... }
```

`reverseColor` の内部実装が `3 - color` に変わりましたが、**公開 API に変更はありません**。

---

## 2. PieceType enum

### 変更前 → 変更後

| 定数 | v1 | v2 |
|------|----|----|
| `PAWN` | `"pawn"` | `0` |
| `LANCE` | `"lance"` | `1` |
| `KNIGHT` | `"knight"` | `2` |
| `SILVER` | `"silver"` | `3` |
| `GOLD` | `"gold"` | `4` |
| `BISHOP` | `"bishop"` | `5` |
| `ROOK` | `"rook"` | `6` |
| `KING` | `"king"` | `7` |
| `PROM_PAWN` | `"promPawn"` | `8` |
| `PROM_LANCE` | `"promLance"` | `9` |
| `PROM_KNIGHT` | `"promKnight"` | `10` |
| `PROM_SILVER` | `"promSilver"` | `11` |
| `HORSE` | `"horse"` | `12` |
| `DRAGON` | `"dragon"` | `13` |

### 影響箇所

```ts
// NG
if (piece.type === "pawn") { ... }

// OK
if (piece.type === PieceType.PAWN) { ... }
```

JSON や localStorage への保存値が変わるため、永続化しているデータは再変換が必要です。

---

## 3. Direction enum

### 変更前 → 変更後

| 定数 | v1 | v2 |
|------|----|----|
| `UP` | `"up"` | `0` |
| `DOWN` | `"down"` | `1` |
| `LEFT` | `"left"` | `2` |
| `RIGHT` | `"right"` | `3` |
| `LEFT_UP` | `"left_up"` | `4` |
| `RIGHT_UP` | `"right_up"` | `5` |
| `LEFT_DOWN` | `"left_down"` | `6` |
| `RIGHT_DOWN` | `"right_down"` | `7` |
| `LEFT_UP_KNIGHT` | `"left_up_knight"` | `8` |
| `RIGHT_UP_KNIGHT` | `"right_up_knight"` | `9` |
| `LEFT_DOWN_KNIGHT` | `"left_down_knight"` | `10` |
| `RIGHT_DOWN_KNIGHT` | `"right_down_knight"` | `11` |

Color / PieceType と同様、文字列リテラルとの比較はすべて enum を使うよう修正してください。

---

## 4. Square

v2 で最も大きな変更です。`Square` クラスが廃止され、`type Square = number`（0〜80 のインデックス値）に変わりました。

### インデックス規則（変更なし）

```
index = (rank - 1) * 9 + (9 - file)
0 = 「9一」, 8 = 「1一」, 72 = 「9九」, 80 = 「1九」
```

### 生成

| v1 | v2 |
|----|-----|
| `new Square(file, rank)` | `squareByFileRank(file, rank)` |
| `Square.newByXY(x, y)` | `squareByXY(x, y)` |
| `Square.newByUSI(str)` | `squareByUSI(str)` |
| `Square.parseSFENSquare(str)` | `parseSFENSquare(str)` *(deprecated)* または `squareByUSI(str)` |
| `Square.newByIndex(idx)` | インデックス値をそのまま使う (`idx` が `Square`) |

盤外を表す値として `INVALID_SQUARE = -1` が追加されました。  
`squareByFileRank` は範囲外のとき `INVALID_SQUARE` を返します。

### プロパティ → 関数

| v1 | v2 |
|----|-----|
| `sq.file` | `squareFile(sq)` |
| `sq.rank` | `squareRank(sq)` |
| `sq.x` | `squareX(sq)` |
| `sq.y` | `squareY(sq)` |
| `sq.index` | `sq` そのもの（値がインデックス） |
| `sq.valid` | `squareValid(sq)` |
| `sq.opposite` | `squareOpposite(sq)` |
| `sq.usi` / `sq.sfen` | `squareUSI(sq)` |
| `sq.equals(other)` | `sq === other` |

### 隣接マス

| v1 | v2 |
|----|-----|
| `sq.neighbor(dir: Direction)` | `squareNeighbor(sq, dir)` |
| `sq.neighbor(dx: number, dy: number)` | `squareNeighborDelta(sq, dx, dy)` |
| `sq.directionTo(target)` | `squareDirectionTo(from, to)` |

### 全マスの列挙

```ts
// v1
Square.all.forEach(sq => { ... });
Square.all.filter(sq => ...);

// v2: 数値ループに置き換え
for (let sq = 0; sq < 81; sq++) { ... }
// 配列が必要な場合
Array.from({ length: 81 }, (_, i) => i as Square).filter(sq => ...);
```

### 名前付き定数

`SQ_11` 〜 `SQ_99`（筋段）の定数がエクスポートされています。

```ts
import { SQ_55 } from "tsshogi";
// SQ_55 === squareByFileRank(5, 5)
```

---

## 5. Move

### from / to の型変更

| | v1 | v2 |
|-|----|----|
| `move.from` | `Square \| PieceType` | `number` |
| `move.to` | `Square` | `number`（0〜80） |

ドロップ（持ち駒打ち）の `from` は `81 + PieceType` でエンコードされています。

### 新しいゲッター

| ゲッター | 説明 |
|---------|------|
| `move.isDrop` | 持ち駒打ちかどうか |
| `move.fromSquare` | 移動元のマス（盤上の指し手のみ有効、値は `Square`） |
| `move.dropPieceType` | 打つ駒の種類（持ち駒打ちのみ有効） |
| `move.toSquare` | 移動先のマス |

### 移行パターン

```ts
// v1: from が Square か PieceType かで分岐
if (move.from instanceof Square) {
  const fromSq: Square = move.from;
} else {
  const dropType: PieceType = move.from;
}
const toSq: Square = move.to;

// v2: isDrop で分岐
if (!move.isDrop) {
  const fromSq: Square = move.fromSquare;  // === move.from
} else {
  const dropType: PieceType = move.dropPieceType;  // === move.from - 81
}
const toSq: Square = move.toSquare;  // === move.to
```

---

## 6. Position.createMove / createDropMove

v1 では `createMove` が盤上の移動とドロップ両方を受け付けていました。
v2 ではドロップ専用メソッド `createDropMove` が追加され、`createMove` は盤上の移動のみになりました。

```ts
// v1: どちらも createMove
position.createMove(fromSquare, toSquare);   // 盤上の移動
position.createMove(pieceType, toSquare);    // ドロップ

// v2: メソッドが分かれた
position.createMove(fromSquare, toSquare);   // 盤上の移動（変更なし）
position.createDropMove(pieceType, toSquare); // ドロップ（新設）
```

---

## 7. Board / Hand（内部実装の変更）

公開 API の大きな変更はありませんが、パフォーマンス改善のため内部構造が変わっています。

| | v1 | v2 |
|-|----|----|
| `Board` 内部ストレージ | `Array<Piece \| null>` | `Uint8Array[81]` |
| `Hand` 内部ストレージ | `Map<PieceType, number>` | `Int32Array[7]` |

`Board` に低レベルアクセス用メソッドが追加されました（内部向け最適化用）:

- `board.atByIndex(idx)` — bounds check なし
- `board.removeByIndex(idx)` — bounds check なし
- `board.setByIndex(idx, piece)` — bounds check なし

`board.at(square)` は `square` が `Square`（`= number`）になったため、従来の `square.index` を渡していた箇所は `square` そのものを渡すよう修正してください。

```ts
// v1
board.at(Square.newByXY(x, y));  // Square オブジェクト

// v2
board.at(squareByXY(x, y));      // number
```

---

## 8. チェックリスト

移行時に確認すべき箇所をまとめます。

- [ ] `Color` / `PieceType` / `Direction` を文字列リテラルと比較している箇所
- [ ] enum 値を JSON や永続ストレージに保存・読み込みしている箇所
- [ ] `new Square(file, rank)` / `Square.newBy*` / `Square.parseSFENSquare` の呼び出し
- [ ] `square.file`, `square.rank`, `square.index` などのプロパティアクセス
- [ ] `square.neighbor(dir)` / `square.neighbor(dx, dy)` の呼び出し
- [ ] `square.equals(other)` の比較（`===` に置き換え）
- [ ] `Square.all` でのループ（数値ループに置き換え）
- [ ] `move.from instanceof Square` の判定（`move.isDrop` に置き換え）
- [ ] `move.from as Square` / `move.from as PieceType` のキャスト
- [ ] `position.createMove(pieceType, to)` の呼び出し（`createDropMove` に置き換え）
