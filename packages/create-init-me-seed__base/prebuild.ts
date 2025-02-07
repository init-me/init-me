import { syncSeedsToProject } from 'init-me-helper'
syncSeedsToProject({
  dirPrefix: '__data("name")__base',
  context: __dirname,
  fromDir: '../',
  toDir: './seeds'
})
