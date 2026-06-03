"use server"

import { type Article } from "@/lib/types"
import { generate } from "@/lib/ai"

export type AnalysisResult = {
  main_claim: string
  evidences: {
    claim: string
    support: string
    excerpts: string[]
    strength: "strong" | "weak" | "unsupported"
  }[]
  assumptions: {
    assumption: string
    explanation: string
  }[]
  logical_structure: {
    summary: string
    flaws: string[]
  }
  framing: {
    angle: string
    emphasizes: string
    obscures: string
  }
  rhetorical_moves: {
    move: string
    excerpts: string[]
    effect: string
  }[]
  missing: {
    ignored_counterarguments: string[]
    missing_evidence: string[]
    unstated_implications: string[]
  }
  tone: "objective" | "advocacy" | "alarmist" | "satirical" | "persuasive" | "analytical" | "other"
  one_line_verdict: string
}

const ANALYSIS_PROMPT = `
You are a critical reading assistant. Analyze the given article and return a JSON object with the following structure. Be specific and cite the article directly where relevant. Do not be generic.

Return ONLY valid JSON, no markdown, no preamble.

{
  "main_claim": "One sentence: the core argument the article is making",
  
  "evidences": [
    {
      "claim": "A specific claim made in the article",
      "support": "What evidence the author provides for it",
      "excerpts": ["Exact phrase or sentences from the article that makes this claim"],
      "strength": "strong | weak | unsupported"
    }
  ],
  
  "assumptions": [
    {
      "assumption": "Something the author takes for granted",
      "explanation": "Why this is an assumption, not an established fact"
    }
  ],
  
  "logical_structure": {
    "summary": "How the argument is built from start to finish",
    "flaws": ["Any logical gaps, non-sequiturs, or weak links in the chain"]
  },
  
  "framing": {
    "angle": "What perspective or frame the author chose",
    "emphasizes": "What this framing highlights",
    "obscures": "What this framing downplays or ignores"
  },
  
  "rhetorical_moves": [
    {
      "move": "Name of the technique",
      "excerpts": ["Specific quote or instance from the article"],
      "effect": "What this does to the reader"
    }
  ],
  
  "missing": {
    "ignored_counterarguments": ["Counterarguments the article doesn't address"],
    "missing_evidence": ["Types of evidence that would strengthen or challenge the claim"],
    "unstated_implications": ["What follows if you accept the argument fully"]
  },
  
  "tone": "One of: objective | advocacy | alarmist | satirical | persuasive | analytical | other",
  
  "one_line_verdict": "If this argument were a debate, how strong is it? One honest sentence."
}

Article to analyze:
{ARTICLE_CONTENT}
`

export async function analyzeArticle(article: Article): Promise<AnalysisResult> {
  console.log('got into analyze article')
  const prompt = ANALYSIS_PROMPT.replace("{ARTICLE_CONTENT}", article.content)
  const completion = await generate(prompt)
  const cleaned = completion.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()
  const result = JSON.parse(cleaned) as AnalysisResult
  return result
}