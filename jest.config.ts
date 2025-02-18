import type { JestConfigWithTsJest } from 'ts-jest';

const config: JestConfigWithTsJest = {
    setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
    transform: {
        '^.+\\.tsx?$': 'ts-jest',
    },
    testEnvironment: 'node',
    extensionsToTreatAsEsm: ['.ts'],
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1',
    },
    testPathIgnorePatterns: ['/node_modules/', '/dist/'],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};

export default config;
