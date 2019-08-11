import { terser } from 'rollup-plugin-terser';
import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';
import resolve from 'rollup-plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';
import autoExternal from 'rollup-plugin-auto-external';
import packageJSON from './package.json';

const formats = [
  {
    format: 'cjs',
    dist: 'main',
  },
  {
    format: 'esm',
    dist: 'module',
  },
];

export default formats.map(({ dist, format }) => ({
  input: ['./src/index.ts', './src/dataset.ts'],
  output: {
    name: packageJSON.name,
    format,
    dir: `./dist/${dist}`,
    entryFileNames: `[name].${dist === 'module' ? 'mjs' : 'js'}`,
    exports: 'named',
  },
  plugins: [
    resolve({
      preferBuiltins: true,
    }),
    commonjs(),
    json(),
    typescript({
      useTsconfigDeclarationDir: true,
      tsconfigOverride: {
        compilerOptions: {
          declarationDir: './dist',
        },
      },
    }),
    terser(),
    autoExternal(),
  ],
}));
