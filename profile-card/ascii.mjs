import { execFileSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'

const RAMP = ' .\'`^",:;Il!i><~+_-?][}{1)(|/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$'
const CHAR_ASPECT_RATIO = 0.5
const BACKGROUND_CUTOFF = 0.93

const readGrayPixels = (imagePath, columns, rows) =>
  execFileSync('magick', [
    imagePath,
    '-gravity', 'north',
    '-crop', '87%x87%+0+0',
    '+repage',
    '-level', '5%,95%',
    '-resize', `${columns}x${rows}!`,
    '-colorspace', 'gray',
    '-normalize',
    '-depth', '8',
    'gray:-'
  ])

export const toChar = luminance => {
  const brightness = luminance / 255
  if (brightness >= BACKGROUND_CUTOFF) return ' '
  const darkness = 1 - brightness / BACKGROUND_CUTOFF
  return RAMP[Math.min(RAMP.length - 1, Math.round(darkness * (RAMP.length - 1)))]
}

export const toAscii = (imagePath, columns) => {
  const rows = Math.round(columns * CHAR_ASPECT_RATIO)
  const pixels = readGrayPixels(imagePath, columns, rows)
  const lines = []
  for (let row = 0; row < rows; row++) {
    const line = Array.from(pixels.subarray(row * columns, (row + 1) * columns), toChar).join('')
    lines.push(line.trimEnd())
  }
  return lines.join('\n') + '\n'
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [imagePath, columns = '40', outputPath] = process.argv.slice(2)
  if (!imagePath) {
    console.error('usage: node profile-card/ascii.mjs <image> [columns] [output]')
    process.exit(1)
  }
  const ascii = toAscii(imagePath, Number(columns))
  outputPath ? writeFileSync(outputPath, ascii) : process.stdout.write(ascii)
}
