const task = require('../../task/index')
const env = { silent: true }

const SEED_NAME = 'init-me-seed-rollup'

jest.setTimeout(30000)

test('task.uninstall([pkg], { env })', async () => {
  await task.reset({ env })
  await task.install([SEED_NAME], { env })
  const seedMap = await task.list({ env })
  expect(seedMap).not.toEqual({})

  await task.uninstall([SEED_NAME], { env })
  const seedMap2 = await task.list({ env })
  expect(seedMap2).toEqual({})
  await task.reset({ env })
})
