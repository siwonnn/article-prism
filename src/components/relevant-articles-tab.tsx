"use client"

import { Article } from "@/lib/types"
import * as React from "react"

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

  return (
    <>
      {relevantArticles}
      {error}
    </>
  )
}