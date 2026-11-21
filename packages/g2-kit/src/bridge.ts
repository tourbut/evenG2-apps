// 브리지 호출을 한 줄로 세우고 시간 제한을 둔다(.fullops/docs/even-g2/knowhow.md KH-031·032).
// 동시 호출은 브리지를 멈출 수 있고, 응답 없는 호출 하나가 이후 화면 갱신을 모두 막을 수 있다.

export class BridgeTimeoutError extends Error {}

/**
 * 브리지 호출 큐를 만든다. 호출은 넣은 순서대로 하나씩 돈다.
 * 시간이 넘으면 BridgeTimeoutError로 거부하고 다음 호출로 넘어간다. 넘긴 호출 자체는 취소되지 않는다.
 */
export function createBridgeQueue(timeoutMs = 6000): <T>(call: () => Promise<T>) => Promise<T> {
  let tail: Promise<unknown> = Promise.resolve()
  return <T>(call: () => Promise<T>): Promise<T> => {
    const run = tail.then(() => withTimeout(call(), timeoutMs))
    tail = run.catch(() => undefined)
    return run
  }
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new BridgeTimeoutError(`bridge call timed out after ${ms} ms`)), ms)
  })
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer))
}
