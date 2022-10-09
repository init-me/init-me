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
exports.LocalConfig = exports.pkg = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const localStorage_1 = require("./localStorage");
exports.pkg = require('../../package.json');
const DEFAULT_PKG_CONFIG = {
    name: 'init-me-plugins',
    version: exports.pkg.version,
    description: 'plugin manage',
    license: 'ISC',
    repository: {},
    dependencies: {},
    devDependencies: {}
};
const DEFAULT_CONFIG = {
    seeds: [],
    seedMap: {}
};
const DEFAULT_LOCAL_SEED_CONFIG = {};
class LocalConfig {
    constructor() {
        this.handle = new localStorage_1.LocalStorage('config', DEFAULT_CONFIG);
        this.pkgHandle = new localStorage_1.LocalStorage('plugins/package', DEFAULT_PKG_CONFIG);
        this.seedHandle = new localStorage_1.LocalStorage('local-seed.config', DEFAULT_LOCAL_SEED_CONFIG);
    }
    get() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.handle.get();
        });
    }
    updateSeedInfo() {
        return __awaiter(this, void 0, void 0, function* () {
            // update config
            const setting = yield this.handle.get();
            const pluginPkg = yield this.pkgHandle.get();
            setting.seeds = Object.keys(pluginPkg.dependencies);
            setting.seedMap = {};
            setting.seeds.forEach((seedName) => {
                const seedPath = path_1.default.join(path_1.default.dirname(this.pkgHandle.savePath), 'node_modules', seedName);
                const seedPkgPath = path_1.default.join(seedPath, 'package.json');
                if (fs_1.default.existsSync(seedPkgPath)) {
                    const pkg = require(seedPkgPath);
                    setting.seedMap[seedName] = {
                        name: seedName,
                        version: pkg.version,
                        main: path_1.default.resolve(seedPath, pkg.main),
                        dev: false
                    };
                }
            });
            // local seed
            const localSeedMap = yield this.seedHandle.get();
            Object.keys(localSeedMap).forEach((seedName) => {
                if (setting.seeds.indexOf(seedName) === -1) {
                    setting.seeds.push(seedName);
                }
                setting.seedMap[seedName] = localSeedMap[seedName];
            });
            return yield this.handle.set(setting);
        });
    }
    // 新增 local seed
    addlocalSeed(name, seedObj) {
        return __awaiter(this, void 0, void 0, function* () {
            const seedMap = yield this.seedHandle.get();
            seedMap[name] = seedObj;
            yield this.seedHandle.set(seedMap);
            yield this.updateSeedInfo();
            return yield this.get();
        });
    }
    // 删除 local seed
    removeLocalSeed(name) {
        return __awaiter(this, void 0, void 0, function* () {
            const seedMap = yield this.seedHandle.get();
            delete seedMap[name];
            yield this.seedHandle.set(seedMap);
            yield this.updateSeedInfo();
            return yield this.get();
        });
    }
    // 重置 config
    reset() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.handle.set(DEFAULT_CONFIG);
            yield this.pkgHandle.set(DEFAULT_PKG_CONFIG);
            yield this.seedHandle.set(DEFAULT_LOCAL_SEED_CONFIG);
            yield this.updateSeedInfo();
            return yield this.get();
        });
    }
}
exports.LocalConfig = LocalConfig;
