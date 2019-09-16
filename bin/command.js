const cmder = require('commander');
const print = require('yyl-print');
const chalk = require('chalk');
const lang = require('../const/lang');
const task = require('../task/index');
const pkg = require('../package.json');
const path = require('path');
const util = require('yyl-util');
const fs = require('fs');

const isPath = function(ctx) {
  if (typeof ctx === 'string') {
    const rPath = path.resolve(process.cwd(), ctx);
    if (fs.existsSync(rPath)) {
      return true;
    } else {
      return false;
    }
  } else {
    return false;
  }
};

let isBlock = false;
const env = util.envParse(process.argv);

const fn = {
  printHeader({ env }) {
    if (env.silent) {
      return;
    }
    print.log.ver(`init-me ${chalk.yellow.bold(pkg.version)}`);

    let keyIndex = -1;
    process.argv.forEach((str, index) => {
      if (str.match(/bin[/\\]init$/)) {
        keyIndex = index;
      }
    });
    if (keyIndex != -1) {
      const cmds = process.argv.slice(keyIndex + 1);
      print.log.cmd(`init ${cmds.join(' ')}`);
    }
  }
};

cmder
  .option('-p, --path', lang.DESCRIPTION.PATH, () => {
    task.path({ env });
    isBlock = true;
  });

cmder
  .option('-v, --version', lang.DESCRIPTION.VERSION, () => {
    task.version({ env });
    isBlock = true;
  });

cmder
  .option('-q, --silent', lang.DESCRIPTION.SILENT)
  .option('--seed <name>', lang.DESCRIPTION.SEED)
  .option('--logLevel <level>', lang.DESCRIPTION.LOG_LEVEL);

cmder
  .command('install <pkgName>')
  .alias('i')
  .description(lang.DESCRIPTION.INSTALL)
  .action((pkgName, cmd) => {
    const env = cmd.parent;
    fn.printHeader({ env });
    task.install(pkgName.split(/\s+/), { env }).catch((er) => {
      throw er;
    });
    isBlock = true;
  });

cmder
  .command('uninstall <pkgName>')
  .description(lang.DESCRIPTION.UNINSTALL)
  .action((pkgName, cmd) => {
    const env = cmd.parent;
    fn.printHeader({ env });
    task.uninstall(pkgName.split(/\s+/), { env }).catch((er) => {
      throw er;
    });
    isBlock = true;
  });

cmder
  .command('reset')
  .description(lang.DESCRIPTION.RESET)
  .action((cmd) => {
    const env = cmd.parent;
    fn.printHeader({ env });
    task.reset({ env }).catch((er) => {
      throw er;
    });
    isBlock = true;
  });

cmder
  .command('list')
  .description(lang.DESCRIPTION.LIST)
  .action(() => {
    task.list({ env }).catch((er) => {
      throw er;
    });
    isBlock = true;
  });

cmder
  .on('--help', () => {
    console.log([
      '',
      'Examples:',
      '  $ init --logLevel 2',
      '  $ init path/to/dir',
      ''
    ].join('\r\n'));
    isBlock = true;
  });


cmder.parse(process.argv);

if (
  !isBlock && (
    !cmder.args.length ||
    typeof cmder.args[cmder.args.length - 1] !== 'object'
  )
) {
  let targetPath = process.cwd();
  if (cmder.args[0]) {
    targetPath = cmder.args[0];
  }
  if (isPath(targetPath)) {
    fn.printHeader({ env });
    task.init(targetPath, { env }).catch((er) => {
      throw er;
    });
  } else {
    cmder.outputHelp();
  }
}