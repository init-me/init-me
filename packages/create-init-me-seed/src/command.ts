import { Command } from 'commander'
import chalk from 'chalk'
import path from 'path'
import util from 'yyl-util'
import fs from 'fs'
import { YylCmdLogger } from 'yyl-cmd-logger'
import { Lang } from './lang'
import { task } from './task/index'
const pkg = require('../package.json')

const cmder = new Command('init-me')

interface AnyObj {
  [key: string]: any
}

const logger = new YylCmdLogger({
  lite: true,
  type: {
    ver: {
      name: 'CIMS',
      shortName: 'C',
      color: chalk.bgBlue.white,
      shortColor: chalk.blue
    }
  }
})

const isPath = function (ctx?: string) {
  if (typeof ctx === 'string') {
    const rPath = path.resolve(process.cwd(), ctx)
    if (fs.existsSync(rPath)) {
      return true
    } else {
      return false
    }
  } else {
    return false
  }
}

let isBlock = false
const env = util.envParse(process.argv)

const fn = {
  printHeader(op: { env: AnyObj }) {
    if (env.silent) {
      return
    }
    logger.log('ver', [`create-init-me-seed ${chalk.yellow.bold(pkg.version)}`])

    let keyIndex = -1
    process.argv.forEach((str, index) => {
      if (str.match(/bin[/\\]cteate-init-me-seed$/)) {
        keyIndex = index
      }
    })
    if (keyIndex !== -1) {
      const cmds = process.argv.slice(keyIndex + 1)
      logger.log('cmd', [`create-init-me-seed ${cmds.join(' ')}`])
    }
  }
}

cmder
  .option('-q, --silent', Lang.DESCRIPTION.SILENT)
  .option('--logLevel <level>', Lang.DESCRIPTION.LOG_LEVEL)

cmder.option('-p, --path', Lang.DESCRIPTION.PATH, () => {
  task.path({ env })
  isBlock = true
})

cmder.option('-v, --version', Lang.DESCRIPTION.VERSION, () => {
  task.version({ env, logger })
  isBlock = true
})

cmder.on('--help', () => {
  console.log(['', 'Examples:', '  $ create-init-me-seed path/to/dir', ''].join('\r\n'))
  isBlock = true
})

cmder.parse(process.argv)

if (!isBlock && (!cmder.args.length || typeof cmder.args[cmder.args.length - 1] !== 'object')) {
  let targetPath = process.cwd()
  if (cmder.args[0]) {
    targetPath = cmder.args[0]
  }
  if (isPath(targetPath)) {
    fn.printHeader({ env })
    task.init(targetPath, { env, logger }).catch((er) => {
      logger.log('error', [er])
    })
  } else {
    cmder.outputHelp()
  }
}
