const vscode = acquireVsCodeApi();
let icons;

window.addEventListener("load", main);

document.addEventListener('DOMContentLoaded', (function () {
    window.addEventListener('message', event => {
        const message = event.data;
        switch (message.command) {
            case 'filesData':
                console.log(message.data);
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

    const collapsibleBtns = document.getElementsByClassName("collapsible-button");
    for (const btn of collapsibleBtns) {
        btn.addEventListener("click", _ => {
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
        });
    }

    icons = document.getElementsByClassName("icon-article");

    const testFile = document.getElementById("testFile");
    const obj = testFile.getAttribute('value');
    for (const e of obj) {
        console.log(e);
    }
    readSingleFile('eWip.svg');
}

function readSingleFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const contents = e.target.result;
      console.log(contents);
    };
    reader.readAsText(file);
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