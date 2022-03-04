import { Uri, Webview, workspace } from "vscode";

export function getUri(webview: Webview, extensionUri: Uri, pathList: string[]) {
    return webview.asWebviewUri(Uri.joinPath(extensionUri, ...pathList));
}

export function getRelativeUri(uri: Uri) {
    const path = uri.fsPath;
    const rootPath = (workspace.workspaceFolders && (workspace.workspaceFolders.length > 0))
    ? workspace.workspaceFolders[0].uri.fsPath : undefined;   
    
    if (rootPath) {   
        let res = path.replace(rootPath, '');
        return res.slice(1);
    }
    return path;
}

export function getURIRoot(filePath: string) {
    const rootPath = (workspace.workspaceFolders && (workspace.workspaceFolders.length > 0))
            ? workspace.workspaceFolders[0].uri.fsPath : undefined;
            
    return Uri.file(rootPath + '/' + filePath);
}