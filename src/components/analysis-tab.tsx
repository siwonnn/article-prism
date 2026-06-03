"use client"

import * as React from "react"
import { useArticleContext } from "@/components/article-context"
import { type AnalysisResult, analyzeArticle } from "@/app/actions/analyze-article"
import OriginalArticleTab from "./original-article-tab"
import { Card, CardTitle, CardContent, CardHeader } from "@/components/ui/card"
import { type UIHighlight } from "@/lib/types"
import { ScrollArea } from "./ui/scroll-area"

type AnalysisTabProps = {
  analysisResult: AnalysisResult | null
  setAnalysisResult: React.Dispatch<React.SetStateAction<AnalysisResult | null>>
  vocabState: "none" | "loading" | "shown" | "hidden"
  setVocabState: React.Dispatch<React.SetStateAction<"none" | "loading" | "shown" | "hidden">>
  vocabHighlights: UIHighlight[]
  setVocabHighlights: React.Dispatch<React.SetStateAction<UIHighlight[]>>
}

export default function AnalysisTab({
  analysisResult,
  setAnalysisResult,
  vocabState,
  setVocabState,
  vocabHighlights,
  setVocabHighlights
}: AnalysisTabProps) {
  const { article } = useArticleContext()
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!article) {
      setIsLoading(false)
      setAnalysisResult(null)
      setError(null)
      return
    }

    const runAnalysis = async () => {
      if (analysisResult !== null) return
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

  const highlights = React.useMemo((): UIHighlight[] => {
    const out: UIHighlight[] = []

    analysisResult?.evidences.forEach((evidence) => {
      evidence.excerpts.forEach((text) => {
        out.push({
          text: text,
          colorClass: "bg-amber-200/60 ring-amber-300"
        })
      })
    })

    analysisResult?.rhetorical_moves.forEach((move) => {
      move.excerpts.forEach((text) => {
        out.push({
          text: text,
          colorClass: "bg-violet-200/60 ring-violet-300"
        })
      })
    })

    return out
  }, [analysisResult])

  return (
    <div className="h-[calc(100vh-12rem)] grid grid-cols-1 md:grid-cols-2 gap-6">
      <ScrollArea className="h-full min-h-0">
        <OriginalArticleTab highlights={highlights} vocabState={vocabState} setVocabState={setVocabState} vocabHighlights={vocabHighlights} setVocabHighlights={setVocabHighlights} />
      </ScrollArea>

      <ScrollArea className="h-full min-h-0">
        <div className="flex flex-col gap-4">
          {isLoading ? (
            <div className="text-muted-foreground">Loading analysis…</div>
          ) : error ? (
            <div className="text-sm text-destructive">{error}</div>
          ) : analysisResult ? (
            <div className="flex flex-col gap-4">
              <Card className="bg-muted/30">
                <CardHeader>
                  <CardTitle className="font-bold text-lg">Overview</CardTitle>
                </CardHeader>
                <CardContent className="text-base">
                  <div className="mt-3">
                    <div className="font-semibold text-foreground">Main Claim</div>
                    <div className="mt-2 text-muted-foreground">{analysisResult.main_claim}</div>
                  </div>
                  <div className="mt-3">
                    <div className="font-semibold text-foreground">Tone</div>
                    <div className="mt-2 text-muted-foreground">{analysisResult.tone}</div>
                  </div>
                  <div className="mt-3">
                    <div className="font-semibold text-foreground">Verdict</div>
                    <div className="mt-2 text-muted-foreground">{analysisResult.one_line_verdict}</div>
                  </div>
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

              <Card className="bg-muted/30">
                <CardHeader>
                  <CardTitle className="font-bold text-lg">Logical Structure</CardTitle>
                </CardHeader>
                <CardContent className="text-base">
                  <div className="font-semibold text-foreground">Summary</div>
                  <div className="mt-2 text-muted-foreground">{analysisResult.logical_structure.summary}</div>
                  <div className="mt-3">
                    <div className="font-semibold text-foreground">Flaws</div>
                    <ul className="list-disc list-inside">
                      {analysisResult.logical_structure.flaws.map((flaw, index) => (
                        <li key={index} className="mt-2 text-muted-foreground">
                          {flaw}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-muted/30">
                <CardHeader>
                  <CardTitle className="font-bold text-lg">Framing</CardTitle>
                </CardHeader>
                <CardContent className="text-base">
                  <div className="font-semibold text-foreground">{analysisResult.framing.angle}</div>
                  <div className="mt-3">
                    <div className="font-semibold text-foreground">Emphasizes:</div>
                    <div className="mt-2 text-muted-foreground">{analysisResult.framing.emphasizes}</div>
                  </div>
                  <div className="mt-3">
                    <div className="font-semibold text-foreground">Obscures:</div>
                    <div className="mt-2 text-muted-foreground">{analysisResult.framing.obscures}</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-muted/30">
                <CardHeader>
                  <CardTitle className="font-bold text-lg">Rhetorical Moves</CardTitle>
                </CardHeader>
                <CardContent className="text-base">
                  <div className="flex flex-col gap-3">
                    {analysisResult.rhetorical_moves.map((move, index) => (
                        <div 
                          key={index}
                          className="rounded-2xl border border-slate-200/80 bg-slate-50/90 p-4 ring-1 ring-inset ring-slate-200/60"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="text-sm font-semibold text-foreground">{move.move}</div>
                              <div className="mt-2 text-sm text-muted-foreground">{move.effect}</div>
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-muted/30">
                <CardHeader>
                  <CardTitle className="font-bold text-lg">Missing</CardTitle>
                </CardHeader>
                <CardContent className="text-base">
                  <div>
                    <div className="font-semibold text-foreground">Ignored Counterarguments</div>
                    <ul className="list-disc list-inside">
                      {analysisResult.missing.ignored_counterarguments.map((ic, index) => (
                        <li key={index} className="mt-2 text-muted-foreground">
                          {ic}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-3">
                    <div className="font-semibold text-foreground">Missing Evidence</div>
                    <ul className="list-disc list-inside">
                      {analysisResult.missing.missing_evidence.map((me, index) => (
                        <li key={index} className="mt-2 text-muted-foreground">
                          {me}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-3">
                    <div className="font-semibold text-foreground">Unstated Implications</div>
                    <ul className="list-disc list-inside">
                      {analysisResult.missing.unstated_implications.map((ui, index) => (
                        <li key={index} className="mt-2 text-muted-foreground">
                          {ui}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="t ext-muted-foreground">Select an article to start the analysis.</div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}