import typescript from '@rollup/plugin-typescript';
import {nodeResolve} from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import rust from '@wasm-tool/rollup-plugin-rust';

export default (commandLineArgs) => ({
  input: commandLineArgs.testBuild ? 'tests/main.test.ts' : 'src/main.ts',
  output: {
    dir: '.',
    sourcemap: 'inline',
    format: 'cjs',
    exports: 'default'
  },
  external: ['obsidian'],
  plugins: [
    typescript(),
    nodeResolve({browser: true}),
    commonjs(),
    rust({ inlineWasm: true }),
  ]
});
