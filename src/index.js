/**
 * Baba algorithm for robustly determining status changes of objects to be tracked.
 * JavaScript port of the original Python implementation.
 */

/**
 * Determines the state of an object based on tracking history
 * @param {Array<boolean>} longTrackingHistory - N historical tracking results (older to newer)
 * @param {Array<boolean>} shortTrackingHistory - M recent tracking results (older to newer)
 * @returns {{stateInProgress: boolean, stateStartJudgment: boolean, stateEndJudgment: boolean}}
 * @throws {Error} If inputs are invalid or history is insufficient
 */
function stateVerdict(longTrackingHistory, shortTrackingHistory) {
  // Validate inputs
  if (!Array.isArray(longTrackingHistory) || !Array.isArray(shortTrackingHistory)) {
    throw new Error('Both tracking histories must be arrays');
  }

  const longLength = longTrackingHistory.length;
  const shortLength = shortTrackingHistory.length;

  if (longLength === 0 || shortLength === 0) {
    throw new Error('Tracking histories cannot be empty');
  }

  // Check if we have sufficient history
  if (longLength < 2 || shortLength < 2) {
    throw new Error('Insufficient history entries for processing');
  }

  // Count true values in each history
  const longTrueCount = longTrackingHistory.filter(val => val === true).length;
  const shortTrueCount = shortTrackingHistory.filter(val => val === true).length;

  // Calculate ratios
  const longRatio = longTrueCount / longLength;
  const shortRatio = shortTrueCount / shortLength;

  // State judgments
  const stateInProgress = longRatio > 0.5 && shortRatio >= 0.9;
  const stateStartJudgment = longRatio === 0.5 && shortRatio >= 0.9;
  const stateEndJudgment = longRatio === 0.5 && shortRatio <= 0.1;

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