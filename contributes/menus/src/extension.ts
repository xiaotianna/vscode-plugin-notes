import * as vscode from 'vscode'

export function activate(context: vscode.ExtensionContext) {
  //   console.log('Extension is active');

  //   const loginCommand = vscode.commands.registerCommand('vs-demo.loginGitHub', () => {
  //     vscode.window.showInformationMessage('GitHub 登录被触发');
  //   });

  //   context.subscriptions.push(loginCommand);

  //   // 添加状态栏按钮
  //   const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
  //   statusBarItem.text = `$(github) Login`;
  //   statusBarItem.tooltip = 'Login with GitHub';
  //   statusBarItem.command = 'vs-demo.loginGitHub';
  //   statusBarItem.show();

  const closeCommand = vscode.commands.registerCommand(
    'vs-demo.closeCurrentEditor',
    () => {
      vscode.commands.executeCommand('workbench.action.closeActiveEditor')
    }
  )

  context.subscriptions.push(closeCommand)
}
