const STORAGE_KEY = 'pact_guide_progress';

function loadProgress() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : { currentStep: 1, completed: [] };
    } catch {
        return { currentStep: 1, completed: [] };
    }
}

function saveProgress(progress) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
        // localStorage 사용 불가 시 무시
    }
}

const BUILTIN_STEPS = [
    {
        step: 1, title: 'Consumer-Driven Contract Testing이란?',
        content: 'Consumer가 Provider에게 기대하는 요청/응답을 계약(Pact)으로 정의하고, Provider가 해당 계약을 실제로 만족하는지 검증하는 테스트 방식입니다. 실제 서비스를 띄우지 않고도 통합 테스트가 가능합니다.',
        keyPoint: 'Consumer가 계약을 주도한다 — Provider는 계약을 이행하면 된다.',
        code: '// Consumer 쪽에서 @Pact 어노테이션으로 계약을 정의\n@Pact(consumer = "AttendeeService", provider = "SessionService")\npublic RequestResponsePact sessionExists(PactDslWithProvider builder) {\n    return builder\n        .given("세션 ID 1이 존재함")\n        .uponReceiving("세션 1 조회 요청")\n            .path("/sessions/1").method("GET")\n        .willRespondWith()\n            .status(200)\n            .body(new PactDslJsonBody().integerType("id").stringType("title"))\n        .toPact();\n}'
    },
    {
        step: 2, title: '@Pact 어노테이션 — 계약 정의',
        content: '@Pact 어노테이션 메서드에서 given()/uponReceiving()/willRespondWith()를 사용해 Consumer가 기대하는 요청과 응답을 정의합니다. PactDslJsonBody의 타입 매처를 사용하면 정확한 값이 아니라 타입만 검증할 수 있습니다.',
        keyPoint: 'stringType/integerType 등 타입 매처 사용 → 유연한 계약',
        code: 'PactDslJsonBody body = new PactDslJsonBody()\n    .integerType("id", 1)\n    .stringType("title", "gRPC로 마이크로서비스 구축하기")\n    .stringType("speaker", "장호")\n    .stringType("dateTime", "2024-09-15T10:00:00")\n    .stringType("description", "설명");'
    },
    {
        step: 3, title: '@PactTestFor — Consumer 테스트 실행',
        content: '@PactTestFor 어노테이션으로 Consumer 테스트를 실행합니다. Pact 라이브러리가 자동으로 MockServer를 시작하고, 실제 서비스 대신 MockServer에 요청을 보내 계약 일치 여부를 검증합니다.',
        keyPoint: 'MockServer가 자동으로 시작되며, 테스트 성공 시 Pact JSON 파일이 자동 생성된다.',
        code: '@ExtendWith(PactConsumerTestExt.class)\n@PactTestFor(providerName = "SessionService")\nclass SessionClientPactTest {\n    @Test\n    @PactTestFor(pactMethod = "sessionExists")\n    void testGetSession(MockServer mockServer) {\n        SessionClient client = new SessionClient(mockServer.getUrl());\n        SessionDto session = client.getSession(1L);\n        assertThat(session.getId()).isEqualTo(1L);\n    }\n}'
    },
    {
        step: 4, title: 'Pact JSON 파일 — 계약서',
        content: 'Consumer 테스트 성공 시 build/pacts/AttendeeService-SessionService.json이 자동 생성됩니다. 이 파일이 Consumer와 Provider 사이의 계약서입니다. interactions 배열에 각 요청/응답 상호작용이 기록됩니다.',
        keyPoint: 'Pact 파일은 Consumer가 생성하고, Provider는 이 파일로 검증한다.',
        code: '{\n  "consumer": { "name": "AttendeeService" },\n  "provider": { "name": "SessionService" },\n  "interactions": [\n    {\n      "description": "세션 1 조회 요청",\n      "providerStates": [{ "name": "세션 ID 1이 존재함" }],\n      "request": { "method": "GET", "path": "/sessions/1" },\n      "response": { "status": 200, ... }\n    }\n  ]\n}'
    },
    {
        step: 5, title: '@State — Provider 상태 설정',
        content: 'Provider 테스트에서 @State 어노테이션으로 Consumer가 .given()에 지정한 전제 조건을 실제로 충족시킵니다. 상태 이름은 Consumer의 .given() 문자열과 정확히 일치해야 합니다.',
        keyPoint: '상태 이름(given과 State 값)이 정확히 일치해야 검증이 통과된다.',
        code: '@State("세션 ID 1이 존재함")\npublic void sessionExists() {\n    // 테스트 데이터 준비\n    Session session = new Session(1L, "gRPC로 마이크로서비스 구축하기", ...);\n    sessionRepository.save(session);\n}'
    },
    {
        step: 6, title: '@Provider + @PactFolder — Provider 검증',
        content: 'Pact 프레임워크가 Pact JSON 파일을 읽어 실제 Provider 서비스에 요청을 재생(replay)합니다. Provider의 응답이 계약과 일치하는지 자동으로 검증합니다.',
        keyPoint: '@PactFolder로 Consumer가 생성한 Pact 파일 위치를 지정한다.',
        code: '@ExtendWith(PactVerificationInvocationContextProvider.class)\n@Provider("SessionService")\n@PactFolder("../attendee-service/build/pacts")\n@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)\nclass SessionServiceProviderTest {\n    @LocalServerPort\n    private int port;\n\n    @BeforeEach\n    void setup(PactVerificationContext context) {\n        context.setTarget(new HttpTestTarget("localhost", port));\n    }\n}'
    },
    {
        step: 7, title: '전체 워크플로우 정리',
        content: 'Consumer가 계약을 정의하고 Pact JSON을 생성 → Provider가 계약을 검증하는 전체 CDC 워크플로우입니다. Pact Broker를 사용하면 계약을 중앙에서 관리하고 can-i-deploy로 배포 안전성을 확인할 수 있습니다.',
        keyPoint: 'Pact Broker → can-i-deploy → 안전한 독립 배포 가능',
        code: '# 1. Consumer 테스트 실행 (Pact 파일 생성)\n./gradlew :attendee-service:test\n\n# 2. (선택) Pact Broker에 게시\n./gradlew :attendee-service:pactPublish\n\n# 3. Provider 검증\n./gradlew :session-service:test\n\n# 4. (선택) 배포 가능 여부 확인\npact-broker can-i-deploy --pacticipant AttendeeService --to production'
    }
];

async function loadSteps() {
    try {
        const res = await fetch('./data/guide-steps.json');
        if (!res.ok) throw new Error('not found');
        return await res.json();
    } catch {
        return BUILTIN_STEPS;
    }
}

function escapeHtml(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function renderProgressBar(current, total, completedSet) {
    const pct = Math.round(((current - 1) / total) * 100);
    const dots = Array.from({ length: total }, (_, i) => {
        const n = i + 1;
        const isDone = completedSet.has(n);
        const isCurrent = n === current;
        let cls = 'guide-dot';
        if (isCurrent) cls += ' current';
        else if (isDone) cls += ' done';
        return `<span class="${cls}" data-step="${n}" title="${n}단계">${n}</span>`;
    }).join('');

    return `
        <div class="guide-progress-bar">
            <div class="guide-progress-track">
                <div class="guide-progress-fill" style="width:${pct}%;"></div>
            </div>
            <div class="guide-progress-dots">${dots}</div>
            <div style="font-size:12px;color:var(--text-muted);margin-top:6px;text-align:right;">
                ${current} / ${total} 단계
            </div>
        </div>
    `;
}

function renderStepCard(step, isCompleted) {
    const hasCode = step.code && step.code.trim().length > 0;
    const codeBlock = hasCode ? `
        <div class="code-block" style="margin-top:14px;">
            <div class="code-header">
                <span>코드 예시</span>
                <button class="guide-copy-btn" data-code="${escapeHtml(step.code)}">복사</button>
            </div>
            <pre><code>${escapeHtml(step.code)}</code></pre>
        </div>
    ` : '';

    return `
        <div class="guide-step-card card">
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
                <div class="guide-step-num">${step.step}</div>
                <div>
                    <div style="font-size:16px;font-weight:700;color:var(--text);">${escapeHtml(step.title)}</div>
                    <div style="font-size:12px;color:var(--text-muted);margin-top:2px;">Step ${step.step} of 7</div>
                </div>
                ${isCompleted ? '<span class="badge badge-up" style="margin-left:auto;">완료</span>' : ''}
            </div>
            <p style="font-size:13.5px;color:var(--text-muted);line-height:1.7;margin-bottom:14px;">${escapeHtml(step.content)}</p>
            <div class="info-box info" style="margin-bottom:0;">
                <strong>핵심 포인트:</strong> ${escapeHtml(step.keyPoint)}
            </div>
            ${codeBlock}
        </div>
    `;
}

export async function renderGuide(container) {
    container.innerHTML = `
        <div class="page-header">
            <h1>Learning Guide</h1>
            <p>Pact CDC 테스트의 핵심 개념을 7단계로 학습하세요. 진행 상황은 자동으로 저장됩니다.</p>
        </div>
        <div class="loading"><div class="spinner"></div> 학습 가이드 로딩 중...</div>
    `;

    const steps = await loadSteps();

    const progress = loadProgress();
    if (progress.currentStep < 1 || progress.currentStep > steps.length) {
        progress.currentStep = 1;
    }
    const completedSet = new Set(progress.completed || []);

    // 인라인 스타일
    const style = document.createElement('style');
    style.textContent = `
        .guide-progress-bar { margin-bottom: 24px; }
        .guide-progress-track {
            height: 6px; background: var(--border); border-radius: 3px; overflow: hidden; margin-bottom: 10px;
        }
        .guide-progress-fill {
            height: 100%; background: var(--primary); border-radius: 3px; transition: width .4s;
        }
        .guide-progress-dots {
            display: flex; gap: 8px; justify-content: center;
        }
        .guide-dot {
            width: 28px; height: 28px; border-radius: 50%; background: var(--border);
            display: flex; align-items: center; justify-content: center;
            font-size: 11px; font-weight: 600; color: var(--text-muted);
            cursor: pointer; transition: all .2s;
        }
        .guide-dot.current {
            background: var(--primary); color: #fff; box-shadow: 0 0 0 3px var(--primary-light);
        }
        .guide-dot.done {
            background: var(--success-light); color: var(--success); border: 1px solid var(--success);
        }
        .guide-dot:hover { transform: scale(1.12); }

        .guide-step-num {
            width: 40px; height: 40px; border-radius: 50%; background: var(--primary);
            color: #fff; display: flex; align-items: center; justify-content: center;
            font-size: 16px; font-weight: 700; flex-shrink: 0;
        }

        .guide-nav-row {
            display: flex; gap: 12px; justify-content: space-between; align-items: center; margin-top: 20px;
        }
        .guide-nav-row .btn { min-width: 120px; justify-content: center; }

        .guide-step-card { margin-bottom: 0; }
    `;
    container.appendChild(style);

    // 컨테이너 재구성
    container.innerHTML = `
        <div class="page-header">
            <h1>Learning Guide</h1>
            <p>Pact CDC 테스트의 핵심 개념을 7단계로 학습하세요. 진행 상황은 자동으로 저장됩니다.</p>
        </div>
        <div id="guide-progress"></div>
        <div id="guide-content"></div>
        <div class="guide-nav-row" id="guide-nav"></div>
    `;
    container.appendChild(style);

    const progressEl = container.querySelector('#guide-progress');
    const contentEl = container.querySelector('#guide-content');
    const navEl = container.querySelector('#guide-nav');

    function renderCurrentStep() {
        const current = progress.currentStep;
        const step = steps.find(s => s.step === current);
        const isCompleted = completedSet.has(current);

        // 진행률 바
        progressEl.innerHTML = renderProgressBar(current, steps.length, completedSet);

        // 진행률 바 점 클릭
        progressEl.querySelectorAll('.guide-dot').forEach(dot => {
            dot.addEventListener('click', () => {
                const n = parseInt(dot.dataset.step, 10);
                progress.currentStep = n;
                saveProgress(progress);
                renderCurrentStep();
            });
        });

        // 단계 카드
        contentEl.innerHTML = renderStepCard(step, isCompleted);

        // 코드 복사 버튼
        contentEl.querySelectorAll('.guide-copy-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const code = btn.dataset.code;
                navigator.clipboard.writeText(code).then(() => {
                    const orig = btn.textContent;
                    btn.textContent = '복사됨!';
                    btn.style.background = 'var(--success)';
                    btn.style.color = '#fff';
                    setTimeout(() => {
                        btn.textContent = orig;
                        btn.style.background = '';
                        btn.style.color = '';
                    }, 1500);
                });
            });
        });

        // 네비게이션
        const isFirst = current === 1;
        const isLast = current === steps.length;
        navEl.innerHTML = `
            <button id="guide-prev" class="btn btn-secondary" ${isFirst ? 'disabled' : ''}>← 이전</button>
            <div style="font-size:13px;color:var(--text-muted);">
                ${completedSet.size} / ${steps.length} 단계 완료
            </div>
            <button id="guide-next" class="btn btn-primary">
                ${isLast ? '처음으로 돌아가기' : isCompleted ? '다음 →' : '완료하고 다음 →'}
            </button>
        `;

        navEl.querySelector('#guide-prev')?.addEventListener('click', () => {
            if (progress.currentStep > 1) {
                progress.currentStep--;
                saveProgress(progress);
                renderCurrentStep();
            }
        });

        navEl.querySelector('#guide-next')?.addEventListener('click', () => {
            // 현재 단계를 완료로 표시
            if (!completedSet.has(current)) {
                completedSet.add(current);
                progress.completed = [...completedSet];
            }
            if (isLast) {
                progress.currentStep = 1;
            } else {
                progress.currentStep++;
            }
            saveProgress(progress);
            renderCurrentStep();
        });
    }

    renderCurrentStep();
}
