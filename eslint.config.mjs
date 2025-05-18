import { eslintrc } from '@eslint/eslintrc';

const { FlatCompat } = eslintrc;
const compat = new FlatCompat();

export default [
  {
    files: ['**/*.{js,jsx,mjs,cjs,ts,tsx}'],
    ignores: ['node_modules/**', '.next/**', 'out/**', 'public/**'],
  },
  ...compat.config({
    extends: ['next/core-web-vitals'],
  }),
];
