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
  async version({ env }) {
    await print.borderBox([
      `init-me ${chalk.yellow.bold(pkg.version)}`
    ], env);
    return pkg.version;
  },
  path({ env }) {
    const r = path.join(__dirname, '../');
    if (!env.silent) {
      console.log([
        '',
        'App path:',
        `  ${chalk.yellow.bold(r)}`,
        ''
      ].join('\r\n'));
      extOs.openPath(r);
    }
    return Promise.resolve(r);
  },
  init() {
    // TODO:
  },
  async install(names, { env }) {
    task.preRun({ env });
    print.log.info('install start');
    await task.config.init();

    await extOs.runCMD(`npm install ${names.join(' ')} --save`, CONFIG_PLUGIN_PATH);

    task.config.updateSeedInfo();

    print.log.success('install finished');
  },
  async uninstall(names, { env }) {
    task.preRun({ env });
    print.log.info('uninstall start');
    await task.config.init();

    await extOs.runCMD(`npm uninstall ${names.join(' ')} --save`, CONFIG_PLUGIN_PATH);

    task.config.updateSeedInfo();

    print.log.success('uninstall finished');
  },
  config: {
    async init() {
      if (!fs.existsSync(CONFIG_PATH)) {
        await task.config.reset();
      }
    },
    updateSeedInfo() {
      // update config
      const setting = task.config.read();
      const pluginPkg = require(CONFIG_PLUGIN_PKG_PATH);
      setting.seeds = Object.keys(pluginPkg.dependencies);
      setting.seedMap = {};
      setting.seeds.forEach((seedName) => {
        const seedPath = path.join(CONFIG_PLUGIN_PATH, 'node_modules', seedName);
        const seedPkgPath = path.join( seedPath, 'package.json');
        if (fs.existsSync(seedPkgPath)) {
          const pkg = require(seedPkgPath);
          setting.seedMap[seedName] = {
            version: pkg.version,
            main: path.resolve(seedPath, pkg.main)
          };
        }
      });

      task.config.rewrite(setting);
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
  },

  preRun({ env }) {
    if (env.silent) {
      print.log.setLogLevel(0);
    } else if (env.logLevel) {
      print.log.setLogLevel(env.logLevel);
    } else {
      print.log.setLogLevel(1);
    }
  },
  list({ env }) {
    task.preRun({ env });
    const iPkg = task.config.read();
    let keys = [];
    if (typeof iPkg.seedMap === 'object') {
      keys = Object.keys(iPkg.seedMap);
    }
    if (keys.length) {
      const logs = [
        '',
        'Seed list:'
      ];
      keys.forEach((key) => {
        const info = iPkg.seedMap[key];
        logs.push(`  ${chalk.green(key)} : ${chalk.yellow(info.version)}`);
      });
      logs.push('');
      if (!env.silent) {
        console.log(logs.join('\r\n'));
      }
      return Promise.resolve(iPkg.seedMap);
    } else {
      if (!env.silent) {
        console.log('  no seed.');
      }
      console.log(iPkg);
      return Promise.resolve({});
    }
  }
};
module.exports = task;