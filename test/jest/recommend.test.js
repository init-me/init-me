const task = require('../../task/index')
const env = { silent: true }

const SEED_NAME = 'init-me-seed-helloworld'

jest.setTimeout(30000)

test('task.recommend({ env })', async () => {
  await task.reset({ env })
  const pkgNames = await task.recommend({ env })
  const yyPkgNames = pkgNames
    .map((item) => item.name)
    .filter((name) => {
      return /^@yy/.test(name)
    })
  const normalPkgNames = pkgNames
    .map((item) => item.name)
    .filter((name) => {
      return !/^@yy/.test(name)
    })

  expect(yyPkgNames.length).not.toEqual(0)
  expect(normalPkgNames.length).not.toEqual(0)

  await task.install([SEED_NAME], { env })

  const nItems = await task.recommend({ env })
  expect(pkgNames.length === nItems.length).toEqual(true)
  expect(
    pkgNames.length > nItems.filter((item) => !item.installed).length
  ).toEqual(true)
})
