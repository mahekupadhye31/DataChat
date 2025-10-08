"use client";
import { useState, useEffect, useRef } from "react";
import { getUserId } from "../lib/getUserId";

export default function Chat() {
  const [mounted, setMounted] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [botTyping, setBotTyping] = useState(false);
  const [typingText, setTypingText] = useState("Answering.");
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Typing animation effect
  useEffect(() => {
    if (!botTyping) return;

    const dots = ["Answering.", "Answering..", "Answering..."];
    let i = 0;

    const interval = setInterval(() => {
      setTypingText(dots[i % dots.length]);
      i++;
    }, 500);

    return () => clearInterval(interval);
  }, [botTyping]);

  // Smart auto-scroll
  useEffect(() => {
    if (!mounted || !scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    if (container.scrollHeight <= container.clientHeight) return;

    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    const NEAR_BOTTOM_PX = 80;

    if (distanceFromBottom < NEAR_BOTTOM_PX) {
      container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
    }
  }, [messages, mounted, botTyping]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    setMessages(prev => [...prev, { type: "text", text: input, sender: "user" }]);
    const userInput = input;
    setInput("");

    try {
      const userId = getUserId();
      setBotTyping(true);

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": userId,
        },
        body: JSON.stringify({ message: userInput }),
      });

      const data = await res.json();
      setMessages(prev => [...prev, data]);
    } catch {
      setMessages(prev => [...prev, { type: "text", text: "⚠️ Chat failed", sender: "bot" }]);
    } finally {
      setBotTyping(false);
    }
  };

  return (
    <div className="flex flex-col text-white h-full">
      {mounted && (
        <>
          <div
            ref={scrollContainerRef}
            className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 pr-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900"
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className={`max-w-[70%] p-3 rounded-lg ${msg.sender === "user" ? "bg-blue-400 text-white" : "bg-gray-700 text-white"}`}>
                  {msg.text}
                </div>
              </div>
            ))}

            {botTyping && (
              <div className="flex justify-start">
                <div className="max-w-[70%] p-3 rounded-lg bg-gray-700 text-white italic animate-pulse">
                  {typingText}
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-gray-700 bg-gray-900 p-4">
            <div className="flex space-x-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Type a message..."
                className="flex-grow rounded-md bg-gray-800 py-3 px-3 text-base text-white placeholder:text-gray-400 focus:outline-none"
              />
              <button
                onClick={sendMessage}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
              >
                Send
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
