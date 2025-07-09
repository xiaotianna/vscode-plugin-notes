# 🧩 如何开发一款 VS Code 插件

官方文档：https://code.visualstudio.com/api/

其他文档：https://liiked.github.io/VS-Code-Extension-Doc-ZH/#/

# 一、概述

vscode是作为前端开发者最常用的代码编辑器了，在vscode的扩展中有非常多的插件，能够帮助我们提高开发效率，增强vscode功能，那么你有没有想过自己去开发一款vscode插件呢？下面跟着本文一起学习如何开发vscode插件。

首先，我们先说说vscode插件可以做些什么：

- 主题设置：通过颜色或文件图标主题更改 VS Code 的外观
- 扩展工作区：在用户界面中添加自定义组件和视图
- Webview：创建一个 Webview 来显示使用 HTML/CSS/JS 构建的自定义网页
- 语言扩展：支持一种新的编程语言
- 调试扩展：支持调试特定的运行时环境 

话不多说，开始进入我们的开发之旅吧！

# 二、开发准备

首先安装我们的node环境（当前使用的是Node v20.18.3），这步网上都有教程（略）

## 1、安装cli

安装 [Yeoman](https://yeoman.io/) 和 [VS Code Extension Generator](https://www.npmjs.com/package/generator-code)

```bash
npm install -g yo generator-code
```

不想全局安装也可以使用下面的命令：（这一步直接到初始化项目）

```bash
npx --package yo --package generator-code -- yo code
```

> 这两个库是干嘛的呢？
>
> Yeoman：是一个用于快速生成项目脚手架的开源工具库
>
> VS Code Extension Generator：是 Yeoman 的一个官方生成器（Generator），专门用于快速创建 Visual Studio Code 扩展（插件）的项目脚手架。

## 2、初始化项目

```bash
yo code
```

输入完成后，终端会有以下内容：

```bash
yo code

     _-----_     ╭──────────────────────────╮
    |       |    │   Welcome to the Visual  │
    |--(o)--|    │   Studio Code Extension  │
   `---------´   │        generator!        │
    ( _´U`_ )    ╰──────────────────────────╯
    /___A___\   /
     |  ~  |
   __'.___.'__
 ´   `  |° ´ Y `

? What type of extension do you want to create? (Use arrow keys)
❯ New Extension (TypeScript)
  New Extension (JavaScript)
  New Color Theme
  New Language Support
  New Code Snippets
  New Keymap
  New Extension Pack
  New Language Pack (Localization)
  New Web Extension (TypeScript)
  New Notebook Renderer (TypeScript)
```

这里我们就默认选择第一个就行

```bash
yo code

     _-----_     ╭──────────────────────────╮
    |       |    │   Welcome to the Visual  │
    |--(o)--|    │   Studio Code Extension  │
   `---------´   │        generator!        │
    ( _´U`_ )    ╰──────────────────────────╯
    /___A___\   /
     |  ~  |
   __'.___.'__
 ´   `  |° ´ Y `

? What type of extension do you want to create? New Extension (TypeScript) # 上一步选择的模版
? What's the name of your extension? vs-demo # 插件名称，小写，并且不能有空格
? What's the identifier of your extension? vs-demo # 插件标识，跟着上面的默认就行
? What's the description of your extension? 这是一个vscode插件demo # 插件描述
? Initialize a git repository? Yes # 是否初始化git
? Which bundler to use? webpack # 使用的打包工具
? Which package manager to use? pnpm # 使用的包管理器
```

## 3、认识项目结构

![](./img/01-项目结构.png)

### 3.1 .vscode 目录

- extensions.json：推荐 VS Code 扩展列表，团队协作时统一开发依赖的扩展（比如推荐 ESLint、Prettier 等）
- launch.json：调试配置文件，定义 VS Code 的调试启动方式（比如 Node.js 调试、扩展调试的入口、参数）
- settings.json：项目级 VS Code 设置，覆盖全局设置，可配置代码格式化、校验规则等
- tasks.json：定义 VS Code 的任务（比如编译、打包、测试脚本），通过 Ctrl/Cmd + Shift + B 触发

> 这个目录平时很少接触，等下调试需要用到 `launch.json` 

### 3.2 package.json

这个文件也很重要，包括事件激活，命令注册等，`activationEvents` 和 `contributes` 字段下面会细说

```json
{
  "name": "vs-demo", // 扩展的唯一标识符（在 VS Code 市场中必须唯一），只能包含小写字母、数字和连字符
  "displayName": "vs-demo", // 在 VS Code 市场和扩展面板中显示的名称
  "description": "这是一个vscode插件demo", // 扩展的简要描述，显示在市场列表中
  "version": "0.0.1",
  "engines": { // 运行环境
    "vscode": "^1.101.0" // 指定扩展兼容的 VS Code 版本范围（^1.101.0 表示兼容 1.101.0 及以上，但不包括 2.0.0）
  },
  "categories": [ // 扩展在 VS Code 市场中的分类（如 Other、Programming Languages、Snippets 等）
    "Other"
  ],
  "activationEvents": [], // 激活事件，例如：
  /**
    "onCommand:vs-demo.helloWorld"：用户执行命令时激活。
    "onStartupFinished"：VS Code 启动完成后激活。
    "onLanguage:python"：打开特定语言文件时激活。
  */
  "main": "./dist/extension.js",
  "contributes": { // 定义扩展向 VS Code 贡献的功能
    /**
    - commands：注册命令（可通过 Ctrl/Cmd + Shift + P 调用）。
    	- command：命令的唯一标识符（格式：扩展名称.命令名）。
    	- title：命令在命令面板中显示的名称。
    - 其他常见贡献点：
    	- menus：自定义菜单（如编辑器右键菜单）。
    	- keybindings：快捷键绑定。
    	- configuration：用户可配置的设置项。
    	- views：侧边栏视图。
    */
    "commands": [
      {
        "command": "vs-demo.helloWorld",
        "title": "Hello World"
      }
    ]
  },
  "scripts": {
    "vscode:prepublish": "pnpm run package",
    "compile": "webpack",
    "watch": "webpack --watch",
    "package": "webpack --mode production --devtool hidden-source-map",
    "compile-tests": "tsc -p . --outDir out",
    "watch-tests": "tsc -p . -w --outDir out",
    "pretest": "pnpm run compile-tests && pnpm run compile && pnpm run lint",
    "lint": "eslint src",
    "test": "vscode-test"
  },
  "devDependencies": {
    "@types/vscode": "^1.101.0",
    "@types/mocha": "^10.0.10",
    "@types/node": "20.x",
    "@typescript-eslint/eslint-plugin": "^8.31.1",
    "@typescript-eslint/parser": "^8.31.1",
    "eslint": "^9.25.1",
    "typescript": "^5.8.3",
    "ts-loader": "^9.5.2",
    "webpack": "^5.99.7",
    "webpack-cli": "^6.0.1",
    "@vscode/test-cli": "^0.0.10",
    "@vscode/test-electron": "^2.5.2"
  }
}
```

## 4、运行项目

打开 `package.json` ，看到 `script` 字段，可以运行 `compile` 或者 `watch` 命令，配置`.vscode/launch.json` 配置调试命令。

如果是用脚手架生成的项目，直接点击“启动调试”，会自动执行命令，这时候就会打开一个新的vscode调试窗口

![04-运行项目](/Users/lantianyu/Desktop/notes-vs-plugin有笔记/img/04-运行项目.png)

我们看一下初始化项目的逻辑：

- package.json：注册一个命令

```json
"contributes": {
  "commands": [
    {
      "command": "vs-demo.helloWorld", // 唯一就行
      "title": "Hello World" // Ctrl/Cmd + Shift + p 输入到命令窗口的内容
    }
  ]
}
```

- extension.ts

```ts
import * as vscode from 'vscode';

// 当插件被激活触发
export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "vs-demo" is now active!');
  // 注册命令
  // 注意，这里注册的命令必须和 package.json 文件中的 contributes.commands 数组中的 command 命令配置的一致
	const disposable = vscode.commands.registerCommand('vs-demo.helloWorld', () => {
    // 右下角展示提示信息
		vscode.window.showInformationMessage('Hello World from vs-demo!');
	});
  // 事件入栈，将一个可释放资源（如事件订阅、命令注册等）添加到扩展上下文的清理列表中，确保在扩展停用时能够自动释放这些资源
	context.subscriptions.push(disposable);
}

// 当插件停用时触发
export function deactivate() {}
```

输入 `Ctrl/Cmd + Shift + P` 后，在命令框中输入 `package.json` 的 `contributes.commands` 的 `title` 字段：Hello World 后回车，就会在右下角出现提示信息

![](./img/04-运行项目-2.png)

![](./img/04-运行项目-3.png)

# 三、package.json 的 activationEvents 字段

官方文档：https://code.visualstudio.com/api/references/activation-events

`activationEvents` 激活事件，当激活事件发生时，你的扩展会被激活。以下是所有可用的激活事件列表：

- [`onAuthenticationRequest`](https://code.visualstudio.com/api/references/activation-events#onAuthenticationRequest)
- [`onChatParticipant`](https://code.visualstudio.com/api/references/activation-events#onChatParticipant)
- [`onCommand`](https://code.visualstudio.com/api/references/activation-events#onCommand)
- [`onCustomEditor`](https://code.visualstudio.com/api/references/activation-events#onCustomEditor)
- `onDebug`
  - [`onDebugAdapterProtocolTracker`](https://code.visualstudio.com/api/references/activation-events#onDebugAdapterProtocolTracker)
  - [`onDebugDynamicConfigurations`](https://code.visualstudio.com/api/references/activation-events#onDebugDynamicConfigurations)
  - [`onDebugInitialConfigurations`](https://code.visualstudio.com/api/references/activation-events#onDebugInitialConfigurations)
  - [`onDebugResolve`](https://code.visualstudio.com/api/references/activation-events#onDebugResolve)
- [`onEditSession`](https://code.visualstudio.com/api/references/activation-events#onEditSession)
- [`onFileSystem`](https://code.visualstudio.com/api/references/activation-events#onFileSystem)
- [`onIssueReporterOpened`](https://code.visualstudio.com/api/references/activation-events#onIssueReporterOpened)
- [`onLanguage`](https://code.visualstudio.com/api/references/activation-events#onLanguage)：当打开一个解析为特定语言的文件时，将发出此激活事件，相关的扩展将被激活
- [`onLanguageModelTool`](https://code.visualstudio.com/api/references/activation-events#onLanguageModelTool)
- [`onNotebook`](https://code.visualstudio.com/api/references/activation-events#onNotebook)
- [`onOpenExternalUri`](https://code.visualstudio.com/api/references/activation-events#onOpenExternalUri)
- [`onRenderer`](https://code.visualstudio.com/api/references/activation-events#onRenderer)
- [`onSearch`](https://code.visualstudio.com/api/references/activation-events#onSearch)
- [`onStartupFinished`](https://code.visualstudio.com/api/references/activation-events#onStartupFinished)
- [`onTaskType`](https://code.visualstudio.com/api/references/activation-events#onTaskType)
- [`onTerminalProfile`](https://code.visualstudio.com/api/references/activation-events#onTerminalProfile)
- [`onUri`](https://code.visualstudio.com/api/references/activation-events#onUri)
- [`onView`](https://code.visualstudio.com/api/references/activation-events#onView)
- [`onWalkthrough`](https://code.visualstudio.com/api/references/activation-events#onWalkthrough)
- [`onWebviewPanel`](https://code.visualstudio.com/api/references/activation-events#onWebviewPanel)
- [`workspaceContains`](https://code.visualstudio.com/api/references/activation-events#workspaceContains)
- [`*`](https://code.visualstudio.com/api/references/activation-events#Start-up)

这里的事件还是挺多的，我们举例**onLanguage**试试：

`onLanguage` 当打开一个解析为特定语言的文件时，将发出此激活事件，相关的扩展将被激活。`onLanguage` 事件接受一个语言标识符值。

```json
"activationEvents": [
    "onLanguage:json",
    "onLanguage:markdown",
    "onLanguage:typescript"
]
```

> 1. 在从 VS Code 1.74.0 版本开始，您的扩展所贡献(`contributes`)的语言不再需要相应的 `onLanguage` 激活事件声明，您的扩展就会被激活。
> 2. 也就是如果插件**贡献**了某个语言相关的功能（如语法高亮、补全等），则无需再显式声明 `"onLanguage:xxx"` 激活事件，但不是无条件默认激活的，有些情况还是需要书写`activationEvents`。
> 3. 什么是“**你贡献了该语言的功能**”，例如：
>    - 提供了该语言的语义高亮
>    - 注册了该语言的代码片段
>    - 实现了该语言的语言服务器客户端等

demo需求：

1. 打开ts文件，点击右键展示“Open Ts File”，右下角展示消息提示

![02-demo需求2](./img/02-demo需求2.png)


![](./img/02-demo需求1.png)

2. 底部状态栏展示打开的ts文件路径

![](./img/03-demo需求3.png)

demo步骤：

1. package.json

需要在 `contributes.commands` 注册命令，然后 `menus.['editor/context']` 向编辑器提供菜单项

```json
"activationEvents": [
  "onLanguage:typescript"
],
"contributes": {
  "commands": [
    {
      "command": "open-ts-file", // 注册命令
      "title": "Open Ts File"
    }
  ],
  "menus": {
    "editor/context": [
      {
        "command": "open-ts-file",
        "when": "editorLangId == typescript || editorLangId == javascript", // 当遇到ts或js展示
        "group": "navigation"
      }
    ]
  }
},
```

2. src/extension.ts

```ts
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  console.log('Open Ts File 插件已激活!');

  // 注册命令（需求：打开ts文件，点击右键展示“Open Ts File”，右下角展示消息提示）
  const inspectCommand = vscode.commands.registerCommand(
    'open-ts-file', 
    async () => {
      // 当前开发的编辑器窗口
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showInformationMessage('请先打开一个TypeScript/JavaScript文件');
        return;
      }
      // 获取编辑器内容
      const document = editor.document;
      const text = document.getText();
      try {
        // 右下角展示提示
        vscode.window.showInformationMessage('打开了ts文件, 文件内容为: ', text);
      } catch (error) {
        vscode.window.showErrorMessage(`失败: ${(error as Error).message}`);
      }
    }
  );

  // 注册文档打开事件监听（需求：底部状态栏展示打开的ts文件路径）
  const docOpenListener = vscode.workspace.onDidOpenTextDocument(document => {
    if (['typescript', 'javascript'].includes(document.languageId)) {
      vscode.window.setStatusBarMessage(
        `hello, 你打开了一个ts文件: ${document.fileName}`, 
        3000
      );
    }
  });

  // 添加到插件上下文以便清理
  context.subscriptions.push(inspectCommand);
  context.subscriptions.push(docOpenListener);
}

export function deactivate() {}
```

⚠️ 注意：官网上说 `activationEvents` 不写也会默认激活，但是在开发的时候发现当不写 `activationEvents.onLanguage` 时，`vscode.workspace.onDidOpenTextDocument` 默认不会触发，只有当右键点击"Open Ts File"菜单后才会激活。

原因是：这里只是监听了一个事件（比如 `vscode.workspace.onDidOpenTextDocument`），但没有为该语言提供任何具体贡献，则不会自动激活插件。至于当右键点击"Open Ts File"菜单后激活，是因为触发了`activate` 方法导致的激活，才开启的`onDidOpenTextDocument`监听，自然在这之前是不会显示提示内容。

# 四、package.json 的 contributes（贡献点）字段

`contributes` 配置项是整个插件的贡献点，表明这个插件有什么功能

官方文档：https://code.visualstudio.com/api/references/contribution-points

- [`authentication`](https://code.visualstudio.com/api/references/contribution-points#contributes.authentication)：声明支持的身份验证提供程序（Authentication Providers）。这些提供程序允许插件在需要时请求用户登录，并安全地管理用户的凭据。
- [`colors`](https://code.visualstudio.com/api/references/contribution-points#contributes.colors)：主题颜色
- [`commands`](https://code.visualstudio.com/api/references/contribution-points#contributes.commands)：命令，通过 `control/cmd + shift + p `打开命令窗口进行输入来实现的
- [`customEditors`](https://code.visualstudio.com/api/references/contribution-points#contributes.customEditors)：自定义编辑器
- [`grammars`](https://code.visualstudio.com/api/references/contribution-points#contributes.grammars)：可以在这个配置项里设置描述语言的语法文件的路径，vscode可以根据这个语法文件来自动实现语法高亮功能
- [`icons`](https://code.visualstudio.com/api/references/contribution-points#contributes.icons)：按 ID 提供新图标以及默认图标
- [`iconThemes`](https://code.visualstudio.com/api/references/contribution-points#contributes.iconThemes)：icon主题色
- [`menus`](https://code.visualstudio.com/api/references/contribution-points#contributes.menus)：自定义编辑器菜单，包括右键菜单、头部菜单
- [`submenus`](https://code.visualstudio.com/api/references/contribution-points#contributes.submenus)：子菜单作为可以贡献菜单项的占位符，子菜单要求在父菜单中显示 label
- [`terminal`](https://code.visualstudio.com/api/references/contribution-points#contributes.terminal)：终端
- [`themes`](https://code.visualstudio.com/api/references/contribution-points#contributes.themes)：颜色主题
- [`views`](https://code.visualstudio.com/api/references/contribution-points#contributes.views)：配置活动栏对应的view视图
- [`viewsContainers`](https://code.visualstudio.com/api/references/contribution-points#contributes.viewsContainers)：可以贡献自定义视图的视图容器
- [`viewsWelcome`](https://code.visualstudio.com/api/references/contribution-points#contributes.viewsWelcome)：引导页，向自定义视图贡献欢迎内容

`contributes`有非常的多内容（上面不完整），我们选上面有的内容进行使用演示

## 1、contributes.authentication

> 这部分源码可以在git的`contributes/authentication`目录下找到

`contributes.authentication` 的作用是在 VS Code 插件中声明支持的身份验证提供程序（Authentication Providers）。这些提供程序允许插件在需要时请求用户登录，并安全地管理用户的凭据。

具体来说：

- `id`: 是身份验证提供程序的唯一标识符，用于在代码中引用该提供者。
- `label`: 是显示给用户的名称，表示这个身份验证提供程序的用途。

```json
"contributes": {
  "authentication": [
    {
      "label": "GitHub",
      "id": "github" // 自定义的，vscode默认的是github，尽量避开
    },
    {
      "label": "Azure Dev Ops",
      "id": "azuredevops"
    }
  ]
}
```

这段配置表示插件支持通过 GitHub 进行身份验证。插件可以通过 `vscode.authentication.getSession("github", ...)` 等 API 获取用户登录状态和访问令牌。

要使用 `contributes.authentication` 中定义的身份验证提供程序（如 GitHub 和 Azure DevOps），你需要在插件代码中调用 VS Code 提供的认证 API 来获取用户的会话信息。

步骤展示如下：

### 1.1 申请Github OAuth App

打开github：https://github.com/settings/developers

点击 “New OAuth App”，申请一下，这里需要注意以下几点：

- Application name：应用名称
- Authorization callback URL：这个非常重要‼️，当授权成功后，会跳转的页面就是这个
- Client ID：后续向github发起登录请求时需要

![](./img/05-Github OAuth App.png)

### 1.2 配置 package.json

- commands：新增两个命令，通过 `Ctrl/Cmd + Shift + P` 打开的命令面板输入，“Login Github”或者“Logout Github”会触发对应的激活回调

```json
"contributes": {
  "commands": [
    {
      "command": "vs-demo.loginGitHub",
      "title": "Login GitHub"
    },
    {
      "command": "vs-demo.logoutGitHub",
      "title": "Logout GitHub"
    }
  ],
  "authentication": [
    {
      "id": "my-github-provider",
      "label": "GitHub"
    }
  ]
},
```

### 1.3 extension.ts

- activate：当插件贡献点激活时触发

这里注册了三个事件：

1、自定义登录，对应package.json的`contributes.authentication`

2、登录命令`Login GitHub`：输入后触发登录

3、退出登录命令`Logout GitHub`

```ts
import * as vscode from 'vscode'

export async function activate(context: vscode.ExtensionContext) {
  // 初始化 GitHub 认证提供者
  const githubProvider = new GitHubAuthenticationProvider()

  // 使用 vscode.authentication.registerAuthenticationProvider 方法注册自定义身份验证提供者
  // 这一步让 VS Code 知道你的插件支持 GitHub 登录
  context.subscriptions.push(
    vscode.authentication.registerAuthenticationProvider(
      'my-github-provider', // 与package.json中的contributes.authentication的id一致
      'GitHub', // 与package.json中的contributes.authentication的label一致
      githubProvider
    )
  )

  // 绑定一个命令让用户主动触发登录
  context.subscriptions.push(
    vscode.commands.registerCommand('vs-demo.loginGitHub', async () => {
      // 当用户执行 vs-demo.loginGitHub 命令时，调用 getSession() 获取或创建一个 GitHub 登录会话
      const session = await vscode.authentication.getSession(
        'my-github-provider',
        // scopes，是你请求用户授权的权限范围。这些权限决定了你的应用可以访问用户的哪些资源。
        /**
         * 例如：
         * - user：最基本的权限，可读取用户公开信息（如用户名、邮箱等）
         * - repo：允许你的应用访问用户仓库，如创建、更新、删除仓库，权限最大
         * - public_repo：可访问公共仓库（读写）
         * ...等等
         */
        ['user'],
        // 如果没有现有会话且 { createIfNone: true }
        // 将触发 githubProvider 的 createSession 方法（即打开浏览器进行 OAuth 授权）
        { createIfNone: true }
      )
      if (session) {
        vscode.window.showInformationMessage(
          `已登录 GitHub：${JSON.stringify(session)}`
        )
      }
    })
  )

  // 退出登录
  context.subscriptions.push(
    vscode.commands.registerCommand('vs-demo.logoutGitHub', async () => {
      // 获取登录的会话session
      const sessions = await githubProvider.getSessions()
      if (sessions.length === 0) {
        vscode.window.showInformationMessage('当前没有活跃的 GitHub 会话')
        return
      }

      // 移除第一个会话（也可以根据需要选择多个）
      await githubProvider.removeSession(sessions[0].id)
      vscode.window.showInformationMessage('已退出 GitHub 登录')
    })
  )
}

export function deactivate() {}
```

- GitHubAuthenticationProvider：用于提供 GitHub 身份认证能力，支持登录、登出、获取会话等功能。重写`vscode.AuthenticationProvider`的方法即可

这里参考文档的时候，需要把代码中的`const client_id = xxx`部分填入自己的client id即可

```ts
// 实现了 vscode.AuthenticationProvider 接口
// 用于提供 GitHub 身份认证能力，支持登录、登出、获取会话等功能
class GitHubAuthenticationProvider implements vscode.AuthenticationProvider {
  // 用于向 VS Code 发送会话变更事件（新增、删除、修改），用来触发 onDidChangeSessions 事件
  private _sessionChangeEmitter =
    new vscode.EventEmitter<vscode.AuthenticationProviderAuthenticationSessionsChangeEvent>()
  // 本地存储用户身份会话信息
  private _sessions: vscode.AuthenticationSession[] = []

  // 提供给 VS Code 监听会话变化的接口
  get onDidChangeSessions() {
    return this._sessionChangeEmitter.event
  }

  // 返回当前所有已登录的 GitHub 会话
  async getSessions(): Promise<vscode.AuthenticationSession[]> {
    return this._sessions
  }

  async createSession(scopes: string[]): Promise<vscode.AuthenticationSession> {
    // 在 OAuth 2.0 认证流程中，state 参数是一个可选但强烈推荐使用的参数，后续可以判断服务器的state和本地生成的是否一致
    const state = Math.random().toString(36).substring(2)
    const port = 8080
    // 授权成功后，重定向地址
    const redirectUri = `http://localhost:${port}`
    // GitHub Client ID
    const client_id = 'xxxxx'
    // 构造 GitHub OAuth 登录链接
    const loginUrl = `https://github.com/login/oauth/authorize?client_id=${client_id}&scope=${scopes.join(
      '%20'
    )}&state=${state}&redirect_uri=${redirectUri}`

    // 打开浏览器进行授权
    vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(loginUrl))

    // 启动本地 HTTP 服务器
    // 用于接收 GitHub OAuth 认证流程中的回调请求，并从回调 URL 中提取认证代码（code）
    const token = await new Promise<string>((resolve, reject) => {
      const server = require('http').createServer((req: any, res: any) => {
        // url：http://localhost:8080/?code=xxxxxxxx
        const url = new URL(req.url, redirectUri)
        const code = url.searchParams.get('code')
        // 如何有id，就向8080页面响应
        if (code) {
          res.end(`<script>
            document.write('<h1>GitHub Login Success, close after 3 seconds</h1></br><code>${code}</code>')
          </script>`)
          server.close()
          resolve(code)
        } else {
          res.writeHead(400)
          res.end('No code found')
          reject(new Error('No code in callback'))
        }
      })

      server.listen(port, () => {
        console.log(`Listening for GitHub auth callback on port ${port}`)
      })
    })

    // 模拟从 code 获取 access token（实际应调用 GitHub API）
    const accessToken = await this.exchangeCodeForToken(token)

    // 创建并保存 session
    const session: vscode.AuthenticationSession = {
      id: 'github-session-id',
      accessToken,
      scopes,
      account: { label: 'User', id: 'user-id' }
    }
    this._sessions.push(session)
    this._sessionChangeEmitter.fire({
      added: [session],
      removed: [],
      changed: []
    })

    return session
  }

  // 根据 sessionId 删除对应的会话
  async removeSession(sessionId: string): Promise<void> {
    const sessionIndex = this._sessions.findIndex(
      (session) => session.id === sessionId
    )
    if (sessionIndex > -1) {
      const deleted = this._sessions.splice(sessionIndex, 1)
      // 触发 onDidChangeSessions 事件通知 UI 更新
      this._sessionChangeEmitter.fire({
        added: [],
        removed: deleted,
        changed: []
      })
    }
  }

  private async exchangeCodeForToken(code: string): Promise<string> {
    // 这里应向 GitHub 发起请求，把这个 code 交换成 accessToken
    return 'mocked-access-token'
  }
}
```

### 1.4 测试

当输入“Login Github”，点击“允许”后，会展示下面的页面：

![](./img/06-github授权-1.png)

点击授权后，浏览器会跳转到`http://localhost:8080/?code=xxxxxxxx`页面，此时的vscode调试窗口已经底部出现登录信息：

![](./img/06-github授权-2.png)



# 五、extension.ts 文件

`extension.ts`是插件工程的入口文件，也就是 webpack.config.js 中打包的入口文件，当插件被激活，即触发`package.json`中的`activationEvents`配置项时，`extension.ts`文件开始执行。

`extension.ts`文件将导出两个方法：`activate`和`deactivate`，其执行时机如下所示：

- activate: 插件被激活时执行的函数
- deactivate: 插件被销毁时调用的方法，比如释放内存等

在 `extension.ts`中对需要的功能进行注册，主要使用`vscode.commands.register...`相关的api，来为`package.json`中的`contributes`配置项中的事件绑定方法或者监听器。 `vscode.commands.register...`相关的api主要有：

- vscode.commands.registerCommand()  注册命令

- vscode.languages.registerCompletionItemProvider()   代码补全

- vscode.languages.registerCodeActionsProvider() 注册一个代码操作提供者

- vscode.languages.registerCodeLensProvider()

- vscode.languages.registerHoverProvider()  代码悬浮提示



