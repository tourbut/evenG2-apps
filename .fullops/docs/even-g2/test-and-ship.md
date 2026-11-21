---
title: 시험·패키징·제출
status: draft
updated: 2026-11-21
owner: dev
summary: G2 앱 시험 단계·app.json·패키징·심사 점검
---

# 시험·패키징·제출

출처: [evenhub.kr/ai-dev/test](https://evenhub.kr/ai-dev/test), [/ship](https://evenhub.kr/ai-dev/ship), [/ask](https://evenhub.kr/ai-dev/ask), [/share](https://evenhub.kr/ai-dev/share)와 `even-g2-app` 스킬의 `references/testing-and-submission.md`, `manifest-and-packaging.md`, `checklist.md`(2026-11-17 확인, CLI 0.2.0).

## 시험 네 단계

시뮬레이터에서 시작해 실기기로 옮긴다.

| 단계 | 방법 | 확인할 것 | 놓치는 것 |
|---|---|---|---|
| 시뮬레이터 ([공식](https://hub.evenrealities.com/docs/test/simulator)) | `evenhub-simulator http://localhost:5173` | 배치, 문구, 이벤트 로직, `--automation-port`로 CI | 하드웨어 타이밍, BLE, 실제 글꼴·회색조, 권한, 백그라운드 수명주기 |
| 실기기 QR ([공식](https://hub.evenrealities.com/docs/test/local-testing)) | `evenhub qr --url "http://<LAN IP>:5173"`, Even 앱 개발자 모드에서 스캔 | 실제 입력, 기기 API, 안경에서 HMR | 백그라운드·잠금, 패키징, 일부 권한 창 |
| Private 빌드 ([공식](https://hub.evenrealities.com/docs/test/private-testing)) | `evenhub pack` 후 업로드, Me → Apps → Private builds에서 설치 | manifest 검증, 실제 권한 창, 설치 흐름 | 5분 잠금 시험, 다른 시험자, 안경 메뉴 진입 |
| Beta 빌드 ([공식](https://hub.evenrealities.com/docs/test/beta-testing)) | 업로드 후 `evenhub promote <version> --to beta`, 시험자 상태 Active | 심사와 같은 조건, 잠긴 휴대폰, 안경 메뉴 | - |

```sh
npm run dev
evenhub-simulator http://localhost:5173
evenhub qr --url "http://<내 PC의 LAN IP>:5173"
```

- 시뮬레이터 디버깅: `RUST_LOG=debug evenhub-simulator <url>`로 받은 호출을 본다. WebView를 우클릭해 Inspect Element로 콘솔을 연다.
- 시뮬레이터 자동화 API(0.7.0+): `GET /api/ping`, `GET /api/screenshot/glasses`, `GET /api/console`, `POST /api/input`(동작: `up`, `down`, `click`, `double_click`, `long_press`, `long_press_release`, `context_menu`).
- QR 연결 문제는 대개 방화벽이나 Wi-Fi 클라이언트 격리다. 같은 Wi-Fi를 쓰고 Vite HMR 호스트를 LAN IP로 고정한다.
- Beta 설치에서 "Test version expired"는 빌드가 Beta로 승격되지 않았거나 시험자가 아직 Invited 상태라는 뜻이다.

## `app.json` ([패키징](https://hub.evenrealities.com/docs/ship/packaging), [버전 정책](https://hub.evenrealities.com/docs/reference/versioning))

`evenhub init`이 기본 manifest를 쓴다. 템플릿 값을 그대로 제출하지 않는다([knowhow.md](knowhow.md) KH-051).

| 필드 | 규칙 |
|---|---|
| `package_id` | 역도메인, 2단 이상. 각 단은 소문자로 시작하고 소문자·숫자만, 하이픈 없음. 전역 고유 |
| `edition` | `"202601"`(현재 판) |
| `name` | 20자 이하. 스토어 목록·안경 표시 이름과 같아야 한다. 'Even'을 넣지 않는다 |
| `version` | `x.y.z` |
| `min_sdk_version` | 필수. 설치한 SDK 버전(`npm list @evenrealities/even_hub_sdk`) |
| `entrypoint` | 빌드 폴더 안 HTML 경로, 예: `index.html` |
| `permissions` | `{ name, desc, whitelist? }` 객체 배열. `[]` 가능. 키-값 맵이 아니다 |
| `supported_languages` | `en, de, fr, es, it, zh, ja, ko` 중에서 |

- `min_app_version`은 선택이다. CLI 0.1.14+는 pack 때 SDK 버전에서 Even App 하한을 계산한다.
- 권한 이름: `network`(`whitelist`에 전체 출처, 와일드카드 없음), `location`, `g2-microphone`, `phone-microphone`, `album`, `camera`. `desc`는 1–300자.
- 코드가 쓰는 권한만 선언한다. 안 쓰는 권한은 심사에서 지적된다.

## 빌드와 패키징

```sh
npm run build
evenhub pack app.json dist -o my-g2-app.ehpk --sdk-ver <설치한 SDK 버전>
evenhub pack app.json dist -o my-g2-app.ehpk -c   # package_id 사용 가능 여부도 확인
evenhub upload my-g2-app.ehpk -m "바뀐 점"         # CLI 0.2.0+, 또는 포털에서 업로드
```

- `--sdk-ver` 없이 pack하면 CLI가 npm 최신 SDK를 읽어 번들한 버전과 다른 하한이 정해질 수 있다.
- `--enforce-manual-version`은 제출할 수 없는 로컬 전용 빌드를 만든다.
- 비밀값(API 키·토큰)을 패키지에 넣지 않는다. 직접 운영하는 서버 프록시를 거치고 그 출처를 허용 목록에 넣는다.
- SDK는 1.0 이전이다. 새 기능도 0.0.x 패치로 나온다. 올리기 전에 [변경 기록](https://hub.evenrealities.com/docs/reference/changelog)을 읽는다.
- `min_sdk_version`을 미리 올리지 않는다. 옛 펌웨어 사용자가 막힌다.
- 게시한 버전은 고칠 수도 되돌릴 수도 없다. 더 높은 버전으로 다시 낸다.

## 심사 요점 ([제출과 심사](https://hub.evenrealities.com/docs/ship/app-submission))

- Beta 설치에서 휴대폰 5분 잠금 시험: 상태 유지, 스피너·검은 화면 없음.
- 루트 더블탭은 시스템 종료 창(`shutDownPageContainer(1)`)을 띄우고, 확인하면 휴대폰 WebView가 닫힌다.
- 선언한 권한은 모두 실제로 쓴다. 거부했을 때 앱이 계속 동작한다. 개인정보처리방침이 모든 권한을 설명한다.
- 설정이 필요한 첫 실행은 안경에서 안내하고, 설정은 다시 열어도 남는다.
- 종료 뒤 1st-party 앱(예: Conversate)이 안경 재시작 없이 열린다.
- 스토어 아이콘: 24×24, 1비트, 2×2 픽셀 블록으로 만든다. 스크린샷은 시뮬레이터에서 찍는다. 이름은 `app.json`과 같다.
- 의료 진단, 금융 조언, 긴급 연결을 하지 않는다. 사칭하지 않는다.
- 새 버전마다 지원 언어별로 비어 있지 않은 릴리스 노트.
- 심사 제출과 게시는 개발자 포털(hub.evenrealities.com)에서 한다.

## 자주 하는 실수

- `await waitForEvenAppBridge()` 전에 SDK 호출 → 빈 화면.
- `isEventCapture: 1` 컨테이너가 없거나 둘 이상 → 입력 없음 또는 검증 오류.
- DOM 클릭을 듣는다. 탭의 `eventType`이 `undefined`일 수 있음을 잊는다.
- `textContainerUpgrade`의 `containerID`/`containerName` 불일치 → 조용히 무시.
- `menuObject` 없이 rebuild → 메뉴 항목 사라짐.
- 한 페이지에서 일부 컨테이너만 `zOrderIndex` 지정.
- 페이지 생성 중 이미지 전송, `updateImageRawData` 동시 호출.
- 루트 페이지에서 `shutDownPageContainer(0)`이나 자체 종료 화면.
- 허용 목록을 CORS 우회로 착각.
- `permissions`를 객체 맵으로 쓴다. 안 쓰는 권한 선언.
- 앱에 API 키 번들.
- HMR 뒤 `createStartUpPageContainer`를 다시 부른다(rebuild해야 한다).
- 설정을 브라우저 `localStorage`에 둔다(`bridge.setLocalStorage`를 쓴다).
- 브리지 호출에 시간 제한이 없거나 여러 개를 동시에 부른다.
- 템플릿 `app.json`을 그대로 제출.
- 의존성을 포함한 번들 어디에든 `new Function`이나 `eval`.
- `--sdk-ver` 없이 pack.
- 타이밍·글꼴·잠금 동작을 시뮬레이터로 판단.
- 상태를 메모리에만 둔다(Android가 WebView를 멈출 수 있다).

## 제출 전 점검

0. 앱 분야가 개발자 약관상 게시 가능한지 확인한다(금융, 건강, 교육, 메시징, 아동 대상은 현재 제외).
1. `npm run build` 후 `evenhub pack app.json dist -o app.ehpk -c --sdk-ver <설치 버전>`.
2. 업로드 → Beta 승격 → 시험자 초대 수락(Active) → Me → Beta tester에서 설치.
3. 휴대폰을 5분 잠근다. 앱 상태가 남는다.
4. 루트 더블탭에 시스템 종료 창이 뜨고 WebView가 닫힌다. 취소한 뒤 이미지·마이크가 아직 되는지 본다(KH-019).
5. 권한을 하나씩 거부한다. 앱이 설명하고 계속 동작한다.
6. 종료 뒤 1st-party 앱이 안경 재시작 없이 열린다.
7. 시작 때 콘솔이 깨끗하고 로그에 비밀값이 없다.
8. 포털에 개인정보처리방침, 아이콘, 스크린샷, 릴리스 노트를 준비한다.

## AI에게 요청하는 법 ([ask](https://evenhub.kr/ai-dev/ask))

화면에 무엇을 보일지, 어떤 터치로 무엇이 바뀔지, 어떤 권한이 필요한지를 안경 기준으로 함께 적는다. 예:

- "Even G2용 타이머 앱을 공식 minimal 템플릿으로 만들어 줘. 한 번 누르면 시작·정지, 길게 누르면 초기화, 첫 화면에서 두 번 누르면 시스템 종료 확인이 뜨게. 시작 전에 SDK 버전부터 확인해 줘."
- "지금 app.json을 심사 기준으로 점검해 줘. 쓰지 않는 권한, 빠진 필수 항목, 비밀값이 번들에 들어가는지 알려 줘."
- "시뮬레이터 자동화 API로 화면을 찍고, 글자가 잘리거나 지원하지 않는 문자가 있는지 확인해 줘. 실기기에서 다시 볼 부분은 따로 적어 줘."
- "개발 노하우의 탭 이벤트 정규화를 지켜 줘"처럼 [knowhow.md](knowhow.md) 항목을 함께 적어도 된다.

## 공유

시뮬레이터 화면이나 실기기 사진과 함께 [쇼케이스](https://evenhub.kr/showcase)에 올리고, 막힌 곳은 [대화 게시판](https://evenhub.kr/forum)에 묻는다.
