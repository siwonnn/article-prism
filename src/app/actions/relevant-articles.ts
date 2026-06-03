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

const FILTER_PROMPT = `
You are filtering a list of articles for relevance to an original article's topic and argument.

Original article analysis:
{ANALYSIS_JSON}

Original article:
{ARTICLE_CONTENT}

Candidate articles:
{ARTICLES}

For each article, judge if it is genuinely useful for a reader trying to understand different perspectives, critiques, or context around the original article's claims. Exclude duplicates, paywalled articles, or anything tangentially related.
Rank the article's usefulness and return the output in order of rank - most useful to least useful.

Return ONLY a JSON array, no preamble.

[
  {
    "url": "the article url",
    "relevant": true | false,
    "explanation": "One sentence written for the reader explaining why this article is worth reading alongside the original - what perspective, critique, or context it adds"
  }
]
`

export async function searchRelevantArticles(analysis: string, article: Article): Promise<Article[]> {
  // generate search queries
  const queryPrompt = SEARCH_QUERY_PROMPT.replace("{ANALYSIS_JSON}", analysis).replace("{ARTICLE_CONTENT}", article.content)
  const queryCompletion = await generate(queryPrompt)
  const queryCleaned = queryCompletion.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()
  const queryResult = JSON.parse(queryCleaned) as QueryResult
  const queries = Object.values(queryResult).flat()
  
  // search for articles
  const exa = new Exa(process.env.EXA_API_KEY)
  const searchResults = await Promise.all(
    queries.map(async (query) => {
      const result = await exa.search(query, {
        numResults: 3,
        type: "neural",
        contents: {
          text: { maxCharacters: 1000 }
        }
      })
      return result.results
    })
  )
  
  // filter relevant articles
  const articles = searchResults.flat().map((a) => ({
    url: a.url,
    title: a.title,
    content: a.text
  } as Article))
  const filterPrompt = FILTER_PROMPT
    .replace("{ANALYSIS_JSON}", analysis)
    .replace("{ARTICLE_CONTENT}", article.content)
    .replace("{ARTICLES}", JSON.stringify(articles))
  const filterCompletion = await generate(filterPrompt)
  const filterCleaned = filterCompletion.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()
  const judgments = JSON.parse(filterCleaned) as { url: string; relevant: boolean; explanation: string }[]
  const judgmentMap = new Map(
    judgments.filter((j) => j.relevant).map((j) => [j.url, j.explanation])
  )
  const relevantArticles = articles
    .filter((a) => judgmentMap.has(a.url))
    .map((a) => ({ ...a, explanation: judgmentMap.get(a.url) }))
  return relevantArticles
}