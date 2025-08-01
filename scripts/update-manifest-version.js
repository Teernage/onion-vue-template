// bump-version.mjs
import fs from 'fs'
import path from 'path'

function incrementVersion(version, type) {
  const parts = version.split('.').map(Number)
  switch (type) {
    case 'major':
      parts[0]++
      parts[1] = 0
      parts[2] = 0
      break
    case 'minor':
      parts[1]++
      parts[2] = 0
      break
    case 'patch':
    default:
      parts[2]++
      break
  }
  return parts.join('.')
}

const type = process.argv[2] || 'patch'

const srcManifestPath = path.resolve('src', 'manifest.json')
if (!fs.existsSync(srcManifestPath)) {
  console.error('src/manifest.json not found!')
  process.exit(1)
}

const srcManifest = JSON.parse(fs.readFileSync(srcManifestPath, 'utf-8'))
const newVersion = incrementVersion(srcManifest.version, type)
srcManifest.version = newVersion
fs.writeFileSync(srcManifestPath, JSON.stringify(srcManifest, null, 2))
console.log(`manifest.json 版本号已递增为 ${newVersion}`)
