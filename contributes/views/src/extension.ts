import path from 'path'
import * as vscode from 'vscode'

class SimpleTreeProvider implements vscode.TreeDataProvider<string> {
  getTreeItem(element: string): vscode.TreeItem {
    const treeItem = new vscode.TreeItem(element, vscode.TreeItemCollapsibleState.None)
    treeItem.iconPath = vscode.Uri.file(
      path.join(__filename, '..', '..', 'media', 'icon.svg')
    )
    return treeItem
  }

  getChildren(): Thenable<string[]> {
    return Promise.resolve(['lodash', 'react', 'vue'])
  }
}

export function activate(context: vscode.ExtensionContext) {
  vscode.commands.executeCommand('setContext', 'myCustomKey', true)
  const provider = new SimpleTreeProvider()
  vscode.window.createTreeView('nodeDependencies-demo', {
    treeDataProvider: provider
  })
}
