import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import { terser } from 'rollup-plugin-terser';

const config = [
  // UMD build for browsers
  {
    input: 'src/index.js',
    output: {
      file: 'dist/bbalgjs.umd.js',
      format: 'umd',
      name: 'bbalgjs',
      exports: 'named'
    },
    plugins: [
      resolve(),
      commonjs(),
      babel({
        babelHelpers: 'bundled',
        presets: ['@babel/preset-env']
      })
    ]
  },
  // UMD minified build
  {
    input: 'src/index.js',
    output: {
      file: 'dist/bbalgjs.umd.min.js',
      format: 'umd',
      name: 'bbalgjs',
      exports: 'named'
    },
    plugins: [
      resolve(),
      commonjs(),
      babel({
        babelHelpers: 'bundled',
        presets: ['@babel/preset-env']
      }),
      terser()
    ]
  },
  // CommonJS build for Node.js
  {
    input: 'src/index.js',
    output: {
      file: 'dist/index.js',
      format: 'cjs',
      exports: 'named'
    },
    plugins: [
      resolve(),
      commonjs()
    ]
  },
  // ES Module build
  {
    input: 'src/index.js',
    output: {
      file: 'dist/index.esm.js',
      format: 'es'
    },
    plugins: [
      resolve(),
      commonjs()
    ]
  }
];

export default config;