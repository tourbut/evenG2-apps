#!/bin/sh
# 새 G2 앱을 apps/<app-id>에 만든다. 공식 minimal 템플릿을 복사하고, 그대로 내면 반려되는 값(knowhow KH-051)을 바꾼다.
# 사용: npm run new-app -- <app-id> "<표시 이름>" [dev 포트]
# package_id 접두사는 G2_PACKAGE_PREFIX(기본 com.tourbut)로 바꾼다.
set -eu

id=${1:-}
name=${2:-}
if [ -z "$id" ] || [ -z "$name" ]; then
  echo "사용: npm run new-app -- <app-id> \"<표시 이름>\" [dev 포트]" >&2
  exit 2
fi
# package_id 한 단: 소문자로 시작, 소문자·숫자만(하이픈·밑줄 없음)
if ! printf '%s' "$id" | grep -Eq '^[a-z][a-z0-9]*$'; then
  echo "app-id는 소문자로 시작하고 소문자·숫자만 쓴다: $id" >&2
  exit 2
fi

root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
dir="$root/apps/$id"
if [ -e "$dir" ]; then
  echo "이미 있다: $dir" >&2
  exit 2
fi
prefix=${G2_PACKAGE_PREFIX:-com.tourbut}
# 앱마다 dev 포트를 달리해 시뮬레이터를 여러 개 띄울 수 있게 한다
count=$(find "$root/apps" -mindepth 1 -maxdepth 1 -type d | wc -l | tr -d ' ')
port=${3:-$((5173 + count))}
sdk=$(npm view @evenrealities/even_hub_sdk version)
# 템플릿의 vite 5는 개발 서버 취약점(esbuild)이 있고 템플릿은 host: true로 LAN에 연다
vite=$(npm view vite version)

# 중간에 실패하면 반쯤 만든 앱 폴더를 지운다
trap 'rm -rf "$dir"' EXIT
npx -y degit even-realities/evenhub-templates/minimal "$dir"
rm -f "$dir/README.md"

APP_DIR=$dir APP_ID=$id APP_NAME=$name PKG_ID="$prefix.$id" PORT=$port SDK=$sdk VITE=$vite node --input-type=module <<'EOF'
import fs from 'node:fs'
const { APP_DIR: dir, APP_ID: id, APP_NAME: name, PKG_ID: pkgId, PORT: port, SDK: sdk, VITE: viteVersion } = process.env
const fail = (msg) => { fs.rmSync(dir, { recursive: true, force: true }); console.error(msg); process.exit(2) }
if ([...name].length > 20) fail(`표시 이름은 20자 이하: ${name}`)
if (/even/i.test(name)) fail(`표시 이름에 'Even'을 넣으면 사칭으로 반려된다: ${name}`)

const edit = (file, fn) => {
  const path = `${dir}/${file}`
  const json = JSON.parse(fs.readFileSync(path, 'utf8'))
  fn(json)
  fs.writeFileSync(path, JSON.stringify(json, null, 2) + '\n')
}
edit('app.json', (j) => {
  j.package_id = pkgId
  j.name = name
  j.min_sdk_version = sdk
  delete j.min_app_version // pack의 --sdk-ver로 계산하게 둔다
})
edit('package.json', (j) => {
  j.name = `@g2/${id}`
  j.dependencies['@evenrealities/even_hub_sdk'] = `^${sdk}`
  j.dependencies['@g2/kit'] = '*'
  // 템플릿의 옛 CLI·시뮬레이터 대신 전역 설치본을 쓴다(.fullops/docs/even-g2/setup.md)
  delete j.devDependencies['@evenrealities/evenhub-cli']
  delete j.devDependencies['@evenrealities/evenhub-simulator']
  j.devDependencies.vite = `^${viteVersion}`
  j.scripts.typecheck = 'tsc --noEmit'
  j.scripts.pack = `npm run build && evenhub pack app.json dist -o ${id}.ehpk --sdk-ver $(node -p "require('./app.json').min_sdk_version")`
  j.scripts.simulate = `evenhub-simulator http://localhost:${port}`
})
const vite = `${dir}/vite.config.ts`
const src = fs.readFileSync(vite, 'utf8')
if (!src.includes('port: 5173')) fail('템플릿 vite.config.ts 형식이 바뀌었다. 포트를 직접 고친다.')
fs.writeFileSync(vite, src.replace('port: 5173', `port: ${port}`))
fs.writeFileSync(`${dir}/tsconfig.json`, JSON.stringify({ extends: '../../tsconfig.base.json', include: ['src'] }, null, 2) + '\n')
EOF

cd "$root"
npm install
trap - EXIT
echo "만들었다: apps/$id (package_id $prefix.$id, SDK $sdk, dev 포트 $port)"
echo "실행: npm run dev -w apps/$id  /  npm run simulate -w apps/$id"
