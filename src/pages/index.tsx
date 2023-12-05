import { Inter } from "next/font/google";
import Logo from "@/assets/logo.png";
import Image from "next/image";
import { IconButton } from "@mui/material";
import { Person, Send } from "@mui/icons-material";
import { useChat } from "ai/react";
import { useEffect, useRef } from "react";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const { messages, append, handleSubmit, input, setInput, handleInputChange } =
    useChat();
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
      </div>
      <div
        className="flex flex-row items-center gap-2 h-50 w-full"
        ref={bottomRef}
      >
        <form
          onSubmit={handleSubmit}
          className="flex flex-row items-center gap-2 h-50 w-full"
        >
          <textarea
            className="border border-black p-2 text-sm w-full h-40"
            value={input}
            onChange={handleInputChange}
            onKeyDown={(e) => {
              if (e.key == "Enter") {
                append({ role: "user", content: input });
                setInput("");
                e.preventDefault();
              }
            }}
          />
          <IconButton type="submit">
            <Send />
          </IconButton>
        </form>
      </div>
    </main>
  );
}
