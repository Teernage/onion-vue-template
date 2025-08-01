import fs from 'fs-extra'
import path from 'path'
import { fileURLToPath } from 'url'
import crypto from 'crypto'
import yauzl from 'yauzl'
import axios from 'axios'
import FormData from 'form-data'
import archiver from 'archiver'
import ChromeExtension from 'crx'

// 路径相关
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 插件和服务器配置
const extensionPath = path.resolve(__dirname, '..', 'dist')
const privateKeyPath = path.resolve(__dirname, '../CrxFile', 'newtab.pem')
const projectName = 'NewTab'
const extId = 'mkinglldbfofhlhajpicdhcbikpejiej'

// gohttpserver 配置
const goServerUrl = 'http://192.168.30.75:9000'
const targetFolder = 'chrome-crx'
const uploadUrl = `${goServerUrl}/${targetFolder}?upload`

// 获取命令行参数
const additionalContent = process.argv[2] || ''

/**
 * 解析 CRX 文件头部信息
 * @param {Buffer} buffer CRX 文件 Buffer
 * @returns {number} ZIP 内容的起始位置
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

/**
 * 从 ZIP 内容中提取 manifest.json
 * @param {Buffer} zipBuffer ZIP 内容 Buffer
 * @returns {Promise<object>} 解析后的 manifest 对象
 */
function extractManifest(zipBuffer) {
  return new Promise((resolve, reject) => {
    yauzl.fromBuffer(zipBuffer, { lazyEntries: true }, (err, zipfile) => {
      if (err) return reject(err)
      zipfile.on('entry', (entry) => {
        if (entry.fileName.endsWith('manifest.json')) {
          zipfile.openReadStream(entry, (err, readStream) => {
            if (err) return reject(err)
            let jsonData = ''
            readStream.on('data', (chunk) => {
              jsonData += chunk
            })
            readStream.on('end', () => {
              try {
                const manifest = JSON.parse(jsonData)
                resolve(manifest)
              } catch (error) {
                reject(error)
              }
            })
          })
        } else {
          zipfile.readEntry()
        }
      })
      zipfile.readEntry()
    })
  })
}

/**
 * 将多个 Buffer 打包成一个 ZIP Buffer
 * @param {Object} files 文件名和内容的映射对象
 * @returns {Promise<Buffer>} ZIP 文件的 Buffer
 */
function createZipBuffer(files) {
  return new Promise((resolve, reject) => {
    const archive = archiver('zip', { zlib: { level: 9 } })
    const buffers = []
    archive.on('data', (data) => buffers.push(data))
    archive.on('end', () => resolve(Buffer.concat(buffers)))
    archive.on('error', (err) => reject(err))
    for (const [fileName, content] of Object.entries(files)) {
      archive.append(content, { name: fileName })
    }
    archive.finalize()
  })
}

/**
 * 上传文件到 Go 服务器
 * @param {Buffer} buffer 文件 Buffer
 * @param {string} fileName 文件名
 * @param {string} contentType 内容类型
 */
async function uploadToGoServer(buffer, fileName, contentType) {
  const formData = new FormData()
  formData.append('file', buffer, {
    filename: fileName,
    contentType
  })
  try {
    const res = await axios.post(uploadUrl, formData, {
      headers: formData.getHeaders()
    })
    console.log(`文件上传响应:`, res.data)
  } catch (error) {
    console.error(`文件上传失败:`, error.response ? error.response.data : error.message)
  }
}

/**
 * 主流程：打包 CRX、生成日志、打包 ZIP 并上传
 */
async function main() {
  console.log('开始处理...')

  // 1. 打包 CRX 到内存
  console.log('正在打包 CRX...')
  const crx = new ChromeExtension({
    privateKey: await fs.readFile(privateKeyPath)
  })
  let crxBuffer
  try {
    await crx.load(extensionPath)
    crxBuffer = await crx.pack()
    console.log(`CRX 已创建, 大小: ${crxBuffer.length} 字节`)
  } catch (err) {
    console.error('打包扩展失败:', err)
    process.exit(1)
  }

  // 2. 计算哈希值
  console.log('计算 CRX 哈希值...')
  const hash = crypto.createHash('sha256').update(crxBuffer).digest('hex')
  console.log(`哈希值: ${hash}`)

  // 3. 解析 ZIP 部分并提取 manifest.json
  console.log('正在解析 manifest.json...')
  const zipStart = parseCrxHeader(crxBuffer)
  const crxZipContent = crxBuffer.slice(zipStart)
  let manifest
  try {
    manifest = await extractManifest(crxZipContent)
    console.log(`读取到 manifest.json, 版本: ${manifest.version}`)
  } catch (err) {
    console.error('解析 manifest 失败:', err)
    process.exit(1)
  }

  // 4. 生成日志内容
  console.log('生成日志内容...')
  const logContent = [
    `project: ${projectName}`,
    `version: ${manifest.version}`,
    `ext id: ${extId}`,
    `hash: ${hash}`,
    additionalContent ? `commit:${additionalContent}` : ''
  ]
    .filter(Boolean)
    .join('\n')
  console.log('日志内容:')
  console.log(logContent)

  // 5. 将 CRX 和日志一起打包成 ZIP
  console.log('将 CRX 和日志打包成 ZIP...')
  const files = {
    'newtab.crx': crxBuffer,
    'output.log': logContent
  }
  try {
    const finalZipBuffer = await createZipBuffer(files)
    console.log(`ZIP 已创建, 大小: ${finalZipBuffer.length} 字节`)

    // 6. 上传 ZIP 到服务器
    console.log('正在上传 ZIP 到服务器...')
    await uploadToGoServer(finalZipBuffer, 'newtab.zip', 'application/zip')
  } catch (err) {
    console.error('创建或上传 ZIP 失败:', err)
    process.exit(1)
  }

  console.log('全部完成!')
}

// 执行主流程
main().catch((err) => {
  console.error('执行失败:', err)
  process.exit(1)
})
