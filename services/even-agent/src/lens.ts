// 답을 렌즈에 맞춘다. 렌즈는 마크다운을 그리지 않고 400~500자 정도만 보인다(커뮤니티 보고), 350자로 여유를 둔다.

export function toLens(text: string, maxChars = 350): string {
  const plain = text
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^#{1,6}\s*/gm, '')
    .replace(/^\s*[-*+]\s+/gm, '· ')
    .replace(/(\*\*|__|`)/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
  const chars = [...plain]
  if (chars.length <= maxChars) return plain
  const head = chars.slice(0, maxChars).join('')
  // 문장 끝에서 자르되, 너무 앞에서 끊기면 글자 수로 자른다
  const end = Math.max(...['. ', '? ', '! ', '다.', '요.', '\n'].map((mark) => head.lastIndexOf(mark)))
  return end > head.length / 2 ? head.slice(0, end + 2).trim() : `${chars.slice(0, maxChars - 1).join('')}…`
}
