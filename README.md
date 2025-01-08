# newtab

本项目是一个基于 Vue 3 和 Vite 开发的 Chrome 插件，用于自定义新标签页。通过该插件，用户可以在新标签页中展示个性化内容，提高浏览体验。

特点:

- 使用现代前端技术栈,提供流畅的用户体验
- 利用 Vue 的强大生态系统
- 自动化构建过程,一行命令轻松实现生成 crx 文件 和 文件信息

编辑器配置：

1. 编辑器安装 ESLint 和 Prettier 插件
2. 安装后,格式化使用 Prettier 格式
3. 配置保存自动格式化

## 环境要求

node 版本 20

安装依赖：
pnpm install


## 项目结构

CrxFile  

├── newtab.crx # crx 文件
├── newtab.pem # 证书
├── output # crx 文件的详细信息
├
dist vue 项目打包结果
├
scripts node 脚本
├── calculate-hash # 根据 crx 文件计算哈希值等信息
├── package-extension # 根据证书、vue 打包产物、crx 库件 自动化生成 crx 文件
src  
├── api # API 请求相关  
├── assets # 静态资源（图片、图标等）
├── BackgroundScript # 插件后台脚本  
├── components # 通用 Vue 组件  
├── directives # 自定义 vue 指令
├── enum # 枚举类型定义  
├── hooks # 自定义 Hooks  
├── http # HTTP 请求封装  
├── mock # Mock 数据  
├── router # 路由配置  
├── store # 状态管理（pinia）  
├── style # 样式文件  
├── types # TypeScript  
├── util # 工具函数  
└── views # 视图组件  
 └── App.vue # 主应用组件

## 开发

启动开发服务器：
pnpm run dev

如果在mac arm64 上运行报错(npm的一个已知bug导致的),请使用以下命令安装依赖:
npm install @rollup/rollup-darwin-arm64
或者
删除package-lock.json文件,重新安装依赖

## 构建

使用 `pnpm run chrome` 命令 打包补丁版本号 (1.0.0 → 1.0.1)

## 打包

打包后的crx文件位于 CrxFile 文件夹中。



## Git Hooks 配置  
在当前项目的根目录下,运行以下命令来设置文件的可执行权限:  

Windows系统:  
attrib +x .husky/pre-commit  

Mac/Linux系统:  
chmod +x .husky/pre-commit  


## 标签页加载流程:

[开始] → 用户打开新标签页  
 ↓  
检查是否有扩展重写新标签页  
 ↓ 如果有
创建新渲染进程  
 ↓  
加载标签页扩展的 index.html  
 ↓  
[结束] → 展示标签页

## 地址栏导航流程:

[开始] → 用户在地址栏输入百度地址  
 ↓  
用户确认导航（按回车）  
 ↓  
浏览器主进程接收导航请求  
 ↓  
初始化网络请求到百度  
 ↓  
创建新渲染进程 for 百度  
 |  
 +→ 旧渲染进程接收卸载事件  
 |  
 +→ 清除扩展新标签页内容  
 ↓  
接收百度服务器响应  
 ↓  
新渲染进程解析和渲染百度页面  
 ↓  
显示百度页面  
 ↓  
更新地址栏为www.baidu.com  
 ↓  
[结束] → 用户可与百度页面交互



