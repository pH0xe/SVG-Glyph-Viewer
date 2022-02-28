import * as vscode from 'vscode';
import { Icon } from './Icon';
import { IconFile } from './IconFiles';


export class IconExtractor {



    glyphToIcon(glyph: any): Icon {
        let name = '*';
        let svgUnicode = glyph.getAttribute('unicode')?.replace(';', '') || '';
        let cssUnicode = `\\${glyph.getAttribute('unicode')?.replace('&#x', '').replace(';', '')}` || '';
        let content = glyph.getAttribute('d') || '';
        
        for (const property in glyph.attributes) {           
            if (property !== 'unicode' && property !== 'd') {
                name = name + ' ' + glyph.getAttribute(property);
            }
        }

        return new Icon(name, svgUnicode, cssUnicode, content, vscode.TreeItemCollapsibleState.None);
    }
}