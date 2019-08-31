const print = require('yyl-print');
const path = require('path');
const fs = require('fs');
const extOs = require('yyl-os');
const chalk = require('chalk');
const pkg = require('../package.json');
const inquirer = require('inquirer');
const extFs = require('yyl-fs');
const lang = require('../const/lang');

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
  async init(targetPath, { env }) {
    task.preRun({ env });
    print.log.info(lang.INIT.START);
    const config = task.config.read();
    if (config.seeds && config.seeds.length) {
      let iSeed = '';
      if (env.seed) {
        if (config.seeds.indexOf(env.seed) !== -1) {
          iSeed = env.seed;
        } else {
          print.log.error(lang.INIT.SEED_NOT_EXISTS);
          return;
        }
      } else {
        const r = await inquirer.prompt([{
          type: 'list',
          name: 'seed',
          message: lang.INIT.QUEATION_SELECT_TYPE,
          default: config.seeds[0],
          choices: config.seeds
        }]);
        iSeed = r.seed;
      }
      if (!iSeed) {
        return;
      }
      if (!env.silent) {
        console.log(`${chalk.yellow('!')} ${lang.INIT.SEED_LOADING}: ${chalk.green(iSeed)}`);
      }
      const iSeedConfig = config.seedMap[iSeed];
      if (!iSeedConfig) {
        print.log.error(`${lang.INIT.SEED_MAP_NOT_EXISTS}: ${iSeed}`);
        return;
      }

      if (!fs.existsSync(iSeedConfig.main)) {
        print.log.error(`${lang.INIT.SEED_MAP_MAIN_NOT_EXISTS}: ${iSeed}`);
        return;
      }

      const iSeedPack = require(iSeedConfig.main);

      if (!env.silent) {
        console.log(`${chalk.green('√')} ${lang.INIT.SEED_LOAD_FINISHED}`);
      }

      // 启动前 hooks
      if (iSeedPack.hooks && iSeedPack.hooks.beforeStart) {
        try {
          await iSeedPack.hooks.beforeStart({ env, targetPath });
        } catch (er) {
          print.log.error(er);
          return;
        }
      }

      // 准备需要复制的文件
      if (!iSeedPack.path) {
        print.log.error(lang.INIT.SEED_COPY_PATH_UNDEFINED);
        return;
      }
      let fileMap = {};
      const seedSourcePath = path.resolve(iSeedConfig.main, iSeedPack.path);

      if (!fs.existsSync(seedSourcePath)) {
        print.log.error(`${lang.INIT.SEED_COPY_PATH_NOT_EXISTS}: ${seedSourcePath}`);
        return;
      }

      const files = await extOs.readFilePaths(seedSourcePath);
      files.forEach((iPath) => {
        fileMap[iPath] = [path.resolve(targetPath, path.relative(seedSourcePath, iPath))];
      });

      // 复制前 hooks
      if (iSeedPack.hooks && iSeedPack.hooks.beforeCopy) {
        const rMap = await iSeedPack.hooks.beforeCopy({ fileMap, env, targetPath });
        if (typeof rMap === 'object') {
          fileMap = rMap;
        }
      }

      // 复制
      const iLog = await extFs.copyFiles(fileMap);

      iLog.add.forEach((iPath) => {
        print.log.add(iPath);
      });

      iLog.update.forEach((iPath) => {
        print.log.update(iPath);
      });

      // 复制后 hooks
      if (iSeedPack.hooks && iSeedPack.hooks.afterCopy) {
        await iSeedPack.hooks.afterCopy({ fileMap, env, targetPath });
      }

      print.log.success(lang.INIT.FINISHED);
    } else {
      print.log.error(
        lang.INIT.BLANK_SEED,
        `${chalk.yellow('examples:')}`,
        `${chalk.yellow.bold('init install init-me-seed-rollup')}`
      );
    }
  },
  async install(names, { env }) {
    task.preRun({ env });
    print.log.info(lang.INSTALL.START);
    await task.config.init();

    await extOs.runCMD(`npm install ${names.join(' ')} --save`, CONFIG_PLUGIN_PATH);

    task.config.updateSeedInfo();

    print.log.success(lang.INSTALL.FINISHED);
  },
  async uninstall(names, { env }) {
    task.preRun({ env });
    print.log.info(lang.UNINSTALL.START);
    await task.config.init();

    await extOs.runCMD(`npm uninstall ${names.join(' ')} --save`, CONFIG_PLUGIN_PATH);

    task.config.updateSeedInfo();

    print.log.success(lang.UNINSTALL.FINISHED);
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
        print.log.warn(lang.ERROR.CONFIG_PARSE, er);
        return {};
      }
    },
    rewrite(obj) {
      fs.writeFileSync(CONFIG_SETTIN_PATH, JSON.stringify(obj, null, 2));
    },
    async reset() {
      print.log.info(lang.CONFIG.RESET_START);
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


      print.log.success(lang.CONFIG.RESET_FINISHED);
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
        console.log(`  ${lang.LIST.BLANK}`);
      }
      console.log(iPkg);
      return Promise.resolve({});
    }
  }
};
module.exports = task;