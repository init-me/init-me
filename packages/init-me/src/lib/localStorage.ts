import fs from 'fs'
import path from 'path'
import util from 'yyl-util'
import extFs from 'yyl-fs'

export const USERPROFILE = process.env[process.platform === 'win32' ? 'USERPROFILE' : 'HOME'] || ''
export const CONFIG_PATH = path.join(USERPROFILE, '.init-me')

export interface AnyObj {
  [key: string]: any
}

export class LocalStorage<D extends AnyObj = AnyObj> {
  private name: string = ''
  savePath: string = ''
  private defaultData: D
  private data: D
  constructor(name: string, data: D) {
    const savePath = path.join(CONFIG_PATH, `${name}.json`)
    let iData = data || {}

    this.name = name
    this.savePath = savePath
    this.defaultData = data
    this.data = data
    if (fs.existsSync(savePath)) {
      try {
        iData = require(savePath)
      } catch (er) {
        iData = data || {}
        fs.writeFileSync(savePath, JSON.stringify(iData, null, 2))
      }
    } else {
      extFs.mkdirSync(path.dirname(savePath))
      fs.writeFileSync(savePath, JSON.stringify(data, null, 2))
    }
  }

  async get() {
    if (fs.existsSync(this.savePath)) {
      await new Promise((resolve, reject) => {
        fs.readFile(this.savePath, (err, data) => {
          if (!err) {
            try {
              this.data = JSON.parse(data.toString())
            } catch (er) {
              this.data = this.defaultData
            }
          }
          resolve(undefined)
        })
      })
    }
    return Promise.resolve(this.data)
  }

  async set<ID extends D>(data: ID) {
    this.data = data
    await util.makeAwait((next) => {
      fs.writeFile(this.savePath, JSON.stringify(this.data, null, 2), () => {
        next()
      })
    })
    return this.data
  }
}
