// 네트워크·모델 없이 서버 동작(인증, 중복 요청, 시간 초과 뒤 재질문, 위치), 위키 도구, 렌즈 맞춤을 확인한다.
import assert from 'node:assert/strict'
import { mkdtemp, mkdir, writeFile } from 'node:fs/promises'
import type { AddressInfo } from 'node:net'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { test } from 'node:test'
import { toLens } from './lens.ts'
import { readLocation, saveLocation } from './location.ts'
import { createAgentServer, type ServerOptions } from './server.ts'
import { readWikiPage, searchWiki } from './wiki.ts'

const TOKEN = 'test-token'

async function start(options: Partial<ServerOptions>) {
  const server = createAgentServer({ token: TOKEN, answer: async () => '', saveLocation: async () => {}, log: () => {}, ...options })
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
  const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`
  const ask = async (content: string, token = TOKEN) => {
    const res = await fetch(`${base}/v1/chat/completions`, {
      method: 'POST',
      headers: { authorization: `Bearer ${token}` },
      body: JSON.stringify({ model: 'openclaw', messages: [{ role: 'user', content }] }),
    })
    const body = res.status === 200 ? ((await res.json()) as { choices: { message: { content: string } }[] }) : null
    return { status: res.status, text: body?.choices[0].message.content ?? '' }
  }
  return { base, ask, close: () => server.close() }
}

test('서버: 토큰이 틀리면 401', async () => {
  const s = await start({})
  assert.equal((await s.ask('안녕', 'wrong')).status, 401)
  s.close()
})

test('서버: 동시에 두 번 온 같은 질문은 답을 한 번만 만든다', async () => {
  let calls = 0
  const s = await start({ answer: async (q) => (calls++, `답: ${q}`) })
  const [a, b] = await Promise.all([s.ask('날씨'), s.ask('날씨')])
  assert.deepEqual([a.text, b.text, calls], ['답: 날씨', '답: 날씨', 1])
  s.close()
})

test('서버: 시간을 넘기면 먼저 안내하고, 다시 물으면 끝난 답을 준다', async () => {
  let finish = (_: string) => {}
  let calls = 0
  const s = await start({ waitMs: 20, answer: () => (calls++, new Promise((resolve) => (finish = resolve))) })
  assert.match((await s.ask('긴 질문')).text, /아직 찾는 중/)
  finish('늦은 답')
  await new Promise((resolve) => setTimeout(resolve, 5))
  assert.equal((await s.ask('긴 질문')).text, '늦은 답')
  assert.equal(calls, 1)
  s.close()
})

test('서버·위치: 위치를 저장하고 읽는다, 틀린 형식은 400', async () => {
  const file = path.join(await mkdtemp(path.join(tmpdir(), 'loc-')), 'location.json')
  const s = await start({ saveLocation: (body) => saveLocation(file, body) })
  const post = (body: unknown) =>
    fetch(`${s.base}/location`, { method: 'POST', headers: { authorization: `Bearer ${TOKEN}` }, body: JSON.stringify(body) })
  assert.equal((await post({ _type: 'location', lat: 37.5, lon: 127.0, acc: 12 })).status, 204)
  assert.equal((await post({ lat: 'x' })).status, 400)
  assert.deepEqual({ ...(await readLocation(file)), at: undefined }, { lat: 37.5, lon: 127.0, accuracy: 12, at: undefined })
  s.close()
})

test('위키: 낱말이 많은 페이지가 먼저, 폴더 밖은 읽지 않는다', async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'wiki-'))
  await mkdir(path.join(dir, 'concepts'))
  await writeFile(path.join(dir, 'concepts', 'harness.md'), '# 하네스\n하네스 엔지니어링은 하네스를 다룬다.')
  await writeFile(path.join(dir, 'other.md'), '하네스 한 번')
  const hits = await searchWiki(dir, '하네스')
  assert.deepEqual(hits.map((h) => h.page), [path.join('concepts', 'harness.md'), 'other.md'])
  assert.match(await readWikiPage(dir, hits[0].page), /엔지니어링/)
  await assert.rejects(readWikiPage(dir, '../secret.md'))
})

test('렌즈: 마크다운을 걷어내고 문장 끝에서 자른다', () => {
  assert.equal(toLens('## 제목\n- **굵게** [링크](http://x)'), '제목\n· 굵게 링크')
  const long = '첫 문장입니다. '.repeat(30)
  const cut = toLens(long, 50)
  assert.ok([...cut].length <= 50 && cut.endsWith('다.'))
})
