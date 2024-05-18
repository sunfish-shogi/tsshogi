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
  customData: unknown;
  setElapsedMs(elapsedMs: number): void;
  bookmark: string;
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

  static newRootEntry(color: Color): NodeImpl {
    return new NodeImpl(
      0, // ply
      null, // prev
      0, // branchIndex
      true, // activeBranch
      color, // color
      specialMove(SpecialMoveType.START), // move
      false, // isCheck
      "開始局面", // displayText
    );
  }
}

export type USIFormatOptions = {
  // 平手の場合に "startpos" を使用するかを指定します。デフォルトは true です。
  startpos?: boolean;
  // 投了 "resign" を出力に含めるかどうかを表します。デフォルトは false です。
  resign?: boolean;
  // 全ての指し手を含めるかどうかを指定します。デフォルトは false です。
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
  readonly perpetualCheck: Color | null;
  readonly usi: string;
  getUSI(opts?: USIFormatOptions): string;
  readonly sfen: string;
  readonly bookmarks: string[];
  forEach(handler: (node: ImmutableNode, base: ImmutablePosition) => void): void;
  on(event: "changePosition", handler: () => void): void;
}

/**
 * 棋譜
 */
export class Record {
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
    this._first = NodeImpl.newRootEntry(this._initialPosition.color);
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
    this._first = NodeImpl.newRootEntry(this._initialPosition.color);
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
    if (orgPly !== this._current.ply) {
      this.onChangePosition();
    }
  }

  /**
   * 全ての分岐選択を初期化して最初のノードをアクティブにします。
   */
  resetAllBranchSelection(): void {
    this._forEach((node) => {
      node.activeBranch = node.isFirstBranch;
    });
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
      );
      this._current = this._current.next;
      this._current.setElapsedMs(0);
      this.onChangePosition();
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
        this.onChangePosition();
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
    );
    this._current.setElapsedMs(0);
    lastBranch.branch = this._current;
    this.onChangePosition();
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
      if (!this._current.next) {
        return false;
      }
      this._current.next = null;
      return true;
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
   * @param record
   */
  merge(record: ImmutableRecord): boolean {
    // 初期局面が異なる場合はマージできない。
    if (this.initialPosition.sfen !== record.initialPosition.sfen) {
      return false;
    }
    // 元居た局面までのパスを記憶する。
    const path = this.movesBefore;
    // 指し手をマージする。
    record.forEach((node) => {
      if (node.ply === 0) {
        return;
      }
      this.goto(node.ply - 1);
      this.append(node.move, { ignoreValidation: true });
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
    this.goto(0);
    for (let i = 1; i < path.length; i++) {
      this.append(path[i].move, { ignoreValidation: true });
    }
    return true;
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
  forEach(handler: (node: Node, base: ImmutablePosition) => void): void {
    this._forEach(handler);
  }

  private _forEach(handler: (node: NodeImpl, base: ImmutablePosition) => void): void {
    this.find((node, base) => {
      handler(node, base);
      return false;
    });
  }

  private find(handler: (node: NodeImpl, base: ImmutablePosition) => boolean): NodeImpl | null {
    let p: NodeImpl = this._first;
    const pos = this.initialPosition.clone();
    const stack: NodeImpl[] = [];
    // eslint-disable-next-line no-constant-condition
    while (true) {
      if (handler(p, pos)) {
        return p;
      }
      if (p.next) {
        stack.push(p);
        if (p.move instanceof Move) {
          pos.doMove(p.move);
        }
        p = p.next;
        continue;
      }
      while (!p.branch) {
        const last = stack.pop();
        if (!last) {
          return null;
        }
        if (last.move instanceof Move) {
          pos.undoMove(last.move);
        }
        p = last;
      }
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
    const prefixPositionStartpos = "position startpos ";
    const prefixPositionSfen = "position sfen ";
    const prefixStartpos = "startpos ";
    const prefixSfen = "sfen ";
    const prefixMoves = "moves ";
    if (data.startsWith(prefixPositionStartpos)) {
      return Record.newByUSIFromMoves(new Position(), data.slice(prefixPositionStartpos.length));
    } else if (data.startsWith(prefixPositionSfen)) {
      return Record.newByUSIFromSFEN(data.slice(prefixPositionSfen.length));
    } else if (data.startsWith(prefixStartpos)) {
      return Record.newByUSIFromMoves(new Position(), data.slice(prefixStartpos.length));
    } else if (data.startsWith(prefixSfen)) {
      return Record.newByUSIFromSFEN(data.slice(prefixSfen.length));
    } else if (data.startsWith(prefixMoves)) {
      return Record.newByUSIFromMoves(new Position(), data);
    } else {
      return new InvalidUSIError(data);
    }
  }

  private static newByUSIFromSFEN(data: string): Record | Error {
    const sections = data.split(" ");
    if (sections.length < 4) {
      return new InvalidUSIError(data);
    }
    const position = Position.newBySFEN(sections.slice(0, 4).join(" "));
    if (!position) {
      return new InvalidUSIError(data);
    }
    return Record.newByUSIFromMoves(position, sections.slice(4).join(" "));
  }

  private static newByUSIFromMoves(position: ImmutablePosition, data: string): Record | Error {
    const record = new Record(position);
    if (data.length === 0) {
      return record;
    }
    const sections = data.split(" ");
    if (sections[0] !== "moves") {
      return new InvalidUSIError(data);
    }
    for (let i = 1; i < sections.length; i++) {
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
