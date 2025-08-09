import { millisecondsToHHMMSS, millisecondsToMSS } from "./helpers/time";
import { Color, reverseColor } from "./color";
import { InvalidMoveError, InvalidUSIError } from "./errors";
import {
  Move,
  SpecialMove,
  SpecialMoveType,
  areSameMoves,
  parseUSIMove,
  specialMove,
} from "./move";
import { DoMoveOption, ImmutablePosition, InitialPositionSFEN, Position } from "./position";
import { formatMove, formatSpecialMove } from "./text";
import { PieceType } from "./piece";
import { Square } from "./square";

const usenHandTable = {
  [PieceType.PAWN]: 81 + 10,
  [PieceType.LANCE]: 81 + 11,
  [PieceType.KNIGHT]: 81 + 12,
  [PieceType.SILVER]: 81 + 13,
  [PieceType.GOLD]: 81 + 9,
  [PieceType.BISHOP]: 81 + 14,
  [PieceType.ROOK]: 81 + 15,
  [PieceType.KING]: 81 + 8,
  [PieceType.PROM_PAWN]: 81 + 2,
  [PieceType.PROM_LANCE]: 81 + 3,
  [PieceType.PROM_KNIGHT]: 81 + 4,
  [PieceType.PROM_SILVER]: 81 + 5,
  [PieceType.HORSE]: 81 + 6,
  [PieceType.DRAGON]: 81 + 7,
};

const usenHandReverseTable = {
  [81 + 10]: PieceType.PAWN,
  [81 + 11]: PieceType.LANCE,
  [81 + 12]: PieceType.KNIGHT,
  [81 + 13]: PieceType.SILVER,
  [81 + 9]: PieceType.GOLD,
  [81 + 14]: PieceType.BISHOP,
  [81 + 15]: PieceType.ROOK,
  [81 + 8]: PieceType.KING,
  [81 + 2]: PieceType.PROM_PAWN,
  [81 + 3]: PieceType.PROM_LANCE,
  [81 + 4]: PieceType.PROM_KNIGHT,
  [81 + 5]: PieceType.PROM_SILVER,
  [81 + 6]: PieceType.HORSE,
  [81 + 7]: PieceType.DRAGON,
};

export enum RecordMetadataKey {
  TITLE = "title", // 表題
  BLACK_NAME = "blackName", // 先手
  WHITE_NAME = "whiteName", // 後手
  SHITATE_NAME = "shitateName", // 下手
  UWATE_NAME = "uwateName", // 上手
  BLACK_SHORT_NAME = "blackShortName", // 先手省略名
  WHITE_SHORT_NAME = "whiteShortName", // 後手省略名
  START_DATETIME = "startDatetime", // 開始日時
  END_DATETIME = "endDatetime", // 終了日時
  DATE = "date", // 対局日
  TOURNAMENT = "tournament", // 棋戦
  STRATEGY = "strategy", // 戦型
  TIME_LIMIT = "timeLimit", // 持ち時間
  BLACK_TIME_LIMIT = "blackTimeLimit", // 先手の持ち時間 (CSA V3)
  WHITE_TIME_LIMIT = "whiteTimeLimit", // 後手の持ち時間 (CSA V3)
  BYOYOMI = "byoyomi", // 秒読み
  TIME_SPENT = "timeSpent", // 消費時間
  MAX_MOVES = "maxMoves", // 最大手数 (CSA V3)
  JISHOGI = "jishogi", // 持将棋規定 (CSA V3)
  PLACE = "place", // 場所
  POSTED_ON = "postedOn", // 掲載
  NOTE = "note", // 備考
  SCOREKEEPER = "scorekeeper", // 記録係

  // 詰将棋に関する項目
  OPUS_NO = "opusNo", // 作品番号
  OPUS_NAME = "opusName", // 作品名
  AUTHOR = "author", // 作者
  PUBLISHED_BY = "publishedBy", // 発表誌
  PUBLISHED_AT = "publishedAt", // 発表年月
  SOURCE = "source", // 出典
  LENGTH = "length", // 手数
  INTEGRITY = "integrity", // 完全性
  CATEGORY = "category", // 分類
  AWARD = "award", // 受賞
}

/**
 * 棋譜メタデータ(読み取り専用)
 */
export interface ImmutableRecordMetadata {
  /**
   * 定義済みのメタデータのキーの一覧を取得します。
   */
  get standardMetadataKeys(): IterableIterator<RecordMetadataKey>;
  /**
   * 定義済みのメタデータを取得します。
   * @param key
   */
  getStandardMetadata(key: RecordMetadataKey): string | undefined;
  /**
   * カスタムメタデータのキーの一覧を取得します。
   */
  get customMetadataKeys(): IterableIterator<string>;
  /**
   * カスタムメタデータを取得します。
   * @param key
   */
  getCustomMetadata(key: string): string | undefined;
}

/**
 * 先手の対局者名をフルネーム優先で取得します。
 * @param metadata
 */
export function getBlackPlayerName(metadata: ImmutableRecordMetadata): string | undefined {
  return (
    metadata.getStandardMetadata(RecordMetadataKey.BLACK_NAME) ||
    metadata.getStandardMetadata(RecordMetadataKey.BLACK_SHORT_NAME) ||
    metadata.getStandardMetadata(RecordMetadataKey.SHITATE_NAME)
  );
}

/**
 * 後手の対局者名をフルネーム優先で取得します。
 * @param metadata
 */
export function getWhitePlayerName(metadata: ImmutableRecordMetadata): string | undefined {
  return (
    metadata.getStandardMetadata(RecordMetadataKey.WHITE_NAME) ||
    metadata.getStandardMetadata(RecordMetadataKey.WHITE_SHORT_NAME) ||
    metadata.getStandardMetadata(RecordMetadataKey.UWATE_NAME)
  );
}

/**
 * 先手の対局者名を省略名優先で取得します。
 * @param metadata
 */
export function getBlackPlayerNamePreferShort(
  metadata: ImmutableRecordMetadata,
): string | undefined {
  return (
    metadata.getStandardMetadata(RecordMetadataKey.BLACK_SHORT_NAME) ||
    metadata.getStandardMetadata(RecordMetadataKey.BLACK_NAME) ||
    metadata.getStandardMetadata(RecordMetadataKey.SHITATE_NAME)
  );
}

/**
 * 後手の対局者名を省略名優先で取得します。
 * @param metadata
 */
export function getWhitePlayerNamePreferShort(
  metadata: ImmutableRecordMetadata,
): string | undefined {
  return (
    metadata.getStandardMetadata(RecordMetadataKey.WHITE_SHORT_NAME) ||
    metadata.getStandardMetadata(RecordMetadataKey.WHITE_NAME) ||
    metadata.getStandardMetadata(RecordMetadataKey.UWATE_NAME)
  );
}

/**
 * 棋譜メタデータ
 */
export class RecordMetadata {
  private standard = new Map<RecordMetadataKey, string>();
  private custom = new Map<string, string>();

  /**
   * 定義済みのメタデータのキーの一覧を取得します。
   */
  get standardMetadataKeys(): IterableIterator<RecordMetadataKey> {
    return this.standard.keys();
  }

  /**
   * 定義済みのメタデータを取得します。
   * @param key
   */
  getStandardMetadata(key: RecordMetadataKey): string | undefined {
    return this.standard.get(key);
  }

  /**
   * 定義済みのメタデータを設定します。
   * @param key
   * @param value
   */
  setStandardMetadata(key: RecordMetadataKey, value: string): void {
    if (value) {
      this.standard.set(key, value);
    } else {
      this.standard.delete(key);
    }
  }

  /**
   * カスタムメタデータのキーの一覧を取得します。
   */
  get customMetadataKeys(): IterableIterator<string> {
    return this.custom.keys();
  }

  /**
   * カスタムメタデータを取得します。
   * @param key
   */
  getCustomMetadata(key: string): string | undefined {
    return this.custom.get(key);
  }

  /**
   * カスタムメタデータを設定します。
   * @param key
   * @param value
   */
  setCustomMetadata(key: string, value: string): void {
    if (value) {
      this.custom.set(key, value);
    } else {
      this.custom.delete(key);
    }
  }
}

/**
 * 棋譜を構成するノード(読み取り専用)
 */
export interface ImmutableNode {
  readonly ply: number;
  readonly prev: ImmutableNode | null;
  readonly next: ImmutableNode | null;
  readonly branch: ImmutableNode | null;
  readonly branchIndex: number;
  readonly activeBranch: boolean;
  readonly nextColor: Color;
  readonly move: Move | SpecialMove;
  readonly isCheck: boolean;
  readonly comment: string;
  readonly customData: unknown;
  readonly sfen: string;
  readonly displayText: string;
  readonly timeText: string;
  readonly hasBranch: boolean;
  readonly isFirstBranch: boolean;
  readonly isLastMove: boolean;
  readonly elapsedMs: number;
  readonly totalElapsedMs: number;
  readonly bookmark: string;
}

/**
 * 棋譜を構成するノード
 */
export interface Node extends ImmutableNode {
  readonly prev: Node | null;
  readonly next: Node | null;
  readonly branch: Node | null;
  comment: string;
  bookmark: string;
  customData: unknown;
  setElapsedMs(elapsedMs: number): void;
}

function copyNodeMetadata(source: ImmutableNode, target: Node): void {
  target.comment = source.comment;
  target.bookmark = source.bookmark;
  target.customData = source.customData;
  target.setElapsedMs(source.elapsedMs);
}

class NodeImpl implements Node {
  public next: NodeImpl | null = null;
  public branch: NodeImpl | null = null;
  public comment = "";
  public customData: unknown;
  public elapsedMs = 0;
  public totalElapsedMs = 0;
  public bookmark = "";

  constructor(
    public ply: number,
    public prev: NodeImpl | null,
    public branchIndex: number,
    public activeBranch: boolean,
    public nextColor: Color,
    public move: Move | SpecialMove,
    public isCheck: boolean,
    public displayText: string,
    public sfen: string,
  ) {}

  get timeText(): string {
    const elapsed = millisecondsToMSS(this.elapsedMs);
    const totalElapsed = millisecondsToHHMMSS(this.totalElapsedMs);
    return `${elapsed} / ${totalElapsed}`;
  }

  get hasBranch(): boolean {
    return !!this.prev && !!this.prev.next && !!this.prev.next.branch;
  }

  get isFirstBranch(): boolean {
    return !this.prev || this.prev.next === this;
  }

  get isLastMove(): boolean {
    if (!this.next) {
      return true;
    }
    for (let p: Node | null = this.next; p; p = p.branch) {
      if (p.move instanceof Move) {
        return false;
      }
    }
    return true;
  }

  private updateTotalElapsedMs() {
    this.totalElapsedMs = this.elapsedMs;
    if (this.prev && this.prev.prev) {
      this.totalElapsedMs += this.prev.prev.totalElapsedMs;
    }
  }

  setElapsedMs(elapsedMs: number): void {
    this.elapsedMs = elapsedMs;
    this.updateTotalElapsedMs();
    let p = this.next;
    const stack: NodeImpl[] = [];
    while (p) {
      p.updateTotalElapsedMs();
      if (p.branch) {
        stack.push(p.branch);
      }
      if (p.next) {
        p = p.next;
      } else {
        p = stack.pop() || null;
      }
    }
  }

  static newRootEntry(position: ImmutablePosition): NodeImpl {
    return new NodeImpl(
      0, // ply
      null, // prev
      0, // branchIndex
      true, // activeBranch
      position.color, // color
      specialMove(SpecialMoveType.START), // move
      false, // isCheck
      "開始局面", // displayText
      position.sfen, // sfen
    );
  }
}

export type USIFormatOptions = {
  /** 平手の場合に "startpos" を使用するかを指定します。デフォルトは true です。 */
  startpos?: boolean;
  /** 投了 "resign" を出力に含めるかどうかを表します。デフォルトは false です。 */
  resign?: boolean;
  /** 全ての指し手を含めるかどうかを指定します。デフォルトは false です。 */
  allMoves?: boolean;
};

/**
 * 棋譜(読み取り専用)
 */
export interface ImmutableRecord {
  readonly metadata: ImmutableRecordMetadata;
  readonly initialPosition: ImmutablePosition;
  readonly position: ImmutablePosition;
  readonly first: ImmutableNode;
  readonly current: ImmutableNode;
  readonly moves: Array<ImmutableNode>;
  readonly movesBefore: Array<ImmutableNode>;
  readonly length: number;
  readonly branchBegin: ImmutableNode;
  readonly repetition: boolean;
  getRepetitionCount(position: ImmutablePosition): number;
  readonly perpetualCheck: Color | null;
  readonly usi: string;
  getUSI(opts?: USIFormatOptions): string;
  readonly sfen: string;
  readonly usen: [string, number];
  readonly bookmarks: string[];
  forEach(handler: (node: ImmutableNode) => void): void;
  getSubtree(): ImmutableRecord;
  on(event: "changePosition", handler: () => void): void;
}

/**
 * 棋譜
 */
export class Record implements ImmutableRecord {
  public metadata: RecordMetadata;
  private _initialPosition: ImmutablePosition;
  private _position: Position;
  private _first: NodeImpl;
  private _current: NodeImpl;
  private repetitionCounts: { [sfen: string]: number } = {};
  private repetitionStart: { [sfen: string]: number } = {};
  private onChangePosition = (): void => {
    /* noop */
  };

  constructor(position?: ImmutablePosition) {
    this.metadata = new RecordMetadata();
    this._initialPosition = position ? position.clone() : new Position();
    this._position = this.initialPosition.clone();
    this._first = NodeImpl.newRootEntry(this._initialPosition);
    this._current = this._first;
    this.incrementRepetition();
  }

  /**
   * 初期局面を返します。
   */
  get initialPosition(): ImmutablePosition {
    return this._initialPosition;
  }

  /**
   * 現在の局面を返します。
   */
  get position(): ImmutablePosition {
    return this._position;
  }

  /**
   * 初期局面のノードを返します。
   * このノードには必ず SpecialMoveType.START が設定されます。
   * first.next が1手目に該当します。
   */
  get first(): Node {
    return this._first;
  }

  /**
   * 現在の局面のノードを返します。
   */
  get current(): Node {
    return this._current;
  }

  /**
   * アクティブな経路の指し手の一覧を返します。
   */
  get moves(): Array<Node> {
    const moves = this.movesBefore;
    for (let p = this._current.next; p; p = p.next) {
      while (!p.activeBranch) {
        p = p.branch as NodeImpl;
      }
      moves.push(p);
    }
    return moves;
  }

  /**
   * 現在の局面までの指し手の一覧を返します。
   */
  get movesBefore(): Array<Node> {
    return this._movesBefore;
  }

  private get _movesBefore(): Array<NodeImpl> {
    const moves = new Array<NodeImpl>();
    moves.unshift(this._current);
    for (let p = this._current.prev; p; p = p.prev) {
      moves.unshift(p);
    }
    return moves;
  }

  /**
   * アクティブな経路の総手数を返します。
   */
  get length(): number {
    let len = this._current.ply;
    for (let p = this._current.next; p; p = p.next) {
      while (!p.activeBranch) {
        p = p.branch as NodeImpl;
      }
      len = p.ply;
    }
    return len;
  }

  /**
   * 最初の兄弟ノードを返します。
   */
  get branchBegin(): Node {
    return this._current.prev ? (this._current.prev.next as Node) : this._current;
  }

  /**
   * 指定した局面で棋譜を初期化します。
   * @param position
   */
  clear(position?: ImmutablePosition): void {
    this.metadata = new RecordMetadata();
    if (position) {
      this._initialPosition = position.clone();
    }
    this._position = this.initialPosition.clone();
    this._first = NodeImpl.newRootEntry(this._initialPosition);
    this._current = this._first;
    this.repetitionCounts = {};
    this.repetitionStart = {};
    this.incrementRepetition();
    this.onChangePosition();
  }

  /**
   * 1手前に戻ります。
   */
  goBack(): boolean {
    if (this._goBack()) {
      this.onChangePosition();
      return true;
    }
    return false;
  }

  private _goBack(): boolean {
    if (this._current.prev) {
      if (this._current.move instanceof Move) {
        this.decrementRepetition();
        this._position.undoMove(this._current.move);
      }
      this._current = this._current.prev;
      return true;
    }
    return false;
  }

  /**
   * 1手先に進みます。
   */
  goForward(): boolean {
    if (this._goForward()) {
      this.onChangePosition();
      return true;
    }
    return false;
  }

  private _goForward(): boolean {
    if (this._current.next) {
      this._current = this._current.next;
      while (!this._current.activeBranch) {
        this._current = this._current.branch as NodeImpl;
      }
      if (this._current.move instanceof Move) {
        this._position.doMove(this._current.move, {
          ignoreValidation: true,
        });
        this.incrementRepetition();
      }
      return true;
    }
    return false;
  }

  /**
   * アクティブな経路上で指定した手数まで移動します。
   * @param ply
   */
  goto(ply: number): void {
    const orgPly = this._current.ply;
    this._goto(ply);
    if (orgPly !== this._current.ply) {
      this.onChangePosition();
    }
  }

  private _goto(ply: number): void {
    while (ply < this._current.ply) {
      if (!this._goBack()) {
        break;
      }
    }
    while (ply > this._current.ply) {
      if (!this._goForward()) {
        break;
      }
    }
  }

  /**
   * 全ての分岐選択を初期化して最初のノードをアクティブにします。
   */
  resetAllBranchSelection(): void {
    let confluence = this._current;
    for (let node = this._current; node.prev; node = node.prev) {
      if (!node.isFirstBranch) {
        confluence = node.prev;
      }
    }
    this._forEach((node) => {
      node.activeBranch = node.isFirstBranch;
    });
    if (this._current !== confluence) {
      while (this._current !== confluence) {
        this._goBack();
      }
      this.onChangePosition();
    }
  }

  /**
   * インデクスを指定して兄弟ノードを選択します。
   * @param index
   */
  switchBranchByIndex(index: number): boolean {
    if (this.current.branchIndex === index) {
      return true;
    }
    if (!this._current.prev) {
      return false;
    }
    let ok = false;
    for (let p = this._current.prev.next; p; p = p.branch) {
      if (p.branchIndex === index) {
        p.activeBranch = true;
        if (this._current.move instanceof Move) {
          this.decrementRepetition();
          this._position.undoMove(this._current.move);
        }
        this._current = p;
        if (this._current.move instanceof Move) {
          this._position.doMove(this._current.move, {
            ignoreValidation: true,
          });
          this.incrementRepetition();
        }
        ok = true;
      } else {
        p.activeBranch = false;
      }
    }
    if (ok) {
      this.onChangePosition();
    }
    return ok;
  }

  /**
   * 指し手を追加して1手先に進みます。
   * 現在のノードが特殊な指し手(ex. 投了)の場合は前のノードに戻ってから追加します。
   * 既に同じ指し手が存在する場合はそのノードへ移動します。
   */
  append(move: Move | SpecialMove | SpecialMoveType, opt?: DoMoveOption): boolean {
    if (this._append(move, opt)) {
      this.onChangePosition();
      return true;
    }
    return false;
  }

  private _append(move: Move | SpecialMove | SpecialMoveType, opt?: DoMoveOption): boolean {
    // convert SpecialMoveType to SpecialMove
    if (typeof move === "string") {
      move = specialMove(move);
    }
    // 指し手を表す文字列を取得する。
    const lastMove = this.current.move instanceof Move ? this.current.move : undefined;
    const displayText =
      move instanceof Move
        ? formatMove(this.position, move, { lastMove })
        : formatSpecialMove(move);

    // 局面を動かす。
    let isCheck = false;
    if (move instanceof Move) {
      if (!this._position.doMove(move, opt)) {
        return false;
      }
      this.incrementRepetition();
      isCheck = this.position.checked;
    }

    // 特殊な指し手のノードの場合は前のノードに戻る。
    if (this._current !== this.first && !(this._current.move instanceof Move)) {
      this._goBack();
    }

    // 最終ノードの場合は単に新しいノードを追加する。
    if (!this._current.next) {
      this._current.next = new NodeImpl(
        this._current.ply + 1, // number
        this._current, // prev
        0, // branchIndex
        true, // activeBranch
        this.position.color, // nextColor
        move,
        isCheck,
        displayText,
        this.position.sfen,
      );
      this._current = this._current.next;
      this._current.setElapsedMs(0);
      return true;
    }

    // 既存の兄弟ノードから選択を解除する。
    let p: NodeImpl | null;
    for (p = this._current.next; p; p = p.branch) {
      p.activeBranch = false;
    }

    // 同じ指し手が既に存在する場合はそのノードへ移動して終わる。
    let lastBranch = this._current.next;
    for (p = this._current.next; p; p = p.branch) {
      if (areSameMoves(move, p.move)) {
        this._current = p;
        this._current.activeBranch = true;
        return true;
      }
      lastBranch = p;
    }

    // 兄弟ノードを追加する。
    this._current = new NodeImpl(
      this._current.ply + 1, // number
      this._current, // prev
      lastBranch.branchIndex + 1, // branchIndex
      true, // activeBranch
      this.position.color, // nextColor
      move,
      isCheck,
      displayText,
      this.position.sfen,
    );
    this._current.setElapsedMs(0);
    lastBranch.branch = this._current;
    return true;
  }

  /**
   * 次の兄弟ノードと順序を入れ替えます。
   */
  swapWithNextBranch(): boolean {
    if (!this._current.branch) {
      return false;
    }
    return Record.swapWithPreviousBranch(this._current.branch);
  }

  /**
   * 前の兄弟ノードと順序を入れ替えます。
   */
  swapWithPreviousBranch(): boolean {
    return Record.swapWithPreviousBranch(this._current);
  }

  private static swapWithPreviousBranch(target: NodeImpl): boolean {
    const prev = target.prev;
    if (!prev || !prev.next || prev.next == target) {
      return false;
    }
    if (prev.next.branch === target) {
      const pair = prev.next;
      pair.branch = target.branch;
      target.branch = pair;
      prev.next = target;
      [target.branchIndex, pair.branchIndex] = [pair.branchIndex, target.branchIndex];
      return true;
    }
    for (let p = prev.next; p.branch; p = p.branch) {
      if (p.branch.branch === target) {
        const pair = p.branch;
        pair.branch = target.branch;
        target.branch = pair;
        p.branch = target;
        [target.branchIndex, pair.branchIndex] = [pair.branchIndex, target.branchIndex];
        return true;
      }
    }
    return false;
  }

  /**
   * 現在の指し手を削除します。
   */
  removeCurrentMove(): boolean {
    const target = this._current;
    if (!this.goBack()) {
      return this.removeNextMove();
    }
    if (this._current.next === target) {
      this._current.next = target.branch;
    } else {
      for (let p = this._current.next; p; p = p.branch) {
        if (p.branch === target) {
          p.branch = target.branch;
          break;
        }
      }
    }
    let branchIndex = 0;
    for (let p = this._current.next; p; p = p.branch) {
      p.branchIndex = branchIndex;
      branchIndex += 1;
    }
    if (this._current.next) {
      this._current.next.activeBranch = true;
    }
    this.onChangePosition();
    return true;
  }

  /**
   * 後続の手を全て削除します。
   */
  removeNextMove(): boolean {
    if (this._current.next) {
      this._current.next = null;
      return true;
    }
    return false;
  }

  /**
   * 棋譜をマージします。
   * 経過時間やコメント、しおりが両方にある場合は自分の側を優先します。
   * 初期局面が異なる場合はマージできません。
   * @param record
   */
  merge(record: ImmutableRecord): boolean {
    // 初期局面が異なる場合はマージできない。
    if (this.initialPosition.sfen !== record.initialPosition.sfen) {
      return false;
    }
    // 元居た局面までのパスを記憶する。
    const path = this.movesBefore;
    // 開始局面に戻してマージを実行する。
    this._goto(0);
    this.mergeIntoCurrentPosition(record);
    // 元居た局面まで戻す。
    for (let i = 1; i < path.length; i++) {
      this._append(path[i].move, { ignoreValidation: true });
    }
    return true;
  }

  /**
   * 棋譜を現在の局面からのサブツリーとしてマージします。
   * 経過時間やコメント、しおりが両方にある場合は自分の側を優先します。
   * 開始局面が一致していなくてもマージできますが、指し手が挿入不能な場合その子ノードは無視されます。
   * @param record
   */
  mergeIntoCurrentPosition(
    record: ImmutableRecord,
    option?: DoMoveOption,
  ): { successCount: number; skipCount: number } {
    const begin = this._current.ply;
    let errorPly: number | null = null;
    let successCount = 0;
    let skipCount = 0;
    // 指し手をマージする。
    record.forEach((node) => {
      if (node.ply === 0) {
        return;
      }
      const ply = begin + node.ply - 1;
      if (errorPly !== null && ply > errorPly) {
        skipCount++;
        return;
      }
      this._goto(ply);
      if (!this._append(node.move, option)) {
        errorPly = ply;
        skipCount++;
        return;
      }
      errorPly = null;
      successCount++;
      if (node.elapsedMs && !this.current.elapsedMs) {
        this.current.setElapsedMs(node.elapsedMs);
      }
      if (node.comment && !this.current.comment) {
        this.current.comment = node.comment;
      }
      if (node.bookmark && !this.current.bookmark) {
        this.current.bookmark = node.bookmark;
      }
      if (node.customData && !this.current.customData) {
        this.current.customData = node.customData;
      }
    });
    // 元居た局面まで戻す。
    this._goto(begin);
    return { successCount, skipCount };
  }

  /**
   * 指定したしおりがある局面まで移動します。
   * @param bookmark
   */
  jumpToBookmark(bookmark: string): boolean {
    // 既に該当する局面にいる場合は何もしない。
    if (this._current.bookmark === bookmark) {
      return true;
    }
    // 一致するブックマークを探す。
    const node = this.find((node) => node.bookmark === bookmark);
    if (!node) {
      return false;
    }
    // ブックマークのある局面までの経路を配列に書き出す。
    const route: Node[] = [];
    for (let p: Node | null = node; p; p = p.prev) {
      route[p.ply] = p;
    }
    // 合流するところまで局面を戻す。
    while (this._current !== route[this._current.ply]) {
      this.goBack();
    }
    // ブックマークのある局面まで指し手を進める。
    while (route.length > this._current.ply + 1) {
      this.append(route[this._current.ply + 1].move);
    }
    this.onChangePosition();
    return true;
  }

  private incrementRepetition(): void {
    const sfen = this.position.sfen;
    if (this.repetitionCounts[sfen]) {
      this.repetitionCounts[sfen] += 1;
    } else {
      this.repetitionCounts[sfen] = 1;
      this.repetitionStart[sfen] = this.current.ply;
    }
  }

  private decrementRepetition(): void {
    const sfen = this.position.sfen;
    this.repetitionCounts[sfen] -= 1;
    if (this.repetitionCounts[sfen] === 0) {
      delete this.repetitionCounts[sfen];
      delete this.repetitionStart[sfen];
    }
  }

  /**
   * 千日手かどうかを判定します。
   * 現在の局面が4回目以上の同一局面である場合に true を返します。
   */
  get repetition(): boolean {
    return this.repetitionCounts[this.position.sfen] >= 4;
  }

  /**
   * 現在の局面まで(Record.current着手後を含む)に指定された局面が何回現れたかを返します。
   * @param position
   */
  getRepetitionCount(position: ImmutablePosition): number {
    return this.repetitionCounts[position.sfen] || 0;
  }

  /**
   * 連続王手の千日手かどうかを判定します。
   * 現在の局面が4回目以上の同一局面であり、かつ同一局面が最初に出現したときから一方の王手が連続している場合に true を返します。
   */
  get perpetualCheck(): Color | null {
    if (!this.repetition) {
      return null;
    }
    const sfen = this.position.sfen;
    const since = this.repetitionStart[sfen];
    let black = true;
    let white = true;
    let color = this.position.color;
    for (let p = this.current; p.ply >= since; p = p.prev as Node) {
      color = reverseColor(color);
      if (p.isCheck) {
        continue;
      }
      if (color === Color.BLACK) {
        black = false;
      } else {
        white = false;
      }
    }
    return black ? Color.BLACK : white ? Color.WHITE : null;
  }

  /**
   * getUSI をオプション無しで呼び出した場合と同じ値を返します。
   */
  get usi(): string {
    return this.getUSI();
  }

  /**
   * USI形式の文字列を返します。
   * @param opts
   */
  getUSI(opts?: USIFormatOptions): string {
    const sfen = this.initialPosition.sfen;
    const useStartpos = opts?.startpos !== false && sfen === InitialPositionSFEN.STANDARD;
    const position = "position " + (useStartpos ? "startpos" : "sfen " + this.initialPosition.sfen);
    const moves = [];
    for (let p = this.first; ; p = p.next) {
      while (!p.activeBranch) {
        p = p.branch as NodeImpl;
      }
      if (p.move instanceof Move) {
        moves.push(p.move.usi);
      } else if (opts?.resign && p.move.type === SpecialMoveType.RESIGN) {
        moves.push("resign");
      }
      if (!p.next || (!opts?.allMoves && p === this.current)) {
        break;
      }
    }
    if (moves.length === 0) {
      return position;
    }
    return [position, "moves"].concat(moves).join(" ");
  }

  /**
   * 現在の局面のSFEN形式の文字列を返します。
   */
  get sfen(): string {
    return this.position.getSFEN(this._current.ply + 1);
  }

  /**
   * USEN (Url Safe sfen-Extended Notation) 形式の文字列を返します。
   * https://www.slideshare.net/slideshow/scalajs-web/92707205#15
   * @returns [usen, branchIndex]
   */
  get usen(): [string, number] {
    const sfen = this.initialPosition.sfen;
    let usen =
      sfen === InitialPositionSFEN.STANDARD
        ? ""
        : sfen.replace(/ 1$/, "").replace(/\//g, "_").replace(/ /g, ".").replace(/\+/g, "z");
    let moves = "0.";
    let special = "";
    let lastPly = 0;
    let bi = 0;
    let branchIndex = 0;
    this.forEach((node) => {
      if (node.ply === 0) {
        // root node
        return;
      }
      const move = node.move;
      if (lastPly + 1 !== node.ply) {
        usen += `~${moves}.${special}`;
        moves = `${node.ply - 1}.`;
        bi++;
      }
      if (this.current === node) {
        branchIndex = bi;
      }
      if (!(move instanceof Move)) {
        switch (move.type) {
          case SpecialMoveType.RESIGN:
            special = "r";
            break;
          case SpecialMoveType.TIMEOUT:
            special = "t";
            break;
          case SpecialMoveType.MAX_MOVES:
          case SpecialMoveType.IMPASS:
          case SpecialMoveType.DRAW:
            special = "j";
            break;
          default:
            // 未定義のものは全て中断として扱う。
            special = "p";
            break;
        }
        return;
      }
      const from =
        move.from instanceof Square
          ? (move.from.rank - 1) * 9 + (move.from.file - 1)
          : usenHandTable[move.from];
      const to = (move.to.rank - 1) * 9 + (move.to.file - 1);
      const m = (from * 81 + to) * 2 + (move.promote ? 1 : 0);
      moves += m.toString(36).padStart(3, "0");
      lastPly = node.ply;
    });
    usen += `~${moves}.${special}`;
    return [usen, branchIndex];
  }

  /**
   * しおりの一覧を返します。
   */
  get bookmarks(): string[] {
    const bookmarks: string[] = [];
    const existed: { [name: string]: boolean } = {};
    this.forEach((node) => {
      if (node.bookmark && !existed[node.bookmark]) {
        bookmarks.push(node.bookmark);
        existed[node.bookmark] = true;
      }
    });
    return bookmarks;
  }

  // 深さ優先で全てのノードを訪問します。
  forEach(handler: (node: Node) => void): void {
    this._forEach(handler);
  }

  private _forEach(handler: (node: NodeImpl) => void): void {
    this.find((node) => {
      handler(node);
      return false;
    });
  }

  private find(handler: (node: NodeImpl) => boolean): NodeImpl | null {
    let p: NodeImpl = this._first;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      if (handler(p)) {
        return p;
      }
      if (p.next) {
        p = p.next;
        continue;
      }
      while (!p.branch) {
        const prev = p.prev;
        if (!prev) {
          return null;
        }
        p = prev;
      }
      p = p.branch;
    }
  }

  getSubtree(): Record {
    // Create a new Record instance with the initial position.
    const subtree = new Record(this.position);

    // Copy the metadata from the current record to the subtree.
    for (const key of Object.values(RecordMetadataKey)) {
      const value = this.metadata.getStandardMetadata(key);
      if (value) {
        subtree.metadata.setStandardMetadata(key, value);
      }
    }
    for (const key of this.metadata.customMetadataKeys) {
      const value = this.metadata.getCustomMetadata(key);
      if (value) {
        subtree.metadata.setCustomMetadata(key, value);
      }
    }

    // Copy the nodes from the current record to the subtree.
    let p: ImmutableNode = this.current;
    copyNodeMetadata(p, subtree.current);
    if (!p.next) {
      return subtree;
    }
    p = p.next;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      subtree.append(p.move, { ignoreValidation: true });
      copyNodeMetadata(p, subtree.current);
      if (p.next) {
        p = p.next;
        continue;
      }
      while (!p.branch) {
        const prev = p.prev;
        if (!prev || prev === this.current) {
          subtree.goto(0);
          return subtree;
        }
        subtree.goBack();
        p = prev;
      }
      subtree.goBack();
      p = p.branch;
    }
  }

  on(event: "changePosition", handler: () => void): void;
  on(event: string, handler: unknown): void {
    switch (event) {
      case "changePosition":
        this.onChangePosition = handler as () => void;
        break;
    }
  }

  /**
   * USI形式の文字列から棋譜を読み込みます。
   * @param data
   */
  static newByUSI(data: string): Record | Error {
    const positionStartpos = "position startpos";
    const startpos = "startpos";
    const prefixPositionStartpos = "position startpos ";
    const prefixPositionSFEN = "position sfen ";
    const prefixStartpos = "startpos ";
    const prefixSFEN = "sfen ";
    const prefixMoves = "moves ";
    if (data === positionStartpos || data === startpos) {
      return new Record();
    } else if (data.startsWith(prefixPositionStartpos)) {
      return Record.newByUSIFromMoves(data.slice(prefixPositionStartpos.length));
    } else if (data.startsWith(prefixPositionSFEN)) {
      return Record.newByUSIFromSFEN(data.slice(prefixPositionSFEN.length));
    } else if (data.startsWith(prefixStartpos)) {
      return Record.newByUSIFromMoves(data.slice(prefixStartpos.length));
    } else if (data.startsWith(prefixSFEN)) {
      return Record.newByUSIFromSFEN(data.slice(prefixSFEN.length));
    } else if (data.startsWith(prefixMoves)) {
      return Record.newByUSIFromMoves(data);
    } else {
      return new InvalidUSIError(data);
    }
  }

  private static newByUSIFromSFEN(data: string): Record | Error {
    const sections = data.split(" ");
    if (sections.length < 3) {
      return new InvalidUSIError(data);
    }
    const movesIndex = sections.length === 3 || sections[3] === "moves" ? 3 : 4;
    const position = Position.newBySFEN(sections.slice(0, movesIndex).join(" "));
    if (!position) {
      return new InvalidUSIError(data);
    }
    return Record.newByUSIFromMoves(sections.slice(movesIndex).join(" "), position);
  }

  private static newByUSIFromMoves(data: string, position?: ImmutablePosition): Record | Error {
    const record = new Record(position);
    if (data.length === 0) {
      return record;
    }
    const sections = data.split(" ");
    if (sections[0] !== "moves") {
      return new InvalidUSIError(data);
    }
    for (let i = 1; i < sections.length; i++) {
      if (sections[i] === "resign") {
        record.append(SpecialMoveType.RESIGN);
        break;
      }
      const parsed = parseUSIMove(sections[i]);
      if (!parsed) {
        break;
      }
      let move = record.position.createMove(parsed.from, parsed.to);
      if (!move) {
        return new InvalidMoveError(sections[i]);
      }
      if (parsed.promote) {
        move = move.withPromote();
      }
      record.append(move, { ignoreValidation: true });
    }
    return record;
  }

  /**
   * USEN (Url Safe sfen-Extended Notation) 形式の文字列から棋譜を読み込みます。
   * https://www.slideshare.net/slideshow/scalajs-web/92707205#15
   */
  static newByUSEN(usen: string, branchIndex?: number, ply?: number): Record | Error {
    const sections = usen.split("~");
    if (sections.length < 2) {
      return new Error("USEN must have at least 2 sections.");
    }
    const sfen = sections[0].replace(/_/g, "/").replace(/\./g, " ").replace(/z/g, "+");
    const position = sfen === "" ? new Position() : Position.newBySFEN(sfen + " 1");
    if (!position) {
      return new Error("Invalid SFEN in USEN.");
    }
    const record = new Record(position);
    let activeNode = record.first;
    for (let si = 1; si < sections.length; si++) {
      const [n, moves, special] = sections[si].split(".");
      if (!/[0-9]+/.test(n)) {
        return new Error("Invalid USEN ply format.");
      }
      record.goto(parseInt(n));
      for (let i = 0; i < moves.length; i += 3) {
        const m = parseInt(moves.slice(i, i + 3), 36);
        const f = Math.floor(m / 162);
        const from =
          f < 81 ? new Square((f % 9) + 1, Math.floor(f / 9) + 1) : usenHandReverseTable[f];
        const t = Math.floor((m % 162) / 2);
        const to = new Square((t % 9) + 1, Math.floor(t / 9) + 1);
        const promote = m % 2 === 1;
        const move = record.position.createMove(from, to);
        if (!move) {
          return new Error("Invalid move in USEN.");
        }
        record.append(promote ? move.withPromote() : move, { ignoreValidation: true });
        if (si - 1 === branchIndex && record.current.ply === ply) {
          activeNode = record.current;
        }
      }
      if (special === "r") {
        record.append(specialMove(SpecialMoveType.RESIGN));
      } else if (special === "t") {
        record.append(specialMove(SpecialMoveType.TIMEOUT));
      } else if (special === "j") {
        record.append(specialMove(SpecialMoveType.IMPASS));
      } else if (special === "p") {
        record.append(specialMove(SpecialMoveType.INTERRUPT));
      }
      if (si - 1 === branchIndex && record.current.ply === ply) {
        activeNode = record.current;
      }
    }
    if (activeNode === record.first) {
      record.goto(0);
    } else {
      const route: Node[] = [];
      for (let p: Node | null = activeNode; p; p = p.prev) {
        route[p.ply] = p;
      }
      while (record._current !== route[record._current.ply]) {
        record.goBack();
      }
      while (route.length > record._current.ply + 1) {
        record.append(route[record._current.ply + 1].move);
      }
    }
    return record;
  }
}

/**
 * USI形式の文字列から次の手番を取得します。
 * @param usi
 */
export function getNextColorFromUSI(usi: string): Color {
  const sections = usi.trim().split(" ");
  const baseColor = sections[1] === "startpos" || sections[3] === "b" ? Color.BLACK : Color.WHITE;
  const firstMoveIndex =
    sections[1] === "startpos"
      ? sections[2] === "moves"
        ? 3
        : 2
      : sections[6] === "moves"
        ? 7
        : 6;
  return (sections.length - firstMoveIndex) % 2 === 0 ? baseColor : reverseColor(baseColor);
}
