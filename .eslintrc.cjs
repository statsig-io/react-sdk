module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  overrides: [
    // Tests
    {
      files: ['**/*.test.tsx', '**/*.test.ts'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
      },
    },

    // Main
    {
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
      },
      files: ['**/*.ts'],
      excludedFiles: '*/__tests__/*',
      rules: {
        '@typescript-eslint/no-floating-promises': [
          'error',
          { ignoreVoid: false },
        ],
      },
    },
  ],
};
