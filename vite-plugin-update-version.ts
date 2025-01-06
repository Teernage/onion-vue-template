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

export default function versionHtmlPlugin(type = 'patch') {
  let updated = false
  let outputDir
  let newFileName
  let newVersion

  return {
    name: 'version-html-plugin',
    configResolved(config) {
      this.config = config
    },
    generateBundle(options) {
      outputDir = options.dir || 'dist'
    },
    closeBundle() {
      if (updated) return

      if (!outputDir) {
        console.warn('Output directory not found. Using default "dist".')
        outputDir = 'dist'
      }

      const distManifestPath = path.resolve(outputDir, 'manifest.json')
      const srcManifestPath = path.resolve('src', 'manifest.json')

      if (!fs.existsSync(distManifestPath)) {
        console.error(`manifest.json not found in build directory: ${outputDir}`)
        return
      }

      const distManifest = JSON.parse(fs.readFileSync(distManifestPath, 'utf-8'))
      const srcManifest = JSON.parse(fs.readFileSync(srcManifestPath, 'utf-8'))

      // 使用源manifest的版本号作为基础来增加
      newVersion = incrementVersion(srcManifest.version, type)
      distManifest.version = newVersion
      newFileName = `index.html`

      if (distManifest.chrome_url_overrides) {
        distManifest.chrome_url_overrides.newtab = newFileName
      }

      if (distManifest.action && distManifest.action.default_popup) {
        distManifest.action.default_popup = newFileName
      }

      // 重命名 index.html
      const oldPath = path.resolve(outputDir, 'index.html')
      const newPath = path.resolve(outputDir, newFileName)

      if (fs.existsSync(oldPath)) {
        fs.renameSync(oldPath, newPath)
        console.log(`Renamed index.html to ${newFileName}`)

        // 更新打包后的 manifest.json
        fs.writeFileSync(distManifestPath, JSON.stringify(distManifest, null, 2))
        console.log(`Updated dist manifest version to ${newVersion}`)

        // 更新源 manifest.json 的版本号
        srcManifest.version = newVersion
        fs.writeFileSync(srcManifestPath, JSON.stringify(srcManifest, null, 2))
        console.log(`Updated source manifest version to ${newVersion}`)
      } else {
        console.warn(`index.html not found in build directory: ${outputDir}`)
      }

      updated = true
    },
    writeBundle() {
      if (this.config && this.config.build && this.config.build.rollupOptions) {
        this.config.build.rollupOptions.input = newFileName
      }
    }
  }
}
