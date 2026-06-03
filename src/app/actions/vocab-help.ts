"use server"

import { generate } from "@/lib/ai"
import { UIHighlight } from "@/lib/types"

export type VocabResult = {
  vocabularies: {
    vocab: string
    meaning: string
  }[]
}

const VOCAB_PROMPT = `
You are an expert in English vocabularies. Your goal is to help readers understand vocabularies that are difficult in the article. Analyze the given article and return a JSON object with the following structure.
Find vocabularies that would be hard to understand for an intermediate level English learner, and relatively hard vocabularies given the article's overall level of expressions.
Return ONLY valid JSON, no markdown, no preamble.

{
  "vocabularies": [
    {
      "vocab": "A specific vocabulary from the article without modifying the form",
      "meaning": "The meaning of the vocabulary that matches with the context"
    }
  ]
}

Article to analyze:
{ARTICLE_CONTENT}
`

export async function generateVocabHelp(text: string): Promise<UIHighlight[]> {
  const prompt = VOCAB_PROMPT.replace("{ARTICLE_CONTENT}", text)
  const completion = await generate(prompt)
  const cleaned = JSON.parse(completion.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()) as VocabResult

  let output: UIHighlight[] = []
  cleaned.vocabularies.forEach((vocab) => {
    output.push({
      text: vocab.vocab,
      colorClass: "bg-sky-200/60 text-sky-800 ring-sky-300",
      explanation: vocab.meaning
    })
  })
  return output
}