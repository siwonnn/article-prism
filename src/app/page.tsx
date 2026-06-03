"use client"

import * as React from "react"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useArticleContext } from "@/components/article-context"
import { fetchArticle } from "./actions/fetch-article"
import { useRouter } from "next/navigation"

export default function Home() {
  const [articleUrl, setArticleUrl] = React.useState("")
  const [isFetching, setIsFetching] = React.useState(false)
  const { setArticle } = useArticleContext()

  const router = useRouter()

  const handleSubmit = async () => {
    if (!articleUrl) return
    setIsFetching(true)
    const fetched = await fetchArticle(articleUrl)
    setIsFetching(false)
    setArticle(fetched)
    router.push('/article')
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background text-foreground">
      <section className="flex w-full max-w-xl flex-col items-center gap-6 px-6 text-center">
        <h1 className="text-4xl font-semibold tracking-tight">
          Article Prism
        </h1>
        <p className="text-base leading-7 text-muted-foreground">
          Paste an article URL to fully understand it with detailed analysis, key vocabularies, and a deep dive into relevant articles.
        </p>
        <label
          htmlFor="article-url"
          className="block text-sm font-medium text-foreground"
        >
          Article URL
        </label>
        <input
          id="article-url"
          name="articleUrl"
          type="url"
          value={articleUrl}
          onChange={(event) => setArticleUrl(event.target.value)}
          placeholder="https://example.com/article"
          className="h-12 w-full rounded-2xl border border-input bg-background px-4 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring"
        />
        <Button type="submit" className="h-12 w-full rounded-2xl" disabled={isFetching} onClick={handleSubmit}>
          {isFetching ? (
            <p>Fetching...</p>
          ) : (
            <>
              Next
              <ArrowRight />
            </>
          )}
        </Button>
      </section>
    </main>
  )
}