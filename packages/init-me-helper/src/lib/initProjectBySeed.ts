import { InitMeSeed } from 'init-me-seed-types'
import chalk from 'chalk'
import fs from 'fs'
import path from 'path'
import extFs from 'yyl-fs'
const Lang = {
  INIT: {
    SEED_INSTALLING: '正在安装 seed 包',
    SEED_INSTALLED: '安装 seed 包 完成',
    SEED_LOADING: '正在加载 seed 包',
    SEED_LOAD_FINISHED: '加载完成',
    SEED_MAP_NOT_EXISTS: 'seed 配置不存在，请重新安装 seed 包',
    SEED_MAP_MAIN_NOT_EXISTS: 'seed 配置错误，请重新安装 seed 包',
    SEED_COPY_PATH_NOT_EXISTS: 'seed.path 路径不存在，请联系 seed 包作者',
    SEED_COPY_PATH_UNDEFINED: 'seed.path 没有设置，请联系 seed 包作者',
    SEED_READ_PATH_FAIL: '读取 seed 包内容失败，请联系 seed 包作者',
    SEED_COPY_PATH_PRINT: 'seed 待复制原始路径',
    SEED_COPY_MAP_PRINT: 'seed 复制路径映射预览',
    SEED_MAIN_PRINT: 'seed 包路径',
    SEED_COPY_PATH_FAIL: '复制 seed 包内容失败',
    HOOKS_BEFORE_START_RUN: 'hooks.beforeStart 触发',
    HOOKS_BEFORE_START_FINISHED: 'hooks.beforeStart 完成',
    HOOKS_BEFORE_START_FAIL: 'hooks.beforeStart 执行失败',
    HOOKS_BEFORE_COPY_RUN: 'hooks.beforeCopy 触发',
    HOOKS_BEFORE_COPY_FINISHED: 'hooks.beforeCopy 完成',
    HOOKS_BEFORE_COPY_FAIL: 'hooks.beforeCopy 执行失败',
    HOOKS_AFTER_COPY_RUN: 'hooks.afterCopy 触发',
    HOOKS_AFTER_COPY_FINISHED: 'hooks.afterCopy 完成',
    HOOKS_AFTER_COPY_FAIL: 'hooks.afterCopy 执行失败'
  }
}

interface InitProjectBySeedOption {
  /** seed 配置 */
  config: InitMeSeed.Config
  /** 环境变量 */
  env: InitMeSeed.Env
  /** 需要进行初始化的项目根目录 */
  targetPath: string
  /** 日志句柄 */
  logger: InitMeSeed.Logger
}
/**
 * 根据seed配置初始化项目
 */
export async function initProjectBySeed(options: InitProjectBySeedOption) {
  const { config, env, logger, targetPath } = options
  const result = {
    errMsg: ''
  }

  const handleError = (errMsg: string) => {
    result.errMsg = errMsg
    logger.log('error', [errMsg])
    return result
  }

  let initData: InitMeSeed.InitData = {}
  // 启动前 hooks
  if (config.hooks && config.hooks.beforeStart) {
    logger.log('info', [Lang.INIT.HOOKS_BEFORE_START_RUN])
    try {
      const r = await config.hooks.beforeStart({ env, targetPath, initData })
      if (r) {
        initData = {
          ...initData,
          ...r
        }
      }
      logger.log('info', [Lang.INIT.HOOKS_BEFORE_START_FINISHED])
    } catch (er: any) {
      return handleError(`${Lang.INIT.HOOKS_BEFORE_START_FAIL}: ${er.message}`)
    }
  }

  // 准备需要复制的文件
  if (!config.path) {
    return handleError(`${Lang.INIT.SEED_COPY_PATH_UNDEFINED}: ${chalk.green(config.path)}`)
  }
  let fileMap: InitMeSeed.FileMap = {}
  logger.log('info', [`${Lang.INIT.SEED_COPY_PATH_PRINT}: ${chalk.yellow(config.path)}`])

  if (!fs.existsSync(config.path)) {
    return handleError(`${Lang.INIT.SEED_COPY_PATH_NOT_EXISTS}: ${chalk.yellow(config.path)}`)
  }

  try {
    const files = await extFs.readFilePaths(config.path)
    files.forEach((iPath) => {
      fileMap[iPath] = [path.resolve(targetPath, path.relative(config.path, iPath))]
    })
  } catch (er: any) {
    return handleError(
      `${Lang.INIT.SEED_READ_PATH_FAIL}: ${chalk.yellow(config.path)} - ${er.message}`
    )
  }

  // 复制前 hooks
  if (config.hooks && config.hooks.beforeCopy) {
    logger.log('info', [Lang.INIT.HOOKS_BEFORE_COPY_RUN])
    try {
      const rMap = await config.hooks.beforeCopy({
        fileMap,
        env,
        targetPath,
        logger,
        initData
      })
      if (typeof rMap === 'object') {
        fileMap = rMap
      }

      logger.log('info', [Lang.INIT.HOOKS_BEFORE_COPY_FINISHED])
    } catch (er: any) {
      return handleError(`${Lang.INIT.HOOKS_BEFORE_COPY_FAIL}: ${er.message}`)
    }
  }

  logger.log('info', [`${Lang.INIT.SEED_COPY_MAP_PRINT}:`])
  Object.keys(fileMap).forEach((iPath) => {
    logger.log('info', [`${chalk.yellow(iPath)} => ${chalk.green(fileMap[iPath].join(','))}`])
  })

  // 复制
  try {
    const iLog = await extFs.copyFiles(fileMap)
    iLog.add.forEach((iPath) => {
      logger.log('add', [iPath])
    })
    iLog.update.forEach((iPath) => {
      logger.log('update', [iPath])
    })
  } catch (er: any) {
    return handleError(`${Lang.INIT.SEED_COPY_PATH_FAIL}: ${er.message}`)
  }

  // 复制后 hooks
  if (config.hooks && config.hooks.afterCopy) {
    logger.log('info', [Lang.INIT.HOOKS_AFTER_COPY_RUN])
    try {
      await config.hooks.afterCopy({ fileMap, env, targetPath, logger, initData })
      logger.log('info', [Lang.INIT.HOOKS_AFTER_COPY_FINISHED])
    } catch (er: any) {
      return handleError(`${Lang.INIT.HOOKS_AFTER_COPY_FAIL}: ${er.message}`)
    }
  }

  return result
}
