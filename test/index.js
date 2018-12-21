'use strict'

const test = require('ava')

const kiko = require('..')

test('data', t => t.snapshot(kiko))
