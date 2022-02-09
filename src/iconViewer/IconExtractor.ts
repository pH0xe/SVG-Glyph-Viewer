import * as vscode from 'vscode';
import { Icon } from './Icon';
import { XMLParser } from 'fast-xml-parser';

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

        glyphs.forEach((glyph: any) => {
            if (glyph['@_d'] !== '')
                this.icons.push(this.glyphToIcon(glyph))
        });  
        return;      
    }

    glyphToIcon(glyph: any): Icon {
        let name: string = '';
        let svgUnicode: string = glyph['@_unicode'].replace(';', '');
        let cssUnicode: string = `\\${glyph['@_unicode'].replace('&#x', '').replace(';', '')}`;
        let content: string = glyph['@_d'];
        
        for (const property in glyph) {
            if (property !== '@_unicode' && property !== '@_d')
                name = name + ' ' + glyph[property]
        }

        return new Icon(name, svgUnicode, cssUnicode, content, vscode.TreeItemCollapsibleState.None)
    }

    private parseFile(content: string) {
        const parser = new XMLParser({
            ignoreAttributes: false,
            ignoreDeclaration: true
        });
        const res = parser.parse(content);
        return this.foundGlyph(res);    
    }

    private foundGlyph(object: any): any {
        // WORKARROUND: shame on me  
        const res = [];
        for (const property in object) {
            if (property.toLowerCase() === 'glyph'){
                return object[property];
            } else {
                if ((typeof object[property]).toLowerCase() === 'object') {
                    res.push(...this.foundGlyph(object[property]));
                }
            }
        }
        return res;
    }
}