node 版本 20

pnpm install

pnpm run dev

打包 pnpm run chrome

打包产物在CrxFile文件夹下

在当前项目的根目录下,运行以下命令来设置文件的可执行权限:

window系统:

```text
attrib +x .husky/pre-commit
```

mac\linux系统:

```text
chmod +x .husky/pre-commit
```

下一次commit的时候可能还有警告，如果想永久禁用这个警告消息,你也可以运行以下命令

```text
git config advice.ignoredHook false
```
