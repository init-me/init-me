import path from 'path'
import extFs from 'yyl-fs'
import fs from 'fs'
import { task } from '../../'
const FRAG_PATH = path.join(__dirname, '../__frag ', 'case-relative-path')

const CASE_PATH = path.join(__dirname, '../test-case/relative-path')

test('case relative-path', async () => {
  await task.link({
    env: {
      silent: true
    },
    targetPath: CASE_PATH
  })
  const seedName = require(path.join(CASE_PATH, 'package.json')).name

  await extFs.mkdirSync(FRAG_PATH)
  await extFs.removeFiles(FRAG_PATH)

  await task.init(FRAG_PATH, {
    env: {
      seed: seedName,
      silent: true
    }
  })

  expect(fs.existsSync(path.join(FRAG_PATH, 'hello-world.html'))).toEqual(true)

  await task.reset({
    env: {
      silent: true
    }
  })
  await extFs.removeFiles(FRAG_PATH, true)
})
