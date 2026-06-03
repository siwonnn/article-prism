"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useArticleContext } from "@/components/article-context"
import OriginalArticleTab from "@/components/original-article-tab"
import AnalysisTab from "@/components/analysis-tab"
import { AnalysisResult, analyzeArticle } from "../actions/analyze-article"
import { Article, UIHighlight } from "@/lib/types"
import RelevantArticleTab from "@/components/relevant-articles-tab"
import { searchRelevantArticles } from "../actions/relevant-articles"
import { deepDiveArticle, DeepDiveResult } from "../actions/deep-dive"


export default function ArticlePage() {
  const { article } = useArticleContext()

  const [analysisResult, setAnalysisResult] = React.useState<AnalysisResult | null>(null)
  const [isAnalysisLoading, setIsAnalysisLoading] = React.useState(false)
  const [analysisError, setAnalysisError] = React.useState<string | null>(null)
  const [vocabState, setVocabState] = React.useState<"none" | "loading" | "shown" | "hidden">("none")
  const [vocabHighlights, setVocabHighlights] = React.useState<UIHighlight[]>([])

  const [relevantArticles, setRelevantArticles] = React.useState<Article[]>([])
  const [isRelevantArticlesLoading, setIsRelevantArticlesLoading] = React.useState(false)
  const [relevantArticlesError, setRelevantArticlesError] = React.useState<string | null>(null)
  const [deepDive, setDeepDive] = React.useState<DeepDiveResult | null>(null)
  const [deepDiveLoading, setDeepDiveLoading] = React.useState(false)
  const [activeArticle, setActiveArticle] = React.useState<Article | null>(null)

  const analysisStartedForUrlRef = React.useRef<string | null>(null)
  const relevantSearchStartedForUrlRef = React.useRef<string | null>(null)

  const analysisHighlights = React.useMemo(() => {
    const out: UIHighlight[] = []

    analysisResult?.evidences.forEach((evidence) => {
      evidence.excerpts.forEach((text) => {
        out.push({
          text,
          colorClass: "bg-amber-200/60 ring-amber-300"
        })
      })
    })

    analysisResult?.rhetorical_moves.forEach((move) => {
      move.excerpts.forEach((text) => {
        out.push({
          text,
          colorClass: "bg-violet-200/60 ring-violet-300"
        })
      })
    })

    return out
  }, [analysisResult])
  
  // for relevant articles tab: deep dive
  async function handleDeepDive(targetArticle: Article) {
    setActiveArticle(targetArticle)
    setDeepDive(null)
    setDeepDiveLoading(true)
    const result = await deepDiveArticle(article!, analysisResult!, targetArticle)
    if (result.article_url === activeArticle?.url) setDeepDive(result)
    setDeepDiveLoading(false)
  }

  const tabComponents: Record<string, React.ReactNode> = {
    "Original Article": <OriginalArticleTab vocabState={vocabState} setVocabState={setVocabState} vocabHighlights={vocabHighlights} setVocabHighlights={setVocabHighlights} />,
    "Analysis": <AnalysisTab analysisResult={analysisResult} highlights={analysisHighlights} isLoading={isAnalysisLoading} error={analysisError} vocabState={vocabState} setVocabState={setVocabState} vocabHighlights={vocabHighlights} setVocabHighlights={setVocabHighlights} />,
    "Relevant Articles": <RelevantArticleTab relevantArticles={relevantArticles} isLoading={isRelevantArticlesLoading} error={relevantArticlesError} deepDive={deepDive} deepDiveLoading={deepDiveLoading} activeArticle={activeArticle} setActiveArticle={setActiveArticle} handleDeepDive={handleDeepDive} />
  }

  // for analysis tab
  React.useEffect(() => {
    if (!article) {
      setIsAnalysisLoading(false)
      setAnalysisResult(null)
      setAnalysisError(null)
      analysisStartedForUrlRef.current = null
      return
    }

    const runAnalysis = async () => {
      if (analysisResult !== null) return
      if (analysisStartedForUrlRef.current === article.url) return

      analysisStartedForUrlRef.current = article.url
      setIsAnalysisLoading(true)
      setAnalysisError(null)
      setAnalysisResult(null)

      try {
        const analysis = await analyzeArticle(article)
        setAnalysisResult(analysis)
      } catch (caughtError) {
        setAnalysisError(
          caughtError instanceof Error
            ? caughtError.message
            : "Failed to analyze article"
        )
      } finally {
        setIsAnalysisLoading(false)
        analysisStartedForUrlRef.current = null
      }
    }
    
    void runAnalysis()
  }, [article?.url, article?.content])

  // for relevant articles tab
  React.useEffect(() => {
    if (!article) {
      setIsRelevantArticlesLoading(false)
      setRelevantArticlesError(null)
      relevantSearchStartedForUrlRef.current = null
      return
    }

    if (!analysisResult) {
      setIsRelevantArticlesLoading(true)
      setRelevantArticlesError("Waiting for article analysis to search relevant articles")
      return
    }

    const runSearch = async () => {
      if (relevantArticles.length > 0) return
      if (relevantSearchStartedForUrlRef.current === article.url) return

      relevantSearchStartedForUrlRef.current = article.url
      setIsRelevantArticlesLoading(true)
      setRelevantArticlesError("Loading relevant articles...")

      let isError = false
      try {
        const result = await searchRelevantArticles(JSON.stringify(analysisResult, null, 2), article)
        setRelevantArticles(result)
      } catch (caughtError) {
        isError = true
        setRelevantArticlesError(
          caughtError instanceof Error
           ? caughtError.message
           : "Failed to retrieve relevant articles"
        )
      } finally {
        setIsRelevantArticlesLoading(false)
        if (!isError) setRelevantArticlesError(null)
        relevantSearchStartedForUrlRef.current = null
      }
    }

    void runSearch()
  }, [article?.url, article?.content, analysisResult])

  return (
    <main className="min-h-screen bg-background px-6 py-8 text-foreground sm:px-8 lg:px-10">
      <section className="mx-auto flex w-full flex-col gap-8">
        <div className="flex justify-start">
          <Button asChild variant="ghost" className="gap-2 rounded-full px-3">
            <Link href="/">
              <ArrowLeft className="size-4" />
              Back
            </Link>
          </Button>
        </div>

        <Card className="border border-border/60 bg-card/80 shadow-none">
          <CardHeader className="border-b border-border/60 pb-5">
            <CardDescription>Article Overview</CardDescription>
            <CardTitle className="text-3xl sm:text-4xl font-serif font-black">
              {article?.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
          <Tabs defaultValue={Object.keys(tabComponents)[0]} className="flex w-full flex-col gap-6">
            <TabsList className="w-full flex-wrap justify-start gap-2 rounded-3xl bg-muted p-2">
              {Object.keys(tabComponents).map((tab) => (
                <TabsTrigger key={tab} value={tab}>{tab}</TabsTrigger>
              ))}
            </TabsList>
            
            {Object.entries(tabComponents).map(([tab, component]) => (
              <TabsContent key={tab} value={tab}>
                {component}
              </TabsContent>
            ))}
          </Tabs>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}