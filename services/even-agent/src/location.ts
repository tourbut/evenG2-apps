// 폰이 보내 주는 마지막 위치를 파일 하나에 둔다. Even 앱의 에이전트 요청에는 위치가 없다.
import { readFile, writeFile } from 'node:fs/promises'

export type Location = { lat: number; lon: number; accuracy?: number; at: string }

/** `{ lat, lon, accuracy? }`를 받는다(OwnTracks의 location 메시지도 같은 이름을 쓴다). 형식이 틀리면 던진다. */
export async function saveLocation(file: string, body: unknown): Promise<Location> {
  const { lat, lon, acc, accuracy } = (body ?? {}) as Record<string, unknown>
  if (typeof lat !== 'number' || typeof lon !== 'number' || Math.abs(lat) > 90 || Math.abs(lon) > 180) {
    throw new Error('lat·lon 숫자가 필요하다')
  }
  const meters = typeof accuracy === 'number' ? accuracy : typeof acc === 'number' ? acc : undefined
  const location: Location = { lat, lon, accuracy: meters, at: new Date().toISOString() }
  await writeFile(file, JSON.stringify(location))
  return location
}

export async function readLocation(file: string): Promise<Location | null> {
  try {
    return JSON.parse(await readFile(file, 'utf8')) as Location
  } catch {
    return null
  }
}
