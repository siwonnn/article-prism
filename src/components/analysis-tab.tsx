"use client"

import * as React from "react"
import { useArticleContext } from "@/components/article-context"
import { type AnalysisResult, analyzeArticle } from "@/app/actions/analyze-article"
import OriginalArticleTab from "./original-article-tab"
import { Card, CardTitle, CardContent, CardHeader } from "@/components/ui/card"

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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="md:col-span-1">
        <OriginalArticleTab />
      </div>

      <div className="md:col-span-1 flex flex-col gap-4">
        {isLoading ? (
          <div className="text-muted-foreground">Loading analysis…</div>
        ) : error ? (
          <div className="text-sm text-destructive">{error}</div>
        ) : analysisResult ? (
          <div className="flex flex-col gap-4">
            <Card className="bg-muted/30">
              <CardHeader>
                <CardTitle className="font-bold text-lg">Main Claim</CardTitle>
              </CardHeader>
              <CardContent className="text-base">
                {analysisResult.main_claim}
              </CardContent>
            </Card>

            <Card className="bg-muted/30">
              <CardHeader>
                <CardTitle className="font-bold text-lg">Evidences</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3">
                  {analysisResult.evidences.map((evidence, index) => {
                    const strengthStyles =
                      evidence.strength == "strong"
                      ? "bg-emerald-500/15 text-emerald-700 ring-emerald-500/20"
                      : evidence.strength == "weak"
                        ? "bg-amber-500/15 text-amber-700 ring-amber-500/20"
                        : "bg-rose-500/15 text-rose-700 ring-rose-500/20"

                    return (
                      <div 
                        key={index}
                        className="rounded-2xl border border-slate-200/80 bg-slate-50/90 p-4 ring-1 ring-inset ring-slate-200/60"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="text-sm font-semibold text-foreground">Claim</div>
                            <div className="mt-2 text-sm text-muted-foreground">{evidence.claim}</div>
                          </div>

                          <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase ring-1 ${strengthStyles}`}>
                            {evidence.strength}
                          </span>
                        </div>

                        <div className="mt-3">
                          <div className="text-sm font-semibold text-foreground">Support</div>
                          <div className="mt-2 text-sm text-muted-foreground">{evidence.support}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-muted/30">
              <CardHeader>
                <CardTitle className="font-bold text-lg">Assumptions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3">
                  {analysisResult.assumptions.map((assumption, index) => (
                      <div 
                        key={index}
                        className="rounded-2xl border border-slate-200/80 bg-slate-50/90 p-4 ring-1 ring-inset ring-slate-200/60"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="text-sm font-semibold text-foreground">Assumption</div>
                            <div className="mt-2 text-sm text-muted-foreground">{assumption.assumption}</div>
                          </div>
                        </div>

                        <div className="mt-3">
                          <div className="text-sm font-semibold text-foreground">Explanation</div>
                          <div className="mt-2 text-sm text-muted-foreground">{assumption.explanation}</div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-muted-foreground">Select an article to start the analysis.</div>
        )}
      </div>
    </div>
  )
}