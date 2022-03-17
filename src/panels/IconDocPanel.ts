import * as vscode from "vscode";
import { IconFile } from "../iconViewer/IconFiles";
import { getRelativeUri, getUri } from "../utils/getURI";
import { FileQuickPickItem } from "./FileQuickPickItem";
import { PanelUri } from "./panelUri";

export class IconDocPanel {
    public static currentPanel: IconDocPanel | undefined;
    public readonly _panel: vscode.WebviewPanel;
    private _disposables: vscode.Disposable[] = [];
    private readonly uris: PanelUri;

    private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri, private readonly workspaceState: vscode.Memento) {      
        this._panel = panel;
        this.uris = this.initUri(this._panel.webview, extensionUri);
       
        this._panel.webview.html = this._getWebviewContent();
        this._panel.onDidDispose(this.dispose, null, this._disposables);
        this._setWebviewMessageListener(this._panel.webview);
        vscode.workspace.onDidChangeConfiguration(event => {
            if (event.affectsConfiguration("glyphviewer.backgroundColor") || event.affectsConfiguration("glyphviewer.foregroundColor")) {
                this.sendColors();
            }
        });
    }

    public static render(extensionUri: vscode.Uri, workspaceState: vscode.Memento) {      
        if (IconDocPanel.currentPanel) {
            IconDocPanel.currentPanel._panel.reveal(vscode.ViewColumn.One);
        } else {
            const panel = vscode.window.createWebviewPanel("icondoc", "SVG Glyph Preview", vscode.ViewColumn.One, {
                enableScripts: true,
                retainContextWhenHidden: true
            });

            IconDocPanel.currentPanel = new IconDocPanel(panel, extensionUri, workspaceState);
        }
    }

    public dispose() {
        IconDocPanel.currentPanel = undefined;
    }

    private _setWebviewMessageListener(webview: vscode.Webview) {
        webview.onDidReceiveMessage(
            (message: any) => {
                const command = message.command;
                const text = message.text;

                switch (command) {
                    case "error":
                        vscode.window.showErrorMessage(text);
                        return;
                    case "success":
                        vscode.window.showInformationMessage(text);
                        return;
                    case 'requestFiles':
                        this.sendFileToScript();
                        return;
                    case 'requestColors':
                        this.sendColors();
                        return;
                    case 'addFile':
                        vscode.window.showOpenDialog({canSelectFolders: false, canSelectMany: false, filters: { svg: ['svg']}})
                            .then(value => {
                                if (value) {
                                    const currentFiles: FileQuickPickItem[] = this.workspaceState.get('svgFiles') || [];
                                    const uri = getRelativeUri(value[0]);
                                    if (!currentFiles.find(f => f.detail === uri)) {  
                                        currentFiles.push(new FileQuickPickItem(uri, uri));
                                        IconFile.openFiles([new FileQuickPickItem(uri, uri)])
                                            .then(iconFiles => {
                                                iconFiles.forEach(iconFile => 
                                                    this._panel.webview.postMessage({command: "filesData", data: iconFile})
                                                );
                                            });
                                        this.workspaceState.update('svgFiles', currentFiles);
                                    }
                                    
                                }  
                            });
                        return;
                    case 'removeFile':
                        let currentFiles: FileQuickPickItem[] = this.workspaceState.get('svgFiles') || [];
                        vscode.window.showQuickPick(currentFiles, {placeHolder: 'search', title: 'Choose file to remove'}).then(res => {
                            if (res) {
                                const index = currentFiles.findIndex(f => f.detail === res.detail);
                                currentFiles.splice(index, 1);
                                this.workspaceState.update('svgFiles', currentFiles);                     
                                this._panel.webview.postMessage({command: "removeFromWebView", data: res.detail});
                            }       
                        });
                        return;
                    case 'changeDisplayName':
                        const dispName = text.displayName;
                        const path = text.filePath;
                        vscode.window.showInputBox({title: 'Display name', value: dispName}).then((res) => {
                            if (res && res.trim().length > 0) {
                                let currentFiles: FileQuickPickItem[] = this.workspaceState.get('svgFiles') || [];
                                const file = currentFiles.find(f => f.detail === path);
                                if (file) {
                                    file.label = res;
                                }
                                this.workspaceState.update('svgFiles', currentFiles);
                                this._panel.webview.postMessage({command: "updateNameOnWebview", data: { displayName: res, filePath: path}});
                            }
                        });
                        return;
                    case 'openSettings':
                        vscode.commands.executeCommand('workbench.action.openSettings', '@ext:ph0xe.svg-glyph-viewer');
                        return;
                }
            },
            undefined,
            this._disposables
        );
    }

    private sendFileToScript() {
        const currentFiles: FileQuickPickItem[] = this.workspaceState.get('svgFiles') || [];
        IconFile.openFiles(currentFiles)
            .then(iconFiles => {                
                iconFiles.forEach(iconFile => 
                    this._panel.webview.postMessage({command: "filesData", data: iconFile})
                );
            });
    }

    private sendColors() {      
        const { backgroundColor, foregroundColor } = vscode.workspace.getConfiguration('glyphviewer');
        this._panel.webview.postMessage({command: "updateColors", data: { backgroundColor, foregroundColor }})
    }

    toArrayOfPath(currentFiles: FileQuickPickItem[]): string[] {
        const res: string[] = [];
        currentFiles.forEach(f => res.push(f.detail!));
        return res;
    }

    private initUri(webview: vscode.Webview, extensionUri: vscode.Uri): PanelUri {
        return new PanelUri(
            getUri(webview, extensionUri, [
                "node_modules",
                "@vscode",
                "webview-ui-toolkit",
                "dist",
                "toolkit.js",
            ]),
            getUri(webview, extensionUri, [
                "node_modules",
                "@vscode",
                "codicons",
                "dist",
                "codicon.css",
            ]),
            getUri(webview, extensionUri, ["res", "main.js"]),
            getUri(webview, extensionUri, ["res", "style.css"])
        );
    }

    private _getWebviewContent() {
        return /*html*/ `
        <!DOCTYPE html><html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <script type="module" src="${this.uris.toolkit}"></script>
            <script type="module" src="${this.uris.script}"></script>
            <link href="${this.uris.style}" rel="stylesheet">
            <link href="${this.uris.codicon}" rel="stylesheet">
            <title>Made by pH0xe</title>
        </head>
        <body>
            <header>
                <vscode-button appearance="icon" aria-label="Open extension settings" id="btn-settings" style="float: right;">
                    <span class="codicon codicon-settings"></span>
                </vscode-button>
                <h1>SVG Glyph Viewer</h1>
                
                <div>
                    <vscode-text-field placeholder="Search" id="searchBar">
                        <span slot="start" class="codicon codicon-search"></span>
                    </vscode-text-field>
                    <div>
                        <vscode-button id="btn-add">
                            Add file
                            <span slot="start" class="codicon codicon-add"></span>
                        </vscode-button>
                        <vscode-button id="btn-remove">
                            Remove file
                            <span slot="start" class="codicon codicon-remove"></span>
                        </vscode-button>
                    </div>
                <div>
            </header>
            <main id="main-section"></main>
            <template id="article">
                <article hidden="0" class="icon-article" icon-name="">
                    <svg class="icon" viewBox="0 64 1024 1024">
                        <title></title>
                        <path transform-origin="512 512" transform="scale(.75 -.75)" d=""></path>
                    </svg>
                    <div class="copyValue">
                        <button class="unicodeButton svg"></button>
                        <button class="unicodeButton css"></button>
                    </div>
                </article>
            </template>
            <template id="section">
                <section>
                    <button class="collapsible-button">
                        <div style="display: flex; align-items:center">
                            <span id="content"></span>
                            <vscode-progress-ring style="margin-left:20px"></vscode-progress-ring>
                        </div>
                        <div class="collapsible-button-actions">
                            <vscode-button appearance="icon" aria-label="Edit display name" class="btn-edit-name">
                                <span class="codicon codicon-edit"></span>
                            </vscode-button>
                            <span slot="end" class="btn-chevron codicon codicon-chevron-down"></span>
                        </div>
                    </button>
                    <div class="collapsible-section">
                    </div>
                    <vscode-divider></vscode-divider>
                </section>
            </template>
        </body>
        </html>
        `;
    }
}

