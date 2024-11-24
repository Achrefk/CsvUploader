module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleNameMapper: {
      '^@application/(.*)$': '<rootDir>/src/application/$1',
      '^@domain/(.*)$': '<rootDir>/src/domain/$1',
      '^@infrastructure/(.*)$': '<rootDir>/src/infrastructure/$1',
    },
  };
  