const CDC_STEPS = [
    {
        id: 1,
        label: 'Consumer 계약 정의',
        sublabel: '@Pact 메서드',
        desc: 'Consumer(AttendeeService)가 @Pact 어노테이션 메서드에서 Provider에게 기대하는 요청/응답 계약을 정의합니다. PactDslWithProvider로 given/uponReceiving/willRespondWith를 선언합니다.',
        icon: '1'
    },
    {
        id: 2,
        label: 'Consumer 테스트 실행',
        sublabel: 'MockServer',
        desc: '테스트 실행 시 Pact 라이브러리가 MockServer를 자동으로 시작합니다. SessionClient는 실제 서비스 대신 MockServer로 요청을 보내고, 요청이 계약과 일치하는지 검증합니다.',
        icon: '2'
    },
    {
        id: 3,
        label: 'Pact JSON 파일 생성',
        sublabel: 'build/pacts/',
        desc: '테스트가 성공하면 AttendeeService-SessionService.json 파일이 build/pacts/ 디렉토리에 자동 생성됩니다. 이 파일이 Consumer와 Provider 사이의 계약서입니다.',
        icon: '3'
    },
    {
        id: 4,
        label: 'Provider 상태 설정',
        sublabel: '@State',
        desc: 'Provider(SessionService) 테스트에서 @State 어노테이션으로 Consumer가 .given()에 지정한 전제 조건을 실제로 충족시킵니다. 상태 이름은 Consumer의 .given() 문자열과 정확히 일치해야 합니다.',
        icon: '4'
    },
    {
        id: 5,
        label: 'Provider 검증',
        sublabel: '실제 서버',
        desc: 'Pact 프레임워크가 Pact JSON 파일을 읽어 실제 Provider 서비스에 요청을 재생(replay)합니다. Provider의 응답이 계약과 일치하는지 자동으로 검증합니다.',
        icon: '5'
    }
];

const TEST_SUMMARY = {
    consumer: [
        { name: '세션 단건 조회 (200)', status: 'PASS', desc: 'GET /sessions/1 → 200 OK, id/title/speaker 타입 검증' },
        { name: '세션 목록 조회 (200)', status: 'PASS', desc: 'GET /sessions → 200 OK, 배열 각 항목 타입 검증' },
        { name: '존재하지 않는 세션 (404)', status: 'PASS', desc: 'GET /sessions/999 → 404 Not Found' }
    ],
    provider: [
        { name: 'Provider: 세션 단건 조회 검증', status: 'PASS', desc: 'Consumer 계약 대로 응답 구조 검증' },
        { name: 'Provider: 세션 목록 조회 검증', status: 'PASS', desc: '3개 세션 반환 및 타입 검증' },
        { name: 'Provider: 404 응답 검증', status: 'PASS', desc: '미존재 세션 요청 시 404 반환' }
    ],
    unit: [
        { name: 'SessionController: 세션 목록 조회', status: 'PASS', desc: 'GET /sessions 200 응답' },
        { name: 'SessionController: 세션 단건 조회', status: 'PASS', desc: 'GET /sessions/1 200 응답' },
        { name: 'SessionController: 세션 미존재 404', status: 'PASS', desc: 'GET /sessions/999 404 응답' },
        { name: 'AttendeeController: 참석자 목록 조회', status: 'PASS', desc: 'GET /attendees 200 응답' },
        { name: 'AttendeeController: 참석자 단건 조회', status: 'PASS', desc: 'GET /attendees/1 200 응답' },
        { name: 'AttendeeController: 참석자의 세션 목록', status: 'PASS', desc: 'GET /attendees/1/sessions 200 응답' }
    ]
};

const GRADLE_COMMANDS = [
    {
        label: 'Consumer 테스트 (Pact 파일 생성)',
        cmd: './gradlew :attendee-service:test',
        desc: 'AttendeeService의 Consumer Pact 테스트를 실행하고 build/pacts/에 계약 파일을 생성합니다.'
    },
    {
        label: 'Provider 검증',
        cmd: './gradlew :session-service:test',
        desc: 'SessionService의 Provider 검증 테스트를 실행합니다. Consumer 계약 파일을 읽어 실제 서비스를 검증합니다.'
    },
    {
        label: '전체 테스트',
        cmd: './gradlew test',
        desc: '모든 모듈의 테스트를 순서대로 실행합니다.'
    }
];

function copyToClipboard(text, btn) {
    navigator.clipboard.writeText(text).then(() => {
        const original = btn.textContent;
        btn.textContent = '복사됨!';
        btn.style.background = 'var(--success)';
        btn.style.color = '#fff';
        setTimeout(() => {
            btn.textContent = original;
            btn.style.background = '';
            btn.style.color = '';
        }, 1500);
    });
}

function renderCdcFlow() {
    let activeStep = null;

    const wrapper = document.createElement('div');
    wrapper.className = 'card guide-section';
    wrapper.style.marginBottom = '20px';
    wrapper.innerHTML = `
        <div class="card-header">
            <span class="card-title">CDC 테스트 흐름</span>
            <span style="font-size:12px;color:var(--text-muted);">단계를 클릭하면 상세 설명을 확인할 수 있습니다</span>
        </div>
        <div class="cdc-flow-steps" id="cdc-flow-steps"></div>
    `;

    const stepsContainer = wrapper.querySelector('#cdc-flow-steps');
    stepsContainer.style.cssText = 'display:flex;flex-direction:column;gap:0;';

    CDC_STEPS.forEach((step, i) => {
        const isLast = i === CDC_STEPS.length - 1;
        const stepEl = document.createElement('div');
        stepEl.style.cssText = 'display:flex;flex-direction:column;';
        stepEl.innerHTML = `
            <div class="cdc-step" data-idx="${i}" style="display:flex;align-items:center;gap:14px;padding:12px 16px;border-radius:6px;cursor:pointer;transition:background .15s;border:2px solid transparent;">
                <div class="cdc-step-num" style="width:28px;height:28px;border-radius:50%;background:var(--primary);color:#fff;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0;">${step.icon}</div>
                <div style="flex:1;">
                    <div style="font-size:13.5px;font-weight:600;color:var(--text);">${step.label}</div>
                    <div style="font-size:11.5px;color:var(--text-muted);margin-top:1px;">${step.sublabel}</div>
                </div>
                <span class="cdc-chevron" style="font-size:12px;color:var(--text-light);transition:transform .15s;">▼</span>
            </div>
            <div class="cdc-step-detail" style="display:none;padding:12px 16px 12px 58px;background:var(--primary-light);border-radius:6px;margin:0 0 4px;font-size:13px;color:#1d4ed8;line-height:1.6;">
                ${step.desc}
            </div>
            ${!isLast ? '<div style="display:flex;align-items:center;padding-left:28px;height:16px;"><div style="width:2px;height:16px;background:var(--border);margin-left:13px;"></div></div>' : ''}
        `;

        const stepBtn = stepEl.querySelector('.cdc-step');
        const detail = stepEl.querySelector('.cdc-step-detail');
        const chevron = stepEl.querySelector('.cdc-chevron');

        stepBtn.addEventListener('click', () => {
            const isOpen = detail.style.display !== 'none';
            // 모두 닫기
            stepsContainer.querySelectorAll('.cdc-step-detail').forEach(d => { d.style.display = 'none'; });
            stepsContainer.querySelectorAll('.cdc-step').forEach(s => {
                s.style.background = '';
                s.style.borderColor = 'transparent';
            });
            stepsContainer.querySelectorAll('.cdc-chevron').forEach(c => { c.style.transform = ''; });

            if (!isOpen) {
                detail.style.display = '';
                stepBtn.style.background = 'var(--primary-light)';
                stepBtn.style.borderColor = 'var(--primary)';
                chevron.style.transform = 'rotate(180deg)';
            }
        });

        stepsContainer.appendChild(stepEl);
    });

    return wrapper;
}

function renderGradleCommands() {
    const section = document.createElement('div');
    section.className = 'card guide-section';
    section.style.marginBottom = '20px';
    section.innerHTML = `
        <div class="card-header">
            <span class="card-title">테스트 실행 명령어</span>
        </div>
    `;

    GRADLE_COMMANDS.forEach(({ label, cmd, desc }) => {
        const block = document.createElement('div');
        block.style.marginBottom = '14px';
        block.innerHTML = `
            <div style="font-size:13px;font-weight:600;color:var(--text);margin-bottom:4px;">${label}</div>
            <div style="font-size:12px;color:var(--text-muted);margin-bottom:6px;">${desc}</div>
            <div class="code-block">
                <div class="code-header">
                    <span>bash</span>
                    <button class="copy-btn">복사</button>
                </div>
                <pre><code>${cmd}</code></pre>
            </div>
        `;
        const copyBtn = block.querySelector('.copy-btn');
        copyBtn.addEventListener('click', () => copyToClipboard(cmd, copyBtn));
        section.appendChild(block);
    });

    return section;
}

function renderTestSummary() {
    const total = TEST_SUMMARY.consumer.length + TEST_SUMMARY.provider.length + TEST_SUMMARY.unit.length;
    const passAll = [...TEST_SUMMARY.consumer, ...TEST_SUMMARY.provider, ...TEST_SUMMARY.unit].every(t => t.status === 'PASS');

    const section = document.createElement('div');
    section.className = 'card';
    section.innerHTML = `
        <div class="card-header">
            <span class="card-title">테스트 요약</span>
            <span class="badge ${passAll ? 'badge-up' : 'badge-down'}">${passAll ? 'ALL PASS' : 'FAIL'}</span>
        </div>
        <div class="grid-3" style="margin-bottom:20px;">
            <div class="stat-card">
                <div class="stat-label">Consumer Pact</div>
                <div class="stat-value">${TEST_SUMMARY.consumer.length}</div>
                <div class="stat-desc">계약 테스트</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Provider Verification</div>
                <div class="stat-value">${TEST_SUMMARY.provider.length}</div>
                <div class="stat-desc">공급자 검증</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Controller Unit</div>
                <div class="stat-value">${TEST_SUMMARY.unit.length}</div>
                <div class="stat-desc">단위 테스트</div>
            </div>
        </div>
        <div id="test-detail-tabs"></div>
    `;

    const tabsEl = section.querySelector('#test-detail-tabs');

    const tabs = [
        { key: 'consumer', label: 'Consumer Pact Tests' },
        { key: 'provider', label: 'Provider Verification' },
        { key: 'unit', label: 'Controller Unit Tests' }
    ];

    const tabBar = document.createElement('div');
    tabBar.className = 'tabs';
    tabs.forEach(({ key, label }) => {
        const btn = document.createElement('button');
        btn.className = 'tab-btn' + (key === 'consumer' ? ' active' : '');
        btn.textContent = label;
        btn.dataset.tab = key;
        tabBar.appendChild(btn);
    });
    tabsEl.appendChild(tabBar);

    const contentEl = document.createElement('div');
    tabsEl.appendChild(contentEl);

    function renderTabContent(key) {
        const list = TEST_SUMMARY[key];
        contentEl.innerHTML = list.map(t => `
            <div style="display:flex;align-items:flex-start;gap:12px;padding:10px 0;border-bottom:1px solid var(--border);">
                <span style="color:${t.status === 'PASS' ? 'var(--success)' : 'var(--danger)'};font-size:16px;line-height:1;flex-shrink:0;">${t.status === 'PASS' ? '✓' : '✗'}</span>
                <div>
                    <div style="font-size:13px;font-weight:600;color:var(--text);">${t.name}</div>
                    <div style="font-size:12px;color:var(--text-muted);margin-top:2px;">${t.desc}</div>
                </div>
                <span class="badge ${t.status === 'PASS' ? 'badge-up' : 'badge-down'}" style="margin-left:auto;flex-shrink:0;">${t.status}</span>
            </div>
        `).join('');
    }

    tabBar.addEventListener('click', (e) => {
        const btn = e.target.closest('.tab-btn');
        if (!btn) return;
        tabBar.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderTabContent(btn.dataset.tab);
    });

    renderTabContent('consumer');

    // 합계 행
    const totalRow = document.createElement('div');
    totalRow.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:12px 0 0;font-size:13px;font-weight:600;color:var(--text);';
    totalRow.innerHTML = `
        <span>전체 테스트</span>
        <span>${total}건 / <span style="color:var(--success);">${total} PASS</span></span>
    `;
    tabsEl.appendChild(totalRow);

    return section;
}

export function renderTests(container) {
    container.innerHTML = `
        <div class="page-header">
            <h1>Test Results</h1>
            <p>CDC 테스트 흐름과 테스트 실행 결과를 확인하세요.</p>
        </div>
    `;

    container.appendChild(renderCdcFlow());
    container.appendChild(renderGradleCommands());
    container.appendChild(renderTestSummary());
}
