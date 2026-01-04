module.exports = {
    preset: 'jest-preset-angular',
    setupFilesAfterEnv: [
        '<rootDir>/setup-jest.ts',
    ],
    testMatch: [
        '**/specs/**/*.spec.ts',
    ],
    collectCoverageFrom: [
        'src/**/*.ts',
        '!src/**/*.spec.ts',
        '!src/main.ts',
        '!src/test.ts',
    ],
    coverageDirectory: 'coverage',
    coverageReporters: [
        'text',
        'html',
        'lcov',
    ],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
    },
    transform: {
        '^.+\\.(ts|js|html)$': [
            'jest-preset-angular',
            {
                tsconfig: '<rootDir>/tsconfig.spec.json',
                stringifyContentPathRegex: '\\.(html|svg)$',
            },
        ],
    },
    transformIgnorePatterns: [
        'node_modules/(?!.*\\.mjs$)',
    ],
    testEnvironment: 'jsdom',
    moduleFileExtensions: [
        'ts',
        'html',
        'js',
        'json',
        'mjs',
    ],
};

