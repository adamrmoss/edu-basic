// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

module.exports = function (config)
{
    config.set({
        basePath: '',
        frameworks: ['jasmine', '@angular-devkit/build-angular'],
        plugins: [
            require('karma-jasmine'),
            require('karma-chrome-launcher'),
            require('karma-coverage'),
            require('@angular-devkit/build-angular/plugins/karma')
        ],
        client: {
            clearContext: true,
            captureConsole: false,
            jasmine: {
                random: false,
                seed: null,
                stopSpecOnExpectationFailure: false,
                timeoutInterval: 10000
            }
        },
        jasmineHtmlReporter: {
            suppressAll: true,
            suppressFailed: false
        },
        coverageReporter: {
            dir: require('path').join(__dirname, './coverage/edu-basic'),
            subdir: '.',
            reporters: [
                { type: 'html' },
                { type: 'text-summary' }, // Shows coverage summary in console
                { type: 'lcovonly' }
            ]
        },
        port: 9876,
        colors: true,
        logLevel: config.LOG_ERROR,
        autoWatch: false,
        reporters: ['progress'], // Console output only (coverage disabled for now)
        browsers: ['ChromeHeadless'], // Headless mode - no browser window
        restartOnFileChange: false,
        singleRun: true, // Run once and exit
        concurrency: Infinity,
        failOnEmptyTestSuite: false,
        failOnFailingTestSuite: false,
        retryLimit: 0,

        // Browser configuration
        customLaunchers: {
            ChromeHeadlessCI: {
                base: 'ChromeHeadless',
                flags: ['--no-sandbox', '--disable-gpu']
            },
            ChromeHeadlessNoSandbox: {
                base: 'ChromeHeadless',
                flags: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-gpu',
                    '--disable-dev-shm-usage'
                ]
            }
        },

        // Timeouts
        captureTimeout: 60000,
        browserDisconnectTolerance: 1,
        browserDisconnectTimeout: 5000,
        browserNoActivityTimeout: 30000,
        
        // Process control
        processKillTimeout: 2000
    });
};

