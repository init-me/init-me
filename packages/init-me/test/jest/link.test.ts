import path from 'path'
import { task } from '../../'
const env = { silent: true }

jest.setTimeout(30000)

test('task.link({ targetPath, env })', async () => {
  const linkPath = path.join(__dirname, '../test-case/case-link')
  await task.reset({ env })
  await task.link({ targetPath: linkPath, env })
  const seedMap = await task.list({ env })
  expect(Object.keys(seedMap).length).not.toEqual(0)

  await task.reset({ env })
})
