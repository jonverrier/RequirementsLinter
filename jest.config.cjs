/**
 * Jest configuration for RequirementLinter tests.
 */
// Copyright (c) 2025, 2026 Jon Verrier

/** @type {import('jest').Config} */
const tsJestTransform = {
   '^.+\\.ts$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.jest.json' }]
};

/** @type {import('jest').Config} */
module.exports = {
   testTimeout: 60_000,
   projects: [
      {
         displayName: 'unit',
         preset: 'ts-jest',
         testEnvironment: 'node',
         roots: ['<rootDir>/test'],
         testMatch: [
            '**/evaluate-requirement.test.ts',
            '**/evaluate-userstory.test.ts',
            '**/evaluate-utils.test.ts'
         ],
         transform: tsJestTransform
      },
      {
         displayName: 'ci',
         preset: 'ts-jest',
         testEnvironment: 'node',
         roots: ['<rootDir>/test'],
         testMatch: [
            '**/evaluate-requirement.test.ts',
            '**/evaluate-userstory.test.ts',
            '**/evaluate-utils.test.ts'
         ],
         transform: tsJestTransform
      },
      {
         displayName: 'eval',
         preset: 'ts-jest',
         testEnvironment: 'node',
         roots: ['<rootDir>/test'],
         testMatch: ['**/*.eval.test.ts', '**/userstory-eval.test.ts'],
         transform: tsJestTransform,
         testTimeout: 300_000,
         maxWorkers: 1
      },
      {
         displayName: 'mini',
         preset: 'ts-jest',
         testEnvironment: 'node',
         roots: ['<rootDir>/test'],
         testMatch: ['**/userstory-eval.test.ts', '**/evaluate-userstory.test.ts'],
         transform: tsJestTransform,
         testTimeout: 300_000,
         maxWorkers: 1
      }
   ]
};
