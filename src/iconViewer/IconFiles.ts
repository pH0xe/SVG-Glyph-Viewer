import * as vscode from 'vscode';
import { getURIRoot } from "../utils/getURI";
import { FileQuickPickItem } from "../panels/FileQuickPickItem";

export class IconFile {
    public displayName: string;
    public file?: string;

    constructor(
        public readonly fileName: string,
        displayName?: string,
    ) {
        this.displayName = displayName ? displayName : fileName;
    }

    public async setIcons() { 
        this.file = (await vscode.workspace.openTextDocument(getURIRoot(this.fileName))).getText();;
        return;
    }

    public static async openFiles(files: FileQuickPickItem[]) {
        const iconsFiles: IconFile[] = [];
        for (const file of files) {
            const icF = new IconFile(file.detail!, file.label);
            await icF.setIcons();
            iconsFiles.push(icF);
        }
        return iconsFiles;
    }

}