"use client";

import CodeViewer from "@/components/code-viewer";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { PromptComposer } from "@/components/PromptComposer";
import { useScrollTo } from "@/hooks/use-scroll-to";
import { domain } from "@/utils/domain";
import { shareApp } from "./actions";
import {
  createParser,
  ParsedEvent,
  ReconnectInterval,
} from "eventsource-parser";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { toast, Toaster } from "sonner";
import LoadingDots from "../../components/loading-dots";

export default function Home() {
  let [status, setStatus] = useState<
    "initial" | "creating" | "created" | "updating" | "updated"
  >("initial");
  let [generatedCode, setGeneratedCode] = useState("");
  let [ref, scrollTo] = useScrollTo();
  let [messages, setMessages] = useState<{ role: string; content: string }[]>(
    [],
  );
  let [isPublishing, setIsPublishing] = useState(false);
  let [model, setModel] = useState("openrouter/auto");
  let [temperature, setTemperature] = useState(0.2);
  let [useShadcn, setUseShadcn] = useState(true);

  let loading = status === "creating" || status === "updating";

  const suggestions = [
    "Daily quotes",
    "Calculator app",
    "Recipe finder",
    "Expense tracker",
    "Random number generator",
    "E-commerce store",
  ];

  async function handleGenerate(
    prompt: string,
    selectedModel: string,
    selectedTemperature: number,
    selectedShadcn: boolean
  ) {
    if (status !== "initial") {
      scrollTo({ delay: 0.5 });
    }

    setStatus("creating");
    setGeneratedCode("");
    setModel(selectedModel);
    setTemperature(selectedTemperature);
    setUseShadcn(selectedShadcn);

    let newMessages = [{ role: "user", content: prompt }];

    const chatRes = await fetch("/api/generateCode", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: newMessages,
        model: selectedModel,
        shadcn: selectedShadcn,
        temperature: selectedTemperature,
      }),
    });
    if (!chatRes.ok) {
      toast.error("Failed to generate code");
      setStatus("initial");
      return;
    }

    // This data is a ReadableStream
    const data = chatRes.body;
    if (!data) {
      return;
    }
    const onParse = (event: ParsedEvent | ReconnectInterval) => {
      if (event.type === "event") {
        const data = event.data;
        try {
          setGeneratedCode((prev) => prev + data);
        } catch (e) {
          console.error("[v0] Parse error:", e);
        }
      }
    };

    const reader = data.getReader();
    const decoder = new TextDecoder();
    const parser = createParser(onParse);
    let done = false;

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value);
      parser.feed(chunkValue);
    }

    newMessages = [
      ...newMessages,
      { role: "assistant", content: generatedCode },
    ];

    setMessages(newMessages);
    setStatus("created");
  }

  async function modifyCode(
    prompt: string,
    selectedModel: string,
    selectedTemperature: number,
    selectedShadcn: boolean
  ) {
    setStatus("updating");

    let newMessages = [...messages, { role: "user", content: prompt }];

    setGeneratedCode("");
    const chatRes = await fetch("/api/generateCode", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: newMessages,
        model: model,
        shadcn: useShadcn,
        temperature: temperature,
      }),
    });
    if (!chatRes.ok) {
      toast.error("Failed to modify code");
      setStatus("created");
      return;
    }

    const data = chatRes.body;
    if (!data) {
      return;
    }
    const onParse = (event: ParsedEvent | ReconnectInterval) => {
      if (event.type === "event") {
        const data = event.data;
        try {
          setGeneratedCode((prev) => prev + data);
        } catch (e) {
          console.error("[v0] Parse error:", e);
        }
      }
    };

    const reader = data.getReader();
    const decoder = new TextDecoder();
    const parser = createParser(onParse);
    let done = false;

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value);
      parser.feed(chunkValue);
    }

    newMessages = [
      ...newMessages,
      { role: "assistant", content: generatedCode },
    ];

    setMessages(newMessages);
    setStatus("updated");
  }

  useEffect(() => {
    let el = document.querySelector(".cm-scroller");
    if (el && loading) {
      let end = el.scrollHeight - el.clientHeight;
      el.scrollTo({ top: end });
    }
  }, [loading, generatedCode]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 px-4 py-8 sm:py-12">
        <div className="mx-auto max-w-5xl">
          {status === "initial" ? (
            <div className="text-center">
              <h1 className="mb-4 text-4xl font-bold sm:text-6xl">
                Turn <span className="text-blue-600">ideas</span> into{" "}
                <span className="text-blue-600">apps in Minutes</span>
              </h1>
              <p className="mb-8 text-lg text-muted-foreground">
                Build production-ready React apps with AI. Just describe what you want.
              </p>

              {/* Suggestions */}
              <div className="mb-8 flex flex-wrap justify-center gap-2">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => {
                      handleGenerate(suggestion, model, temperature, useShadcn);
                    }}
                    className="rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>

              {/* Prompt Composer */}
              <div className="mx-auto w-full max-w-xl">
                <PromptComposer
                  onGenerate={handleGenerate}
                  isLoading={loading}
                  placeholder="Describe your app or paste a screenshot..."
                />
              </div>
            </div>
          ) : (
            <motion.div
              initial={{ height: 0 }}
              animate={{
                height: "auto",
                overflow: "hidden",
                transitionEnd: { overflow: "visible" },
              }}
              transition={{ type: "spring", bounce: 0, duration: 0.5 }}
              className="w-full pt-6"
              ref={ref}
            >
              {/* Code Viewer and Chat */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Left: Code */}
                <div className="min-h-96 overflow-hidden rounded-lg border border-border bg-card">
                  <CodeViewer code={generatedCode} />
                </div>

                {/* Right: Chat */}
                <div className="flex flex-col gap-4">
                  <div className="flex-1 overflow-auto rounded-lg border border-border bg-card p-4">
                    {messages.map((message, index) => (
                      <div
                        key={index}
                        className={`mb-4 ${
                          message.role === "user" ? "text-right" : "text-left"
                        }`}
                      >
                        <div
                          className={`inline-block max-w-xs rounded-lg px-4 py-2 ${
                            message.role === "user"
                              ? "bg-blue-600 text-white"
                              : "bg-muted text-foreground"
                          }`}
                        >
                          {message.content}
                        </div>
                      </div>
                    ))}
                    {loading && <LoadingDots color="black" style="large" />}
                  </div>

                  {/* Modify form */}
                  <div className="w-full">
                    <PromptComposer
                      onGenerate={modifyCode}
                      isLoading={loading}
                      placeholder="Modify your app..."
                      showSettings={false}
                    />
                  </div>

                  {/* Publish button */}
                  <button
                    disabled={loading || isPublishing}
                    onClick={async () => {
                      setIsPublishing(true);
                      let userMessages = messages.filter(
                        (message) => message.role === "user",
                      );
                      let prompt =
                        userMessages[userMessages.length - 1].content;

                      const appId = await Promise.resolve(
                        shareApp({
                          generatedCode,
                          prompt,
                          model: model,
                        }),
                      );
                      setIsPublishing(false);
                      toast.success(
                        `Published! Link copied to clipboard.`,
                      );
                      navigator.clipboard.writeText(
                        `${domain}/share/${appId}`,
                      );
                    }}
                    className="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isPublishing ? (
                      <LoadingDots color="white" style="large" />
                    ) : (
                      "Publish app"
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </main>

      <Toaster />
      <Footer />
    </div>
  );
}

