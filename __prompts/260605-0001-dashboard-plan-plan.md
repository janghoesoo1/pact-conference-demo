# 260605-0001 Dashboard Implementation Plan

## 타입: plan

## 요청
Pact CDC 테스트 데모 프로젝트를 위한 대시보드 구현 계획서 작성 요청.
6개 화면(시스템 아키텍처, Pact 계약, API 탐색기, 테스트 결과, 서비스 상태, 학습 가이드)과
4개 기술 스택 후보(React, Next.js, 정적 HTML, Thymeleaf) 중 추천안 선정.

## 응답 요약
- 기술 스택: C안(HTML/CSS/JS 정적 파일) 추천. 빌드 불필요, 즉시 실행, 기존 스택 무침범이 학습 데모에 최적.
- 모듈 구조: `dashboard/` 디렉토리를 Gradle 모듈이 아닌 별도 정적 디렉토리로 추가.
- 파일 수: 신규 16개 + 기존 수정 3개 = 총 19개 파일.
- 구현 순서: 6단계 (스캐폴딩 -> Overview -> Contracts -> API Explorer -> Test Runner -> Learning Guide).
- CORS 해결: 기존 Controller에 `@CrossOrigin("*")` 1줄 추가.

## 산출물
- `.omc/plans/dashboard-implementation.md` - 전체 계획서
- `.omc/plans/open-questions.md` - 미결 사항 5건
