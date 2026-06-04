import { createJsonViewer } from '../components/json-viewer.js';

const PACT_FILE_PATH = '../attendee-service/build/pacts/AttendeeService-SessionService.json';
const FALLBACK_PATH = '../data/pact-contract.json';

export async function renderContracts(container) {
    container.innerHTML = `
        <div class="page-header">
            <h1>Contracts</h1>
            <p>Consumer-Driven Contract - AttendeeService (Consumer) ↔ SessionService (Provider)</p>
        </div>
        <div id="contracts-content">
            <div class="loading"><div class="spinner"></div>Pact 파일 로드 중...</div>
        </div>
    `;

    const pact = await loadPact();
    renderContractContent(container.querySelector('#contracts-content'), pact);
}

async function loadPact() {
    try {
        const res = await fetch(PACT_FILE_PATH);
        if (!res.ok) throw new Error('Not found');
        return await res.json();
    } catch {
        const res = await fetch(FALLBACK_PATH);
        return await res.json();
    }
}

function renderContractContent(container, pact) {
    const { consumer, provider, interactions, metadata } = pact;

    container.innerHTML = `
        <div class="card" style="margin-bottom:16px;">
            <div class="card-header" style="margin-bottom:0;">
                <div>
                    <div class="card-title">계약 정보</div>
                </div>
                <span class="badge badge-primary">Pact Spec ${metadata?.pactSpecification?.version ?? ''}</span>
            </div>
            <hr class="divider">
            <div style="display:flex;gap:32px;flex-wrap:wrap;">
                <div>
                    <div style="font-size:11px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:.05em;margin-bottom:4px;">Consumer</div>
                    <div style="font-size:15px;font-weight:700;color:var(--primary);">${consumer.name}</div>
                </div>
                <div style="display:flex;align-items:center;font-size:20px;color:var(--text-muted);">→</div>
                <div>
                    <div style="font-size:11px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:.05em;margin-bottom:4px;">Provider</div>
                    <div style="font-size:15px;font-weight:700;color:var(--success);">${provider.name}</div>
                </div>
                <div style="margin-left:auto;">
                    <div style="font-size:11px;font-weight:600;color:var(--text-muted);text-transform:uppercase;letter-spacing:.05em;margin-bottom:4px;">Interactions</div>
                    <div style="font-size:15px;font-weight:700;color:var(--text);">${interactions.length}</div>
                </div>
            </div>
        </div>

        <div id="interaction-cards"></div>

        <div class="card" style="margin-top:16px;">
            <div class="card-header">
                <div class="card-title">Raw Pact JSON</div>
                <button class="toggle-btn" id="raw-toggle">펼치기</button>
            </div>
            <div id="raw-json" class="toggle-content"></div>
        </div>
    `;

    const cardsContainer = container.querySelector('#interaction-cards');
    interactions.forEach((interaction, idx) => {
        cardsContainer.appendChild(buildInteractionCard(interaction, idx));
    });

    // Raw JSON toggle
    const rawToggle = container.querySelector('#raw-toggle');
    const rawJson = container.querySelector('#raw-json');
    rawToggle.addEventListener('click', () => {
        const showing = rawJson.classList.toggle('show');
        rawToggle.textContent = showing ? '접기' : '펼치기';
        rawToggle.classList.toggle('active', showing);
        if (showing && !rawJson.hasChildNodes()) {
            rawJson.appendChild(createJsonViewer(pact, 0));
        }
    });
}

function buildInteractionCard(interaction, idx) {
    const card = document.createElement('div');
    card.className = 'contract-card';

    const method = interaction.request.method;
    const path = interaction.request.path;
    const status = interaction.response.status;
    const providerState = interaction.providerStates?.[0]?.name ?? '-';
    const matchingRules = interaction.response.matchingRules?.body ?? {};
    const hasBody = interaction.response.body !== undefined;
    const hasReqBody = interaction.request.body !== undefined;
    const statusClass = status >= 500 ? 'status-5xx' : status >= 400 ? 'status-4xx' : 'status-2xx';

    card.innerHTML = `
        <div class="contract-card-header">
            <span class="method-badge method-${method}">${method}</span>
            <span class="contract-card-desc">${interaction.description}</span>
            <span class="badge ${status >= 400 ? 'badge-warning' : 'badge-up'}">HTTP ${status}</span>
        </div>
        <div class="contract-card-body">
            <div class="contract-detail-row">
                <span class="contract-detail-label">Path</span>
                <span class="contract-path">${path}</span>
            </div>
            <div class="contract-detail-row">
                <span class="contract-detail-label">Provider State</span>
                <span style="font-size:13px;">${providerState}</span>
            </div>
            <div class="contract-detail-row">
                <span class="contract-detail-label">Response</span>
                <span class="status-code ${statusClass}">${status}</span>
            </div>

            <div class="contract-toggle">
                ${hasBody ? `<button class="toggle-btn" data-target="resp-${idx}">Response Body</button>` : ''}
                ${hasReqBody ? `<button class="toggle-btn" data-target="req-${idx}">Request Body</button>` : ''}
                ${Object.keys(matchingRules).length > 0 ? `<button class="toggle-btn" data-target="rules-${idx}">Matching Rules</button>` : ''}
            </div>

            ${hasBody ? `<div class="toggle-content" id="resp-${idx}"></div>` : ''}
            ${hasReqBody ? `<div class="toggle-content" id="req-${idx}"></div>` : ''}
            ${Object.keys(matchingRules).length > 0 ? `
                <div class="toggle-content" id="rules-${idx}">
                    <div style="font-size:12px;font-weight:600;color:var(--text-muted);margin-bottom:8px;text-transform:uppercase;letter-spacing:.05em;">Matching Rules</div>
                    <div class="matching-rules">
                        ${Object.entries(matchingRules).map(([rulePath, ruleDef]) => {
                            const matcher = ruleDef.matchers?.[0]?.match ?? '-';
                            return `
                                <div class="matching-rule-item">
                                    <span class="rule-path">${rulePath}</span>
                                    <span class="rule-type">${matcher}</span>
                                    <span style="font-size:11.5px;color:var(--text-muted);">
                                        ${describeRule(matcher)}
                                    </span>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            ` : ''}
        </div>
    `;

    // Toggle handlers
    card.querySelectorAll('.toggle-btn[data-target]').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.dataset.target;
            const content = card.querySelector(`#${targetId}`);
            if (!content) return;

            const showing = content.classList.toggle('show');
            btn.classList.toggle('active', showing);

            if (showing && !content.hasChildNodes()) {
                if (targetId.startsWith('resp-') && interaction.response.body) {
                    content.appendChild(createJsonViewer(interaction.response.body));
                } else if (targetId.startsWith('req-') && interaction.request.body) {
                    content.appendChild(createJsonViewer(interaction.request.body));
                }
            }
        });
    });

    return card;
}

function describeRule(matcher) {
    const descriptions = {
        type: '값의 타입만 일치하면 됨 (실제 값 무관)',
        integer: '정수 값이면 됨',
        decimal: '소수 값이면 됨',
        regex: '정규식 패턴 일치',
        include: '부분 문자열 포함',
        equality: '정확한 값 일치 필요'
    };
    return descriptions[matcher] ?? matcher;
}
