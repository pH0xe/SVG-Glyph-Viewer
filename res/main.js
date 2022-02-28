const vscode = acquireVsCodeApi();
let icons;

window.addEventListener("load", main);

document.addEventListener('DOMContentLoaded', (function () {
    window.addEventListener('message', event => {
        const message = event.data;
        switch (message.command) {
            case 'filesData':
                console.log(message.data);
                generateSection(message.data);
                break;
        }
    }); 
}));

function main() {
    const buttons = document.getElementsByClassName("unicodeButton");
    for (const item of buttons) {
        item.addEventListener("click", copyUnicode);
    }

    const searchBar = document.getElementById("searchBar");
    searchBar.addEventListener('input', onSearch);

    const btnAdd = document.getElementById("btn-add");
    btnAdd.addEventListener('click', onAddFile);

    icons = document.getElementsByClassName("icon-article");
}

function copyUnicode(element) {
    const btn = element.target;

    navigator.clipboard.writeText(btn.contentText || btn.innerText)
        .then(_ => sendSuccess('Succesfully copied'))
        .catch(err => sendError('Unable to copy'));
}

function onSearch(event) {
    const searchValue = event.target.value.toLowerCase();
    for (const icon of icons) {
        const name = icon.getAttribute('icon-name');
        if (name.includes(searchValue)) {
            icon.setAttribute("hidden", "0");
        } else {
            icon.setAttribute("hidden", "1");
        }
    }
}

function onAddFile() {
    vscode.postMessage({
        command: 'addFile',
        text: null
    });
}

function sendSuccess(text) {
    vscode.postMessage({
        command: 'success',
        text
    });
}

function sendError(text) {
    vscode.postMessage({
        command: 'error',
        text
    });
}


function onClickCollapsible(btn) {
    return function(event) {
        btn.classList.toggle("active");
        const icon = btn.querySelector(".codicon");
        icon.classList.toggle("codicon-chevron-down");
        icon.classList.toggle("codicon-chevron-up");

        const content = btn.nextElementSibling;
        if (content.style.display === 'flex') {
            content.style.display = 'none';
        } else {
            btn.lastChild;
            content.style.display = 'flex';
        }
    };
}
 

function generateSection(iconFile) {
    const main = document.getElementById('main-section');

   const section = document.createElement('section');

   const btnCollapse = document.createElement('button');
   btnCollapse.setAttribute('class', 'collapsible-button');
   btnCollapse.innerText = iconFile.displayName;

   const spanIconChevron = document.createElement('span');
   spanIconChevron.setAttribute('slot', 'end');
   spanIconChevron.setAttribute('class', 'codicon codicon-chevron-down');

   const divCollapsible = document.createElement('div');
   divCollapsible.setAttribute('class', 'collapsible-section');

   const divider = document.createElement('vscode-divider');

   btnCollapse.appendChild(spanIconChevron);
   section.appendChild(btnCollapse);
   section.appendChild(divCollapsible);
   main.appendChild(section);
   main.appendChild(divider);

   btnCollapse.addEventListener('click', onClickCollapsible(btnCollapse));

   generateArticles(divCollapsible, iconFile);
}

function generateArticles(divCollapsible, iconFile) {
   const icons = parseSVG(iconFile.file);
    for (const icon of icons) {
        generateArticle(divCollapsible, icon);
    }
   
}

function generateArticle(divCollapsible, icon) {
    const article = document.createElement('article');
    article.setAttribute('hidden', '0');
    article.setAttribute('class', 'icon-article');
    article.setAttribute('icon-name', icon.name.toLowerCase());

    const img = getImgTag(icon);

    const divCopy = document.createElement('div');
    divCopy.setAttribute('class', 'copyValue');

    const btnSvg = document.createElement('button');
    btnSvg.setAttribute('class', 'unicodeButton');
    btnSvg.innerText = '&amp;' + icon.svgUnicode.replace('&', '');

    const btnCss = document.createElement('button');
    btnCss.setAttribute('class', 'unicodeButton');
    btnCss.innerText = icon.cssUnicode;

    divCopy.appendChild(btnSvg);
    divCopy.appendChild(btnCss);
    article.appendChild(img);
    article.appendChild(divCopy);
    divCollapsible.appendChild(article);
}

function getImgTag(icon) {
    const size = 1024;
    const fillColorRect = 'rgba(0, 0, 0, 0)';
    const pathColor = 'rgba(255, 255, 255, .75)';
    const content = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 64 ${size} ${size}"><rect height="${size}" width="${size}" x="0" y="0" fill="${fillColorRect}" /><path transform-origin="${size / 2} ${size / 2}" transform="scale(.75 -.75)" fill="${pathColor}" d="${icon.content}"/></svg>`;

    const img = document.createElement('img');
    img.setAttribute('class', 'icon');
    img.setAttribute('src', content);
    img.setAttribute('title', icon.name.replace('*','').trim());
    return img;
}

function parseSVG(svgString) {
    const res = [];
    const parser = new DOMParser();
    const dom = parser.parseFromString(svgString, 'text/xml');
    const glyphs = dom.getElementsByTagName('glyph');
    for (const glyph of glyphs) {
        res.push(parseGlyph(glyph));
    }
    return res;
}

function parseGlyph(glyph) {
    let name = '*';
    let svgUnicode = glyph.getAttribute('unicode')?.replace(';', '') || '';
    let cssUnicode = `\\${glyph.getAttribute('unicode')?.replace('&#x', '').replace(';', '')}` || '';
    let content = glyph.getAttribute('d') || '';
    console.log(glyph);
    for (const property in glyph.attributes) {           
        if (property !== 'unicode' && property !== 'd') {
            name = name + ' ' + glyph.getAttribute(property);
        }
    }
    return {name, svgUnicode, cssUnicode, content};
}