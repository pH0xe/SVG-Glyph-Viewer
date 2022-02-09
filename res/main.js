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

    console.log(btn.contentText || btn.innerText);
}