const fs = require('fs')
const path = require('path')
const util = require('yyl-util')
const extFs = require('yyl-fs')

const USERPROFILE =
  process.env[process.platform == 'win32' ? 'USERPROFILE' : 'HOME']
const CONFIG_PATH = path.join(USERPROFILE, '.init-me')

class LocalStorage {
  constructor(name, data) {
    const savePath = path.join(CONFIG_PATH, `${name}.json`)
    let iData = data || {}

    if (fs.existsSync(savePath)) {
      try {
        iData = require(savePath)
      } catch (er) {
        iData = data || {}
        fs.writeFileSync(savePath, JSON.stringify(iData, null, 2))
      }
    } else {
      util.makeAsync(async () => {
        await extFs.mkdirSync(path.dirname(savePath))
        await util.makeAwait((next) => {
          fs.writeFile(savePath, JSON.stringify(data, null, 2), () => {
            next()
          })
        })
      })()
    }

    this.name = name
    this.savePath = savePath
    this.defaultData = data
  }
  async get() {
    if (fs.existsSync(this.savePath)) {
      await util.makeAwait((next) => {
        fs.readFile(this.savePath, (err, data) => {
          try {
            this.data = JSON.parse(data.toString())
          } catch (er) {
            this.data = this.defaultData
          }
          next()
        })
      })
    }
    return Promise.resolve(this.data)
  }
  async set(data) {
    this.data = data
    await util.makeAwait((next) => {
      fs.writeFile(this.savePath, JSON.stringify(this.data, null, 2), () => {
        next()
      })
    })
    return this.data
  }
}

module.exports = LocalStorage
