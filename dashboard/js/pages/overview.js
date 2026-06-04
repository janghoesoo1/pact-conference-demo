import { checkHealth } from '../api.js';
import { statusBadge } from '../components/status-badge.js';

export async function renderOverview(container) {
    container.innerHTML = `
        <div class="page-header">
            <h1>Overview</h1>
            <p>Pact Conference Demo - 마이크로서비스 Consumer-Driven Contract Testing</p>
        </div>

        <div class="arch-diagram">
            ${buildArchDiagram()}
        </div>

        <div class="section-gap"></div>

        <div class="grid-3">
            <div class="stat-card">
                <div class="stat-label">Services</div>
                <div class="stat-value">2</div>
                <div class="stat-desc">AttendeeService · SessionService</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Contracts</div>
                <div class="stat-value">3</div>
                <div class="stat-desc">Consumer-Driven Pact</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">APIs</div>
                <div class="stat-value">11</div>
                <div class="stat-desc">REST Endpoints</div>
            </div>
        </div>

        <div class="section-gap"></div>

        <div class="card">
            <div class="card-header">
                <div>
                    <div class="card-title">서비스 상태</div>
                    <div class="card-subtitle">현재 실행 중인 서비스 헬스 체크</div>
                </div>
            </div>
            <div id="health-checks">
                <div class="loading"><div class="spinner"></div>서비스 상태 확인 중...</div>
            </div>
        </div>
    `;

    const healthContainer = container.querySelector('#health-checks');
    await loadHealthChecks(healthContainer);
}

async function loadHealthChecks(container) {
    const services = ['attendee', 'session', 'broker'];
    const labels = {
        attendee: 'AttendeeService',
        session: 'SessionService',
        broker: 'Pact Broker'
    };
    const ports = { attendee: 8080, session: 8081, broker: 9292 };

    const results = await Promise.all(
        services.map(async s => ({ service: s, result: await checkHealth(s) }))
    );

    container.innerHTML = `
        <div style="display:flex;gap:12px;flex-wrap:wrap;">
            ${results.map(({ service, result }) => `
                <div style="display:flex;align-items:center;gap:10px;padding:10px 16px;background:var(--bg);border:1px solid var(--border);border-radius:var(--radius-sm);min-width:220px;">
                    ${statusBadge(result.alive)}
                    <div>
                        <div style="font-weight:600;font-size:13px;">${labels[service]}</div>
                        <div style="font-size:11.5px;color:var(--text-muted);">
                            localhost:${ports[service]}
                            ${result.alive ? `· ${result.elapsed}ms` : '· 연결 불가'}
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function buildArchDiagram() {
    return `
    <svg width="720" height="280" viewBox="0 0 720 280" xmlns="http://www.w3.org/2000/svg" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
        <!-- Background -->
        <rect width="720" height="280" fill="#f8fafc" rx="8"/>

        <!-- Pact Broker (center top) -->
        <g transform="translate(270,20)">
            <rect width="180" height="60" rx="8" fill="#fef3c7" stroke="#d97706" stroke-width="1.5"/>
            <text x="90" y="24" text-anchor="middle" font-size="12" font-weight="700" fill="#92400e">Pact Broker</text>
            <text x="90" y="40" text-anchor="middle" font-size="11" fill="#b45309">localhost:9292</text>
            <text x="90" y="54" text-anchor="middle" font-size="10" fill="#b45309">Contract Registry</text>
        </g>

        <!-- AttendeeService (left) -->
        <g transform="translate(50,130)">
            <rect width="180" height="70" rx="8" fill="#dbeafe" stroke="#2563eb" stroke-width="1.5"/>
            <text x="90" y="22" text-anchor="middle" font-size="12" font-weight="700" fill="#1e40af">AttendeeService</text>
            <text x="90" y="38" text-anchor="middle" font-size="11" fill="#1d4ed8">localhost:8080</text>
            <text x="90" y="52" text-anchor="middle" font-size="10" fill="#3b82f6">Consumer</text>
            <text x="90" y="64" text-anchor="middle" font-size="10" fill="#60a5fa">PostgreSQL :5432</text>
        </g>

        <!-- SessionService (right) -->
        <g transform="translate(490,130)">
            <rect width="180" height="70" rx="8" fill="#dcfce7" stroke="#16a34a" stroke-width="1.5"/>
            <text x="90" y="22" text-anchor="middle" font-size="12" font-weight="700" fill="#14532d">SessionService</text>
            <text x="90" y="38" text-anchor="middle" font-size="11" fill="#15803d">localhost:8081</text>
            <text x="90" y="52" text-anchor="middle" font-size="10" fill="#16a34a">Provider</text>
            <text x="90" y="64" text-anchor="middle" font-size="10" fill="#4ade80">PostgreSQL :5432</text>
        </g>

        <!-- PostgreSQL (bottom center) -->
        <g transform="translate(270,210)">
            <rect width="180" height="50" rx="8" fill="#f1f5f9" stroke="#64748b" stroke-width="1.5"/>
            <text x="90" y="22" text-anchor="middle" font-size="12" font-weight="700" fill="#334155">PostgreSQL</text>
            <text x="90" y="38" text-anchor="middle" font-size="11" fill="#475569">localhost:5432</text>
        </g>

        <!-- Arrow: AttendeeService → SessionService (HTTP) -->
        <line x1="230" y1="165" x2="490" y2="165" stroke="#2563eb" stroke-width="2" stroke-dasharray="5,3" marker-end="url(#arrow-blue)"/>
        <rect x="310" y="150" width="100" height="18" rx="3" fill="#dbeafe"/>
        <text x="360" y="162" text-anchor="middle" font-size="10" font-weight="600" fill="#2563eb">HTTP REST</text>

        <!-- Arrow: AttendeeService → Pact Broker (Pact publish) -->
        <line x1="140" y1="130" x2="300" y2="80" stroke="#d97706" stroke-width="1.5" stroke-dasharray="4,3" marker-end="url(#arrow-orange)"/>
        <text x="195" y="102" text-anchor="middle" font-size="10" fill="#b45309" transform="rotate(-25,195,102)">publish pact</text>

        <!-- Arrow: SessionService → Pact Broker (Pact verify) -->
        <line x1="580" y1="130" x2="450" y2="80" stroke="#d97706" stroke-width="1.5" stroke-dasharray="4,3" marker-end="url(#arrow-orange)"/>
        <text x="525" y="97" text-anchor="middle" font-size="10" fill="#b45309" transform="rotate(25,525,97)">verify pact</text>

        <!-- Arrow: AttendeeService → PostgreSQL -->
        <line x1="140" y1="200" x2="300" y2="225" stroke="#64748b" stroke-width="1.5" stroke-dasharray="3,3" marker-end="url(#arrow-gray)"/>

        <!-- Arrow: SessionService → PostgreSQL -->
        <line x1="580" y1="200" x2="450" y2="225" stroke="#64748b" stroke-width="1.5" stroke-dasharray="3,3" marker-end="url(#arrow-gray)"/>

        <!-- Marker definitions -->
        <defs>
            <marker id="arrow-blue" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L0,6 L8,3 z" fill="#2563eb"/>
            </marker>
            <marker id="arrow-orange" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L0,6 L8,3 z" fill="#d97706"/>
            </marker>
            <marker id="arrow-gray" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L0,6 L8,3 z" fill="#64748b"/>
            </marker>
        </defs>
    </svg>
    `;
}
