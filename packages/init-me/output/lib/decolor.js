"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decolor = void 0;
/* eslint-disable no-control-regex */
const COLOR_REG = /(\u001b\[\d+m|\033\[[0-9;]+m)+/g;
/** 判断是否数组 */
function isArray(ctx) {
    return typeof ctx === 'object' && ctx.splice === Array.prototype.splice;
}
function decolor(ctx) {
    if (isArray(ctx)) {
        return ctx.map((str) => str.replace(COLOR_REG, '')).join('');
    }
    else {
        return ctx.replace(COLOR_REG, '');
    }
}
exports.decolor = decolor;
