import * as vscode from "vscode";
import { Uri } from "vscode";
import { Icon } from "../iconViewer/Icon";
import { IconExtractor } from "../iconViewer/IconExtractor";
import { IconFile } from "../iconViewer/IconFiles";
import { getUri } from "../utils/getURI";
import { PanelUri } from "./panelUri";

export class IconDocPanel {
    public static currentPanel: IconDocPanel | undefined;
    private readonly _panel: vscode.WebviewPanel;
    private _disposables: vscode.Disposable[] = [];
    private readonly uris: PanelUri;

    private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {      
        this._panel = panel;
        this.uris = this.initUri(this._panel.webview, extensionUri);

        const iconsFiles = IconExtractor.openFiles(['Linearicons-Free.svg', 'eWip/eWip.svg']);

        IconExtractor.loadAll(iconsFiles).then(icons => {
            this._panel.webview.html = this._getWebviewContent(icons);
        });
        
        this._panel.onDidDispose(this.dispose, null, this._disposables);
        this._setWebviewMessageListener(this._panel.webview);
    }

    public static render(extensionUri: vscode.Uri) {      
        if (IconDocPanel.currentPanel) {
            IconDocPanel.currentPanel._panel.reveal(vscode.ViewColumn.One);
        } else {
            const panel = vscode.window.createWebviewPanel("icondoc", "SVG Glyph Preview", vscode.ViewColumn.One, {
                enableScripts: true,
            });

            IconDocPanel.currentPanel = new IconDocPanel(panel, extensionUri);
        }
    }

    public dispose() {
        IconDocPanel.currentPanel = undefined;

        this._panel.dispose();

        while (this._disposables.length) {
            const disposable = this._disposables.pop();
            if (disposable) {
                disposable.dispose();
            }
        }
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
                }
            },
            undefined,
            this._disposables
        );
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

    private _getWebviewContent(icons: IconFile[]) {        
        return /*html*/ `
            <!DOCTYPE html>
            <html lang="en">
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
                        <h1>SVG Glyph Viewer</h1>
                        <vscode-text-field placeholder="Search" id="searchBar">
                            <span slot="start" class="codicon codicon-search"></span>
                        </vscode-text-field>
                    </header>
                    <main>
                        ${this.generateSection(icons)}
                    </main>
                </body>
            </html>
        `;
    }

    private generateSection(files: IconFile[]) {
        let res = '';
        for (const file of files) {
            res += /*html*/ `
                <section>
                    <button class="collapsible-button">
                        ${file.displayName}
                        <span slot="end" class="codicon codicon-chevron-down"></span>
                    </button>
                    <div class="collapsible-section">
                        ${this.generateArticles(file.icons || [])}
                    </div>
                </section>
                <vscode-divider></vscode-divider>
            `
        }
        return res;
    }
    
    private generateArticles(icons: Icon[]) {
        let res = '';
        for (const icon of icons) {
            const content = 'data:image/svg+xml;utf8,' + this.svgTemplate(icon);
            res += /*html*/ `
                <article hidden="0" class="icon-article" icon-name="${icon.name.toLowerCase()}">
                    <img class="icon" src='${content}' title="${icon.name.replace('*','').trim()}"/>
                    <div class="copyValue">
                        <button class="unicodeButton">&amp;${icon.svgUnicode.replace('&', '')}</button>
                        <button class="unicodeButton">${icon.cssUnicode}</button>
                    </div>
                </article>
            `
        }
        return res;
    }

    private svgTemplate(icon: Icon): string {
        const size = 1024;
        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 64 ${size} ${size}"><rect height="${size}" width="${size}" x="0" y="0" fill="rgba(0, 0, 0, 0)" /><path transform-origin="${size / 2} ${size / 2}" transform="scale(.75 -.75)" fill="rgba(255, 255, 255, .75)" d="${icon.content}"/></svg>`;
    }
}