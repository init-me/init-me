import { projcetToSeed, cmdLogger } from 'init-me-helper'
import path from 'path'
/**
 * 如果seed文件丢放在项目外部，需要初始化项目中 seed 文件把文件拷回来，请取消注释以下代码
 * 
const context = __dirname
const seedParams = ['../seed-node-base'].map((iPath) => {
  const dirname = path.basename(iPath).replace(/^seed-node-/, '')
  return {
    context,
    from: iPath,
    to: `./seeds/${dirname}`
  }
})
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
