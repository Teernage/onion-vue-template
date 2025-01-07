node 版本 20  

## 安装依赖  
pnpm install  

## 开发  
pnpm run dev  

## 打包  
pnpm run chrome  
打包产物在CrxFile文件夹下  

## Git Hooks 配置  
在当前项目的根目录下,运行以下命令来设置文件的可执行权限:  

Windows系统:  
attrib +x .husky/pre-commit  

Mac/Linux系统:  
chmod +x .husky/pre-commit  

如果想永久禁用这个警告消息,你也可以运行:  
git config advice.ignoredHook false