import path from 'path'
import fs from 'fs'
import extOs from 'yyl-os'
import chalk from 'chalk'
import inquirer, { InputQuestion } from 'inquirer'
import extFs from 'yyl-fs'
import { YylCmdLogger, LogLevel } from 'yyl-cmd-logger'
import { Lang } from '../lang'
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
}

export const task = {
  async init(targetPath: string, op: TaskOption) {
    const { env, logger } = formatOption(op)
    const questions: InputQuestion[] = []
    const pjName = `${targetPath.split(/[\\/]/).pop()}`
    let rData: InitData = {
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
      rData.name = env.name
    }
    if (questions.length) {
      const anwser = await inquirer.prompt<{ name: string }>(questions)
      rData = {
        ...rData,
        ...anwser
      }
    }

    // TODO:
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
