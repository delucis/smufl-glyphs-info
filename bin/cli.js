#!/usr/bin/env node

// core Node imports
import fs from 'node:fs/promises'
import nodePath from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseArgs, styleText } from 'node:util'

// required libraries
import { cancel, confirm, group, intro, isCancel, log } from '@clack/prompts';

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

const helpMessage = `
Usage: smufl-glyphs [options]

Options:
  -f, --force      install SMuFl support without user input, overwriting any existing files
  -h, --help       display this help message

Details:

The Glyphs font creation software allows for the expansion of its standard
glyph database and custom categorisation in its left sidebar by providing
custom GlyphData-smufl.xml and Groups-smufl.plist files.

This package provides files to help develop fonts using the SMuFL (Standard
Music Font Layout) specification.

These will be added to Glyphs’ Application Support directory. If there are
any existing files that will be overwritten, this tool will offer some
options for how to handle the conflict.
`;

/**
 * Show an initial prompt to confirm installation.
 */
async function startPrompt () {
  intro('Welcome to the SMuFL Glyphs Info Installer')
  let shouldInstall = await confirm({
    message: 'This script will set up SMuFL support in Glyphs. Do you want to continue?',
  })
  if (isCancel(shouldInstall) || !shouldInstall) {
    cancel('Installation cancelled.')
  } else {
    install()
  }
}

/**
 * Run basic installation logic
 * @param  {Object}  [opts] Installation options
 * @param  {Boolean} [opts.force=false] Force the installation without checking for conflicts or requesting user input.
 */
async function install ({ force = false } = {}) {
  if (force) log.warn('Installing with --force flag. Any checks for conflicts will be skipped.')

  const __dirname = fileURLToPath(new URL('.', import.meta.url));
  const FILES = [
    '../dist/GlyphData-smufl.xml',
    '../dist/Groups-smufl.plist'
  ].map(path => nodePath.join(__dirname, path))

  if (!process.env.HOME) {
    cancel('Could not determine home directory. Please open an issue: https://github.com/delucis/smufl-glyphs-info')
    process.exit(1)
  }

  const DEST = nodePath.join(
    process.env.HOME,
    'Library/Application Support/Glyphs 3/Info'
  )

  let destExists = false

  await fs.mkdir(DEST)
    .then(() => {
      log.info(`Created ${DEST}`)
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
  const flag = overwrite ? undefined : fs.constants.COPYFILE_EXCL

  await Promise.all(files.map(async file => {
    let fname = nodePath.basename(file)
    return fs.copyFile(file, nodePath.join(dest, fname), flag)
      .then(() => log.success(`Copied ${fname} to ${dest}`))
  }))
}

/**
 * Copy files to a destination without overwriting & try to resolve conflicts.
 * @param  {String[]} [files=[]] The paths for the files to copy.
 * @param  {String}   [dest='']  The destination directory to copy to.
 */
async function copySafely (files = [], dest = '') {
  /** @type {Array<{ file: string, xml?: string }>} */
  let conflicts = []
  /** @type {string[]} */
  let safeFiles = []

  await Promise.all(files.map(async file => {
    /** @type { { file: string, xml?: string } } */
    let data = { file }
    let exists = true
    let fname = nodePath.basename(file)
    let xml = await fs.readFile(nodePath.join(dest, fname), 'utf8')
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
 * @param {{ file: string, xml?: string }[]} conflicts Array of objects describing conflicting files.
 * @param {string} dest The destination directory to copy to.
 */
async function resolveConflicts (conflicts, dest) {
  /** @type {Array<{ file: string, xml?: string }>} */
  let skippable = []
  /** @type {Array<{ file: string, xml?: string }>} */
  let clashing = []

  await Promise.all(conflicts.map(async conflict => {
    let xml = await fs.readFile(conflict.file, 'utf8')
    if (xml === conflict.xml) {
      skippable.push(conflict)
    } else {
      clashing.push(conflict)
    }
  }))

  skippable.forEach(conflict => {
    let fname = nodePath.basename(conflict.file)
    log.info(`Skipped copying ${fname} as it is already installed`)
  })

  let prompts = clashing.map(conflict => {
    let fname = nodePath.basename(conflict.file)
    return /** @type const */ ([
      conflict.file,
      () => confirm({
        message: `A different ${fname} was found. Are you sure you want to overwrite it?`
      })
    ])
  })

  let answers = await group(Object.fromEntries(prompts))

  for (var answer in answers) {
    if (answers[answer]) {
      await copyResources([ answer ], dest)
    } else {
      let fname = nodePath.basename(answer)
      log.warn(`Did not copy ${fname}. It was not installed.`)
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
  cancel('This script is designed for use on macOS only.\n' +
    'Running on macOS and seeing this error?\n' +
    `Please open an issue at ${styleText(['underline'], 'https://github.com/delucis/smufl-glyphs-info')}`
  )
  process.exit(1)
}

const args = parseArgs({options: {
  force: { type: 'boolean', short: 'f', default: false },
  help: { type: 'boolean', short: 'h', default: false },
}});

if (args.values.help) {
  console.log(helpMessage);
  process.exit(0);
} else if (args.values.force) {
  install({ force: true });
} else {
  startPrompt();
}
