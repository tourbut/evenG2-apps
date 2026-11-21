---
title: Even Hub 버전 정책과 변경 이력
status: draft
updated: 2026-11-21
owner: dev
summary: 공식 버전 정책과 SDK·CLI·시뮬레이터 변경 기록
---

# Even Hub 버전 정책과 변경 이력

출처: 공식 자료 (2026-11-21 읽음)

## Reference 문서 목록

출처: https://hub.evenrealities.com/docs/reference/index (Last updated: 2026-08-25)

- CLI: 터미널에서 계정, 앱, 빌드, 테스터, 스크립팅까지 개발 루프 전체를 다룬다.
- Glossary: 문서 용어의 한 줄 정의다.
- Versioning Policy: semver, deprecation 기간, `min_sdk_version` 마이그레이션.
- Changelog: SDK·CLI·시뮬레이터 릴리스별 변경. 기능 단위로 묶었다.
- FAQ: 초기에 자주 묻는 "X가 가능한가?"에 대한 예/아니오 답.

## 버전 정책 (Versioning Policy)

출처: https://hub.evenrealities.com/docs/reference/versioning (Last updated: 2026-08-25)

Even Hub SDK는 semver(`MAJOR.MINOR.PATCH`)를 따른다.

### semver 계약

| 증가 | 의미 | 깨질 수 있는 것 |
|---|---|---|
| PATCH (0.0.13 → 0.0.14) | 버그 수정, 내부 리팩터. pre-1.0 동안은 하위 호환 기능 추가도 포함 | opt-in하지 않으면 없음. 단 0.0.x 패치가 공개 API를 늘릴 수 있으니 릴리스 노트를 읽는다 |
| MINOR (0.0.x → 0.1.0) | 새 메서드, 새 이벤트 타입, 새 manifest 필드 | 기존 코드는 동작. deprecated 메서드가 경고를 낼 수 있음. 아직 사용된 적 없음 |
| MAJOR (0.x → 1.0) | 메서드 시그니처, 이벤트 payload, edition의 breaking change | 마이그레이션이 필요할 수 있음 |

- 현재 SDK는 `0.x` 계열이다. API가 아직 고정되지 않았다는 신호다.
- `0.0.x` 동안은 버그 수정이든 기능이든 마지막 자리만 올린다.
- 지금까지 모든 기능이 PATCH로 나왔다.
- 운영 앱을 올리기 전에 모든 `0.0.x` 릴리스 노트를 읽는다.

### Deprecation 기간

| 단계 | 동작 |
|---|---|
| N (현재 MINOR) | 동작함. dev console에 `[DEPRECATED]` 경고 |
| N+1 | 동작함. 경고가 스택 트레이스 오류로 바뀜. 런타임 실패는 없음 |
| N+2 | 제거됨. 호출하면 throw |

- 마이그레이션에 MINOR 두 번의 여유가 있다.
- 예: `oldFoo()`가 `0.2.0`에서 deprecated면 `0.3.x`까지 동작하고 `0.4.0`에서 제거된다.
- PATCH는 아무것도 deprecate하지 않는다.

### min_sdk_version 마이그레이션

- `app.json`에 `min_sdk_version`을 선언한다.
- 올리면 되돌릴 수 없다. 구형 펌웨어 사용자는 그 버전을 설치·업데이트할 수 없다.

| 상황 | 설정값 |
|---|---|
| 현재 SDK에 있는 메서드만 사용 | npm install한 SDK 버전 |
| 이후 버전에 나온 메서드 사용 | 그 메서드가 처음 나온 버전 |
| 최신 PATCH에만 있는 버그 수정 필요 | 그 PATCH 버전 |
| 어떤 메서드가 어떤 버전인지 모름 | `npm list @evenrealities/even_hub_sdk` 결과 버전 (보수적이지만 안전) |

- 미리 올리지 않는다. 높을수록 구형 펌웨어 사용자를 버린다.

### min_app_version과 실행 시점 게이트

|  | min_sdk_version | min_app_version |
|---|---|---|
| 설정 주체 | 개발자가 `app.json`에 직접 | CLI가 pack 시 SDK 버전에서 도출 |
| 막는 것 | 구형 펌웨어에서 설치·업데이트 | 구형 폰 앱에서 플러그인 열기 |

- `min_app_version`은 빌드가 실행되는 가장 오래된 Even Realities App 버전이다.
- 새 앱에서만 구현된 bridge API가 SDK에 추가되면, 그 SDK 릴리스가 필요한 앱 버전을 함께 공개한다.
- `evenhub pack`이 그 값을 읽어 기록한다.

런타임 동작:

- 앱 버전이 floor 이상이면 정상으로 열린다.
- floor 미만이면 열 때 차단되고 앱 업데이트를 안내한다.
- 부분 실행도 SDK 호출도 없다.
- 안경에서 열어도 똑같이 막힌다. 안경에 폰에서 업데이트하라는 짧은 메시지가 뜬다.
- 검사는 로컬에서 열 때만 한다. 다운로드·업데이트 시에는 막지 않는다.

### 변경 이력 읽는 법

- Changelog는 릴리스를 기능별로 묶는다. 업그레이드 전에 읽는다.
- npm 패키지 README의 `Changelog` 섹션에도 원본 목록이 있다.

| 구분 | 의미 |
|---|---|
| Added | 새 메서드·이벤트·manifest 필드. 필요 없으면 무시 가능 |
| Changed | 기존 동작의 비파괴 변경. 주의사항 확인 |
| Deprecated | deprecation 기간 적용 |
| Removed | N+2 주기 끝에 제거된 메서드 (MAJOR에서만) |
| Fixed | 버그 수정. 일부는 의미를 미묘하게 바꾼다 |

- `edition` 변경은 명시적으로 공지한다.
- edition 변경은 플랫폼 계약 변경이다. manifest에 새 edition을 선언해야 그 아래에서 로드된다.

### 고정 vs 유동 버전

| 전략 | 용도 |
|---|---|
| 정확히 고정 (`"0.0.14"`) | 운영 앱. 재현 가능한 빌드. 명시적 업그레이드 |
| 틸드 (`"~0.0.14"`) | 내부 데모. 이후 0.0.x PATCH 자동 반영. 배포 앱에는 쓰지 않음 |
| `latest` 태그 | 탐색 작업만. 소스 관리되는 `package.json`에는 절대 쓰지 않음 |

- 명시적 업그레이드: `npm install @evenrealities/even_hub_sdk@latest`.

### Edition 변경

- `edition`은 앱이 대상으로 하는 플랫폼 계약이다. 현재 `"202601"`이다.
- edition 변경은 플랫폼 수준 breaking change다. bridge 프로토콜, 이벤트 이름, manifest 기본 형태가 바뀐다.
- 새 edition은 릴리스 노트와 마이그레이션 가이드로 공지한다.
- 기존 앱은 이전 edition으로 계속 동작한다.
- opt-in은 `app.json`에 `"edition": "<new>"`를 넣고 코드를 점검한다.
- 자동 마이그레이션은 없다. 앱별로 의도적으로 선택한다.
- edition 변경은 드물다. 몇 달이 아니라 몇 년 단위다.

### 마이그레이션 체크리스트

| # | 단계 | 내용 |
|---|---|---|
| 1 | 릴리스 노트 읽기 | 현재~목표 사이 모든 버전. Deprecated와 Removed에 주목 |
| 2 | 테스트 실행 | 시뮬레이터 Headless Testing |
| 3 | QR 사이드로드로 핵심 경로 테스트 | 실기기 Local Testing |
| 4 | 베타 빌드로 검증 | Beta Testing만 운영과 같은 동작. 릴리스 대상은 필수 |
| 5 | deprecated·removed API 검색 | 의존성 올리기 전에 마이그레이션 |
| 6 | 일정 확보 | MAJOR나 edition 변경은 스프린트 단위. 기능 작업과 묶지 않음 |

## 변경 이력 (Changelog)

출처: https://hub.evenrealities.com/docs/reference/changelog (Last updated: 2026-10-20)

- 한 기능은 여러 패키지에 걸쳐 나온다.
- 이 페이지는 릴리스를 기능 영역별로 묶는다.
- 날짜는 npm 게시일이다. 설치 가능해진 날이다.

### 현재 버전

| 패키지 | 버전 | 게시일 |
|---|---|---|
| SDK `@evenrealities/even_hub_sdk` | 0.0.16 | 2026-09-24 |
| CLI `@evenrealities/evenhub-cli` | 0.2.0 | 2026-10-20 |
| Simulator `@evenrealities/evenhub-simulator` | 0.9.5 | 2026-09-01 |

참고: SDK 0.0.15·0.0.16, 시뮬레이터 0.9.4·0.9.5의 세부 내용은 원문 영역별 표에 없다.

### 릴리스 맵

| 영역 | 최근 변경 | 패키지 |
|---|---|---|
| 터미널 개발 루프 | 2026-10 | CLI 0.2.0 |
| 컨텍스트 메뉴와 long press | 2026-08 | SDK 0.0.14, simulator 0.9.0-0.9.1, CLI 0.1.14 |
| 디스플레이와 이미지 | 2026-08 | SDK 0.0.12, 0.0.14, simulator 0.8.0, 0.9.0-0.9.3 |
| 폰·센서 접근 | 2026-08 | SDK 0.0.11, 0.0.14 |
| 버전 floor와 패키징 | 2026-08 | SDK 0.0.13, CLI 0.1.14 |
| 시뮬레이터 자동화 | 2026-04 | Simulator 0.7.0-0.7.3, CLI 0.1.12-0.1.13 |
| 이전 릴리스 | 2026-04 | SDK 0.0.1-0.0.10, CLI 0.1.5-0.1.11, simulator 0.1.0-0.6.2 |

### 터미널 개발 루프

- 앱 생성, 빌드 업로드, 테스터 초대, 베타 배포를 터미널에서 한다.
- 심사와 게시는 포털에 남는다.

| 패키지 | 버전 | 내용 | 게시일 |
|---|---|---|---|
| CLI | 0.2.0 | 새 명령 10개: create, upload, update, ls, promote, delist, testers, rm, download, logout. 모든 명령에 `--json`(stdout에 객체 하나). 실패 유형별 exit code. 이름·태그라인·설명·changelog·이메일·아이콘을 전송 전 로컬 검증. 중단된 업로드는 유효한 캐시 draft 재사용 | 2026-10-20 |

- `self-check`도 `--json`을 지원한다. 로그인 계정과 역할을 출력한다.

### 컨텍스트 메뉴와 long press

- 탭 후 길게 누르면 안경 OS가 띄우는 오버레이다.
- OS가 가져가지 않은 long press는 이벤트 쌍으로 앱에 온다.

| 패키지 | 버전 | 내용 | 게시일 |
|---|---|---|---|
| Simulator | 0.9.1 | automation API에 long_press, long_press_release 추가. CI에서 제스처와 메뉴 스크립트 가능 | 2026-08-21 |
| SDK | 0.0.14 | createStartUpPageContainer·rebuildPageContainer에 menuObject 추가. 액션 항목 최대 10개. menuItemClickEvent를 onEvenHubEvent로 전달. 항목 수·ID 고유성·UTF-8 이름 길이 SDK 검증. list·text·system 이벤트에서 LONG_PRESS_EVENT (9), LONG_PRESS_RELEASE_EVENT (10) 파싱 | 2026-08-20 |
| Simulator | 0.9.0 | 메뉴 그리기·탐색. 창에서 제스처 시뮬레이션(누르고 있는 컨트롤, 단축키). automation API에 context_menu 액션 | 2026-08-20 |
| CLI | 0.1.14 | pack 시 Even App 2.2.9 floor 기록 | 2026-08-20 |

- Even App 2.2.9가 필요하다.
- 구형 앱에서는 메뉴 항목이 조용히 안 나타난다.
- 그래서 CLI가 floor를 기록하고 열 때 차단한다.

### 디스플레이와 이미지

| 패키지 | 버전 | 내용 | 게시일 |
|---|---|---|---|
| Simulator | 0.9.3 | 인코딩 이미지 그레이스케일 변환을 안경과 일치. 크기가 다를 때 cover 리사이즈·중앙 크롭 일치 | 2026-08-22 |
| Simulator | 0.9.2 | 인코딩 이미지 외에 SDK raw Gray8, packed Gray4 데이터 수용 | 2026-08-22 |
| SDK | 0.0.14 | 텍스트 컨테이너와 textContainerUpgrade에 textColor(밝기 5단계, 0~4). updateImageRawData가 이미지 경로를 100ms 유지하고 보류 호출을 다음 호출에 flush | 2026-08-20 |
| Simulator | 0.9.0 | textColor 5단계 렌더링 | 2026-08-20 |
| SDK | 0.0.12 | list·text·image 컨테이너에 zOrderIndex. 큰 값이 앞. 페이지 단위 전부 또는 전무, 값 고유. updateImageRawData payload를 전송 중 LZ4 압축(코드 변경 없음) | 2026-07-10 |
| Simulator | 0.8.0 | zOrderIndex로 그리기 순서 정렬(SDK와 같은 규칙). 디코딩 이미지 픽셀 크기 상한 | 2026-07-08 |

시뮬레이터가 대신 확인해 주지 않는 것:

- LZ4를 풀지 않는다. 압축 전송 경로는 실기기에서 검증한다.
- 밝기 단계가 안경과 광도 일치하지 않는다. 위계 확인용이다. 가독성은 실기기에서 확정한다.

### 폰·센서 접근

| 패키지 | 버전 | 내용 | 게시일 |
|---|---|---|---|
| SDK | 0.0.14 | AudioEvent에 direction, speakerRole 추가. direction은 PCM 프레임의 원본 방향 태그. speakerRole은 AudioSpeakerRole(self, other, unknown) | 2026-08-20 |
| SDK | 0.0.11 | 1회·연속 위치. 폰 앨범 이미지 선택(단일). 폰 카메라 촬영. 마이크 소스 선택(안경/폰) | 2026-06-22 |

- `speakerRole`은 앱 측 알고리즘 결과다. 펌웨어 수준 신원 보장이 없다.
- 폰 마이크와 구형 호스트 앱은 `direction: null`, `speakerRole: unknown`으로 대체된다.
- `0.0.14` 이전 코드는 그대로 동작한다.

### 버전 floor와 패키징

| 패키지 | 버전 | 내용 | 게시일 |
|---|---|---|---|
| CLI | 0.1.14 | pack 시 min_app_version 도출·기록. `--sdk-ver`, `--enforce-manual-version` 추가. evenhub·eh 셸 자동완성. pack 실패 시 실패 exit status | 2026-08-20 |
| SDK | 0.0.13 | npm 메타데이터에 floor를 minAppVersion으로 처음 게시 - 2.2.6 | 2026-07-31 |

- SDK `0.0.12` 이하는 `minAppVersion` 필드가 없다.
- npm 버전은 불변이라 소급 기록할 수 없다.
- CLI는 내장 맵으로 대체하고 info 줄을 출력한다.

### 시뮬레이터 자동화

- HTTP 제어면이 생겼다. CI와 에이전트 기반 테스트가 가능해졌다.

| 패키지 | 버전 | 내용 | 게시일 |
|---|---|---|---|
| CLI | 0.1.13 | 터미널 QR 출력 시 TERM / COLORTERM 감지 | 2026-04-20 |
| Simulator | 0.7.3 | 데스크톱별 네이티브 webview 캡처로 빈 `/api/screenshot/webview` 수정. 리스트 항목 63바이트·20개 상한 | 2026-04-20 |
| CLI | 0.1.12 | 터미널 QR은 qrcode-terminal, 외부 QR은 qr-image. login 명령 수정 | 2026-04-16 |
| Simulator | 0.7.2 | 이모지 렌더링 범위 확대. bounce·spring 애니메이션 안정화 | 2026-04-15 |
| Simulator | 0.7.1 | 펌웨어 일치 수정: 전체 화면 넘는 스크롤바 제거, 단일 컨테이너 너비·높이 상한, 텍스트 컨테이너 999바이트 상한 | 2026-04-09 |
| Simulator | 0.7.0 | `--automation-port <PORT>`로 HTTP 서버 시작(스크린샷, 콘솔 로그, 안경 입력). 기본 border_color 0(안 보임). 미지원 글리프 처리를 펌웨어와 일치 | npm 미게시 |

- `0.7.0`은 노트만 있고 npm 릴리스가 없다.
- automation API가 든 첫 설치 가능 빌드는 `0.7.1`(2026-04-09)이다.

### 이전 릴리스

- 대상: SDK `0.0.1`-`0.0.10`, CLI `0.1.5`-`0.1.11`, Simulator `0.1.0`-`0.6.2`.
- 원문은 upstream 패키지 항목을 내용 그대로 옮겼다고 한다.
- 노트 없이 나온 버전: SDK `0.0.2`-`0.0.7`, simulator `0.1.1`, `0.1.2`, `0.4.0`, `0.6.0`.
- 노트는 있으나 npm 미게시: simulator `0.2.0`, `0.2.2`, `0.5.1`.
- "Not on npm" 표시 행은 설치할 수 없었다.
- 주의: 수집한 페이지 텍스트에서 이 세 표의 행 내용이 비어 있었다. 버전별 세부 내용은 원문 페이지나 npm README에서 확인해야 한다.
