#!/usr/bin/env node

const chalk = require('chalk')
const pkg = require('./package.json')

module.exports = {
  name: chalk.white(`${pkg.author.name} /`),
  handle: chalk.cyan(`${pkg.name}`),
  work: chalk.white(pkg.description),
  twitter: chalk.cyan(`https://twitter.com/${pkg.name}`),
  github: chalk.cyan(`https://github.com/${pkg.name}`),
  linkedin: chalk.cyan(`https://linkedin.com/in/${pkg.name}`),
  web: chalk.cyan(pkg.homepage),
  npx: chalk.white(`npx ${pkg.name}`),
  labelWork: chalk.white.bold('      Work:'),
  labelTwitter: chalk.white.bold('   Twitter:'),
  labelGitHub: chalk.white.bold('    GitHub:'),
  labelLinkedIn: chalk.white.bold('  LinkedIn:'),
  labelWeb: chalk.white.bold('       Web:'),
  labelCard: chalk.white.bold('      Card:')
}
