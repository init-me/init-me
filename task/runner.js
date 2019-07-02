const print = require('yyl-print');
const path = require('path');
const fs = require('fs');
const extOs = require('yyl-os');
const chalk = require('chalk');
const pkg = require('../package.json');

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

print.log.init({
  type: {
    ver: {
      name: 'INIT',
      color: 'white',
      bgColor: 'bgBlue'
    },
    cmd: {
      name: 'CMD>',
      color: 'white',
      bgColor: 'bgBlack'
    }
  }
});

const task = {
  help({ env }) {
    const h = {
      usage: 'init',
      commands: {
        'install': 'install extend seed package'
      },
      options: {
        '-h, --help': 'print usage information',
        '-v, --version': 'print version',
        '-p, --path': 'show init-me path'
      }
    };
    if (!env.silent) {
      print.help(h);
    }
    return Promise.resolve(h);
  },
  async version({ env }) {
    await print.borderBox([
      `init-me ${chalk.yellow.bold(pkg.version)}`
    ], env);
    return pkg.version;
  },
  path({ env }) {
    const r = path.join(__dirname, '../');
    if (!env.silent) {
      print.log.info(`init-me path: ${chalk.yellow.bold(r)}`);
      extOs.openPath(r);
    }
    return Promise.resolve(r);
  },
  init() {
    // TODO:
  },
  install() {
    // TODO:
  }
};
async function runner ({ cmds, env, shortEnv }) {
  const PROJECT_PATH = process.cwd();
  const cmd = cmds[0];

  if (cmd) {
    if (isPath(cmd)) {
      const targetPath = path.resolve(PROJECT_PATH, cmd);
      return await task.init(targetPath, { env, shortEnv });
    } else {
      switch (cmd) {
        case 'install':
          if (cmds.length > 1) {
            return await task.install(cmds.slice(1), { env, shortEnv });
          } else {
            return await task.help({ env, shortEnv });
          }

        default:
          return await task.help({ env, shortEnv });
      }
    }
  } else {
    if (env.path || shortEnv.p) {
      return await task.path({ env, shortEnv });
    } else if (env.version || shortEnv.v) {
      return await task.version({ env, shortEnv });
    } else if (env.help || shortEnv.h) {
      return await task.help({ env, shortEnv });
    } else {
      return await task.help({ env, shortEnv });
    }
  }
}

module.exports = runner;