"use server"

import Exa from "exa-js"
import { generate } from "@/lib/ai"
import { Article } from "@/lib/types"

type QueryResult = {
  critique: string[]
  different_cause: string[]
  different_lens: string[]
  primary_sources: string[]
  historical_context: string[]
}

export type RelevantArticles = {
  critique: Article[]
  different_cause: Article[]
  different_lens: Article[]
  primary_sources: Article[]
  historical_context: Article[]
}

const SEARCH_QUERY_PROMPT = `
You are helping a reader find articles that will give them a richer, more critical understanding of the article below.
Generate search queries for each category. Each query should be specific enough to find real published articles - written the way a journalist or researcher would search, not like a chatbot.
Below is a structured critical analysis of this article. Use it to generate targeted search queries for each category.

Analysis:
{ANALYSIS_JSON}

Return ONLY valid JSON, no preamble.

{
  "critique": [
    "query finding articles that challenge or push back on the main argument",
    "query finding articles that find flaws or counterevidence to the main claim"
  ],
  "different_cause": [
    "query finding articles about the same phenomenon but attributing it to a different root cause",
    "query finding articles that explain the same problem through a different mechanism"
  ],
  "different_lens": [
    "query finding articles analyzing this topic from a different discipline or framework (economic, sociological, historical, psychological, etc.)",
    "query finding articles from a different ideological or cultural perspective on the same topic"
  ],
  "primary_sources": [
    "query finding the original study, data, or report this article is drawing on",
    "query finding official statistics or research behind the claims in this article"
  ],
  "historical_context": [
    "query finding articles about how this issue developed or originated over time",
    "query finding earlier coverage or historical background on this topic"
  ]
}

Rules:
- Queries should be 4-8 words, natural search language
- Do not use the article title verbatim
- Be specific to the actual topic, not generic (bad: "opposing views on climate", good: "methane emissions livestock industry underreported")
- primary_sources queries should target studies, reports, or data directly

Article:
{ARTICLE_CONTENT}
`

export async function searchRelevantArticles(analysis: string, article: Article): Promise<RelevantArticles | string> {
  console.log("got into search relevant articles")
  // generate search queries
  const queryPrompt = SEARCH_QUERY_PROMPT.replace("{ANALYSIS_JSON}", analysis).replace("{ARTICLE_CONTENT}", article.content)
  const queryCompletion = await generate(queryPrompt)
  const queryCleaned = queryCompletion.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()
  const queryResult = JSON.parse(queryCleaned) as QueryResult
  const queries = Object.values(queryResult).flat()
  console.log(queries)
  
  // search for articles
  const exa = new Exa(process.env.EXA_API_KEY)
  const searchResults = await Promise.all(
    queries.map((query) => {
      exa.search(query, {
        numResults: 3,
        type: "neural",
        contents: {
          text: { maxCharacters: 1000 }
        }
      })
    })
  )
  return JSON.stringify(searchResults, null, 2)
}