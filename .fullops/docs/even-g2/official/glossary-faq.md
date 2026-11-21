---
title: "Even G2 공식 문서 요약: 용어집 · FAQ"
status: draft
updated: 2026-11-21
owner: dev
summary: 공식 용어집과 FAQ 요약
---

# Even G2 공식 문서 요약: 용어집 · FAQ
출처: 공식 문서 (2026-11-21 읽음)

## 용어집 (Glossary)

출처: [reference/glossary](https://hub.evenrealities.com/docs/reference/glossary) (Last updated: 2026-10-09)

### Hardware

| 용어 | 정의 |
|---|---|
| Even G2 | 스마트 안경. 576×288 monochrome green micro-LED 디스플레이 2개, temple touchpad, 4-mic array, Bluetooth 5.2. 문서에서는 풀네임을 쓴다. 코드/UI에서는 "G2"도 허용 |
| Even R1 | 선택 입력 링. G2 temple과 같은 제스처(tap, double-tap, swipe up/down, long press). temple 이벤트와 함께 ring input 이벤트로 전달 |
| Temple touchpad | 안경 다리의 터치면. `CLICK_EVENT`, `DOUBLE_CLICK_EVENT`, `SCROLL_TOP_EVENT`, `SCROLL_BOTTOM_EVENT`, `LONG_PRESS_EVENT` / `LONG_PRESS_RELEASE_EVENT` (SDK 0.0.14+) 발생 |
| Long press | G2 temple 또는 R1의 지속 누름. OS가 메뉴용으로 가져가지 않을 때 `LONG_PRESS_EVENT` → `LONG_PRESS_RELEASE_EVENT`로 도착 (SDK 0.0.14+, Even App 2.2.9+) |
| Tap then long press | contextual menu를 여는 동작. 메뉴를 뜻할 땐 이 표현을 풀어 쓴다. "tap and hold", "press and hold"는 쓰지 않는다. "long press"는 SDK 이벤트 쌍에만 쓴다 |
| Charging case | G2 보관·충전. 상태등: 준비 시 white, 삽입 시 잠깐 orange. shipping mode 지시등 역할 |
| Shipping mode | 운송 중 배터리 소모를 막는 저전력 상태. 전원 연결된 케이스에 양쪽 다리를 넣어 불이 켜지면 해제 |

### Software platform

| 용어 | 정의 |
|---|---|
| Even Hub | Even Realities 폰 앱 안의 플러그인 플랫폼. 서드파티 앱을 WebView에 띄우고 안경과 연결 |
| Even Hub SDK | npm `@evenrealities/even_hub_sdk`. WebView에서 안경과 통신하는 typed 메서드 + 이벤트 모델 |
| Even Realities App | Flutter 폰 앱. 플러그인 WebView를 띄우고 SDK 호출을 Bluetooth로 안경에 중계 |
| Developer portal | hub.evenrealities.com. 가입, `.ehpk` 업로드, 테스터 목록 관리, 리뷰 제출 |
| Developer Mode | Scan QR, Private/Beta 설치 화면이 보이는 앱 상태. 토글 없음. `hub.evenrealities.com/login` 로그인 → 앱 재시작 → Even Hub 탭 우상단 |
| Bridge | SDK가 WebView에 주입하는 `EvenAppBridge`. 메서드 호출을 폰 앱으로, 이벤트를 앱으로 전달 |

### Package format

| 용어 | 정의 |
|---|---|
| `.ehpk` | Even Hub 패키지. 빌드된 웹 자산 + manifest의 zip. `evenhub pack`이 생성. `.ehp`, `.evenpkg`는 deprecated |
| `app.json` | 모든 프로젝트 루트의 manifest. `package_id`, `version`, `permissions`, network whitelist, `supported_languages` 등 선언 |
| `edition` | 대상 플랫폼 계약 버전. 현재 `"202601"`. bridge나 manifest 스키마의 breaking change 시 올라간다 |
| `package_id` | 전역 고유 reverse-DNS ID (예: `com.exampleco.exampleapp`). 소문자와 숫자만. 하이픈·밑줄·대문자 금지. 배포 후 변경 불가 |
| `min_sdk_version` | 앱이 지원하는 최소 SDK 버전. 필수 필드 |
| `min_app_version` | 빌드가 도는 최소 Even Realities App 버전. 선택 필드. CLI가 pack 시 SDK 버전에서 도출해 `.ehpk`에 기록. 사용자 앱 버전보다 높으면 열 때 업데이트 안내로 차단 |

### Runtime concepts

| 용어 | 정의 |
|---|---|
| Page container | 텍스트·리스트·이미지를 보여 주는 사각 영역. 생성·갱신·파괴로 화면을 그린다 |
| `createStartUpPageContainer` | 첫 화면을 만드는 호출. 부팅 시 정확히 한 번 |
| `textContainerUpgrade` | 기존 컨테이너의 깜빡임 없는 텍스트 갱신 |
| `rebuildPageContainer` | 전체 화면 재그리기. 하드웨어에서 깜빡인다. 레이아웃 변경에만 |
| `shutDownPageContainer(mode)` | 앱 종료. Mode 0 = 즉시, mode 1 = 시스템 종료 확인 대화상자 (리뷰 필수) |
| `zOrderIndex` | list/text/image 컨테이너의 선택적 쌓임 순서 (SDK 0.0.12+). 클수록 앞. 페이지 단위 all-or-nothing, 값 중복 불가 |
| `textColor` | 텍스트 컨테이너 밝기 0-4 (SDK 0.0.14+). 색이 아니다. create/rebuild에서 생략 시 기본 4. `textContainerUpgrade`에서 생략 시 변경 없음. `borderColor`는 여전히 0-15 |
| Contextual menu | tap then long press로 OS가 띄우는 오버레이. 고정 시스템 슬롯(Display off, Brightness, Close) + 앱 항목 최대 10개 (SDK 0.0.14+, Even App 2.2.9+) |
| `menuObject` | `createStartUpPageContainer` / `rebuildPageContainer`에 붙이는 메뉴 선언. 병합 없이 통째로 교체. rebuild에서 생략하면 메뉴가 지워진다 |
| `menuItemClickEvent` | 메뉴 항목 선택 이벤트. 지정한 `itemID`만 담는다. `isEventCapture: 1` 컨테이너와 무관하게 `onEvenHubEvent`로 도착 |

### Testing & shipping

| 용어 | 정의 |
|---|---|
| Simulator | 하드웨어 없이 안경 캔버스를 그리는 데스크톱 창 |
| QR sideload | dev 서버 → CLI로 QR 생성 → 폰 앱으로 스캔. hot reload 지원. WebView가 백그라운드로 가면 끊긴다 |
| Private build | 제출 전 smoke 테스트용으로 내 안경에 설치하는 `.ehpk`. 폰 앱에서 실행 |
| Beta build | 앱의 유일한 beta 슬롯에 promote된 private build. Active 테스터 모두 설치 가능. 안경 메뉴에 표시. 운영 lifecycle과 동일. 리뷰 통과에 필수 |
| Testing group | 앱 하나의 테스터 목록이 있는 portal 탭. 앱당 단일 평면 목록. 그룹 분할 불가. 이메일 초대 후 수락하면 Active |
| Promote | Builds 탭에서 태그 변경. Private → Beta = 테스터 배포. Beta → Public = 리뷰 제출 |
| Build tag | Private, Beta, Public. Builds 탭에서의 위치이자 이동 컨트롤 |
| Review status | 제출 후 태그 상태: In Review → Approved, Rejected, Published. 리뷰 중엔 태그가 잠긴다 |
| Fix-forward | 배포된 버전은 수정·롤백 불가. 더 높은 버전으로만 대체 |

### Networking

| 용어 | 정의 |
|---|---|
| Network whitelist | `app.json`의 `network` 배열. 목록 도메인으로 `fetch()`를 허용하는 Even 쪽 검사. CORS 우회 아님 |
| CORS | 브라우저가 강제한다. 원격 API의 `Access-Control-Allow-Origin` 헤더가 필요하다. whitelist는 필요조건일 뿐이다 |
| AP isolation | 같은 SSID 기기 간 통신을 막는 공유기 기능. 회사/게스트 망에 흔하다. QR sideload를 조용히 깨뜨린다 |

### Tooling

| 용어 | 정의 |
|---|---|
| `evenhub` (CLI) | npm `@evenrealities/evenhub-cli`, 별칭 `eh`. 명령: `login`, `logout`, `self-check`, `init`, `pack`, `qr`, `create`, `upload`, `update`, `ls`, `promote`, `delist`, `testers`, `rm`, `download`. 리뷰와 게시는 portal에서 |
| `evenhub-simulator` | npm `@evenrealities/evenhub-simulator`. 독립 데스크톱 시뮬레이터 |
| Template | `evenhub-templates`의 starter: `minimal`, `text-heavy`, `asr`, `image` |

## FAQ: 디스플레이·렌더링

출처: [reference/faq](https://hub.evenrealities.com/docs/reference/faq) (Last updated: 2026-10-09)

| 질문 | 답 |
|---|---|
| 임의 픽셀을 그릴 수 있나? | 아니요. 컨테이너 모델(text, image, list)만 있다 |
| 풀컬러 가능? | 아니요. monochrome green, 4-bit (16 shades). 소스는 greyscale. 하드웨어가 색을 입힌다 |
| 비디오 / 애니메이션 GIF? | 네이티브 지원 없음. `textContainerUpgrade`나 `updateImageRawData`를 연속 호출해 흉내 낸다. 전체 화면 이미지 갱신은 약 800 ms |
| 컨테이너 겹치기(z-order)? | 예. SDK 0.0.12+ `zOrderIndex`. 클수록 앞. 페이지 단위 all-or-nothing, 값 중복 불가. 전부 생략하면 선언 순서(나중 것이 위) |
| 이미지 압축을 켜야 하나? | 아니요. SDK 0.0.12+가 `updateImageRawData` payload를 자동 LZ4 압축한다 |
| 이미지 갱신 속도? | 전체 화면 약 800 ms. `updateImageRawData` 최소 간격 100ms는 그보다 훨씬 짧다 |
| 왜 LZ4인가? | 압축 해제 메모리가 가장 작고 인코딩/디코딩이 거의 즉시다. 안경 RTOS 메모리 예산에 맞춘 선택이다 |
| 텍스트 밝기 변경? | 예. SDK 0.0.14+ `textColor`, 0-4 다섯 단계. 색이 아니라 밝기. 생략 시 기본 4 |
| 커스텀 폰트? | 아니요. 고정 시스템 폰트 |
| 캔버스 크기? | 576×288 monochrome green 픽셀 |
| 이모지? | 아니요. Unicode 기하 도형 / box-drawing 문자를 쓴다 |

## FAQ: 입력·센서

출처: [reference/faq](https://hub.evenrealities.com/docs/reference/faq)

| 질문 | 답 |
|---|---|
| long press 감지? | 예. SDK 0.0.14+ (Even App 2.2.9+). 시작 시 `LONG_PRESS_EVENT`, 뗄 때 `LONG_PRESS_RELEASE_EVENT`. 일반 list/text/sys 라우팅. tap then long press는 OS 메뉴가 가져간다. 내 레이어가 소유할 때만 도착 |
| 안경 메뉴에 항목 추가? | 예. SDK 0.0.14+ (Even App 2.2.9+). create/rebuild의 `menuObject`로 최대 10개. 선택은 `menuItemClickEvent`로 도착 |
| 메뉴 항목에 상태(토글) 표시? | 아니요. fire-and-forget이다. 이벤트 1회 후 메뉴가 닫히고 라벨은 다시 그려지지 않는다. 바꾸려면 메뉴를 재선언한다 |
| raw IMU 데이터? | 예. `IMU_DATA_REPORT` 이벤트가 설정 가능한 rate로 온다. 단위 표는 아직 TBD |
| 마이크 선택? | 예. `audioControl(true, ...)`에 `AudioInputSource.Glasses` 또는 `AudioInputSource.Phone`. 기본은 glasses. 각 소스는 mono. 4-mic 개별 캡처와 DOA 각도는 로드맵 |
| 햅틱? | 아니요. 햅틱 액추에이터가 없다 |
| 착용 감지? | 예. 착용/탈착 이벤트가 있다 |
| 배터리 잔량? | 예. Device info API가 배터리 퍼센트를 준다 |

## FAQ: 네트워킹

출처: [reference/faq](https://hub.evenrealities.com/docs/reference/faq)

| 질문 | 답 |
|---|---|
| 임의 URL `fetch()`? | 아니요. 도메인이 `app.json` `network` whitelist에 있어야 한다 |
| whitelist가 CORS를 우회? | 아니요. 원격 API의 `Access-Control-Allow-Origin`도 필요하다 |
| WebSocket? | 예. 같은 whitelist 규칙. WebView가 백그라운드로 가면 끊길 수 있다 |
| 시스템 브라우저로 딥링크? | TBD. 현재 `window.open(url, '_system')` 대응 기능 없음 |
| 푸시 알림? | 아니요. 플러그인은 foreground 전용이다. 알림은 폰 앱이 받아 자체 UI에 띄울 수 있다 |
| 백그라운드 네트워크 호출? | 아니요. WebView가 중단되고 진행 중 요청이 멈춘다. resume에 대비한다 |

## FAQ: 저장소·상태

출처: [reference/faq](https://hub.evenrealities.com/docs/reference/faq)

| 질문 | 답 |
|---|---|
| `localStorage`? | 예. suspension, kill, update 후에도 남는다. 삭제(uninstall) 시 지워진다 |
| IndexedDB / OPFS? | 예. 단, quota는 문서화 전이다. "best-effort, persistent"로 취급한다 |
| 폰-안경 상태 동기화? | 아니요. 상태는 폰 WebView에 있다. 안경은 렌더 대상일 뿐이다 |
| 내 앱 두 개 간 상태 공유? | 아니요. 저장소는 `package_id`별 sandbox다 |
| 미디어 라이브러리/파일 접근? | 읽기 제한적. `pickImageFromAlbum()`(album 권한)으로 사용자가 고른 1장만 `AppImageAsset`으로 받는다. 대량 읽기, 쓰기, 파일 시스템, 클립보드 없음 |

## FAQ: 패키징·제출

출처: [reference/faq](https://hub.evenrealities.com/docs/reference/faq)

| 질문 | 답 |
|---|---|
| 개발자 계정 없이 배포? | 아니요. hub.evenrealities.com 계정이 필요하다 |
| 배포 버전 롤백? | 아니요. fix-forward만 가능 |
| `min_app_version`을 직접 정하나? | 아니요. CLI가 pack 시 SDK 버전에서 도출해 `.ehpk`에 기록한다. 더 엄격한 floor만 `app.json`에 선언한다. 로컬 테스트용 override는 `--enforce-manual-version` |
| 구버전 앱에서 안 열리는 이유? | `min_app_version`이 사용자 앱 버전보다 높아서다. 열 때 업데이트 안내로 막는다(안경에서 실행하면 안경에 표시). 앱을 업데이트하면 열린다 |
| API key를 `.ehpk`에 넣어도 되나? | 아니요. 배포된 `.ehpk`에서 누구나 추출할 수 있다. 서버 측 proxy 뒤로 옮긴다 |
| 제출 후 `app.json` 수정? | Submitted 상태 이후 불가. 메타데이터는 Draft / Test에서만 수정 |
| 리뷰 없이 hotfix? | 아니요. 모든 버전이 같은 리뷰를 거친다. hotfix는 보통 더 빨리 승인된다 |
| 국가/지역 지정 배포? | 현재 불가. 모든 배포 버전이 전 세계에 보인다 |
| 유료 앱? | TBD. 유료 배포는 아직 없다 |
| 최대 `.ehpk` 크기? | 실질 상한 약 ~10 MB. 더 커도 업로드는 되나 BLE 설치 UX가 나빠진다 |

## FAQ: 테스트

출처: [reference/faq](https://hub.evenrealities.com/docs/reference/faq)

| 질문 | 답 |
|---|---|
| 시뮬레이터만으로 테스트? | UI/로직은 가능. 백그라운드, 실제 권한, BLE 타이밍은 하드웨어가 필요하다 |
| 팀원과 빌드 공유? | 예. portal Testing group 탭에 추가하거나 `evenhub testers add them@example.com`. 상태가 Active가 되면 폰 앱 Beta tester 섹션에서 설치 |
| 테스터 집단별로 다른 beta 빌드? | 아니요. 앱당 beta 슬롯 1개, 평면 테스터 목록 1개. 새 버전 promote 시 슬롯의 빌드가 교체된다 |
| 폰 없이 안경 메뉴에서 미출시 앱 실행? | 예, beta build이면 가능. 안경 메뉴는 Beta와 published 앱을 보여 준다. Private 태그 클릭 → Beta → Promote to Beta, 또는 `evenhub promote <version> --to beta`. 테스터 상태가 Active여야 한다 |
| 업로드했는데 Private 빌드만 보이고 배포 방법이 없음 | 빌드 행의 Private 태그가 전환 스위치다. 클릭 → Beta → Promote to Beta. Beta build 섹션은 첫 promote 후에 나타난다 |
| 폰에 "test version expired" | beta 조건 두 개 중 하나가 빠졌다. Builds 탭에서 Beta 태그, Testing group 탭에서 Status Active. Invited 상태나 미promote 빌드는 이 메시지를 낸다 |
| CI에서 시뮬레이터 자동화? | 예. 시뮬레이터에 HTTP API가 있다 (Headless Testing) |
| 내 앱 두 개 동시 설치? | 예. 각자 `package_id`, 컨테이너, 상태를 가진다 |
| 실기기 로그? | Developer Mode에서 폰 앱 dev console에 콘솔 출력이 나온다 |

## FAQ: 언어·로케일

출처: [reference/faq](https://hub.evenrealities.com/docs/reference/faq)

| 질문 | 답 |
|---|---|
| `supported_languages` 지원 값? | 현재 `en`, `de`, `fr`, `es`, `it`, `zh`, `ja`, `ko` |
| 런타임 번역 선택? | 기기 locale → `supported_languages`의 첫 일치 → 없으면 첫 항목 |
| UI 문자열 현지화? | TBD. 당분간 `bridge.getDeviceInfo().locale`로 분기한다 |
| 목록에 없는 locale 추가? | 아니요. 제출 검증이 거절한다 |

## FAQ: 개인정보·권한

출처: [reference/faq](https://hub.evenrealities.com/docs/reference/faq)

| 질문 | 답 |
|---|---|
| 사용자 이름/이메일 접근? | user-info 권한이 있고 사용자가 동의한 범위만 |
| 다른 앱 데이터 접근? | 아니요. `package_id`별 엄격한 sandbox |
| 캡처 중이 아닐 때 주변 소리? | 아니요. `audioControl(true)` 유지 중이고 마이크 권한이 있을 때만 캡처된다 |
| 카메라? | 안경엔 카메라가 없다. camera 권한으로 `captureImageFromCamera()`를 써서 폰 카메라는 쓸 수 있다 |

## FAQ: 기타

출처: [reference/faq](https://hub.evenrealities.com/docs/reference/faq)

| 질문 | 답 |
|---|---|
| React / Vue / Svelte? | 예. SDK는 프레임워크 무관. boilerplate는 크기 때문에 vanilla TS를 쓴다 |
| TypeScript? | 예. 권장 경로. SDK가 전체 타입 정의를 제공한다 |
| ESM import? | 예. SDK는 ESM-first. Vite가 번들링한다 |
| Claude Code 같은 AI 도구? | 예. Learn → Claude Code 플러그인 참고 |

## 원문 불명확·불일치 메모

출처: [reference/glossary](https://hub.evenrealities.com/docs/reference/glossary), [reference/faq](https://hub.evenrealities.com/docs/reference/faq)

- FAQ는 이모지 대안으로 "See Glossary"라고 한다. 하지만 Glossary에 해당 항목이 없다.
- Glossary는 Developer portal을 "where you sign up"이라 한다. Sign in 페이지는 웹 hub에 가입 절차가 없다고 한다.
- FAQ의 "Submitted", "Draft / Test" 상태는 Glossary의 Build tag(Private/Beta/Public), Review status(In Review/Approved/Rejected/Published)와 이름이 다르다. 관계는 원문에서 불명확하다.
- IMU 단위 표, IndexedDB/OPFS quota, 딥링크, 유료 배포, 현지화 페이지는 원문에서 TBD다.
