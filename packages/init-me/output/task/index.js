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
/* eslint-disable no-useless-catch */
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const yyl_os_1 = __importDefault(require("yyl-os"));
const chalk_1 = __importDefault(require("chalk"));
const inquirer_1 = __importDefault(require("inquirer"));
const yyl_fs_1 = __importDefault(require("yyl-fs"));
const index_1 = require("../lang/index");
const localConfig_1 = require("../lib/localConfig");
const localStorage_1 = require("../lib/localStorage");
const search_1 = require("../lib/search");
const formatter_1 = require("../lib/formatter");
const pkg = require('../package.json');
const CONFIG_PLUGIN_PATH = path_1.default.join(localStorage_1.CONFIG_PATH, 'plugins');
const localConfig = new localConfig_1.LocalConfig();
// + fn
const preRun = (op) => {
    const { env, logger } = op;
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
};
const blankLogger = {
    log() {
        return [];
    },
    setLogLevel() { },
    setProgress() { }
};
// - fn
exports.task = {
    clear(op) {
        return __awaiter(this, void 0, void 0, function* () {
            let { env, logger } = op;
            if (!logger) {
                logger = blankLogger;
            }
            preRun({ env, logger });
            logger.log('info', [index_1.Lang.CLEAR.START]);
            let removes = [];
            try {
                removes = yield yyl_fs_1.default.removeFiles(localStorage_1.CONFIG_PATH, true);
            }
            catch (er) {
                throw er;
            }
            removes.forEach((iPath) => {
                logger.log('del', [iPath]);
            });
            logger.log('success', [index_1.Lang.CLEAR.FINISHED]);
        });
    },
    version(op) {
        let { env, logger } = op;
        if (!logger) {
            logger = blankLogger;
        }
        if (!env.silent) {
            logger && logger.log('info', [`init-me ${chalk_1.default.yellow.bold(pkg.version)}`]);
        }
        return Promise.resolve(pkg.version);
    },
    path(op) {
        const { env } = op;
        const r = {
            app: path_1.default.join(__dirname, '../'),
            config: localStorage_1.CONFIG_PATH
        };
        if (!env.silent) {
            console.log([
                '',
                ' App path:',
                ` ${chalk_1.default.yellow.bold(r.app)}`,
                '',
                ' Config path:',
                ` ${chalk_1.default.yellow.bold(r.config)}`,
                ''
            ].join('\r\n'));
            yyl_os_1.default.openPath(r.app);
            yyl_os_1.default.openPath(r.config);
        }
        return Promise.resolve(r);
    },
    init(targetPath, op) {
        return __awaiter(this, void 0, void 0, function* () {
            let { env, inset, logger } = op;
            if (!logger) {
                logger = blankLogger;
            }
            preRun({ env, logger });
            if (!inset) {
                logger.log('info', [index_1.Lang.INIT.START]);
                logger.setProgress('start', 'info', [index_1.Lang.INIT.LIST_START]);
                logger.log('info', [index_1.Lang.INIT.LIST_START]);
            }
            let seeds = [];
            try {
                seeds = yield (0, search_1.listSeed)();
            }
            catch (er) {
                throw er;
            }
            if (!inset) {
                logger.log('success', [index_1.Lang.INIT.LIST_FINISHED]);
                logger && logger.setProgress('finished', 'success', [index_1.Lang.INIT.LIST_FINISHED]);
            }
            const config = (yield localConfig.get()) || {};
            const installedSeeds = config.seeds || [];
            let seedItems = installedSeeds.map((seed) => {
                const seedItem = config.seedMap[seed];
                const { version, dev } = seedItem;
                const name = seed;
                const shortName = (0, formatter_1.seedFull2Short)(name);
                return {
                    name,
                    shortName,
                    installed: true,
                    dev,
                    choice: `${chalk_1.default.yellow.bold(shortName)} ${chalk_1.default.gray('(')}${dev ? 'local' : version}${chalk_1.default.gray(')')}`
                };
            });
            seedItems = seedItems.concat(seeds
                .filter((name) => installedSeeds.indexOf(name) === -1)
                .map((name) => {
                const shortName = (0, formatter_1.seedFull2Short)(name);
                return {
                    name,
                    shortName,
                    installed: false,
                    dev: false,
                    choice: chalk_1.default.gray(shortName)
                };
            }));
            seedItems.sort((a, b) => {
                if (a.installed && !b.installed) {
                    return -1;
                }
                else if (!a.installed && b.installed) {
                    return 1;
                }
                else if (a.installed && b.installed) {
                    if (a.dev && !b.dev) {
                        return -1;
                    }
                    else if (!a.dev && b.dev) {
                        return 1;
                    }
                    else {
                        return a.name.localeCompare(b.name);
                    }
                }
                else {
                    return a.name.localeCompare(b.name);
                }
            });
            let iSeed = '';
            if (env.seed) {
                const matchItem = seedItems.filter((item) => item.shortName === env.seed || item.name === env.seed)[0];
                if (matchItem) {
                    iSeed = matchItem.name;
                }
                else {
                    logger.log('error', [index_1.Lang.INIT.SEED_NOT_EXISTS]);
                    return;
                }
            }
            else {
                const choices = seedItems.map((item) => item.choice);
                const r = yield inquirer_1.default.prompt([
                    {
                        type: 'list',
                        name: 'seed',
                        message: `${index_1.Lang.INIT.QUEATION_SELECT_TYPE}:`,
                        default: choices[0],
                        choices: choices
                    }
                ]);
                iSeed = seedItems.filter((item) => item.choice === r.seed)[0].name;
            }
            const seedInfo = seedItems.filter((item) => item.name === iSeed)[0];
            // 判断选中的 seed 是否已经安装
            if (!seedInfo.installed) {
                logger.setProgress('start');
                logger && logger.log('info', [`${index_1.Lang.INIT.SEED_INSTALLING}: ${chalk_1.default.green(iSeed)}`]);
                const isYYPkg = seedInfo.name.match(search_1.REG_IS_YY_PKG);
                yield exports.task
                    .install([`${seedInfo.name} ${isYYPkg ? search_1.REGISTRY_OPTION : ''}`], {
                    env,
                    silent: true,
                    logger
                })
                    .catch((er) => {
                    logger.setProgress('finished', 'error', [er]);
                    throw er;
                });
                logger && logger.log('success', [`${index_1.Lang.INIT.SEED_INSTALLED}: ${chalk_1.default.green(iSeed)}`]);
                logger.setProgress('finished');
            }
            const seedConfig = yield localConfig.get();
            const iSeedConfig = seedConfig.seedMap[iSeed];
            logger.setProgress('start');
            logger && logger.log('info', [`${index_1.Lang.INIT.SEED_LOADING}: ${chalk_1.default.green(iSeed)}`]);
            if (!iSeedConfig) {
                logger && logger.log('error', [`${index_1.Lang.INIT.SEED_MAP_NOT_EXISTS}: ${iSeed}`]);
                logger.setProgress('finished');
                return;
            }
            logger &&
                logger.log('info', [`${index_1.Lang.INIT.SEED_MAIN_PRINT}: ${chalk_1.default.yellow(iSeedConfig.main)}`]);
            if (!fs_1.default.existsSync(iSeedConfig.main)) {
                logger && logger.log('error', [`${index_1.Lang.INIT.SEED_MAP_MAIN_NOT_EXISTS}: ${iSeed}`]);
                logger.setProgress('finished');
                return;
            }
            // + 非 dev seed 自动安装 最新版
            if (iSeedConfig.dev || env.force) {
                logger.log('success', [index_1.Lang.INIT.SKIP_CHECK_VERSION]);
                logger.setProgress('finished');
            }
            else if (seedInfo.name.match(search_1.REG_IS_YY_PKG) && !(yield (0, search_1.inYY)())) {
                // 是 yy pkg 但又不在 yy 域下 跳过
                logger && logger.log('success', [index_1.Lang.INIT.SKIP_CHECK_VERSION_CAUSE_NOT_IN_YY]);
                logger.setProgress('finished');
            }
            else {
                logger.log('info', [index_1.Lang.INIT.CHECK_VERSION_START]);
                let latestVersion;
                try {
                    latestVersion = yield (0, search_1.getPkgLatestVersion)(iSeedConfig.name);
                }
                catch (er) {
                    logger.log('error', [er]);
                    logger.setProgress('finished');
                    throw er;
                }
                if (iSeedConfig.version !== latestVersion) {
                    logger.log('info', [index_1.Lang.INIT.UPDATE_PKG_VERSION_START]);
                    yield exports.task
                        .install([`${iSeedConfig.name}@${latestVersion}`], {
                        env,
                        silent: true,
                        logger
                    })
                        .catch((er) => {
                        logger.log('error', [er]);
                        logger.setProgress('finished');
                        throw er;
                    });
                    logger &&
                        logger.log('success', [
                            `${index_1.Lang.INIT.UPDATE_PKG_VERSION_FINISHED}: ${chalk_1.default.green(latestVersion)}`
                        ]);
                    logger.setProgress('finished');
                }
                else {
                    logger &&
                        logger.log('success', [`${index_1.Lang.INIT.PKG_IS_LATEST}: ${chalk_1.default.green(latestVersion)}`]);
                    logger.setProgress('finished');
                }
            }
            // - 非 dev seed 自动安装 最新版
            const iSeedPack = require(iSeedConfig.main);
            logger.log('success', [index_1.Lang.INIT.SEED_LOAD_FINISHED]);
            // 启动前 hooks
            if (iSeedPack.hooks && iSeedPack.hooks.beforeStart) {
                logger.log('info', [index_1.Lang.INIT.HOOKS_BEFORE_START_RUN]);
                yield iSeedPack.hooks.beforeStart({ env, targetPath }).catch((er) => {
                    logger.log('error', [er]);
                });
                logger.log('info', [index_1.Lang.INIT.HOOKS_BEFORE_START_FINISHED]);
            }
            // 准备需要复制的文件
            if (!iSeedPack.path) {
                logger &&
                    logger.log('error', [`${index_1.Lang.INIT.SEED_COPY_PATH_UNDEFINED}: ${chalk_1.default.green(iSeed)}`]);
                return;
            }
            let fileMap = {};
            const seedSourcePath = path_1.default.resolve(path_1.default.dirname(iSeedConfig.main), iSeedPack.path);
            logger &&
                logger.log('info', [`${index_1.Lang.INIT.SEED_COPY_PATH_PRINT}: ${chalk_1.default.yellow(seedSourcePath)}`]);
            if (!fs_1.default.existsSync(seedSourcePath)) {
                logger &&
                    logger.log('error', [
                        `${index_1.Lang.INIT.SEED_COPY_PATH_NOT_EXISTS}: ${chalk_1.default.yellow(seedSourcePath)}`
                    ]);
                return;
            }
            let files = [];
            try {
                files = yield yyl_fs_1.default.readFilePaths(seedSourcePath);
            }
            catch (er) {
                throw er;
            }
            files.forEach((iPath) => {
                fileMap[iPath] = [path_1.default.resolve(targetPath, path_1.default.relative(seedSourcePath, iPath))];
            });
            // 复制前 hooks
            if (iSeedPack.hooks && iSeedPack.hooks.beforeCopy) {
                logger.log('info', [index_1.Lang.INIT.HOOKS_BEFORE_COPY_RUN]);
                let rMap;
                try {
                    rMap = yield iSeedPack.hooks.beforeCopy({
                        fileMap,
                        env,
                        targetPath,
                        logger
                    });
                }
                catch (er) {
                    throw er;
                }
                if (typeof rMap === 'object') {
                    // eslint-disable-next-line require-atomic-updates
                    fileMap = rMap;
                }
                logger.log('info', [index_1.Lang.INIT.HOOKS_BEFORE_COPY_FINISHED]);
            }
            logger.log('info', [`${index_1.Lang.INIT.SEED_COPY_MAP_PRINT}:`]);
            Object.keys(fileMap).forEach((iPath) => {
                logger &&
                    logger.log('info', [`${chalk_1.default.yellow(iPath)} => ${chalk_1.default.green(fileMap[iPath].join(','))}`]);
            });
            // 复制
            let iLog;
            try {
                iLog = yield yyl_fs_1.default.copyFiles(fileMap);
            }
            catch (er) {
                throw er;
            }
            iLog.add.forEach((iPath) => {
                logger.log('add', [iPath]);
            });
            iLog.update.forEach((iPath) => {
                logger.log('update', [iPath]);
            });
            // 复制后 hooks
            if (iSeedPack.hooks && iSeedPack.hooks.afterCopy) {
                logger.log('info', [index_1.Lang.INIT.HOOKS_AFTER_COPY_RUN]);
                yield iSeedPack.hooks.afterCopy({ fileMap, env, targetPath, logger }).catch((er) => {
                    throw er;
                });
                logger.log('info', [index_1.Lang.INIT.HOOKS_AFTER_COPY_FINISHED]);
            }
            if (!inset) {
                logger.log('success', [index_1.Lang.INIT.FINISHED]);
            }
        });
    },
    install(names, op) {
        return __awaiter(this, void 0, void 0, function* () {
            let { env, silent, logger } = op;
            if (!logger) {
                logger = blankLogger;
            }
            if (!silent) {
                preRun({ env, logger });
                logger.log('info', [index_1.Lang.INSTALL.START]);
            }
            if (!fs_1.default.existsSync(CONFIG_PLUGIN_PATH)) {
                yield yyl_fs_1.default.mkdirSync(CONFIG_PLUGIN_PATH).catch((er) => {
                    throw er;
                });
                yield exports.task.reset({ env, silent, logger }).catch((er) => {
                    throw er;
                });
            }
            yield yyl_os_1.default
                .runSpawn(`npm install ${names.join(' ')} --save ${env.silent ? '--silent' : ''}`, CONFIG_PLUGIN_PATH, (msg) => {
                logger.log('info', [msg.toString()]);
            })
                .catch((er) => {
                throw er;
            });
            yield localConfig.updateSeedInfo().catch((er) => {
                throw er;
            });
            if (!silent) {
                logger.log('success', [index_1.Lang.INSTALL.FINISHED]);
            }
        });
    },
    uninstall(names, op) {
        return __awaiter(this, void 0, void 0, function* () {
            let { env, logger } = op;
            if (!logger) {
                logger = blankLogger;
            }
            preRun({ env, logger });
            logger.log('info', [index_1.Lang.UNINSTALL.START]);
            yield yyl_os_1.default
                .runSpawn(`npm uninstall ${names.join(' ')} --save ${env.silent ? '--silent' : ''}`, CONFIG_PLUGIN_PATH, (msg) => {
                logger.log('info', [msg.toString()]);
            })
                .catch((er) => {
                throw er;
            });
            yield localConfig.updateSeedInfo().catch((er) => {
                throw er;
            });
            logger.log('success', [index_1.Lang.UNINSTALL.FINISHED]);
        });
    },
    list(op) {
        return __awaiter(this, void 0, void 0, function* () {
            let { env, logger } = op;
            if (!logger) {
                logger = blankLogger;
            }
            preRun({ env, logger });
            let iPkg;
            try {
                iPkg = yield localConfig.get();
            }
            catch (er) {
                throw er;
            }
            let keys = [];
            if (typeof iPkg.seedMap === 'object') {
                keys = Object.keys(iPkg.seedMap);
            }
            if (keys.length) {
                const logs = [];
                const pkgs = [];
                const locals = [];
                keys.forEach((key) => {
                    const info = iPkg.seedMap[key];
                    info.name = key;
                    if (info.dev) {
                        locals.push(info);
                    }
                    else {
                        pkgs.push(info);
                    }
                });
                if (pkgs.length) {
                    logs.push('');
                    logs.push(`${chalk_1.default.cyan(index_1.Lang.LIST.PKG_LIST)}:`);
                    pkgs.forEach((info) => {
                        logs.push(`  ${chalk_1.default.green(info.name)} : ${chalk_1.default.yellow(info.version)}`);
                    });
                }
                if (locals.length) {
                    logs.push('');
                    logs.push(`${chalk_1.default.cyan(index_1.Lang.LIST.LOCAL_LIST)}:`);
                    locals.forEach((info) => {
                        logs.push(`  ${chalk_1.default.green(info.name)}(${info.version}) : ${chalk_1.default.yellow(info.main)}`);
                    });
                }
                logs.push('');
                if (!env.silent) {
                    console.log(logs.join('\r\n'));
                }
                return iPkg.seedMap;
            }
            else {
                if (!env.silent) {
                    console.log(`  ${index_1.Lang.LIST.BLANK}`);
                }
                return {};
            }
        });
    },
    reset(op) {
        return __awaiter(this, void 0, void 0, function* () {
            let { env, logger } = op;
            if (!logger) {
                logger = blankLogger;
            }
            preRun({ env, logger });
            logger.setProgress('start');
            logger.log('info', [index_1.Lang.RESET.START]);
            yield localConfig.reset().catch((er) => {
                logger.log('error', [er]);
                logger.setProgress('finished');
                throw er;
            });
            logger.log('success', [index_1.Lang.RESET.FINISHED]);
            logger.setProgress('finished');
        });
    },
    link(op) {
        return __awaiter(this, void 0, void 0, function* () {
            let { targetPath, env, logger } = op;
            if (!logger) {
                logger = blankLogger;
            }
            preRun({ env, logger });
            logger.log('info', [index_1.Lang.LINK.START]);
            const pkgPath = path_1.default.join(targetPath, 'package.json');
            if (!fs_1.default.existsSync(pkgPath)) {
                logger.log('error', [index_1.Lang.LINK.PKG_NOT_FOUND]);
                return;
            }
            const pkg = require(pkgPath);
            if (!pkg.name) {
                logger.log('error', [index_1.Lang.LINK.PKG_NAME_IS_BLANK]);
                return;
            }
            if (!pkg.version) {
                logger.log('error', [index_1.Lang.LINK.PKG_VERSION_IS_BLANK]);
                return;
            }
            if (!pkg.main) {
                logger.log('error', [index_1.Lang.LINK.PKG_ENTRY_IS_BLANK]);
                return;
            }
            const entryPath = path_1.default.resolve(targetPath, pkg.main);
            if (!fs_1.default.existsSync(entryPath)) {
                logger && logger.log('error', [`${index_1.Lang.LINK.PKG_ENTRY_NOT_EXISTS}: ${entryPath}`]);
                return;
            }
            yield localConfig
                .addlocalSeed(pkg.name, {
                main: entryPath,
                name: pkg.name,
                version: pkg.version,
                dev: true
            })
                .catch((er) => {
                throw er;
            });
            logger.log('success', [`${index_1.Lang.LINK.FINISHED}: ${pkg.name}`]);
        });
    },
    unlink(op) {
        return __awaiter(this, void 0, void 0, function* () {
            let { targetPath, env, logger } = op;
            if (!logger) {
                logger = blankLogger;
            }
            preRun({ env, logger });
            logger.log('info', [index_1.Lang.UNLINK.START]);
            const pkgPath = path_1.default.join(targetPath, 'package.json');
            if (!fs_1.default.existsSync(pkgPath)) {
                logger.log('error', [index_1.Lang.UNLINK.PKG_NOT_FOUND]);
                return;
            }
            const pkg = require(pkgPath);
            if (!pkg.name) {
                logger.log('error', [index_1.Lang.UNLINK.PKG_NAME_IS_BLANK]);
                return;
            }
            yield localConfig.removeLocalSeed(pkg.name).catch((er) => {
                throw er;
            });
            logger.log('success', [`${index_1.Lang.UNLINK.FINISHED}: ${pkg.name}`]);
        });
    },
    recommend(op) {
        return __awaiter(this, void 0, void 0, function* () {
            let { env, logger } = op;
            if (!logger) {
                logger = blankLogger;
            }
            if (env.silent) {
                logger.setLogLevel(0);
            }
            const keyword = 'init-me-seed-';
            const IN_YY = yield (0, search_1.inYY)();
            logger.log('info', [index_1.Lang.RECOMMEND.SEARCH_NPM_START]);
            let r1;
            try {
                r1 = yield (0, search_1.searchNpm)(keyword);
            }
            catch (er) {
                throw er;
            }
            let r2 = [];
            if (IN_YY) {
                try {
                    r2 = yield (0, search_1.searchYyNpm)(keyword);
                }
                catch (er) {
                    throw er;
                }
            }
            logger.log('success', [index_1.Lang.RECOMMEND.SEARCH_NPM_FINISHED]);
            const { seedMap } = yield localConfig.get();
            const r = r1.concat(r2);
            r.forEach((item) => {
                if (seedMap[item.name]) {
                    item.installed = '1';
                }
            });
            if (!env.silent) {
                const logArr = [''];
                if (r.length) {
                    logArr.push(` ${chalk_1.default.yellow(index_1.Lang.RECOMMEND.TITLE)}:`);
                    r.forEach((item) => {
                        const name = (() => {
                            let color = chalk_1.default.green;
                            let vColor = chalk_1.default.yellow;
                            if (item.installed) {
                                color = chalk_1.default.gray;
                                vColor = chalk_1.default.gray;
                            }
                            return item.version
                                ? `${color(item.name)}${vColor(`@${item.version}`)}`
                                : color(item.name);
                        })();
                        logArr.push(` ${chalk_1.default.gray('*')} ${name}`);
                    });
                }
                else {
                    logArr.push(` ${index_1.Lang.RECOMMEND.RESULT_BLANK}`);
                }
                logArr.push('');
                console.log(logArr.join('\r\n'));
            }
            return r;
        });
    },
    fn: {}
};
