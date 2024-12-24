module.exports = {
  transform: {
    '^.+\\.(t|j)sx?$': '@swc/jest',
  },
  moduleNameMapper: {
    '\\.(css|less)$': '<rootDir>/tests/__mocks__/styleMock.ts',
  },
  testEnvironment: 'jsdom',
  testRegex: 'tests/.*test\\.tsx?$',
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.tsx', 'src/**/*.ts'],
  transformIgnorePatterns: [
    '<rootDir>/node_modules/(?!(@here/maps-api-for-javascript/bin/mapsjs.bundle.harp.js))',
  ],
  setupFilesAfterEnv: [
    './tests/jest.setup.ts',
  ],
}
