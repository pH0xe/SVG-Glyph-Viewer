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
                btn.lastChild
                content.style.display = 'flex';
            }
        })
    }

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