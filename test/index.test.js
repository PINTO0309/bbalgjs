const { stateVerdict, createFixedQueue } = require('../src/index');

describe('stateVerdict', () => {
  describe('Input validation', () => {
    test('should throw error if inputs are not arrays', () => {
      expect(() => stateVerdict('not array', [])).toThrow('Both tracking histories must be arrays');
      expect(() => stateVerdict([], 'not array')).toThrow('Both tracking histories must be arrays');
    });

    test('should throw error if arrays are empty', () => {
      expect(() => stateVerdict([], [true])).toThrow('Tracking histories cannot be empty');
      expect(() => stateVerdict([true], [])).toThrow('Tracking histories cannot be empty');
    });

    test('should throw error if insufficient history', () => {
      expect(() => stateVerdict([true], [true])).toThrow('Insufficient history entries for processing');
    });
  });

  describe('State detection', () => {
    test('should detect state in progress', () => {
      const longHistory = [true, true, true, false]; // 75% true
      const shortHistory = [true, true]; // 100% true
      const result = stateVerdict(longHistory, shortHistory);
      
      expect(result.stateInProgress).toBe(true);
      expect(result.stateStartJudgment).toBe(false);
      expect(result.stateEndJudgment).toBe(false);
    });

    test('should detect state start', () => {
      const longHistory = [false, false, true, true]; // 50% true
      const shortHistory = [true, true]; // 100% true
      const result = stateVerdict(longHistory, shortHistory);
      
      expect(result.stateInProgress).toBe(false);
      expect(result.stateStartJudgment).toBe(true);
      expect(result.stateEndJudgment).toBe(false);
    });

    test('should detect state end', () => {
      const longHistory = [false, false, true, true]; // 50% true
      const shortHistory = [false, false]; // 0% true
      const result = stateVerdict(longHistory, shortHistory);
      
      expect(result.stateInProgress).toBe(false);
      expect(result.stateStartJudgment).toBe(false);
      expect(result.stateEndJudgment).toBe(true);
    });

    test('should handle edge case with exact thresholds', () => {
      // Test 90% threshold for short history
      const longHistory = [true, true, true, false]; // 75% true
      const shortHistory = Array(10).fill(true);
      shortHistory[0] = false; // 90% true
      const result = stateVerdict(longHistory, shortHistory);
      
      expect(result.stateInProgress).toBe(true);
    });

    test('should return all false for inactive state', () => {
      const longHistory = [false, false, false, false]; // 0% true
      const shortHistory = [false, false]; // 0% true
      const result = stateVerdict(longHistory, shortHistory);
      
      expect(result.stateInProgress).toBe(false);
      expect(result.stateStartJudgment).toBe(false);
      expect(result.stateEndJudgment).toBe(false);
    });
  });
});

describe('createFixedQueue', () => {
  test('should create a queue with specified max length', () => {
    const queue = createFixedQueue(3);
    expect(queue.maxLength).toBe(3);
    expect(queue.length).toBe(0);
  });

  test('should maintain fixed size when pushing items', () => {
    const queue = createFixedQueue(3);
    
    queue.push(true);
    queue.push(false);
    queue.push(true);
    expect(queue.length).toBe(3);
    expect(queue.toArray()).toEqual([true, false, true]);
    
    // Push fourth item - should remove first
    queue.push(false);
    expect(queue.length).toBe(3);
    expect(queue.toArray()).toEqual([false, true, false]);
  });

  test('should throw error for invalid maxLength', () => {
    expect(() => createFixedQueue(0)).toThrow('maxLength must be a positive integer');
    expect(() => createFixedQueue(-1)).toThrow('maxLength must be a positive integer');
    expect(() => createFixedQueue(1.5)).toThrow('maxLength must be a positive integer');
    expect(() => createFixedQueue('3')).toThrow('maxLength must be a positive integer');
  });

  test('toArray should return a copy', () => {
    const queue = createFixedQueue(3);
    queue.push(1);
    queue.push(2);
    
    const array1 = queue.toArray();
    const array2 = queue.toArray();
    
    expect(array1).toEqual(array2);
    expect(array1).not.toBe(array2); // Different references
  });
});

describe('Integration tests', () => {
  test('should work with createFixedQueue for tracking history', () => {
    const longQueue = createFixedQueue(6);
    const shortQueue = createFixedQueue(3);
    
    // Simulate tracking over time
    const trackingData = [false, false, false, true, true, true, true, true];
    
    trackingData.forEach(tracked => {
      longQueue.push(tracked);
      shortQueue.push(tracked);
      
      if (longQueue.length >= 2 && shortQueue.length >= 2) {
        const result = stateVerdict(longQueue.toArray(), shortQueue.toArray());
        
        // At the end, should detect state in progress
        if (longQueue.length === 6 && shortQueue.length === 3) {
          expect(result.stateInProgress).toBe(true);
        }
      }
    });
  });
});