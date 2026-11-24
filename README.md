# evenG2-apps

Even Realities G2 스마트글래스용 앱(Even Hub 플러그인)을 모아 관리하는 npm workspaces 모노레포.

## 구조

| 경로 | 내용 |
|---|---|
| `apps/<app-id>/` | 앱 하나. 공식 `minimal` 템플릿 기반 (`app.json`, Vite, `src/main.ts`) |
| `services/even-agent/` | Even AI 에이전트 서버(홈서버). 아래 [Even AI 에이전트](#even-ai-에이전트) |
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

## Even AI 에이전트

`services/even-agent`는 Even 앱 **설정 > Even AI > Agent Configuration**(승인된 EvenHub 개발자 계정에서만 보임)에 넣는 서버다. "Hey Even"으로 한 말을 받아 Claude(Tool Runner, 기본 `claude-sonnet-5-5`)가 위키 검색·읽기, 웹 검색, 마지막 위치로 답하고 350자 평문으로 돌려준다. 다른 G2 플러그인은 부를 수 없다(앱이 문장만 보내고 글만 받는다).

| 환경 변수 | 뜻 |
|---|---|
| `EVEN_AGENT_TOKEN` | 앱의 Token 칸과 같은 값. 24자 이상 |
| `WIKI_DIR` | 위키 마크다운 폴더 (예: `~/Workspace/MyKnows/WIKI`) |
| `ANTHROPIC_API_KEY` | Claude API 키 (또는 `ant auth login` 프로필) |
| `BIND`, `PORT` | 기본 `127.0.0.1:3458`. 폰에서 닿게 Tailscale 주소 등으로 둔다 |
| `MODEL`, `LOCATION_FILE` | 기본 `claude-sonnet-5-5`, `location.json` |

```sh
npm start -w services/even-agent
```

- 앱 등록: URL `http://<서버>:3458/v1/chat/completions`(경로까지), Token은 `EVEN_AGENT_TOKEN`. 저장 뒤 목록에서 눌러 선택한다.
- 위치: 폰이 `POST /location`에 `{"lat":..,"lon":..}`를 같은 Bearer 토큰으로 보낸다.
- 25초 안에 못 끝내면 "아직 찾는 중"을 먼저 주고, 같은 질문을 다시 하면 끝난 답을 준다.
- 인증은 토큰 하나뿐이다. LAN·tailnet 밖에 열지 않는다.

## 앱

| 앱 | package_id | 상태 |
|---|---|---|
| (아직 없음) | | |
