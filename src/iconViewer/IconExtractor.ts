import DomParser = require('dom-parser');
import * as vscode from 'vscode';
import { Icon } from './Icon';
import { IconFile } from './IconFiles';


export class IconExtractor {
    private readonly filePath: vscode.Uri;
    private icons: Icon[] = [];

    constructor(filePath: string) {
        const rootPath = (vscode.workspace.workspaceFolders && (vscode.workspace.workspaceFolders.length > 0))
            ? vscode.workspace.workspaceFolders[0].uri.fsPath : undefined;
            
        this.filePath = vscode.Uri.file(rootPath + '/' + filePath);
    }

    async getIcons(): Promise<Icon[]> {        
        if (this.icons.length === 0) {
            await this.fetchIcon();   
        }

        return this.icons;
    }

    private async fetchIcon() {
        const doc = await vscode.workspace.openTextDocument(this.filePath);
        const content = doc.getText();

        const glyphs = this.parseFile(content)
        this.icons = [];

        glyphs?.forEach((glyph: DomParser.Node) => {
            if (glyph.getAttribute('d') !== '')
                this.icons.push(this.glyphToIcon(glyph))
        });  
        return;      
    }

    glyphToIcon(glyph: DomParser.Node): Icon {
        let name = '*';
        let svgUnicode = glyph.getAttribute('unicode')?.replace(';', '') || '';
        let cssUnicode = `\\${glyph.getAttribute('unicode')?.replace('&#x', '').replace(';', '')}` || '';
        let content = glyph.getAttribute('d') || '';
        
        for (const property in glyph.attributes) {           
            if (property !== 'unicode' && property !== 'd')
                name = name + ' ' + glyph.getAttribute(property);
        }

        return new Icon(name, svgUnicode, cssUnicode, content, vscode.TreeItemCollapsibleState.None)
    }

    private parseFile(content: string) {
        // const parser = new XMLParser({
        //     ignoreAttributes: false,
        //     ignoreDeclaration: true
        // });
        // const res = parser.parse(content);
        
        const parser = new DomParser();
        const dom = parser.parseFromString(content);
        const res = dom.getElementsByTagName('glyph');
        return res;    
    }

    public static openFiles(files: string[]): IconFile[] {
        const iconsFiles: IconFile[] = [];
        files.forEach(file => {
            iconsFiles.push(new IconFile(file, new IconExtractor(file), file))
        });
        return iconsFiles;
    }

    public static async loadAll(files: IconFile[]): Promise<IconFile[]> {
        for (const file of files) {
            await file.setIcons();
        }
        return files;
    } 
}