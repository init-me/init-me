import path from 'path'
import extFs from 'yyl-fs'
import fs from 'fs'
import { InitMeSeed } from 'init-me-seed-types'
import chalk from 'chalk'
interface ProjectToSeedOptions {
  /** 执行函数的 cwd */
  context: string
  /** 待转化成 seed 的项目根目录 */
  from: string[] | string
  /** 转化后的 seed 的存放目录 */
  to: string
  logger: InitMeSeed.Logger
}
/**
 * 将 project 转化成 seed 项目
 * @param op 转化参数
 * @param op.context {string} 执行函数的 cwd
 * @param op.from {string[] | string} 待转化成 seed 的项目根目录
 * @param op.to {string} 转化后的 seed 的存放目录
 * @returns Promise<string[]> 转化后的 seed 文件列表
 */
export async function projcetToSeed(op: ProjectToSeedOptions) {
  const { context, from, to, logger } = op
  const formDirs = (Array.isArray(from) ? from : [from]).map((dir) => path.resolve(context, dir))
  const toDir = path.resolve(context, to)
  if (!fs.existsSync(toDir)) {
    fs.mkdirSync(toDir, { recursive: true })
    logger.log('info', [`创建目录: ${path.relative(context, toDir)}`])
  }
  let r: string[] = []
  for (let i = 0; i < formDirs.length; i++) {
    const from = formDirs[i]
    const rLogs = await extFs.copyFiles(from, [toDir], (iPath) => {
      const relativePath = path.relative(context, iPath)
      if (/node_modules|output/.test(relativePath)) {
        logger.log('info', [`忽略文件: ${chalk.cyan(relativePath)}`])
        return false
      } else {
        return true
      }
    })
    r = r.concat(rLogs.add.concat(rLogs.update))
  }
  logger.log('info', [`拷贝完成，共拷贝了 ${chalk.green(r.length)} 个文件`])

  // 需要改名的一些文件
  const renameMap = {
    '.npmignore': 'npmignore',
    '.gitignore': 'gitignore'
  }
  Object.entries(renameMap).forEach(([from, to]) => {
    const fromPath = path.resolve(toDir, from)
    if (fs.existsSync(fromPath)) {
      const toPath = path.resolve(toDir, to)
      fs.renameSync(fromPath, toPath)

      // 文件同步更新
      r.forEach((iPath, i) => {
        if (path.resolve(iPath) === fromPath) {
          r[i] = toPath
        }
      })

      logger.log('info', [
        `重命名文件: ${chalk.cyan(path.relative(context, fromPath))} -> ${chalk.yellow(path.relative(context, toPath))}`
      ])
    }
  })

  // 删减 package.json 中无效的字段
  const packageJsonPath = path.resolve(toDir, 'package.json')
  if (fs.existsSync(packageJsonPath)) {
    const pkg = require(packageJsonPath)
    delete pkg.privite
    pkg.name = '__data(name)'
    logger.log('info', [`初始化pkg文件: ${chalk.cyan(path.relative(context, packageJsonPath))}`])
  }
  return r
}
