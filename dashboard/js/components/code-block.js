export function codeBlock(code, language = '') {
    const id = 'cb-' + Math.random().toString(36).slice(2);
    return `
        <div class="code-block">
            <div class="code-header">
                <span>${language}</span>
                <button onclick="navigator.clipboard.writeText(document.getElementById('${id}').textContent).then(() => { this.textContent = 'Copied!'; setTimeout(() => this.textContent = 'Copy', 1500); })">Copy</button>
            </div>
            <pre id="${id}"><code>${escapeHtml(code)}</code></pre>
        </div>
    `;
}

function escapeHtml(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
