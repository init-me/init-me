const extOs = require('yyl-os');
const print = require('yyl-print');
const extRequest = require('yyl-request');
const LANG = require('../lang/index');

const REG_IS_YY_PKG = /^@yy/;
const REGISTRY_OPTION = '--registry=https://npm-registry.yy.com'

async function getPkgLatestVersion(pkgName) {
  let r = '';
  try {
    r = await extOs.runCMD(`npm view ${pkgName} version ${REG_IS_YY_PKG? REGISTRY_OPTION : ''}`, __dirname, false);
  } catch (er) {
    throw er;
  }
  return r.replace(/[\r\n]/g, '');
}

async function inYY() {
  const [, res] = await extRequest.get('http://fet.yy.com');
  return res.statusCode === 200;
}

async function searchNpm(key) {
  const cmd = `npm search ${key}`;
  let npmLogStr = '';

  try {
    npmLogStr = await extOs.runCMD(cmd, __dirname, false);
  } catch (er) {
    throw new Error(LANG.SEARCH.NPM_SEARCH_ERROR);
  }
  function parseLog(ctx) {
    let keys = [];
    const items = [];
    const r = [];

    ctx.split(/[\r\n]+/).forEach((str, i) => {
      const strArr = print.fn.decolor(str.trim()).split(/\s*\|\s*/);
      if (i === 0) {
        keys = strArr.map((str) => str.toLowerCase());
      } else {
        items.push(strArr);
      }
    });
    items.forEach((strArr) => {
      if (strArr.length === keys.length) {
        const iItem = {};
        strArr.forEach((str, i) => {
          iItem[keys[i]] = str;
        });

        // 第二行 而非新增
        if (iItem.date === '' && iItem.version === '') {
          const preItem = r[r.length - 1];
          Object.keys(preItem).forEach((key) => {
            preItem[key] = `${preItem[key]}${iItem[key]}`;
          });
        } else {
          r.push(iItem);
        }
      }
    });
    return r;
  }
  return parseLog(npmLogStr);
}

async function searchYyNpm(key) {
  const [, res, body] = await extRequest.get(`https://npm.yy.com/browse/keyword/${key}?type=json`);
  let r = [];
  if (!res || res.statusCode !== 200) {
    return r;
  }

  const data = JSON.parse(body) || {};

  r = data.packages || [];

  // await util.forEach(r, async (item) => {
  //   item.version = await getPkgLatestVersion(item.name)
  // })

  // 匹配
  return r;
}

async function listSeed () {
  const IN_YY = await inYY();
  let npmSeeds = [];
  try {
    npmSeeds = await searchNpm('init-me-seed-');
  } catch (er) {
    throw er;
  }
  let yySeeds = [];
  if (IN_YY) {
    try {
      yySeeds = await searchYyNpm('init-me-seed-');
    } catch (er) {
      er;
    }
  }

  return npmSeeds.concat(yySeeds).map((item) => item.name);
}

module.exports = {
  inYY,
  searchNpm,
  searchYyNpm,
  getPkgLatestVersion,
  listSeed,
  REG_IS_YY_PKG,
  REGISTRY_OPTION
};