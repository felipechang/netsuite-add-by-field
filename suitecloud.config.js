const SuiteCloudJestUnitTestRunner = require("@oracle/suitecloud-unit-testing/services/SuiteCloudJestUnitTestRunner");

module.exports = {
    defaultProjectFolder: "source/assets",
    commands: {
        "project:deploy": {
            beforeExecuting: async args => {
                await SuiteCloudJestUnitTestRunner.run({
                    // Jest configuration options.
                });
                return args;
            },
        },
    },
};