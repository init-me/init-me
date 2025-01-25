import { InitMeSeed } from 'init-me-seed-types'
import inquirer, { QuestionCollection } from 'inquirer'
import fs from 'fs'
import path from 'path'
import extOs from 'yyl-os'
import { replacer } from './replacer'
const lang = {
  QUEATION_SELECT_TYPE: '请选择构建方式',
  QUESTION_NAME: '项目名称',
  QUESTION_COMPONENT_NAME: '组件文件夹名称',

  TYPE_ERROR: 'env.type 不存在',

  FORMAT_FILE_START: '正在格式化文件',
  FORMAT_FILE_FINISHED: '格式化文件 完成',

  NPM_INSTALL_START: '正在安装依赖',
  NPM_INSTALL_FINISHED: '安装依赖 完成',
  PRETTIER_START: '正在格式化代码',
  PRETTIER_FINISHED: '格式化完成',
  BUILD_START: '开始首次构建',
  BUILD_FINISHED: '构建完成'
}

interface MyInitData extends InitMeSeed.InitData {
  path: string
  name: string
  type: string
}

export function initSeedConfig(op: InitMeSeed.Config) {
  const r: InitMeSeed.Config = {
    path: op.path,
    hooks: {
      async beforeStart({ env, targetPath }) {
        // 初始化数据
        let initData: MyInitData = {
          path: op.path,
          name: '',
          type: ''
        }

        const questions: QuestionCollection[] = []
        // + name
        if (env && env.name) {
          initData.name = env.name
        } else {
          questions.push({
            type: 'input',
            name: 'name',
            default: `@yy/${targetPath.split(/[\\/]/).pop()}`,
            message: `${lang.QUESTION_NAME}:`
          })
        }
        // - name

        // + type
        const types = fs.readdirSync(r.path).filter((iPath) => {
          return !/^\./.test(iPath)
        })
        if (types.length === 1) {
          initData.type = types[0]
        } else {
          if (env && env.type) {
            if (types.indexOf(env.type) !== -1) {
              initData.type = env.type
            } else {
              throw new Error(`${lang.TYPE_ERROR}: ${env.type}`)
            }
          } else {
            questions.push({
              type: 'list',
              name: 'type',
              message: `${lang.QUEATION_SELECT_TYPE}:`,
              default: types[0],
              choices: types
            })
          }
        }
        // - type

        if (questions.length) {
          const r = await inquirer.prompt(questions)
          if (r.name) {
            initData = Object.assign(initData, r)
          }
        }

        initData.path = path.join(r.path, initData.type)

        // 对接hooks
        if (op.hooks?.beforeStart) {
          initData = {
            ...initData,
            ...(await op.hooks?.beforeStart({
              initData,
              env,
              targetPath: initData.path
            }))
          }
        }

        return initData
      },

      /**
       * 复制操作前 hooks
       * 可以在此执行重命名，调整模板路径操作
       * @param  op.fileMap   : {[oriPath: string]: string[]} 复制操作映射表
       * @param  op.targetPath: string 复制目标路径 cwd
       * @param  op.env       : {[argv: string]: string} cmd 参数
       * @return Promise<fileMap>
       * beforeCopy({fileMap, targetPath})
       */
      async beforeCopy({ fileMap, targetPath, initData, logger, env }) {
        const renameMap: Record<string, string> = {
          [path.join(initData.path, 'gitignore')]: path.join(targetPath, '.gitignore'),
          [path.join(initData.path, 'npmignore')]: path.join(targetPath, '.npmignore')
        }
        Object.entries(renameMap).forEach(([ori, tar]) => {
          if (fs.existsSync(ori)) {
            fileMap[ori] = [tar]
            if (initData.path) {
              logger.log('rename', [
                `重命名: ${path.relative(initData.path, ori)} -> ${path.relative(initData.path, tar)}`
              ])
            }
          }
        })

        // 对接hooks
        if (op.hooks?.beforeCopy) {
          return await op.hooks?.beforeCopy({ fileMap, targetPath, initData, logger, env })
        } else {
          return fileMap
        }
      },

      async afterCopy({ targetPath, logger, initData, env, fileMap }) {
        // + format
        logger.log('info', [lang.FORMAT_FILE_START])
        const rPaths = [path.join(targetPath, 'package.json'), path.join(targetPath, 'README.md')]
        rPaths.forEach((iPath) => {
          const cnt = fs.readFileSync(iPath).toString()
          fs.writeFileSync(iPath, replacer.dataRender(cnt, initData))
          logger.log('update', [iPath])
        })
        await new Promise((resolve) => {
          setTimeout(resolve)
        })

        // 对接hooks
        if (op.hooks?.afterCopy) {
          await op.hooks.afterCopy({ targetPath, logger, initData, env, fileMap })
        }

        // 最后再 install
        logger.log('info', [lang.NPM_INSTALL_START])
        logger.log('info', [lang.NPM_INSTALL_START])
        const yarnVersion = await extOs.getYarnVersion()
        if (yarnVersion) {
          await extOs.runCMD('yarn install', targetPath)
        } else {
          await extOs.runCMD('npm install', targetPath)
        }
        logger.log('success', [lang.NPM_INSTALL_FINISHED])
        logger.log('info', [lang.PRETTIER_START])
        await extOs.runCMD('npm run prettier', targetPath)
        logger.log('success', [lang.PRETTIER_FINISHED])
        logger.log('info', [lang.BUILD_START])
        await extOs.runCMD('npm run d', targetPath)
        logger.log('success', [lang.BUILD_FINISHED])
        // - format
      }
    }
  }
  return r
}
