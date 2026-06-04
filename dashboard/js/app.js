import { renderNav } from './components/nav.js';
import { renderOverview } from './pages/overview.js';
import { renderContracts } from './pages/contracts.js';
import { renderApiExplorer } from './pages/api-explorer.js';
import { renderTests } from './pages/tests.js';
import { renderStatus } from './pages/status.js';
import { renderGuide } from './pages/guide.js';

const routes = {
    '': renderOverview,
    'overview': renderOverview,
    'contracts': renderContracts,
    'api': renderApiExplorer,
    'tests': renderTests,
    'status': renderStatus,
    'guide': renderGuide
};

function router() {
    const hash = location.hash.slice(1) || 'overview';
    const page = routes[hash];
    const app = document.getElementById('app');
    if (page) {
        app.innerHTML = '';
        page(app);
    }
    document.querySelectorAll('nav a').forEach(a => {
        a.classList.toggle('active', a.getAttribute('href') === '#' + hash);
    });
}

renderNav(document.getElementById('nav'));
window.addEventListener('hashchange', router);
router();
