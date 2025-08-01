import ChromeExtension from 'crx'
import fs from 'fs-extra'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 配置参数
const extensionPath = path.resolve(__dirname, '..', 'dist')
const privateKeyPath = path.resolve(__dirname, '../CrxFile', 'newtab.pem')
const outputPath = path.resolve(__dirname, '../CrxFile', 'newtab.crx')

// 创建CRX实例
const crx = new ChromeExtension({
  privateKey: fs.readFileSync(privateKeyPath)
})

async function packageExtension() {
  try {
    // 检查并删除旧的 CRX 文件
    if (await fs.pathExists(outputPath)) {
      await fs.remove(outputPath)
      console.log(`Removed existing CRX file: ${outputPath}`)
    }

    // 加载扩展
    await crx.load(extensionPath)

    // 打包扩展
    const crxBuffer = await crx.pack()

    // 写入新的 CRX 文件
    await fs.writeFile(outputPath, crxBuffer)

    console.log(`New CRX file created at: ${outputPath}`)
  } catch (err) {
    console.error('Error packaging extension:', err)
  }
}

packageExtension()
