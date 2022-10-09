"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.task = void 0;
const path_1 = __importDefault(require("path"));
const yyl_os_1 = __importDefault(require("yyl-os"));
const chalk_1 = __importDefault(require("chalk"));
const pkg = require('../../package.json');
const blankLogger = {
    log() {
        return [];
    },
    setLogLevel() { },
    setProgress() { }
};
function formatOption(op) {
    var _a;
    const env = {
        silent: !!(op === null || op === void 0 ? void 0 : op.env.silent),
        logLevel: ((_a = op === null || op === void 0 ? void 0 : op.env) === null || _a === void 0 ? void 0 : _a.logLevel) === undefined ? 1 : op.env.logLevel
    };
    const logger = (op === null || op === void 0 ? void 0 : op.logger) || blankLogger;
    if (logger) {
        if (env.silent) {
            logger.setLogLevel(0);
        }
        else if (env.logLevel) {
            logger.setLogLevel(env.logLevel);
        }
        else {
            logger.setLogLevel(1);
        }
    }
    return {
        env,
        logger
    };
}
exports.task = {
    init(targetPath, op) {
        return __awaiter(this, void 0, void 0, function* () {
            const { env, logger } = formatOption(op);
            console.log(targetPath);
            // TODO:
        });
    },
    version(op) {
        const { env, logger } = formatOption(op);
        if (!env.silent) {
            logger && logger.log('info', [`create-init-me-seed ${chalk_1.default.yellow.bold(pkg.version)}`]);
        }
        return Promise.resolve(pkg.version);
    },
    path(op) {
        const { env } = op;
        const r = {
            app: path_1.default.join(__dirname, '../')
        };
        if (!env.silent) {
            console.log(['', ' App path:', ` ${chalk_1.default.yellow.bold(r.app)}`, ''].join('\r\n'));
            yyl_os_1.default.openPath(r.app);
        }
        return Promise.resolve(r);
    }
};
