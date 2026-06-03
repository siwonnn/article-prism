"use client"

import * as React from "react"
import { type RelevantArticles } from "@/app/actions/relevant-articles"

type RelevantArticlesTabProps = {
  relevantArticles: RelevantArticles | null,
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
      asdf
      {isLoading}
      {error}
    </>
  )
}