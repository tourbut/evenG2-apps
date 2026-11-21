// 안경 입력 정규화. 탭은 eventType 없이, sys·text·list 어느 봉투로도 올 수 있다(.fullops/docs/even-g2/knowhow.md KH-001·003·004).
import { OsEventTypeList, type EvenHubEvent } from '@evenrealities/even_hub_sdk'

/** 입력 이벤트의 종류를 하나로 읽는다. 입력 봉투가 없으면(오디오·메뉴 등) null. */
export function eventTypeOf(event: EvenHubEvent): OsEventTypeList | null {
  const envelopes = [event.sysEvent, event.textEvent, event.listEvent].filter((e) => e !== undefined)
  // 명시 값(더블탭·스크롤)을 먼저 본다. 탭 기본값을 먼저 쓰면 스크롤이 가짜 탭이 된다.
  for (const envelope of envelopes) {
    if (envelope.eventType !== undefined) return envelope.eventType
  }
  // CLICK_EVENT는 0이라 protobuf가 키를 뺀다. 봉투가 있을 때만 탭으로 본다.
  return envelopes.length > 0 ? OsEventTypeList.CLICK_EVENT : null
}

const REPEAT_FILTERED = new Set<OsEventTypeList>([
  OsEventTypeList.CLICK_EVENT,
  OsEventTypeList.SCROLL_TOP_EVENT,
  OsEventTypeList.SCROLL_BOTTOM_EVENT,
])

/**
 * 짧은 시간 안에 같은 종류가 다시 오면 버리는 필터를 만든다.
 * 한 번 누름이 두 번 오는 탭(KH-003, 약 350 ms)과 스와이프 한 번의 연속 스크롤(KH-004, 약 300 ms)을 거른다.
 */
export function createRepeatFilter(windowMs = 400): (type: OsEventTypeList, now?: number) => boolean {
  let lastType: OsEventTypeList | null = null
  let lastAt = -Infinity
  return (type, now = Date.now()) => {
    if (!REPEAT_FILTERED.has(type)) return true
    if (type === lastType && now - lastAt < windowMs) return false
    lastType = type
    lastAt = now
    return true
  }
}
