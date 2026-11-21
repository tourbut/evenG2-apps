// 글자를 UTF-8 바이트 한도 안으로 자른다. 한글은 3바이트라 글자 수 한도보다 일찍 찬다(.fullops/docs/even-g2/knowhow.md KH-024).
import { utf8ByteLength } from '@evenrealities/even_hub_sdk'

/** 앞에서부터 maxBytes 안에 들어가는 만큼만 남긴다. 글자(코드 포인트) 중간에서 자르지 않는다. */
export function fitUtf8Bytes(text: string, maxBytes: number): string {
  let used = 0
  let out = ''
  for (const ch of text) {
    const size = utf8ByteLength(ch)
    if (used + size > maxBytes) break
    used += size
    out += ch
  }
  return out
}
