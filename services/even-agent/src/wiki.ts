// 홈서버의 위키 마크다운 폴더를 찾고 읽는다. 원격 myknows MCP 대신 같은 내용의 로컬 클론을 쓴다.
import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'

const MAX_PAGE_CHARS = 12000
const MAX_RESULTS = 8

export type WikiHit = { page: string; score: number; snippet: string }

/** 검색어 낱말이 많이 나오는 페이지 순으로 돌려준다. 파일 이름에 낱말이 있으면 가중치를 더 준다. */
export async function searchWiki(dir: string, query: string): Promise<WikiHit[]> {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean)
  if (terms.length === 0) return []
  const entries = await readdir(dir, { recursive: true, withFileTypes: true })
  const hits: WikiHit[] = []
  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith('.md')) continue
    const file = path.join(entry.parentPath, entry.name)
    const text = await readFile(file, 'utf8')
    const lower = text.toLowerCase()
    const name = entry.name.toLowerCase()
    let score = 0
    for (const term of terms) score += lower.split(term).length - 1 + (name.includes(term) ? 5 : 0)
    if (score === 0) continue
    const line = text.split('\n').find((l) => terms.some((t) => l.toLowerCase().includes(t))) ?? ''
    hits.push({ page: path.relative(dir, file), score, snippet: line.trim().slice(0, 160) })
  }
  return hits.sort((a, b) => b.score - a.score).slice(0, MAX_RESULTS)
}

/** 위키 폴더 안의 페이지 하나를 읽는다. 폴더 밖 경로는 거부한다(도구 입력은 모델이 만든다). */
export async function readWikiPage(dir: string, page: string): Promise<string> {
  const root = path.resolve(dir)
  const file = path.resolve(root, page)
  if (!file.startsWith(root + path.sep) || !file.endsWith('.md')) throw new Error(`위키 폴더 안의 .md만 읽는다: ${page}`)
  const text = await readFile(file, 'utf8')
  return text.length > MAX_PAGE_CHARS ? `${text.slice(0, MAX_PAGE_CHARS)}\n…(뒷부분 생략)` : text
}
