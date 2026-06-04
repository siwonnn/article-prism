// import { OpenRouter } from "@openrouter/sdk"
import { GoogleGenAI } from "@google/genai"

export async function generate(prompt: string): Promise<string> {
  const ai = new GoogleGenAI({})
  const response = await ai.models.generateContent({
    model: "gemini-2.5-pro",
    contents: prompt
  })
  return response.text ?? ""

  /*
  const client = new OpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY,
    // serverURL: "https://ai.hackclub.com/proxy/v1"
  })

  const response = await client.chat.send({
    chatRequest: {
      model: "~google/gemini-pro-latest:nitro",
      messages: [
        { role: "user", content: prompt }
      ],
      stream: false,
    },
  })
  return response.choices[0].message.content
  */
}