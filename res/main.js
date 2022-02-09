const vscode = acquireVsCodeApi();
let iconsArticles;
let iconsFile;

window.addEventListener("load", main);
window.addEventListener('message', intercepteMessage); 

function main() {
    const searchBar = document.getElementById("searchBar");
    searchBar.addEventListener('input', onSearch);

    const btnAdd = document.getElementById("btn-add");
    btnAdd.addEventListener('click', onAddFile);

    const btnRemove = document.getElementById("btn-remove");
    btnRemove.addEventListener('click', onRemoveFile);

    iconsArticles = document.getElementsByClassName("icon-article");

    const btnSettings = document.getElementById('btn-settings');
    btnSettings.addEventListener('click', (event) => {
        vscode.postMessage({
            command: 'openSettings',
            text: null
        });
    });
    requestColors();
    requestFiles();
}

function intercepteMessage(event) {
    const previousState = vscode.getState();
    iconsFile = previousState ? previousState.iconsFile : [];

    const message = event.data;
    switch (message.command) {
        case 'filesData':
            if ("content" in document.createElement("template")) {
                iconsFile.push(message.data);
                vscode.setState({iconsFile});

                const iconFile = message.data;
                const section = generateSection(iconFile.displayName, iconFile.fileName)
                parseSVG(iconFile.file).then((res) => {
                    generateArticles(section, res);
                });
            } else {
                sendError("Template is not supported !")
            }
            break;
        case 'removeFromWebView':
            iconsFile = iconsFile.filter(file => file.fileName != message.data);
            vscode.setState({iconsFile});
            document.getElementById(message.data).remove();
            break;
        case 'updateNameOnWebview':
            const filePath = message.data.filePath;
            const displayName = message.data.displayName;
            document.getElementById(filePath).querySelector('.collapsible-button #content').innerText = displayName;
            break;
        case 'updateColors':
            const { backgroundColor, foregroundColor } = message.data;
            updateColors(backgroundColor, foregroundColor);
            break;
    }
}

function updateColors(backgroundColor, foregroundColor) {
    const style = document.createElement('style');
    style.innerHTML = `
        article {
            background-color: ${backgroundColor};
            color:red;
        }
        svg {
            fill: ${foregroundColor};
        }
        article button {
            color: ${foregroundColor};
        }
        `;
    document.head.appendChild(style);
}

function copyUnicode(element) {
    const btn = element.target;

    navigator.clipboard.writeText(btn.contentText || btn.innerText)
        .then(_ => sendSuccess('Succesfully copied'))
        .catch(err => sendError('Unable to copy'));
}

function onSearch(event) {
    const searchValue = event.target.value.toLowerCase();
    for (const icon of iconsArticles) {
        const name = icon.getAttribute('icon-name');
        if (name.includes(searchValue)) {
            icon.setAttribute("hidden", "0");
        } else {
            icon.setAttribute("hidden", "1");
        }
    }
}

function requestFiles() {
    vscode.postMessage({
        command: 'requestFiles',
        text: null
    });
}

function requestColors() {
    vscode.postMessage({
        command: 'requestColors',
        text: null
    });
}

function onAddFile() {
    vscode.postMessage({
        command: 'addFile',
        text: null
    });
}

function onRemoveFile() {
    vscode.postMessage({
        command: 'removeFile',
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
        const icon = btn.querySelector(".btn-chevron");
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

function onClickEdit(displayName, filePath) {
    return function(event) {
        event.stopPropagation();
        vscode.postMessage({
            command: 'changeDisplayName',
            text: {displayName, filePath}
        });
    };
}
 
function generateSection(displayName, fileName) {
    const main = document.getElementById('main-section');
    const template = document.getElementById('section');
    const section = document.importNode(template.content, true);
    const sectionTag = section.querySelector('section');

    sectionTag.setAttribute('id', fileName);

    const btnCollapse = section.querySelector('.collapsible-button');
    btnCollapse.querySelector('#content').innerText = displayName;

    main.appendChild(section);

    btnCollapse.addEventListener('click', onClickCollapsible(btnCollapse));

    const btnEdit = sectionTag.querySelector('.btn-edit-name');
    btnEdit.addEventListener('click', onClickEdit(displayName, fileName));

    return sectionTag;
}

async function generateArticles(section, icons) {  
    const divCollapsible = section.querySelector('.collapsible-section');
    for (const icon of icons) {
        await generateArticle(divCollapsible, icon);
    } 
    section.querySelector('vscode-progress-ring').remove();
    return;
}

async function generateArticle(divCollapsible, icon) {      
    const template = document.getElementById('article');
    const article = document.importNode(template.content, true)

    const art = article.querySelector('article');
    art.setAttribute('icon-name', icon.name.toLowerCase());

    const img = article.querySelector('.icon');
    const title = img.querySelector('title');
    title.innerHTML = icon.name.replace('*', '').trim();

    const path = img.querySelector('path');
    path.setAttribute('d', icon.content);

    const btnSvg = article.querySelector('.unicodeButton.svg')
    btnSvg.innerText = toUnicode('&#x', icon.unicode);

    const btnCss = article.querySelector('.unicodeButton.css')
    btnCss.innerText = toUnicode('\\u', icon.unicode);

    btnSvg.addEventListener("click", copyUnicode);
    btnCss.addEventListener("click", copyUnicode);

    divCollapsible.appendChild(article);
    return;
}

async function parseSVG(svgString) {
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
    let unicode = glyph.getAttribute('unicode');
    let content = glyph.getAttribute('d');
    const attributes = glyph.attributes;
    for (let i = 0; i < attributes.length; i++) {
        const element = attributes.item(i);
        if (element.name !== 'd' && element.name !== 'unicode'){
            name += ' ' + element.value;
        }
    }
    return {name, unicode, content};
}

function toUnicode(prefix, str) {
    return prefix + str.charCodeAt(0).toString(16);
  }