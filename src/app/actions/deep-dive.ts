"use server"

import { Article } from "@/lib/types"
import { AnalysisResult } from "./analyze-article"
import { fetchArticle } from "./fetch-article"
import { generate } from "@/lib/ai"

export type DeepDiveResult = {
  article_url: string
  summary: string
  relationship: "agrees" | "disagrees" | "reframes" | "provides_context"
  relationship_explanation: string
  key_differences: {
    aspect: string
    original: string
    target: string
  }[]
  shared_ground: string
  unique_contribution: string
  notable_claims: string[]
}

const DEEP_DIVE_PROMPT = `
You are helping a reader deeply understand how a relevant article relates to an original article they are analyzing.

Original article content:
{ORIGINAL_CONTENT}

Original article analysis:
{ORIGINAL_ANALYSIS}

Relevant article content:
{RELEVANT_CONTENT}

Return ONLY valid JSON, no preamble.

{
  "summary": "2-3 sentence summary of what this article argues",
  "relationship": "agrees | disagrees | reframes | provides_context",
  "relationship_explanation": "One paragraph explaining the overall relationship between the two articles",
  "key_differences": [
    {
      "aspect": "e.g. root cause, evidence, framing, conclusion",
      "original": "what the original article says about this",
      "target": "what this relevant article says about this",
    }
  ],
  "shared_ground": "What both articles agree on, if anything",
  "unique_contribution": "What this relevant article adds that the original doesn't cover - the main reason to read it",
  "notable_claims": [
    "A specific interesting or surprising claim this relevant article makes"
  ]
}
`

export async function deepDiveArticle(article: Article, analysisResult: AnalysisResult, targetArticle: Article): Promise<DeepDiveResult> {
  const targetArticleFull = await fetchArticle(targetArticle.url, 5000)
  const prompt = DEEP_DIVE_PROMPT
    .replace("{ORIGINAL_CONTENT}", article.content)
    .replace("{ORIGINAL_ANALYSIS}", JSON.stringify(analysisResult))
    .replace("{RELEVANT_CONTENT}", targetArticleFull.content)
  const completion = await generate(prompt)
  const cleaned = completion.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()
  const result = { ...JSON.parse(cleaned), url: targetArticle.url } as DeepDiveResult
  return result
}