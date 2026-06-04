# 260605-0004 Dashboard Phase 4~6 구현

## 타입: chat

## 요청
대시보드 Phase 4~6 구현 요청.
- Phase 4: API Explorer (api-explorer.js, api-endpoints.json)
- Phase 5: Test Results (tests.js)
- Phase 6: Learning Guide (guide.js, guide-steps.json)

## 응답 요약

### Phase 4: API Explorer

**dashboard/data/api-endpoints.json** 생성
- session 5개, attendee 6개 총 11개 API 정의
- hasId, hasBody, sampleBody 필드로 UI 자동 구성

**dashboard/js/pages/api-explorer.js** 구현 (기존 Phase 3 파일 개선)
- 서비스 드롭다운 (Session Service / Attendee Service)
- 엔드포인트 드롭다운 (서비스별 api-endpoints.json 로드)
- ID 입력 필드 (hasId=true인 엔드포인트만 표시)
- Request Body textarea (hasBody=true인 엔드포인트만 표시, sampleBody 기본값)
- Method/URL 자동 구성 (BASE_URLS + resolvedPath)
- Send Request 버튼 → callApi() 호출
- 응답 패널: status, elapsed, JSON 하이라이팅 (createJsonViewer)
- 서비스 미실행 시 "서비스에 연결할 수 없습니다" 오류 표시
- FALLBACK_ENDPOINTS: api-endpoints.json 로드 실패 시 내장 데이터 사용

### Phase 5: Test Results

**dashboard/js/pages/tests.js** 생성
- 섹션 1: CDC 테스트 흐름도 (5단계 카드, 클릭 시 설명 확장)
  1. Consumer 계약 정의 (@Pact 메서드)
  2. Consumer 테스트 실행 (MockServer)
  3. Pact JSON 파일 생성
  4. Provider 상태 설정 (@State)
  5. Provider 검증 (실제 서버)
- 섹션 2: Gradle 명령어 3개 (복사 버튼 포함)
- 섹션 3: 테스트 요약 (정적 데이터, 탭 UI)
  - Consumer Pact 3건, Provider Verification 3건, Unit Tests 6건
  - 탭 클릭 시 해당 테스트 목록 표시

### Phase 6: Learning Guide

**dashboard/data/guide-steps.json** 생성
- 7단계 학습 가이드 데이터 (사양 명세 그대로)
- 각 단계: step, title, content, keyPoint, code

**dashboard/js/pages/guide.js** 구현
- BUILTIN_STEPS fallback 포함 (guide-steps.json 로드 실패 시)
- guide-steps.json 우선 로드
- 상단 진행률 바 (track + fill + dots)
- 단계 번호 점 클릭으로 직접 이동
- 단계 카드: 번호, 제목, 설명, 핵심 포인트(info-box), 코드 블록
- 코드 블록 복사 버튼
- 이전/다음 버튼 + "완료하고 다음" 자동 완료 처리
- localStorage 진행 상태 저장/복원

## 최종 파일 구조

```
dashboard/
├── data/
│   ├── api-endpoints.json  [신규]
│   ├── guide-steps.json    [신규]
│   └── pact-contract.json  [기존]
└── js/
    └── pages/
        ├── api-explorer.js [개선]
        ├── tests.js        [신규]
        └── guide.js        [신규]
```

## 확인사항
- app.js의 모든 import가 정확히 매핑됨
- api-endpoints.json: 11개 API 유효한 JSON
- guide-steps.json: 7단계 유효한 JSON
- createJsonViewer (json-viewer.js에서 export) 정상 사용
