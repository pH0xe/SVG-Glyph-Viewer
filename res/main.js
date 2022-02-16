const vscode = acquireVsCodeApi();

window.addEventListener("load", main);

function main() {
    const buttons = document.getElementsByClassName("unicodeButton");
    for (const item of buttons) {
        item.addEventListener("click", copyUnicode)
    }
}

function copyUnicode(element) {
    const btn = element.target;

    navigator.clipboard.writeText(btn.contentText || btn.innerText)
        .then(_ => sendSuccess('Succesfully copied'))
        .catch(err => sendError('Unable to copy'));
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