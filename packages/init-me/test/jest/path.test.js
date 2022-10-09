const task = require('../../task/index')
const path = require('path')

const USERPROFILE =
  process.env[process.platform == 'win32' ? 'USERPROFILE' : 'HOME']
const CONFIG_PATH = path.join(USERPROFILE, '.init-me')

test('task.path', async () => {
  const r = await task.path({
    env: {
      silent: true
    }
  })
  expect(r.app).toEqual(path.join(__dirname, '../../'))
  expect(r.config).toEqual(CONFIG_PATH)
})
