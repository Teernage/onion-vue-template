import fs from 'fs';
import crypto from 'crypto';

/**
 * 从 CRX 文件中提取扩展 ID
 * @param {string} crxFilePath - CRX 文件路径
 * @returns {string} 扩展 ID
 * @throws {Error} 当文件不存在或格式不正确时抛出错误
 */
export function getExtensionIdFromCrx(crxFilePath) {
  // 检查文件是否存在
  if (!fs.existsSync(crxFilePath)) {
    throw new Error(`CRX 文件不存在: ${crxFilePath}`);
  }

  try {
    // 读取 CRX 文件
    const crxBuffer = fs.readFileSync(crxFilePath);

    // 提取公钥
    const publicKey = extractPublicKeyFromCrx(crxBuffer);

    // 计算并返回扩展 ID
    return calculateExtensionId(publicKey);
  } catch (error) {
    throw new Error(`解析 CRX 文件失败: ${error.message}`);
  }
}

/**
 * 从 CRX 文件 Buffer 中提取扩展 ID
 * @param {Buffer} crxBuffer - CRX 文件的 Buffer 数据
 * @returns {string} 扩展 ID
 * @throws {Error} 当格式不正确时抛出错误
 */
export function getExtensionIdFromBuffer(crxBuffer) {
  try {
    const publicKey = extractPublicKeyFromCrx(crxBuffer);
    return calculateExtensionId(publicKey);
  } catch (error) {
    throw new Error(`解析 CRX Buffer 失败: ${error.message}`);
  }
}

/**
 * 从 CRX 文件头部提取公钥
 * @param {Buffer} buffer - CRX 文件 Buffer
 * @returns {Buffer} 公钥 Buffer
 * @throws {Error} 当文件格式不正确时抛出错误
 */
function extractPublicKeyFromCrx(buffer) {
  // 检查魔数
  if (buffer.toString('ascii', 0, 4) !== 'Cr24') {
    throw new Error('不是有效的 CRX 文件：魔数不匹配');
  }

  // 检查版本
  const version = buffer.readUInt32LE(4);
  if (version !== 3) {
    throw new Error(`不支持的 CRX 版本: ${version}，仅支持版本 3`);
  }

  // 读取头部大小
  const headerSize = buffer.readUInt32LE(8);

  // 解析头部内容
  let offset = 12;
  const publicKeyLength = buffer.readUInt32LE(offset);
  offset += 4;

  const signatureLength = buffer.readUInt32LE(offset);
  offset += 4;

  // 验证长度是否合理
  if (publicKeyLength <= 0 || publicKeyLength > 10000) {
    throw new Error(`公钥长度异常: ${publicKeyLength}`);
  }

  if (offset + publicKeyLength > buffer.length) {
    throw new Error('CRX 文件数据不完整');
  }

  // 提取公钥
  const publicKey = buffer.slice(offset, offset + publicKeyLength);

  return publicKey;
}

/**
 * 从公钥计算 Chrome 扩展 ID
 * @param {Buffer} publicKey - 公钥 Buffer
 * @returns {string} 32位小写字母组成的扩展 ID
 */
function calculateExtensionId(publicKey) {
  // 计算公钥的 SHA256 哈希
  const hash = crypto.createHash('sha256').update(publicKey).digest();

  // 取前 16 字节
  const first16Bytes = hash.slice(0, 16);

  // 转换为小写字母 (a-p)
  let extensionId = '';
  for (let i = 0; i < 16; i++) {
    extensionId += String.fromCharCode(97 + (first16Bytes[i] & 15));
  }

  return extensionId;
}

// 如果直接运行此文件，提供命令行接口
if (import.meta.url === `file://${process.argv[1]}`) {
  const crxFilePath = process.argv[2];

  if (!crxFilePath) {
    console.error('请提供 CRX 文件路径');
    console.log('用法: node extension-id-utils.js <crx文件路径>');
    process.exit(1);
  }

  try {
    const extensionId = getExtensionIdFromCrx(crxFilePath);
    console.log('='.repeat(50));
    console.log(`CRX 文件: ${crxFilePath}`);
    console.log(`扩展 ID: ${extensionId}`);
    console.log('='.repeat(50));
  } catch (error) {
    console.error('错误:', error.message);
    process.exit(1);
  }
}
