#!/usr/bin/env node

const chalk = require('chalk')
const boxen = require('boxen')

const kiko = require('..')

const newline = '\n'
const heading = `${kiko.name} ${kiko.handle}`
const working = `${kiko.labelWork}  ${kiko.work}`
const twittering = `${kiko.labelTwitter}  ${kiko.twitter}`
const githubing = `${kiko.labelGitHub}  ${kiko.github}`
const linkedining = `${kiko.labelLinkedIn}  ${kiko.linkedin}`
const webing = `${kiko.labelWeb}  ${kiko.web}`
const carding = `${kiko.labelCard}  ${kiko.npx}`

const output =
  heading +
  newline +
  newline +
  working +
  newline +
  twittering +
  newline +
  githubing +
  newline +
  linkedining +
  newline +
  webing +
  newline +
  newline +
  carding

console.log(
  chalk.green(
    boxen(output, {
      padding: 1,
      margin: 1,
      borderStyle: 'round'
    })
  )
)
