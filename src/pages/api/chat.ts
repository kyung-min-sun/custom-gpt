// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

type ChatCompletion = {
  messages: { role: "user" | "assistant"; content: string }[];
};

type Data = {
  answer: string | null;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  if (req.method === "POST") {
    const messages = (JSON.parse(req.body) as ChatCompletion).messages;
    const contextMessages: { role: "user" | "assistant"; content: string }[] =
      [];
    let contextLength = 0;
    messages.reverse().forEach((message) => {
      if (contextLength >= 31_150) return;
      contextLength += message.content.length;
      contextMessages.push(message);
    });
    const completion = await new OpenAI().chat.completions.create({
      messages: contextMessages.reverse(),
      model: "gpt-4",
    });
    res.status(200).json({
      answer: completion.choices[0].message.content,
    });
  } else {
    res.status(404);
  }
}
