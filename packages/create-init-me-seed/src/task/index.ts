import path from 'path'
import fs from 'fs'
import extOs from 'yyl-os'
import chalk from 'chalk'
import inquirer, { InputQuestion } from 'inquirer'
import extFs from 'yyl-fs'
import { YylCmdLogger, LogLevel } from 'yyl-cmd-logger'
import { Lang } from '../lang'
import rp from 'yyl-replacer'
const pkg = require('../../package.json')
export interface Env {
  silent?: boolean
  logLevel?: LogLevel
  name?: string
}

const blankLogger: YylCmdLogger = {
  log() {
    return []
  },
  setLogLevel() {},
  setProgress() {}
} as unknown as YylCmdLogger

function formatOption(op?: { env: Env; logger: YylCmdLogger }) {
  const env: Required<Env> = {
    silent: !!op?.env.silent,
    logLevel: op?.env?.logLevel === undefined ? 1 : op.env.logLevel,
    name: op?.env?.name || ''
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

export interface TaskOption {
  env: Env
  logger: YylCmdLogger
}

interface InitData {
  name: string
  [key: string]: string
}

export const task = {
  async init(targetPath: string, op: TaskOption) {
    const { env, logger } = formatOption(op)
    const questions: InputQuestion[] = []
    const pjName = `${targetPath.split(/[\\/]/).pop()}`
    let initData: InitData = {
      name: ''
    }
    if (!env.name) {
      questions.push({
        type: 'input',
        name: 'name',
        default: pjName,
        message: Lang.QUESTION.NAME
      })
    } else {
      initData.name = env.name
    }
    if (questions.length) {
      const anwser = await inquirer.prompt<{ name: string }>(questions)
      initData = {
        ...initData,
        ...anwser
      }
    }

    // 拷贝文件
    logger.log('info', [Lang.INIT.COPY_START])
    const oriPath = path.join(__dirname, '../../seed')
    const logs = await extFs.copyFiles(oriPath, [targetPath])
    logger.log('success', [
      `${Lang.INIT.COPY_FINISHED}(add:${logs.add.length}, update: ${logs.update.length})`
    ])

    logger.log('info', [Lang.INIT.REPLACE_START])
    // pkg 处理
    const pkgPath = path.join(targetPath, 'package.json')
    const targetPkg = require(pkgPath)
    targetPkg.name = initData.name
    targetPkg.dependencies['init-me-seed-types'] = pkg.dependencies['init-me-seed-types']
    fs.writeFileSync(targetPath, JSON.stringify(targetPkg, null, 2))

    // data 替换
    const rPaths = [path.join(targetPath, 'README.md')]
    rPaths.forEach((iPath) => {
      const cnt = fs.readFileSync(iPath).toString()
      fs.writeFileSync(iPath, rp.dataRender(cnt, initData))
      logger.log('update', [iPath])
    })
    logger.log('success', [Lang.INIT.REPLACE_FINISHED])
  },
  version(op: TaskOption) {
    const { env, logger } = formatOption(op)
    if (!env.silent) {
      logger && logger.log('info', [`create-init-me-seed ${chalk.yellow.bold(pkg.version)}`])
    }
    return Promise.resolve(pkg.version)
  },
  path(op: Omit<TaskOption, 'logger'>) {
    const { env } = op
    const r = {
      app: path.join(__dirname, '../')
    }
    if (!env.silent) {
      console.log(['', ' App path:', ` ${chalk.yellow.bold(r.app)}`, ''].join('\r\n'))
      extOs.openPath(r.app)
    }
    return Promise.resolve(r)
  }
}
