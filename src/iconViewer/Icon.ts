import * as vscode from 'vscode';

export class Icon extends vscode.TreeItem {
    constructor(
        public readonly name: string,
        public readonly svgUnicode: string,
        public readonly cssUnicode: string,
        public readonly content: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly command? : vscode.Command
    ) {
        super(name, collapsibleState);
    }
}