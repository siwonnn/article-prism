"use client"

import { useArticleContext } from "@/components/article-context"

export default function AnalysisTab() {
  const { article } = useArticleContext()

  return (
    <div className="min-h-[18rem] rounded-3xl border border-dashed border-border/70 bg-muted/30 p-6">
      <div className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
        analysis
      </div>
    </div>
  )
}