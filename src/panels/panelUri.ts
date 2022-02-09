import * as vscode from 'vscode';

export class PanelUri {
    constructor(
        public readonly toolkit: vscode.Uri,
        public readonly codicon: vscode.Uri,
        public readonly script: vscode.Uri,
        public readonly style: vscode.Uri
    ) {}
}