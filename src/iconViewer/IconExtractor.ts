import DomParser = require('dom-parser');
import * as vscode from 'vscode';
import { Icon } from './Icon';
import { IconFile } from './IconFiles';


export class IconExtractor {



    glyphToIcon(glyph: DomParser.Node): Icon {
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
}