"use server"

import https from "https"
import { type Article } from "@/lib/types"

function parseArticle(raw: string) {
  const titleMatch = raw.match(/^Title:\s*(.+)$/m)
  const title = titleMatch ? titleMatch[1].trim() : null

  const mdMatch = raw.match(/Markdown Content:\s*([\s\S]*)$/m)
  const content = mdMatch ? mdMatch[1].trim() : ""

  return { title, content }
}

export async function fetchArticle(articleUrl: string): Promise<Article> {
  const api_key = process.env.JINA_API_KEY

  const url = "https://r.jina.ai/" + articleUrl
  const options = {
    method: "GET",
    headers: {
      Authorization: "Bearer " + api_key,
    },
  }

  const data = await new Promise<string>((resolve, reject) => {
    https
      .get(url, options, (res) => {
        let body = ""
        res.on("data", (chunk) => {
          body += chunk
        })
        res.on("end", () => resolve(body))
      })
      .on("error", (err) => reject(err))
  })

  const parsed = parseArticle(data)
  const article: Article = {
    title: parsed.title,
    content: parsed.content,
    url: articleUrl
  }
  console.log(article)
  return article
}