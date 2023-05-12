const { defaults: tsjPreset } = require('ts-jest/presets');

module.exports = {
  transform: {
    ...tsjPreset.transform,
  },
  testEnvironment: 'node',
  testPathIgnorePatterns: ['<rootDir>/node_modules/'],
  roots: ['<rootDir>/src', '<rootDir>/test'],
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.test.json',
      // Disable type checking for tests
      isolatedModules: true,
    },
  },
};
