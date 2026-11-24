// 실행: EVEN_AGENT_TOKEN=... WIKI_DIR=... npm start -w services/even-agent
// Anthropic 인증은 SDK 기본 순서(ANTHROPIC_API_KEY, `ant auth login` 프로필 등)를 따른다.
import Anthropic from '@anthropic-ai/sdk'
import path from 'node:path'
import { createAgent } from './agent.ts'
import { saveLocation } from './location.ts'
import { createAgentServer } from './server.ts'

const env = process.env
const token = env.EVEN_AGENT_TOKEN
const wikiDir = env.WIKI_DIR
if (!token || token.length < 24) throw new Error('EVEN_AGENT_TOKEN은 24자 이상으로 둔다')
if (!wikiDir) throw new Error('WIKI_DIR(위키 마크다운 폴더)가 필요하다')

const locationFile = path.resolve(env.LOCATION_FILE ?? 'location.json')
const port = Number(env.PORT ?? 3458)
const bind = env.BIND ?? '127.0.0.1'

const answer = createAgent({ client: new Anthropic(), model: env.MODEL ?? 'claude-sonnet-5-5', wikiDir, locationFile })
createAgentServer({ token, answer, saveLocation: (body) => saveLocation(locationFile, body) }).listen(port, bind, () =>
  console.log(`even-agent: http://${bind}:${port}/v1/chat/completions (wiki ${wikiDir})`),
)
