const path = require('path');
const fs = require('fs');
const util = require('yyl-util');

const LocalStorage = require('./localStorage');
const pkg = require('../package.json');


const DEFAULT_PKG_CONFIG = {
  name: 'init-me-plugins',
  version: pkg.version,
  description: 'plugin manage',
  license: 'ISC',
  repository: {},
  dependencies: {},
  devDependencies: {}
};

const DEFAULT_CONFIG = {
  seeds: []
};

const DEFAULT_LOCAL_SEED_CONFIG = {
};


class LocalConfig {
  constructor() {
    this.handle = new LocalStorage('config', DEFAULT_CONFIG);
    this.pkgHandle = new LocalStorage('plugins/package', DEFAULT_PKG_CONFIG);
    this.seedHandle = new LocalStorage('local-seed.config', DEFAULT_LOCAL_SEED_CONFIG);
  }
  async get () {
    await this.updateSeedInfo();
    return await this.handle.get();
  }
  async updateSeedInfo() {
    await this.pkgHandle.update();
    // update config
    const setting = await this.handle.get();
    const pluginPkg = await this.pkgHandle.get();

    setting.seeds = Object.keys(pluginPkg.dependencies);
    setting.seedMap = {};
    setting.seeds.forEach((seedName) => {
      const seedPath = path.join(path.dirname(this.pkgHandle.savePath), 'node_modules', seedName);
      const seedPkgPath = path.join(seedPath, 'package.json');
      if (fs.existsSync(seedPkgPath)) {
        const pkg = require(seedPkgPath);
        setting.seedMap[seedName] = {
          name: seedName,
          version: pkg.version,
          main: path.resolve(seedPath, pkg.main)
        };
      }
    });


    // local seed
    await this.seedHandle.update();
    const localSeedMap = await this.seedHandle.get();
    Object.keys(localSeedMap).forEach((seedName) => {
      setting.seeds.push(seedName);
      setting.seedMap[seedName] = localSeedMap[seedName];
    });

    await this.handle.set(setting);
    await util.waitFor(200);
  }
  // 新增 local seed
  async addlocalSeed (name, seedObj) {
    const seedMap = await this.seedHandle.get();
    seedMap[name] = seedObj;
    await this.seedHandle.set(seedMap);
    await this.updateSeedInfo();
  }
  // 删除 local seed
  async removeLocalSeed(name) {
    const seedMap = await this.seedHandle.get();
    delete seedMap[name];
    await this.seedHandle.set(seedMap);
    await this.updateSeedInfo();
  }

  // 从文件更新
  update() {
    try {
      this.data = require(this.seedPath);
    } catch (er) {
      this.data = DEFAULT_CONFIG;
    }
    return Promise.resolve(this.data);
  }
  // 重置 config
  async reset () {
    await this.handle.set(DEFAULT_CONFIG);
    await this.pkgHandle.set(DEFAULT_PKG_CONFIG);
    await this.seedHandle.set(DEFAULT_LOCAL_SEED_CONFIG);
    await util.waitFor(200);
  }
}

module.exports = LocalConfig;