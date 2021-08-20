module.exports = {
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    "^~/(.*)$": "<rootDir>/$1",
    "^.+\\.(css|styl|less|sass|scss|png|jpg|ttf|woff|woff2)$": "jest-transform-stub",
  },

  moduleFileExtensions: ["js", "json"],

  transform: {
    "^.+\\.js$": "babel-jest",
  },

  collectCoverage: true,

  collectCoverageFrom: [
    "<rootDir>/src/**",
  ],

  //testPathIgnorePatterns: ["server/api/test.js"],

  transformIgnorePatterns: ["/node_modules/(?!@babel)"],

  //preset: "@vue/cli-plugin-unit-jest/presets/no-babel",
};
