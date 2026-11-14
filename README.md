# 灵感变异机 / Mutant Idea Lab

一个可安装的 DeepSeek Harness 界面插件，也能作为独立网页运行。

输入一个点子，抽取 1–3 张变异卡，把“反着做”“预算砍九成”“变成游戏”等思路组合成可编辑的实验方案。卡牌可以锁定和手选；方案支持收藏、历史恢复、Markdown 导出，以及向 DSH 当前会话插入深化提示词。

![灵感变异机桌面界面](https://raw.githubusercontent.com/jerry117/dsh-idea-mutator/0b0f52fe1faa6611232a97ea3725c01cce36e4d3/docs/preview.png)

## 立即试玩

需要 Node.js 22 或以上；主程序没有第三方依赖。

```sh
git clone https://github.com/jerry117/dsh-idea-mutator.git
cd dsh-idea-mutator
npm run dev
```

打开 <http://127.0.0.1:4173>。更换端口：`PORT=4174 npm run dev`。也可以直接打开 `lib/index.html`；建议使用本机服务，以保证剪贴板和浏览器存储行为一致。

## 安装到 DeepSeek Harness

### 在 DSH 界面中安装

项目已经包含构建产物。在 DSH 的“插件 → 添加插件”窗口，“包名或地址”栏只填下面这一行：

```text
github:jerry117/dsh-idea-mutator
```

点击安装，按界面提示启用或重启。这里不要填写 `npx`、`dsh plugin add` 等终端命令，也不要加引号、Markdown 链接或反引号。

也可以填克隆后的本地目录绝对路径（例如 `/path/to/dsh-idea-mutator`）。DSH 的“包名或地址”栏只接受安装地址，把完整终端命令填进去会报 `not a package name the registry accepts`。

### 在终端中安装

下面是终端命令，不是插件窗口的输入内容。桌面版先启动过一次以初始化配置，再完全退出 DSH，然后运行：

```sh
npx @deepseek-ai/dsh plugin --profile desktop add github:jerry117/dsh-idea-mutator
```

Web 版使用：

```sh
npx @deepseek-ai/dsh plugin --profile web add github:jerry117/dsh-idea-mutator
```

按照 DSH 的安装提示重新加载或重启。进入一个会话后，在输入框附近点击 **✳ 灵感变异机**。

也可以安装打包文件：

```sh
npm pack
npx @deepseek-ai/dsh plugin --profile web add "/path/to/dsh-idea-mutator/jerry117-dsh-idea-mutator-0.1.1.tgz"
```

### GitHub Packages

GitHub npm 包名为 `@jerry117/dsh-idea-mutator`，关联本仓库。

GitHub Packages 的 npm registry 在下载公开包时也要求认证。先按照 [GitHub 官方说明](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry) 使用具有 `read:packages` 权限的个人访问令牌（classic）登录；不要将令牌提交到仓库或填入聊天。

```sh
npm login --scope=@jerry117 --auth-type=legacy --registry=https://npm.pkg.github.com
npm config set @jerry117:registry https://npm.pkg.github.com
npm install @jerry117/dsh-idea-mutator@0.1.1
```

DSH 需要能读取相同的 npm registry 和认证配置，才可通过包名安装。若只想安装插件，推荐使用 [Release 安装包](https://github.com/jerry117/dsh-idea-mutator/releases/tag/v0.1.0)，无需 GitHub Packages 认证。

维护者可在 Actions 中手动运行 **Publish GitHub Package**，或发布后续 Release 来触发构建、测试和发布。发布前更新 `package.json` 的版本号；同一版本不能覆盖发布。

本插件按 2026-11-14 读取的 DSH 官方客户端模块契约实现：`dsh.client`、`./client`、`window.__ModuleLoader__`、`conversation.input.dock`、`InputActions.captureInsertion/insertText`。尚未完成真实 DSH 宿主中的加载与交接验证；插件层已有加载器/Slot 注册及草稿交接契约测试。

官方契约参考：[客户端模块](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/client/modules/README.md)、[输入动作定义](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/client/ui-conversation/src/client/contract/input.ts)、[插件声明实例](https://github.com/Nagi-ovo/dsh-ads/blob/main/package.json)。DSH 目前仍在演进，宿主升级后需要检查这些接口。

## 怎么玩

1. 输入想法，或拖入 `.txt` / `.md` 文件。最多 1600 字、单个文件 32 KB。
2. 选择微变（1 张）、跨界（2 张）或脑洞（3 张）。点击卡牌锁定，换牌时保留；展开卡库可以手选。
3. 点击“开始变异”，或按 Cmd/Ctrl + Enter。
4. 直接编辑标题与五个方案段落。修改会自动保存在当前浏览器。
5. 收藏喜欢的方案；在“灵感收藏夹”中可切换全部实验并恢复编辑。
6. 导出 Markdown，或交给 DSH 深化。

DSH 内的“交给 DSH 深化”会把包含当前编辑内容的提示词插入打开插件时捕获的草稿位置，**由你检查并发送**。如果草稿期间发生变化或处于提交锁定状态，修订检查会拒绝插入，保留方案并给出提示。未提供对应 API 的宿主，以及独立网页模式，使用复制提示词入口。复制失败会弹出可手动选中文字的窗口。

## 草案与数据

- 抽卡和初稿来自本地规则模板，界面明确标注“规则草案”，不调用模型，也不需要 API Key。
- 草案会组合所选卡牌的约束、原型实验、观察指标和风险；与具体业务相关的推理，需要在 DSH 里进一步深化。
- 本插件自身不发起外部网络请求，不包含分析 SDK 或远程字体。点击 DSH 的发送按钮后，提示词随该会话使用你配置的模型服务。
- 想法、编辑稿、收藏和最多 60 次历史存在 `localStorage` 的 `dsh-idea-mutator:v1` 下。未收藏的最旧记录会在容量满时腾出位置；60 条均被收藏时，先导出并移除记录才能继续生成。
- 同一浏览器来源共享一个实验室；不同端口、浏览器或 DSH 宿主来源之间不自动同步。清理站点数据会删除本地记录；需要长期保存时导出 Markdown。
- 浏览器存储不可用或已满时会显示提示；当前页面仍可编辑并导出。

## 开发与验证

```sh
npm run build
npm test
```

构建脚本使用 Node 内置模块，把网页打成单文件 HTML，再嵌入 DSH 客户端包。无需安装构建依赖。

浏览器端端到端测试需要自行提供 Playwright 与对应浏览器，先保持 `npm run dev` 运行：

```sh
npm run test:browser
```

可设置 `BROWSER_CHANNEL=chrome` 使用已安装 Chrome，`BROWSER_NODE_MODULES=/path/to/node_modules` 使用已有 Playwright，`PREVIEW_URL` 指定预览地址。截图与导出验证产物写入 `artifacts/`，不包含在插件安装包中。

测试覆盖抽卡唯一性与锁定、输入校验、卡牌差异、组合约束、编辑内容导出、历史恢复、加载器注册；浏览器检查覆盖桌面和手机布局、编辑刷新恢复、收藏、剪贴板、文件拖放、Markdown 下载、深化提示词和导入内容的纯文本处理。

## 文件

| 文件 | 用途 |
| --- | --- |
| `src/engine.js` | 12 张卡、抽卡规则、方案生成、导出及存储校验 |
| `src/app.js` | 独立实验室界面、编辑、历史、DSH 消息交接 |
| `src/style.css` | 响应式视觉样式和抽卡动画 |
| `src/client.cjs` | DSH 原生 Slot 入口、弹窗与草稿动作适配 |
| `src/index.js` | DSH 宿主入口 |
| `lib/client.js` | 可分发的 DSH 客户端构建产物 |
| `lib/index.html` | 可离线打开的独立应用 |

MIT License.
