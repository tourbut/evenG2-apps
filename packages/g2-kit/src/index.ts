// G2 앱 공통 도구: 입력 정규화, 브리지 호출 큐, UTF-8 바이트 자르기.
export { eventTypeOf, createRepeatFilter } from './events.ts'
export { createBridgeQueue, BridgeTimeoutError } from './bridge.ts'
export { fitUtf8Bytes } from './text.ts'
