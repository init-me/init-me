/* eslint-disable no-control-regex */
const COLOR_REG = /(\u001b\[\d+m|\033\[[0-9;]+m)+/g
/** 判断是否数组 */
function isArray(ctx: any) {
  return typeof ctx === 'object' && ctx.splice === Array.prototype.splice
}
export function decolor(ctx: string[] | string) {
  if (isArray(ctx)) {
    return (ctx as string[]).map((str) => str.replace(COLOR_REG, '')).join('')
  } else {
    return (ctx as string).replace(COLOR_REG, '')
  }
}
