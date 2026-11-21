---
title: "Build: 기기 API·컨텍스트 메뉴·네트워킹·백그라운드"
status: draft
updated: 2026-11-21
owner: dev
summary: "공식 Build 문서 요약: 기기 API, 컨텍스트 메뉴, 네트워킹, 백그라운드"
---

# Build: 기기 API·컨텍스트 메뉴·네트워킹·백그라운드

출처: 공식 문서 (2026-11-21 읽음)

공식 "Build" 섹션 요약의 두 번째 파일이다. 수명주기·화면·디자인은 [build.md](build.md)에 있다.

## 기기 API ([build/device-apis](https://hub.evenrealities.com/docs/build/device-apis))

### 입력 소스

| 소스 | 제스처 / 데이터 | 비고 |
|---|---|---|
| Even G2 터치패드(관자놀이) | 누름, 두 번 누름, 위로 스와이프, 아래로 스와이프, 길게 누름과 뗌 | 안경 프레임의 주 입력 |
| Even R1 터치패드(링) | G2와 같은 제스처 세트 | 소스로 구분된다 |
| IMU(가속도계 / 자이로) | 머리 방향, 움직임 데이터 | 아래 IMU 참고 |

G2와 R1 이벤트는 같은 이벤트 타입을 쓰지만 소스가 다르다. 안경 입력과 링 입력을 다른 핸들러로 보낼 수 있다.

### 이벤트 타입 (`OsEventTypeList`)

| 이벤트 | 값 | 설명 |
|---|---|---|
| `CLICK_EVENT` | 0 | 한 번 누름(G2 또는 R1) |
| `SCROLL_TOP_EVENT` | 1 | 위로 스와이프 / 스크롤이 위 경계 도달 |
| `SCROLL_BOTTOM_EVENT` | 2 | 아래로 스와이프 / 스크롤이 아래 경계 도달 |
| `DOUBLE_CLICK_EVENT` | 3 | 두 번 누름(G2 또는 R1) |
| `LONG_PRESS_EVENT` | 9 | 길게 누름 시작(SDK 0.0.14+, Even App 2.2.9+) |
| `LONG_PRESS_RELEASE_EVENT` | 10 | 그 길게 누름에서 뗌(SDK 0.0.14+, Even App 2.2.9+) |

- `IMU_DATA_REPORT`도 있다(숫자 값은 원문에 없음). `FOREGROUND_ENTER_EVENT`(`4`), `FOREGROUND_EXIT_EVENT`(`5`)는 컨텍스트 메뉴 절 참고.

### 길게 누름

길게 누름은 두 이벤트로 온다(SDK `0.0.14+`, Even App `2.2.9+`). 누를 때 하나, 손가락을 뗄 때 하나다.

```typescript
let pressStartedAt = 0

bridge.onEvenHubEvent(event => {
  // Both events arrive on sysEvent, whichever container is capturing.
  const type = event.sysEvent?.eventType

  if (type === OsEventTypeList.LONG_PRESS_EVENT) {
    pressStartedAt = Date.now()
    showChargingIndicator()
  }
  if (type === OsEventTypeList.LONG_PRESS_RELEASE_EVENT) {
    fire(Date.now() - pressStartedAt)
  }
})
```

- 두 이벤트는 캡처 컨테이너와 무관하게 항상 `event.sysEvent`로 온다. `eventSource`는 없다.
- 라우팅 표는 스크롤과 선택만 다룬다. 별도 구독 없이 같은 `onEvenHubEvent`로 온다.
- 누르는 중에 rebuild해도 `LONG_PRESS_RELEASE_EVENT`가 온다.
- OS는 "탭 후 길게 누름"을 메뉴로 쓴다. 이 쌍을 기능의 유일한 진입로로 쓰지 않는다.
- 시뮬레이터 `0.9.0+`는 창에서 길게 누름을 흉내 낸다. `0.9.1+`는 자동화 API로 두 이벤트를 보낸다(CI 가능).

### 이벤트 처리

```typescript
bridge.onEvenHubEvent(event => {
  const textEvent = event.textEvent
  if (textEvent) {
    const eventType = textEvent.eventType

    switch (eventType) {
      case OsEventTypeList.CLICK_EVENT:
      case undefined: // SDK normalizes 0 to undefined in some cases
        // Handle press
        break
      case OsEventTypeList.DOUBLE_CLICK_EVENT:
        // Handle double press
        break
      case OsEventTypeList.SCROLL_TOP_EVENT:
        // Handle swipe up / scroll up
        break
      case OsEventTypeList.SCROLL_BOTTOM_EVENT:
        // Handle swipe down / scroll down
        break
    }
  }

  // Long press never reaches the capturing container.
  // (원문은 여기서 event.sysEvent?.eventType 의 LONG_PRESS_EVENT / LONG_PRESS_RELEASE_EVENT 를 switch 한다. 위 길게 누름 예와 같다.)
})
```

### 이벤트 라우팅

`isEventCapture: 1`인 컨테이너가 이벤트 도착 위치를 정한다.

| 캡처 컨테이너 | 이벤트 필드 |
|---|---|
| 텍스트 컨테이너 | `event.textEvent` |
| 리스트 컨테이너 | `event.listEvent` |
| (무관) 컨텍스트 메뉴 선택 | `event.menuItemClickEvent` |
| (무관) 길게 누름 | `event.sysEvent`, `eventSource` 없음 |

### 오디오

안경의 마이크 4개 배열이나 휴대폰 마이크로 캡처한다. `audioControl(true, ...)`마다 소스를 고른다. 두 번째 인자를 빼면 안경이 기본이다.

```typescript
import { AudioInputSource, waitForEvenAppBridge } from '@evenrealities/even_hub_sdk'

const bridge = await waitForEvenAppBridge()

await bridge.audioControl(true, AudioInputSource.Glasses) // start - G2 mics
// await bridge.audioControl(true, AudioInputSource.Phone) // start - phone mic
await bridge.audioControl(false)                          // stop

bridge.onEvenHubEvent(event => {
  const audio = event.audioEvent
  if (!audio) return
  // audio.source: AudioInputSource.Glasses | AudioInputSource.Phone
  // audio.audioPcm: Uint8Array - PCM 16 kHz, signed 16-bit little-endian, mono
})
```

| 값 | 소스 | 비고 |
|---|---|---|
| `AudioInputSource.Glasses` | G2 마이크 4개 배열 | 기본값. `createStartUpPageContainer`가 먼저 실행되어야 한다. |
| `AudioInputSource.Phone` | 휴대폰 마이크 | 시작 페이지 조건 없음. WebView가 있는 휴대폰을 거친다. |

- 형식은 두 소스 모두 PCM 16 kHz, signed 16-bit little-endian, mono다. `source`가 출처 마이크를 알려준다.
- 권한: `Glasses`는 `g2-microphone`, `Phone`은 `phone-microphone`.

### 위치

- 한 번: `getAppLocation`. 연속: `startAppLocationUpdates` + `onAppLocationChanged`, 중지는 `stopAppLocationUpdates`.
- 휴대폰 위치 서비스를 읽는다. 호출 전에 `app.json` 권한에 `location`을 선언한다.

```typescript
import { AppLocationAccuracy, waitForEvenAppBridge } from '@evenrealities/even_hub_sdk'

const bridge = await waitForEvenAppBridge()

const fix = await bridge.getAppLocation({
  accuracy: AppLocationAccuracy.High,
  timeoutMs: 5000,
})

if (fix) {
  console.log(fix.latitude, fix.longitude)
}

// Continuous
await bridge.startAppLocationUpdates({
  accuracy: AppLocationAccuracy.Medium,
  intervalMs: 1000,
  distanceFilter: 5, // meters - host skips pushes smaller than this
})

const unsubscribe = bridge.onAppLocationChanged(loc => {
  console.log(loc.latitude, loc.longitude, loc.speed)
})

// Later:
await bridge.stopAppLocationUpdates()
unsubscribe()
```

- `getAppLocation`은 제때 위치가 없거나, 권한 거부, 좌표 오류면 `null`이다. 항상 null을 확인한다.
- `AppLocationOptions`: `accuracy`, `timeoutMs`(한 번 전용), `intervalMs`·`distanceFilter`(연속 전용, 미터). 모두 선택이고 생략하면 호스트가 기본값을 고른다.
- `AppLocationAccuracy`: `Low`(도시 수준, 배터리 최소), `Medium`(블록 수준, 균형 기본), `High`(최선, 배터리 최대).

`AppLocation` 형태:

| 필드 | 타입 | 비고 |
|---|---|---|
| `latitude` | number | 도 |
| `longitude` | number | 도 |
| `accuracy` | number? | 수평 정확도(미터) |
| `altitude` | number? | 해발 미터(있을 때) |
| `speed` | number? | 초당 미터(있을 때) |
| `heading` | number? | 진북 기준 도(있을 때) |
| `timestamp` | number? | Unix 밀리초(있을 때) |

### 사진

휴대폰 앨범에서 고르거나 휴대폰 카메라로 찍는다. 둘 다 한 장만 받고 `AppImageAsset` 하나를 반환한다. G2에는 카메라가 없다.

```typescript
const fromAlbum = await bridge.pickImageFromAlbum()      // requires `album` permission
const fromCamera = await bridge.captureImageFromCamera() // requires `camera` permission

if (fromAlbum) {
  // fromAlbum.base64 is ready to drop into an <img src="data:...">
}
```

- 취소나 권한 거부 시 둘 다 `null`이다. 앨범은 한 장만 고른다.
- `AppImageAsset`: `path`(string, 호스트 경로, WebView엔 불투명), `name`(string, 원래 파일명), `mimeType`(string, 예: image/jpeg), `size`(number, 바이트), `base64`(string, `<img>`에 바로 사용).
- 이미지는 base64로 온다. 12메가픽셀 JPEG은 수 MB라 `updateImageRawData`로 보내기 비싸다. 먼저 줄인다.

### IMU

`imuControl`이 움직임 데이터 스트림을 시작하고 멈춘다.

```typescript
import { waitForEvenAppBridge, ImuReportPace, OsEventTypeList } from '@evenrealities/even_hub_sdk'

const bridge = await waitForEvenAppBridge()

await bridge.imuControl(true, ImuReportPace.P500) // Start IMU reporting
// Listen for IMU data
const unsubscribe = bridge.onEvenHubEvent(event => {
  const sys = event.sysEvent
  if (!sys?.imuData) return
  if (sys.eventType !== OsEventTypeList.IMU_DATA_REPORT) return

  const { x, y, z } = sys.imuData
  console.log('IMU:', x, y, z)
})
await bridge.imuControl(false) // Stop IMU reporting
unsubscribe()
```

`imuControl(isOpen, reportFrq)`:

| 인자 | 타입 | 설명 |
|---|---|---|
| `isOpen` | boolean | `true` 시작, `false` 중지 |
| `reportFrq` | `ImuReportPace` | 보고 빈도 페이싱 코드. 중지 때는 선택이고 기본값은 `P100` |

- `ImuReportPace`: `P100`=100, `P200`=200, … `P1000`=1000(100 단위 10개). 프로토콜 페이싱 코드이며 Hz가 아니다.
- 샘플은 `Sys_ItemEvent`로 `event.sysEvent`에 온다. `eventType`은 `IMU_DATA_REPORT`다.
- `imuData.x`, `imuData.y`, `imuData.z`는 float다. `imuData`는 `IMU_Report_Data` protobuf다.
- `imuControl(true, ...)` 뒤 `imuControl(false)`까지 샘플이 계속 온다.

### 기기 정보, 사용자 정보, 로컬 저장소

```typescript
const info = await bridge.getDeviceInfo()
// Returns: model (G1/G2/Ring1), serial number, battery, wearing status, charging, in-case

bridge.onDeviceStatusChanged(status => {
  // Battery, wearing, charging updates
})

const user = await bridge.getUserInfo()
// Returns: uid, name, avatar, country

await bridge.setLocalStorage('key', 'value')
const value = await bridge.getLocalStorage('key')
```

원문은 기기·사용자·저장소의 정확한 필드명과 타입을 주석으로만 적는다. `*.d.ts`로 확인한다.

### OS 이벤트 모델

| 모델 | 설명 |
|---|---|
| `Text_ItemEvent` | 텍스트 컨테이너 이벤트 |
| `List_ItemEvent` | 리스트 컨테이너 이벤트 |
| `Sys_ItemEvent` | 시스템 이벤트. `eventType`, `eventSource`, `imuData`를 담는다 |
| `IMU_Report_Data` | `Sys_ItemEvent.imuData` 안의 IMU 샘플(x, y, z float) |
| `AudioEventPayload` | `event.audioEvent`의 마이크 데이터. `source`(`AudioInputSource.Glasses` \| `AudioInputSource.Phone`), `audioPcm`(`Uint8Array`) |
| `MenuItemClickEvent` | `event.menuItemClickEvent`의 메뉴 선택. 선언한 `itemID`를 담는다(SDK 0.0.14+) |
| `OsEventTypeList` | 이벤트 타입 enum. `CLICK_EVENT`, `DOUBLE_CLICK_EVENT`, `SCROLL_TOP_EVENT`, `SCROLL_BOTTOM_EVENT`, `IMU_DATA_REPORT`, `LONG_PRESS_EVENT`, `LONG_PRESS_RELEASE_EVENT` 포함 |
| `ImuCtrlCmd` / `ImuCtrlCmdResponse` | `imuControl`이 내부에서 쓰는 protobuf 명령/응답 맵 |

### SDK 레퍼런스와 한계

- 시그니처, 인자 타입, 반환값, 이벤트 페이로드의 정본은 npm `@evenrealities/even_hub_sdk`의 `*.d.ts`다.
- 없는 것: 블루투스 직접 접근, 임의 픽셀 그리기, 오디오 출력, 텍스트 정렬, 글꼴 제어, 배경색.
- 없는 것: 리스트 항목별 스타일, 프로그램 스크롤 위치, 애니메이션, 안경 카메라. 이미지는 회색조만.
- 휴대폰 카메라는 `captureImageFromCamera`로 쓴다.
- 엔터프라이즈(2B)·정부(2G) 요구는 software@evenrealities.com 으로 문의한다.

## 컨텍스트 메뉴 ([build/contextual-menu](https://hub.evenrealities.com/docs/build/contextual-menu))

- 앱은 OS가 "탭 후 길게 누름"에 띄우는 메뉴에 항목을 더할 수 있다(SDK `0.0.14+`, Even App `2.2.9+`).
- 각 항목은 액션이다. 선택하면 앱이 이벤트 하나를 받고 메뉴가 닫힌다.
- `createStartUpPageContainer`나 `rebuildPageContainer`에 `menuObject`를 붙여 선언한다. OS가 보관하고 WebView를 깨우지 않고 그린다.

### 슬롯

| 슬롯 | 소유 | 비고 |
|---|---|---|
| Display off(맨 위) | 시스템 | 항상 있음. SDK로 접근 불가 |
| Brightness | 시스템 | 항상 있음. OS가 전부 처리하고 앱에 알리지 않는다. 전역 밝기이며 `textColor`와 무관 |
| 앱 액션 항목 | 앱 | `menuObject`로 선언, 최대 10개 |
| Close [app name](맨 아래) | 시스템 | 항상 있음. SDK로 접근 불가. 앱 이름을 넣어 "Close Timer"처럼 보인다 |

- 선언하지 않아도 시스템 항목은 나온다. 앱 항목은 선언한 페이지가 살아 있는 동안만 있다.
- 행 수를 세지 않는다. 시스템 항목은 펌웨어마다 늘 수 있다. 목록만 넘기고 슬롯은 지정하지 않는다.

### 메뉴 선언

```typescript
import { waitForEvenAppBridge } from '@evenrealities/even_hub_sdk'

const bridge = await waitForEvenAppBridge()

await bridge.createStartUpPageContainer({
  containerTotalNum: 1,
  textObject: [{
    xPosition: 0, yPosition: 0, width: 576, height: 288,
    containerID: 1, containerName: 'main',
    content: 'Timer running', isEventCapture: 1,
  }],
  menuObject: {
    menuItems: [
      { itemName: 'Restart', itemID: 1 },
      { itemName: 'Recenter', itemID: 2 },
    ],
  },
})
```

`menuItems[]` 필드:

| 필드 | 타입 | 필수 | 비고 |
|---|---|---|---|
| `itemName` | string | 예 | OS가 그리는 라벨. 최대 32 UTF-8 바이트(32자가 아님) |
| `itemID` | number | 예 | 0이 아닌 uint32. 메뉴 안에서 고유. 클릭 이벤트로 돌아온다 |

- `itemID` `0`은 프로토콜 예약이다. `1`부터 쓴다.
- 순서 필드는 없다. 배열(페이로드) 순서대로 그린다.
- `MenuItemProperty`는 `itemName`, `itemID`만 가진다. `toJson()`이 다른 속성을 버린다.

### 선택 처리

선택한 항목은 `onEvenHubEvent`의 `menuItemClickEvent`로 온다. 담긴 것은 `itemID`뿐이다.

```typescript
const handlers: Record<number, () => void> = {
  1: () => restartTimer(),
  2: () => recenterView(),
}

const unsubscribe = bridge.onEvenHubEvent(event => {
  const itemID = event.menuItemClickEvent?.itemID
  if (itemID === undefined) return

  handlers[itemID]?.()
})
```

- 메뉴 클릭은 `isEventCapture`를 거치지 않는다. `menuItemClickEvent`는 독립된 최상위 필드다.
- 어느 컨테이너가 캡처하든 오며, 같은 `onEvenHubEvent` 구독에서 처리한다.

### 메뉴는 전경 오버레이

- 열면 `FOREGROUND_ENTER_EVENT`(`4`), 닫으면 `FOREGROUND_EXIT_EVENT`(`5`)가 온다.
- 선택 순서: `FOREGROUND_ENTER_EVENT` -> `menuItemClickEvent` -> `FOREGROUND_EXIT_EVENT`.
- 이때 `FOREGROUND_EXIT_EVENT`는 오버레이가 사라졌다는 뜻이다. 페이지는 계속 마운트되어 있다.
- 전경 종료에서 타이머 중지·구독 해제를 하면 메뉴를 열 때마다 실행된다.
- 핸들러를 멱등으로 만들거나, "오버레이 닫힘"과 "사용자가 떠남"을 구분한다.

### 보내고 잊기 전용

- 안경은 항목 상태를 보관하거나 다시 그리지 않는다. 앱에서 메뉴로 가는 확인 경로도 없다.
- `Status: high` 라벨은 값이 바뀌어도 그대로다. 라벨이 상태를 따라야 하면 메뉴를 다시 선언한다.

```typescript
async function setQuality(next: 'high' | 'low') {
  quality = next

  await bridge.rebuildPageContainer({
    containerTotalNum: 1,
    textObject: [/* ... */],
    menuObject: { menuItems: [{ itemName: `Quality: ${quality}`, itemID: 1 }] },
  })
}
```

라벨을 상태 표시가 아닌 동사(`Restart`, `Skip`, `Mute`)로 지으면 이 문제가 없다.

### 갱신과 삭제

`menuObject`는 병합되지 않고 통째로 교체된다.

| 호출 | 메뉴에 미치는 영향 |
|---|---|
| `menuObject`가 있는 `rebuildPageContainer` | 보낸 내용으로 메뉴 전체 교체 |
| `menuObject`가 없는 `rebuildPageContainer` | 앱 항목 삭제. 시스템 항목은 남음 |

rebuild에서 `menuObject`를 빼면 메뉴도 사라진다. 유지할 rebuild마다 명시적으로 넘긴다. 원문 예의 주석: "Clears the custom menu, restores default registration".

### 검증

SDK가 보내기 전에 검사한다. 위반 시 `EvenHubPageContainerValidationErrorCode`를 로그로 남긴다. `createStartUpPageContainer`는 `StartUpPageCreateResult.invalid`, `rebuildPageContainer`는 `false`를 반환한다. 일부만 펌웨어에 가는 일은 없다.

| 코드 | 원인 |
|---|---|
| `TOO_MANY_MENU_ITEMS` | `menuItems`가 10개 초과 |
| `INVALID_MENU_ITEM_ID` | `itemID`가 0, 음수, 정수 아님, uint32 범위 밖 |
| `DUPLICATE_MENU_ITEM_ID` | 같은 `itemID`를 두 번 사용 |
| `INVALID_MENU_ITEM_NAME` | `itemName`이 32 UTF-8 바이트 초과 |

### 버전 조건

- SDK `0.0.14`와 Even App `2.2.9`가 필요하다. 더 오래된 앱에서는 선언이 조용히 무시되고 시스템 항목만 나온다.
- SDK `0.0.14`로 빌드하면 CLI가 패키징 때 `2.2.9` 하한(`min_app_version`)을 찍는다. 오래된 앱은 열 때 차단된다.

### 시험

- 시뮬레이터 `0.9.0+`가 메뉴를 그린다. 창에서 탭 후 길게 누르면 뜬다.
- 자동화 API: `POST /api/input`에 `{"action":"context_menu"}`로 토글, `up` / `down`으로 포커스, `click`으로 `menuItemClickEvent`.
- 시뮬레이터도 rebuild 규칙을 따른다.
- 차이: 열린 메뉴 아래에서 rebuild해도 오버레이가 닫히지 않는다. 보이는 메뉴가 선언보다 오래 남을 수 있다.
- 펌웨어별 시스템 슬롯 구성은 시뮬레이터로 확인할 수 없다.

### 디자인 메모

- 32 UTF-8 바이트다. ASCII는 32자, CJK는 글자당 3바이트라 중국어 라벨은 약 10자다.
- 슬롯당 한 줄이고 줄바꿈이 없다. ASCII 약 16자 미만이 깔끔하다.
- 10개는 상한이지 목표가 아니다. 5~6개를 넘기지 않는다.
- 현재 화면에서 닿지 않는 기능만 넣는다. 자체 종료 항목은 넣지 않는다(닫기는 시스템 슬롯).
- 루트 페이지 더블탭 계약(App Submission)은 그대로 필수다.

## 네트워킹 ([build/networking](https://hub.evenrealities.com/docs/build/networking))

- 플러그인은 휴대폰 WebView 안에서 `fetch()`, `XMLHttpRequest`, WebSocket을 쓴다.
- 모든 외부 요청 앞에 독립된 관문 두 개가 있다. "로컬에선 되고 기기에선 실패" 버그 대부분이 이 둘의 혼동이다.

### 두 관문

| 관문 | 내용 |
|---|---|
| Even 측 권한 검사 | 대상 도메인이 `app.json`의 `network` 권한 `whitelist`에 있어야 한다. Even Realities App이 WebView를 떠나기 전에 막는다. 목록에 없으면 트래픽이 전혀 생기지 않는다. |
| 브라우저 CORS 검사 | WebView 엔진(Android는 Chromium, iOS는 WKWebView)이 표준 CORS를 적용한다. 서버가 올바른 `Access-Control-Allow-Origin` 등을 돌려줘야 한다. 아니면 `fetch()`가 끝나기 전에 응답이 버려진다. |

허용 목록은 CORS 우회가 아니다. 도메인에 접근해도 된다는 허가일 뿐이다. 서버 CORS 헤더가 틀리면 브라우저는 응답을 여전히 버린다.

### 허용 목록 선언

```json
"permissions": [
  {
    "name": "network",
    "desc": "Fetches weather data and stores user preferences in the cloud.",
    "whitelist": [
      "https://api.weather.com",
      "https://prefs.example.com"
    ]
  }
]
```

- origin마다 항목 하나, 전체 origin(`https://api.example.com`)을 쓴다. 호스트명만·와일드카드는 미지원이다.
- 프로덕션은 HTTPS다. `http://`는 LAN 개발 서버 대상 로컬 개발용이다.
- 전체 스키마: Packaging & Deployment → Permissions Format.

### 서버 측 필수 CORS 헤더

최소한 다음을 돌려줘야 한다.

```http
Access-Control-Allow-Origin: *
# or specifically the WebView origin if you can identify it
```

커스텀 헤더, JSON 본문, `GET`/`POST` 외 메서드는 프리플라이트도 처리한다.

```http
# Response to the OPTIONS preflight
HTTP/1.1 204 No Content
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Max-Age: 86400
```

제3자 API의 CORS를 못 고치면 직접 관리하는 서버로 프록시한다. 그 서버 도메인을 허용 목록에 넣는다.

### 디버깅 체크리스트

기기에서 요청이 실패하면 순서대로 본다.

1. 도메인이 `app.json` `network.whitelist`에 있는가? 바꿨다면 다시 패키징하고 업로드한다.
2. 응답에 `Access-Control-Allow-Origin`이 있는가? 없거나 origin과 안 맞으면 서버에서 고친다.
3. 프리플라이트(`OPTIONS`)가 2xx와 올바른 `Allow-Methods` / `Allow-Headers`를 돌려주는가? JSON 본문과 커스텀 헤더에만 해당한다.
4. 같은 요청이 `curl`에서 되는가? `curl`은 되고 WebView는 안 되면 거의 항상 CORS다.

## 백그라운드와 수명주기 ([build/background-lifecycle](https://hub.evenrealities.com/docs/build/background-lifecycle))

앱은 Even Realities App이 호스팅하는 WebView다. 휴대폰이 그 앱을 백그라운드로 보내거나 화면이 잠기면 iOS와 Android가 크게 다르게 동작한다.

| 플랫폼 | 엔진 | Even 앱이 백그라운드일 때 |
|---|---|---|
| iOS | WKWebView | 깨끗하다. WebView가 계속 돈다. 메모리 JS 상태가 남는다. 특별한 처리가 필요 없다. |
| Android | Chromium WebView | 메모리 압박 시 일시 중단될 수 있다. OS 임계치 아래면 계속 돈다. 넘으면 프로세스가 회수되고 메모리 상태가 사라진다. |

### 살아남는 것과 사라지는 것

| 자원 | 백그라운드 / 잠금 시 | 비고 |
|---|---|---|
| `localStorage` | 항상 남는다(디스크에 저장) | 잃으면 안 되는 상태에 안전 |
| 메모리 JS 상태 | iOS: 남음. Android: 중단되면 사라질 수 있음 | 재실행 때 `localStorage`에서 다시 만든다 |
| 열린 WebSocket | iOS: 대개 유지. Android: 중단되면 대개 끊김 | close 이벤트를 처리하고 재실행 때 다시 연결 |
| `audioControl(true, ...)` 캡처 | WebView가 중단되면 멈춘다 | 전경 복귀 때 같은 `AudioInputSource`로 다시 켠다. 스트림이 살아 있다고 가정하지 않는다 |
| `startAppLocationUpdates(...)` 스트림 | WebView가 중단되면 멈춘다 | 전경 복귀 때 다시 건다. 기다리는 동안 `localStorage`의 캐시 위치를 그려도 된다 |

- Android 중단은 "콜드 스타트"로 취급한다. 중요한 것은 `localStorage`에 바로 저장한다.
- 불명확: 원문은 `localStorage`라고만 적는다. 브리지 `setLocalStorage`와의 관계는 말하지 않는다.
- 베타 잠금 화면 점검(베타 설치, 5분 잠금, 재실행)이 이 Android 버그를 잡는다. 상태 손실, 죽은 소켓, 캡처 미복구는 실패다.
