const { stateVerdict, createFixedQueue } = require('../src/index');

describe('stateVerdict', () => {
  describe('Input validation', () => {
    test('should throw error if inputs are not arrays', () => {
      expect(() => stateVerdict('not array', [], 1, 1)).toThrow('Both tracking histories must be arrays');
      expect(() => stateVerdict([], 'not array', 1, 1)).toThrow('Both tracking histories must be arrays');
    });

    test('should throw error if maxLength parameters are invalid', () => {
      expect(() => stateVerdict([], [], 'not number', 1)).toThrow('longMaxLength must be a positive number');
      expect(() => stateVerdict([], [], 1, 'not number')).toThrow('shortMaxLength must be a positive number');
      expect(() => stateVerdict([], [], 0, 1)).toThrow('longMaxLength must be a positive number');
      expect(() => stateVerdict([], [], 1, -1)).toThrow('shortMaxLength must be a positive number');
      expect(() => stateVerdict([], [], 1, undefined)).toThrow('Both maxLength parameters must be provided together');
      expect(() => stateVerdict([], [], undefined, 1)).toThrow('Both maxLength parameters must be provided together');
    });

    test('should return all false if arrays are empty', () => {
      let result = stateVerdict([], [true], 1, 1);
      expect(result.stateInProgress).toBe(false);
      expect(result.stateStartJudgment).toBe(false);
      expect(result.stateEndJudgment).toBe(false);
      
      result = stateVerdict([true], [], 1, 1);
      expect(result.stateInProgress).toBe(false);
      expect(result.stateStartJudgment).toBe(false);
      expect(result.stateEndJudgment).toBe(false);
    });

    test('should handle single element arrays', () => {
      const result = stateVerdict([true], [true], 1, 1);
      // 1 >= 1/2 (0.5->0) AND 1 >= 1-1 (0) => true
      expect(result.stateInProgress).toBe(true);
      // 1 != 0 => false
      expect(result.stateStartJudgment).toBe(false);
      expect(result.stateEndJudgment).toBe(false);
    });

    test('should return all false if histories are incomplete when maxLength is provided', () => {
      // Long history incomplete
      let result = stateVerdict([true, true, true], [true, true], 5, 2);
      expect(result.stateInProgress).toBe(false);
      expect(result.stateStartJudgment).toBe(false);
      expect(result.stateEndJudgment).toBe(false);
      
      // Short history incomplete
      result = stateVerdict([true, true, true, true], [true], 4, 3);
      expect(result.stateInProgress).toBe(false);
      expect(result.stateStartJudgment).toBe(false);
      expect(result.stateEndJudgment).toBe(false);
      
      // Both complete - should process normally
      result = stateVerdict([true, true, true, false], [true, true], 4, 2);
      expect(result.stateInProgress).toBe(true);
    });
  });

  describe('State detection', () => {
    test('should work without maxLength parameters', () => {
      const longHistory = [true, true, true, false]; // 3 true >= 4/2
      const shortHistory = [true, true]; // 2 true >= 2-1
      const result = stateVerdict(longHistory, shortHistory);
      
      expect(result.stateInProgress).toBe(true);
      expect(result.stateStartJudgment).toBe(false);
      expect(result.stateEndJudgment).toBe(false);
    });

    test('should detect state in progress', () => {
      const longHistory = [true, true, true, false]; // 3 true >= 4/2
      const shortHistory = [true, true]; // 2 true >= 2-1
      const result = stateVerdict(longHistory, shortHistory, 4, 2);
      
      expect(result.stateInProgress).toBe(true);
      expect(result.stateStartJudgment).toBe(false);
      expect(result.stateEndJudgment).toBe(false);
    });

    test('should detect state start', () => {
      const longHistory = [false, false, true, true]; // 2 true = 4/2
      const shortHistory = [true, true]; // 2 true >= 2-1
      const result = stateVerdict(longHistory, shortHistory, 4, 2);
      
      // stateInProgress is true because 2 >= 2 AND 2 >= 1
      expect(result.stateInProgress).toBe(true);
      expect(result.stateStartJudgment).toBe(true);
      expect(result.stateEndJudgment).toBe(false);
    });

    test('should detect state end', () => {
      const longHistory = [false, false, true, true]; // 2 true = 4/2
      const shortHistory = [false, false, true]; // 1 true <= 1, but < 3-1
      const result = stateVerdict(longHistory, shortHistory, 4, 2);
      
      // stateInProgress is false because 1 < 2 (shortLength - 1)
      expect(result.stateInProgress).toBe(false);
      expect(result.stateStartJudgment).toBe(false);
      expect(result.stateEndJudgment).toBe(true);
    });

    test('should handle edge case with M-1 threshold', () => {
      // Test M-1 threshold for short history
      const longHistory = [true, true, true, false]; // 3 true >= 4/2
      const shortHistory = Array(5).fill(true);
      shortHistory[0] = false; // 4 true >= 5-1
      const result = stateVerdict(longHistory, shortHistory, 4, 5);
      
      expect(result.stateInProgress).toBe(true);
    });

    test('should return all false for inactive state', () => {
      const longHistory = [false, false, false, false]; // 0 true
      const shortHistory = [false, false]; // 0 true
      const result = stateVerdict(longHistory, shortHistory, 4, 2);
      
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
    
    trackingData.forEach((tracked, index) => {
      longQueue.push(tracked);
      shortQueue.push(tracked);
      
      if (longQueue.length >= 2 && shortQueue.length >= 2) {
        const result = stateVerdict(longQueue.toArray(), shortQueue.toArray(), 6, 3);
        
        // At the end, should detect state in progress
        if (index === trackingData.length - 1) {
          // Final state: longQueue has [false, true, true, true, true, true] (last 6 items)
          // shortQueue has [true, true, true] (last 3 items)
          // longQueue: 5 true >= 6/2 (3), shortQueue: 3 true >= 3-1 (2)
          expect(longQueue.toArray()).toEqual([false, true, true, true, true, true]);
          expect(shortQueue.toArray()).toEqual([true, true, true]);
          expect(result.stateInProgress).toBe(true);
        }
      }
    });
  });
});