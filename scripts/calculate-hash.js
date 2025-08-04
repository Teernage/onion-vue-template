import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import yauzl from 'yauzl';
import { fileURLToPath } from 'url';
import fse from 'fs-extra';
import {
  getExtensionIdFromCrx,
  getExtensionIdFromBuffer,
} from './extension-id-utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageJsonPath = path.resolve(__dirname, '..', 'package.json');
const packageJson = await fse.readJson(packageJsonPath);
const projectName = packageJson.name;

const crxFilePath = path.join(process.cwd(), 'CrxFile', `${projectName}.crx`);
const logFilePath = path.join(process.cwd(), 'CrxFile', 'output.log');

// try {
//   const extensionId = getExtensionIdFromCrx(crxFilePath);
//   console.log('扩展 ID:', extensionId);
// } catch (error) {
//   console.error('错误:', error.message);
// }

// 硬编码的插件信息
const extId = 'mkinglldbfofhlhajpicdhcbikpejiej';

// 获取命令行参数
const additionalContent = process.argv[2] || '';

// 计算 CRX 文件的哈希值
const crxBuffer = fs.readFileSync(crxFilePath);
const hash = crypto.createHash('sha256').update(crxBuffer).digest('hex');

/**
 * 解析 CRX 文件头部信息
 *
 * @param buffer 缓冲区对象，包含 CRX 文件内容
 * @returns 返回 ZIP 内容的起始位置
 * @throws 当 CRX 文件头部信息不符合规范时，抛出错误
 */
function parseCrxHeader(buffer) {
  if (buffer.toString('ascii', 0, 4) !== 'Cr24') {
    throw new Error('Invalid CRX file: incorrect magic number');
  }

  const version = buffer.readUInt32LE(4);
  if (version !== 3) {
    throw new Error(`Unsupported CRX version: ${version}`);
  }

  const headerSize = buffer.readUInt32LE(8);

  return 12 + headerSize; // 返回 ZIP 内容的起始位置
}

const zipStart = parseCrxHeader(crxBuffer);

/**
 * 处理zip文件内容
 *
 * @param zipBuffer zip文件的Buffer数据
 */
function processZipContent(zipBuffer) {
  yauzl.fromBuffer(zipBuffer, { lazyEntries: true }, (err, zipfile) => {
    if (err) throw err;

    zipfile.on('entry', (entry) => {
      if (entry.fileName.endsWith('manifest.json')) {
        zipfile.openReadStream(entry, (err, readStream) => {
          if (err) throw err;

          let jsonData = '';
          readStream.on('data', (chunk) => {
            jsonData += chunk;
          });

          readStream.on('end', () => {
            const manifest = JSON.parse(jsonData);
            const logContent = [
              `project: ${projectName}`,
              `version: ${manifest.version}`,
              `ext id: ${extId}`,
              `hash: ${hash}`,
              additionalContent ? `commit:${additionalContent}` : '',
            ]
              .filter(Boolean)
              .join('\n');

            fs.writeFile(logFilePath, logContent, (err) => {
              if (err) {
                console.error('Error writing to log file:', err);
              } else {
                console.log(`Log has been written to ${logFilePath}`);
              }
            });
          });
        });
      } else {
        zipfile.readEntry();
      }
    });

    zipfile.readEntry();
  });
}

const zipContentBuffer = crxBuffer.slice(zipStart);
processZipContent(zipContentBuffer);
