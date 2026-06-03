"use client"

import { Article } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { ExternalLink } from "lucide-react"

type RelevantArticlesTabProps = {
  relevantArticles: Article[],
  isLoading: boolean,
  error: string | null
}

export default function RelevantArticleTab({
  relevantArticles,
  isLoading,
  error
}: RelevantArticlesTabProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">{error}</div>
    )
  }

  if (!isLoading && error !== null) {
    return (
      <div className="text-sm text-destructive">{error}</div>
    )
  }
  
  if (relevantArticles.length === 0) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">
        No relevant articles found.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {relevantArticles.map((article, index) => (
        <Card key={index} className="border border-border/60 shadow-none">
          <CardContent className="flex gap-4 p-4">
            <span className="mt-0.5 shrink-0 text-2xl font-black text-muted-foreground/40 font-serif leading-none w-7 text-right">
              {index + 1}
            </span>
            <div className="flex flex-col gap-1.5 min-w-0">
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-1.5 font-semibold text-foreground hover:text-primary transition-colors"
              >
                <span className="leading-snug">
                  {article.title ?? article.url}
                </span>
                <ExternalLink className="mt-0.5 size-3.5 shrink-0 opacity-50 group-hover:opacity-100 transition-opacity" />
              </a>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {article.explanation}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}