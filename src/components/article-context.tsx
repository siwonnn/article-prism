"use client"

import * as React from "react"
import type { Article } from "@/lib/types"

type ArticleContextValue = {
  article: Article | null
  setArticle: React.Dispatch<React.SetStateAction<Article | null>>
}

const ArticleContext = React.createContext<ArticleContextValue | undefined>(
  undefined
)

export function ArticleProvider({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  const [article, setArticle] = React.useState<Article | null>(null)

  return (
    <ArticleContext.Provider value={{ article, setArticle }}>
      {children}
    </ArticleContext.Provider>
  )
}

export function useArticleContext() {
  const ctx = React.useContext(ArticleContext)
  if (!ctx) {
    throw new Error("useArticleContext must be used within an ArticleProvider")
  }
  return ctx
}