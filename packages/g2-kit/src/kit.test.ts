// g2-kit 동작 확인: 입력 정규화, 반복 필터, 브리지 큐, 바이트 자르기.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { OsEventTypeList as T, type EvenHubEvent } from '@evenrealities/even_hub_sdk'
import { eventTypeOf, createRepeatFilter } from './events.ts'
import { createBridgeQueue, BridgeTimeoutError } from './bridge.ts'
import { fitUtf8Bytes } from './text.ts'

const ev = (e: object) => e as EvenHubEvent

test('eventTypeOf: eventType 없는 봉투는 탭', () => {
  assert.equal(eventTypeOf(ev({ sysEvent: {} })), T.CLICK_EVENT)
  assert.equal(eventTypeOf(ev({ textEvent: {} })), T.CLICK_EVENT)
  assert.equal(eventTypeOf(ev({ listEvent: { currentSelectItemIndex: 2 } })), T.CLICK_EVENT)
})

test('eventTypeOf: 명시 값이 탭 기본값보다 먼저', () => {
  assert.equal(eventTypeOf(ev({ sysEvent: {}, textEvent: { eventType: T.SCROLL_TOP_EVENT } })), T.SCROLL_TOP_EVENT)
  assert.equal(eventTypeOf(ev({ sysEvent: { eventType: T.DOUBLE_CLICK_EVENT } })), T.DOUBLE_CLICK_EVENT)
})

test('eventTypeOf: 입력 봉투가 없으면 null (오디오가 가짜 탭이 되지 않음)', () => {
  assert.equal(eventTypeOf(ev({ audioEvent: { audioPcm: new Uint8Array() } })), null)
  assert.equal(eventTypeOf(ev({})), null)
})

test('createRepeatFilter: 창 안의 같은 탭·스크롤은 버리고 다른 종류는 통과', () => {
  const accept = createRepeatFilter(400)
  assert.equal(accept(T.CLICK_EVENT, 0), true)
  assert.equal(accept(T.CLICK_EVENT, 350), false)
  assert.equal(accept(T.CLICK_EVENT, 800), true)
  assert.equal(accept(T.DOUBLE_CLICK_EVENT, 810), true)
  assert.equal(accept(T.SCROLL_BOTTOM_EVENT, 1000), true)
  assert.equal(accept(T.SCROLL_BOTTOM_EVENT, 1100), false)
  assert.equal(accept(T.SCROLL_TOP_EVENT, 1150), true)
})

test('createBridgeQueue: 순서대로 하나씩 실행', async () => {
  const call = createBridgeQueue(1000)
  const log: string[] = []
  let running = 0
  const job = (name: string, ms: number) => () =>
    new Promise<string>((resolve) => {
      running += 1
      assert.equal(running, 1)
      log.push(`start ${name}`)
      setTimeout(() => {
        running -= 1
        log.push(`end ${name}`)
        resolve(name)
      }, ms)
    })
  const results = await Promise.all([call(job('a', 30)), call(job('b', 5))])
  assert.deepEqual(results, ['a', 'b'])
  assert.deepEqual(log, ['start a', 'end a', 'start b', 'end b'])
})

test('createBridgeQueue: 응답 없는 호출은 시간 제한 뒤 거부되고 다음 호출은 돈다', async () => {
  const call = createBridgeQueue(20)
  const hung = call(() => new Promise<never>(() => {}))
  const next = call(async () => 'next')
  await assert.rejects(hung, BridgeTimeoutError)
  assert.equal(await next, 'next')
})

test('fitUtf8Bytes: 한글은 3바이트, 글자 중간에서 자르지 않음', () => {
  assert.equal(fitUtf8Bytes('가나다', 7), '가나')
  assert.equal(fitUtf8Bytes('ab가', 4), 'ab')
  assert.equal(fitUtf8Bytes('hello', 10), 'hello')
  assert.equal(fitUtf8Bytes('가', 0), '')
})
