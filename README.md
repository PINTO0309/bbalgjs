# bbalgjs

JavaScript implementation of the Baba algorithm for robustly determining status changes of objects to be tracked.

This is a JavaScript port of the original Python [bbalg](https://github.com/PINTO0309/bbalg) library.

## Features

- Robust state detection algorithm
- Works in Node.js, browsers, and Electron (both main and renderer processes)
- TypeScript support with full type definitions
- Zero dependencies
- Lightweight and performant

## Installation

```bash
npm install bbalgjs
```

or

```bash
yarn add bbalgjs
```

## Usage

### Basic Usage in Node.js

```javascript
const { stateVerdict, createFixedQueue } = require('bbalgjs');

// Create fixed-size queues for tracking history
const longHistory = createFixedQueue(10);  // Stores last 10 tracking results
const shortHistory = createFixedQueue(3);  // Stores last 3 tracking results

// Simulate tracking over time
const trackingResults = [false, false, true, true, true, true, true, true, true, true];

trackingResults.forEach(detected => {
  longHistory.push(detected);
  shortHistory.push(detected);
  
  if (longHistory.length >= 2 && shortHistory.length >= 2) {
    const result = stateVerdict(longHistory.toArray(), shortHistory.toArray());
    
    console.log({
      stateInProgress: result.stateInProgress,
      stateStartJudgment: result.stateStartJudgment,
      stateEndJudgment: result.stateEndJudgment
    });
  }
});
```

### ES Module Usage

```javascript
import { stateVerdict, createFixedQueue } from 'bbalgjs';

// Same usage as CommonJS
```

### Browser Usage

```html
<script src="https://unpkg.com/bbalgjs/dist/bbalgjs.umd.min.js"></script>
<script>
  const { stateVerdict, createFixedQueue } = bbalgjs;
  
  // Use the functions
  const result = stateVerdict([true, true, false, true], [true, true]);
  console.log(result);
</script>
```

### TypeScript Usage

```typescript
import { stateVerdict, createFixedQueue, StateVerdictResult, FixedQueue } from 'bbalgjs';

// TypeScript will infer types automatically
const longQueue: FixedQueue<boolean> = createFixedQueue(10);
const shortQueue: FixedQueue<boolean> = createFixedQueue(3);

// Process tracking data
const result: StateVerdictResult = stateVerdict(
  longQueue.toArray(),
  shortQueue.toArray()
);
```

### Electron Usage

The package works seamlessly in both Electron main and renderer processes:

**Main Process:**
```javascript
// main.js
const { stateVerdict } = require('bbalgjs');

// Use in IPC handlers
ipcMain.handle('analyze-tracking', (event, longHistory, shortHistory) => {
  return stateVerdict(longHistory, shortHistory);
});
```

**Renderer Process:**
```javascript
// renderer.js
const { stateVerdict, createFixedQueue } = require('bbalgjs');
// or with ES modules
import { stateVerdict, createFixedQueue } from 'bbalgjs';

// Use directly in renderer
const result = stateVerdict(longHistory, shortHistory);
```

## API Reference

### `stateVerdict(longTrackingHistory, shortTrackingHistory)`

Determines the state of an object based on tracking history.

**Parameters:**
- `longTrackingHistory` (Array<boolean>): N historical tracking results (older to newer)
- `shortTrackingHistory` (Array<boolean>): M recent tracking results (older to newer)

**Returns:** Object with three properties:
- `stateInProgress` (boolean): Whether the state is currently in progress
  - True when >50% of long history is true AND ≥90% of short history is true
- `stateStartJudgment` (boolean): Whether the state has just started
  - True when exactly 50% of long history is true AND ≥90% of short history is true
- `stateEndJudgment` (boolean): Whether the state has just ended
  - True when exactly 50% of long history is true AND ≤10% of short history is true

**Throws:** Error if:
- Inputs are not arrays
- Arrays are empty
- Arrays have fewer than 2 elements

### `createFixedQueue(maxLength)`

Creates a fixed-size queue (deque) that maintains a maximum length.

**Parameters:**
- `maxLength` (number): Maximum number of items the queue can hold

**Returns:** Object with methods:
- `push(item)`: Add an item to the queue (removes oldest if at capacity)
- `toArray()`: Get all items as an array
- `length`: Current number of items (getter)
- `maxLength`: Maximum capacity (getter)

**Throws:** Error if maxLength is not a positive integer

## Practical Examples

### Object Detection Tracking

```javascript
const { stateVerdict, createFixedQueue } = require('bbalgjs');

class ObjectTracker {
  constructor() {
    this.longHistory = createFixedQueue(20);
    this.shortHistory = createFixedQueue(5);
  }
  
  processFrame(objectDetected) {
    this.longHistory.push(objectDetected);
    this.shortHistory.push(objectDetected);
    
    if (this.longHistory.length < 2 || this.shortHistory.length < 2) {
      return null; // Not enough data yet
    }
    
    const verdict = stateVerdict(
      this.longHistory.toArray(),
      this.shortHistory.toArray()
    );
    
    if (verdict.stateStartJudgment) {
      console.log('Object tracking started!');
    } else if (verdict.stateEndJudgment) {
      console.log('Object tracking ended!');
    } else if (verdict.stateInProgress) {
      console.log('Object is being tracked...');
    }
    
    return verdict;
  }
}

// Usage
const tracker = new ObjectTracker();

// Simulate object detection over 30 frames
for (let i = 0; i < 30; i++) {
  // Object appears after frame 10 and disappears after frame 20
  const detected = i >= 10 && i < 20;
  const result = tracker.processFrame(detected);
  
  if (result) {
    console.log(`Frame ${i}:`, result);
  }
}
```

### Motion Detection

```javascript
const { stateVerdict, createFixedQueue } = require('bbalgjs');

class MotionDetector {
  constructor(sensitivity = { long: 15, short: 4 }) {
    this.longHistory = createFixedQueue(sensitivity.long);
    this.shortHistory = createFixedQueue(sensitivity.short);
  }
  
  analyzeMotion(motionValue, threshold = 0.1) {
    // Convert motion value to boolean based on threshold
    const motionDetected = motionValue > threshold;
    
    this.longHistory.push(motionDetected);
    this.shortHistory.push(motionDetected);
    
    if (this.longHistory.length < 2 || this.shortHistory.length < 2) {
      return { motion: 'initializing' };
    }
    
    const verdict = stateVerdict(
      this.longHistory.toArray(),
      this.shortHistory.toArray()
    );
    
    if (verdict.stateStartJudgment) {
      return { motion: 'started', event: true };
    } else if (verdict.stateEndJudgment) {
      return { motion: 'ended', event: true };
    } else if (verdict.stateInProgress) {
      return { motion: 'ongoing', event: false };
    } else {
      return { motion: 'idle', event: false };
    }
  }
}
```

### State Machine Integration

```javascript
const { stateVerdict, createFixedQueue } = require('bbalgjs');

class StateMachine {
  constructor() {
    this.states = new Map();
  }
  
  addState(name, historyConfig = { long: 10, short: 3 }) {
    this.states.set(name, {
      longHistory: createFixedQueue(historyConfig.long),
      shortHistory: createFixedQueue(historyConfig.short),
      active: false
    });
  }
  
  updateState(name, condition) {
    const state = this.states.get(name);
    if (!state) throw new Error(`State ${name} not found`);
    
    state.longHistory.push(condition);
    state.shortHistory.push(condition);
    
    if (state.longHistory.length >= 2 && state.shortHistory.length >= 2) {
      const verdict = stateVerdict(
        state.longHistory.toArray(),
        state.shortHistory.toArray()
      );
      
      const wasActive = state.active;
      state.active = verdict.stateInProgress;
      
      return {
        state: name,
        active: state.active,
        changed: wasActive !== state.active,
        verdict
      };
    }
    
    return null;
  }
}

// Usage
const machine = new StateMachine();
machine.addState('user_active', { long: 30, short: 5 });
machine.addState('high_cpu', { long: 20, short: 4 });

// Monitor states
setInterval(() => {
  const userActive = machine.updateState('user_active', isUserActive());
  const highCpu = machine.updateState('high_cpu', getCpuUsage() > 80);
  
  if (userActive?.changed) {
    console.log('User activity state changed:', userActive.active);
  }
  
  if (highCpu?.verdict.stateStartJudgment) {
    console.log('High CPU usage detected!');
  }
}, 1000);
```

## Algorithm Details

The Baba algorithm uses two sliding windows of different sizes to make robust determinations about state changes:

1. **Long History**: Provides context and stability
2. **Short History**: Provides responsiveness to recent changes

The algorithm calculates three judgments:
- **State in Progress**: Indicates a stable, ongoing state
- **State Start**: Detects the transition into a new state
- **State End**: Detects the transition out of a state

This dual-window approach helps filter out noise and provides reliable state detection even in the presence of occasional false positives or negatives.

## Build from Source

```bash
# Clone the repository
git clone https://github.com/yourusername/bbalgjs.git
cd bbalgjs

# Install dependencies
npm install

# Run tests
npm test

# Build the package
npm run build
```

## License

MIT License - see LICENSE file for details.

## Credits

Original Python implementation by [PINTO0309](https://github.com/PINTO0309/bbalg).