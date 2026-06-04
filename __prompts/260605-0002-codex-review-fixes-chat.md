# 260605-0002 Codex 코드리뷰 이슈 수정

## 사용자 요청
Codex(GPT-5.5) 코드리뷰에서 나온 HIGH 이슈 5개를 수정.

## 수정 항목

### 1. README.md JDK 버전 불일치
- `JDK 17+` → `JDK 21+` (build.gradle.kts의 jvmTarget = "21"에 맞춤)

### 2. 오류 응답 형식 통일
- `common/src/main/kotlin/com/conference/common/exception/GlobalExceptionHandler.kt` 신규 생성
- `@RestControllerAdvice`로 `ResourceNotFoundException` 전역 처리
- `SessionController.kt`에서 기존 로컬 `@ExceptionHandler` 제거
- `AttendeeController.kt`에서 try-catch 제거, 예외 전파로 변경
- `common/build.gradle.kts`에 `spring-boot-starter-web` 의존성 추가
- `SessionServiceApplication.kt`, `AttendeeServiceApplication.kt`에 `scanBasePackages = ["com.conference"]` 추가 (common 패키지 스캔 범위 포함)
- `SessionControllerTest.kt`에 `GlobalExceptionHandler::class` 포함

### 3. SessionClient.getSessions() 에러 처리 개선
- try-catch 추가: `RestClientResponseException`, `Exception` 모두 `emptyList()` 반환

### 4. Docker Compose 이미지 태그 고정
- `pactfoundation/pact-broker:latest` → `pactfoundation/pact-broker:2.113.1.1`

### 5. @CrossOrigin 추가
- `SessionController`, `AttendeeController`에 `@CrossOrigin(origins = ["*"])` 추가

## 검증
- `./gradlew test` → BUILD SUCCESSFUL (14 tasks, 0 failures)
