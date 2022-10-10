import { task } from '../../'
import { CONFIG_PATH } from '../../output/lib/localStorage'
import path from 'path'

test('task.path', async () => {
  const r = await task.path({
    env: {
      silent: true
    }
  })
  expect(r.app).toEqual(path.join(__dirname, '../../'))
  expect(r.config).toEqual(CONFIG_PATH)
})
