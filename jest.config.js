/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: {
        jsx: 'react-jsx',
        esModuleInterop: true,
        module: 'commonjs',
        moduleResolution: 'node',
        strict: true,
        skipLibCheck: true,
        paths: {
          '@/*': ['./src/*']
        }
      }
    }]
  },
  testMatch: ['**/__tests__/**/*.(ts|tsx)', '**/*.(test|spec).(ts|tsx)'],
  testPathIgnorePatterns: ['/node_modules/', '/e2e/'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/app/layout.tsx',
  ],
};

module.exports = config;
