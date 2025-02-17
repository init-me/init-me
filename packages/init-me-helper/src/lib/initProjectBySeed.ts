import { InitMeSeed } from 'init-me-seed-types'
import chalk from 'chalk'
import fs from 'fs'
import path from 'path'
import extFs from 'yyl-fs'
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
    logger.log('info', ['hooks.beforeStart 触发'])
    try {
      const r = await config.hooks.beforeStart({ env, targetPath, initData })
      if (r) {
        initData = {
          ...initData,
          ...r
        }
      }
      logger.log('info', ['hooks.beforeStart 完成'])
    } catch (er: any) {
      return handleError(`hooks.beforeStart 执行失败: ${er.message}`)
    }
  }

  // 准备需要复制的文件
  if (!config.path) {
    return handleError(`seed.path 没有设置，请联系 seed 包作者: ${chalk.green(config.path)}`)
  }
  let fileMap: InitMeSeed.FileMap = {}
  logger.log('info', [`seed 待复制原始路径: ${chalk.yellow(config.path)}`])

  if (!fs.existsSync(config.path)) {
    return handleError(`seed.path 路径不存在，请联系 seed 包作者: ${chalk.yellow(config.path)}`)
  }

  try {
    const files = await extFs.readFilePaths(config.path)
    files.forEach((iPath) => {
      fileMap[iPath] = [path.resolve(targetPath, path.relative(config.path, iPath))]
    })
  } catch (er: any) {
    return handleError(
      `读取 seed 包内容失败，请联系 seed 包作者: ${chalk.yellow(config.path)} - ${er.message}`
    )
  }

  // 复制前 hooks
  if (config.hooks && config.hooks.beforeCopy) {
    logger.log('info', ['hooks.beforeCopy 触发'])
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

      logger.log('info', ['hooks.beforeCopy 完成'])
    } catch (er: any) {
      return handleError(`hooks.beforeCopy 执行失败: ${er.message}`)
    }
  }

  logger.log('info', [`seed 复制路径映射预览:`])
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
    return handleError(`复制 seed 包内容失败: ${er.message}`)
  }

  // 复制后 hooks
  if (config.hooks && config.hooks.afterCopy) {
    logger.log('info', ['hooks.afterCopy 触发'])
    try {
      await config.hooks.afterCopy({ fileMap, env, targetPath, logger, initData })
      logger.log('info', ['hooks.afterCopy 完成'])
    } catch (er: any) {
      return handleError(`hooks.afterCopy 执行失败: ${er.message}`)
    }
  }

  return result
}
