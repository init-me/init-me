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
const index_1 = require("./lang/index");
const index_2 = require("./task/index");
const pkg = require('../package.json');
const logger = new yyl_cmd_logger_1.YylCmdLogger({
    lite: true,
    type: {
        ver: {
            name: 'INIT',
            shortName: 'i',
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
        logger.log('ver', [`init-me ${chalk_1.default.yellow.bold(pkg.version)}`]);
        let keyIndex = -1;
        process.argv.forEach((str, index) => {
            if (str.match(/bin[/\\]init$/)) {
                keyIndex = index;
            }
        });
        if (keyIndex !== -1) {
            const cmds = process.argv.slice(keyIndex + 1);
            logger.log('cmd', [`init ${cmds.join(' ')}`]);
        }
    }
};
commander_1.default.option('-p, --path', index_1.Lang.DESCRIPTION.PATH, () => {
    index_2.task.path({ env });
    isBlock = true;
});
commander_1.default.option('-v, --version', index_1.Lang.DESCRIPTION.VERSION, () => {
    index_2.task.version({ env, logger });
    isBlock = true;
});
commander_1.default
    .option('-q, --silent', index_1.Lang.DESCRIPTION.SILENT)
    .option('--seed <name>', index_1.Lang.DESCRIPTION.SEED)
    .option('--force', index_1.Lang.DESCRIPTION.FORCE)
    .option('--logLevel <level>', index_1.Lang.DESCRIPTION.LOG_LEVEL);
commander_1.default
    .command('clear')
    .description(index_1.Lang.DESCRIPTION.CLEAR)
    .action(() => {
    fn.printHeader({ env });
    index_2.task.clear({ env, logger }).catch((er) => {
        logger.log('error', [er]);
    });
    isBlock = true;
});
commander_1.default
    .command('install <pkgName>')
    .alias('i')
    .description(index_1.Lang.DESCRIPTION.INSTALL)
    .action((pkgName) => {
    fn.printHeader({ env });
    index_2.task.install(pkgName.split(/\s+/), { env, logger }).catch((er) => {
        logger.log('error', [er]);
    });
    isBlock = true;
});
commander_1.default
    .command('uninstall <pkgName>')
    .description(index_1.Lang.DESCRIPTION.UNINSTALL)
    .action((pkgName) => {
    fn.printHeader({ env });
    index_2.task.uninstall(pkgName.split(/\s+/), { env, logger }).catch((er) => {
        logger.log('error', [er]);
    });
    isBlock = true;
});
commander_1.default
    .command('reset')
    .description(index_1.Lang.DESCRIPTION.RESET)
    .action(() => {
    fn.printHeader({ env });
    index_2.task.reset({ env, logger }).catch((er) => {
        logger.log('error', [er]);
    });
    isBlock = true;
});
commander_1.default
    .command('recommend')
    .alias('r')
    .description(index_1.Lang.DESCRIPTION.RECOMMEND)
    .action(() => {
    index_2.task.recommend({ env, logger }).catch((er) => {
        logger.log('error', [er]);
    });
    isBlock = true;
});
commander_1.default
    .command('list')
    .description(index_1.Lang.DESCRIPTION.LIST)
    .action(() => {
    index_2.task.list({ env, logger }).catch((er) => {
        logger.log('error', [er]);
    });
    isBlock = true;
});
commander_1.default
    .command('link')
    .description(index_1.Lang.DESCRIPTION.LINK)
    .action(() => {
    index_2.task
        .link({
        targetPath: process.cwd(),
        env,
        logger
    })
        .catch((er) => {
        logger.log('error', [er]);
    });
    isBlock = true;
});
commander_1.default
    .command('unlink')
    .description(index_1.Lang.DESCRIPTION.UNLINK)
    .action(() => {
    index_2.task
        .unlink({
        targetPath: process.cwd(),
        env,
        logger
    })
        .catch((er) => {
        logger.log('error', [er]);
    });
    isBlock = true;
});
commander_1.default.on('--help', () => {
    console.log(['', 'Examples:', '  $ init --logLevel 2', '  $ init path/to/dir', ''].join('\r\n'));
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
        index_2.task.init(targetPath, { env, logger }).catch((er) => {
            logger.log('error', [er]);
        });
    }
    else {
        commander_1.default.outputHelp();
    }
}
