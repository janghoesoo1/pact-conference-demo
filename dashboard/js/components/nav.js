export function renderNav(container) {
    const links = [
        { hash: 'overview', label: 'Overview', icon: '◎' },
        { hash: 'contracts', label: 'Contracts', icon: '⊞' },
        { hash: 'api', label: 'API Explorer', icon: '⌁' },
        { hash: 'tests', label: 'Tests', icon: '✓' },
        { hash: 'status', label: 'Status', icon: '◉' },
        { hash: 'guide', label: 'Guide', icon: '◈' }
    ];
    container.innerHTML = `
        <div class="nav-brand">
            Pact Demo
            <span>Conference Dashboard</span>
        </div>
        <ul>
            ${links.map(l => `<li><a href="#${l.hash}"><span class="nav-icon">${l.icon}</span><span>${l.label}</span></a></li>`).join('')}
        </ul>
    `;
}
