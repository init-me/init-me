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
const fs_1 = __importDefault(require("fs"));
const yyl_os_1 = __importDefault(require("yyl-os"));
const chalk_1 = __importDefault(require("chalk"));
const inquirer_1 = __importDefault(require("inquirer"));
const yyl_fs_1 = __importDefault(require("yyl-fs"));
const lang_1 = require("../lang");
const yyl_replacer_1 = __importDefault(require("yyl-replacer"));
const pkg = require('../../package.json');
const blankLogger = {
    log() {
        return [];
    },
    setLogLevel() { },
    setProgress() { }
};
function formatOption(op) {
    var _a, _b;
    const env = {
        silent: !!(op === null || op === void 0 ? void 0 : op.env.silent),
        logLevel: ((_a = op === null || op === void 0 ? void 0 : op.env) === null || _a === void 0 ? void 0 : _a.logLevel) === undefined ? 1 : op.env.logLevel,
        name: ((_b = op === null || op === void 0 ? void 0 : op.env) === null || _b === void 0 ? void 0 : _b.name) || ''
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
            const questions = [];
            const pjName = `${targetPath.split(/[\\/]/).pop()}`;
            let initData = {
                name: ''
            };
            if (!env.name) {
                questions.push({
                    type: 'input',
                    name: 'name',
                    default: pjName,
                    message: lang_1.Lang.QUESTION.NAME
                });
            }
            else {
                initData.name = env.name;
            }
            if (questions.length) {
                const anwser = yield inquirer_1.default.prompt(questions);
                initData = Object.assign(Object.assign({}, initData), anwser);
            }
            // 拷贝文件
            logger.log('info', [lang_1.Lang.INIT.COPY_START]);
            const oriPath = path_1.default.join(__dirname, '../../seed');
            const logs = yield yyl_fs_1.default.copyFiles(oriPath, [targetPath]);
            logger.log('success', [
                `${lang_1.Lang.INIT.COPY_FINISHED}(add:${logs.add.length}, update: ${logs.update.length})`
            ]);
            // rename 处理
            logger.log('info', [lang_1.Lang.INIT.RENAME_START]);
            const renameMap = {};
            renameMap[path_1.default.join(targetPath, 'gitignore')] = path_1.default.join(targetPath, '.gitignore');
            renameMap[path_1.default.join(targetPath, 'npmignore')] = path_1.default.join(targetPath, '.npmignore');
            Object.keys(renameMap).forEach((ori) => {
                const target = renameMap[ori];
                fs_1.default.writeFileSync(target, fs_1.default.readFileSync(ori));
                fs_1.default.unlinkSync(ori);
                logger.log('info', [
                    `${path_1.default.relative(targetPath, ori)} => ${path_1.default.relative(targetPath, target)}`
                ]);
            });
            logger.log('success', [lang_1.Lang.INIT.RENAME_FINISHED]);
            logger.log('info', [lang_1.Lang.INIT.REPLACE_START]);
            // pkg 处理
            const pkgPath = path_1.default.join(targetPath, 'package.json');
            const targetPkg = require(pkgPath);
            console.log('===', targetPkg);
            targetPkg.name = initData.name;
            targetPkg.dependencies['init-me-seed-types'] = pkg.dependencies['init-me-seed-types'];
            fs_1.default.writeFileSync(pkgPath, JSON.stringify(targetPkg, null, 2));
            logger.log('info', [lang_1.Lang.INIT.PKG_EDITED]);
            // data 替换
            const rPaths = [path_1.default.join(targetPath, 'README.md'), pkgPath];
            rPaths.forEach((iPath) => {
                const cnt = fs_1.default.readFileSync(iPath).toString();
                fs_1.default.writeFileSync(iPath, yyl_replacer_1.default.dataRender(cnt, initData));
                logger.log('update', [iPath]);
            });
            logger.log('success', [lang_1.Lang.INIT.REPLACE_FINISHED]);
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