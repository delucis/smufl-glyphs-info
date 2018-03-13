#!/usr/bin/env node

// core Node imports
const FS = require('fs')
const PATH = require('path')
const UTIL = require('util')

// required libraries
const PROGRAM = require('commander')
const PROMPTS = require('prompts')
const CLOROX = require('clorox')

// promise wrappers around file system operations
const MKDIR = UTIL.promisify(FS.mkdir)
const COPY = UTIL.promisify(FS.copyFile)
const READF = UTIL.promisify(FS.readFile)

// local variables
const V = require('../package.json').version

/*
███████ ██    ██ ███    ██  ██████ ████████ ██  ██████  ███    ██
██      ██    ██ ████   ██ ██         ██    ██ ██    ██ ████   ██
█████   ██    ██ ██ ██  ██ ██         ██    ██ ██    ██ ██ ██  ██
██      ██    ██ ██  ██ ██ ██         ██    ██ ██    ██ ██  ██ ██
██       ██████  ██   ████  ██████    ██    ██  ██████  ██   ████

██████  ███████ ███████ ██ ███    ██ ██ ████████ ██  ██████  ███    ██ ███████
██   ██ ██      ██      ██ ████   ██ ██    ██    ██ ██    ██ ████   ██ ██
██   ██ █████   █████   ██ ██ ██  ██ ██    ██    ██ ██    ██ ██ ██  ██ ███████
██   ██ ██      ██      ██ ██  ██ ██ ██    ██    ██ ██    ██ ██  ██ ██      ██
██████  ███████ ██      ██ ██   ████ ██    ██    ██  ██████  ██   ████ ███████
*/

// LOGGING FUNCTIONS
// Wrappers around console loggers for prettier formatting
const PAD = '    '

function error (err) {
  console.error(PAD + `${CLOROX.bold.white.bgRed(' ERROR ')} ${err}`)
}
function warn (warning) {
  console.warn(PAD + `${CLOROX.bold.yellow.inverse(' WARN ')}  ${warning}`)
}
function info (msg) {
  console.error(PAD + `${CLOROX.bold.white.bgBlue(' INFO ')}  ${msg}`)
}

/**
 * Show an initial prompt to confirm installation.
 */
async function startPrompt () {
  let answers = await PROMPTS([{
    type: 'confirm',
    name: 'install',
    message: 'This script will set up SMuFL support in Glyphs. Do you want to continue?'
  }])
  if (answers.install) install()
}

/**
 * Run basic installation logic
 * @param  {Object}  [opts] Installation options
 * @param  {Boolean} [opts.force=false] Force the installation without checking for conflicts or requesting user input.
 */
async function install ({ force = false } = {}) {
  if (force) warn('Installing with --force flag. Any checks for conflicts will be skipped.')

  const FILES = [
    '../dist/GlyphData.xml',
    '../dist/Groups.plist'
  ].map(path => PATH.join(__dirname, path))

  const DEST = PATH.join(
    process.env.HOME,
    'Library/Application Support/Glyphs/Info'
  )

  let destExists = false

  await MKDIR(DEST)
    .then(() => {
      info(`Created ${DEST}`)
    })
    .catch((err) => {
      if (err.code !== 'EEXIST') throw err
      destExists = true
    })

  if (force || !destExists) {
    await copyResources(FILES, DEST)
  } else {
    await copySafely(FILES, DEST)
  }
}

/**
 * Copy files to a destination, optionally without overwriting.
 * @param  {String[]} [files=[]]       The paths for the files to copy.
 * @param  {String}   [dest='']        The destination directory to copy to.
 * @param  {Boolean}  [overwrite=true] Should existing files be overwritten?
 */
async function copyResources (files = [], dest = '', overwrite = true) {
  const flag = overwrite ? null : FS.constants.COPYFILE_EXCL

  await Promise.all(files.map(async file => {
    let fname = PATH.basename(file)
    return COPY(file, PATH.join(dest, fname), flag)
      .then(() => info(`Copied ${fname} to ${dest}`))
  }))
}

/**
 * Copy files to a destination without overwriting & try to resolve conflicts.
 * @param  {String[]} [files=[]] The paths for the files to copy.
 * @param  {String}   [dest='']  The destination directory to copy to.
 */
async function copySafely (files = [], dest = '') {
  let conflicts = []
  let safeFiles = []

  await Promise.all(files.map(async file => {
    let data = { file }
    let exists = true
    let fname = PATH.basename(file)
    let xml = await READF(PATH.join(dest, fname), 'utf8')
      .catch((err) => {
        if (err.code !== 'ENOENT') throw err
        exists = false
      })
    if (xml) data.xml = xml
    if (exists) {
      conflicts.push(data)
    } else {
      safeFiles.push(file)
    }
  }))

  await copyResources(safeFiles, dest, false)

  await resolveConflicts(conflicts, dest)
}

/**
 * Try to resolve conflicts while copying files, falling back to user input.
 * @param  {Object[]} conflicts Array of objects describing conflicting files.
 * @param  {String}   dest      The destination directory to copy to.
 */
async function resolveConflicts (conflicts, dest) {
  let skippable = []
  let clashing = []

  await Promise.all(conflicts.map(async conflict => {
    let xml = await READF(conflict.file, 'utf8')
    if (xml === conflict.xml) {
      skippable.push(conflict)
    } else {
      clashing.push(conflict)
    }
  }))

  skippable.forEach(conflict => {
    let fname = PATH.basename(conflict.file)
    info(`Skipped copying ${fname} as it is already installed`)
  })

  let prompts = clashing.map(conflict => {
    let fname = PATH.basename(conflict.file)
    return {
      type: 'confirm',
      name: conflict.file,
      message: `A different ${fname} was found. Are you sure you want to overwrite it?`
    }
  })

  let answers = await PROMPTS(prompts)

  for (var answer in answers) {
    if (answers[answer]) {
      await copyResources([ answer ], dest)
    } else {
      let fname = PATH.basename(answer)
      warn(`Did not copy ${fname}. It was not installed.`)
    }
  }
}

/*
███████ ████████  █████  ██████  ████████
██         ██    ██   ██ ██   ██    ██
███████    ██    ███████ ██████     ██
     ██    ██    ██   ██ ██   ██    ██
███████    ██    ██   ██ ██   ██    ██

███████ ██   ██ ███████  ██████ ██    ██ ████████ ██  ██████  ███    ██
██       ██ ██  ██      ██      ██    ██    ██    ██ ██    ██ ████   ██
█████     ███   █████   ██      ██    ██    ██    ██ ██    ██ ██ ██  ██
██       ██ ██  ██      ██      ██    ██    ██    ██ ██    ██ ██  ██ ██
███████ ██   ██ ███████  ██████  ██████     ██    ██  ██████  ██   ████
*/

if (process.platform !== 'darwin') {
  error('This script is designed for use on macOS only.')
  console.info(`        Running on macOS and seeing this error?
        Please open an issue at ${CLOROX.underline('https://github.com/delucis/smufl-glyphs-info')}`
  )
  process.exit(1)
}

PROGRAM
  .name('smufl-glyphs')
  .version(V, '-v, --version')
  .option('-f, --force', 'install SMuFl support without user input, overwriting any existing files')
  .on('--help', () => {
    console.log(`

  Details:

  The Glyphs font creation software allows for the expansion of its standard
  glyph database and custom categorisation in its left sidebar by providing
  custom GlyphData.xml and Groups.plist files.

  This package provides files to help develop fonts using the SMuFL (Standard
  Music Font Layout) specification.

  These will be added to Glyphs’ Application Support directory. If there are
  any existing files that will be overwritten, this tool will offer some
  options for how to handle the conflict.
    `)
  })
  .parse(process.argv)

if (PROGRAM.force) {
  install({ force: true })
} else {
  startPrompt()
}
