# evenG2-apps

Even Realities G2 스마트글래스용 앱(Even Hub 플러그인)을 모아 관리하는 npm workspaces 모노레포.

## 구조

| 경로 | 내용 |
|---|---|
| `apps/<app-id>/` | 앱 하나. 공식 `minimal` 템플릿 기반 (`app.json`, Vite, `src/main.ts`) |
| `packages/g2-kit/` | 앱 공통 코드 `@g2/kit`: 입력 정규화, 브리지 호출 큐, UTF-8 바이트 자르기 |
| `scripts/new-app.sh` | 새 앱 만들기 |
| `.fullops/docs/even-g2/` | SDK·시험·제출 자료 ([README](.fullops/docs/even-g2/README.md)) |
| `.fullops/docs/planning/product-specs/` | 앱별 명세 |

## 준비

전역 도구(CLI·시뮬레이터)는 한 번 설치한다. 자세한 내용은 [setup.md](.fullops/docs/even-g2/setup.md).

```sh
npm install -g @evenrealities/evenhub-cli @evenrealities/evenhub-simulator
npm install
```

## 명령

```sh
npm run new-app -- <app-id> "<표시 이름>" [dev 포트]   # apps/<app-id> 생성
npm run dev -w apps/<app-id>                            # 개발 서버
npm run simulate -w apps/<app-id>                       # 시뮬레이터 (dev 서버를 먼저 띄운다)
npm run pack -w apps/<app-id>                           # 빌드 + <app-id>.ehpk
npm run typecheck                                       # 전체 타입 검사
npm test                                                # 전체 테스트
```

`new-app`은 템플릿 `app.json`의 반려 값을 바꾼다: `package_id`는 `com.tourbut.<app-id>`(접두사는 `G2_PACKAGE_PREFIX`로 바꿈), `min_sdk_version`은 npm 최신 SDK, `min_app_version`은 지워 `pack --sdk-ver`가 계산하게 한다. 표시 이름은 20자 이하이고 'Even'을 넣을 수 없다.

SDK를 올릴 때는 앱의 `package.json` 의존성과 `app.json`의 `min_sdk_version`을 함께 바꾼다. `pack`은 `min_sdk_version`을 `--sdk-ver`로 넘긴다.

## 앱

| 앱 | package_id | 상태 |
|---|---|---|
| (아직 없음) | | |
