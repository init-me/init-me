import path from 'path'
import fs from 'fs'
import { LocalStorage } from './localStorage'
const pkg = require('../package.json')

export interface InitMeSeedConfig {
  seeds: string[]
  seedMap: {
    [pkgName: string]: InitMeSeedObj
  }
}

export interface InitMeSeedObj {
  name: string
  version: string
  main: string
  dev: boolean
}

export type InitMeLocalSeedConfig = InitMeSeedConfig['seedMap']
export interface PkgConfig {
  name: string
  version: string
  description: string
  license: string
  repository: {
    [name: string]: string
  }
  dependencies: {
    [name: string]: string
  }
  devDependencies: {
    [name: string]: string
  }
}

const DEFAULT_PKG_CONFIG: PkgConfig = {
  name: 'init-me-plugins',
  version: pkg.version,
  description: 'plugin manage',
  license: 'ISC',
  repository: {},
  dependencies: {},
  devDependencies: {}
}

const DEFAULT_CONFIG: InitMeSeedConfig = {
  seeds: [],
  seedMap: {}
}

const DEFAULT_LOCAL_SEED_CONFIG: InitMeLocalSeedConfig = {}

export class LocalConfig {
  private handle: LocalStorage<InitMeSeedConfig>
  private pkgHandle: LocalStorage<PkgConfig>
  private seedHandle: LocalStorage<InitMeLocalSeedConfig>
  constructor() {
    this.handle = new LocalStorage<InitMeSeedConfig>('config', DEFAULT_CONFIG)
    this.pkgHandle = new LocalStorage<PkgConfig>('plugins/package', DEFAULT_PKG_CONFIG)
    this.seedHandle = new LocalStorage<InitMeLocalSeedConfig>(
      'local-seed.config',
      DEFAULT_LOCAL_SEED_CONFIG
    )
  }

  async get() {
    return await this.handle.get()
  }

  async updateSeedInfo() {
    // update config
    const setting = await this.handle.get()
    const pluginPkg = await this.pkgHandle.get()

    setting.seeds = Object.keys(pluginPkg.dependencies) as string[]
    setting.seedMap = {}
    setting.seeds.forEach((seedName: string) => {
      const seedPath = path.join(path.dirname(this.pkgHandle.savePath), 'node_modules', seedName)
      const seedPkgPath = path.join(seedPath, 'package.json')
      if (fs.existsSync(seedPkgPath)) {
        const pkg = require(seedPkgPath)
        setting.seedMap[seedName] = {
          name: seedName,
          version: pkg.version,
          main: path.resolve(seedPath, pkg.main),
          dev: false
        }
      }
    })

    // local seed
    const localSeedMap = await this.seedHandle.get()
    Object.keys(localSeedMap).forEach((seedName) => {
      if (setting.seeds.indexOf(seedName) === -1) {
        setting.seeds.push(seedName)
      }
      setting.seedMap[seedName] = localSeedMap[seedName]
    })

    return await this.handle.set(setting)
  }

  // 新增 local seed
  async addlocalSeed(name: string, seedObj: InitMeSeedObj) {
    const seedMap = await this.seedHandle.get()
    seedMap[name] = seedObj
    await this.seedHandle.set(seedMap)
    await this.updateSeedInfo()
    return await this.get()
  }

  // 删除 local seed
  async removeLocalSeed(name: string) {
    const seedMap = await this.seedHandle.get()
    delete seedMap[name]
    await this.seedHandle.set(seedMap)
    await this.updateSeedInfo()
    return await this.get()
  }

  // 重置 config
  async reset() {
    await this.handle.set(DEFAULT_CONFIG)
    await this.pkgHandle.set(DEFAULT_PKG_CONFIG)
    await this.seedHandle.set(DEFAULT_LOCAL_SEED_CONFIG)
    await this.updateSeedInfo()
    return await this.get()
  }
}
