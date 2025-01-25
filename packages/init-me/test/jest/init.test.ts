import { task } from '../../'
import path from 'path'
import fs from 'fs'
import extFs from 'yyl-fs'
import { CONFIG_PATH } from '../../output/lib/localStorage'

const SEED_NAME = 'init-me-seed-helloworld'
const FRAG_PATH = path.join(__dirname, '../__frag')
const env = { silent: true }

jest.setTimeout(30000)

test('task.init(targetPath, { env })', async () => {
  if (fs.existsSync(CONFIG_PATH)) {
    await extFs.removeFiles(CONFIG_PATH, true)
  }

  await task.reset({ env })

  if (fs.existsSync(FRAG_PATH)) {
    await extFs.removeFiles(FRAG_PATH, true)
    await extFs.mkdirSync(FRAG_PATH)
  }

  await task.init(FRAG_PATH, {
    env: {
      silent: true,
      seed: SEED_NAME,
      type: 'typescript'
    }
  })

  expect(fs.readdirSync(FRAG_PATH).length).not.toEqual(0)
  await task.reset({ env })
  await extFs.removeFiles(FRAG_PATH, true)
})
