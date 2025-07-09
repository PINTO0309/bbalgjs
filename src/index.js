/**
 * Baba algorithm for robustly determining status changes of objects to be tracked.
 * JavaScript port of the original Python implementation.
 */

/**
 * Determines the state of an object based on tracking history
 * @param {Array<boolean>} longTrackingHistory - N historical tracking results (older to newer)
 * @param {Array<boolean>} shortTrackingHistory - M recent tracking results (older to newer)
 * @param {number} [longMaxLength] - Expected maximum length of long tracking history
 * @param {number} [shortMaxLength] - Expected maximum length of short tracking history
 * @returns {{stateInProgress: boolean, stateStartJudgment: boolean, stateEndJudgment: boolean}}
 * @throws {Error} If inputs are invalid
 */
function stateVerdict(longTrackingHistory, shortTrackingHistory, longMaxLength, shortMaxLength) {
  // Validate inputs
  if (!Array.isArray(longTrackingHistory) || !Array.isArray(shortTrackingHistory)) {
    throw new Error('Both tracking histories must be arrays');
  }
  
  // If maxLength parameters are provided, validate them
  if (longMaxLength !== undefined || shortMaxLength !== undefined) {
    if (longMaxLength !== undefined && (typeof longMaxLength !== 'number' || longMaxLength <= 0)) {
      throw new Error('longMaxLength must be a positive number');
    }
    if (shortMaxLength !== undefined && (typeof shortMaxLength !== 'number' || shortMaxLength <= 0)) {
      throw new Error('shortMaxLength must be a positive number');
    }
    // Both must be provided together
    if ((longMaxLength === undefined) !== (shortMaxLength === undefined)) {
      throw new Error('Both maxLength parameters must be provided together');
    }
  }

  const longLength = longTrackingHistory.length;
  const shortLength = shortTrackingHistory.length;

  // Return false for all judgments if histories are insufficient (matches Python behavior)
  if (longLength === 0 || shortLength === 0) {
    return {
      stateInProgress: false,
      stateStartJudgment: false,
      stateEndJudgment: false
    };
  }

  // Check if histories are complete when maxLength is provided
  if (longMaxLength !== undefined && shortMaxLength !== undefined) {
    if (longLength < longMaxLength || shortLength < shortMaxLength) {
      return {
        stateInProgress: false,
        stateStartJudgment: false,
        stateEndJudgment: false
      };
    }
  }

  // Count true values in each history
  const longTrueCount = longTrackingHistory.filter(val => val === true).length;
  const shortTrueCount = shortTrackingHistory.filter(val => val === true).length;

  // State judgments based on Python implementation
  // N = longLength, M = shortLength
  const stateInProgress = longTrueCount >= Math.floor(longLength / 2) && shortTrueCount >= (shortLength - 1);
  const stateStartJudgment = longTrueCount === Math.floor(longLength / 2) && shortTrueCount >= (shortLength - 1);
  const stateEndJudgment = longTrueCount === Math.floor(longLength / 2) && shortTrueCount <= 1;

  return {
    stateInProgress,
    stateStartJudgment,
    stateEndJudgment
  };
}

/**
 * Creates a fixed-size queue (deque) that maintains a maximum length
 * @param {number} maxLength - Maximum number of items the queue can hold
 * @returns {Object} Deque-like object with push and toArray methods
 */
function createFixedQueue(maxLength) {
  if (!Number.isInteger(maxLength) || maxLength <= 0) {
    throw new Error('maxLength must be a positive integer');
  }

  const items = [];

  return {
    push(item) {
      items.push(item);
      if (items.length > maxLength) {
        items.shift();
      }
    },
    toArray() {
      return [...items];
    },
    get length() {
      return items.length;
    },
    get maxLength() {
      return maxLength;
    }
  };
}

// Export for different module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { stateVerdict, createFixedQueue };
} else if (typeof define === 'function' && define.amd) {
  define([], function() {
    return { stateVerdict, createFixedQueue };
  });
} else if (typeof window !== 'undefined') {
  window.bbalgjs = { stateVerdict, createFixedQueue };
}