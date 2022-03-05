import * as vscode from 'vscode';
import { getURIRoot } from "../utils/getURI";
import { FileQuickPickItem } from "../panels/FileQuickPickItem";
import { IconDocPanel } from '../panels/IconDocPanel';

export class IconFile {
    public displayName: string;
    public file?: string;

    constructor(
        public readonly fileName: string,
        displayName?: string,
    ) {
        this.displayName = displayName ? displayName : fileName;
    }

    public async setIcons(): Promise<boolean> { 
        try {
            this.file = (await vscode.workspace.openTextDocument(getURIRoot(this.fileName))).getText();
        } catch (error) {
            vscode.window.showErrorMessage('Unable to open file: ' + this.fileName);
            return false;
        }
        return true;
    }

    public static async openFiles(files: FileQuickPickItem[]) {
        const iconsFiles: IconFile[] = [];
        for (const file of files) {
            const icF = new IconFile(file.detail!, file.label);
            if(await icF.setIcons()) {
                iconsFiles.push(icF);
            }
            
        }
        return iconsFiles;
    }

}