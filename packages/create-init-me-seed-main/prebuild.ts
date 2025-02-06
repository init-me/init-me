/**
 * 如果seed文件丢放在项目外部，需要初始化项目中 seed 文件把文件拷回来，请取消注释以下代码
 *
import { projcetToSeed, cmdLogger } from 'init-me-helper'
import path from 'path'
import fs from 'fs'
const context = __dirname

const seedPrefix = 'init-me-seed-node__'

const seedParams = fs
  .readdirSync(path.join(context, '../'))
  .filter((dirname) => {
    return dirname.startsWith(seedPrefix)
  })
  .map((dirname) => {
    const nextDirname = dirname.replace(seedPrefix, '')
    const from = path.join(context, '../', dirname)
    return {
      context,
      from,
      to: `./seeds/${nextDirname}`
    }
  })

console.log(seedParams)
cmdLogger.log('info', ['开始初始化项目中 seed 文件'])
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
*/
