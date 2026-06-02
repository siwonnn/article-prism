"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useArticleContext } from "@/components/article-context"
import OriginalArticleTab from "@/components/original-article-tab"
import AnalysisTab from "@/components/analysis-tab"

const tabComponents: Record<string, React.ReactNode> = {
  "Original Article": <OriginalArticleTab />,
  "Analysis": <AnalysisTab />
}

export default function ArticlePage() {
  const { article } = useArticleContext()

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