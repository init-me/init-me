import { projcetToSeed } from './projectToSeed'
import { cmdLogger } from './cmdLogger'
import chalk from 'chalk'
import fs from 'fs'
import path from 'path'
interface SyncSeedsToProjectOptions {
  context: string
  dirPrefix: string
  fromDir: string
  toDir: string
}
/** 同步外面的 seed 项目到 项目中指定的目录内 */
export async function syncSeedsToProject(op: SyncSeedsToProjectOptions) {
  const { dirPrefix, fromDir, toDir, context } = op
  const seedPrefix = dirPrefix
  const seedParams = fs
    .readdirSync(path.join(context, fromDir))
    .filter((dirname) => {
      return dirname.startsWith(seedPrefix)
    })
    .map((dirname) => {
      const nextDirname = dirname.replace(seedPrefix, '')
      const from = path.join(context, '../', dirname)
      return {
        name: nextDirname,
        context,
        from,
        to: path.join(path.resolve(context, toDir), nextDirname)
      }
    })

  cmdLogger.log('info', [
    `开始初始化项目中 ${chalk.cyan('seed')} 文件, 共 ${chalk.green(seedParams.length)} 个种子文件: ${seedParams.map(({ name }) => chalk.green(name)).join(', ')}`
  ])

  const pms: Promise<string[]>[] = []
  seedParams.forEach((params) => {
    pms.push(
      projcetToSeed({
        ...params,
        logger: cmdLogger
      })
    )
  })
  Promise.all(pms).then(() => {
    cmdLogger.log('success', ['初始化项目中 seed 文件完成'])
  })
}
