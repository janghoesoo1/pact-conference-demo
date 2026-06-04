import { checkHealth, callApi, SERVICES } from '../api.js';
import { statusBadge } from '../components/status-badge.js';

const SERVICE_META = {
    session: {
        label: 'SessionService',
        port: 8081,
        swagger: 'http://localhost:8081/swagger-ui.html',
        hint: 'SessionService가 실행되지 않습니다. <code>./gradlew :session-service:bootRun</code> 으로 시작하세요.',
        dataFn: async () => {
            const r = await callApi('session', 'GET', '/sessions');
            if (r.status === 200 && r.data) return r.data.total ?? r.data?.data?.length ?? '-';
            return null;
        },
        dataLabel: '세션 수'
    },
    attendee: {
        label: 'AttendeeService',
        port: 8080,
        swagger: 'http://localhost:8080/swagger-ui.html',
        hint: 'AttendeeService가 실행되지 않습니다. <code>./gradlew :attendee-service:bootRun</code> 으로 시작하세요.',
        dataFn: async () => {
            const r = await callApi('attendee', 'GET', '/attendees');
            if (r.status === 200 && r.data) {
                if (Array.isArray(r.data)) return r.data.length;
                if (r.data.total !== undefined) return r.data.total;
                if (r.data.data) return r.data.data.length;
            }
            return null;
        },
        dataLabel: '참석자 수'
    },
    broker: {
        label: 'Pact Broker',
        port: 9292,
        swagger: null,
        hint: 'Pact Broker가 실행되지 않습니다. <code>docker-compose up pact-broker</code> 으로 시작하세요.',
        dataFn: null,
        dataLabel: null
    }
};

let pollingTimer = null;
let destroyed = false;

export function renderStatus(container) {
    destroyed = false;
    clearInterval(pollingTimer);

    container.innerHTML = `
        <div class="page-header">
            <h1>Status</h1>
            <p>서비스 상태 모니터링 (10초 자동 갱신)</p>
        </div>
        <div id="status-grid" class="grid-3">
            ${Object.entries(SERVICE_META).map(([key]) => `
                <div class="service-card" id="card-${key}">
                    <div class="loading"><div class="spinner"></div>확인 중...</div>
                </div>
            `).join('')}
        </div>
        <div style="margin-top:10px;font-size:12px;color:var(--text-muted);">
            마지막 갱신: <span id="last-updated">-</span>
        </div>
    `;

    // 컨테이너가 DOM에서 제거되면 polling 중단
    const observer = new MutationObserver(() => {
        if (!document.contains(container)) {
            destroyed = true;
            clearInterval(pollingTimer);
            observer.disconnect();
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    refresh(container);
    pollingTimer = setInterval(() => {
        if (destroyed) { clearInterval(pollingTimer); return; }
        refresh(container);
    }, 10000);
}

async function refresh(container) {
    const results = await Promise.all(
        Object.entries(SERVICE_META).map(async ([key, meta]) => {
            const health = await checkHealth(key);
            let count = null;
            if (health.alive && meta.dataFn) {
                try { count = await meta.dataFn(); } catch { count = null; }
            }
            return { key, meta, health, count };
        })
    );

    results.forEach(({ key, meta, health, count }) => {
        const card = container.querySelector(`#card-${key}`);
        if (!card) return;
        card.innerHTML = buildServiceCard(key, meta, health, count);
    });

    const el = container.querySelector('#last-updated');
    if (el) el.textContent = new Date().toLocaleTimeString('ko-KR');
}

function buildServiceCard(key, meta, health, count) {
    const { label, port, swagger, hint, dataLabel } = meta;
    return `
        <div class="service-card-header">
            <div>
                <div class="service-card-name">${label}</div>
                <div class="service-card-url">localhost:${port}</div>
            </div>
            ${statusBadge(health.alive)}
        </div>

        <div class="service-stat-row">
            <div class="service-stat">
                <div class="service-stat-label">HTTP Status</div>
                <div class="service-stat-value">${health.status || '-'}</div>
            </div>
            <div class="service-stat">
                <div class="service-stat-label">응답 시간</div>
                <div class="service-stat-value">${health.alive ? health.elapsed + 'ms' : '-'}</div>
            </div>
            ${count !== null && dataLabel ? `
                <div class="service-stat">
                    <div class="service-stat-label">${dataLabel}</div>
                    <div class="service-stat-value">${count}</div>
                </div>
            ` : ''}
        </div>

        ${health.alive ? `
            <div class="service-links">
                <a href="${SERVICES[key]}" target="_blank">API Root</a>
                ${swagger ? `<a href="${swagger}" target="_blank">Swagger UI</a>` : ''}
                ${key === 'broker' ? `<a href="${SERVICES.broker}" target="_blank">Broker UI</a>` : ''}
            </div>
        ` : `
            <div class="service-hint">${hint}</div>
        `}
    `;
}
