import { syncSeedsToProject } from 'init-me-helper'
syncSeedsToProject({
  dirPrefix: '__data("name")__',
  context: __dirname,
  fromDir: '../',
  toDir: './seeds'
})
