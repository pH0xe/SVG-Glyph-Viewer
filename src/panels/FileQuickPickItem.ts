import * as vscode from "vscode";

export class FileQuickPickItem implements vscode.QuickPickItem {
    constructor(filePath: string, displayName: string) {
        this.label = displayName;
        this.detail = filePath;
    }

    label: string;
    kind?: vscode.QuickPickItemKind | undefined;
    description?: string | undefined;
    detail?: string | undefined;
    picked?: boolean | undefined;
    alwaysShow?: boolean | undefined;
    buttons?: readonly vscode.QuickInputButton[] | undefined;
}