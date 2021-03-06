const cmder = require('commander')
const { YylCmdLogger } = require('yyl-cmd-logger')
const chalk = require('chalk')
const LANG = require('../lang/index')
const task = require('../task/index')
const pkg = require('../package.json')
const path = require('path')
const util = require('yyl-util')
const fs = require('fs')

const logger = new YylCmdLogger({
  lite: true,
  type: {
    ver: {
      name: 'INIT',
      shortName: 'i',
      color: chalk.bgBlue.white,
      shortColor: chalk.blue
    }
  }
})

const isPath = function (ctx) {
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
  printHeader({ env }) {
    if (env.silent) {
      return
    }
    logger.log('ver', [`init-me ${chalk.yellow.bold(pkg.version)}`])

    let keyIndex = -1
    process.argv.forEach((str, index) => {
      if (str.match(/bin[/\\]init$/)) {
        keyIndex = index
      }
    })
    if (keyIndex != -1) {
      const cmds = process.argv.slice(keyIndex + 1)
      logger.log('cmd', [`init ${cmds.join(' ')}`])
    }
  }
}

cmder.option('-p, --path', LANG.DESCRIPTION.PATH, () => {
  task.path({ env, logger })
  isBlock = true
})

cmder.option('-v, --version', LANG.DESCRIPTION.VERSION, () => {
  task.version({ env, logger })
  isBlock = true
})

cmder
  .option('-q, --silent', LANG.DESCRIPTION.SILENT)
  .option('--seed <name>', LANG.DESCRIPTION.SEED)
  .option('--force', LANG.DESCRIPTION.FORCE)
  .option('--logLevel <level>', LANG.DESCRIPTION.LOG_LEVEL)

cmder
  .command('clear')
  .description(LANG.DESCRIPTION.CLEAR)
  .action(() => {
    fn.printHeader({ env })
    task.clear({ env, logger }).catch((er) => {
      logger.log('error', [er])
    })
    isBlock = true
  })

cmder
  .command('install <pkgName>')
  .alias('i')
  .description(LANG.DESCRIPTION.INSTALL)
  .action((pkgName) => {
    fn.printHeader({ env })
    task.install(pkgName.split(/\s+/), { env, logger }).catch((er) => {
      logger.log('error', [er])
    })
    isBlock = true
  })

cmder
  .command('uninstall <pkgName>')
  .description(LANG.DESCRIPTION.UNINSTALL)
  .action((pkgName) => {
    fn.printHeader({ env })
    task.uninstall(pkgName.split(/\s+/), { env, logger }).catch((er) => {
      logger.log('error', [er])
    })
    isBlock = true
  })

cmder
  .command('reset')
  .description(LANG.DESCRIPTION.RESET)
  .action(() => {
    fn.printHeader({ env })
    task.reset({ env, logger }).catch((er) => {
      logger.log('error', [er])
    })
    isBlock = true
  })

cmder
  .command('recommend')
  .alias('r')
  .description(LANG.DESCRIPTION.RECOMMEND)
  .action(() => {
    task.recommend({ env, logger }).catch((er) => {
      logger.log('error', [er])
    })
    isBlock = true
  })

cmder
  .command('list')
  .description(LANG.DESCRIPTION.LIST)
  .action(() => {
    task.list({ env, logger }).catch((er) => {
      logger.log('error', [er])
    })
    isBlock = true
  })

cmder
  .command('link')
  .description(LANG.DESCRIPTION.LINK)
  .action(() => {
    task
      .link({
        targetPath: process.cwd(),
        env,
        logger
      })
      .catch((er) => {
        logger.log('error', [er])
      })
    isBlock = true
  })

cmder
  .command('unlink')
  .description(LANG.DESCRIPTION.UNLINK)
  .action(() => {
    task
      .unlink({
        targetPath: process.cwd(),
        env,
        logger
      })
      .catch((er) => {
        logger.log('error', [er])
      })
    isBlock = true
  })

cmder.on('--help', () => {
  console.log(
    ['', 'Examples:', '  $ init --logLevel 2', '  $ init path/to/dir', ''].join(
      '\r\n'
    )
  )
  isBlock = true
})

cmder.parse(process.argv)

if (
  !isBlock &&
  (!cmder.args.length || typeof cmder.args[cmder.args.length - 1] !== 'object')
) {
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
