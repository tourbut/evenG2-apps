// Even 앱 Agent Configuration이 부르는 OpenAI 형식 엔드포인트.
// 앱 동작(공개 어댑터 even-agent-sample·even-g2-agent-adapter가 관찰한 것): 사용자 문장 하나만 보내고,
// 스트리밍 없이 choices[0].message.content를 렌즈에 띄우며, 같은 요청을 몇 ms 간격으로 두 번 보낸다.
import { timingSafeEqual } from 'node:crypto'
import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http'
import { toLens } from './lens.ts'

const STILL_WORKING = '아직 찾는 중이에요. 잠시 뒤 같은 질문을 다시 해 주세요.'
const FAILED = '답을 만들지 못했어요. 잠시 뒤 다시 물어봐 주세요.'
const DUPLICATE_MS = 5_000
const LATE_KEEP_MS = 10 * 60_000
const MAX_BODY = 64 * 1024

export type ServerOptions = {
  token: string
  answer: (question: string) => Promise<string>
  saveLocation: (body: unknown) => Promise<unknown>
  /** 앱이 기다리는 시간 안에 먼저 돌려줄 한도. 넘으면 STILL_WORKING을 주고 답은 계속 만든다. */
  waitMs?: number
  maxChars?: number
  log?: (message: string) => void
}

type Job = { promise: Promise<string>; late: boolean }

export function createAgentServer(options: ServerOptions): Server {
  const { token, answer, saveLocation, waitMs = 25_000, maxChars = 350, log = console.log } = options
  const jobs = new Map<string, Job>()

  // 같은 질문은 답 하나를 나눠 쓴다: 두 번 오는 요청, 그리고 시간 초과 뒤 다시 묻는 경우
  const jobFor = (question: string): Job => {
    const existing = jobs.get(question)
    if (existing) return existing
    const started = Date.now()
    const job: Job = {
      promise: answer(question).then(
        (text) => toLens(text, maxChars),
        (error: unknown) => {
          log(`answer failed: ${error instanceof Error ? error.message : String(error)}`)
          return FAILED
        },
      ),
      late: false,
    }
    jobs.set(question, job)
    void job.promise.then(() => {
      log(`answered in ${Date.now() - started} ms`)
      const keep = job.late ? LATE_KEEP_MS : DUPLICATE_MS
      setTimeout(() => jobs.get(question) === job && jobs.delete(question), keep).unref()
    })
    return job
  }

  const reply = async (question: string): Promise<string> => {
    const job = jobFor(question)
    let timer: ReturnType<typeof setTimeout> | undefined
    const timeout = new Promise<null>((resolve) => (timer = setTimeout(() => resolve(null), waitMs)))
    const text = await Promise.race([job.promise, timeout]).finally(() => clearTimeout(timer))
    if (text === null) {
      job.late = true
      return STILL_WORKING
    }
    if (job.late) jobs.delete(question) // 늦게 끝난 답을 건넸다
    return text
  }

  return createServer(async (req, res) => {
    try {
      if (!authorized(req.headers.authorization, token)) return send(res, 401, { error: 'unauthorized' })
      if (req.method === 'POST' && req.url === '/v1/chat/completions') {
        const body = await readJson(req)
        const question = lastUserText(body)
        const text = question ? await reply(question) : '질문을 듣지 못했어요.'
        return send(res, 200, completion(text, (body as { model?: string }).model))
      }
      if (req.method === 'POST' && req.url === '/location') {
        await saveLocation(await readJson(req))
        return send(res, 204)
      }
      return send(res, 404, { error: 'not found' })
    } catch (error) {
      log(`request failed: ${error instanceof Error ? error.message : String(error)}`)
      return send(res, 400, { error: 'bad request' })
    }
  })
}

function authorized(header: string | undefined, token: string): boolean {
  const given = Buffer.from(header ?? '')
  const expected = Buffer.from(`Bearer ${token}`)
  return given.length === expected.length && timingSafeEqual(given, expected)
}

async function readJson(req: IncomingMessage): Promise<unknown> {
  let size = 0
  const chunks: Buffer[] = []
  for await (const chunk of req as AsyncIterable<Buffer>) {
    size += chunk.length
    if (size > MAX_BODY) throw new Error('body too large')
    chunks.push(chunk)
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'))
}

function lastUserText(body: unknown): string {
  const messages = (body as { messages?: { role?: string; content?: unknown }[] }).messages ?? []
  const content = messages.findLast((m) => m.role === 'user')?.content
  if (typeof content === 'string') return content.trim()
  if (!Array.isArray(content)) return ''
  return content.map((part: { text?: unknown }) => (typeof part.text === 'string' ? part.text : '')).join(' ').trim()
}

function completion(text: string, model = 'even-agent') {
  return {
    id: `chatcmpl-${Date.now().toString(36)}`,
    object: 'chat.completion',
    created: Math.floor(Date.now() / 1000),
    model,
    choices: [{ index: 0, message: { role: 'assistant', content: text }, finish_reason: 'stop' }],
  }
}

function send(res: ServerResponse, status: number, body?: unknown): void {
  res.writeHead(status, body === undefined ? {} : { 'content-type': 'application/json; charset=utf-8' })
  res.end(body === undefined ? undefined : JSON.stringify(body))
}
