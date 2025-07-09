module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.d.ts'
  ],
  testMatch: [
    '**/test/**/*.test.js'
  ]
};