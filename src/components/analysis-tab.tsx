"use client"

import * as React from "react"
import { useArticleContext } from "@/components/article-context"
import { type AnalysisResult, analyzeArticle } from "@/app/actions/analyze-article"
import OriginalArticleTab from "./original-article-tab"

export default function AnalysisTab() {
  const { article } = useArticleContext()
  const [isLoading, setIsLoading] = React.useState(false)
  const [analysisResult, setAnalysisResult] = React.useState<AnalysisResult | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!article) {
      setIsLoading(false)
      setAnalysisResult(null)
      setError(null)
      return
    }

    const runAnalysis = async () => {
      setIsLoading(true)
      setError(null)
      setAnalysisResult(null)

      try {
        const analysis = await analyzeArticle(article)
        setAnalysisResult(analysis)
      } catch (caughtError) {
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Failed to analyze article"
        )
      } finally {
        setIsLoading(false)
      }
    }

    void runAnalysis()
  }, [article?.url, article?.content])

  return (
    <div className="flex gap-2">
      <div className="w-1/2">
        <OriginalArticleTab />
      </div>

      <div className="w-1/2 min-h-[18rem] rounded-3xl border border-dashed border-border/70 bg-muted/30 p-6">
        <div className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          analysis
        </div>
        {isLoading ? (
          <div className="text-muted-foreground">Loading...</div>
        ) : error ? (
          <div className="text-sm text-destructive">{error}</div>
        ) : analysisResult ? (
          <pre className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
            {JSON.stringify(analysisResult, null, 2)}
          </pre>
        ) : (
          <div className="text-muted-foreground">Select an article to start the analysis.</div>
        )}
      </div>
    </div>
  )
}