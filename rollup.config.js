import typescript from '@rollup/plugin-typescript';

/**
 * @type {import('rollup').RollupOptions}
 */
export default {
  input: 'src/index.ts',
  output: {
    dir: 'lib',
    format: 'cjs',
    sourcemap: true
  },
  plugins: [typescript()]
}