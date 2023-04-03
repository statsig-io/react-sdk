module.exports = {
  roots: ['./'],
  testMatch: ['**/__tests__/**/*.tsx', '**/?(*.)+test.tsx'],
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/dist/'],
  preset: 'ts-jest',
};
