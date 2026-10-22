import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({ dir: "./" });

const config: Config = {
  testEnvironment: "jsdom",
  setupFiles: process.env.LIVE ? ["<rootDir>/test/live/env.ts"] : [],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: { "^@/(.*)$": "<rootDir>/src/$1" },
  testMatch: ["**/?(*.)+(spec|test).[jt]s?(x)"],
  testPathIgnorePatterns: [
    "<rootDir>/node_modules/", "<rootDir>/.next/",
    // Live tests need the local backend (scripts/live-backend/run.sh): npm run test:live
    ...(process.env.LIVE ? [] : ["<rootDir>/test/live/"]),
  ],
};

export default createJestConfig(config);
