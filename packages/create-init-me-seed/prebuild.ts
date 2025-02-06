import { projcetToSeed, cmdLogger } from 'init-me-helper'
cmdLogger.log('info', ['开始初始化项目中 seed 文件'])
projcetToSeed({
  context: __dirname,
  from: '../create-init-me-seed__base',
  to: './seed',
  logger: cmdLogger
}).then(() => {
  cmdLogger.log('success', ['初始化项目中 seed 文件完成'])
})
