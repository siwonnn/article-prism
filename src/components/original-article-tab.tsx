"use client"

import * as React from "react"
import { useArticleContext } from "@/components/article-context"
import ReactMarkdown from "react-markdown"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { type UIHighlight } from "@/lib/types"

export default function OriginalArticleTab(props: {
  highlights?: UIHighlight[]
}) {
  const { article } = useArticleContext()
  const highlights = props.highlights ?? []

  function renderTextWithHighlights(text: string) {
    if (!highlights.length) return text

    const matches: { start: number; end: number; hl: UIHighlight }[] = []
    for (const hl of highlights) {
      let pos = text.indexOf(hl.text)
      while (pos !== -1) {
        matches.push({ start: pos, end: pos + hl.text.length, hl })
        pos = text.indexOf(hl.text, pos + hl.text.length)
      }
    }
    if (matches.length === 0) return text

    matches.sort((a, b) => a.start - b.start)

    const parts: React.ReactNode[] = []
    let cursor = 0
    matches.forEach((m, i) => {
      if (m.start < cursor) return
      if (m.start > cursor) {
        parts.push(text.slice(cursor, m.start))
      }
      parts.push(
        <mark
          key={`${m.start}-${m.end}`}
          className={`${m.hl.colorClass} rounded px-1 ring-1 ring-inset`}
        >
          {text.slice(m.start, m.end)}
        </mark>
      )
      cursor = m.end
    })
    if (cursor < text.length) parts.push(text.slice(cursor))
    return parts
  }

  function renderHighlightedChildren(children: React.ReactNode): React.ReactNode {
    return React.Children.map(children, (child) => {
      if (typeof child === "string") {
        return renderTextWithHighlights(child)
      }
      return child
    })
  }

  return (
    <Card className="border-dashed bg-muted/30 p-6">
      <CardHeader>
        <CardTitle className="text-xs font-medium uppercase text-muted-foreground">
          original article
        </CardTitle>
      </CardHeader>
      <CardContent className="whitespace-pre-wrap leading-6 font-serif font-medium text-[17px]">
        <ReactMarkdown
          components={{
            p: ({ children }) => <p>{renderHighlightedChildren(children)}</p>,
            li: ({ children }) => <li>{renderHighlightedChildren(children)}</li>,
            blockquote: ({ children }) => <blockquote>{renderHighlightedChildren(children)}</blockquote>,
            strong: ({ children }) => <strong>{renderHighlightedChildren(children)}</strong>,
            em: ({ children }) => <em>{renderHighlightedChildren(children)}</em>,
            code: ({ children }) => <code>{renderHighlightedChildren(children)}</code>,
            a: ({ children, href }) => <a href={href}>{renderHighlightedChildren(children)}</a>,
            h1: ({ children }) => <h1>{renderHighlightedChildren(children)}</h1>,
            h2: ({ children }) => <h2>{renderHighlightedChildren(children)}</h2>,
            h3: ({ children }) => <h3>{renderHighlightedChildren(children)}</h3>,
            h4: ({ children }) => <h4>{renderHighlightedChildren(children)}</h4>,
            h5: ({ children }) => <h5>{renderHighlightedChildren(children)}</h5>,
            h6: ({ children }) => <h6>{renderHighlightedChildren(children)}</h6>,
          }}
        >
          {article?.content ?? ""}
        </ReactMarkdown>
      </CardContent>
    </Card>
  )
}