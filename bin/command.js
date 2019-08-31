const cmder = require('commander');
const print = require('yyl-print');
const chalk = require('chalk');
const lang = require('../const/lang');
const task = require('../task/index');
const pkg = require('../package.json');
const path = require('path');
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

const fn = {
  printHeader() {
    print.log.ver(`init-me ${chalk.yellow.bold(pkg.version)}`);
  }
};

cmder
  .option('-p, --path', lang.DESCRIPTION.PATH, () => {
    task.path({ env: cmder });
  });

cmder
  .option('-v, --version', lang.DESCRIPTION.VERSION, () => {
    task.version({ env: cmder });
  });

cmder
  .option('--silent', lang.DESCRIPTION.SILENT);

cmder
  .command('install [pkgName]')
  .alias('i')
  .description(lang.DESCRIPTION.INSTALL)
  .action((pkgName, cmd) => {
    const env = cmd.parent;
    fn.printHeader();
    task.install(pkgName.split(/\s+/), { env }).catch((er) => {
      throw er;
    });
  });

cmder
  .command('uninstall [pkgName]')
  .description(lang.DESCRIPTION.UNINSTALL)
  .action((pkgName, cmd) => {
    const env = cmd.parent;
    fn.printHeader();
    task.uninstall(pkgName.split(/\s+/), { env }).catch((er) => {
      throw er;
    });
  });

cmder
  .command('reset')
  .description(lang.DESCRIPTION.RESET)
  .action((cmd) => {
    const env = cmd.parent;
    fn.printHeader();
    task.config.reset({ env }).catch((er) => {
      throw er;
    });
  });

cmder
  .command('list')
  .description(lang.DESCRIPTION.LIST)
  .action((cmd) => {
    const env = cmd.parent;
    task.list({ env }).catch((er) => {
      throw er;
    });
  });

cmder
  .on('--help', () => {
    console.log([
      '',
      'Examples:',
      '  $ init --silent',
      '  $ init path/to/dir',
      ''
    ].join('\r\n'));
  });


cmder.parse(process.argv);

if (
  !cmder.args.length ||
  typeof cmder.args[cmder.args.length - 1] !== 'object'
) {
  let targetPath = process.cwd();
  if (cmder.args[0]) {
    targetPath = cmder.args[0];
  }
  if (isPath(targetPath)) {
    task.init(targetPath, { env: cmder });
  } else {
    cmder.outputHelp();
  }
}