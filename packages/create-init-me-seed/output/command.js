"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = __importDefault(require("commander"));
const chalk_1 = __importDefault(require("chalk"));
const path_1 = __importDefault(require("path"));
const yyl_util_1 = __importDefault(require("yyl-util"));
const fs_1 = __importDefault(require("fs"));
const yyl_cmd_logger_1 = require("yyl-cmd-logger");
const lang_1 = require("./lang");
const index_1 = require("./task/index");
const pkg = require('../package.json');
const logger = new yyl_cmd_logger_1.YylCmdLogger({
    lite: true,
    type: {
        ver: {
            name: 'CIMS',
            shortName: 'C',
            color: chalk_1.default.bgBlue.white,
            shortColor: chalk_1.default.blue
        }
    }
});
const isPath = function (ctx) {
    if (typeof ctx === 'string') {
        const rPath = path_1.default.resolve(process.cwd(), ctx);
        if (fs_1.default.existsSync(rPath)) {
            return true;
        }
        else {
            return false;
        }
    }
    else {
        return false;
    }
};
let isBlock = false;
const env = yyl_util_1.default.envParse(process.argv);
const fn = {
    printHeader(op) {
        if (env.silent) {
            return;
        }
        logger.log('ver', [`create-init-me-seed ${chalk_1.default.yellow.bold(pkg.version)}`]);
        let keyIndex = -1;
        process.argv.forEach((str, index) => {
            if (str.match(/bin[/\\]cteate-init-me-seed$/)) {
                keyIndex = index;
            }
        });
        if (keyIndex !== -1) {
            const cmds = process.argv.slice(keyIndex + 1);
            logger.log('cmd', [`create-init-me-seed ${cmds.join(' ')}`]);
        }
    }
};
commander_1.default
    .option('-q, --silent', lang_1.Lang.DESCRIPTION.SILENT)
    .option('--logLevel <level>', lang_1.Lang.DESCRIPTION.LOG_LEVEL);
commander_1.default.option('-p, --path', lang_1.Lang.DESCRIPTION.PATH, () => {
    index_1.task.path({ env });
    isBlock = true;
});
commander_1.default.option('-v, --version', lang_1.Lang.DESCRIPTION.VERSION, () => {
    index_1.task.version({ env, logger });
    isBlock = true;
});
commander_1.default.on('--help', () => {
    console.log(['', 'Examples:', '  $ create-init-me-seed path/to/dir', ''].join('\r\n'));
    isBlock = true;
});
commander_1.default.parse(process.argv);
if (!isBlock && (!commander_1.default.args.length || typeof commander_1.default.args[commander_1.default.args.length - 1] !== 'object')) {
    let targetPath = process.cwd();
    if (commander_1.default.args[0]) {
        targetPath = commander_1.default.args[0];
    }
    if (isPath(targetPath)) {
        fn.printHeader({ env });
        index_1.task.init(targetPath, { env, logger }).catch((er) => {
            logger.log('error', [er]);
        });
    }
    else {
        commander_1.default.outputHelp();
    }
}
