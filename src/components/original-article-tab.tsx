"use client"

import { useArticleContext } from "@/components/article-context"
import ReactMarkdown from "react-markdown"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function OriginalArticleTab() {
  const { article } = useArticleContext()

  return (
    <Card className="border-dashed bg-muted/30 p-6">
      <CardHeader>
        <CardTitle className="text-xs font-medium uppercase text-muted-foreground">
          original article
        </CardTitle>
      </CardHeader>
      <CardContent className="whitespace-pre-wrap leading-6 font-serif font-medium text-[17px]">
        <ReactMarkdown>{article?.content}</ReactMarkdown>
      </CardContent>
    </Card>
  )
}