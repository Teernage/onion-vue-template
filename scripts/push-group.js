import axios from 'axios'
import fs from 'fs'
import FormData from 'form-data'
import path from 'path'

const crxFilePath = path.join(process.cwd(), 'CrxFile', 'newtab.crx')
const logPath = path.join(process.cwd(), 'CrxFile', 'output.log')

// 企业微信机器人的 Webhook URL
const webhookKey = 'c5f44fe2-c56b-42dd-8513-b1a11b36125a'
// const webhookKey = '3dcc1bae-8785-45c1-a04c-bd73c275b928' // 测试群机器人
const uploadUrl = `https://qyapi.weixin.qq.com/cgi-bin/webhook/upload_media?key=${webhookKey}&type=file`
const sendUrl = `https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=${webhookKey}`

/**
 * 发送文本消息
 *
 * @param content 文本内容
 * @returns 无返回值
 */
async function sendTextMessage(content) {
  try {
    const messageData = {
      msgtype: 'text',
      text: {
        content
      }
    }

    const sendResponse = await axios.post(sendUrl, messageData)
    console.log('文本消息发送响应:', sendResponse.data)
  } catch (error) {
    console.error('文本消息发送失败:', error.response ? error.response.data : error.message)
  }
}

/**
 * 上传文件并发送消息
 *
 * @param filePath 文件路径
 * @param fileType 文件类型
 * @param fileName 文件名
 * @param contentType 文件内容类型
 * @returns 无返回值
 */
async function uploadAndSendFile(filePath, fileType, fileName, contentType) {
  console.log(`正在上传和发送 ${fileType} 类型的文件: ${fileName},${filePath}`)

  const formData = new FormData()
  formData.append('media', fs.createReadStream(filePath), {
    filename: fileName,
    contentType
  })

  try {
    // 上传文件
    const uploadResponse = await axios.post(uploadUrl, formData, {
      headers: {
        ...formData.getHeaders()
      }
    })

    console.log(`${fileType} 文件上传响应:`, uploadResponse.data)

    if (uploadResponse.data.errcode === 0) {
      const mediaId = uploadResponse.data.media_id

      // 构建发送文件消息的数据
      const messageData = {
        msgtype: fileType,
        [fileType]: {
          media_id: mediaId
        }
      }

      // 发送文件消息
      const sendResponse = await axios.post(sendUrl, messageData)
      console.log(`${fileType} 文件消息发送响应:`, sendResponse.data)
    } else {
      console.error(`${fileType} 文件上传失败:`, uploadResponse.data.errmsg)
    }
  } catch (error) {
    console.error(`${fileType} 文件操作失败:`, error.response ? error.response.data : error.message)
  }
}

/**
 * 上传并发送文件
 *
 * @returns 无返回值，异步操作
 */
async function uploadAndSendFiles() {
  const currentTime = getDateTime(new Date().getTime())

  // 添加 commit 信息到 output.log 文件
  await fs.promises.appendFile(logPath, `\ncommit:${process.argv.slice(2).join('\n')}`)

  // 读取日志文件内容并发送为文本消息
  try {
    const logContent = await fs.promises.readFile(logPath, 'utf8')

    // 将时间戳和日志内容合并到同一条消息
    await sendTextMessage(`--- ${currentTime}---\n日志文件内容:\n${logContent}`)

    // 上传 CRX 文件
    await uploadAndSendFile(crxFilePath, 'file', 'newtab.crx', 'application/x-chrome-extension')
  } catch (error) {
    console.error('读取日志文件失败:', error)
  }
}

function getDateTime(date) {
  date = new Date(Number(date))
  const year = date.getFullYear()
  let month = date.getMonth() + 1
  let day = date.getDate()
  let hours = date.getHours()
  let minutes = date.getMinutes()
  let seconds = date.getSeconds()
  // 补零操作，确保格式统一
  month = month < 10 ? '0' + month : month
  day = day < 10 ? '0' + day : day
  hours = hours < 10 ? '0' + hours : hours
  minutes = minutes < 10 ? '0' + minutes : minutes
  seconds = seconds < 10 ? '0' + seconds : seconds
  const formattedDateTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
  return formattedDateTime
}

uploadAndSendFiles()
