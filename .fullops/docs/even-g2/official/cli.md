---
title: Even Hub CLI 공식 문서 요약
status: draft
updated: 2026-11-21
owner: dev
summary: "공식 evenhub CLI 문서 요약: 명령, 플래그, 스크립팅"
---

# Even Hub CLI 공식 문서 요약

출처: 공식 문서 (2026-11-21 읽음)

## 개요와 설치

원문: <https://hub.evenrealities.com/docs/cli/index> (2026-10-20 갱신)

터미널에서 앱을 만들고, 빌드를 올리고, beta 시험을 관리한다. store listing 준비, 심사 제출, 게시는 개발자 포털에서 한다.

- Node.js 20.17+ (Node 20), 22.13+ (Node 22), 또는 23.5+가 필요하다.
- npm 패키지에 컴파일된 CLI와 WebAssembly packer가 들어 있다.
- 전역 설치: `npm install -g @evenrealities/evenhub-cli`, 확인: `evenhub --version`.
- 프로젝트 설치: `npm install -D @evenrealities/evenhub-cli`, 실행: `npx evenhub`.
- `eh`는 `evenhub`의 짧은 별칭이다. 같은 명령을 실행한다.

| 하는 곳 | 작업 |
|---|---|
| CLI | 앱 생성, draft listing 수정, pack·upload·빌드 관리, beta 빌드·시험자 관리, 빌드·심사 상태 확인 |
| 포털 | 아이콘 그리기, store artwork, listing 상세, 개인정보처리방침, 심사 제출, 게시, 승인·게시된 listing 수정 |

포털도 앱, 빌드, 시험자를 관리한다. public 게시는 심사가 필요하다. CLI `delist`는 beta나 public 채널에서 빌드를 뺀다.

| 영역 | 명령 |
|---|---|
| Project | `init`, `qr` |
| Accounts | `login`, `self-check`, `logout` |
| Apps | `create`, `update`, `ls` |
| Builds | `pack`, `upload`, `promote`, `delist`, `download`, `rm` |
| Testers | `testers`, `testers add`, `testers rm` |

### 기본 흐름

```bash
evenhub login
evenhub init                                  # app.json이 없을 때만
npm run build
evenhub pack app.json dist -o my-app.ehpk
evenhub create my-app.ehpk --name "My App" --tagline "One line about it"   # 첫 빌드
evenhub promote 1.0.0 --to beta               # app.json의 version
evenhub testers add tester@example.com
evenhub ls com.example.myapp                  # CHANNEL에 beta
evenhub testers                               # 상태 Active
# 다음 버전: app.json version 올리고 build, pack 후
evenhub upload my-app.ehpk -m "Describe what changed"
evenhub promote 1.0.1 --to beta
```

- `create`는 앱을 등록하고 첫 빌드를 올린다. 소유자는 Me → Apps → Private builds에서 설치한다.
- beta 설치에는 beta 채널 빌드와 Active 멤버십이 모두 필요하다. 순서는 상관없다.
- 시험자는 초대 메일을 수락하고 Me → Beta tester에서 설치한다. 다음 버전에도 멤버십은 유지된다.

## Project: init, qr

원문: <https://hub.evenrealities.com/docs/cli/project> (2026-10-20 갱신)

두 명령은 로그인 없이 동작한다.

### evenhub init

starter `app.json`을 쓴다. 예: `evenhub init --directory ./my-app`, `evenhub init --output ./config/app.json`.

| 옵션 | 설명 |
|---|---|
| `-d, --directory <dir>` | 출력 폴더. 기본은 현재 폴더 |
| `-o, --output <path>` | 출력 파일. `--directory`보다 우선 |

- manifest가 없는 프로젝트에서 쓴다.
- pack 전에 package ID, version, SDK 요구 버전을 고친다.
- scaffold에는 CLI 릴리스에 묶인 앱·SDK 버전 요구값이 들어 있다.

### evenhub qr

실행 중인 dev server의 QR을 만든다. Even Realities 앱으로 스캔하면 안경에서 미리 본다. 명령은 QR을 만든 뒤 끝난다. hot reload를 위해 dev server는 계속 둔다. 예: `evenhub qr --url http://192.168.1.100:5173`, `evenhub qr --ip 192.168.1.100 --port 5173 --path /my-app`.

| 옵션 | 설명 |
|---|---|
| `-u, --url <url>` | 전체 URL. 개별 URL 옵션보다 우선 |
| `-i, --ip <host>` | IP 주소 또는 hostname |
| `-p, --port [port]` | 포트. 값 없이 `-p`만 주면 포트를 뺀다 |
| `--path <path>` | URL 경로. 필요하면 앞에 `/`를 붙인다 |
| `--https, --http` | scheme. 둘 다 주면 exit 1 |
| `-e, --external` | QR 이미지를 저장하고 이미지 뷰어로 연다 |
| `-s, --scale <n>` | 외부 이미지 배율. 기본 4 |
| `--clear` | URL 캐시를 지우고 끝낸다 |

`--url`이 없으면 부분마다 따로 정한다.

| 부분 | 1순위 | 대체 |
|---|---|---|
| Scheme | `--https` 또는 `--http` | 캐시된 scheme, 그다음 `http` |
| Host | `--ip` | 캐시된 host, 그다음 감지한 LAN 주소 |
| Port | `--port` | 캐시된 port, 그다음 대화형 질문 |
| Path | `--path` | 캐시된 path, 그다음 대화형 질문 |

- 컴퓨터의 LAN 주소를 쓴다. 휴대폰이 그 URL에 닿아야 한다.
- LAN 주소 감지에 실패하면 exit 9다. `--ip`나 `--url`을 준다.
- scheme, host, port, path는 CLI 설정 폴더의 `qr.yaml`에 저장된다. 다음 실행이 재사용한다.
- query string과 fragment는 캐시하지 않는다. 필요하면 `--url`을 다시 준다.
- 비대화형 셸에서 port나 path가 없으면 exit 1이다. 스크립트에서는 `--url`, 또는 `--port`와 `--path`를 함께 준다.

## Accounts: login, self-check, logout

원문: <https://hub.evenrealities.com/docs/cli/auth> (2026-10-20 갱신)

휴대폰 앱, 개발자 포털과 같은 Even Realities 계정을 쓴다. 대화형 터미널에서 한 번 로그인하면 저장된 자격 증명을 재사용한다.

| 명령 | 옵션 | 동작 |
|---|---|---|
| `evenhub login` | `-e, --email <email>`: 이메일 질문을 건너뛴다 | 비밀번호를 질문으로 받는다 |
| `evenhub self-check` | `--json` | 저장된 자격 증명의 계정, role, namespace 표시 |
| `evenhub logout` | 없음 | 서버 refresh token 폐기, 로컬 자격 증명 삭제 |

- login은 `--json`과 함께여도 대화형 터미널이 필요하다. 계정은 휴대폰 앱에서 먼저 만든다.
- CLI는 비밀번호 전에 계정 존재를 확인한다. 로그인하면 developer 권한을 켠다. 없는 계정이나 틀린 비밀번호는 exit 2다.
- `self-check` JSON의 `role`은 숫자다. `0` 일반 사용자, `1` developer, `42` admin. 인증·소유 오류 때 계정 확인에 쓴다.
- logout은 서버 폐기가 실패해도 로컬 삭제를 시도하고 알린다. draft 캐시 정리 오류는 경고만 낸다.
- CI에서는 `logout`을 부르지 않는다. CI secret의 refresh token까지 폐기된다. 로컬 사본만 지운다.

### 자격 증명 위치

기본 폴더는 `~/.config/evenhub/`다. `XDG_CONFIG_HOME`이 있으면 그것이 우선이다. Windows는 그 외에 `%APPDATA%/evenhub/`를 쓴다.

| 파일 | 내용 |
|---|---|
| `credentials.yaml` | access, refresh token. 소유자 전용 권한으로 만든다 |
| `qr.yaml` | 마지막 dev server URL |
| `state.yaml` | 캐시된 upload draft |

- 만료된 access token은 자동 갱신되고 로컬 파일도 바뀐다. 두 token이 모두 만료되면 exit 2다.
- 기기마다 자격 증명이 따로다. 공유 설정 폴더의 동시 login·logout은 조율하지 않는다.

### CI 로그인

1. 작업용 PC에서 `evenhub login`을 대화형으로 실행한다.
2. 만들어진 `credentials.yaml`을 CI의 보호된 file secret으로 저장한다.
3. `XDG_CONFIG_HOME`을 job 소유 폴더로 둔다.
4. secret을 `$XDG_CONFIG_HOME/evenhub/credentials.yaml`에 소유자 전용 권한으로 복원한다.
5. 인증 명령을 실행하고 job의 로컬 사본을 지운다.

동시 job은 설정 폴더를 따로 쓴다. refresh token이 만료·폐기되면 다시 로그인하고 CI secret을 바꾼다.

### 다른 환경

| 변수 | 효과 |
|---|---|
| `EVENHUB_BASE_URL` | API base. 기본 `https://hub.evenrealities.com` |
| `EVENHUB_API_URL` | API root를 직접 덮어쓴다 |

- 환경마다 `XDG_CONFIG_HOME`과 로그인을 따로 둔다. 두 URL 변수를 지우면 production으로 돌아간다.
- draft는 API base URL별로 저장된다. 자격 증명은 설정 폴더당 파일 하나다.
- 이 영역의 exit code: 2는 자격 증명 없음·거부·만료·없는 계정, 3은 대상이 없거나 이 계정 소유가 아님.

## Apps: create, update, ls

원문: <https://hub.evenrealities.com/docs/cli/apps> (2026-10-20 갱신)

앱은 package ID와 listing(name, tagline, description, icon)을 가진다. 올린 버전 하나하나가 build다. `create`, `update`는 현재 폴더 `app.json`의 `package_id`를 읽거나 `--package-id <id>`를 받는다. `ls`는 package ID를 위치 인자로 받는다.

### evenhub create

앱과 첫 빌드를 한 번에 만든다. 먼저 pack한다. 예: `evenhub create my-app.ehpk --name "My App" --tagline "One line about it" --icon icon.png`.

| 옵션 | 설명 |
|---|---|
| `--name <text>` | 필수. 표시 이름 |
| `--tagline <text>` | 필수. 짧은 설명 |
| `--description <text>` | 스토어 설명 |
| `--description-file <path>` | 파일에서 설명을 읽는다 |
| `--icon <file.png>` | 24×24 PNG |
| `--package-id <id>` | `app.json`의 package ID를 덮어쓴다 |
| `--new-draft` | 캐시된 draft를 쓰지 않고 다시 올린다 |

- `--description`과 `--description-file`을 함께 주면 exit 1이다. 여러 줄은 파일로 준다.
- `--icon`이 없으면 placeholder로 만들고 출력에 알린다. 심사 전에 `evenhub update --icon icon.png`로 바꾼다.
- 이미 있는 package ID는 패키지를 보내기 전에 exit 4다. 같은 앱의 다음 버전은 `upload`를 쓴다.

### evenhub update

주어진 listing 필드만 고친다. `--name`, `--tagline`, `--description`, `--description-file`, `--icon`, `--package-id`를 받는다. 예: `evenhub update --description-file ./store.md`.

승인·게시된 버전이나 대기 중인 심사가 있으면 서버가 code `1022`로 거부한다. CLI는 exit 7이다. 그런 변경은 포털 심사 흐름으로 낸다.

### evenhub ls

`evenhub ls`는 계정의 앱 목록이다. `evenhub ls <package_id>`는 그 앱의 빌드 목록이다.

| 옵션 | 설명 |
|---|---|
| `--channels` | 앱 목록에 beta, public 포인터를 넣는다 |
| `--verbose` | 패키지의 앱 상세와 심사 상태를 가져온다 |
| `--json` | JSON 객체 하나를 돌려준다 |

- 앱 목록은 내부에서 페이지를 넘긴다. `--channels`는 앱마다 요청을 하나 더 한다. 빌드는 semver 순이다. `1.0.10`이 `1.0.9`보다 앞선다.
- `--verbose`만 심사 상세를 가져오고 JSON에 `app`, `review`를 더한다. 그 조회 실패는 오류로 보고한다.

### 필드 한도와 아이콘 규칙

필드 한도: Name 1–20자, Tagline 1–50자, Description 1–2000자, Build changelog 최대 500자. 길이는 Unicode code point로 센다. 줄바꿈을 정규화하고 앞뒤 공백을 지운 뒤 센다. 제출 전에 로컬에서 검증한다.

| 아이콘 속성 | 요구 |
|---|---|
| File | PNG, 최대 1 MB |
| Dimensions | 정확히 24×24 픽셀 |
| Colour | 모든 픽셀이 완전 투명이거나 불투명 `#F4F4F4` |
| Structure | 보이는 픽셀이 완전한 2×2 블록을 이룬다 |

- 블록 검사는 raster 순서다. 아직 안 쓴 보이는 픽셀은 오른쪽, 아래, 오른쪽 아래 이웃이 보여야 한다. 마지막 행·열에서 블록이 시작할 수 없다.
- 색 검사가 먼저다. 색 오류는 픽셀 좌표와 색을, 불완전 블록은 좌표를 알린다. 로컬 검증 실패는 exit 9이고 아무것도 보내지 않는다.
- 포털 icon canvas로 그리거나 UI/UX Design Guidelines를 따른다.
- `evenhub rm --app com.example.myapp`은 앱, 빌드, 멤버십을 영구 삭제한다. 확인을 묻고, `--yes`로 건너뛴다.

## Builds: pack, upload, promote, delist, download, rm

원문: <https://hub.evenrealities.com/docs/cli/builds> (2026-10-20 갱신)

build는 앱의 불변 버전 하나다. 새 코드를 올리기 전에 `app.json`의 `version`을 바꾼다. 첫 빌드는 `create`, 이후는 `upload`다. 앱 대상 명령은 `app.json`의 package ID를 읽거나 `--package-id <id>`를 받는다. 예외는 `ls <package_id>`, `rm --app <package_id>`다.

### evenhub pack

`npm run build` 뒤 `evenhub pack app.json dist -o my-app.ehpk`.

| 인자 또는 옵션 | 설명 |
|---|---|
| `<manifest>` | `app.json` 경로 |
| `<project>` | 빌드 출력 폴더 (예: `dist`) |
| `-o, --output <file>` | 패키지 경로. 기본 `out.ehpk` |
| `--no-ignore` | 숨김 파일 포함 |
| `-c, --check` | package ID 사용 가능 여부 확인. 로그인 필요 |
| `--sdk-ver <version>` | 최소 앱 버전 계산에 쓸 SDK 릴리스 |
| `--enforce-manual-version` | SDK 하한보다 낮아도 manifest의 최소 앱 버전을 쓴다 |

- 일반 pack은 자격 증명이 필요 없다. `--check`만 인증 요청을 한다. 실패한 pack은 0이 아닌 코드로 끝난다.
- CLI는 SDK 릴리스의 `minAppVersion`을 npm에서 읽어 패키지 manifest에 찍는다.
- `app.json`의 더 높은 값은 유지한다. 더 낮은 값은 SDK 하한으로 올린다. 원본 `app.json`은 그대로다.
- `--sdk-ver`가 없으면 SDK의 npm `latest` 태그를 쓴다. 예: `evenhub pack app.json dist --sdk-ver 0.0.16`.
- npm에 닿지 못하면 경고하고 번들 매핑을 쓴다. 매핑에 없는 SDK는 기본 하한이 되며 틀릴 수 있다.
- 하한을 확인하지 못했다면 배포 전에 온라인에서 다시 pack한다.
- `--enforce-manual-version`은 manifest에 `min_app_version`이 있어야 한다.
- SDK 요구보다 낮은 값은 필요한 API가 없는 휴대폰 앱에 설치를 허용할 수 있다.

### evenhub upload

기존 앱에 버전을 더한다. 예: `evenhub upload my-app.ehpk -m "Swipe up restores the last entry"`.

| 옵션 | 설명 |
|---|---|
| `-m, --changelog <text>` | 필수. 최대 500자 |
| `--package-id <id>` | `app.json`의 package ID를 덮어쓴다 |
| `--new-draft` | 캐시된 draft를 쓰지 않고 다시 올린다 |

이미 있는 버전은 exit 4다. 새 빌드는 늘 Private으로 시작한다. 소유자는 Me → Apps → Private builds에서 설치한다.

### evenhub promote, evenhub delist

예: `evenhub promote 1.0.1 --to beta`, `evenhub delist --from beta`.

| 옵션 | 명령 | 설명 |
|---|---|---|
| `--to beta` | `promote <version>` | beta가 이 버전을 가리키게 한다 |
| `--from <channel>` | `delist` | beta 또는 public을 비운다 |
| `--package-id <id>` | 둘 다 | `app.json`의 package ID를 덮어쓴다 |

- `public`으로 promote는 로컬에서 거부한다. 심사 제출과 게시는 포털에서 한다.
- `delist --from public`은 public 채널 지정을 지운다. 빌드는 남는다. Active 시험자가 beta 빌드를 설치한다.

### evenhub ls (빌드)와 상태

`evenhub ls <package_id>`에서 `STATUS`는 심사 상태, `CHANNEL`은 배포 채널이다. `--verbose`는 심사 상세를 더한다.

| Status | 뜻 |
|---|---|
| Private | 업로드됨. 소유자, 그리고 beta 지정 시 Active 시험자가 쓸 수 있다 |
| In review | 포털에서 제출, 결정 대기 |
| Approved | 심사 통과, 게시 준비 |
| Published | 스토어 게시 |
| Rejected | 심사 거절. 이유는 `--verbose`로 본다 |

status와 channel은 별개 필드다. Private 빌드도 beta에 지정될 수 있다.

### evenhub download, evenhub rm

| 명령 | 옵션 | 설명 |
|---|---|---|
| `download <version>` | `-o, --output <path>` | 출력 파일. 기본 `<package_id>-<version>.ehpk` |
| `download <version>` | `--package-id <id>` | `app.json`의 package ID를 덮어쓴다 |
| `rm <version>` | `--package-id <id>` | 삭제할 버전이 속한 앱 |
| `rm` | `--app <package_id>` | 앱 전체, 빌드, 멤버십 삭제 |
| `rm` | `--yes` | 앱 삭제 확인 건너뛰기 |

- download는 새 서명 storage URL을 받아 내려받는다. 계정 자격 증명을 storage 호스트로 보내지 않는다.
- 채널에 지정된 버전은 지울 수 없다. exit 5가 그 채널을 알려 준다. 먼저 delist한다.
- 앱 삭제는 영구다. `--app`은 버전이나 `--package-id`와 섞지 않는다.
- 스크립트는 대상을 확인한 뒤에만 `--yes`를 붙인다.

### 끊긴 업로드 재개

`create`, `upload`는 패키지를 draft로 올린 뒤 커밋한다. draft ID, 패키지 hash, API base, 계정 정보를 `state.yaml`에 저장하려 한다.

| 상황 | 동작 |
|---|---|
| 같은 패키지·계정·환경, draft 유효 | 캐시된 draft 재사용 |
| draft가 30분 초과, 또는 계정·manifest 변경 | 다시 업로드 |
| `--new-draft` 지정 | 다시 업로드 |
| 캐시를 못 쓰거나 안전하지 않음 | stderr에 경고하고 재사용 없이 진행 |

- 캐시 실패만으로는 API 결과나 exit code가 바뀌지 않는다. 실패 결과의 `draft_cached: false`는 자동 재사용 불가를 뜻한다.
- 결과가 불확실한 쓰기를 재시도하기 전에 서버 상태를 확인한다.

## Testers: testers, testers add, testers rm

원문: <https://hub.evenrealities.com/docs/cli/testers> (2026-10-20 갱신)

beta 멤버십은 앱 하나에 속한다. 설치에는 Active 멤버십과 beta에 지정된 빌드가 모두 필요하다. 각 명령은 `app.json`의 `package_id`를 읽는다. 다른 앱은 `--package-id <id>`로 지정한다.

| 명령 | 옵션 | 설명 |
|---|---|---|
| `testers` | `--search <keyword>` | 이메일로 거른다 |
| `testers` | `--package-id <id>` | `app.json`의 package ID를 덮어쓴다 |
| `testers` | `--json` | JSON 객체 하나를 돌려준다 |
| `testers add <emails>` | `--from <file>` | 텍스트 파일이나 한 열 CSV에서 주소를 읽는다 |
| `testers add <emails>` | `--reinvite` | 이미 Invited인 주소에 새 초대를 보낸다 |
| `testers add <emails>` | `--package-id <id>` | `app.json`의 package ID를 덮어쓴다 |
| `testers rm <emails>` | `--package-id <id>` | 다른 앱의 멤버십을 지운다 |

예: `evenhub testers add "a@example.com,b@example.com"`, `evenhub testers add --from ./testers.csv`, `evenhub testers rm a@example.com`.

- 구분자는 쉼표, 세미콜론, 줄바꿈이다. 셸 구분자가 있으면 따옴표로 감싼다.
- 이메일 철자와 대소문자를 그대로 둔다. 정확히 같은 문자열 중복만 지운다.
- 대소문자만 다른 주소는 따로 제출하고 출력에 알린다.
- `testers rm`으로 지운 계정은 그 멤버십으로 새 beta를 설치할 수 없다.

기존 멤버십은 대소문자까지 정확히 일치할 때 매칭한다.

| 기존 상태 | 기본 동작 | `--reinvite` |
|---|---|---|
| Invited | 건너뜀. 현재 초대 링크 유지 | 새 초대 발송. 이전 링크 무효 |
| Active | 건너뜀. 수락한 멤버십 유지 | 건너뜀. 수락한 멤버십 유지 |
| Rejected 또는 Expired | 새 초대 제출 | 새 초대 제출 |

- `--from`은 한 줄에 주소 하나, 또는 선택적 `email` 헤더가 있는 한 열 CSV를 받는다.
- 따옴표 CSV 셀과 앞쪽 byte-order mark를 지원한다.
- 배치 전체를 먼저 검증한다. 잘못된 주소가 있으면 exit 9이고 목록은 그대로다.
- 성공은 초대 요청 제출을 뜻한다. 메일 도착은 확인하지 않는다.
- JSON의 `invited`는 제출한 주소, `skipped`는 보류 사유, `reinvited`는 `--reinvite`로 기존 비Active 행과 맞은 주소다.

| 초대 Status | 뜻 |
|---|---|
| Invited | 응답 대기 |
| Active | 수락함. beta 빌드 설치 가능 |
| Rejected | 거절함 |
| Expired | 7일 안에 응답 없음 |

- 초대는 7일 뒤 만료된다. 만료된 초대는 `--reinvite` 없이 다시 제출할 수 있다.
- 멤버십만으로 빌드가 정해지지 않는다. `promote --to beta`가 설치 버전을 정한다.
- 서버가 추가 초대를 exit 8로 거부할 수 있다. `--reinvite`도 한도를 받는다. `code`, `message`, `hint`로 초대 한도와 rate limit을 구분한다.
- 빌드가 안 보이면 따로 본다. `CHANNEL`에 beta가 없으면 promote한다. 시험자가 Active가 아니면 유효한 초대를 수락하게 한다.
- 명령 오류를 먼저 처리한 뒤 목록을 해석한다. Active 주소를 다시 add해도 멤버십은 그대로다.

## Scripting: JSON, exit code, CI

원문: <https://hub.evenrealities.com/docs/cli/scripting> (2026-10-20 갱신)

`--json`을 쓰면 stdout에 JSON 객체 하나가 나온다. 경고와 진행 상황은 stderr로 간다. exit code로 분기한다. login은 여전히 대화형 터미널이 필요하다. 예: `evenhub ls com.example.myapp --verbose --json > builds.json`.

성공 결과에는 늘 `"ok": true`가 있다. 실패 예:

```json
{ "ok": false, "exit": 5, "code": 1020,
  "message": "version is referenced by branch(es): beta",
  "hint": "Delist the referenced channel before deleting this build." }
```

| 키 | 뜻 |
|---|---|
| `ok` | `false` |
| `exit` | 프로세스 exit code |
| `code` | 서버 오류 코드. 로컬 실패면 `null` |
| `message` | 실패 설명 |
| `hint` | 다음 단계 제안 |
| `partial` | 일부 효과가 이미 끝났을 때만 있다 |

`message`와 `hint`를 함께 기록한다. 쓰기를 반복하기 전에 `partial`을 본다.

### Exit code

| 코드 | 뜻 | 대응 |
|---|---|---|
| 0 | 성공 | 계속 |
| 1 | 사용법·인자 오류 | 명령 수정 |
| 2 | 인증 없음·거부 | 계정과 자격 증명 확인 |
| 3 | 대상 없음 또는 소유 아님 | 대상과 계정 확인 |
| 4 | 앱이나 버전이 이미 있음 | 기존 대상 확인 |
| 5 | 버전이 채널에 지정됨 | 삭제 전 delist |
| 6 | 서버가 아이콘 거부 | 서버 메시지 확인 |
| 7 | listing 수정에 심사 필요 | 포털 사용 |
| 8 | quota 또는 rate limit | `code`와 `hint` 확인 |
| 9 | 로컬 실패, 서버 상태 불변 | 입력이나 로컬 단계 수정 |
| 10 | 네트워크·서버 오류 | 쓰기 재시도 전 상태 확인 |
| 11 | 서버 효과 완료, 이후 로컬 단계 실패 | `partial` 확인, 로컬 단계 수정 |
| 130 | 중단됨 | 쓰기 중이었으면 상태 확인 |

exit 9는 서버 변경이 없었다는 뜻이다. exit 11을 다시 실행하면 효과가 반복될 수 있다. exit 10은 쓰기 결과를 불확실하게 남길 수 있다.

### 명령별 성공 필드

모든 행에 `ok`도 있다. 일부 필드는 옵션이나 결과에 따라 달라진다.

| 명령 | 성공 필드 |
|---|---|
| `login` | `email`, `role` |
| `self-check` | `id`, `namespace_id`, `email`, `role`, `username`, `contact_email` |
| `logout` | `local_removed`, `server_invalidated` |
| `init` | `path` |
| `qr` | `url`; `--external`이면 `path`; `--clear`면 `cleared` |
| `pack` | `path`, `size`, `package_id`, `version`, `min_app_version`, `warnings` |
| `create` | `package_id`, `draft_id`, `manifest`, `initial_build`, `icon`, `description_applied`, `next`, `warning` |
| `upload` | `package_id`, `version`, `id`, `status`, `size`, `next` |
| `update` | `package_id`, `updated` |
| `ls` | `apps`, `total`, `next` |
| `ls <package_id>` | `package_id`, `total`, `versions`, `next`; `--verbose`면 `app`, `review` |
| `promote`, `delist` | `package_id`, `branch`, `version`, `next` |
| `testers` | `package_id`, `testers`, `total` |
| `testers add` | `invited`, `skipped`, `reinvited`, `case_variants` |
| `testers rm` | `removed` |
| `rm` | `package_id`, 그리고 `removed_version` 또는 `removed_app` |
| `download` | `package_id`, `version`, `path`, `size`, `public_key` |

비어 있지 않은 `pack.warnings`는 기록한다. `create.icon`은 `uploaded` 또는 `default`다. `default`는 placeholder다.

### 로컬 검증, rate limit, draft

| 입력 | 검증 |
|---|---|
| Listing 필드 | 길이, 공백, 줄바꿈 정규화 |
| Icon | PNG 크기, 색, 2×2 블록 |
| Package | `.ehpk` 확장자, 최대 100 MB |
| Email | 올바른 형식, 최대 200자 |
| Package ID | reverse-domain, 2단 이상 |
| Public promotion | 로컬에서 거부. 포털로 게시 |

- 검증 오류는 대개 exit 9, 명령 문법 오류는 exit 1이다.
- CLI는 rate limit 요청을 자동 재시도하지 않는다. 서버 code `1007`이면 hint대로 기다린다.
- exit 8의 다른 오류는 초대나 앱 quota일 수 있다. 기다려도 안 풀릴 수 있다.
- `ls`는 페이지당 요청 하나다. `ls --channels`는 앱마다 요청을 더한다. `ls --json` 결과를 재사용한다.
- draft는 30분 뒤 만료된다. 계정, 패키지, API base별로 분리된다.
- CI 재시도에서 draft를 쓰려면 job의 격리된 설정 폴더를 안전하게 보존한다.

### CI 스크립트 요점

공식 Bash 예시는 기존 앱을 갱신한다. `jq`, 동작하는 빌드 스크립트, 복원된 CLI 자격 증명이 필요하다. `CI_CACHE`, `SDK_VERSION`, `CI_COMMIT_TITLE`을 설정하고 `PKG`를 바꾼다.

```bash
export XDG_CONFIG_HOME="$CI_CACHE/evenhub"   # credentials + draft cache
npm run build || exit 1                      # 오래된 dist/가 배포되는 것을 막는다
evenhub pack app.json dist -o out.ehpk --sdk-ver "$SDK_VERSION" --json > pack.json
VERSION=$(jq -er .version pack.json) || exit 1
evenhub upload out.ehpk -m "$CI_COMMIT_TITLE" --package-id "$PKG" --json > upload.json
evenhub promote "$VERSION" --to beta --package-id "$PKG" --json > promote.json
evenhub ls "$PKG" --json > builds.json
evenhub testers --package-id "$PKG" --json > testers.json
```

| 단계 | exit 처리 |
|---|---|
| pack | 0 계속. 9는 manifest·프로젝트 오류이지 일시 실패가 아니다. 그 외 실패 |
| upload | 0 업로드. 4는 이미 있는 버전으로 계속. 2는 `credentials.yaml` 갱신 필요 |
| upload | 8은 `message`, `hint` 출력. `.code == 1007`이면 exit 75, 아니면 1 |
| upload | 11은 `message`, `hint`, `partial` 출력 후 중단 |
| promote | 실패하면 `message`, `hint` 출력 후 중단 |
| ls | 실패하면 중단. `.versions[]`의 해당 버전 `.channels`에 `"beta"`가 없으면 중단 |
| testers | 조회 실패는 job 실패. `status == "Active"`가 0명이면 경고만 |

- exit 4로 계속하는 경로는 같은 산출물의 재시도일 때만 쓴다. CLI는 패키지 바이트를 비교하지 않는다.
- 이미 있는 업로드도 promote와 채널 확인이 필요하다.
- 각 조회의 exit code를 먼저 읽는다. 실패 객체에 대한 `jq` 실패가 "일치 없음"처럼 보인다.
- exit 11은 빌드 생성을 증명하지 않는다. `partial`을 보고 로컬 실패를 고친다.

### 셸 자동완성

자동완성은 `evenhub`와 `eh`를 모두 지원한다.

| 셸 | 명령 |
|---|---|
| Bash | `evenhub --completion-bash > ~/.evenhub-completion.bash`, `~/.bashrc`에 `source ~/.evenhub-completion.bash` |
| Zsh | `mkdir -p ~/.zfunc`, `evenhub --completion-zsh > ~/.zfunc/_evenhub` |
| Fish | `evenhub --completion-fish > ~/.config/fish/completions/evenhub.fish` |
| Fish 별칭 | `echo 'complete -c eh -w evenhub' > ~/.config/fish/completions/eh.fish` |

- Zsh는 `~/.zshrc`에서 `fpath=(~/.zfunc $fpath)`, `autoload -Uz compinit`, `compinit` 순으로 둔다.
- 셸 프레임워크가 이미 `compinit`을 부르면 `fpath` 줄만 그 앞에 넣는다.
- Fish는 명령 이름으로 자동완성을 읽는다. 그래서 별칭은 파일을 따로 둔다.

## 공식 페이지 사이의 불일치

원문: <https://hub.evenrealities.com/docs/cli/testers>, <https://hub.evenrealities.com/docs/test/beta-testing>, <https://hub.evenrealities.com/docs/cli/apps>, <https://hub.evenrealities.com/docs/ship/app-submission>

- CSV 헤더: CLI Testers는 `email` 헤더가 선택이라고 한다. Beta Testing(포털 Import CSV)은 1행이 `email`이 아니면 거부한다고 한다.
- 아이콘: CLI Apps는 픽셀이 완전 투명이거나 불투명 `#F4F4F4`여야 한다. 심사 기준은 "monochrome / greyscale only"라고만 한다.
