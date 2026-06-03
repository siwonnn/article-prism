export type Article = {
    title: string | null
    content: string
    url: string
    explanation?: string // for relevant articles information
}

export type UIHighlight = {
  text: string
  colorClass: string
  explanation?: string
}