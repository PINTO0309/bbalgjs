# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

**Development:**
- `npm install` - Install dependencies
- `npm test` - Run Jest test suite
- `npm run build` - Build package using Rollup (generates UMD, CommonJS, and ES module formats)
- `npm run lint` - Run ESLint on src/**/*.js

**Testing:**
- Run a single test file: `npx jest test/index.test.js`
- Run tests with coverage: `npx jest --coverage`
- Run tests in watch mode: `npx jest --watch`

## Architecture

This is a JavaScript port of the Python bbalg library implementing the Baba algorithm for robust state change detection.

**Core Algorithm (`src/index.js`):**
- `stateVerdict(longTrackingHistory, shortTrackingHistory)` - Main algorithm that analyzes two tracking histories
  - Returns three boolean flags: `stateInProgress`, `stateStartJudgment`, `stateEndJudgment`
  - Uses ratio thresholds: long history > 50% for in-progress, exactly 50% for start/end
  - Short history thresholds: ≥ 90% for start/in-progress, ≤ 10% for end

- `createFixedQueue(maxLength)` - Creates a fixed-size queue that auto-removes oldest items when full

**Build Output:**
The Rollup configuration generates four output formats:
- `dist/bbalgjs.umd.js` - Browser-compatible UMD
- `dist/bbalgjs.umd.min.js` - Minified browser build
- `dist/index.js` - CommonJS for Node.js
- `dist/index.esm.js` - ES modules

**Module Compatibility:**
The source code includes runtime detection for CommonJS, AMD, and browser globals, making it work in Node.js, browsers, and Electron environments.

## Key Implementation Details

**State Detection Logic:**
- State in Progress: `longRatio > 0.5 && shortRatio >= 0.9`
- State Start: `longRatio === 0.5 && shortRatio >= 0.9`
- State End: `longRatio === 0.5 && shortRatio <= 0.1`

**Testing Strategy:**
Tests are organized into categories:
1. Input validation (error handling)
2. State detection (algorithm correctness)
3. Fixed queue functionality
4. Integration tests (components working together)

**TypeScript Support:**
- Type definitions in `src/index.d.ts`
- Exports `StateVerdictResult` and `FixedQueue<T>` interfaces
- Module declaration for proper TypeScript imports