---
title: "Even G2 공식 문서 요약: Get Started · Learn"
status: draft
updated: 2026-11-21
owner: dev
summary: "공식 Get Started·Learn 문서 요약: 하드웨어, 설치, 첫 앱, 템플릿, 구조"
---

# Even G2 공식 문서 요약: Get Started · Learn
출처: 공식 문서 (2026-11-21 읽음)

## 개요 (Overview)
출처: [get-started/overview](https://hub.evenrealities.com/docs/get-started/overview) (Last updated: 2026-08-29)

Even G2는 렌즈마다 micro-LED 디스플레이가 하나씩 있는 스마트 안경이다.
폰과 Bluetooth LE 5.2로 연결한다.
코드는 폰에서 돈다. 안경은 화면 역할만 한다.
### 하드웨어 사양
| 항목 | 값 |
|---|---|
| Display | 576 x 288 px per eye |
| Color depth | Monochrome green, 16 levels |
| Connectivity | Bluetooth Low Energy 5.2 |
| Audio input | 4-mic array, single stream, 16 kHz PCM |
| Even G2 touchpads | Press, double press, swipe up, swipe down, long press and release |
| R1 touchpads | Even G2와 같은 제스처 (선택 액세서리) |
| Camera / Speaker | 없음 |

- 안경에는 카메라와 스피커가 없다.
- 사용자가 허락하면 플러그인은 SDK로 폰 카메라와 앨범에 접근할 수 있다.
### 만들 수 있는 것
- 현재 열린 표면은 플러그인(plugins) 하나다. HTML, CSS, JavaScript/TypeScript 웹 앱이다.
- Even Hub SDK가 웹 앱을 안경에 연결한다. Vite, React, plain JS 등 어떤 스택도 된다.
- 예정된 표면: dashboard widgets, dashboard layouts, AI skills.
### 개발 흐름
```
1. Write code         Standard web app (Vite + SDK)
2. Preview locally    evenhub-simulator http://localhost:5173
3. Preview on device  evenhub qr --url <your-dev-server-url>
4. Package and test   pack → create (first build) or upload → beta testing
5. Submit and publish Complete the listing and review in the developer portal
```
npm 패키지: SDK `@evenrealities/even_hub_sdk`, Simulator `@evenrealities/evenhub-simulator`, CLI `@evenrealities/evenhub-cli`.
디자인, 커뮤니티 도구, Discord는 Learn 섹션에 있다.

## 시작 경로 (Get Started index)
출처: [get-started/index](https://hub.evenrealities.com/docs/get-started/index) (Last updated: 2026-06-11)

| 상황 | 읽을 페이지 |
|---|---|
| 안경이 아직 없음 | Sign in → Install Node.js & npm → Install Even Hub tooling → Your First App (하드웨어 불필요) |
| Even G2 보유 | Hardware (페어링, 펌웨어, Developer Mode, 방화벽) |
| 전체 구조 이해 | Architecture |
| 빠르게 시작 | Templates (starter 프로젝트 + 1st-party 컴포넌트 라이브러리) |

## Quickstart 체크리스트
출처: [get-started/quickstart/index](https://hub.evenrealities.com/docs/get-started/quickstart/index) (Last updated: 2026-06-04)

목표: 계정, 페어링·업데이트된 G2, Developer Mode, Node 설치, QR sideload로 `Hello from G2!` 표시.
1. 폰 브라우저에서 `evenapp.evenrealities.com`을 열어 앱을 설치한다. 앱 안에서 계정을 만든다.
2. 같은 계정으로 `hub.evenrealities.com/login`에 로그인한다.
3. 충전 케이스를 전원에 꽂고 양쪽 다리를 넣어 shipping mode를 깨운다. 케이스 불이 켜지면 페어링 준비 완료다.
4. 앱의 페어링 튜토리얼로 페어링한다. 펌웨어 업데이트를 먼저 받는다.
5. Developer Mode를 켠다 (웹 로그인 → 앱 강제 종료 후 재실행 → Even Hub 탭 우상단 developer section).
6. Node 20 LTS 또는 22+를 설치한다.
7. CLI·시뮬레이터를 전역 설치한다 (아래 'Even Hub 도구 설치').
8. 최소 앱을 만들고 dev 서버를 켠 뒤 QR로 sideload한다.
- "연결 안 됨"은 대개 오래된 펌웨어 탓이다. QR은 찍히나 앱이 안 뜨면 대개 방화벽이나 AP isolation 탓이다.
### 막혔을 때
| 증상 | 가장 흔한 원인 | 참고 |
|---|---|---|
| 앱에 Scan QR 항목이 없음 | Developer Mode 미활성, 또는 웹 로그인 후 앱 재시작 안 함 | Enable Developer Mode |
| QR은 찍히나 앱이 안 뜸 | 방화벽 / AP isolation이 폰→노트북 차단 | Network & Firewall Setup |
| `node` / `npm` "command not found" | 설치 후 PATH 미설정 | Install Node.js & npm |
| 안경이 전혀 연결 안 됨 | shipment mode 상태, 또는 오래된 펌웨어 | Set up your Even G2 & R1 |

## 로그인 (Sign in)
출처: [get-started/quickstart/sign-in](https://hub.evenrealities.com/docs/get-started/quickstart/sign-in) (Last updated: 2026-06-08)
- 계정은 Even Realities App에서만 만든다. 웹 hub에는 가입 절차가 없다.
- `hub.evenrealities.com/login`에서 앱의 이메일·비밀번호로 로그인한다. 빈 publisher dashboard가 나온다.

| 표면 | 계정 용도 |
|---|---|
| Developer portal | 앱 생성, 패키징, 제출, 관리 |
| Developer Mode | 폰 앱이 이 계정에 묶인 로컬 개발 권한을 준다 |
| Terminal | 같은 자격 증명으로 `evenhub login` |

## 하드웨어 설정 (Hardware)
출처: [get-started/quickstart/hardware](https://hub.evenrealities.com/docs/get-started/quickstart/hardware) (Last updated: 2026-06-04)
### 이름
- Even G2 = 안경, Even R1 = 선택 입력 링. Bluetooth 페어링 목록에도 이 이름으로 나온다.
### Shipping mode 해제
- 새 안경은 배터리가 격리된 shipping mode로 온다. 꺼진 것처럼 보인다.
- 양쪽 다리를 충전 케이스에 넣고 닫는다.
- 케이스 불 색상: White = 충전 완료·준비됨. Orange (≈3 s) = 안경 삽입 시 안착 피드백.
- 케이스를 열면 안경이 켜지고 검색 가능 상태가 된다.
### 페어링과 펌웨어
- 앱 로그인 → Devices → Add device → Even G2 선택 → 페어링 확인. 안경에 짧은 확인 표시가 뜬다.
- 앱은 페어링 직후 펌웨어를 확인한다. 업데이트를 먼저 받는다. 수동 확인: Devices → Firmware.
- 플래시가 끝날 때까지 안경은 케이스에, 폰은 가까이 둔다. 중단하지 않는다.
### R1 링 (선택)
- Devices → Add device → Even R1. 안경과 같은 확인 절차다. 손을 관자놀이에 올리지 않고 입력한다.
- 제스처·이벤트 모델은 Device APIs → Inputs 문서에 있다.
### Developer Mode 켜기
토글은 없다. 웹 hub 로그인이 계정을 developer로 바꾼다.
1. 폰 앱과 같은 계정으로 `hub.evenrealities.com/login`에 로그인한다.
2. Even Realities App을 강제 종료한다 (최근 앱에서 스와이프). 다시 연다.
3. Even Hub 탭 우상단에 developer section이 생긴다. 여기에 Scan QR 버튼이 있다.
- 알려진 문제: Dev Preview에서 수동 Link jump가 실패할 수 있다 (무반응, 엉뚱한 페이지, 홈으로 튕김). 우회: QR을 다시 스캔한다.
### Network & Firewall Setup
QR sideload는 폰이 노트북 dev 서버(`http://192.168.1.100:5173` 등)에 접속하는 방식이다.
폰과 노트북이 같은 네트워크여야 하고, 중간 차단이 없어야 한다.

#### 1. LAN IP 찾기 (`localhost` 아님)
```bash
# macOS
ipconfig getifaddr en0        # Wi-Fi; try en1 if blank

# Linux
hostname -I | awk '{print $1}'

# Windows (PowerShell)
ipconfig | findstr /i "IPv4"

# QR URL에 그 주소를 쓴다
evenhub qr --url "http://<your-lan-ip>:5173"
```
#### 2. 방화벽에서 Node 허용
- macOS: 첫 인바운드 연결을 조용히 버린다.
  - System Settings → Network → Firewall → Options… → node 바이너리 추가 → Allow incoming connections.
  - 버전 매니저면 `~/.fnm/...` 또는 `~/.nvm/...` 경로를 추가한다. 오래된 `/usr/local/bin/node`가 아니다.
  - 확인법: 방화벽을 끄고 재시도한 뒤, 허용 규칙을 넣고 다시 켠다.
- Windows Defender: fnm/nvm-windows의 shim `node.exe`를 묻지 않고 막는 경우가 많다.
  - Windows Security → Firewall & network protection → Advanced settings → Inbound Rules → New Rule → Port → TCP → 5173 (또는 dev 포트) → Allow. 최소 Private 프로필에 적용.
#### 3. Wi-Fi AP isolation

회사 Wi-Fi와 많은 가정용 공유기가 기본으로 켜 둔다. 같은 SSID에서도 기기 간 통신을 막는다.

| 대안 | 방법 |
|---|---|
| Phone hotspot | 노트북을 폰 핫스팟에 연결한다 |
| Different network | client isolation 없는 집/게스트 네트워크를 쓴다 |
| Tailscale | 같은 tailnet에 두고 Tailscale IP를 QR URL에 쓴다 |
### 빠른 진단 (QR은 찍히나 앱이 안 뜰 때, 위에서부터)
| 단계 | 확인 | 실패 시 |
|---|---|---|
| 1 | 폰 브라우저로 `http://<your-lan-ip>:5173` 열기 | 폰이 노트북에 못 닿음 → 2단계 |
| 2 | dev 서버 실행 확인 (`npm run dev`에 `Local:` 줄) | dev 서버 재시작, QR 재생성 |
| 3 | QR의 IP가 현재 LAN IP와 같은지 (재접속 시 바뀜) | `evenhub qr --url "http://<current-ip>:5173"` 재실행 |
| 4 | macOS/Windows 방화벽이 Node / 포트 5173 허용? | 허용 규칙 추가 후 1단계 재시도 |
| 5 | 공유기 AP / client isolation 켜짐? | 폰 핫스팟 또는 Tailscale |

## Node.js & npm 설치
출처: [get-started/quickstart/install-node](https://hub.evenrealities.com/docs/get-started/quickstart/install-node) (Last updated: 2026-06-08)
- 대상: Node 20 LTS 또는 22+. Node 18은 지원하지 않는다.
- SDK 선언: `engines.node = "^20.0.0 || >=22.0.0"`.
- `node -v`가 20.x 또는 22+이면 이 단계를 건너뛴다.

| OS | 방법 |
|---|---|
| macOS | Homebrew 설치 후 `brew install node@22` |
| Windows | nodejs.org LTS 설치 파일. `PATH` 추가 옵션을 켠다 |
| Linux | 배포판 패키지는 낡은 경우가 많다. NodeSource를 쓴다 |

```bash
# macOS - Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
brew install node@22

# Linux - NodeSource
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify
node -v   # v20.x or v22.x+
npm -v
```
- 버전 매니저(fnm / nvm / winget) 섹션도 있다. 추출된 원문에서 그 코드 블록이 비어 있어 명령은 확인 불가.
### 흔한 문제
- macOS Apple Silicon: Homebrew는 `/opt/homebrew`에 설치된다. `node`를 못 찾으면 아래를 실행한다.
```bash
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
exec zsh
```
- Windows: fnm/nvm-windows는 shim `node.exe`를 쓴다. Defender가 이를 인바운드 차단할 수 있다.
- Linux/macOS `EACCES`: `sudo npm`을 쓰지 않는다. 버전 매니저나 사용자 prefix를 쓴다.
- 전역 설치가 안 되는 환경은 `npx`를 쓴다. 반복 사용엔 전역 설치가 더 빠르다.
```bash
# EACCES 회피: 사용자 소유 prefix
npm config set prefix "$HOME/.npm-global"
export PATH="$HOME/.npm-global/bin:$PATH"   # add to your shell profile

# 전역 설치 없이 실행
npx @evenrealities/evenhub-cli qr --url "http://<your-lan-ip>:5173"
```

## Even Hub 도구 설치
출처: [get-started/quickstart/install-tools](https://hub.evenrealities.com/docs/get-started/quickstart/install-tools) (Last updated: 2026-08-29)
```bash
npm install -g @evenrealities/evenhub-cli @evenrealities/evenhub-simulator
```

| 도구 | 현재 버전 | 설치 | 비고 |
|---|---|---|---|
| Simulator | 0.9.3 (SDK `0.0.14` 추적) | 전역 | macOS, Linux, Windows |
| CLI | 0.2.0 | 전역 | 바이너리 `evenhub`, 별칭 `eh` |
| SDK | 0.0.14 (2026-08-20 배포) | 프로젝트 의존성, `-g` 없음 | Even App floor 2.2.9 |

- CLI 역할: QR sideload, manifest 생성, `.ehpk` 패키징, 앱 생성, 빌드 업로드, 베타 테스터 초대, beta 채널 배포.
- SDK는 `package.json`이 있는 앱 프로젝트 안에서만 설치한다.
- Route A (Vite 직접 생성): 프로젝트 디렉터리에서 `npm install @evenrealities/even_hub_sdk@latest`.
- Route B (공식 템플릿): SDK가 이미 포함됐다. `npm install`만 한다. SDK를 따로 설치하지 않는다.
- 설치한 SDK 버전을 `app.json`의 `min_sdk_version`에 맞춘다.
- SDK 범위: display control, input, contextual menu, long press, audio (glasses 또는 phone mic), IMU, location, photo album, phone camera, device info, local storage.

## 첫 앱 만들기 (Your First App)
출처: [get-started/quickstart/first-app](https://hub.evenrealities.com/docs/get-started/quickstart/first-app) (Last updated: 2026-07-04)

결과물: Vite + TypeScript 프로젝트, 시뮬레이터 화면과 클릭 핸들러, `app.json`, QR sideload로 실기기 실행.
### 1. 프로젝트 생성
#### Route A - Vite 직접 생성
```bash
npm create vite@latest my-first-app -- --template vanilla-ts
cd my-first-app
npm install
npm install @evenrealities/even_hub_sdk@latest
evenhub init
```
- `evenhub init`은 `app.json`만 만든다. Vite 프로젝트는 만들지 않는다.
#### Route B - 템플릿
```bash
npx degit even-realities/evenhub-templates/minimal my-first-app
cd my-first-app
npm install
```
- 템플릿: `minimal`, `text-heavy`, `asr`, `image`.
- Claude Code에서는 `template` skill이 템플릿을 골라 생성한다.
### 2. 프로젝트 구조
```
my-first-app/
├── src/
│   └── main.ts            ← your app's entry point
├── public/
│   └── icon.png           ← greyscale app icon (24×24)
├── index.html             ← Vite HTML entry - keep as-is
├── package.json
├── vite.config.ts         ← Vite config - keep as-is for now
├── tsconfig.json
└── app.json               ← Even Hub manifest (required for packaging)
```
Even 전용 파일은 `app.json` 하나다. 나머지는 표준 Vite다.
### 3. `src/main.ts`
```typescript
import {
  waitForEvenAppBridge,
  TextContainerProperty,
  TextContainerUpgrade,
  CreateStartUpPageContainer,
  OsEventTypeList,
} from '@evenrealities/even_hub_sdk'

// Wait for the bridge to be ready before doing anything else.
// In the simulator this resolves immediately; on hardware it waits
// for the WebView to initialize the SDK bridge.
const bridge = await waitForEvenAppBridge()

// Build a single text container that fills the visible canvas (576×288).
const mainText = new TextContainerProperty({
  xPosition: 0,
  yPosition: 0,
  width: 576,
  height: 288,
  borderWidth: 0,
  borderColor: 5,
  paddingLength: 4,
  containerID: 1,
  containerName: 'main',
  content: 'Hello from G2!\n\nTap to count: 0\nDouble-tap to exit',
  isEventCapture: 1,           // ← receive click events on this container
})

// Render the page. `result` is 0 on success.
const result = await bridge.createStartUpPageContainer(
  new CreateStartUpPageContainer({
    containerTotalNum: 1,
    textObject: [mainText],
  }),
)

if (result !== 0) {
  console.error('createStartUpPageContainer failed:', result)
  // 1 = invalid params, 2 = oversize, 3 = out of memory
}

// Single event subscription - all OS events arrive through onEvenHubEvent.
// Inspect event.textEvent / event.listEvent / event.sysEvent to route by source.
let count = 0

bridge.onEvenHubEvent((event) => {
  const textEvent = event.textEvent
  if (!textEvent || textEvent.containerID !== 1) return

  switch (textEvent.eventType) {
    case OsEventTypeList.CLICK_EVENT:
    case undefined: // SDK normalizes 0 to undefined in some cases
      count += 1
      bridge.textContainerUpgrade(new TextContainerUpgrade({
        containerID: 1,
        containerName: 'main',
        content: `Hello from G2!\n\nTap to count: ${count}\nDouble-tap to exit`,
      }))
      break

    case OsEventTypeList.DOUBLE_CLICK_EVENT:
      // Mode 1 shows the system exit-confirmation dialog -
      // required on the root page; silent exit (mode 0) is rejected in QA.
      bridge.shutDownPageContainer(1)
      break
  }
})
```
핵심 규칙:

| API / 필드 | 규칙 |
|---|---|
| `waitForEvenAppBridge()` | 다른 SDK 호출 전에 반드시 await한다. 준비 전 호출은 조용히 무시된다 |
| `isEventCapture: 1` | 입력 이벤트를 받으려면 필수. 기본값 0은 표시 전용 |
| `onEvenHubEvent` | OS→앱 이벤트의 단일 구독 지점. `textEvent` / `listEvent` / `sysEvent`로 출처를 구분하고 `eventType`으로 분기 |
| `textContainerUpgrade` | 깜빡임 없는 텍스트 갱신. `new TextContainerUpgrade({...})`를 넘긴다. `rebuildPageContainer`는 레이아웃 변경(컨테이너 추가/삭제)에만 |
| `shutDownPageContainer(1)` | 시스템 종료 확인 대화상자. 루트 페이지에서 필수. mode `0`이나 커스텀 종료 UI는 QA에서 거절 |
| 결과 코드 | `createStartUpPageContainer`는 int 반환(0 = 성공; 1 = invalid params, 2 = oversize, 3 = out of memory). 나머지는 boolean 또는 status string |
### 4. `app.json` (최소)
```json
{
  "package_id": "com.exampleco.exampleapp",
  "name": "My First App",
  "version": "0.1.0",
  "edition": "202601",
  "min_sdk_version": "0.0.12",
  "entrypoint": "index.html",
  "permissions": [],
  "supported_languages": ["en"]
}
```

| 필드 | 설명 |
|---|---|
| `package_id` | 전역 고유. 관례는 핸들의 reverse-DNS |
| `edition` | 플랫폼 계약 버전. 별도 안내 전까지 `"202601"` |
| `min_sdk_version` | 설치한 SDK에 맞춘다. `npm list @evenrealities/even_hub_sdk`로 확인 |
| `min_app_version` | 일부러 생략. CLI가 pack 시 SDK 버전에서 도출한다. 더 엄격한 floor를 고정할 때만 선언 |
| `permissions` | 이 앱은 비어 있음. 외부 `fetch()`는 `{"name": "network", "desc": "...", "whitelist": ["https://api.example.com"]}`. 마이크는 `{"name": "g2-microphone", "desc": "..."}` |
### 5. 시뮬레이터 실행
```bash
# Terminal 1 - Vite dev server
npm run dev

# Terminal 2 - Simulator (point it at the dev URL)
evenhub-simulator http://localhost:5173
```
- 576×288 녹색 캔버스 창이 열린다.
- 캔버스 클릭 → 카운터 증가. 더블클릭 → 시스템 종료 확인 대화상자.
- `main.ts`를 고치면 Vite가 hot-reload하고 시뮬레이터가 갱신된다.

| 증상 | 원인 | 해결 |
|---|---|---|
| 빈 녹색 캔버스 | `waitForEvenAppBridge()` 미await | await 확인, `main.ts`가 모듈 top-level에서 실행되는지 확인 |
| 텍스트는 보이나 클릭 무반응 | `isEventCapture: 0`, 또는 클릭 타입 정규화 | `isEventCapture: 1`, `onEvenHubEvent`에서 `OsEventTypeList.CLICK_EVENT`와 `undefined` 둘 다 처리. DOM click을 쓰지 않는다 |
| `Cannot find module @evenrealities/even_hub_sdk` | SDK 의존성 누락 | Route A: `npm install @evenrealities/even_hub_sdk@latest`; 템플릿: `npm install` |
| 카운터는 오르나 텍스트가 사라짐 | `textContainerUpgrade`의 `containerID` / `containerName` 불일치 | `createStartUpPageContainer` 값과 맞춘다 |
### 6. 실기기 실행
전제: 폰 앱에 Scan QR 버튼이 보이고, 폰이 노트북 LAN IP에 닿아야 한다.

LAN IP 찾는 명령은 위 Network & Firewall Setup과 같다.
```bash
evenhub qr --url "http://<YOUR-LAN-IP>:5173"
```
- 터미널에 QR이 뜬다. 폰 앱의 Scan QR로 찍는다.
- 1초 안에 안경에 앱이 뜬다. 재스캔 없이 hot-reload가 된다.
- 관자놀이를 탭하면 카운터가 오른다.
- 알려진 문제: Dev Preview의 수동 Link jump 실패. QR을 다시 스캔한다.

| 증상 | 원인 | 해결 |
|---|---|---|
| 스캔 후 "Couldn't connect" | 방화벽 / AP isolation | Network & Firewall Setup |
| 내 앱 대신 이전 앱이 보임 | 캐시된 앱 컨테이너 | QR 재스캔(강제 reload) |
| 로드는 되나 클릭 무반응 | `isEventCapture: 1` 없음 | 시뮬레이터 항목과 같음 |
| 시뮬레이터는 되나 안경은 빈 화면 | bridge 준비 전 렌더 | `await waitForEvenAppBridge()` 확인 |
### 7. 다음 단계
- 다중 페이지 UI: Display & UI System. R1·IMU·스와이프·더블탭·마이크·로컬 저장소: Device APIs.
- 외부 API: Networking. 폰 잠금 시 동작: Background & Lifecycle. 레이아웃: Design Guidelines.
- 배포: Packaging & Deployment → App Submission & QA. 테스트 방식 선택: Testing Modes.

## 템플릿 (Templates)
출처: [get-started/quickstart/templates](https://hub.evenrealities.com/docs/get-started/quickstart/templates) (Last updated: 2026-06-04)

모든 공식 템플릿은 `github.com/even-realities/evenhub-templates`에 있다. 최신 목록은 README에 있다.

| Template | 포함 | 용도 |
|---|---|---|
| `minimal` | Vite + TypeScript + SDK, 단일 페이지, 클릭 핸들러 | SDK 학습, 단발 데모 |
| `text-heavy` | 페이지네이션 컴포넌트, 큰 텍스트 렌더링, 폰트 측정 helper | 읽기 앱, 긴 글 |
| `asr` | 오디오 캡처, 전사 scaffolding, 마이크 UI 상태 | 음성 메모, 전사, 음성 제어 |
| `image` | 이미지 렌더 파이프라인, greyscale 변환 helper, placeholder 교체 | 사진 뷰어, 이미지 |

```bash
npx degit even-realities/evenhub-templates/minimal my-app
cd my-app
npm install
npm run dev
```
- `minimal` 대신 `text-heavy`, `asr`, `image`를 쓸 수 있다.
- Claude Code에서는 `/template` skill이 이 흐름을 감싼다.
- 공통: Vite + TypeScript + HMR, `@evenrealities/even_hub_sdk` 설치됨, `app.json` 기본값 채워짐.
- 공통: `src/main.ts`가 다른 SDK 호출 전에 `waitForEvenAppBridge()`로 bridge를 띄운다.
- `index.html`, `vite.config.ts`는 그대로 둔다.
- 고칠 것 - `app.json`: `package_id`(reverse-DNS, 전역 고유), `name`, `description`, 필요한 `permissions` / `network` whitelist.
- 고칠 것 - `src/`(파일 구성은 템플릿 README), `public/icon.png`(24x24 greyscale 아이콘).
- 템플릿 자동 업그레이드 도구는 없다. upstream 폴더와 diff해서 필요한 부분을 복사한다.
- breaking change 마이그레이션 노트는 템플릿 README에 있다.
- SDK 원리 학습 중이면 Your First App을 최소 한 번 먼저 한다. 템플릿은 bridge 동작을 helper 뒤에 숨긴다.
- 번들 크기가 빠듯하면 데모 코드와 helper를 배포 전에 걷어낸다.
- 특화 기능이 안 맞으면 `minimal`을 쓴다.

## 아키텍처 (Architecture)
출처: [get-started/architecture](https://hub.evenrealities.com/docs/get-started/architecture) (Last updated: 2026-06-11)
```
┌──────────────────┐    HTTPS     ┌────────────────────┐   Bluetooth    ┌─────────────────────┐
│  Even Hub Cloud  │ ◄──────────► │  Phone             │ ◄────────────► │  Even G2 Glasses    │
│  (distribution   │              │  (Even Realities   │                │  (display + input)  │
│   & hosting)     │              │   App + WebView)   │                │                     │
└──────────────────┘              └────────────────────┘                └─────────────────────┘
```
- 폰의 Even Realities App(Flutter)이 플러그인을 WebView(Android Chromium, iOS WKWebView)에 띄운다.
- 앱 로직은 WebView 안에서 돈다. 앱이 Bluetooth로 안경과 중계한다.
- 안경은 UI 컨테이너를 그리고 입력 이벤트(press, scroll, swipe)를 보낸다.
- 네이티브 스크롤 처리 외에 안경에서 도는 앱 로직은 없다.
### network whitelist ≠ CORS 우회
- `app.json`의 `network` whitelist는 Even 쪽 권한 검사다.
- 운영 환경의 `fetch()`는 두 조건을 모두 요구한다.
  - 원격 도메인이 `network` whitelist에 있다.
  - 원격 API가 올바른 CORS 헤더(`Access-Control-Allow-Origin` 등)를 준다.
- `localhost`에선 되고 WebView에서 실패하면 대개 원격 쪽 CORS 설정 문제다.
### 테스트 방식
| 방식 | 설명 |
|---|---|
| QR sideload | CLI가 로컬 dev 서버 QR을 출력한다. 앱에서 스캔하면 hot reload로 실행 |
| Private build | `evenhub pack`으로 `.ehpk` 생성, `evenhub upload`로 전송. 내 기기에 설치 |
| Simulator | 하드웨어 없이 노트북에서 레이아웃·로직 확인 |
### PWA 대안
- Even Hub 배포 흐름 밖에 있으려면 PWA를 만들고 호스팅 URL을 안내한다.
- 배포·호스팅을 직접 통제한다. 패키징과 리뷰가 없다.
### SDK bridge
- SDK가 WebView에 JavaScript bridge `EvenAppBridge`를 주입한다.
- Web → Glasses: `bridge.callEvenApp(method, params)` → WebView bridge → Even Realities App → Bluetooth → glasses.
- Glasses → Web: Bluetooth → Even Realities App → `window._listenEvenAppMessage(...)` → 콜백.

## Learn: 개요와 커뮤니티 자료
출처: [learn/index](https://hub.evenrealities.com/docs/learn/index)
- 하위 페이지: Video Series(튜토리얼 에피소드), Claude Code(`everything-evenhub` 플러그인).
#### 외부 자료 (커뮤니티 프로젝트는 Even이 통제하지 않는다)

| 자료 | 설명 |
|---|---|
| Software Design Guidelines | Design Guidelines의 원본 Figma 파일 (컴포넌트, 간격, 녹색 캔버스) |
| even-g2-notes | Even G2 커뮤니티 리버스 엔지니어링 노트 |
| even-toolkit | 커뮤니티 helper 라이브러리 |
| ER Studio | 커뮤니티 IDE. 에디터, 시뮬레이터 미러, 원클릭 pack (macOS Apple Silicon) |
| Discord | 개발자 커뮤니티 |

## Learn: 비디오
출처: [learn/videos](https://hub.evenrealities.com/docs/learn/videos)
- 추출된 원문에는 EP01 "What You Can Build on Even G2"만 있다. 나머지 에피소드 목록은 확인 불가.
- EP01 내용: 576x288 디스플레이 2개, Even R1 링, temple TouchPad, WebView로 코드를 돌리고 Bluetooth로 중계하는 폰 앱.
- EP4까지는 모두 데스크톱 시뮬레이터에서 돈다. 관련 문서: Overview, Architecture.

## Learn: Claude Code 플러그인 (everything-evenhub)
출처: [learn/claude-code](https://hub.evenrealities.com/docs/learn/claude-code) (Last updated: 2026-08-29)
- `everything-evenhub`는 SDK, 디스플레이 제약, 시뮬레이터, 패키징을 Claude에게 알려 주는 오픈소스 Claude Code 플러그인이다.
- skill 13개를 제공한다. Even G2 관련 작업이면 Claude가 알아서 skill을 고른다.
- 정의 위치: `even-realities/everything-evenhub` 저장소의 `plugins/everything-evenhub/skills/`.
#### 설치 (Claude Code 안에서)
```bash
/plugin marketplace add even-realities/everything-evenhub
/plugin install everything-evenhub
```
예시 프롬프트: "Build me a hello-world app for the Even G2 glasses that shows "Hello, Even!" on the display."
→ `quickstart` skill이 프로젝트를 만들고 시뮬레이터 실행을 안내한다.
### Skill 목록
| Tier | Skill | 하는 일 | 트리거 예 |
|---|---|---|---|
| 1 | `quickstart` | 빈 앱 생성 (Vite + TypeScript + `@evenrealities/even_hub_sdk`). 예제 앱 아님 | `/quickstart my-weather-app` |
| 1 | `template` | `degit`으로 `minimal`, `asr`, `image`, `text-heavy` 템플릿 생성. 플래그 정규화(`--withasr`, `--reader` 등), `package.json` / `app.json` 이름 변경, `npm install` | `/template my-reader --text-heavy` |
| 1 | `build-and-deploy` | CLI로 `.ehpk` 빌드, 업로드, 테스터 초대, beta 채널 promote. 리뷰 직전에서 멈춘다 | `/build-and-deploy` |
| 2 | `glasses-ui` | 컨테이너, 텍스트, 이미지, 리스트 UI | `/glasses-ui "show a 3-item menu with a title bar"` |
| 2 | `handle-input` | 터치패드 제스처, 링 입력, long press, contextual menu 선택 | `/handle-input "single press cycles screens, double press exits, long press charges a throw"` |
| 2 | `device-features` | 오디오 캡처, IMU, device info, local storage | `/device-features "toggle microphone recording on click"` |
| 2 | `background-state` | 원문 카탈로그에 상세 설명 없음 (Tier 2 목록에만 있음) | - |
| 2 | `test-with-simulator` | 시뮬레이터에서 실행·디버그 | `/test-with-simulator "debug my app with glow effect"` |
| 2 | `simulator-automation` | 시뮬레이터 HTTP API로 스크린샷, 입력 주입, 콘솔 로그 | `/simulator-automation "take a screenshot and verify text is displayed"` |
| 2 | `font-measurement` | LVGL 펌웨어 렌더링과 맞춘 픽셀 단위 텍스트·리스트 측정 | `/font-measurement "size a text container for a long paragraph with 8px padding"` |
| 3 | `sdk-reference` | SDK API, 타입, 패턴 조회 | `/sdk-reference createStartUpPageContainer` |
| 3 | `cli-reference` | 모든 `evenhub` 명령·플래그, exit code, `--json` 키 | `/cli-reference evenhub promote` |
| 3 | `design-guidelines` | 디스플레이 제약과 UX 모범 사례 | `/design-guidelines settings screen with 5 options` |
### Harness 테스트
- 플러그인 저장소에 AI 에이전트로 skill을 회귀 테스트하는 harness runner가 있다. 추가법은 `harness/README.md`.
```bash
/harness quickstart
```