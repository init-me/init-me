const print = require('yyl-print');
const path = require('path');
const fs = require('fs');
const extOs = require('yyl-os');
const chalk = require('chalk');
const inquirer = require('inquirer');
const extFs = require('yyl-fs');

const pkg = require('../package.json');
const LANG = require('../lang/index');
const LocalConfig = require('../lib/localConfig');

const USERPROFILE = process.env[process.platform == 'win32'? 'USERPROFILE': 'HOME'];
const CONFIG_PATH = path.join(USERPROFILE, '.init-me');
const CONFIG_PLUGIN_PATH = path.join(CONFIG_PATH, 'plugins');

const localConfig = new LocalConfig();

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

// + fn
const preRun = ({ env }) => {
  if (env.silent) {
    print.log.setLogLevel(0);
  } else if (env.logLevel) {
    print.log.setLogLevel(env.logLevel);
  } else {
    print.log.setLogLevel(1);
  }
};
// - fn


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
    preRun({ env });
    print.log.info(LANG.INIT.START);
    const config = await localConfig.get();
    if (config.seeds && config.seeds.length) {
      let iSeed = '';
      if (env.seed) {
        if (config.seeds.indexOf(env.seed) !== -1) {
          iSeed = env.seed;
        } else {
          print.log.error(LANG.INIT.SEED_NOT_EXISTS);
          return;
        }
      } else {
        const r = await inquirer.prompt([{
          type: 'list',
          name: 'seed',
          message: `${LANG.INIT.QUEATION_SELECT_TYPE}:`,
          default: config.seeds[0],
          choices: config.seeds
        }]);
        iSeed = r.seed;
      }
      if (!iSeed) {
        return;
      }
      if (!env.silent) {
        console.log(`${chalk.yellow('!')} ${LANG.INIT.SEED_LOADING}: ${chalk.green(iSeed)}`);
      }
      const iSeedConfig = config.seedMap[iSeed];
      if (!iSeedConfig) {
        print.log.error(`${LANG.INIT.SEED_MAP_NOT_EXISTS}: ${iSeed}`);
        return;
      }

      print.log.info(`${LANG.INIT.SEED_MAIN_PRINT}: ${chalk.yellow(iSeedConfig.main)}`);
      if (!fs.existsSync(iSeedConfig.main)) {
        print.log.error(`${LANG.INIT.SEED_MAP_MAIN_NOT_EXISTS}: ${iSeed}`);
        return;
      }

      const iSeedPack = require(iSeedConfig.main);

      if (!env.silent) {
        console.log(`${chalk.green('√')} ${LANG.INIT.SEED_LOAD_FINISHED}`);
      }

      // 启动前 hooks
      if (iSeedPack.hooks && iSeedPack.hooks.beforeStart) {
        print.log.info(LANG.INIT.HOOKS_BEFORE_START_RUN);
        try {
          await iSeedPack.hooks.beforeStart({ env, targetPath });
        } catch (er) {
          print.log.error(er);
          return;
        }
        print.log.info(LANG.INIT.HOOKS_BEFORE_START_FINISHED);
      }

      // 准备需要复制的文件
      if (!iSeedPack.path) {
        print.log.error(`${LANG.INIT.SEED_COPY_PATH_UNDEFINED}: ${chalk.green(iSeed)}`);
        return;
      }
      let fileMap = {};
      const seedSourcePath = path.resolve(iSeedConfig.main, iSeedPack.path);

      print.log.info(`${LANG.INIT.SEED_COPY_PATH_PRINT}: ${chalk.yellow(seedSourcePath)}`);

      if (!fs.existsSync(seedSourcePath)) {
        print.log.error(`${LANG.INIT.SEED_COPY_PATH_NOT_EXISTS}: ${chalk.yellow(seedSourcePath)}`);
        return;
      }


      const files = await extFs.readFilePaths(seedSourcePath);
      files.forEach((iPath) => {
        fileMap[iPath] = [path.resolve(targetPath, path.relative(seedSourcePath, iPath))];
      });

      // 复制前 hooks
      if (iSeedPack.hooks && iSeedPack.hooks.beforeCopy) {
        print.log.info(LANG.INIT.HOOKS_BEFORE_COPY_RUN);
        const rMap = await iSeedPack.hooks.beforeCopy({ fileMap, env, targetPath });
        if (typeof rMap === 'object') {
          fileMap = rMap;
        }

        print.log.info(LANG.INIT.HOOKS_BEFORE_COPY_FINISHED);
      }

      print.log.info(`${LANG.INIT.SEED_COPY_MAP_PRINT}:`);
      Object.keys(fileMap).forEach((iPath) => {
        print.log.info(`${chalk.yellow(iPath)} => ${chalk.green(fileMap[iPath].join(','))}`);
      });

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
        print.log.info(LANG.INIT.HOOKS_AFTER_COPY_RUN);
        await iSeedPack.hooks.afterCopy({ fileMap, env, targetPath });
        print.log.info(LANG.INIT.HOOKS_AFTER_COPY_FINISHED);
      }

      print.log.success(LANG.INIT.FINISHED);
    } else {
      print.log.error(
        LANG.INIT.BLANK_SEED,
        `${chalk.green('examples:')}`,
        `${chalk.yellow('init install init-me-seed-rollup')}`
      );
    }
  },
  async install(names, { env }) {
    preRun({ env });
    print.log.info(LANG.INSTALL.START);
    await extOs.runCMD(`npm install ${names.join(' ')} --save ${env.silent ? '--silent': ''}`, CONFIG_PLUGIN_PATH);

    await localConfig.updateSeedInfo();

    print.log.success(LANG.INSTALL.FINISHED);
  },
  async uninstall(names, { env }) {
    preRun({ env });
    print.log.info(LANG.UNINSTALL.START);

    await extOs.runCMD(`npm uninstall ${names.join(' ')} --save ${env.silent ? '--silent': ''}`, CONFIG_PLUGIN_PATH);

    await localConfig.updateSeedInfo();

    print.log.success(LANG.UNINSTALL.FINISHED);
  },

  async list({ env }) {
    preRun({ env });
    const iPkg = await localConfig.get();
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
        } else {
          pkgs.push(info);
        }
      });

      if (pkgs.length) {
        logs.push('');
        logs.push(`${chalk.cyan(LANG.LIST.PKG_LIST)}:`);
        pkgs.forEach((info) => {
          logs.push(`  ${chalk.green(info.name)} : ${chalk.yellow(info.version)}`);
        });
      }

      if (locals.length) {
        logs.push('');
        logs.push(`${chalk.cyan(LANG.LIST.LOCAL_LIST)}:`);
        locals.forEach((info) => {
          logs.push(`  ${chalk.green(info.name)}(${info.version}) : ${chalk.yellow(info.main)}`);
        });
      }

      logs.push('');
      if (!env.silent) {
        console.log(logs.join('\r\n'));
      }
      return iPkg.seedMap;
    } else {
      if (!env.silent) {
        console.log(`  ${LANG.LIST.BLANK}`);
      }
      return {};
    }
  },
  async reset({ env }) {
    preRun({ env });
    print.log.info(LANG.RESET.START);
    await localConfig.reset();
    print.log.success(LANG.RESET.FINISHED);
  },

  async link({ targetPath, env }) {
    preRun({ env });
    print.log.info(LANG.LINK.START);
    const pkgPath = path.join(targetPath, 'package.json');
    if (!fs.existsSync(pkgPath)) {
      print.log.error(LANG.LINK.PKG_NOT_FOUND);
      return;
    }
    const pkg = require(pkgPath);

    if (!pkg.name) {
      print.log.error(LANG.LINK.PKG_NAME_IS_BLANK);
      return;
    }

    if (!pkg.version) {
      print.log.error(LANG.LINK.PKG_VERSION_IS_BLANK);
      return;
    }

    if (!pkg.main) {
      print.log.error(LANG.LINK.PKG_ENTRY_IS_BLANK);
      return;
    }

    const entryPath = path.resolve(targetPath, pkg.main);

    if (!fs.existsSync(entryPath)) {
      print.log.error(`${LANG.LINK.PKG_ENTRY_NOT_EXISTS}: ${entryPath}`);
      return;
    }


    await localConfig.addlocalSeed(pkg.name, {
      main: entryPath,
      version: pkg.version,
      dev: true
    });

    print.log.success(`${LANG.LINK.FINISHED}: ${pkg.name}`);
  },
  async unlink({ targetPath, env }) {
    preRun({ env });
    print.log.info(LANG.UNLINK.START);
    const pkgPath = path.join(targetPath, 'package.json');
    if (!fs.existsSync(pkgPath)) {
      print.log.error(LANG.UNLINK.PKG_NOT_FOUND);
      return;
    }
    const pkg = require(pkgPath);

    if (!pkg.name) {
      print.log.error(LANG.UNLINK.PKG_NAME_IS_BLANK);
      return;
    }

    await localConfig.removeLocalSeed(pkg.name);

    print.log.success(`${LANG.UNLINK.FINISHED}: ${pkg.name}`);
  },
  async recommend({ env }) {
    if (env.silent) {
      print.log.setLogLevel(0);
    }
    const keyword = 'init-me-seed-';
    const { searchNpm, searchYyNpm } = require('../lib/search');
    print.log.info(LANG.RECOMMEND.SEARCH_NPM_START);

    const r1 = await searchNpm(keyword);

    let r2 = [];
    if (env.yy) {
      r2 = await searchYyNpm(keyword);
    }
    print.log.success(LANG.RECOMMEND.SEARCH_NPM_FINISHED);

    const { seedMap } = await localConfig.get();

    const r = r1.concat(r2)
      .map((item) => item.name)
      .filter((name) => {
        if (seedMap[name]) {
          return false;
        }
        return true;
      });

    if (!env.silent) {
      const logArr = [''];
      if (r.length) {
        logArr.push(` ${chalk.yellow(LANG.RECOMMEND.TITLE)}:`);
        r.forEach((name) => {
          logArr.push(` ${chalk.gray('*')} ${chalk.green(name)}`);
        });
      } else {
        logArr.push(` ${LANG.RECOMMEND.RESULT_BLANK}`);
      }
      logArr.push('');

      console.log(logArr.join('\r\n'));
    }
    return r;
  }
};
module.exports = task;