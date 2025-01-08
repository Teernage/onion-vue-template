# web-vue3-template


本项目是一个基于 Vue 3 和 Vite 开发的 web站点

特点:

- 使用现代前端技术栈,提供流畅的用户体验
- 利用 Vue 的强大生态系统

编辑器配置：

1. 编辑器安装 ESLint 和 Prettier 插件
2. 安装后,格式化使用 Prettier 格式
3. 配置保存自动格式化

## 环境要求

node 版本 20

安装依赖：
pnpm install


## 项目结构

onion-vue-template/  
├── .husky/                # Git hooks 配置  
├── commitlint/            # Git commit 提交规范配置  
├── dist/                  # 构建产物目录  
├── public/               # 静态公共资源  
└── src/                  # 源代码目录  
    ├── api/              # API 接口管理  
    │   └── modules/      # 按模块划分的接口文件  
    ├── assets/           # 静态资源文件  
    │   ├── images/       # 图片资源  
    │   ├── icons/        # 图标资源  
    │   └── styles/       # 全局样式资源  
    ├── BackgroundScript/ # 插件后台脚本  
    ├── components/       # 全局通用组件  
    │   ├── common/       # 基础通用组件  
    │   └── business/     # 业务通用组件  
    ├── directives/       # Vue 自定义指令  
    ├── enum/             # TypeScript 枚举定义  
    ├── hooks/            # Vue 组合式函数  
    ├── http/             # HTTP 请求封装  
    │   ├── axios.ts      # Axios 实例配置  
    │   └── interceptors/ # 请求/响应拦截器  
    ├── mock/             # 数据模拟  
    ├── router/           # 路由配置  
    │   ├── index.ts      # 路由入口  
    │   └── routes/       # 路由模块  
    ├── store/            # Pinia 状态管理  
    │   ├── index.ts      # store 入口  
    │   └── modules/      # 状态模块  
    ├── styles/           # 样式文件  
    │   ├── variables.scss # 全局变量  
    │   └── mixins.scss   # 全局混入  
    ├── types/            # TypeScript 类型定义  
    │   ├── components.d.ts # 组件类型声明  
    │   ├── env.d.ts      # 环境变量类型声明  
    │   └── global.d.ts   # 全局类型声明  
    ├── utils/            # 工具函数  
    │   ├── auth.ts       # 权限相关  
    │   ├── storage.ts    # 存储相关  
    │   └── validate.ts   # 验证相关  
    ├── views/            # 页面视图组件  
    │   └── modules/      # 按模块划分的页面  
    ├── App.vue           # 根组件  
    └── main.ts           # 应用入口文件  
├── .gitignore           # Git 忽略配置  
├── auto-imports.d.ts    # 自动导入声明文件  
├── components.d.ts      # 组件声明文件  
├── favicon.ico          # 网站图标  
├── global.d.ts          # 全局类型声明  
├── index.html          # HTML 模板  
├── package.json        # 项目依赖配置  
├── package-lock.json   # 依赖版本锁定  
├── pnpm-lock.yaml     # pnpm 依赖版本锁定  
├── README.md          # 项目说明文档  
├── tsconfig.json      # TypeScript 配置  
├── tsconfig.node.json # Node.js TypeScript 配置  
└── vite.config.ts     # Vite 构建配置

## 开发

启动开发服务器：
pnpm run dev


## 构建

使用 `pnpm run build` 命令 打包

## Git Hooks 配置  
在当前项目的根目录下,运行以下命令来设置文件的可执行权限:  

Windows系统:  
attrib +x .husky/pre-commit  

Mac/Linux系统:  
chmod +x .husky/pre-commit  

