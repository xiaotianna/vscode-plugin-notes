import * as path from 'path'
import * as vscode from 'vscode'

export function activate(context: vscode.ExtensionContext) {
    vscode.window.createTreeView('nodeDependencies-demo', {
      treeDataProvider: new NodeDepTreeProvider()
    })
  // vscode.window.registerTreeDataProvider(
  //   'nodeDependencies-demo',
  //   new NodeDepTreeProvider()
  // )
}

// 使用 implements，来实现TreeDataProvider接口
class NodeDepTreeProvider implements vscode.TreeDataProvider<NodeDepItem> {
  getChildren(
    element?: NodeDepItem | undefined
  ): vscode.ProviderResult<NodeDepItem[]> {
    // return [new NodeDepItem('a'), new NodeDepItem('b')]
    if (!element) {
      // 根节点
      return [
        new NodeDepItem('Level1-1', [
          new NodeDepItem('Level2-1', []),
          new NodeDepItem('Level2-2', [])
        ]),
        new NodeDepItem('Level1-2', [])
      ]
    } else {
      // 非叶子节点有子节点
      return element.children.length > 0 ? element.children : null
    }
  }

  getTreeItem(element: NodeDepItem): vscode.TreeItem {
    return element
  }

  onDidChangeTreeData?:
    | vscode.Event<void | NodeDepItem | NodeDepItem[] | null | undefined>
    | undefined
}

// 定义树结构子节点
class NodeDepItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    // 通过为 NodeDepItem 添加 children 属性并在 getChildren 中判断层级关系，可以轻松实现多级菜单树。
    public readonly children: NodeDepItem[] = []
  ) {
    super(label)
    // this上有很多属性，配置节点的信息
    this.description = 'nodeDepItem' + label
    // 当某个节点有 children 时，会自动变为可展开状态。
    this.collapsibleState =
      children.length > 0
        ? vscode.TreeItemCollapsibleState.Collapsed
        : vscode.TreeItemCollapsibleState.None
  }

  // this.iconPath
  iconPath = {
    light: path.join(__filename, '..', '..', 'media', 'icon.svg'),
    dark: path.join(__filename, '..', '..', 'media', 'icon.svg')
  } as any
}
