import * as vscode from 'vscode';
import { IconDocPanel } from './panels/IconDocPanel';

export function activate(context: vscode.ExtensionContext) {
	const docCommand = vscode.commands.registerCommand("glyphviewer.start", () => {
		IconDocPanel.render(context.extensionUri, context.workspaceState);
	});
	context.subscriptions.push(docCommand);
	// const svgFiles = [
	// 	'Linearicons-Free.svg',
	// 	'eWip/eWip.svg'
	// ]
	// context.workspaceState.update('svgFiles', svgFiles);
	//context.workspaceState.update('svgFiles', [])
	// const res: string[] = context.workspaceState.get('svgFiles') || [];
	// console.log(res);
	
	// res.forEach(r => console.log(r));
}

export function deactivate() {}
