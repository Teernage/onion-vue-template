import ChromeExtension from 'crx'
import fs from 'fs-extra'
import path from 'path'
import { fileURLToPath } from 'url'
import crypto from 'crypto'

const packageJsonPath = path.join(process.cwd(), 'package.json')
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'))

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 配置参数
const extensionPath = path.resolve(__dirname, '..', 'dist')
const crxFolderPath = path.resolve(__dirname, '../CrxFile')
const privateKeyPath = path.resolve(crxFolderPath, `${packageJson.name}.pem`)
const outputPath = path.resolve(crxFolderPath, `${packageJson.name}.crx`)

async function generatePrivateKey() {
  return new Promise((resolve, reject) => {
    crypto.generateKeyPair(
      'rsa',
      {
        modulusLength: 2048,
        publicKeyEncoding: {
          type: 'spki',
          format: 'pem'
        },
        privateKeyEncoding: {
          type: 'pkcs8',
          format: 'pem'
        }
      },
      (err, publicKey, privateKey) => {
        if (err) {
          reject(err)
          return
        }
        resolve(privateKey)
      }
    )
  })
}

async function ensurePrivateKey() {
  try {
    // 确保 CrxFile 目录存在
    await fs.ensureDir(crxFolderPath)

    // 检查私钥文件是否存在
    const pemExists = await fs.pathExists(privateKeyPath)

    if (!pemExists) {
      console.log('No private key found, generating new one...')
      const privateKey = await generatePrivateKey()
      await fs.writeFile(privateKeyPath, privateKey)
      console.log(`Private key generated and saved to: ${privateKeyPath}`)
      return privateKey
    }

    console.log('Using existing private key')
    return await fs.readFile(privateKeyPath)
  } catch (err) {
    console.error('Error handling private key:', err)
    throw err
  }
}

async function packageExtension() {
  try {
    // 获取或生成私钥
    const privateKey = await ensurePrivateKey()

    // 创建CRX实例
    const crx = new ChromeExtension({
      privateKey: privateKey
    })

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
    throw err
  }
}

packageExtension()
