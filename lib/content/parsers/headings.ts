export function parseHeadings(markdown: string) {
  return markdown
    .split('\n')
    .filter((line) => /^#{1,6}\s+/.test(line))
    .map((line) => {
      const [, hashes, text] = line.match(/^(#{1,6})\s+(.*)$/) ?? []
      const cleaned = text?.trim() ?? ''
      return {
        depth: hashes?.length ?? 1,
        text: cleaned,
        id: cleaned
          .toLowerCase()
          .replace(/[^\p{Letter}\p{Number}\s-]/gu, '')
          .trim()
          .replace(/\s+/g, '-'),
      }
    })
}
