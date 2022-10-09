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
exports.LocalStorage = exports.CONFIG_PATH = exports.USERPROFILE = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const yyl_util_1 = __importDefault(require("yyl-util"));
const yyl_fs_1 = __importDefault(require("yyl-fs"));
exports.USERPROFILE = process.env[process.platform === 'win32' ? 'USERPROFILE' : 'HOME'] || '';
exports.CONFIG_PATH = path_1.default.join(exports.USERPROFILE, '.init-me');
class LocalStorage {
    constructor(name, data) {
        this.name = '';
        this.savePath = '';
        const savePath = path_1.default.join(exports.CONFIG_PATH, `${name}.json`);
        let iData = data || {};
        this.name = name;
        this.savePath = savePath;
        this.defaultData = data;
        this.data = data;
        if (fs_1.default.existsSync(savePath)) {
            try {
                iData = require(savePath);
            }
            catch (er) {
                iData = data || {};
                fs_1.default.writeFileSync(savePath, JSON.stringify(iData, null, 2));
            }
        }
        else {
            yyl_fs_1.default.mkdirSync(path_1.default.dirname(savePath));
            fs_1.default.writeFileSync(savePath, JSON.stringify(data, null, 2));
        }
    }
    get() {
        return __awaiter(this, void 0, void 0, function* () {
            if (fs_1.default.existsSync(this.savePath)) {
                yield new Promise((resolve, reject) => {
                    fs_1.default.readFile(this.savePath, (err, data) => {
                        if (!err) {
                            try {
                                this.data = JSON.parse(data.toString());
                            }
                            catch (er) {
                                this.data = this.defaultData;
                            }
                        }
                        resolve(undefined);
                    });
                });
            }
            return Promise.resolve(this.data);
        });
    }
    set(data) {
        return __awaiter(this, void 0, void 0, function* () {
            this.data = data;
            yield yyl_util_1.default.makeAwait((next) => {
                fs_1.default.writeFile(this.savePath, JSON.stringify(this.data, null, 2), () => {
                    next();
                });
            });
            return this.data;
        });
    }
}
exports.LocalStorage = LocalStorage;
