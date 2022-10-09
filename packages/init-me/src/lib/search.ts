/* eslint-disable no-useless-catch */
import extOs from 'yyl-os'
import axios from 'axios'
import { Lang } from '../lang/index'
import { decolor } from './decolor'

export const REG_IS_YY_PKG = /^@yy/
export const REGISTRY_OPTION = '--registry=https://npm-registry.yy.com'

export async function inYY() {
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

export async function getPkgLatestVersion(pkgName: string) {
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

export type NpmSearchLogKeys = 'date' | 'version'
export interface NpmSearchLogItem {
  date: string
  version: string
  name: string
  install?: string
  [key: string]: string | undefined
}

export async function searchNpm(key: string) {
  const cmd = `npm search ${key}`
  let npmLogStr = ''

  try {
    npmLogStr = await extOs.runCMD(cmd, __dirname, false)
  } catch (er) {
    throw new Error(Lang.SEARCH.NPM_SEARCH_ERROR)
  }
  function parseLog(ctx: string) {
    let keys: NpmSearchLogKeys[] = []
    const items: string[][] = []
    const r: NpmSearchLogItem[] = []

    ctx.split(/[\r\n]+/).forEach((str, i) => {
      const strArr = decolor(str.trim()).split(/\s*\|\s*/)
      if (i === 0) {
        keys = strArr.map((str) => str.toLowerCase()) as NpmSearchLogKeys[]
      } else {
        items.push(strArr)
      }
    })
    items.forEach((strArr) => {
      if (strArr.length === keys.length) {
        const iItem: NpmSearchLogItem = {
          date: '',
          version: '',
          name: ''
        }
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

export async function searchYyNpm(key: string) {
  try {
    const rs = await axios.get(`https://npm.yy.com/browse/keyword/${key}?type=json`, {
      timeout: 8000
    })
    let r: NpmSearchLogItem[] = []
    if (!rs || rs.status !== 200) {
      return r
    }

    const data = rs.data || {}

    r = data.packages || []

    // 匹配
    return r
  } catch (er) {
    return []
  }
}

export async function listSeed() {
  const IN_YY = await inYY()
  let npmSeeds: NpmSearchLogItem[] = []
  try {
    npmSeeds = await searchNpm('init-me-seed-')
  } catch (er) {
    throw er
  }
  let yySeeds: NpmSearchLogItem[] = []
  if (IN_YY) {
    try {
      yySeeds = await searchYyNpm('init-me-seed-')
    } catch (er) {}
  }
  let r = npmSeeds.concat(yySeeds).map((item) => item.name)

  r = Array.from(new Set(r))

  return r
}
