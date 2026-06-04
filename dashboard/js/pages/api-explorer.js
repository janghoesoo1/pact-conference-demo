import { callApi } from '../api.js';
import { createJsonViewer } from '../components/json-viewer.js';

// api-endpoints.json 기반 fallback 데이터
const FALLBACK_ENDPOINTS = {
    session: [
        { method: 'GET', path: '/sessions', description: '세션 목록 조회', hasId: false, hasBody: false },
        { method: 'GET', path: '/sessions/{id}', description: '세션 상세 조회', hasId: true, hasBody: false },
        { method: 'POST', path: '/sessions', description: '세션 생성', hasId: false, hasBody: true, sampleBody: { title: '새 세션', speaker: '홍길동', description: '세션 설명' } },
        { method: 'PUT', path: '/sessions/{id}', description: '세션 수정', hasId: true, hasBody: true, sampleBody: { title: '수정된 세션', speaker: '장호', description: '수정된 설명' } },
        { method: 'DELETE', path: '/sessions/{id}', description: '세션 삭제', hasId: true, hasBody: false }
    ],
    attendee: [
        { method: 'GET', path: '/attendees', description: '참석자 목록 조회', hasId: false, hasBody: false },
        { method: 'GET', path: '/attendees/{id}', description: '참석자 상세 조회', hasId: true, hasBody: false },
        { method: 'GET', path: '/attendees/{id}/sessions', description: '참석자의 세션 목록', hasId: true, hasBody: false },
        { method: 'POST', path: '/attendees', description: '참석자 등록', hasId: false, hasBody: true, sampleBody: { givenName: '길동', surname: '홍', email: 'hong@test.com' } },
        { method: 'PUT', path: '/attendees/{id}', description: '참석자 수정', hasId: true, hasBody: true, sampleBody: { givenName: '수정', surname: '김', email: 'kim@test.com' } },
        { method: 'DELETE', path: '/attendees/{id}', description: '참석자 삭제', hasId: true, hasBody: false }
    ]
};

const BASE_URLS = {
    session: 'http://localhost:8081',
    attendee: 'http://localhost:8080'
};

const SERVICE_LABELS = {
    session: 'Session Service (8081)',
    attendee: 'Attendee Service (8080)'
};

async function loadEndpoints() {
    try {
        const res = await fetch('./data/api-endpoints.json');
        if (!res.ok) throw new Error('not found');
        return await res.json();
    } catch {
        return FALLBACK_ENDPOINTS;
    }
}

export async function renderApiExplorer(container) {
    container.innerHTML = `
        <div class="page-header">
            <h1>API Explorer</h1>
            <p>서비스와 엔드포인트를 선택하여 실시간 API를 호출해보세요.</p>
        </div>
        <div class="loading"><div class="spinner"></div> 엔드포인트 목록 로딩 중...</div>
    `;

    const endpoints = await loadEndpoints();

    container.innerHTML = `
        <div class="page-header">
            <h1>API Explorer</h1>
            <p>서비스와 엔드포인트를 선택하여 실시간 API를 호출해보세요.</p>
        </div>
        <div class="ae-layout">
            <div class="card ae-request-panel">
                <div class="card-header"><span class="card-title">요청</span></div>
                <div class="api-form">
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">서비스</label>
                            <select id="ae-service" class="form-select">
                                <option value="session">Session Service</option>
                                <option value="attendee">Attendee Service</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">엔드포인트</label>
                            <select id="ae-endpoint" class="form-select"></select>
                        </div>
                    </div>
                    <div id="ae-id-row" class="form-group" style="display:none;">
                        <label class="form-label">ID</label>
                        <input id="ae-id" type="text" class="form-input" placeholder="예: 1" value="1">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Method &amp; URL</label>
                        <div class="form-row">
                            <span id="ae-method-display" class="method-badge method-GET" style="flex-shrink:0;padding:8px 10px;font-size:12px;">GET</span>
                            <input id="ae-url" type="text" class="form-input" readonly style="flex:1;font-family:monospace;font-size:12px;color:var(--text-muted);background:#f8fafc;">
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Headers</label>
                        <textarea class="form-textarea" readonly style="min-height:52px;">Accept: application/json
Content-Type: application/json</textarea>
                    </div>
                    <div id="ae-body-row" class="form-group" style="display:none;">
                        <label class="form-label">Request Body (JSON)</label>
                        <textarea id="ae-body" class="form-textarea" style="min-height:120px;"></textarea>
                    </div>
                    <button id="ae-send" class="btn btn-primary">Send Request</button>
                </div>
            </div>
            <div class="card ae-response-panel">
                <div class="card-header">
                    <span class="card-title">응답</span>
                    <span id="ae-resp-meta" style="font-size:12px;color:var(--text-muted);"></span>
                </div>
                <div id="ae-response-area" style="min-height:200px;">
                    <div style="color:var(--text-muted);font-size:13px;padding:20px 0;text-align:center;">요청을 전송하면 응답이 여기에 표시됩니다.</div>
                </div>
            </div>
        </div>
    `;

    const style = document.createElement('style');
    style.textContent = `
        .ae-layout { display:grid;grid-template-columns:1fr 1fr;gap:20px;align-items:start; }
        .ae-request-panel,.ae-response-panel { min-height:420px; }
        @media (max-width:768px) { .ae-layout { grid-template-columns:1fr; } }
    `;
    container.appendChild(style);

    const serviceSelect = container.querySelector('#ae-service');
    const endpointSelect = container.querySelector('#ae-endpoint');
    const idRow = container.querySelector('#ae-id-row');
    const idInput = container.querySelector('#ae-id');
    const methodDisplay = container.querySelector('#ae-method-display');
    const urlInput = container.querySelector('#ae-url');
    const bodyRow = container.querySelector('#ae-body-row');
    const bodyTextarea = container.querySelector('#ae-body');
    const sendBtn = container.querySelector('#ae-send');
    const responseArea = container.querySelector('#ae-response-area');
    const respMeta = container.querySelector('#ae-resp-meta');

    function populateEndpoints() {
        const service = serviceSelect.value;
        const list = endpoints[service] || [];
        endpointSelect.innerHTML = list.map((ep, i) =>
            `<option value="${i}">${ep.method} ${ep.path} — ${ep.description}</option>`
        ).join('');
        updateForm();
    }

    function updateForm() {
        const service = serviceSelect.value;
        const idx = parseInt(endpointSelect.value, 10);
        const list = endpoints[service] || [];
        const ep = list[idx];
        if (!ep) return;

        const id = idInput.value.trim() || '1';
        const resolvedPath = ep.hasId ? ep.path.replace('{id}', id) : ep.path;

        methodDisplay.textContent = ep.method;
        methodDisplay.className = `method-badge method-${ep.method}`;
        urlInput.value = BASE_URLS[service] + resolvedPath;
        idRow.style.display = ep.hasId ? '' : 'none';
        bodyRow.style.display = ep.hasBody ? '' : 'none';

        if (ep.hasBody && ep.sampleBody) {
            bodyTextarea.value = JSON.stringify(ep.sampleBody, null, 2);
        } else {
            bodyTextarea.value = '';
        }
    }

    serviceSelect.addEventListener('change', populateEndpoints);
    endpointSelect.addEventListener('change', updateForm);
    idInput.addEventListener('input', updateForm);

    sendBtn.addEventListener('click', async () => {
        const service = serviceSelect.value;
        const idx = parseInt(endpointSelect.value, 10);
        const list = endpoints[service] || [];
        const ep = list[idx];
        if (!ep) return;

        const id = idInput.value.trim() || '1';
        const resolvedPath = ep.hasId ? ep.path.replace('{id}', id) : ep.path;

        let body = null;
        if (ep.hasBody && bodyTextarea.value.trim()) {
            try {
                body = JSON.parse(bodyTextarea.value);
            } catch {
                responseArea.innerHTML = `<div class="info-box error">Request Body가 유효한 JSON이 아닙니다.</div>`;
                return;
            }
        }

        sendBtn.disabled = true;
        sendBtn.textContent = '전송 중...';
        responseArea.innerHTML = '<div class="loading"><div class="spinner"></div> 요청 전송 중...</div>';
        respMeta.textContent = '';

        try {
            const result = await callApi(service, ep.method, resolvedPath, body);
            const statusColor = result.status >= 500 ? 'var(--danger)' : result.status >= 400 ? 'var(--warning)' : 'var(--success)';
            respMeta.textContent = `${result.elapsed}ms`;

            responseArea.innerHTML = '';
            const metaEl = document.createElement('div');
            metaEl.className = 'response-meta';
            metaEl.innerHTML = `
                <span class="response-status" style="color:${statusColor};">${result.status} ${result.statusText}</span>
                <span class="response-elapsed">${result.elapsed}ms</span>
            `;
            responseArea.appendChild(metaEl);

            if (result.data !== null && result.data !== undefined) {
                const label = document.createElement('div');
                label.className = 'form-label';
                label.style.margin = '12px 0 6px';
                label.textContent = 'Response Body';
                responseArea.appendChild(label);
                responseArea.appendChild(createJsonViewer(result.data));
            } else {
                const empty = document.createElement('div');
                empty.style.cssText = 'color:var(--text-muted);font-size:12px;margin-top:10px;';
                empty.textContent = '응답 본문 없음';
                responseArea.appendChild(empty);
            }
        } catch (err) {
            responseArea.innerHTML = `
                <div class="info-box error">
                    <strong>서비스에 연결할 수 없습니다</strong><br>
                    ${SERVICE_LABELS[service]}가 실행 중인지 확인하세요.<br>
                    <code style="font-size:11px;">${err.message || '연결 실패'}</code>
                </div>
            `;
            respMeta.textContent = '';
        } finally {
            sendBtn.disabled = false;
            sendBtn.textContent = 'Send Request';
        }
    });

    populateEndpoints();
}
