module.exports = {
  root: true,
  env: { browser: true, es2022: true, node: true },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', 'coverage', 'playwright-report', 'test-results', 'android', '.eslintrc.cjs'],
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  settings: { react: { version: '18.2' } },
  globals: {
    __APP_VERSION__: 'readonly',
  },
  plugins: ['unused-imports'],
  rules: {
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'unused-imports/no-unused-imports': 'warn',
    'no-empty': ['error', { allowEmptyCatch: true }],
    'no-constant-condition': ['error', { checkLoops: false }],
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'react/display-name': 'off',
    'react/no-unescaped-entities': 'warn',
    'react/prop-types': 'off',
    'react-hooks/static-components': 'off',
    'react-hooks/immutability': 'off',
    'react-hooks/purity': 'off',
    'react-hooks/refs': 'off',
    'react-hooks/set-state-in-effect': 'off',
    'react-hooks/preserve-manual-memoization': 'off',
  },
  overrides: [
    {
      files: [
        '**/*.{test,spec}.{js,jsx,ts,tsx}',
        'src/tests/**/*.{js,jsx,ts,tsx}',
        'tests/**/*.{js,jsx,ts,tsx}',
      ],
      globals: {
        afterEach: 'readonly',
        beforeEach: 'readonly',
        describe: 'readonly',
        expect: 'readonly',
        it: 'readonly',
        test: 'readonly',
        vi: 'readonly',
      },
    },
    {
      files: ['scripts/**/*.{js,mjs,cjs,ts}'],
      rules: {
        'no-console': 'off',
      },
    },
    {
      files: ['**/*.{ts,tsx}'],
      parser: '@typescript-eslint/parser',
      plugins: ['@typescript-eslint'],
      extends: ['plugin:@typescript-eslint/recommended'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
      },
    },
  ],
}
