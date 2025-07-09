import * as vscode from 'vscode'

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
    const client_id = 'Ov23liTqEH8qJYzUaUlD'
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
