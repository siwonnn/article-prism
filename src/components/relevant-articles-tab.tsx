"use client"

import { Article } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { ExternalLink } from "lucide-react"
import { DeepDiveResult } from "@/app/actions/deep-dive"
import { cn } from "@/lib/utils"

type RelevantArticlesTabProps = {
  relevantArticles: Article[],
  isLoading: boolean,
  error: string | null,
  deepDive: DeepDiveResult | null,
  deepDiveLoading: boolean,
  activeArticle: Article | null,
  setActiveArticle: React.Dispatch<React.SetStateAction<Article | null>>
  handleDeepDive: (article: Article) => void
}

export default function RelevantArticleTab({
  relevantArticles,
  isLoading,
  error,
  deepDive,
  deepDiveLoading,
  activeArticle,
  setActiveArticle,
  handleDeepDive
}: RelevantArticlesTabProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">{error}</div>
    )
  }

  if (!isLoading && error !== null) {
    return (
      <div className="text-sm text-destructive">{error}</div>
    )
  }

  if (relevantArticles.length === 0) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">
        No relevant articles found.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {relevantArticles.map((article, index) => (
        <Card key={index} className="border border-border/60 shadow-none">
          <CardContent className="flex gap-4 p-4">
            <span className="mt-0.5 shrink-0 text-2xl font-black text-muted-foreground/40 font-serif leading-none w-7 text-right">
              {index + 1}
            </span>
            <div className="flex flex-col gap-1.5 min-w-0">
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-1.5 font-semibold text-foreground hover:text-primary transition-colors"
              >
                <span className="leading-snug">
                  {article.title ?? article.url}
                </span>
                <ExternalLink className="mt-0.5 size-3.5 shrink-0 opacity-50 group-hover:opacity-100 transition-opacity" />
              </a>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {article.explanation}
              </p>
              <Button
                variant="outline"
                className="mt-1 w-fit rounded-full border-primary/30 bg-primary/5 px-4 text-xs font-semibold text-primary hover:bg-primary/10 hover:border-primary/50 transition-all"
                onClick={() => handleDeepDive(article)}
              >
                Deep Dive
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      <Sheet open={!!activeArticle} onOpenChange={() => setActiveArticle(null)}>
        <SheetContent className="max-w-2xl! overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Deep Dive</SheetTitle>
            <SheetDescription>{activeArticle?.title}</SheetDescription>
          </SheetHeader>
          {deepDiveLoading && (
            <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">Loading...</div>
          )}
          {deepDive && (
            <div className="flex flex-col gap-6 px-6">
              <div className="flex items-center gap-2">
                <span className={cn(
                  "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold capitalize",
                  {
                    "agrees": "bg-emerald-100 text-emerald-700",
                    "disagrees": "bg-red-100 text-red-700",
                    "reframes": "bg-purple-100 text-purple-700",
                    "provides_context": "bg-blue-100 text-blue-700"
                  }[deepDive.relationship]
                )}>
                  {deepDive.relationship.replace("_", " ")}
                </span>
              </div>

              <section>
                <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Summary</h3>
                <p className="text-sm leading-relaxed text-foreground">{deepDive.summary}</p>
              </section>

              <section>
                <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">How They Relate</h3>
                <p className="text-sm leading-relaxed text-foreground">{deepDive.relationship_explanation}</p>
              </section>

              {deepDive.key_differences.length > 0 && (
                <section>
                  <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Key Differences</h3>
                  <div className="flex flex-col gap-3">
                    {deepDive.key_differences.map((diff, i) => (
                      <div key={i} className="rounded-lg border border-border/60 overflow-auto">
                        <div className="bg-muted/40 px-3 py-1.5">
                          <span className="text-xs font-semibold text-muted-foreground capitalize">{diff.aspect}</span>
                        </div>
                        <div className="grid grid-cols-2 divide-x divide-border/60">
                          <div className="p-3">
                            <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">Original Article</p>
                            <p className="text-sm leading-relaxed">{diff.original}</p>
                          </div>
                          <div className="p-3">
                            <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">This Article</p>
                            <p className="text-sm leading-relaxed">{diff.target}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {deepDive.shared_ground && (
                <section>
                  <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Shared Ground</h3>
                  <p className="text-sm leading-relaxed text-foreground">{deepDive.shared_ground}</p>
                </section>
              )}

              <section>
                <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Unique Contribution (Why read this article)</h3>
                <p className="text-sm leading-relaxed text-foreground">{deepDive.unique_contribution}</p>
              </section>

              {deepDive.notable_claims.length > 0 && (
                <section>
                  <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Notable Claims</h3>
                  <ul className="flex flex-col gap-2">
                    {deepDive.notable_claims.map((claim, i) => (
                      <li key={i} className="flex gap-2 text-sm leading-relaxed">
                        <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary/40" />
                        {claim}
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          )}
          <SheetFooter>
            <SheetClose asChild>
              <Button variant="outline">Close</Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}