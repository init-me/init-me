const extOs = require('yyl-os');
const print = require('yyl-print');
const extRequest = require('yyl-request');
const util = require('yyl-util');

async function getPkgLatestVersion(pkgName) {
  const r = await extOs.runCMD(`npm view ${pkgName} version`, __dirname, false);
  return r.replace(/[\r\n]/g, '');
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
  const [, res, body] = await extRequest.get(`https://npm.yy.com/browse/keyword/${key}`);
  const r = [];
  if (res.statusCode !== 200) {
    return r;
  }

  body.toString()
    .replace(/[\r\n]+/g, '')
    .replace(/class="package-name">([^<]+)<\/a>/ig, (str, $1) => {
      r.push({
        name: $1
      });
    });

  await util.forEach(r, async (item) => {
    item.version = await getPkgLatestVersion(item.name)
  })

  // 匹配
  return r;
}

module.exports = {
  searchNpm,
  searchYyNpm,
  getPkgLatestVersion
};