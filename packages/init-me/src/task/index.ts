/* eslint-disable no-useless-catch */
import path from 'path'
import fs from 'fs'
import extOs from 'yyl-os'
import chalk from 'chalk'
import inquirer from 'inquirer'
import extFs from 'yyl-fs'
import { Lang } from '../lang/index'
import { InitMeSeedConfig, InitMeSeedObj, LocalConfig, pkg } from '../lib/localConfig'
import { CONFIG_PATH } from '../lib/localStorage'
import { YylCmdLogger, LogLevel } from 'yyl-cmd-logger'
import { InitMeSeed } from 'init-me-seed-types'
import {
  getPkgLatestVersion,
  listSeed,
  inYY,
  REG_IS_YY_PKG,
  REGISTRY_OPTION,
  NpmSearchLogItem,
  searchYyNpm,
  searchNpm
} from '../lib/search'
import { seedFull2Short } from '../lib/formatter'

export interface Env {
  silent?: boolean
  logLevel?: LogLevel
  seed?: string
  force?: boolean
  [key: string]: any
}

const CONFIG_PLUGIN_PATH = path.join(CONFIG_PATH, 'plugins')

const localConfig = new LocalConfig()

interface InitMeSeedFileMap {
  [key: string]: string[]
}

interface TaskOption {
  env: Env
  logger?: YylCmdLogger
}

// + fn
const blankLogger: YylCmdLogger = {
  log() {
    return []
  },
  setLogLevel() {},
  setProgress() {}
} as unknown as YylCmdLogger
const formatTaskOption = (op?: TaskOption) => {
  const env: Required<Env> = {
    silent: !!op?.env.silent,
    logLevel: op?.env.logLevel === undefined ? 1 : op.env.logLevel,
    seed: op?.env.seed || '',
    force: !!op?.env.force
  }
  const logger = op?.logger || blankLogger
  if (logger) {
    if (env.silent) {
      logger.setLogLevel(0)
    } else if (env.logLevel) {
      logger.setLogLevel(env.logLevel)
    } else {
      logger.setLogLevel(1)
    }
  }
  return {
    env,
    logger
  }
}

// - fn

export const task = {
  async clear(op: TaskOption) {
    const { env, logger } = formatTaskOption(op)
    logger.log('info', [Lang.CLEAR.START])
    let removes = []
    try {
      removes = await extFs.removeFiles(CONFIG_PATH, true)
    } catch (er) {
      throw er
    }
    removes.forEach((iPath) => {
      logger.log('del', [iPath])
    })
    logger.log('success', [Lang.CLEAR.FINISHED])
  },
  version(op: TaskOption) {
    const { env, logger } = formatTaskOption(op)
    if (!env.silent) {
      logger && logger.log('info', [`init-me ${chalk.yellow.bold(pkg.version)}`])
    }
    return Promise.resolve(pkg.version)
  },
  path(op: Omit<TaskOption, 'logger'>) {
    const { env } = op
    const r = {
      app: path.join(__dirname, '../../'),
      config: CONFIG_PATH
    }
    if (!env.silent) {
      console.log(
        [
          '',
          ' App path:',
          ` ${chalk.yellow.bold(r.app)}`,
          '',
          ' Config path:',
          ` ${chalk.yellow.bold(r.config)}`,
          ''
        ].join('\r\n')
      )
      extOs.openPath(r.app)
      extOs.openPath(r.config)
    }
    return Promise.resolve(r)
  },
  async init(targetPath: string, op: TaskOption & { inset?: boolean }) {
    const { inset } = op
    const { env, logger } = formatTaskOption(op)
    if (!inset) {
      logger.log('info', [Lang.INIT.START])
      logger.setProgress('start', 'info', [Lang.INIT.LIST_START])
      logger.log('info', [Lang.INIT.LIST_START])
    }

    let seeds = []
    try {
      seeds = await listSeed()
    } catch (er) {
      throw er
    }

    if (!inset) {
      logger.log('success', [Lang.INIT.LIST_FINISHED])
      logger && logger.setProgress('finished', 'success', [Lang.INIT.LIST_FINISHED])
    }

    const config = (await localConfig.get()) || {}
    const installedSeeds = config.seeds || []

    let seedItems = installedSeeds.map((seed) => {
      const seedItem = config.seedMap[seed]
      const { version, dev } = seedItem
      const name = seed
      const shortName = seedFull2Short(name)
      return {
        name,
        shortName,
        installed: true,
        dev,
        choice: `${chalk.yellow.bold(shortName)} ${chalk.gray('(')}${
          dev ? 'local' : version
        }${chalk.gray(')')}`
      }
    })

    seedItems = seedItems.concat(
      seeds
        .filter((name) => installedSeeds.indexOf(name) === -1)
        .map((name) => {
          const shortName = seedFull2Short(name)
          return {
            name,
            shortName,
            installed: false,
            dev: false,
            choice: chalk.gray(shortName)
          }
        })
    )

    seedItems.sort((a, b) => {
      if (a.installed && !b.installed) {
        return -1
      } else if (!a.installed && b.installed) {
        return 1
      } else if (a.installed && b.installed) {
        if (a.dev && !b.dev) {
          return -1
        } else if (!a.dev && b.dev) {
          return 1
        } else {
          return a.name.localeCompare(b.name)
        }
      } else {
        return a.name.localeCompare(b.name)
      }
    })

    let iSeed = ''
    if (env.seed) {
      const matchItem = seedItems.filter(
        (item) => item.shortName === env.seed || item.name === env.seed
      )[0]
      if (matchItem) {
        iSeed = matchItem.name
      } else {
        logger.log('error', [Lang.INIT.SEED_NOT_EXISTS])
        return
      }
    } else {
      const choices = seedItems.map((item) => item.choice)
      const r = await inquirer.prompt([
        {
          type: 'list',
          name: 'seed',
          message: `${Lang.INIT.QUEATION_SELECT_TYPE}:`,
          default: choices[0],
          choices: choices
        }
      ])
      iSeed = seedItems.filter((item) => item.choice === r.seed)[0].name
    }

    const seedInfo = seedItems.filter((item) => item.name === iSeed)[0]

    // 判断选中的 seed 是否已经安装
    if (!seedInfo.installed) {
      logger.setProgress('start')
      logger && logger.log('info', [`${Lang.INIT.SEED_INSTALLING}: ${chalk.green(iSeed)}`])
      const isYYPkg = seedInfo.name.match(REG_IS_YY_PKG)

      await task
        .install([`${seedInfo.name} ${isYYPkg ? REGISTRY_OPTION : ''}`], {
          env,
          silent: true,
          logger
        })
        .catch((er) => {
          logger.setProgress('finished', 'error', [er])
          throw er
        })
      logger && logger.log('success', [`${Lang.INIT.SEED_INSTALLED}: ${chalk.green(iSeed)}`])
      logger.setProgress('finished')
    }

    const seedConfig = await localConfig.get()
    const iSeedConfig = seedConfig.seedMap[iSeed]

    logger.setProgress('start')
    logger && logger.log('info', [`${Lang.INIT.SEED_LOADING}: ${chalk.green(iSeed)}`])

    if (!iSeedConfig) {
      logger && logger.log('error', [`${Lang.INIT.SEED_MAP_NOT_EXISTS}: ${iSeed}`])
      logger.setProgress('finished')
      return
    }

    logger &&
      logger.log('info', [`${Lang.INIT.SEED_MAIN_PRINT}: ${chalk.yellow(iSeedConfig.main)}`])

    if (!fs.existsSync(iSeedConfig.main)) {
      logger && logger.log('error', [`${Lang.INIT.SEED_MAP_MAIN_NOT_EXISTS}: ${iSeed}`])
      logger.setProgress('finished')
      return
    }

    // + 非 dev seed 自动安装 最新版
    if (iSeedConfig.dev || env.force) {
      logger.log('success', [Lang.INIT.SKIP_CHECK_VERSION])
      logger.setProgress('finished')
    } else if (seedInfo.name.match(REG_IS_YY_PKG) && !(await inYY())) {
      // 是 yy pkg 但又不在 yy 域下 跳过
      logger && logger.log('success', [Lang.INIT.SKIP_CHECK_VERSION_CAUSE_NOT_IN_YY])
      logger.setProgress('finished')
    } else {
      logger.log('info', [Lang.INIT.CHECK_VERSION_START])
      let latestVersion
      try {
        latestVersion = await getPkgLatestVersion(iSeedConfig.name)
      } catch (er) {
        logger.log('error', [er])
        logger.setProgress('finished')
        throw er
      }
      if (iSeedConfig.version !== latestVersion) {
        logger.log('info', [Lang.INIT.UPDATE_PKG_VERSION_START])
        await task
          .install([`${iSeedConfig.name}@${latestVersion}`], {
            env,
            silent: true,
            logger
          })
          .catch((er) => {
            logger.log('error', [er])
            logger.setProgress('finished')
            throw er
          })
        logger &&
          logger.log('success', [
            `${Lang.INIT.UPDATE_PKG_VERSION_FINISHED}: ${chalk.green(latestVersion)}`
          ])
        logger.setProgress('finished')
      } else {
        logger &&
          logger.log('success', [`${Lang.INIT.PKG_IS_LATEST}: ${chalk.green(latestVersion)}`])
        logger.setProgress('finished')
      }
    }
    // - 非 dev seed 自动安装 最新版

    const iSeedPack = require(iSeedConfig.main) as InitMeSeed.Config

    logger.log('success', [Lang.INIT.SEED_LOAD_FINISHED])

    // 启动前 hooks
    if (iSeedPack.hooks && iSeedPack.hooks.beforeStart) {
      logger.log('info', [Lang.INIT.HOOKS_BEFORE_START_RUN])
      await iSeedPack.hooks.beforeStart({ env, targetPath }).catch((er: Error) => {
        logger.log('error', [er])
      })
      logger.log('info', [Lang.INIT.HOOKS_BEFORE_START_FINISHED])
    }

    // 准备需要复制的文件
    if (!iSeedPack.path) {
      logger &&
        logger.log('error', [`${Lang.INIT.SEED_COPY_PATH_UNDEFINED}: ${chalk.green(iSeed)}`])
      return
    }
    let fileMap: InitMeSeedFileMap = {}
    const seedSourcePath = path.resolve(path.dirname(iSeedConfig.main), iSeedPack.path)

    logger &&
      logger.log('info', [`${Lang.INIT.SEED_COPY_PATH_PRINT}: ${chalk.yellow(seedSourcePath)}`])

    if (!fs.existsSync(seedSourcePath)) {
      logger &&
        logger.log('error', [
          `${Lang.INIT.SEED_COPY_PATH_NOT_EXISTS}: ${chalk.yellow(seedSourcePath)}`
        ])
      return
    }

    let files = []
    try {
      files = await extFs.readFilePaths(seedSourcePath)
    } catch (er) {
      throw er
    }

    files.forEach((iPath) => {
      fileMap[iPath] = [path.resolve(targetPath, path.relative(seedSourcePath, iPath))]
    })

    // 复制前 hooks
    if (iSeedPack.hooks && iSeedPack.hooks.beforeCopy) {
      logger.log('info', [Lang.INIT.HOOKS_BEFORE_COPY_RUN])
      let rMap
      try {
        rMap = await iSeedPack.hooks.beforeCopy({
          fileMap,
          env,
          targetPath,
          logger
        })
      } catch (er) {
        throw er
      }
      if (typeof rMap === 'object') {
        // eslint-disable-next-line require-atomic-updates
        fileMap = rMap
      }

      logger.log('info', [Lang.INIT.HOOKS_BEFORE_COPY_FINISHED])
    }

    logger.log('info', [`${Lang.INIT.SEED_COPY_MAP_PRINT}:`])
    Object.keys(fileMap).forEach((iPath) => {
      logger &&
        logger.log('info', [`${chalk.yellow(iPath)} => ${chalk.green(fileMap[iPath].join(','))}`])
    })

    // 复制
    let iLog
    try {
      iLog = await extFs.copyFiles(fileMap)
    } catch (er) {
      throw er
    }

    iLog.add.forEach((iPath) => {
      logger.log('add', [iPath])
    })

    iLog.update.forEach((iPath) => {
      logger.log('update', [iPath])
    })

    // 复制后 hooks
    if (iSeedPack.hooks && iSeedPack.hooks.afterCopy) {
      logger.log('info', [Lang.INIT.HOOKS_AFTER_COPY_RUN])
      await iSeedPack.hooks.afterCopy({ fileMap, env, targetPath, logger }).catch((er: Error) => {
        throw er
      })
      logger.log('info', [Lang.INIT.HOOKS_AFTER_COPY_FINISHED])
    }

    if (!inset) {
      logger.log('success', [Lang.INIT.FINISHED])
    }
  },
  async install(names: string[], op: TaskOption & { silent?: boolean }) {
    const { silent } = op
    const { env, logger } = formatTaskOption(op)
    if (!silent) {
      logger.log('info', [Lang.INSTALL.START])
    }

    if (!fs.existsSync(CONFIG_PLUGIN_PATH)) {
      await extFs.mkdirSync(CONFIG_PLUGIN_PATH).catch((er) => {
        throw er
      })
      await task.reset({ env, silent, logger }).catch((er) => {
        throw er
      })
    }

    await extOs
      .runSpawn(
        `npm install ${names.join(' ')} --save ${env.silent ? '--silent' : ''}`,
        CONFIG_PLUGIN_PATH,
        (msg) => {
          logger.log('info', [msg.toString()])
        }
      )
      .catch((er) => {
        throw er
      })

    await localConfig.updateSeedInfo().catch((er) => {
      throw er
    })

    if (!silent) {
      logger.log('success', [Lang.INSTALL.FINISHED])
    }
  },
  async uninstall(names: string[], op: TaskOption) {
    const { env, logger } = formatTaskOption(op)
    logger.log('info', [Lang.UNINSTALL.START])

    await extOs
      .runSpawn(
        `npm uninstall ${names.join(' ')} --save ${env.silent ? '--silent' : ''}`,
        CONFIG_PLUGIN_PATH,
        (msg) => {
          logger.log('info', [msg.toString()])
        }
      )
      .catch((er) => {
        throw er
      })

    await localConfig.updateSeedInfo().catch((er) => {
      throw er
    })

    logger.log('success', [Lang.UNINSTALL.FINISHED])
  },

  async list(op: TaskOption) {
    const { env, logger } = formatTaskOption(op)
    let iPkg: InitMeSeedConfig
    try {
      iPkg = await localConfig.get()
    } catch (er) {
      throw er
    }

    let keys: string[] = []
    if (typeof iPkg.seedMap === 'object') {
      keys = Object.keys(iPkg.seedMap)
    }
    if (keys.length) {
      const logs = []

      const pkgs: InitMeSeedObj[] = []
      const locals: InitMeSeedObj[] = []
      keys.forEach((key) => {
        const info = iPkg.seedMap[key]
        info.name = key
        if (info.dev) {
          locals.push(info)
        } else {
          pkgs.push(info)
        }
      })

      if (pkgs.length) {
        logs.push('')
        logs.push(`${chalk.cyan(Lang.LIST.PKG_LIST)}:`)
        pkgs.forEach((info) => {
          logs.push(`  ${chalk.green(info.name)} : ${chalk.yellow(info.version)}`)
        })
      }

      if (locals.length) {
        logs.push('')
        logs.push(`${chalk.cyan(Lang.LIST.LOCAL_LIST)}:`)
        locals.forEach((info) => {
          logs.push(`  ${chalk.green(info.name)}(${info.version}) : ${chalk.yellow(info.main)}`)
        })
      }

      logs.push('')
      if (!env.silent) {
        console.log(logs.join('\r\n'))
      }
      return iPkg.seedMap
    } else {
      if (!env.silent) {
        console.log(`  ${Lang.LIST.BLANK}`)
      }
      return {}
    }
  },
  async reset(op: TaskOption & { silent?: boolean }) {
    const { env, logger } = formatTaskOption(op)
    logger.setProgress('start')
    logger.log('info', [Lang.RESET.START])
    await localConfig.reset().catch((er) => {
      logger.log('error', [er])
      logger.setProgress('finished')
      throw er
    })
    logger.log('success', [Lang.RESET.FINISHED])
    logger.setProgress('finished')
  },

  async link(op: TaskOption & { targetPath: string }) {
    const { targetPath } = op
    const { env, logger } = formatTaskOption(op)
    logger.log('info', [Lang.LINK.START])
    const pkgPath = path.join(targetPath, 'package.json')
    if (!fs.existsSync(pkgPath)) {
      logger.log('error', [Lang.LINK.PKG_NOT_FOUND])
      return
    }
    const pkg = require(pkgPath)

    if (!pkg.name) {
      logger.log('error', [Lang.LINK.PKG_NAME_IS_BLANK])
      return
    }

    if (!pkg.version) {
      logger.log('error', [Lang.LINK.PKG_VERSION_IS_BLANK])
      return
    }

    if (!pkg.main) {
      logger.log('error', [Lang.LINK.PKG_ENTRY_IS_BLANK])
      return
    }

    const entryPath = path.resolve(targetPath, pkg.main)

    if (!fs.existsSync(entryPath)) {
      logger && logger.log('error', [`${Lang.LINK.PKG_ENTRY_NOT_EXISTS}: ${entryPath}`])
      return
    }

    await localConfig
      .addlocalSeed(pkg.name, {
        main: entryPath,
        name: pkg.name,
        version: pkg.version,
        dev: true
      })
      .catch((er) => {
        throw er
      })

    logger.log('success', [`${Lang.LINK.FINISHED}: ${pkg.name}`])
  },
  async unlink(op: TaskOption & { targetPath: string }) {
    const { targetPath } = op
    const { env, logger } = formatTaskOption(op)
    logger.log('info', [Lang.UNLINK.START])
    const pkgPath = path.join(targetPath, 'package.json')
    if (!fs.existsSync(pkgPath)) {
      logger.log('error', [Lang.UNLINK.PKG_NOT_FOUND])
      return
    }
    const pkg = require(pkgPath)

    if (!pkg.name) {
      logger.log('error', [Lang.UNLINK.PKG_NAME_IS_BLANK])
      return
    }

    await localConfig.removeLocalSeed(pkg.name).catch((er) => {
      throw er
    })

    logger.log('success', [`${Lang.UNLINK.FINISHED}: ${pkg.name}`])
  },
  async recommend(op: TaskOption) {
    let { env, logger } = op
    if (!logger) {
      logger = blankLogger
    }
    if (env.silent) {
      logger.setLogLevel(0)
    }
    const keyword = 'init-me-seed-'
    const IN_YY = await inYY()
    logger.log('info', [Lang.RECOMMEND.SEARCH_NPM_START])

    let r1
    try {
      r1 = await searchNpm(keyword)
    } catch (er) {
      throw er
    }

    let r2: NpmSearchLogItem[] = []
    if (IN_YY) {
      try {
        r2 = await searchYyNpm(keyword)
      } catch (er) {
        throw er
      }
    }
    logger.log('success', [Lang.RECOMMEND.SEARCH_NPM_FINISHED])

    const { seedMap } = await localConfig.get()

    const r = r1.concat(r2)

    r.forEach((item) => {
      if (seedMap[item.name]) {
        item.installed = '1'
      }
    })

    if (!env.silent) {
      const logArr = ['']
      if (r.length) {
        logArr.push(` ${chalk.yellow(Lang.RECOMMEND.TITLE)}:`)
        r.forEach((item) => {
          const name = (() => {
            let color = chalk.green
            let vColor = chalk.yellow
            if (item.installed) {
              color = chalk.gray
              vColor = chalk.gray
            }
            return item.version
              ? `${color(item.name)}${vColor(`@${item.version}`)}`
              : color(item.name)
          })()
          logArr.push(` ${chalk.gray('*')} ${name}`)
        })
      } else {
        logArr.push(` ${Lang.RECOMMEND.RESULT_BLANK}`)
      }
      logArr.push('')

      console.log(logArr.join('\r\n'))
    }
    return r
  },
  fn: {}
}
