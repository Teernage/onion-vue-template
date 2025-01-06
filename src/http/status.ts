/**
 * 根据状态码获取对应的消息信息
 *
 * @param status 状态码，可以是数字或字符串类型
 * @param response 可选的响应对象，包含状态码和数据等信息
 * @returns 返回对应的消息字符串
 */
export async function getMessageInfo(
  status: number | string,
  response?,
): Promise<string> {
  let msg = "";
  switch (status) {
    case 400:
      msg = handleRCode(response.data.code);
      break;
    case 403:
      msg = handleRCode(response.data.code);
      break;
    case 401:
      msg = handleRCode(response.data.code);
      break;
    case 500:
      msg = handleRCode(response.data.code);
      break;
    case 503:
      msg = handleRCode(response.data.code);
      break;
    default:
      msg = `连接出错(${status})`;
  }
  return msg;
}

export function handleRCode(rcode: number): string {
  switch (rcode) {
    case 10008003:
      return "身份源用户无法加入其他团队";
    case 10008004:
      return "邀请码无效";
    case 10008005:
      return "用户加入团队需要审批";
    case 10008007:
      return "邀请码不存在或已过期，请重新输入";
    case 10008009:
      return "当前团队开启了指定身份源，不支持通过邀请码和邀请链接加入";
  }
  return null;
}
