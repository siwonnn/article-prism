"use client"

import * as React from "react"
import { useArticleContext } from "@/components/article-context"
import ReactMarkdown from "react-markdown"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { type UIHighlight } from "@/lib/types"
import { generateVocabHelp } from "@/app/actions/vocab-help"
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip"

type OriginalArticleTabProps = {
  highlights?: UIHighlight[]
  vocabState: "none" | "loading" | "shown" | "hidden"
  setVocabState: React.Dispatch<React.SetStateAction<"none" | "loading" | "shown" | "hidden">>
  vocabHighlights: UIHighlight[]
  setVocabHighlights: React.Dispatch<React.SetStateAction<UIHighlight[]>>
}

export default function OriginalArticleTab({
  highlights = [],
  vocabState,
  setVocabState,
  vocabHighlights,
  setVocabHighlights,
}: OriginalArticleTabProps) {
  const { article } = useArticleContext()
  const propHighlights = highlights ?? []

  function renderTextWithHighlights(text: string, renderHighlights: UIHighlight[]) {
    if (!renderHighlights.length) return text

    const matches: { start: number; end: number; hl: UIHighlight }[] = []
    for (const hl of renderHighlights) {
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
    matches.forEach((m) => {
      if (m.start < cursor) return
      if (m.start > cursor) {
        parts.push(text.slice(cursor, m.start))
      }
      parts.push(
        <span key={`${m.start}-${m.end}`} className="relative inline-block group">
          <Tooltip>
            <TooltipTrigger>
              <mark
                className={`${m.hl.colorClass} rounded px-1 ring-1 ring-inset`}
              >
                {text.slice(m.start, m.end)}
              </mark>
            </TooltipTrigger>

            {m.hl.explanation && (
              <TooltipContent>{m.hl.explanation}</TooltipContent>
            )}
          </Tooltip>
        </span>
      )
      cursor = m.end
    })
    if (cursor < text.length) parts.push(text.slice(cursor))
    return parts
  }

  function renderHighlightedChildren(children: React.ReactNode): React.ReactNode {
    return React.Children.map(children, (child) => {
      if (typeof child === "string") {
        // always render propHighlights, and vocabHighlights only when vocabState is "shown"
        let renderHighlights: UIHighlight[] = propHighlights
        if (vocabState === "shown") renderHighlights = renderHighlights.concat(vocabHighlights)
        return renderTextWithHighlights(child, renderHighlights)
      }
      return child
    })
  }

  async function vocabClicked() {
    if (vocabState === "none") { // load vocabulary help
      setVocabState("loading")
      const vocabHelp = await generateVocabHelp(article?.content ?? "")
      setVocabHighlights(vocabHelp)
      setVocabState("shown")
    } else if (vocabState === "shown") { // toggle
      setVocabState("hidden")
    } else if (vocabState === "hidden") { 
      setVocabState("shown")
    }
  }

  return (
    <Card className="border-dashed bg-muted/30 p-6">
      <CardHeader>
        <CardTitle className="flex text-xs font-medium uppercase text-muted-foreground">
          <div>original article</div>
          <Button
            className={`ml-auto gap-2 transition-all ${
              vocabState === "shown"
                ? "bg-primary text-primary-foreground"
                : vocabState === "hidden"
                  ? "bg-muted text-muted-foreground"
                  : "bg-background"
            }`}
            variant="outline"
            onClick={vocabClicked}
            disabled={vocabState === "loading"}>
            {vocabState === "loading" ? (
              <div>Loading...</div>
            ) : (
              <div>Vocabulary Help</div>
            )}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="whitespace-pre-wrap leading-6 font-serif font-medium text-[17px]">
        <TooltipProvider>
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
        </TooltipProvider>
      </CardContent>
    </Card>
  )
}