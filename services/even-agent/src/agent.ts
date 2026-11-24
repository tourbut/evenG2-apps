// 질문 하나에 답하는 에이전트. 루프는 SDK Tool Runner가 돌리고, 도구는 위키·위치(이 서버)와 웹 검색(Anthropic 서버 도구)이다.
import type Anthropic from '@anthropic-ai/sdk'
import { betaZodTool } from '@anthropic-ai/sdk/helpers/beta/zod'
import { z } from 'zod'
import { readLocation } from './location.ts'
import { readWikiPage, searchWiki } from './wiki.ts'

const SYSTEM = `너는 Even G2 스마트 안경의 음성 비서다. 사용자는 걸으면서 말로 묻고, 답은 안경 렌즈에 글자로 뜬다.
- 한국어로 답한다. 350자 안, 보통은 두세 문장. 마크다운·목록·링크·출처 표기 없이 평문으로 쓴다.
- 사용자 개인 지식(메모, 정리한 개념, 프로젝트)이 걸린 질문은 먼저 wiki_search로 찾고, 필요한 페이지만 wiki_read로 읽는다.
- 최신 정보(뉴스, 날씨, 가격, 영업시간 등)는 web_search로 찾는다.
- "여기", "근처", "지금 있는 곳"처럼 위치가 필요한 질문이면 get_location을 부른다. 위치가 없거나 오래됐으면 그렇다고 말한다.
- 도구를 너무 많이 부르지 않는다. 사용자는 25초 안의 답을 기다린다.
- 모르면 모른다고 짧게 말한다.`

export type AgentOptions = { client: Anthropic; model: string; wikiDir: string; locationFile: string }

export function createAgent({ client, model, wikiDir, locationFile }: AgentOptions): (question: string) => Promise<string> {
  const tools = [
    betaZodTool({
      name: 'wiki_search',
      description: '사용자의 개인 위키(마크다운)에서 낱말로 페이지를 찾는다. 조사를 뺀 핵심 낱말 몇 개를 공백으로 넣는다. 페이지 경로·점수·한 줄 미리보기를 돌려준다.',
      inputSchema: z.object({ query: z.string().describe('예: "하네스 엔지니어링"') }),
      run: async ({ query }) => JSON.stringify(await searchWiki(wikiDir, query)),
    }),
    betaZodTool({
      name: 'wiki_read',
      description: 'wiki_search가 돌려준 페이지 경로 하나를 읽는다.',
      inputSchema: z.object({ page: z.string() }),
      run: ({ page }) => readWikiPage(wikiDir, page),
    }),
    betaZodTool({
      name: 'get_location',
      description: '사용자 폰이 마지막으로 보낸 위치(위도, 경도, 정확도 m, 받은 시각 UTC)를 돌려준다. 없으면 null.',
      inputSchema: z.object({}),
      run: async () => JSON.stringify(await readLocation(locationFile)),
    }),
  ]

  return async (question) => {
    const now = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })
    const final = await client.beta.messages.toolRunner({
      model,
      max_tokens: 16000,
      max_iterations: 8,
      output_config: { effort: 'low' },
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      system: SYSTEM,
      tools: [...tools, { type: 'web_search_20260209', name: 'web_search', max_uses: 3 }],
      // 시각은 바뀌는 값이라 system이 아니라 질문 쪽에 둔다
      messages: [{ role: 'user', content: `[지금: ${now} KST]\n${question}` }],
    })
    if (final.stop_reason === 'refusal') return '그 질문에는 답할 수 없어요.'
    const text = final.content.flatMap((block) => (block.type === 'text' ? [block.text] : [])).join('\n').trim()
    return text || '답을 찾지 못했어요.'
  }
}
