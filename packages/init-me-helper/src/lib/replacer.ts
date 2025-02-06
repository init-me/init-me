const REG = {
  SUGAR_DATA: /\\?_\\?_data\(['"]?(\w+)["']?\)/g
}

interface ReplacerData {
  [key: string]: string | number | undefined
}
export const replacer = {
  REG,
  dataRender(ctx: string, data: ReplacerData) {
    if (typeof ctx === 'string') {
      return ctx.replace(REG.SUGAR_DATA, (_str, $1) => {
        return `${data[$1] || ''}`
      })
    } else {
      throw new Error(`replacer.dataRender() error. ctx must be string: ${typeof ctx}`)
    }
  }
}
