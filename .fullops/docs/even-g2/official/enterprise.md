---
title: Even G2 Enterprise SDK
status: draft
updated: 2026-11-21
owner: dev
summary: "공식 Enterprise 문서 요약: 라이선스, 설치, 연결, OTA, 네이티브"
---

# Even G2 Enterprise SDK

출처: 공식 자료 (2026-11-21 읽음)

## 개요

출처: https://hub.evenrealities.com/docs/enterprise/index (Last updated: 2026-11-10)

- Enterprise SDK는 Even G2용 자체 Android·iOS 앱을 만드는 SDK다.
- Flutter 패키지로 제공된다. 네이티브 Kotlin·Swift SDK도 있다.
- 앱이 연결하는 안경마다 라이선스가 필요하다. 포털의 Enterprise 섹션에서 받는다.

진행 순서:

1. 알파를 신청한다.
2. 안경을 등록하고 라이선스를 받는다 (Devices and licenses).
3. SDK와 라이선스 파일을 앱에 넣는다 (Flutter 또는 Native).
4. 안경에 연결한다 (Connect glasses).
5. 디스플레이에 내용을 띄운다 (EvenHub pages).
6. 앱에서 펌웨어를 업데이트한다 (Firmware updates).

### 알파 제한

- Enterprise SDK는 알파 단계다. 신청제로 소수 팀에 먼저 연다.
- 라이선스는 Enterprise 펌웨어 안경에서만 동작한다. 이 펌웨어는 아직 공개 배포되지 않는다.
- 알파 기간에는 무료 라이선스 3개를 주지 않는다. 승인 계정에 Even이 직접 추가한다.

### 신청 방법

1. hub.evenrealities.com/login에 Even Realities 계정으로 로그인한다.
2. 왼쪽 메뉴에서 Enterprise를 연다.
3. Apply를 누른다. 메일 주소 `enterprisesolutions@evenrealities.com`이 보인다.
4. 팀 소개와 사용할 안경 수를 메일로 보낸다.

### 승인 후

- 로그인한 계정의 안경으로 Enterprise 펌웨어를 보내고, 계정에 라이선스를 추가한다.
- Enterprise 페이지에 라이선스 수가 표시된다. 이후 기기를 추가할 수 있다.

## 기기와 라이선스

출처: https://hub.evenrealities.com/docs/enterprise/licenses (Last updated: 2026-11-10)

라이선스 1개 = 안경 1대 × 앱 1개.
안경 시리얼 번호와 앱 ID(Android application ID 또는 iOS bundle ID)의 쌍이다.

### 규칙

| 항목 | 내용 |
|---|---|
| 소모 단위 | 시리얼 번호 + 앱 ID 쌍마다 1개 |
| 만료 | 없음 |
| 같은 안경에 다른 앱 추가 | 라이선스 1개 추가 소모 |
| 반환·삭제 | 라이선스 반환 불가, 기기 삭제 불가 |
| 사용량 표시 | Enterprise 페이지 상단에 사용/전체 표시 |

### 약관 동의

- 기기 추가와 라이선스 다운로드 전에 Enterprise SDK License Terms에 동의해야 한다.
- 동의 전까지 약관 패널이 계속 보인다.
- 동의하고 라이선스가 남아 있어야 Add device와 Import CSV가 나타난다.

### 기기 1대 추가

1. Add device를 누른다.
2. Serial number를 입력한다. 안경 상자에 인쇄돼 있다. 형식은 `S000XXXX000000`이다.
3. App ID를 입력한다. 예: `com.example.app`. 기존 앱 ID는 원클릭으로 고를 수 있다.
4. Next를 누른다.
5. 상자 라벨과 대조해 시리얼을 다시 입력한다. Use 1 license and add를 누른다.

- 이미 그 앱 ID로 등록된 안경이면 포털이 알려준다. 라이선스는 소모되지 않는다.

### CSV 일괄 등록

- 한 앱에 여러 안경을 한 번에 추가할 때 쓴다.
- UTF-8, 단일 열이다.
- 1행은 헤더 `sn`이다. 이후 한 행에 시리얼 하나다.
- 파일당 최대 500행이다.
- 파일의 모든 기기에 입력한 앱 ID 하나가 붙는다.

```
sn
S000ABCD000001
S000ABCD000002
```

절차:

1. Import CSV를 누른다.
2. App ID를 입력하고 Choose file로 CSV를 고른다.
3. Continue를 누른다. 미리보기가 신규·기존·중복·비시리얼 행을 센다. 거부 행도 보여준다.
4. 신규 시리얼을 상자와 대조한다. 사용할 라이선스 수를 입력한다. Use N licenses and add를 누른다.

- 신규 기기만 라이선스를 소모한다.
- 라이선스가 모자라면 미리보기가 부족 수를 알려준다.
- 그만큼 신규 행을 빼거나 영업팀에 추가 라이선스를 요청한다.

### 라이선스 다운로드

1. Download licenses를 누른다.
2. 앱을 고른다.
3. Download를 누른다.

결과 파일은 `<app ID>.licenses.json` 하나다.

```json
{
  "format": "enterprise-sdk-license-v1",
  "app_id": "com.example.app",
  "licenses": [
    { "sn": "S000ABCD000001", "signature": "<signature>" },
    { "sn": "S000ABCD000002", "signature": "<signature>" }
  ]
}
```

- 앱에 포함하거나 자체 백엔드에서 전달한다.
- 파일은 다운로드 시점의 기기만 포함한다. 기기를 추가하면 다시 받는다.
- 라이선스를 다 쓰면 Contact sales가 뜬다. 계정·라이선스 수가 채워진 메일이 열린다.

## SDK 설치

출처: https://hub.evenrealities.com/docs/enterprise/install (Last updated: 2026-11-10)

- Flutter용 패키지 이름은 `even_devices_native`다. 네이티브 SDK 위의 Flutter 어댑터다.
- 네이티브 SDK가 Bluetooth 연결, 기기 인가, 디스플레이 명령, 마이크 오디오, 펌웨어 업데이트를 맡는다.

### Flutter

- Flutter 3.32 이상이 필요하다.
- `pubspec.yaml`에 추가하고 `flutter pub get`을 실행한다.

```yaml
dependencies:
  even_devices_native:
    git:
      url: https://github.com/even-realities/flutter_enterprise_sdk.git
      ref: ea53058edac83a6d7ecc6406593ab383c1f41e48
```

- 검토된 커밋에 고정한다.
- 두 네이티브 SDK 의존성은 `0.1.0-beta.14`다.
- 첫 빌드에서 의존성을 받는다. 네트워크가 필요하다.
- 진입점은 `import 'package:even_devices_native/even_devices_native.dart';` 하나다.

### Android 요구사항

- 네이티브 SDK: `com.evenrealities.devices:even-devices-native-android:0.1.0-beta.14` (Maven Central)
- 저장소에 `google()`, `mavenCentral()`이 있어야 한다.

| 항목 | 값 |
|---|---|
| minSdk | 21 (Android 5.0) 이상 |
| compileSdk | 36 |
| Java / Kotlin | 17 |
| NDK | `27.0.12077973` |

패키지 매니페스트가 이미 선언한 권한:

- `BLUETOOTH_SCAN`, `BLUETOOTH_CONNECT`
- Android 11 이하: `BLUETOOTH`, `BLUETOOTH_ADMIN`
- Android 11 이하: `ACCESS_FINE_LOCATION`, `ACCESS_COARSE_LOCATION` (스캔 전용)

- 스캔 전에 `requestBluetoothPermissions()`를 호출한다.
- 현재 Activity에서 런타임 권한을 요청하고 허용 여부를 돌려준다.
- Bluetooth를 켜지는 않는다.
- Android 11 이하는 시스템 위치 서비스도 켜야 스캔된다.

### iOS 요구사항

- iOS 15 이상이 필요하다. Swift Package Manager만 지원한다. CocoaPods 대체 경로는 없다.
- 빌드 전에 `flutter config --enable-swift-package-manager`를 실행한다.
- 한 번만 켜려면 `FLUTTER_SWIFT_PACKAGE_MANAGER=true flutter build ios`를 쓴다.
- 첫 빌드가 `FlutterGeneratedPluginSwiftPackage`와 준비 스크립트를 Xcode 프로젝트에 추가한다.
- 생성된 Xcode 프로젝트, 공유 scheme 변경, `Package.resolved`를 커밋한다.
- 기존 CocoaPods 앱은 다른 플러그인용 Pods를 유지해도 된다.
- `Info.plist`에 `NSBluetoothAlwaysUsageDescription`을 추가한다. 권한 프롬프트는 `initialize` 때 뜬다.
- iOS의 `requestBluetoothPermissions()`는 프롬프트 진행 가능 여부만 돌려준다. 사용자 선택은 모른다.

### 라이선스 파일

- 포털에서 앱 ID용 파일을 받아 asset으로 넣는다. 예: `assets/com.example.app.licenses.json`
- 내용을 `initialize`에 넘긴다.
- 자체 백엔드에서 받아 같은 방식으로 넘겨도 된다.
- 파일에는 서명만 들어 있다.
- 포털 계정 자격 증명은 절대 앱에 넣지 않는다.

### 오픈소스 고지

- SDK 라이선스는 Apache License 2.0이다.
- 저장소의 `LICENSE`, `NOTICE`, `THIRD_PARTY_NOTICES.md`를 참고한다.

## 안경 연결

출처: https://hub.evenrealities.com/docs/enterprise/connect (Last updated: 2026-11-10)

- 모든 작업은 `EvenDevicesNative.instance` 객체 하나와 이벤트 스트림 하나로 한다.
- 메서드는 요청 제출 시 반환한다. 연결·시간 동기화·페이지 결과는 나중에 이벤트로 온다.

### 흐름

1. `events`를 구독한다.
2. Bluetooth 권한을 요청한다.
3. 라이선스 파일로 초기화한다.
4. 스캔해서 안경 좌우 양쪽을 모은다.
5. 연결한 뒤 기기 전체가 ready가 될 때까지 기다린다.
6. 명령을 보낸다.

### 단계별 요점

- **구독 먼저**: SDK는 지난 이벤트를 재생하지 않는다. 늦게 붙인 리스너는 놓친다.
- **initialize**: `namespace`와 `licenseJson`을 넘긴다.
  - `namespace`는 모든 이벤트에서 세션을 식별한다. 예: 로그인한 사용자.
  - `licenseJson`은 파일 전체 텍스트다. 무효하면 `PlatformException`을 던진다.
- **scan**: `await sdk.scan()`. 중지는 `await sdk.stopScan()`.
  - `discovery` 이벤트는 `sn`과 `devices`를 담는다.
  - 각 device에는 `side`(`left`/`right`), `address`, `name`이 있다.
  - 좌우가 다른 이벤트로 올 수 있다.
  - 발견된 기기는 아직 인가되지 않은 상태다.
- **connect**: 양쪽이 보이면 `connectG2(sn:, left:, right:)`를 호출한다.
  - Android는 스캔된 양쪽이 모두 필요하다.
  - iOS는 양쪽 모두 또는 둘 다 생략한다. 생략하면 자체 스캔 결과에서 찾는다. 한쪽만 넘기면 거부한다.
  - SDK가 해당 시리얼의 라이선스를 골라 양쪽에서 검사한 뒤 인증한다.
  - 파일에 없는 시리얼은 연결 시작 전에 거부된다.
- **ready**: `g2` 이벤트가 `phase == 'ready'`이고 `side == null`일 때 기기 전체가 준비된 것이다. 그 뒤에만 명령을 보낸다.

### g2 phase

| phase | 의미 |
|---|---|
| waitingForForeground | iOS: 앱이 포그라운드로 오기를 대기 |
| connecting | Bluetooth 연결 중 |
| enterpriseAuthorizing | 안경이 라이선스를 검사 중 |
| businessAuthenticating | 라이선스 검사 후 인증 중 |
| retrying | 한쪽이 재시도 중 |
| ready | `side == null`이면 기기 전체 준비 완료 |
| disconnected | 연결 종료 |
| failed | 실패. 이유는 `failure`에 있음 |

### 시간 동기화

- ready 후 `await sdk.syncG2Time()`으로 안경 시계를 폰에 맞춘다.
- 결과는 `timeSync` 이벤트로 온다. `success`, 실패 시 `failure`를 담는다.
- EvenHub 페이지가 열려 있으면 시간 동기화를 거부한다.

### 라이선스 갱신

- 포털에서 기기를 추가한 뒤 파일을 다시 받는다.
- `await sdk.updateLicenses(newLicenseJson)`로 넘긴다.
- SDK는 파일 전체를 검증한 뒤 교체한다. 새 연결부터 적용된다.

### 연결 해제와 리셋

- `disconnectG2()`, `reset()`, 구독 `cancel()` 순서로 정리한다.
- 로그아웃, 계정 전환, 앱 종료 시 `reset()`을 호출한다. 네이티브 세션과 대기 콜백을 정리한다.
- 구독 취소는 리스너만 없앤다. 안경 연결은 끊지 않는다. 프로세스당 `EvenDevicesNative.instance` 하나를 단일 Flutter 엔진에서 쓴다.

### 이벤트 종류

| type | 내용 |
|---|---|
| discovery | 시리얼과 발견된 좌우. 인가 전 |
| g2 | 쪽별 연결·라이선스 검사 진행, 기기 전체 ready |
| timeSync | `syncG2Time()` 결과 |
| evenHub | 페이지 수명주기, 사용자 입력, 마이크 오디오 |
| ota | 펌웨어 업데이트 단계, operation ID, 진행률 |
| transport, business | 플랫폼 진단용. ready 신호로 쓰지 않는다 |

- 이벤트는 해당 시 `namespace`, `sn`, `side`를 담는다.
- `details` 맵에 네이티브 SDK가 보낸 모든 필드가 있다.

## EvenHub 페이지 (Enterprise)

출처: https://hub.evenrealities.com/docs/enterprise/evenhub (Last updated: 2026-11-10)

- 안경이 ready가 되면 EvenHub 페이지를 열 수 있다.
- 디스플레이는 576 x 288 픽셀이다.
- SDK가 페이지를 소유한다. 생성, 5초마다 heartbeat, 응답 매칭, 종료를 맡는다.
- 앱은 페이지 내용을 보내고 `evenHub` 이벤트를 듣는다.
- 페이지 모델은 Even Hub 앱과 같다 (Display & UI System 문서 참조).

### 텍스트 페이지

- `openEvenHubTextPage(text: ...)`로 짧은 메시지를 띄운다. `closeEvenHub()`로 닫는다.
- 텍스트는 UTF-8 1~64바이트다.
- `evenHub` 이벤트 `phase == 'active'`가 와야 안경이 페이지를 만든 것이다.

### 명령 (`executeEvenHubCommand`)

- 큰 내용은 이 메서드를 쓴다.
- 안경 응답을 기다려 결과 맵을 돌려준다.
- 실패하면 `PlatformException`을 던진다.

| 명령 | 역할 | 주요 인자 |
|---|---|---|
| createPage | 페이지 열기, heartbeat 시작 | 페이지 필드, 선택 `widgetId` |
| rebuildPage | 열린 페이지의 컨테이너·메뉴 교체 | 페이지 필드 |
| updateText | 텍스트 컨테이너 내용 교체 | `containerId`, `containerName`, `content`(최대 1999바이트), 선택 `textColor` 0-4 |
| updateImage | 이미지 컨테이너에 전체 이미지 전송 | `containerId`, `containerName`, `data`, `compressMode` 0-2 |
| shutdownPage | 페이지 닫기 | `exitMode` 0 또는 1 (1은 착용자 확인) |
| audioControl | 마이크 켜기/끄기 | `enabled` |
| imuControl | 모션 데이터 켜기/끄기 | `enabled`, `reportFrequency` 100-1000 |
| menuStartupFailed | 메뉴에서 앱 시작 실패 통보 | `errorCode`, `errorString` |
| menuSubitemResponse | 메뉴 하위 항목 전환에 응답 | `parentItemId`, `subItemId`, `status` |
| heartbeat | SDK가 자동 전송 | - |

- 세션 ID, 컨테이너 수, 이미지 청크, heartbeat 카운터는 SDK가 채운다.
- 이 값이나 모르는 키를 넘기면 거부된다.

### 페이지 필드

`createPage`·`rebuildPage`는 컨테이너 합계 최대 12개다.

| 필드 | 최대 | 항목 |
|---|---|---|
| textObjects | 8 | 컨테이너 필드 + content(최대 999바이트), textColor 0-4 |
| listObjects | 4 | 컨테이너 필드 + itemContainer: itemNames(1-20개, 각 최대 63바이트), itemWidth, isItemSelectBorderEnabled |
| imageObjects | 4 | 컨테이너 필드. width 20-288, height 20-144 |
| menu | 1 | items: 메뉴 항목 1-10개 |

공통 컨테이너 필드:

| 필드 | 값 |
|---|---|
| containerId | 필수. 0이 아닌 수. 페이지 내 고유 |
| containerName | 필수. 1-15바이트 |
| width, height | 필수. 1-576, 1-288 |
| xPosition, yPosition | 0-576, 0-288. 기본 0 |
| zOrderIndex | 선택 |
| borderWidth 0-5, borderColor 0-15, borderRadius 0-10, paddingLength 0-32 | 텍스트·리스트 컨테이너. 기본 0 |
| isEventCapture | 텍스트·리스트 컨테이너. 페이지당 최대 1개 |

- 메뉴 항목: `itemName`(1-31바이트), 0이 아닌 `itemId`, `position` 0-10, `checkedIndex`, `subItems` 최대 5개.

### 이미지

- `updateImage`의 `data`는 최대 1 MB다.
- `compressMode`에 맞는 안경 이미지 포맷으로 미리 인코딩해야 한다.
- SDK가 청크로 나누고 청크마다 확인한다.
- PNG·BMP 변환은 하지 않는다.

### 마이크 오디오

- 양쪽 ready이고 페이지가 active일 때 `audioControl`로 켠다.
- 펌웨어가 확인하면 오디오가 시작된다.
- 연결된 쪽 중 최소 한쪽이 오디오 스트림을 지원해야 한다.
- 오디오는 `event == 'audioEvent'`인 `evenHub` 이벤트로 온다.

| 필드 | 값 |
|---|---|
| audioPcm | `Uint8List`. signed 16-bit little-endian PCM |
| sampleRate / channels / bitsPerSample | 16000 / 1 / 16 |
| source | `glasses` |
| speakerRole | `self`, `other`, `unknown` |
| direction | 부호 있는 수. 펌웨어가 줄 때만 |

- `{'enabled': false}`로 끈다. 페이지 종료나 연결 해제도 오디오를 멈춘다.

### 페이지 닫기

- `exitMode: 0` 또는 `closeEvenHub()`는 즉시 닫는다.
- `exitMode: 1`은 착용자 확인을 요청한다. 결과에 `awaitingExit: true`가 온다.
- 착용자가 나갈 때까지 페이지가 열려 있다.

### 메뉴 응답

- 착용자가 하위 항목을 바꾸면 10초 안에 `menuSubitemResponse`로 답한다.
- `menuStartupFailed`는 ready 이후 페이지 유무와 무관하게 동작한다.
- 둘 다 SDK가 큐에 넣으면 완료된다. 안경은 확인 응답을 보내지 않는다.

### 페이지 이벤트

| phase | 의미 |
|---|---|
| opening | 페이지 요청됨 |
| active | 안경이 페이지 생성 |
| heartbeat | heartbeat 확인. `heartbeatCount`로 셈 |
| input | 착용자 입력. 동작은 `event`에 |
| closing | 종료 요청됨 |
| closed | 닫힘 |
| failed | 실패. 이유는 `failure`에 |

- `failure`가 `busy`면 SDK가 요청을 받지 않은 것이다. 기존 페이지는 유지된다.

| event | 착용자 동작 |
|---|---|
| click, doubleClick | 탭, 더블 탭 |
| scrollUp, scrollDown | 스와이프 |
| longPress, longPressRelease | 길게 누르기 시작·끝 |
| foregroundEnter, foregroundExit | 페이지가 앞으로 옴·떠남 |
| exit, abnormalExit | 페이지 종료 |

- `details`: `kind`(`list`/`text`/`system`), `containerId`, `containerName`.
- 리스트는 `selectedItemName`, `selectedItemIndex`를 담는다.
- 시스템 입력은 `source`(`leftGlasses`/`rightGlasses`/`ring`)를 담는다.
- 모션 데이터는 `x`, `y`, `z`를 담는다.
- 메뉴 클릭과 하위 항목 전환은 항목 ID를 담는다.

## 펌웨어 업데이트 (OTA)

출처: https://hub.evenrealities.com/docs/enterprise/ota (Last updated: 2026-11-10)

- SDK가 안경 양쪽 펌웨어를 업데이트한다.
- 양쪽 전송, 흐름 제어, 재연결 후 버전 확인을 맡는다.

### 시작

- `events`를 먼저 구독한다.
- 기기 전체 ready 후 `startOta(firmware:, targetVersion:)`를 호출한다.
- `firmware`는 해당 G2 모델용 G2 EVENOTA 파일 전체(`Uint8List`)다.
- `targetVersion`은 릴리스의 목표 버전이다.
- 반환된 ID는 SDK가 업데이트를 수락했다는 뜻이다.
- 거부 시 `PlatformException` 코드: `notReady`, `busy`, `invalidFirmware`, `invalidTargetVersion`.

### 취소

- `cancelOta(operationId:)`로 취소한다. 재연결 중에도 취소된다.

### 진행 추적

- `ota` 이벤트를 `sn`, `operation`, 연결 `generation`으로 매칭한다.

| 필드/phase | 의미 |
|---|---|
| progress | 전송 비율 0~1 |
| transportCompleted | 양쪽 전송 완료 |
| succeeded | 재연결 후 양쪽 버전이 목표와 일치. `leftVersion`, `rightVersion` 포함 |
| failure | 실패 이유 |

- `succeeded` 이후에만 설치 완료로 표시한다.
- 버전 불일치나 읽기 실패면 설치가 검증되지 않은 것이다.

## 네이티브 Android·iOS

출처: https://hub.evenrealities.com/docs/enterprise/native (Last updated: 2026-11-10)

- Flutter 런타임 없이 네이티브 앱에서 쓴다.
- 라이선스 파싱, 시리얼별 라이선스 선택, 양쪽 인가·인증, 시간 동기화, EvenHub 명령을 처리한다.
- 두 SDK 모두 버전 `0.1.0-beta.14`다.

### Android

- Maven Central: `com.evenrealities.devices:even-devices-native-android:0.1.0-beta.14`
- `settings.gradle.kts` 저장소에 `google()`, `mavenCentral()`을 넣는다.
- `app/build.gradle.kts`에 `implementation(...)`으로 추가한다.
- 최소 API 21. Java·Kotlin 17 바이트코드.
- Android 12 이상: `BLUETOOTH_SCAN`, `BLUETOOTH_CONNECT`를 요청한다.
- 그 이전: 위치 권한을 요청하고 위치 서비스를 켠다.
- 주요 클래스: `EnterpriseLicenseBundle`, `EvenDevicesAndroidBle`, `G2Endpoint`.
- `EnterpriseLicenseBundle.fromJsonString(licenseJson)`로 라이선스를 읽는다.
- `EvenDevicesAndroidBle.instance.initialize(context, licenses, onEvent, onG2AuthEvent, onG2TimeSyncEvent, onEvenHubEvent)`로 초기화한다.
- `onG2AuthEvent`에서 `event.ready`면 양쪽이 인가·인증을 통과한 것이다.
- `connectG2(sn, left, right)`에 스캔한 원래 endpoint 주소와 이름을 넘긴다.
- ready 후 `openEvenHubTextPage("Hello Even Hub")`를 호출한다.
- 요청 제출이 표시 증거는 아니다. 이벤트가 열림과 갱신을 확인해 준다.
- 끝나면 `closeEvenHub()` 후 `disconnectG2(left, right)` 또는 `reset()`.

### iOS

- Xcode: File > Add Package Dependencies.
- URL `https://github.com/even-realities/flutter_enterprise_sdk.git`, 정확한 버전 `0.1.0-beta.14`.
- EvenDevicesSDK 제품을 앱 타깃에 추가한다.
- Swift 패키지: `.package(url: ..., exact: "0.1.0-beta.14")`와 `.product(name: "EvenDevicesSDK", package: "flutter_enterprise_sdk")`.
- Xcode가 Git 태그로 프레임워크를 받는다. 별도 링크나 토큰이 없다.
- 최소 iOS 15.0.
- XCFramework는 arm64 기기, arm64·x86_64 시뮬레이터를 지원한다.
- `Info.plist`에 `NSBluetoothAlwaysUsageDescription`을 추가한다.
- SDK 객체를 세션 동안 유지한다. SDK 호출은 main queue에서 한다.
- `EvenDevicesG2SDK(namespace:, licenseBundle:, onEvent:, onEvenHubEvent:)`로 만든다.
- `onEvent`에서 `phase == .ready && side == nil`이면 양쪽 인가 완료다.
- 양쪽 발견 후 `connectG2(serialNumber:)`를 호출한다.
- 저장한 endpoint UUID를 `G2EndpointPair`로 넘길 수 있다. 위치 찾기용이며 인가를 건너뛰지 않는다.
- ready 후 `try sdk.openEvenHubTextPage(text:)`. 끝은 `try sdk.closeEvenHub()`, `sdk.disconnect()`.

### 마이크 오디오 (네이티브)

- 양쪽 ready이고 페이지 active일 때 `audioControl`을 보낸다. 명령 결과를 기다린다.
- Kotlin: `sdk.executeEvenHubCommand("audioControl", mapOf("enabled" to true)) { ... }`
- Swift: `sdk.executeEvenHubCommand(commandName: "audioControl", parameters: ["enabled": true]) { ... }`
- `event.event == "audioEvent"`일 때 `details["audioPcm"]`을 읽는다.
- Kotlin은 `ByteArray`, Swift는 `Data`다.
- 오디오 포맷은 모든 플랫폼에서 같다.

### 펌웨어 업데이트 (네이티브)

- 초기화 시 `onOtaEvent`를 넘긴다.
- 양쪽 ready 후 G2 EVENOTA 파일 전체와 목표 버전을 넘긴다.
- Kotlin: `sdk.startOta(firmware, targetVersion)` (`ByteArray`, `String`), 취소 `sdk.cancelOta(operation)`.
- Swift: `try sdk.startOta(firmware:, targetVersion:)` (`Data`, `String`), 취소 `sdk.cancelOta(operationId:)`.
- 이벤트를 반환된 operation ID로 매칭한다.
- `transportCompleted`는 양쪽 전송 완료다.
- 재연결 후 양쪽 버전을 확인하면 `succeeded`가 온다.

### 라이선스 (네이티브)

- 포털 파일을 수정 없이 통째로 넘긴다.
- SDK는 모든 항목을 검증하고 연결할 시리얼 항목만 쓴다.
- 파일에 없는 안경은 연결 전에 거부된다.
- 스캔 성공이나 한쪽 성공은 기기 전체 ready가 아니다.
