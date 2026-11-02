import katex from 'katex'
import { useMemo } from 'react'

interface MathViewProps {
  math: string
  block?: boolean
}

export function MathView({ math, block = false }: MathViewProps) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(math, {
        displayMode: block,
        throwOnError: false,
      })
    } catch {
      return math
    }
  }, [math, block])

  if (block) {
    return <div className="katex-display-wrapper" dangerouslySetInnerHTML={{ __html: html }} />
  }
  return <span className="katex-inline-wrapper" dangerouslySetInnerHTML={{ __html: html }} />
}
