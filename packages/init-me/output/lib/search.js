"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listSeed = exports.searchYyNpm = exports.searchNpm = exports.getPkgLatestVersion = exports.inYY = exports.REGISTRY_OPTION = exports.REG_IS_YY_PKG = void 0;
/* eslint-disable no-useless-catch */
const yyl_os_1 = __importDefault(require("yyl-os"));
const axios_1 = __importDefault(require("axios"));
const index_1 = require("../lang/index");
const decolor_1 = require("./decolor");
exports.REG_IS_YY_PKG = /^@yy/;
exports.REGISTRY_OPTION = '--registry=https://npm-registry.yy.com';
function inYY() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const rs = yield axios_1.default.get('http://fet.yy.com', {
                timeout: 2000
            });
            // const [, res] = await extRequest.get()
            return rs.status === 200;
        }
        catch (er) {
            return false;
        }
    });
}
exports.inYY = inYY;
function getPkgLatestVersion(pkgName) {
    return __awaiter(this, void 0, void 0, function* () {
        let r = '';
        try {
            const isYYSeed = pkgName.match(exports.REG_IS_YY_PKG);
            if (isYYSeed && !(yield inYY())) {
                return '';
            }
            r = yield yyl_os_1.default.runCMD(`npm view ${pkgName} version ${isYYSeed ? exports.REGISTRY_OPTION : ''}`, __dirname, false);
        }
        catch (er) {
            throw er;
        }
        return r.replace(/[\r\n]/g, '');
    });
}
exports.getPkgLatestVersion = getPkgLatestVersion;
function searchNpm(key) {
    return __awaiter(this, void 0, void 0, function* () {
        const cmd = `npm search ${key}`;
        let npmLogStr = '';
        try {
            npmLogStr = yield yyl_os_1.default.runCMD(cmd, __dirname, false);
        }
        catch (er) {
            throw new Error(index_1.Lang.SEARCH.NPM_SEARCH_ERROR);
        }
        function parseLog(ctx) {
            let keys = [];
            const items = [];
            const r = [];
            ctx.split(/[\r\n]+/).forEach((str, i) => {
                const strArr = (0, decolor_1.decolor)(str.trim()).split(/\s*\|\s*/);
                if (i === 0) {
                    keys = strArr.map((str) => str.toLowerCase());
                }
                else {
                    items.push(strArr);
                }
            });
            items.forEach((strArr) => {
                if (strArr.length === keys.length) {
                    const iItem = {
                        date: '',
                        version: '',
                        name: ''
                    };
                    strArr.forEach((str, i) => {
                        iItem[keys[i]] = str;
                    });
                    // 第二行 而非新增
                    if (iItem.date === '' && iItem.version === '') {
                        const preItem = r[r.length - 1];
                        Object.keys(preItem).forEach((key) => {
                            preItem[key] = `${preItem[key]}${iItem[key]}`;
                        });
                    }
                    else {
                        r.push(iItem);
                    }
                }
            });
            return r;
        }
        return parseLog(npmLogStr);
    });
}
exports.searchNpm = searchNpm;
function searchYyNpm(key) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const rs = yield axios_1.default.get(`https://npm.yy.com/browse/keyword/${key}?type=json`, {
                timeout: 8000
            });
            let r = [];
            if (!rs || rs.status !== 200) {
                return r;
            }
            const data = rs.data || {};
            r = data.packages || [];
            // 匹配
            return r;
        }
        catch (er) {
            return [];
        }
    });
}
exports.searchYyNpm = searchYyNpm;
function listSeed() {
    return __awaiter(this, void 0, void 0, function* () {
        const IN_YY = yield inYY();
        let npmSeeds = [];
        try {
            npmSeeds = yield searchNpm('init-me-seed-');
        }
        catch (er) {
            throw er;
        }
        let yySeeds = [];
        if (IN_YY) {
            try {
                yySeeds = yield searchYyNpm('init-me-seed-');
            }
            catch (er) { }
        }
        let r = npmSeeds.concat(yySeeds).map((item) => item.name);
        r = Array.from(new Set(r));
        return r;
    });
}
exports.listSeed = listSeed;
