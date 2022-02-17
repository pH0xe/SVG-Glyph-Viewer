const vscode = acquireVsCodeApi();
let icons;

window.addEventListener("load", main);

function main() {
    const buttons = document.getElementsByClassName("unicodeButton");
    for (const item of buttons) {
        item.addEventListener("click", copyUnicode)
    }

    const searchBar = document.getElementById("searchBar");
    searchBar.addEventListener('input', onSearch);

    icons = document.getElementsByClassName("icon-article");
}

function copyUnicode(element) {
    const btn = element.target;

    navigator.clipboard.writeText(btn.contentText || btn.innerText)
        .then(_ => sendSuccess('Succesfully copied'))
        .catch(err => sendError('Unable to copy'));
}

function onSearch(event) {
    const searchValue = event.target.value;
    
    for (const icon of icons) {
        const name = icon.querySelector('#icon-name');
        if (name){
            const nameString = name.innerText || name.contentText;
            if (nameString.includes(searchValue)) {
                icon.setAttribute("hidden", "0");
            } else {
                icon.setAttribute("hidden", "1");
            }
        }
    }
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