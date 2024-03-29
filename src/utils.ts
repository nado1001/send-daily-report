export function* range(start, end) {
  for (let i = start; i < end; i++) {
    yield i
  }
}
export const formatTime = (_start: string, _end: string) => {
  const start = new Date(_start)
  const end = new Date(_end)
  const startTime =
    start.getHours() + ':' + start.getMinutes().toString().padStart(2, '0')
  const endTime =
    end.getHours() + ':' + end.getMinutes().toString().padStart(2, '0')

  return `${startTime} ~ ${endTime}`
}

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms))

export const removeDabbleQuote = (str: string) => {
  if (str[0] !== '"' && str[str.length - 1] !== '"') {
    return str
  }

  return str.slice(1, -1)
}
