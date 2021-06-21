/* eslint-disable no-useless-catch */
const extOs = require('yyl-os')
const axios = require('axios')
const LANG = require('../lang/index')
const decolor = require('./decolor')

const REG_IS_YY_PKG = /^@yy/
const REGISTRY_OPTION = '--registry=https://npm-registry.yy.com'

async function getPkgLatestVersion(pkgName) {
  let r = ''
  try {
    const isYYSeed = pkgName.match(REG_IS_YY_PKG)

    if (isYYSeed && !(await inYY())) {
      return ''
    }
    r = await extOs.runCMD(
      `npm view ${pkgName} version ${isYYSeed ? REGISTRY_OPTION : ''}`,
      __dirname,
      false
    )
  } catch (er) {
    throw er
  }
  return r.replace(/[\r\n]/g, '')
}

async function inYY() {
  try {
    const rs = await axios.get('http://fet.yy.com', {
      timeout: 2000
    })
    // const [, res] = await extRequest.get()
    return rs.status === 200
  } catch (er) {
    return false
  }
}

async function searchNpm(key) {
  const cmd = `npm search ${key}`
  let npmLogStr = ''

  try {
    npmLogStr = await extOs.runCMD(cmd, __dirname, false)
  } catch (er) {
    throw new Error(LANG.SEARCH.NPM_SEARCH_ERROR)
  }
  function parseLog(ctx) {
    let keys = []
    const items = []
    const r = []

    ctx.split(/[\r\n]+/).forEach((str, i) => {
      const strArr = decolor(str.trim()).split(/\s*\|\s*/)
      if (i === 0) {
        keys = strArr.map((str) => str.toLowerCase())
      } else {
        items.push(strArr)
      }
    })
    items.forEach((strArr) => {
      if (strArr.length === keys.length) {
        const iItem = {}
        strArr.forEach((str, i) => {
          iItem[keys[i]] = str
        })

        // 第二行 而非新增
        if (iItem.date === '' && iItem.version === '') {
          const preItem = r[r.length - 1]
          Object.keys(preItem).forEach((key) => {
            preItem[key] = `${preItem[key]}${iItem[key]}`
          })
        } else {
          r.push(iItem)
        }
      }
    })
    return r
  }
  return parseLog(npmLogStr)
}

async function searchYyNpm(key) {
  try {
    const rs = await axios.get(
      `https://npm.yy.com/browse/keyword/${key}?type=json`,
      {
        timeout: 8000
      }
    )
    let r = []
    if (!rs || rs.status !== 200) {
      return r
    }

    const data = rs.data || {}

    r = data.packages || []

    // await util.forEach(r, async (item) => {
    //   item.version = await getPkgLatestVersion(item.name)
    // })

    // 匹配
    return r
  } catch (er) {
    return []
  }
}

async function listSeed() {
  const IN_YY = await inYY()
  let npmSeeds = []
  try {
    npmSeeds = await searchNpm('init-me-seed-')
  } catch (er) {
    throw er
  }
  let yySeeds = []
  if (IN_YY) {
    try {
      yySeeds = await searchYyNpm('init-me-seed-')
    } catch (er) {
      er
    }
  }
  let r = npmSeeds.concat(yySeeds).map((item) => item.name)

  r = Array.from(new Set(r))

  return r
}

module.exports = {
  inYY,
  searchNpm,
  searchYyNpm,
  getPkgLatestVersion,
  listSeed,
  REG_IS_YY_PKG,
  REGISTRY_OPTION
}
