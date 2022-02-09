import * as vscode from 'vscode';
import { IconDocPanel } from './panels/IconDocPanel';

export function activate(context: vscode.ExtensionContext) {
	const docCommand = vscode.commands.registerCommand("glyphviewer.start", () => {
		IconDocPanel.render(context.extensionUri);
	});
	context.subscriptions.push(docCommand);
}

export function deactivate() {}
