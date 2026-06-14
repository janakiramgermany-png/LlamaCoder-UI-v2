"use client";

import { useState, useRef, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { PromptComposer } from "@/components/PromptComposer";
import CodeViewer from "@/components/code-viewer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  createParser,
  ParsedEvent,
  ReconnectInterval,
} from "eventsource-parser";
import { toast, Toaster } from "sonner";
import {
  FileText,
  Plus,
  Trash2,
  Copy,
  Download,
  Share2,
  MoreVertical,
  ChevronRight,
  Zap,
  Code2,
  Eye,
  Terminal,
  Settings2,
  Clock,
} from "lucide-react";
import LoadingDots from "@/components/loading-dots";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp?: Date;
}

interface AppVersion {
  id: string;
  code: string;
  prompt: string;
  timestamp: Date;
}

export default function ChatsPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [generatedCode, setGeneratedCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"code" | "preview" | "versions">(
    "code"
  );
  const [model, setModel] = useState("openrouter/auto");
  const [temperature, setTemperature] = useState(0.2);
  const [useShadcn, setUseShadcn] = useState(true);
  const [versions, setVersions] = useState<AppVersion[]>([]);
  const [chatTitle, setChatTitle] = useState("Untitled Chat");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileTreeRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleGenerate = async (
    prompt: string,
    selectedModel: string,
    selectedTemperature: number,
    selectedShadcn: boolean
  ) => {
    setLoading(true);
    setGeneratedCode("");
    setModel(selectedModel);
    setTemperature(selectedTemperature);
    setUseShadcn(selectedShadcn);

    const newMessage: ChatMessage = {
      role: "user",
      content: prompt,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);

    try {
      const res = await fetch("/api/generateCode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, newMessage],
          model: selectedModel,
          shadcn: selectedShadcn,
          temperature: selectedTemperature,
        }),
      });

      if (!res.ok) {
        toast.error("Failed to generate code");
        setLoading(false);
        return;
      }

      const data = res.body;
      if (!data) return;

      let code = "";
      const onParse = (event: ParsedEvent | ReconnectInterval) => {
        if (event.type === "event") {
          const data = event.data;
          try {
            code += data;
            setGeneratedCode(code);
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

      // Save version
      const newVersion: AppVersion = {
        id: `v${versions.length + 1}`,
        code,
        prompt,
        timestamp: new Date(),
      };
      setVersions((prev) => [newVersion, ...prev]);

      // Add assistant response
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Code generated successfully!",
          timestamp: new Date(),
        },
      ]);
    } catch (error) {
      console.error("[v0] Error:", error);
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const saveCode = async () => {
    try {
      const element = document.createElement("a");
      element.setAttribute(
        "href",
        `data:text/plain;charset=utf-8,${encodeURIComponent(generatedCode)}`
      );
      element.setAttribute("download", "component.tsx");
      element.style.display = "none";
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      toast.success("Code downloaded!");
    } catch (error) {
      toast.error("Failed to download code");
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(generatedCode);
    toast.success("Code copied to clipboard!");
  };

  return (
    <div className="flex h-screen flex-col bg-background">
      <Header />
      <Toaster />

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* File Tree / Sidebar */}
        <div className="w-64 border-r border-border bg-card p-4 overflow-auto hidden lg:block">
          <div className="mb-4 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">Files</h3>
              <Tooltip>
                <TooltipProvider>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>New file</TooltipContent>
                </TooltipProvider>
              </Tooltip>
            </div>
            {generatedCode && (
              <div className="text-xs text-muted-foreground px-2 py-1 rounded bg-muted cursor-pointer hover:bg-accent">
                component.tsx
              </div>
            )}
          </div>
        </div>

        {/* Main editor area */}
        <ResizablePanelGroup direction="horizontal" className="flex-1">
          {/* Chat / Code panels */}
          <ResizablePanel defaultSize={40} minSize={20} maxSize={60}>
            <Tabs defaultValue="chat" className="h-full flex flex-col">
              <TabsList className="border-b border-border rounded-none w-full justify-start bg-transparent px-4">
                <TabsTrigger value="chat" className="text-xs">
                  Chat
                </TabsTrigger>
                <TabsTrigger value="versions" className="text-xs gap-1">
                  <Clock className="h-3 w-3" />
                  Versions ({versions.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="chat" className="flex-1 overflow-auto p-4">
                <div className="space-y-4 mb-4">
                  {messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${
                        msg.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-xs rounded-lg px-3 py-2 text-sm ${
                          msg.role === "user"
                            ? "bg-blue-600 text-white"
                            : "bg-muted text-foreground"
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {loading && (
                    <div className="flex justify-start">
                      <div className="bg-muted text-foreground px-3 py-2 rounded-lg">
                        <LoadingDots color="black" style="large" />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </TabsContent>

              <TabsContent value="versions" className="flex-1 overflow-auto p-4">
                <div className="space-y-2">
                  {versions.length === 0 ? (
                    <p className="text-xs text-muted-foreground">
                      No versions yet
                    </p>
                  ) : (
                    versions.map((version) => (
                      <button
                        key={version.id}
                        onClick={() => setGeneratedCode(version.code)}
                        className="w-full text-left text-xs p-2 rounded border border-border hover:bg-muted transition-colors"
                      >
                        <div className="font-medium">{version.id}</div>
                        <div className="text-muted-foreground truncate">
                          {version.prompt}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {version.timestamp.toLocaleTimeString()}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </TabsContent>

              {/* Prompt composer at bottom */}
              <div className="border-t border-border p-4">
                <PromptComposer
                  onGenerate={handleGenerate}
                  isLoading={loading}
                  placeholder="Ask me to modify the app..."
                  showSettings={false}
                />
              </div>
            </Tabs>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Code / Preview panels */}
          <ResizablePanel defaultSize={60} minSize={30}>
            <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="h-full flex flex-col">
              <TabsList className="border-b border-border rounded-none w-full justify-start bg-transparent px-4">
                <TabsTrigger value="code" className="text-xs gap-1">
                  <Code2 className="h-3 w-3" />
                  Code
                </TabsTrigger>
                <TabsTrigger value="preview" className="text-xs gap-1">
                  <Eye className="h-3 w-3" />
                  Preview
                </TabsTrigger>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={copyCode}
                        disabled={!generatedCode}
                        className="ml-auto p-2 text-xs text-muted-foreground hover:text-foreground disabled:opacity-50"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Copy code</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={saveCode}
                        disabled={!generatedCode}
                        className="p-2 text-xs text-muted-foreground hover:text-foreground disabled:opacity-50"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Download code</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TabsList>

              <TabsContent value="code" className="flex-1 overflow-auto">
                {generatedCode ? (
                  <CodeViewer code={generatedCode} />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    <p>Generated code will appear here</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="preview" className="flex-1 overflow-auto bg-card">
                {generatedCode ? (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    <p>Live preview will appear here</p>
                  </div>
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    <p>Generate code to see preview</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      <Footer />
    </div>
  );
}
