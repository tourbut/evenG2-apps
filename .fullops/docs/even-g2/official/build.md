---
title: "Build: 페이지 수명주기·화면·디자인"
status: draft
updated: 2026-11-21
owner: dev
summary: "공식 Build 문서 요약: 페이지 수명주기, 화면·컨테이너, 디자인 지침"
---

# Build: 페이지 수명주기·화면·디자인

출처: 공식 문서 (2026-11-21 읽음)

공식 "Build" 섹션 요약이다. 앱 코드를 쓸 때 만지는 모든 것을 다룬다. 이 파일은 페이지 수명주기, 화면(Display), 디자인 가이드를 담는다. 기기 API, 컨텍스트 메뉴, 네트워킹, 백그라운드 수명주기는 [build-device.md](build-device.md)에 있다.

## Build 섹션 구성 ([build/index](https://hub.evenrealities.com/docs/build/index))

| 페이지 | 내용 |
|---|---|
| Page Lifecycle | 생성, 갱신(upgrade), 재구성(rebuild), 종료(shutdown) |
| Display & UI System | 576×288 캔버스 위 컨테이너, 텍스트, 이미지, 글꼴 |
| Design Guidelines | 타이포그래피, 간격, 녹색 캔버스 |
| Device APIs | 터치패드 탭·스와이프·길게 누름, R1 링, IMU, 오디오, 위치, 사진, 기기·사용자 정보, 로컬 저장소 |
| Contextual Menu | 안경 쪽 메뉴 항목 선언과 탭 처리 |
| Networking | `fetch`, `app.json` 허용 목록, CORS, 요청 흐름 |
| Background & Lifecycle | WebView 일시 중단, 살아남는 것과 사라지는 것 |

## 페이지 수명주기 ([build/page-lifecycle](https://hub.evenrealities.com/docs/build/page-lifecycle))

안경 화면은 몇 개의 SDK 호출로만 흐른다. 생성 하나, 갱신 둘, 종료 하나다.

### 메서드

| 메서드 | 용도 | 비고 |
|---|---|---|
| `createStartUpPageContainer` | 첫 페이지 생성 | 시작 시 정확히 한 번 부른다. 결과 코드를 반환한다. 선택 인자 `menuObject`를 받는다. |
| `rebuildPageContainer` | 페이지 전체 교체 | 전체 다시 그리기다. 모든 상태를 잃는다. 하드웨어에서 잠깐 깜빡인다. `menuObject`를 빼면 커스텀 메뉴가 지워진다. |
| `textContainerUpgrade` | 텍스트 제자리 갱신 | 더 빠르고 하드웨어에서 깜빡임이 없다. `containerID`와 `containerName`이 일치해야 한다. 선택 `textColor`로 밝기를 바꾼다(SDK 0.0.14+). |
| `updateImageRawData` | 이미지 컨테이너 갱신 | 동시 전송 금지다. 전송 중 LZ4로 압축된다(SDK 0.0.12+). 코드 변경은 필요 없다. |
| `shutDownPageContainer` | 앱 종료 | `1`은 시스템 종료 확인 창이다(루트 페이지 필수). `0`은 즉시 종료다(내부 페이지만). |
| `callEvenApp` | 범용 메서드 호출 | 탈출구다. 타입이 있는 모든 메서드는 이것의 래퍼다. |

### 반환값

`createStartUpPageContainer` 결과 코드:

| 코드 | 의미 |
|---|---|
| 0 | Success |
| 1 | Invalid parameters |
| 2 | Oversize |
| 3 | Out of memory |

- `rebuildPageContainer`, `textContainerUpgrade`, `shutDownPageContainer`는 `boolean`을 반환한다.
- `updateImageRawData`는 상태 문자열을 반환한다: `success`, `imageException`, `imageSizeInvalid`, `imageToGray4Failed`, `sendFailed`.

### 권장 사항

- 루트 페이지에서는 항상 `shutDownPageContainer(1)`을 부른다. QA 심사자가 이를 직접 확인한다.
- 루트에서 모드 `0`으로 조용히 끝내면 반려된다. 자체 종료 UI로 대체해도 반려된다.
- 모드 `0`은 사용자가 이미 확인한 내부 페이지에서만 쓴다.
- 잦은 텍스트 갱신(카운터, 상태, 실시간 데이터)에는 `textContainerUpgrade`를 쓴다.
- `rebuildPageContainer`는 레이아웃 자체가 바뀔 때만 쓴다. 예: 컨테이너 추가·삭제, 텍스트와 리스트 전환.
- `textContainerUpgrade`의 `containerID`와 `containerName`을 정확히 맞춘다. 불일치는 조용히 아무 일도 안 한다.
- `updateImageRawData`를 동시에 부르지 않는다. 하나가 끝난 뒤 다음을 보낸다.
- 메뉴를 유지할 rebuild마다 `menuObject`를 다시 보낸다. 빼면 항목이 보존되지 않고 지워진다.

## 화면과 UI 시스템 ([build/display](https://hub.evenrealities.com/docs/build/display))

안경은 임의의 HTML을 그리지 않는다. 몇 가지 SDK 컨테이너 객체로 고정 캔버스를 합성한다. 각 컨테이너는 절대 픽셀 좌표로 놓인다.

### 캔버스

- 눈마다 576 x 288 픽셀 캔버스를 표시한다.
- 원점은 왼쪽 위다. X는 오른쪽, Y는 아래로 증가한다.
- 색은 4비트 회색조다. 녹색 16단계다.
- 흰 픽셀은 밝은 녹색이다. 검은 픽셀은 꺼진다(투명).

### 컨테이너 규칙

UI는 컨테이너, 곧 절대 좌표의 직사각형 영역으로 만든다. CSS, flexbox, DOM은 없다.

- 페이지당 이미지 컨테이너 최대 4개, 그 밖의 컨테이너 최대 8개다. 자유롭게 섞는다.
- `isEventCapture: 1`인 컨테이너는 정확히 하나다. 이 컨테이너가 모든 입력 이벤트를 받는다.
- 컨테이너는 겹칠 수 있다. `zOrderIndex`가 쌓임 순서를 정한다(SDK `0.0.12+`).
- `zOrderIndex`를 생략한 페이지는 예전 규칙을 따른다. 나중에 선언한 것이 위에 그려진다.

### 공통 속성

| 속성 | 타입 | 범위 | 비고 |
|---|---|---|---|
| `xPosition` | number | 0–576 | 왼쪽 가장자리(px) |
| `yPosition` | number | 0–288 | 위쪽 가장자리(px) |
| `width` | number | 0–576 | 컨테이너 너비(px) |
| `height` | number | 0–288 | 컨테이너 높이(px) |
| `containerID` | number | - | 페이지 안에서 고유 |
| `containerName` | string | 최대 16자 | 페이지 안에서 고유 |
| `isEventCapture` | number | 0 또는 1 | 정확히 하나만 1 |
| `zOrderIndex` | number | 페이지 안에서 고유 | 클수록 앞(SDK 0.0.12+). 페이지 단위 전부 또는 전무 |

### 테두리 속성

텍스트와 리스트 컨테이너에만 있다.

| 속성 | 타입 | 범위 | 비고 |
|---|---|---|---|
| `borderWidth` | number | 0–5 | 0 = 테두리 없음 |
| `borderColor` | number | 0–15 / 0–16 | 회색조 단계 |
| `borderRadius` | number | 0–10 | 둥근 모서리(SDK protobuf의 오타를 그대로 둠) |
| `paddingLength` | number | 0–32 | 네 변 균일 패딩 |

- 배경이나 채우기 속성은 없다. 테두리가 유일한 시각 장식이다.
- 출처 불일치: 표는 `borderColor` 범위를 "0–15 / 0–16"으로 적는다. 같은 페이지 본문은 "`borderColor` is 0-15"라고 한다.
- 원문 표기: `borderRadius` 행에 "typo preserved from SDK protobuf"라는 주석만 있다. 어떤 오타인지는 적혀 있지 않다.

### 쌓임 순서 (`zOrderIndex`)

리스트, 텍스트, 이미지 컨테이너가 선택 `zOrderIndex`를 받는다(SDK `0.0.12+`). `createStartUpPageContainer`와 `rebuildPageContainer` 둘 다 해당한다. 값이 클수록 앞에 그려진다.

- 전부 또는 전무: 한 컨테이너라도 쓰면 그 페이지의 모든 리스트·텍스트·이미지 컨테이너가 써야 한다. 모두 생략하면 선언 순서로 쌓인다.
- 페이지 안에서 고유: 같은 값을 공유할 수 없다. 동점 처리 규칙은 없다.
- 렌더링 전용: 입력 라우팅에는 영향이 없다. `isEventCapture` 규칙(페이지당 정확히 하나)은 그대로다.
- 위반은 안경에 닿지 않는다. SDK가 네이티브 호출 전에 검증한다.
- 위반 시 `EvenHubPageContainerValidationErrorCode` 오류를 로그로 남긴다.
- 위반 시 `createStartUpPageContainer`는 `StartUpPageCreateResult.invalid`, `rebuildPageContainer`는 `false`를 반환한다.

이미지를 배경으로, 텍스트를 앞에 띄우는 예다. rebuild해도 순서가 유지된다.

```typescript
await bridge.createStartUpPageContainer({
  containerTotalNum: 2,
  imageObject: [{
    xPosition: 144,
    yPosition: 72,
    width: 288,
    height: 144,
    containerID: 1,
    containerName: 'backdrop',
    zOrderIndex: 1, // back
  }],
  textObject: [{
    xPosition: 168,
    yPosition: 112,
    width: 240,
    height: 64,
    containerID: 2,
    containerName: 'caption',
    content: 'Now playing',
    isEventCapture: 1,
    zOrderIndex: 2, // front
  }],
})
```

이미지 컨테이너는 빈 상태로 시작한다. 페이지 생성 뒤 `updateImageRawData`로 픽셀을 보낸다.

### 텍스트 컨테이너

기본 컨테이너 타입이다. 평문이고 왼쪽·위 정렬이다. 정렬 옵션, 글자 크기 조절, 굵게·기울임은 없다.

```typescript
new TextContainerProperty({
  xPosition: 0,
  yPosition: 0,
  width: 576,
  height: 288,
  borderWidth: 0,
  borderColor: 5,
  paddingLength: 4,
  containerID: 1,
  containerName: 'main',
  content: 'Your text here',
  textColor: 4,
  isEventCapture: 1,
})
```

#### 내용 한도

| 메서드 | 최대 글자 수 (Max Characters) |
|---|---|
| `createStartUpPageContainer` | 1,000 |
| `textContainerUpgrade` | 2,000 |
| `rebuildPageContainer` | 1,000 |

원문 단위는 "characters"다. 바이트 기준인지는 이 페이지에 없다.

#### 동작

- 텍스트는 컨테이너 너비에서 줄바꿈된다.
- 넘친 내용은 `isEventCapture: 1`인 컨테이너일 때 펌웨어가 스크롤한다.
- `\n`은 줄바꿈이다.
- 유니코드는 펌웨어 글꼴에 글리프가 있을 때만 된다.
- 전체 화면 텍스트 컨테이너에 약 400-500자가 들어간다.
- "가운데 정렬"은 공백으로 채워서 만든다.

#### 텍스트 밝기 (`textColor`)

- 선택 속성이다(SDK `0.0.14+`). 밝기 5단계, `0`부터 `4`다.
- 이름과 달리 색이 아니다. 화면은 단색 녹색이고, 글리프 밝기만 정한다.
- 컨테이너별 텍스트 밝기다. 사용자가 시스템 컨텍스트 메뉴에서 정하는 전역 밝기와 다르다. 전역 밝기는 OS 소유이고 앱에 전달되지 않는다.

| 상황 | 생략했을 때 |
|---|---|
| `createStartUpPageContainer` / `rebuildPageContainer` | 기기 기본값, 레벨 4(가장 밝음) |
| `textContainerUpgrade` | 컨테이너의 현재 밝기 유지 |

```typescript
// Dim secondary text, full-brightness heading
await bridge.textContainerUpgrade(new TextContainerUpgrade({
  containerID: 2,
  containerName: 'caption',
  content: 'Updated 3 min ago',
  textColor: 2,
}))
```

- `textColor`는 0-4, `borderColor`는 0-15다. 같은 컨테이너에서 척도가 다르다.
- 레벨 `0`은 "미설정"이 아니라 가장 어두운 단계다. 사실상 안 보일 수 있다. `0`에 기대는 디자인은 하드웨어에서 확인한다.
- `0..4` 밖의 값은 안경에 닿지 않는다. SDK가 `INVALID_TEXT_BRIGHTNESS`를 로그로 남기고 로컬에서 실패한다.
- `textContainerUpgrade`도 범위 밖 값을 호스트 호출 전에 거부한다.

#### 제자리 갱신

- `textContainerUpgrade`를 쓴다. 전체 rebuild보다 빠르고 하드웨어에서 깜빡임이 없다.
- `TextContainerUpgrade` 인스턴스를 넘긴다.
- 기본 갱신의 필수 필드는 `containerID`, `containerName`, `content`뿐이다.
- `contentOffset`, `contentLength`는 부분 문자열 갱신용이다.
- `textColor`는 밝기를 다시 정한다(SDK `0.0.14+`).

```typescript
import { TextContainerUpgrade } from '@evenrealities/even_hub_sdk'

await bridge.textContainerUpgrade(new TextContainerUpgrade({
  containerID: 1,
  containerName: 'main',
  content: 'Updated text',
}))
```

### 리스트 컨테이너

네이티브 스크롤 리스트다. 스크롤 강조는 펌웨어가 처리한다.

| 항목 | 한도 |
|---|---|
| 리스트당 항목 수 | 최대 20 |
| 항목당 글자 수 | 최대 64자 |

- 항목별 스타일, 행 높이 조절, 구분선이 없다.
- 제자리 갱신이 없다. 리스트를 바꾸려면 페이지 전체를 rebuild한다.

### 이미지 컨테이너

회색조 이미지를 그린다.

- 컨테이너당 최대 288 x 144 px(너비 x 높이)다.
- 4비트 회색조다.
- 입력 형식: `number[]`, `Uint8Array`, `ArrayBuffer`, base64.
- `createStartUpPageContainer` 중에는 이미지를 보낼 수 없다. 자리만 만들고 `updateImageRawData`로 채운다.
- 이미지를 동시에 보내지 않는다.
- 원시 데이터는 전송 중 자동으로 LZ4 압축된다(SDK `0.0.12+`). 코드 변경이 없다.
- 이미지 파이프라인이 속도 위주로 재작업되었다. 전체 화면 갱신이 시험에서 약 800 ms였다.

#### 이미지 전송 간격 100ms

- 각 `updateImageRawData`는 이미지 경로를 100ms 동안 잡는다(SDK `0.0.14+`).
- 그 창 안에 온 호출은 보류되었다가 다음 차례에 보내진다. 버려지지 않고, 먼저 도착하지도 않는다.
- 100ms는 하한으로 본다. 버스트를 흡수하려는 장치다.
- 각 전송을 계속 await한다. 결과는 `ImageRawDataUpdateResult`다.
- `success`는 갱신이 접수되었다는 뜻이다. 안경 픽셀이 켜졌다는 수신 확인이 아니다.

이미지 위주 앱: `content: ' '`, `isEventCapture: 1`인 전체 화면 텍스트 컨테이너를 이미지 뒤에 둔다. `zOrderIndex`를 더 낮게 주거나, `zOrderIndex`를 안 쓰면 먼저 선언한다. 텍스트 컨테이너가 입력을 받고, 이미지는 그 위에 그려진다.

### 글꼴과 유니코드

- 펌웨어에 LVGL 글꼴 하나가 들어 있다.
- 글꼴 선택, 크기 조절이 없다. 고정폭이 아니다.
- 글꼴에 없는 문자는 조용히 빠진다.
- 쓸 수 있는 글리프는 아래 디자인 가이드의 "UI용 문자" 표를 본다.

## 디자인 가이드 ([build/design-guidelines](https://hub.evenrealities.com/docs/build/design-guidelines))

Even Realities가 공식 소프트웨어 디자인 가이드를 Figma로 공개한다. 레이아웃, 컴포넌트, 인터랙션 패턴, 시각 기준을 다룬다. 안경 화면과 컴패니언 앱 모두 대상이다.

### 화면 제약

- 576 x 288 px 캔버스다. 캔버스 전체에 그릴 수 있다. 원점은 왼쪽 위다.
- 4비트 회색조다. 회색으로 디자인하면 하드웨어가 녹색 농도로 그린다.
- 배경 채우기가 없다. 구조는 테두리와 텍스트·이미지 내용뿐이다.
- 이미지 컨테이너 최대 4개, 그 밖의 컨테이너 8개다. 그 안에서 레이아웃을 짠다.
- 이벤트 캡처 컨테이너는 하나다. 활성 입력 대상 하나를 전제로 디자인한다.

### 아이콘 디자인

G2 아이콘은 픽셀 아트다. 큰 크기로 그린 뒤 픽셀 격자로 신중히 줄인다.

작업 순서:

1. 아무 도구로 크게 그린다. SVG나 고해상도 PNG를 내보내면 된다.
2. 캔버스를 끝까지 채운다. 패딩·여백을 두지 않는다. 24 x 24에서는 남는 픽셀이 없다.
3. 실제 렌더 크기(보통 24 x 24)로 줄인다. 안티앨리어싱 없이 켜짐/꺼짐으로 임계 처리한다. 선을 격자에 맞춘다. 마지막 10%는 늘 손으로 한다.

24 x 24에서 살아남는 것:

| 할 것 | 하지 말 것 |
|---|---|
| 단순 배경 위 한 가지 단색 | 그라디언트, 그림자, 질감 |
| 평평하게 채운 도형 | 가는 선, 외곽선 스타일 아이콘 |
| 하나의 대상을 가장자리까지 | 복잡한 장면, 여러 요소, 장식 테두리 |
| 최종 크기에서 2 px 이상 선 | 더 가는 선(사라지거나 뭉침) |
| 모양만으로 알아보는 실루엣 | 크게만 읽히는 디테일: 얼굴, 글자, 미세 패턴 |

AI 생성기를 쓸 때는 다음처럼 요청한다: flat solid-black icon, white background, thick strokes, no gradients, no shading, centered, fills the frame. 그 뒤 위 순서로 줄이고 다듬는다.

### 스토어 아이콘

스토어 아이콘은 앱 내 그림보다 엄격하다. Developer Portal의 24 x 24 픽셀 에디터로 그리고 업로드 때 검증된다.

- 1비트 흑백이다. 모든 픽셀이 완전히 켜지거나 꺼진다. 회색, 안티앨리어싱이 없다.
- 2 x 2 블록으로 만든다. 켜진 픽셀은 모두 켜진 2 x 2 블록에 속해야 한다.
- 블록은 어디든 놓이고 막대·모서리·불규칙 모양으로 이어진다.
- 가장 가는 선은 2 px다. 단일 픽셀과 1 px 선은 검증에 실패한다.
- 실질 디테일 예산은 12 x 12로 잡는다.
- 알아보기 어려운 아이콘은 심사에서 바로 반려된다.

### 흔한 UI 패턴

| 패턴 | 방법 |
|---|---|
| 가짜 버튼 | 텍스트 앞에 `>`를 커서 표시로 붙인다 |
| 선택 강조 | 개별 텍스트 컨테이너의 `borderWidth`를 켜고 끈다 |
| 여러 행 레이아웃 | 텍스트 컨테이너를 세로로 쌓는다(예: 높이 96px 컨테이너 3개) |
| 진행 막대 | 유니코드 블록 문자 `━`, `─` |
| 페이지 넘김 | 약 400–500자 경계로 미리 나누고, 스크롤 이벤트에 rebuild |

### UI용 문자

LVGL 글꼴 하나만 쓰므로 고정폭 변형과 크기 조절이 없다. 아래 문자는 안정적으로 그려진다.

| 용도 | 문자 |
|---|---|
| 진행 막대 | ━ ─ █▇▆▅▄▃▂▁ |
| 탐색 | ▲△▶▷▼▽◀◁ |
| 선택 | ●○ ■□ ★☆ |
| 테두리 | ╭╮╯╰ │─ box-drawing 세트 |
| 카드 무늬 | ♠♣♥♦ |

전체 글리프 표는 커뮤니티 Even G2 노트에 있다고 원문은 적는다.
