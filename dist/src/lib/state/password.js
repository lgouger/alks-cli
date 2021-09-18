"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cachePassword = exports.setPassword = exports.getPassword = void 0;
var tslib_1 = require("tslib");
var program_1 = tslib_1.__importDefault(require("../program"));
var log_1 = require("../log");
var underscore_1 = require("underscore");
var getPasswordFromKeystore_1 = require("../getPasswordFromKeystore");
var getEnvironmentVariableSecretWarning_1 = require("../getEnvironmentVariableSecretWarning");
var storePassword_1 = require("../storePassword");
var cli_color_1 = require("cli-color");
var credentials_1 = require("./credentials");
var child_process_1 = require("child_process");
var PASSWORD_ENV_VAR_NAME = 'ALKS_PASSWORD';
var cachedPassword;
function getPassword() {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var passwordOption, passwordFromEnv, credentials, output, password, passwordFromKeystore;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    passwordOption = program_1.default.opts().password;
                    if (passwordOption) {
                        log_1.log('using password from CLI arg');
                        console.error('Warning: Passing secrets via cli options is unsafe. Please instead run `alks developer configure`, `alks-developer-login`, or set the ALKS_PASSWORD environment variable');
                        return [2 /*return*/, passwordOption];
                    }
                    passwordFromEnv = process.env[PASSWORD_ENV_VAR_NAME];
                    if (!underscore_1.isEmpty(passwordFromEnv)) {
                        console.error(getEnvironmentVariableSecretWarning_1.getEnvironmentVariableSecretWarning(PASSWORD_ENV_VAR_NAME));
                        log_1.log('using password from environment variable');
                        return [2 /*return*/, passwordFromEnv];
                    }
                    return [4 /*yield*/, credentials_1.getCredentials()];
                case 1:
                    credentials = _a.sent();
                    if (credentials.credential_process) {
                        output = child_process_1.spawnSync(credentials.credential_process, ['password']);
                        if (output.error) {
                            log_1.log('error encountered when executing credential process: ' + output.error);
                            throw output.error;
                        }
                        if (String(output.stderr).trim().length > 0) {
                            log_1.log('credential_process stderr: ' + output.stderr);
                        }
                        password = String(output.stdout).split('\n')[0].trim();
                        if (password.length > 0) {
                            return [2 /*return*/, password];
                        }
                    }
                    return [4 /*yield*/, getPasswordFromKeystore_1.getPasswordFromKeystore()];
                case 2:
                    passwordFromKeystore = _a.sent();
                    if (passwordFromKeystore) {
                        log_1.log('using stored password');
                        return [2 /*return*/, passwordFromKeystore];
                    }
                    if (cachedPassword) {
                        log_1.log('using cached password');
                        return [2 /*return*/, cachedPassword];
                    }
                    return [2 /*return*/, undefined];
            }
        });
    });
}
exports.getPassword = getPassword;
function setPassword(password) {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, storePassword_1.storePassword(password)];
                case 1:
                    _a.sent();
                    console.error(cli_color_1.white('Password saved!'));
                    return [2 /*return*/];
            }
        });
    });
}
exports.setPassword = setPassword;
// Allows temporarily setting a password so that actions like configuring developer can work without having to save your password
function cachePassword(password) {
    cachedPassword = password;
}
exports.cachePassword = cachePassword;
//# sourceMappingURL=password.js.map