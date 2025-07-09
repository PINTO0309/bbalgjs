/**
 * Baba algorithm for robustly determining status changes of objects to be tracked.
 * TypeScript definitions for bbalgjs
 */

declare module 'bbalgjs' {
  /**
 * Result of the state verdict analysis
 */
export interface StateVerdictResult {
  /** Whether the state is currently in progress */
  stateInProgress: boolean;
  /** Whether the state has just started */
  stateStartJudgment: boolean;
  /** Whether the state has just ended */
  stateEndJudgment: boolean;
}

/**
 * Fixed-size queue interface
 */
export interface FixedQueue<T> {
  /** Add an item to the queue */
  push(item: T): void;
  /** Get all items as an array */
  toArray(): T[];
  /** Current number of items in the queue */
  readonly length: number;
  /** Maximum capacity of the queue */
  readonly maxLength: number;
}

/**
 * Determines the state of an object based on tracking history
 * @param longTrackingHistory - N historical tracking results (older to newer)
 * @param shortTrackingHistory - M recent tracking results (older to newer)
 * @param longMaxLength - Expected maximum length of long tracking history
 * @param shortMaxLength - Expected maximum length of short tracking history
 * @returns Object containing three boolean state judgments
 * @throws {Error} If inputs are not arrays
 */
export function stateVerdict(
  longTrackingHistory: boolean[],
  shortTrackingHistory: boolean[],
  longMaxLength?: number,
  shortMaxLength?: number
): StateVerdictResult;

/**
 * Creates a fixed-size queue (deque) that maintains a maximum length
 * @param maxLength - Maximum number of items the queue can hold
 * @returns Deque-like object with push and toArray methods
 * @throws {Error} If maxLength is not a positive integer
 */
export function createFixedQueue<T = boolean>(maxLength: number): FixedQueue<T>;
}