---
title: "Even G2 공식 문서 요약: 시험과 출시"
status: draft
updated: 2026-11-21
owner: dev
summary: "공식 Test·Ship 문서 요약: 시험 모드, 패키징, 제출과 심사 기준"
---

# Even G2 공식 문서 요약: 시험과 출시

출처: 공식 문서 (2026-11-21 읽음)

## 시험 모드 비교

원문: <https://hub.evenrealities.com/docs/test/index> (2026-10-09 갱신)

앱을 돌리는 방법은 네 가지다. 심사 관문은 Beta Testing을 요구한다. 매일 반복은 앞의 두 방법으로 한다.

| 모드 | 하드웨어 | 반복 속도 | Hot reload | 잠금 후 생존 | 안경 메뉴 | 실제 .ehpk | 심사 환경과 같음 |
|---|---|---|---|---|---|---|---|
| Simulator | No | Instant | n/a | n/a | n/a | No | No |
| Local Testing | Yes | < 1 s | Yes | No | No | No | No |
| Private Testing | Yes | ~10 s | No | Partial | No | Yes | Closer |
| Beta Testing | Yes | ~30 s | No | Yes | Yes | Yes | Yes |

- Simulator: 데스크톱에서 안경 화면을 그린다. 스크립트 시험용 HTTP 자동화 API가 있다.
- Local Testing: dev server와 QR로 올린다. BLE로 HMR이 된다. 일상 개발용이다.
- Private Testing: 실제 `.ehpk` 패키징 경로가 처음 돈다. 실행은 늘 휴대폰을 거친다. 아직 headless가 안 된다.
- Beta Testing: 나를 beta tester로 등록해 배포한다. 안경 메뉴에 앱이 뜨는 유일한 모드다. 심사자가 보는 환경과 같은 유일한 모드다.

## 시뮬레이터

원문: <https://hub.evenrealities.com/docs/test/simulator> (2026-08-29 갱신)

현재 버전은 `v0.9.3`이다. SDK 0.0.14를 따른다. `textColor` 밝기 다섯 단계, `zOrderIndex` 쌓기, long press, 펌웨어 방식의 contextual menu를 그린다.

- 설치: `npm install -g @evenrealities/evenhub-simulator` (macOS, Linux, Windows). 업그레이드는 `@latest`를 붙인다.
- 버전 확인: `evenhub-simulator --version`. 사용법: `evenhub-simulator [OPTIONS] [targetUrl]`

에뮬레이터가 아니다. Node와 LVGL 창으로 모양만 흉내 낸다. 성능, 프레임 간격, BLE 타이밍, 실기기 특이점은 재현하지 않는다. 배치, 문구, 이벤트 로직에 쓴다. 타이밍과 성능은 실기기에서 확인한다.

### 옵션

| 옵션 | 설명 |
|---|---|
| `-c, --config <path>` | 설정 파일 경로. 기본값은 `--print-config-path`로 본다 |
| `-g, --glow` | 안경 화면 glow 효과 켜기 |
| `--no-glow` | glow 끄기. 설정보다 우선한다 |
| `-b, --bounce <type>` | bounce 애니메이션: `default` 또는 `spring` |
| `--automation-port <port>` | headless 제어 평면을 이 포트에 연다 |
| `--list-audio-input-devices` | 오디오 입력 장치 목록 |
| `--aid <device>` | 오디오 입력 장치 선택 |
| `--no-aid` | 기본 오디오 장치 사용. 설정보다 우선한다 |
| `--print-config-path` | 기본 설정 파일 경로를 출력하고 끝낸다 |
| `--completions <shell>` | 셸 자동완성 생성: bash, elvish, fish, powershell, zsh |
| `-V, --version` | 버전 출력 |
| `-h, --help` | 도움말 출력 |

기본 설정 파일 위치: Linux `$XDG_CONFIG_HOME` 또는 `$HOME/.config`, macOS `$HOME/Library/Application Support`, Windows `{FOLDERID_RoamingAppData}` (예: `C:\Users\<user>\AppData\Roaming`).

### 오디오, 스크린샷, 디버깅

- `audioEvent`는 기기와 같은 형식이다. 16,000 Hz, signed 16-bit little-endian PCM, 이벤트당 100 ms(3,200 bytes / 1,600 samples).
- 스크린샷(v0.5.0+): 버튼을 누르면 RGBA PNG를 현재 작업 폴더에 저장한다. 파일 이름에 시각이 붙는다.
- 전체 경로는 stdout과 안경 web inspector 콘솔에 찍힌다. 스크린샷은 glow 없는 원본 framebuffer에서 뜬다.
- `RUST_LOG=debug evenhub-simulator http://localhost:5173`로 앱이 보낸 호출을 stdout에서 본다. `RUST_LOG=trace`, 모듈별 필터(`env_logger` 문법)도 된다.
- 앱 webview 창을 우클릭하고 Inspect Element를 고르면 web inspector가 열린다.
- debug 로그에 없는 호출은 브리지를 건너지 못한 것이다.

### 한계

- 화면은 하드웨어와 픽셀 단위로 같지 않다. 글꼴과 회색조가 다르다. 시각 QA용이 아니다.
- 리스트 스크롤의 포커스 위치가 실기기와 다를 수 있다.
- 이미지 처리가 하드웨어보다 빠르다. 기기의 크기 제한을 강제하지 않는다.
- `updateImageRawData`의 LZ4 압축(SDK `0.0.12+`)을 풀지 않는다. 바이트를 일반 이미지 파일로 해석한다.
- status 이벤트를 내지 않는다. 사용자와 기기 프로필은 고정값이다.
- 창 입력: Up, Down, Click, Double Click, long press. HTTP API는 더 좁은 범위를 다룬다.
- `textColor` 0-4는 다섯 단계로 보이지만 광도가 안경과 맞지 않는다. 위계 확인용이다.
- contextual menu: `menuObject`를 그리고 `menuItemClickEvent`를 `itemID`와 함께 돌려준다.
- rebuild에 `menuObject`가 있으면 메뉴를 다시 만든다. 없으면 내 항목을 지우고 시스템 항목만 남긴다.
- 펌웨어별 시스템 슬롯 표시는 확인할 수 없다. 하드웨어에서 본다.
- 비정상 상황의 오류 처리가 다를 수 있다. 배포 전에는 늘 실기기로 확인한다.

### Headless 자동화 (v0.7.0+)

`evenhub-simulator http://localhost:5173 --automation-port 9898`로 `http://127.0.0.1:9898`에 HTTP 제어 평면을 연다. `curl http://127.0.0.1:9898/api/ping`은 `pong`을 돌려준다.

하드웨어, 권한, 백그라운드 수명주기가 없다. 제출 전 Beta Testing을 대신하지 못한다.

쓰임새: 제출 전 점검, Genesis Day 심사 자동화, 내부 QA 회귀 시험, PR마다 CI smoke test.

| Endpoint | 용도 |
|---|---|
| `GET /api/ping` | 상태 확인. `pong`을 돌려준다 |
| `GET /api/screenshot/glasses` | LVGL framebuffer의 576×288 RGBA PNG. RGBA를 유지한다. 켜진 픽셀은 alpha > 0으로 판정한다 |
| `GET /api/screenshot/webview` | html2canvas로 뜬 webview PNG. 10 s timeout |
| `GET /api/console[?since_id=N]` | `{ entries, total }`. console.*, uncaught exception, unhandled rejection, 실패한 fetch를 담는다 |
| `DELETE /api/console` | 버퍼 비우기. 시작 로그를 먼저 읽는다 |
| `POST /api/input` | 터치패드 입력. body `{ "action": "..." }`. 이벤트 캡처 컨테이너가 없으면 조용히 무시한다 |

`POST /api/input`은 정확히 일곱 동작만 받는다. 그 밖의 값은 `400`과 허용 목록을 돌려준다.

| action | 효과 |
|---|---|
| `up` / `down` | 리스트 포커스 이동 또는 텍스트 스크롤 |
| `click` | 포커스 항목 선택 |
| `double_click` | 시스템 더블탭. 보통 뒤로, 닫기, 루트에서는 종료 창 |
| `context_menu` | contextual menu 열기 (v0.9.0+) |
| `long_press` | long press 시작. `LONG_PRESS_EVENT` 전달 (v0.9.1+) |
| `long_press_release` | long press 끝. `LONG_PRESS_RELEASE_EVENT` 전달 (v0.9.1+) |

- `context_menu`는 토글이다. 두 번 보내면 메뉴가 닫힌다. 상태를 추적하거나 framebuffer로 확인한다.
- 메뉴 안에서 `up`/`down`으로 이동하고 `click`으로 고른다. 앱은 `menuItemClickEvent`를 받고 메뉴는 닫힌다.
- 메뉴 열기는 켜진 픽셀이 크게 는다. 메뉴 안 이동은 작게 변한다.
- 열린 메뉴 아래의 `rebuildPageContainer`는 메뉴를 닫지 않는다. 스크린샷에 옛 메뉴가 남을 수 있다.
- `long_press`와 `long_press_release`는 짝으로 보낸다. release가 없으면 press가 열린 채 남는다.
- `context_menu`는 메뉴로 가는 지름길이다. 원시 press를 처리하는 앱은 `long_press`로 시험한다.

시험 흐름:

1. dev server나 `.ehpk` URL로 시뮬레이터를 띄운다.
2. 준비를 기다린다. 첫 이벤트 캡처 컨테이너 전 입력은 버려진다. 최소 ~4 s를 두고 `GET /api/console`에서 "app ready" 로그를 폴링한다.
3. `GET /api/screenshot/glasses`와 `GET /api/console`로 상태를 찍는다.
4. `POST /api/input`을 보내고, 다시 찍어 단언한다.

공식 Python, Node 예제는 그대로 실행해 보지 않았다고 문서가 밝힌다. 템플릿으로만 쓴다.

주의점:

- 시작 로그는 한 번만 나온다. 준비 표시를 먼저 읽고 버퍼를 비운다.
- 마지막으로 본 `id`를 `?since_id=N`으로 넘겨 증분 폴링한다.
- 배경과 글자가 모두 순수 초록이다. RGB로 바꾸면 둘이 합쳐진다. `pixel.alpha > 0`으로 판정한다.
- 켜진 픽셀의 RGB는 늘 `0,255,0`이다. 다섯 `textColor` 단계는 alpha 값으로 구분된다.
- 제어 평면에 `shutdown` endpoint가 없다. 프로세스를 죽인다. CI에서는 `afterAll`에서 `SIGTERM`을 보낸다.

## 로컬 시험 (QR)

원문: <https://hub.evenrealities.com/docs/test/local-testing> (2026-06-04 갱신)

노트북의 Vite dev server를 휴대폰이 QR로 연다. 1초 안에 실제 G2에 그려진다. HMR이 된다. 가장 빠르지만 네트워크에 가장 취약하다.

터미널 1에서 `npm run dev`, 터미널 2에서 `evenhub qr --url "http://<your-lan-ip>:5173"`을 실행한다.

- 휴대폰 Even Realities 앱의 Even Hub 탭에서 Scan QR을 누른다. Developer Mode가 켜져 있어야 한다.
- `src/main.ts`를 저장하면 다시 스캔하지 않아도 안경이 다시 그린다.
- 되는 것: HMR, 실제 BLE 지연, temple 터치와 R1 ring 입력, 마이크·IMU·배터리 같은 실제 기기 API.
- 안 되는 것: 백그라운드. 잠금, 앱 전환, iOS Control Center에서 WebView가 멈추고 dev WebSocket이 끊긴다. 복귀하면 보통 빈 화면이라 QR을 다시 스캔한다.
- 안 되는 것: 패키징 경로. `.ehpk`를 만들지 않는다. manifest, 패키징 검증, 아이콘을 건너뛴다.
- 안 되는 것: 일부 권한 창, 심사 환경. 심사는 잠긴 휴대폰으로 시험한다.

HMR 복구:

- QR을 다시 스캔한다. 전체 새로고침이 된다.
- `vite.config.ts`에서 `server.host: true`, `server.hmr.host: '<your-lan-ip>'`로 HMR 호스트를 고정한다. 휴대폰은 `localhost`에 닿지 못한다.
- 휴대폰 Developer Mode 콘솔에서 `(disconnected)`를 본다. WebSocket 실패는 HMR 문제다.

| 증상 | 원인 | 해결 |
|---|---|---|
| 스캔 후 "Couldn't connect" | 방화벽이 dev 포트 수신을 막음 | Network & Firewall Setup |
| 스캔해도 반응·오류 없음 | Wi-Fi AP isolation | Network & Firewall Setup |
| 집에서 되고 사무실에서 안 됨 | 사무실 Wi-Fi client isolation | 휴대폰 hotspot 또는 Tailscale |
| 로드되지만 빈 화면 | `await waitForEvenAppBridge()` 누락 | `src/main.ts` 확인 |
| 로드되지만 클릭 반응 없음 | `isEventCapture: 1` 컨테이너 없음 | Display & UI System |
| 한 번 되고 다음 변경에서 빈 화면 | 백그라운드 후 HMR WebSocket 끊김 | QR 다시 스캔 |

실제 `.ehpk`, manifest 검증, 실제 권한이 필요하면 Private Testing으로 간다. 잠긴 휴대폰 동작은 Beta Testing으로 확인한다.

## Private 시험

원문: <https://hub.evenrealities.com/docs/test/private-testing> (2026-10-09 갱신)

실제 패키징 경로가 처음 끝까지 돈다. 설치 경로, manifest 강제, 아이콘, 권한 창이 게시 앱과 같다. 스크립트 설치는 아직 없다. 한 주기에 약 10초가 든다.

`npm run build` 뒤 `evenhub pack app.json dist -o myapp.ehpk`로 묶는다. 포털 업로드 대신 `evenhub upload myapp.ehpk -m "What changed"`도 된다.

1. hub.evenrealities.com/login에서 프로젝트의 Builds 탭을 연다.
2. `myapp.ehpk`를 올린다. Private builds에 회색 `Private` 태그로 들어간다.
3. 휴대폰 Even Realities App의 Even Hub 탭(Developer Mode)을 연다.
4. Me → Apps → Private builds에서 Install을 누른다. 3, 4단계는 수동이다.

- 다루는 것: `.ehpk` 패키징 전체, 실제 권한 창, 설치 패키지로 부팅, 설치·삭제·버전 갱신 흐름.
- 안 되는 것: HMR, headless 자동화, 다른 시험자 배포.
- 백그라운드에서 잠시 버티지만 5분 잠금 시험은 통과하지 못한다.
- 안경 메뉴에 없다. 실행은 늘 휴대폰을 거친다. 안경에서 켜려면 Beta로 승격한다.

| 증상 | 원인 | 해결 |
|---|---|---|
| 업로드 거부: "invalid manifest" | `app.json` 필드 누락 또는 형식 오류 | 오류 상세 확인 |
| 업로드 거부: "package_id taken" | 이미 누가 쓰는 ID | 내가 통제하는 고유 reverse-DNS로 변경 |
| 설치 성공, 안경 검은 화면 | `waitForEvenAppBridge()` 전에 브리지 호출 | 브리지를 먼저 await |
| 권한 창이 안 뜸 | 선언만 하고 호출하지 않음 | 권한 창은 실행 때가 아니라 첫 호출 때 뜬다 |
| 잠금 뒤 앱 사라짐 | 백그라운드 WebView 종료 | 정상. Beta Testing으로 확인 |

## Beta 시험

원문: <https://hub.evenrealities.com/docs/test/beta-testing> (2026-10-09 갱신)

게시 앱과 똑같이 동작하는 유일한 모드다. 안경 메뉴에 앱이 뜨는 유일한 모드다. 심사로 가려면 이 관문을 지나야 한다.

휴대폰이 "test version expired"라고 하면 두 조건을 모두 본다.

- 빌드 태그가 `Beta`다. Builds 탭에서 회색 `Private` 태그를 눌러 Beta를 고르고 Promote to Beta로 확인한다.
- 시험자 Status가 `Active`다. `Invited` 시험자는 아무것도 설치하지 못한다.

절차:

1. `npm run build`, `evenhub pack app.json dist -o myapp.ehpk`.
2. Testing group 탭에서 Add user로 내 이메일을 넣고 Send invite를 누른다. 많으면 Import CSV를 쓴다.
3. 초대 메일을 수락한다. Status가 `Invited`에서 `Active`로 바뀐다.
4. Builds 탭에 `myapp.ehpk`를 올린다. Private builds에 들어간다.
5. 그 행의 `Private` 태그를 누른다. `Public` / `Beta` / `Private` 중 Beta를 고르고 Promote to Beta를 누른다.
6. 휴대폰에서 Me → Beta tester를 열고 Install을 누른다.

- 5단계를 가장 많이 놓친다. 태그 자체가 버튼이다. 별도 배포 버튼은 없다. Beta build 섹션은 승격된 빌드가 있어야 보인다.
- 시험자 목록은 앱마다 하나다. 두 번째 목록이나 그룹 분리는 없다.
- 앱마다 beta 슬롯이 하나다. 새 버전을 승격하면 기존 것을 대체한다.

2, 4, 5단계는 터미널로도 된다.

```bash
evenhub testers add teammate@example.com     # 2단계
evenhub upload myapp.ehpk -m "What changed"  # 4단계
evenhub promote 1.0.1 --to beta              # 5단계
evenhub ls <package_id>                      # CHANNEL이 beta여야 한다
```

### 시험자 CSV

- Testing group 탭에 Import CSV, Export CSV가 있다. 앱 사이에 목록을 옮길 때 쓴다.
- `evenhub testers add --from <file>`도 같은 파일을 읽는다.
- 형식: 한 열, UTF-8, 1행은 글자 그대로 `email`, 이후 한 줄에 주소 하나. 파일당 최대 500개 주소다.
- 1행이 `email`이 아니면 아무것도 보내기 전에 거부한다.

- 가져오기 전 요약: To invite(새 주소, 거절·만료된 시험자), Skipped(파일 안 중복, 이미 Invited / Active), Rejected rows(이메일 형식 아님, 최대 50개 표시).
- 확인하면 남은 주소를 한 요청으로 초대한다. 이미 초대·활성인 시험자에게 다시 보내지 않는다.
- Rejected rows가 있어도 유효한 행만 커밋할 수 있다.
- 한 시험자가 초대 10회 제한에 걸리면 서버가 배치 전체를 거부한다. 그 주소를 빼고 다시 가져온다.
- Export는 화면 밖 행까지 모든 시험자를 알파벳순으로 내보낸다. status 열은 없다.
- 파일 이름: `{date}_{app}_beta.csv` (예: `2026-09-18_com.example.myapp_beta.csv`).

### Beta만 검증하는 것

- 5분 잠금 시험: 앱을 안정 상태로 두고 휴대폰을 5분 잠근 뒤 연다. 앱이 그 자리에 있어야 한다. 심사자가 그대로 한다.
- `shutDownPageContainer(1)` 시스템 종료 창: 실제 설치에서만 뜬다. 루트 더블탭이 `bridge.shutDownPageContainer(1)`을 불러야 한다.
- 루트에서 `0`(즉시 종료)이나 자체 종료 UI를 쓰면 자동 거절된다.
- 실제 권한 거부 경로를 시험한다.
- 콘솔 로그는 휴대폰 Developer Mode 콘솔에 보인다. 비밀값을 찍지 않는다.
- beta 크래시는 아직 자동 보고되지 않는다. 콘솔 버퍼가 유일한 신호다.
- beta 설치는 실제 설치다. `localStorage`, IndexedDB가 그대로 남는다. 필요하면 회차마다 초기화한다.

### 제출 전 체크리스트

| # | 확인 | 통과 기준 |
|---|---|---|
| 1 | 5분 잠금 시험 | 5분 잠근 뒤 상태 유지. spinner, 검은 화면 없음 |
| 2 | 루트 더블탭 시스템 종료 창 | 확인 창이 보이고, 확인하면 WebView가 닫힘 |
| 3 | 권한 거부 처리 | 선언한 권한을 하나씩 거부. 우아하게 기능을 줄이거나 다음 단계를 안내 |
| 4 | 종료 뒤 1st-party 앱(Conversate, Navigate) 재실행 | 안경 재시작 없이 깨끗이 실행 |
| 5 | 부팅 때 콘솔 오류 없음 | 실행 직후 콘솔 버퍼가 깨끗함 |

| 증상 | 원인 | 해결 |
|---|---|---|
| 포털에 Private builds만 보임 | 승격한 적 없음 | `Private` 태그 → Beta → Promote to Beta |
| test version expired | Beta 승격 없음 또는 시험자가 Invited | 둘 다 갖춘 뒤 재설치 |
| 수락했는데 빌드가 다시 사라짐 | beta 빌드 지정과 Active 멤버십이 모두 필요 | 둘 다 확인. `evenhub testers add`는 Invited·Active 정확 일치를 건너뜀. `--reinvite`는 대기 링크만 교체. 대소문자 보존 |
| 설치했는데 안경 메뉴에 없음 | Private 빌드에서 설치함 | Beta로 승격 후 재설치 |
| 잠금 때 앱 사라짐 | 백그라운드가 WebView 종료, resume 처리 없음 | `localStorage`에 즉시 저장하고 재실행 때 rebuild |
| 더블탭에 조용히 종료 | `shutDownPageContainer(0)` 또는 종료 처리 없음 | 루트에서 `shutDownPageContainer(1)` |
| 권한 창 문구가 틀림 | `app.json` 권한 `desc` | 수정·재패킹·재업로드. 재설치 전까지 옛 문구 |
| 빌드 갱신이 전달되지 않음 | 시험자 펌웨어보다 높은 `min_sdk_version` | 펌웨어 업데이트 또는 `min_sdk_version` 낮추기 |

통과한 `.ehpk`를 제출한다. 태그를 눌러 Public을 고르고 "Submit this build for review?"를 확인한다. 태그는 `In Review`, `Approved` 또는 `Rejected`, `Published` 순으로 바뀐다.

## 패키징

원문: <https://hub.evenrealities.com/docs/ship/packaging> (2026-08-29 갱신), 개요: <https://hub.evenrealities.com/docs/ship/index>

출시는 세 가지다. `app.json`을 검증하고, `.ehpk`로 묶고, 포털이나 `evenhub upload`로 올린다.

비밀값과 API 키를 `.ehpk`에 넣지 않는다. 게시 후 누구나 내용을 꺼낼 수 있다. 서드파티 키는 직접 운영하는 서버 프록시 뒤에 둔다.

### app.json

`evenhub init`이 템플릿을 만든다. 템플릿 값: `"edition": "202601"`, `"version": "0.1.0"`, `"min_app_version": "2.2.6"`, `"min_sdk_version": "0.0.7"`, `"entrypoint": "index.html"`, `"supported_languages": ["en"]`.

| 필드 | 타입 | 필수 | 규칙 |
|---|---|---|---|
| `package_id` | string | Yes | reverse-domain (예: `com.yourname.appname`). 각 단은 소문자로 시작, 소문자·숫자만. 최소 2단. 하이픈 금지 |
| `edition` | string | Yes | 반드시 `"202601"` |
| `name` | string | Yes | 20자 이하 |
| `version` | string | Yes | semver `x.y.z` (예: `"1.0.0"`) |
| `min_app_version` | string | No | 최소 Even Realities App 버전. pack 때 SDK 버전에서 계산한다. 더 엄격한 하한을 걸 때만 적는다 |
| `min_sdk_version` | string | Yes | 최소 SDK 버전 (예: `"0.0.14"`) |
| `entrypoint` | string | Yes | 빌드 폴더 기준 HTML 진입 파일 경로 (예: `"index.html"`) |
| `permissions` | array | Yes | 권한 객체 배열. `[]` 가능 |
| `supported_languages` | array | Yes | `en`, `de`, `fr`, `es`, `it`, `zh`, `ja`, `ko` |

### 권한

`permissions`는 객체 배열이다. 키-값 맵이 아니다. `{ "network": ["example.com"] }`은 검증에 실패한다.

| 키 | 타입 | 필수 | 메모 |
|---|---|---|---|
| `name` | string | Yes | `network`, `location`, `g2-microphone`, `phone-microphone`, `album`, `camera` 중 하나 |
| `desc` | string | Yes | 사람이 읽는 이유. 1–300자 |
| `whitelist` | string[] | `network`만 | 허용 도메인 목록. 선택이며 기본값 `[]` |

실제로 쓰는 권한만 선언한다. 안 쓰는 항목은 심사에서 지적된다.

### 빌드와 pack

```bash
npm run build
evenhub pack app.json dist -o myapp.ehpk
```

| 인자 | 설명 |
|---|---|
| `app.json` | manifest 경로 |
| `dist` | 빌드 출력 폴더 |
| `-o myapp.ehpk` | 출력 파일 이름. 기본값 `out.ehpk` |
| `--no-ignore` | 숨김 파일(dotfile) 포함. 기본은 제외 |
| `-c, --check` | `package_id`를 Even Hub에서 쓸 수 있는지 확인 |
| `--sdk-ver <version>` | 빌드에 쓴 SDK 버전. npm에서 `minAppVersion`을 읽어 하한으로 찍는다. 생략하면 최신 게시 SDK |
| `--enforce-manual-version` | `app.json`의 `min_app_version`을 SDK 하한보다 낮아도 그대로 찍는다. 로컬 시험 전용, 제출 불가 |

`entrypoint` 파일이 빌드 폴더에 없으면 `Entrypoint file not found: dist/index.html`로 실패한다.

### min_app_version 자동 계산 (CLI 0.1.14+)

- `min_app_version`은 빌드가 돌 수 있는 가장 오래된 Even Realities App 버전이다.
- SDK `0.0.13`부터 각 릴리스가 npm 메타데이터에 `minAppVersion`을 게시한다. CLI가 pack 때 찍는다.
- 예: `evenhub pack app.json dist --sdk-ver 0.0.14` → `min_app_version 2.2.9`.
- SDK `0.0.14`의 하한은 `2.2.9`다. contextual menu와 long-press 이벤트가 Even App 2.2.9의 브리지 API를 요구한다.
- `--sdk-ver`를 빼면 npm `latest` SDK를 읽는다. 번들한 SDK보다 새것일 수 있다.
- 설치 버전은 `npm list @evenrealities/even_hub_sdk`로 확인한다.
- CLI는 원본 `app.json`을 고치지 않는다. `.ehpk`에만 찍는다.

- `app.json`에도 값이 있으면 더 높은 쪽을 찍는다. 없거나 같으면 하한, 높으면 내 값을 쓴다.
- 내 값이 하한보다 낮으면 하한을 찍고 경고한다. 빌드는 만들어진다.

- `--enforce-manual-version`은 `app.json`에 `min_app_version`이 있어야 한다. 없으면 오류다.
- 레지스트리에 닿지 못하면(네트워크, DNS, timeout, 5xx) 경고 후 번들 맵을 쓴다. 모르는 버전은 기본 하한이 된다.
- SDK `0.0.12` 이하는 npm 필드가 없다. info 줄을 찍고 번들 맵을 쓴다.

### pack 오류

| 오류 | 해결 |
|---|---|
| `Invalid package id` | 소문자 reverse-domain, 2단 이상. 하이픈·대문자·숫자 시작 금지. 유효: `com.myname.myapp`. 무효: `My-App`, `com.my-app.v2`, `myapp`, `com.2fast.app` |
| `name: must be 20 characters or fewer` | 이름을 줄인다 |
| `version: must be in x.y.z format` | `"1.0.0"`. `"1.0"`, `"v1.0.0"`은 안 된다 |
| `min_sdk_version: expected string, received undefined` | `"min_sdk_version": "0.0.14"`를 추가. 설치한 SDK에 맞춘다 |
| `SDK version not published on npm: @evenrealities/even_hub_sdk@<version>` | `--sdk-ver` 값 확인. `.ehpk`를 쓰지 않는다 |
| `--enforce-manual-version needs a min_app_version in app.json` | `min_app_version`을 넣거나 플래그를 뺀다 |
| `permissions: each permission must be an object with "name" …` | `name`, `desc`를 가진 객체 배열로 쓴다 |
| `supported_languages: invalid language` | 지원 소문자 코드만 쓴다 |
| `Entrypoint file not found` | 빌드 폴더에 진입 파일이 있는지 확인 |
| `Project folder not found` | 두 번째 인자는 빌드 결과 폴더다. `npm run build`를 먼저 한다 |

게시 후 Even Hub 카탈로그에 뜬다. 사용자는 Even Realities App으로 설치한다. 안경 메뉴나 Even Hub 탭에서 실행한다.

## 앱 제출과 심사

원문: <https://hub.evenrealities.com/docs/ship/app-submission> (2026-10-09 갱신)

### 상태 기계

Builds 탭의 빌드마다 태그가 하나 있다. 태그를 눌러 상태를 바꾼다. 심사에 들어가면 태그가 심사 상태로 바뀌고 잠긴다.

| 태그 | 섹션 | 설치 가능한 사람 |
|---|---|---|
| `Private` | Private builds | 나. 휴대폰 개발자 섹션에서. 메타데이터 수정 가능 |
| `Beta` | Beta build | 앱 목록의 모든 Active 시험자. 앱당 beta 슬롯 하나 |
| `Public` | Public build | 게시 후 스토어의 모두 |

| 심사 상태 | 설정 주체 | 뜻 |
|---|---|---|
| `In Review` | 나(제출) | 심사 대기. 태그 잠김. 상세 모달의 Cancel review로 뺄 수 있다 |
| `Approved` | Even Realities 심사자 | 심사 통과 |
| `Rejected` | Even Realities 심사자 | 고쳐서 더 높은 버전으로 제출 |
| `Published` | Even Realities | 스토어 게시. 롤백 없음 |

| 출발 | 클릭 | 결과 | 터미널 |
|---|---|---|---|
| 없음 | Builds 탭에서 `.ehpk` 업로드 | Private builds에 `Private` | `evenhub upload` |
| Private | 태그 → Beta → Promote to Beta | Beta build로 이동 | `evenhub promote <version> --to beta` |
| Private 또는 Beta | 태그 → Public → Submit this build for review? → Confirm | `In Review` | 포털만 |
| Beta 또는 Public | 태그 → Private → Delist this project from Even Hub? | Private builds로 복귀 | `evenhub delist --from beta` 또는 `--from public` |
| In Review | 상세 모달의 Cancel review | 심사 철회, 태그 다시 클릭 가능 | 포털만 |

- 제출, 스토어 게시, 심사 취소, 게시된 앱의 listing 수정은 포털에서만 한다.
- Confirm은 store listing이 다 차야 켜진다. 개발자 정보, 제품 스크린샷, 권한 정보, 앱 아이콘이다.
- 같은 창에 Edit listing 바로가기가 있다.

### Fix-forward 버전

`Published`된 버전 번호는 영구다. manifest 수정, `.ehpk` 교체, 이전 버전 롤백이 모두 안 된다. 더 높은 버전으로 대체한다.

- 버그 수정은 `0.1.1`로 `0.1.0`을 대체한다. 실수 게시는 깨진 동작을 무력화한 더 높은 버전으로 덮는다.
- 호환이 깨지는 변경은 `min_sdk_version`을 올린다. 옛 펌웨어 사용자는 이전 버전에 남는다.

### 심사 흐름과 알림

1. 심사자 배정은 자동이다.
2. 심사자는 beta tester로 설치한다. Beta Testing과 같은 경로다.
3. 아래 기준으로 시험한다.
4. `Approved` 또는 `Rejected`를 정한다. 거절에는 메모가 붙는다.
5. 메일과 포털 inbox로 알린다.

- 발신자: `noreply@evenrealities.com`. 질문 회신은 `shawn.deng@evenrealities.com`으로 간다.
- 제목은 승인·거절 모두 고정이다: `You have an update on your Even Hub App Submission`.
- 결정(`Approved`, `Rejected`)만 메일을 보낸다. 제출은 보내지 않는다. 메일에 결과가 없으니 포털에서 본다.

### 심사 기준: Manifest (app.json)

- `package_id`: reverse-domain, 소문자, 하이픈 금지, 밑줄 금지, 2단 이상. 각 단은 소문자로 시작한다 (예: `com.acme.weather`).
- `edition`: 정확히 `"202601"` (2026-04-22 기준 현재 판).
- `name`: 20자 이하. "Even"을 대소문자 무관하게 포함하면 안 된다.
- `"EvenDoc Reader"`, `"Even Bible"` 같은 이름은 1st-party 사칭으로 자동 거절된다. 서면 승인을 받은 공식 제휴 앱은 예외다.
- `version`: 세 자리 semver `x.y.z`. `v` 접두사, pre-release 접미사 금지.
- `min_sdk_version`: 필수. 현재 SDK 하한은 `"0.0.14"`.
- `min_app_version`: CLI `0.1.14`부터 원본에서 선택이다. 패킹된 manifest에는 늘 채워진다.
- `entrypoint`: 빌드 출력 폴더 안의 실제 파일이어야 한다.
- `permissions`: `name` + `desc`(1–300자) 객체 배열. `network` 항목은 `whitelist`도 필요하다. 키-값 맵 금지.
- 요청한 권한은 모두 코드에서 써야 한다. 안 쓰면 지적된다.
- 권한 매핑: `location` → `getAppLocation` / `startAppLocationUpdates`, `album` → `pickImageFromAlbum`, `camera` → `captureImageFromCamera`.
- 권한 매핑: `g2-microphone` → `audioControl(true, AudioInputSource.Glasses)`, `phone-microphone` → `audioControl(true, AudioInputSource.Phone)`.
- 새 버전 제출에는 비어 있지 않은 changelog가 필요하다.

### 심사 기준: Store listing과 시각 자산

- 아이콘이 읽혀야 한다. "black scribble"이나 잡음 패턴은 안 된다.
- foreground와 background를 모두 준다. `null`이나 빈 값은 안 된다.
- 아이콘과 배경 이미지는 monochrome / greyscale만 된다. 컬러는 거절된다.
- 스크린샷은 기기 렌더와 같아야 한다. 시뮬레이터 스크린샷 기능으로 찍는다.
- 표시 이름은 `app.json` `name`, 안경 표시 이름과 같아야 한다.
- 기존 앱 사칭, 무단 브랜드 로고, 이름·설명 키워드 남용을 금지한다.

### 심사 기준: Privacy

- 개인정보처리방침이 요청한 모든 권한을 다룬다.
- 백엔드 도메인이 있으면 문서화하고 개발자에게 추적 가능해야 한다.

### 심사 기준: 첫 실행 (검은 화면 금지)

- 설정이 필요한 첫 실행(도시, API 키, 플레이어 이름 등)은 안경에 할 일을 알린다. 검은 화면은 안 된다.
- 설정은 실행 사이에 기억한다(`localStorage` API). 같은 설정을 다시 묻지 않는다.
- 호출하는 서드파티 API의 CORS 헤더를 맞춘다. `app.json` network whitelist는 Even 쪽 권한 검사다. CORS 우회가 아니다.

### 심사 기준: 잠긴 휴대폰

심사자는 휴대폰을 잠그고 Even Realities App을 백그라운드로 보낸 채 시험한다. beta 빌드로 재현한다. Local Testing은 백그라운드에서 죽어 거짓 실패가 난다.

- 잠금 + 백그라운드에서 안경으로 켠 앱이 적당한 시간 안에 그려진다. 무한 spinner, 검은 화면 금지.
- 잠금 상태에서 핵심 흐름이 안경과 ring 입력만으로 끝까지 돈다. 모든 제스처와 버튼에 반응이 보이고, 모든 이미지가 뜬다.
- Timer 같은 장기 단발 작업이 잠금 중에도 이어지고 바르게 끝난다.
- 2분 idle 뒤에도 살아 있고 반응한다. 멈춤, 무한 루프, 크래시 금지.
- 잠금 해제 → 다른 앱 사용 → 다시 잠금 뒤에도 안경 세션이 그대로다.

### 심사 기준: 종료와 수명주기

- 루트 더블탭은 `bridge.shutDownPageContainer(1)`을 불러 시스템 종료 확인 창을 띄운다.
- 루트에서 mode `0`(즉시 종료)은 안 된다. 루트의 자체 종료 확인 UI도 안 된다.
- 조용히 종료하거나 더블탭에 반응하지 않는 앱은 거절된다.
- 참고 패턴: Make15는 루트 더블탭이 바로 시스템 창을 띄운다.
- 참고 패턴: Chess는 루트 더블탭이 앱 메뉴를 열고, 그 안의 "Exit" 항목이 `shutDownPageContainer(1)`을 부른다.
- 안경에서 종료를 확인하면 휴대폰 WebView도 자동으로 닫혀야 한다. 남은 webview는 거절된다.
- 종료 뒤 안경이 재시작 없이 다른 앱과 1st-party 앱(Conversate, Navigate)을 켤 수 있어야 한다. Conversate만 확인해도 된다.

### 심사 기준: 내용과 안전

- 의료 진단, 금융 조언, 긴급 연결 기능을 넣지 않는다. 불가피하면 법무 검토를 받는다.
- 공격적, 노골적, NSFW, 혐오 내용을 넣지 않는다.

### 릴리스 노트

제출할 때 `supported_language`마다 릴리스 노트를 쓴다.

- 길이는 locale당 1-3줄이다. 코드 변경이 아니라 사용자에게 바뀐 점을 쓴다.
- 첫 버전은 "initial release"가 아니라 앱이 하는 일을 쓴다. 핫픽스는 커밋 메시지가 아니라 증상을 쓴다.

### 제출 직전 점검

1. `evenhub pack app.json dist -o myapp.ehpk -c`로 `package_id` 가용성과 manifest를 확인한다.
2. beta 빌드로 설치하고 휴대폰을 5분 잠근다. 살아 있고 반응해야 한다.
3. 루트 더블탭에 시스템 종료 창이 뜨고 WebView가 닫히는지 본다.
4. 1st-party 앱(Conversate)이 안경 재시작 없이 켜지는지 본다.
5. 개인정보처리방침이 `app.json`의 모든 권한을 다루는지 다시 읽는다.

| 질문 | 답 |
|---|---|
| 심사자 설치에 옛 코드가 보인다 | 심사자는 `In Review` 버전을 설치한다. 새 변경은 더 새 Private 빌드에 있다 |
| 게시 버전을 시험으로 되돌릴 수 있나 | 없다. 더 높은 버전을 게시한다 |
| `Rejected`가 나왔다 | 메모를 읽고 고쳐 더 높은 버전을 제출한다 |
| `In Review`를 철회하려면 | Builds 탭에서 빌드를 열고 Cancel review를 누른다 |
| 사용자가 새 버전을 못 본다 | 펌웨어가 새 `min_sdk_version`보다 낮다. 펌웨어 업데이트가 먼저다 |

## 공식 페이지 사이의 불일치

원문: <https://hub.evenrealities.com/docs/ship/packaging>, <https://hub.evenrealities.com/docs/ship/app-submission>, <https://hub.evenrealities.com/docs/test/beta-testing>, <https://hub.evenrealities.com/docs/cli/apps>, <https://hub.evenrealities.com/docs/cli/testers>, <https://hub.evenrealities.com/docs/cli/builds>

- `whitelist`: Packaging은 "Optional, defaults to []"라고 한다. 심사 기준은 "`network` entries also need `whitelist`"라고 한다.
- 아이콘 색: 심사 기준은 "monochrome / greyscale only"다. CLI Apps는 모든 픽셀이 완전 투명이거나 불투명 `#F4F4F4`여야 한다고 한다.
- `min_sdk_version`: `evenhub init` 템플릿은 `"0.0.7"`이다. 심사 기준의 현재 하한은 `"0.0.14"`다. CLI Builds 예시는 `--sdk-ver 0.0.16`을 쓴다.
- 시험자 CSV 헤더: Beta Testing은 1행이 `email`이 아니면 거부한다고 한다. CLI Testers는 `--from`의 `email` 헤더가 선택이라고 한다.
- 시험자 목록: Beta Testing은 파일당 최대 500개 주소라고 한다. CLI Testers에는 이 한도가 없다.
