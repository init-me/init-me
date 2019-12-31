const extOs = require('yyl-os');
const print = require('yyl-print');
const extRequest = require('yyl-request');

async function getPkgLatestVersion(pkgName) {
  const r = await extOs.runCMD(`npm view ${pkgName} version`, __dirname, false);
  return r.replace(/[\r\n]/g, '');
}

async function inYY() {
  const [, res] = await extRequest.get('http://fet.yy.com');
  return res.statusCode === 200;
}

async function searchNpm(key) {
  const npmLogStr = await extOs.runCMD(`npm search ${key}`, __dirname, false);
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
  if (res.statusCode !== 200) {
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
  const npmSeeds = await searchNpm('init-me-seed-');
  let yySeeds = [];
  if (IN_YY) {
    yySeeds = await searchYyNpm('init-me-seed-');
  }

  return npmSeeds.concat(yySeeds).map((item) => item.name);
}

module.exports = {
  inYY,
  searchNpm,
  searchYyNpm,
  getPkgLatestVersion,
  listSeed
};