import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import yauzl from 'yauzl'
import { fileURLToPath } from 'url'

const packageJsonPath = path.join(process.cwd(), 'package.json')
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'))

const projectName = packageJson.name
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const crxFilePath = path.join(process.cwd(), 'CrxFile', `${projectName}.crx`)
const logFilePath = path.join(process.cwd(), 'CrxFile', 'output.log')

// 获取命令行参数
const additionalContent = process.argv[2] || ''

// 计算 CRX 文件的哈希值
const crxBuffer = fs.readFileSync(crxFilePath)
const hash = crypto.createHash('sha256').update(crxBuffer).digest('hex')
const privateKeyPath = path.resolve(__dirname, '../CrxFile', `${packageJson.name}.pem`)

/**
 * 从私钥生成公钥
 *
 * @param {string} privateKeyPem - 私钥的PEM格式字符串
 * @returns {string} 公钥的Base64编码字符串
 * @throws 如果在生成公钥的过程中出现错误，将抛出错误
 */
function generatePublicKeyFromPrivateKey(privateKeyPem) {
  try {
    // 1. 创建私钥对象
    const privateKey = crypto.createPrivateKey({
      key: privateKeyPem,
      format: 'pem',
      type: 'pkcs8' // Chrome扩展使用PKCS#8格式
    })

    // 2. 从私钥导出公钥
    const publicKey = crypto.createPublicKey(privateKey)

    // 3. 导出公钥为 spki 格式并转为 base64
    const publicKeySpki = publicKey.export({
      type: 'spki',
      format: 'der'
    })

    // 4. 转换为 base64 格式
    const publicKeyBase64 = publicKeySpki.toString('base64')

    return publicKeyBase64
  } catch (error) {
    console.error('生成公钥时出错:', error)
    throw error
  }
}

/**
 * 从文件中读取私钥并生成公钥
 *
 * @returns 返回生成的公钥，如果读取私钥文件或生成公钥时出错则返回null
 */
function getPublicKeyFromFile() {
  try {
    // 读取私钥文件
    const privateKeyPem = fs.readFileSync(privateKeyPath, 'utf8')

    // 生成公钥
    return generatePublicKeyFromPrivateKey(privateKeyPem)
  } catch (error) {
    console.error('读取私钥文件或生成公钥时出错:', error)
    return null
  }
}

/**
 * 解析 CRX 文件头部信息
 *
 * @param buffer 缓冲区对象，包含 CRX 文件内容
 * @returns 返回 ZIP 内容的起始位置
 * @throws 当 CRX 文件头部信息不符合规范时，抛出错误
 */
function parseCrxHeader(buffer) {
  if (buffer.toString('ascii', 0, 4) !== 'Cr24') {
    throw new Error('Invalid CRX file: incorrect magic number')
  }

  const version = buffer.readUInt32LE(4)
  if (version !== 3) {
    throw new Error(`Unsupported CRX version: ${version}`)
  }

  const headerSize = buffer.readUInt32LE(8)

  return 12 + headerSize // 返回 ZIP 内容的起始位置
}

const getIDFromBase64PublicKey = (key) => {
  const hash = crypto.createHash('sha256')
  const data = Buffer.from(key, 'base64')
  const digest = hash.update(data).digest('hex')
  const id = digest.toString().substring(0, 32)

  return id.replace(/[0-9a-f]/g, (c) => {
    return 'abcdefghijklmnop'.charAt('0123456789abcdef'.indexOf(c))
  })
}

const zipStart = parseCrxHeader(crxBuffer)

/**
 * 处理zip文件内容
 *
 * @param zipBuffer zip文件的Buffer数据
 */
function processZipContent(zipBuffer) {
  yauzl.fromBuffer(zipBuffer, { lazyEntries: true }, (err, zipfile) => {
    if (err) throw err

    zipfile.on('entry', (entry) => {
      if (entry.fileName.endsWith('manifest.json')) {
        zipfile.openReadStream(entry, (err, readStream) => {
          if (err) throw err

          let jsonData = ''
          readStream.on('data', (chunk) => {
            jsonData += chunk
          })

          readStream.on('end', () => {
            const manifest = JSON.parse(jsonData)
            const publicKey = getPublicKeyFromFile()
            const extId = publicKey ? getIDFromBase64PublicKey(publicKey) : 'unknown'
            const logContent = [
              `project: ${projectName}`,
              `version: ${manifest.version}`,
              `ext id: ${extId}`,
              `hash: ${hash}`,
              additionalContent ? `commit:${additionalContent}` : ''
            ]
              .filter(Boolean)
              .join('\n')

            fs.writeFile(logFilePath, logContent, (err) => {
              if (err) {
                console.error('Error writing to log file:', err)
              } else {
                console.log(`Log has been written to ${logFilePath}`)
              }
            })
          })
        })
      } else {
        zipfile.readEntry()
      }
    })

    zipfile.readEntry()
  })
}

const zipContentBuffer = crxBuffer.slice(zipStart)
processZipContent(zipContentBuffer)
