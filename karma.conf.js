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
            jasmine: {
                // Jasmine configuration
                random: false, // Run tests in order, not randomly
                seed: null,
                stopSpecOnExpectationFailure: false
            },
            clearContext: false // leave Jasmine Spec Runner output visible in browser
        },
        jasmineHtmlReporter: {
            suppressAll: true // removes the duplicated traces
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
        logLevel: config.LOG_INFO,
        autoWatch: true,
        reporters: ['progress', 'coverage'], // Console output, no HTML reporter
        browsers: ['ChromeHeadless'], // Headless mode - no browser window
        restartOnFileChange: true,
        singleRun: false,
        concurrency: Infinity,

        // Browser configuration
        customLaunchers: {
            ChromeHeadlessCI: {
                base: 'ChromeHeadless',
                flags: ['--no-sandbox', '--disable-gpu']
            },
            ChromeHeadlessNoSandbox: {
                base: 'ChromeHeadless',
                flags: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
            }
        },

        // Capture timeout increased for slower systems
        captureTimeout: 210000,
        browserDisconnectTolerance: 3,
        browserDisconnectTimeout: 210000,
        browserNoActivityTimeout: 210000
    });
};

