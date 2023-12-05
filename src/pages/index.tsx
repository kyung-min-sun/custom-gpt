import { Inter } from "next/font/google";
import { useEffect, useRef, useState } from "react";
import Logo from "@/assets/logo.png";
import Image from "next/image";
import { IconButton } from "@mui/material";
import { Person, Send } from "@mui/icons-material";
import OpenAI from "openai";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [apiKey, setApiKey] = useState<string>("");
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetch("/api/apiKey", {
      method: "GET",
    }).then(async (res) => {
      const json = await res.json();
      setApiKey((json as { apiKey: string }).apiKey);
    });
  }, []);

  const onSubmit = async () => {
    if (isLoading || message.length == 0) return;
    setIsLoading(true);
    messages.push({
      role: "user",
      content: message,
    });
    setMessage("");
    const contextMessages: { role: "user" | "assistant"; content: string }[] =
      [];
    let contextLength = 0;
    const newMessages = [...messages];
    newMessages.reverse().forEach((message) => {
      if (contextLength >= 31_150) return;
      contextLength += message.content.length;
      contextMessages.push(message);
    });
    const completion = await new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true,
    }).chat.completions.create({
      messages: contextMessages.reverse(),
      model: "gpt-4",
    });
    messages.push({
      role: "assistant",
      content: completion.choices[0].message.content ?? "",
    });
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    setMessages([...messages]);
    setIsLoading(false);
  };

  return (
    <main
      className={`flex min-h-screen flex-col gap-4 justify-between p-12 ${inter.className}`}
    >
      <div className="flex flex-col divide-y divide-black">
        {messages.map((message, i) => (
          <div key={i} className="flex flex-row items-start gap-4 py-4">
            <div className="w-20 h-10">
              {message.role == "assistant" ? (
                <Image
                  src={Logo}
                  alt="Logo"
                  className="rounded-full w-10 h-10"
                />
              ) : (
                <Person className="rounded-full w-10 h-10" />
              )}
            </div>
            <div className="flex-1 font-normal text-sm">{message.content}</div>
          </div>
        ))}
        {isLoading && (
          <div className="flex flex-col items-center text-2xl font-normal py-4">
            ...
          </div>
        )}
      </div>
      <div className="flex flex-row items-center gap-2 h-50" ref={bottomRef}>
        <textarea
          className="border border-black p-2 text-sm w-full h-40"
          value={message}
          onKeyDown={(event) => {
            if (event.key == "Enter" && message.length > 0) {
              event.preventDefault();
              setMessage(message.trim());
              onSubmit();
            }
          }}
          onChange={(t) => setMessage(t.target.value)}
        />
        <IconButton onClick={onSubmit}>
          <Send />
        </IconButton>
      </div>
    </main>
  );
}
