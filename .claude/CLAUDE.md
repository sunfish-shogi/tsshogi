# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Run all tests
npm test

# Run a single test file
npx vitest run src/tests/position.spec.ts

# Run benchmarks
npm run bench

# Build (CJS + ESM outputs)
npm run build

# Lint and format
npm run lint

# Test with coverage
npm run coverage
```

## Architecture

This is a TypeScript library for Shogi (Japanese chess) with no runtime dependencies. It is published as a dual ESM/CJS package.

### Core domain layer (`src/`)

The domain objects form a clear dependency hierarchy:

```
Color, PieceType  →  Piece
Square            →  Board, Move
Board + Hand      →  Position
Position          →  Record
```

- **`color.ts`** — `Color` enum (`BLACK`/`WHITE` string values), helpers
- **`piece.ts`** — `PieceType` enum (string values like `"pawn"`, `"promPawn"`), `Piece` class combining `Color + PieceType`
- **`square.ts`** — `Square` class with `file` (1–9) and `rank` (1–9); `Square.index = (rank-1)*9 + (9-file)`, `Square.all[81]` precomputed array, and `NEIGHBOR_TABLE` for adjacency lookups
- **`direction.ts`** — `Direction` enum and movement tables (`movableDirections`, `directionToDeltaMap`)
- **`board.ts`** — `Board` class backed by `Uint8Array[81]`; access via `at(square)`, `atByIndex(i)`, `set(square, piece)`, etc.
- **`hand.ts`** — `Hand` class backed by `Int32Array`; piece counts in hand for one player
- **`move.ts`** — `Move` class with `from: Square | PieceType` (Square = board move, PieceType = drop) and `to: Square`. Also `SpecialMove` for game-end events.
- **`position.ts`** — `Position` class owning two `Hand` objects plus a `Board`. Key methods: `createMove`, `createMoveByUSI`, `isValidMove`, `doMove`, `undoMove`. Contains `InitialPositionSFEN` enum for standard setups.
- **`record.ts`** — `Record` class representing a game tree (linked nodes with `next`, `prev`, `branch` pointers). Manages current position as moves are applied. `RecordNode` holds `Move | SpecialMove`, elapsed time, comments.
- **`text.ts`** — Human-readable Japanese move formatting (`formatMove`, `formatSpecialMove`)
- **`detect.ts`** — `detectRecordFormat` to identify file format from string content

### Format parsers/exporters

Each format is a self-contained module:

- **`kakinoki.ts`** — KIF/KIFU format (`.kif`, `.kifu`); `importKIF`, `exportKIF`, `importKI2`, `exportKI2`
- **`csa.ts`** — CSA format; `importCSA`, `exportCSA`
- **`jkf.ts`** — JKF (JSON Kifu Format); `importJKF`, `exportJKF`

All importers return `Record | Error`. All exporters return `string`.

### Immutable interfaces

Every mutable class has a corresponding `Immutable*` interface (e.g., `ImmutablePosition`, `ImmutableBoard`, `ImmutableRecord`) for read-only access. These are not deep-freeze enforced—they are a type-level convention.

### Public API

Everything is re-exported from `src/index.ts`. The package entry points are `dist/cjs/index.cjs` (CommonJS) and `dist/esm/index.mjs` (ESM). Build outputs go to `dist/` and are not checked into git.

### Tests

Tests live in `src/tests/*.spec.ts` and benchmarks in `src/tests/*.bench.ts`. Vitest is used without a config file—it picks up `.spec.ts` and `.bench.ts` files automatically.
