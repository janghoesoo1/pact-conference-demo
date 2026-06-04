# 260605-0003 Dashboard 스캐폴딩 구현

## 요청
Pact Conference Demo 대시보드를 `dashboard/` 디렉토리에 정적 HTML/CSS/JS SPA로 구현.
Phase 1~3 (스캐폴딩, Overview+Status, Contracts)

## 구현 내용

### 생성된 파일
- `dashboard/index.html` — SPA 진입점
- `dashboard/css/style.css` — CSS Variables 기반 모던 대시보드 스타일
- `dashboard/js/app.js` — 해시 기반 라우터
- `dashboard/js/api.js` — fetch 래퍼 (5초 timeout, 응답 시간 측정)
- `dashboard/js/components/nav.js` — 사이드 네비게이션
- `dashboard/js/components/json-viewer.js` — 재귀 JSON 뷰어 (구문 하이라이팅, 접기/펼치기)
- `dashboard/js/components/status-badge.js` — UP/DOWN 뱃지
- `dashboard/js/components/code-block.js` — 복사 버튼 포함 코드 블록
- `dashboard/js/pages/overview.js` — SVG 아키텍처 다이어그램 + 헬스 체크
- `dashboard/js/pages/status.js` — 10초 폴링 서비스 상태 모니터링
- `dashboard/js/pages/contracts.js` — Pact JSON 파싱 및 계약 카드
- `dashboard/js/pages/api-explorer.js` — 11개 엔드포인트 인터랙티브 탐색기
- `dashboard/js/pages/tests.js` — CDC 테스트 흐름 + 테스트 결과
- `dashboard/js/pages/guide.js` — 7단계 학습 가이드 (내장 데이터 fallback)
- `dashboard/data/pact-contract.json` — Pact 파일 정적 fallback

### 설계 결정
- 외부 라이브러리 없이 Vanilla JS + ES Modules
- JSON 뷰어는 DOM 직접 생성 (innerHTML 인젝션 방지, 2단계 이상 기본 접기)
- Contracts 페이지: 실제 Pact 파일 fetch 실패 시 정적 fallback 자동 전환
- Guide 페이지: guide-steps.json 없을 경우 BUILTIN_STEPS 내장 데이터 사용
- Status 페이지: MutationObserver로 페이지 이탈 시 폴링 자동 중단
