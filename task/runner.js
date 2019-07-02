const print = require('yyl-print');
const path = require('path');
const fs = require('fs');
const extOs = require('yyl-os');
const chalk = require('chalk');
const pkg = require('../package.json');
const extFs = require('yyl-fs');

const USERPROFILE = process.env[process.platform == 'win32'? 'USERPROFILE': 'HOME'];
const CONFIG_PATH = path.join(USERPROFILE, '.init-me');
const CONFIG_SETTIN_PATH = path.join(CONFIG_PATH, 'config.json');
const CONFIG_PLUGIN_PATH = path.join(CONFIG_PATH, 'plugins');
const CONFIG_PLUGIN_PKG_PATH = path.join(CONFIG_PLUGIN_PATH, 'package.json');

const fn = {
  printHeader() {
    print.log.ver(`init-me ${chalk.yellow.bold(pkg.version)}`);
  }
};

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
    },
    create: {
      name: 'ADD>',
      color: chalk.bgGreen.white
    }
  }
});

const task = {
  help({ env }) {
    const h = {
      usage: 'init',
      commands: {
        'install': 'install extend seed plugins',
        'uninstall': 'uninstall extend seed plugins',
        'reset': 'reset plugins'
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
  async install(names) {
    print.log.info('install start');
    await task.config.init();

    await extOs.runCMD(`npm install ${names.join(' ')} --save`, CONFIG_PLUGIN_PATH);

    // update config
    const setting = task.config.read();
    const pluginPkg = require(CONFIG_PLUGIN_PKG_PATH);
    setting.seeds = Object.keys(pluginPkg.dependencies);
    task.config.rewrite(setting);

    print.log.success('install finished');
  },
  async uninstall(names) {
    print.log.info('uninstall start');
    await task.config.init();

    await extOs.runCMD(`npm uninstall ${names.join(' ')} --save`, CONFIG_PLUGIN_PATH);

    // update config
    const setting = task.config.read();
    const pluginPkg = require(CONFIG_PLUGIN_PKG_PATH);
    setting.seeds = Object.keys(pluginPkg.dependencies);
    task.config.rewrite(setting);

    print.log.success('uninstall finished');
  },
  config: {
    async init() {
      if (!fs.existsSync(CONFIG_PATH)) {
        await task.reset();
      }
    },
    read() {
      try {
        const r = require(CONFIG_SETTIN_PATH);
        return r;
      } catch (er) {
        print.log.warn('parse config error', er);
        return {};
      }
    },
    rewrite(obj) {
      fs.writeFileSync(CONFIG_SETTIN_PATH, JSON.stringify(obj, null, 2));
    },
    async reset() {
      print.log.info('config reset start');
      if (!fs.existsSync(CONFIG_PATH)) {
        await extFs.mkdirSync(CONFIG_PATH);
        print.log.create(CONFIG_PATH);
      }


      // build config.json
      const configObj = {
        seeds: []
      };
      fs.writeFileSync(CONFIG_SETTIN_PATH, JSON.stringify(configObj, null, 2));
      print.log.create(CONFIG_SETTIN_PATH);

      //  build plugins/
      await extFs.mkdirSync(CONFIG_PLUGIN_PATH);
      print.log.create(CONFIG_PLUGIN_PATH);

      // build plugins/package.json
      const iPkg = {
        name: 'init-me-plugins',
        version: pkg.version,
        description: 'plugin manage',
        license: 'ISC',
        repository: {},
        dependencies: {},
        devDependencies: {}
      };
      fs.writeFileSync(CONFIG_PLUGIN_PKG_PATH, JSON.stringify(iPkg, null, 2));
      print.log.create(CONFIG_PLUGIN_PKG_PATH);


      print.log.success('init-me config reset finished');
    }
  }
};
async function runner ({ cmds, env, shortEnv }) {
  const PROJECT_PATH = process.cwd();
  const cmd = cmds[0];

  if (env.silent) {
    print.log.setLogLevel(0);
  } else if (env.logLevel) {
    print.log.setLogLevel(env.logLevel);
  } else {
    print.log.setLogLevel(1);
  }

  if (cmd) {
    if (isPath(cmd)) {
      const targetPath = path.resolve(PROJECT_PATH, cmd);
      fn.printHeader(env);
      return await task.init(targetPath, { env, shortEnv });
    } else {
      switch (cmd) {
        case 'install':
          if (cmds.length > 1) {
            fn.printHeader(env);
            return await task.install(cmds.slice(1), { env, shortEnv });
          } else {
            return await task.help({ env, shortEnv });
          }

        case 'uninstall':
          if (cmds.length > 1) {
            fn.printHeader(env);
            return await task.uninstall(cmds.slice(1), { env, shortEnv });
          } else {
            return await task.help({ env, shortEnv });
          }

        case 'reset':
          fn.printHeader(env);
          return await task.config.reset({ env, shortEnv });

        default:
          return await task.help({ env, shortEnv });
      }
    }
  } else {
    if (env.path || shortEnv.p) {
      fn.printHeader(env);
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