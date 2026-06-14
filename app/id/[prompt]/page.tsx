"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CodeViewer from "@/components/code-viewer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Copy, Download } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface AppData {
  id: string;
  title: string;
  description: string;
  prompt: string;
  code: string;
}

export default function AppViewPage() {
  const params = useParams();
  const appId = params.prompt as string;
  const [app, setApp] = useState<AppData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApp = async () => {
      try {
        const res = await fetch(`/api/app/${appId}`);
        if (res.ok) {
          const data = await res.json();
          setApp(data);
        } else {
          toast.error("App not found");
        }
      } catch (error) {
        console.error("[v0] Error fetching app:", error);
        toast.error("Failed to load app");
      } finally {
        setLoading(false);
      }
    };

    if (appId) {
      fetchApp();
    }
  }, [appId]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Loading app...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!app) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">App not found</h1>
            <p className="text-muted-foreground mb-4">
              This app no longer exists or has been removed.
            </p>
            <Link href="/">
              <Button>Back to home</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const copyCode = () => {
    navigator.clipboard.writeText(app.code);
    toast.success("Code copied to clipboard!");
  };

  const downloadCode = () => {
    const element = document.createElement("a");
    element.setAttribute(
      "href",
      `data:text/plain;charset=utf-8,${encodeURIComponent(app.code)}`
    );
    element.setAttribute("download", `${app.title || "component"}.tsx`);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success("Code downloaded!");
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <Link href="/" className="text-blue-600 hover:underline text-sm">
              ← Back
            </Link>
            <h1 className="mt-4 text-4xl font-bold">{app.title}</h1>
            <p className="mt-2 text-lg text-muted-foreground">
              {app.description}
            </p>
            <p className="mt-4 italic text-muted-foreground">
              Prompt: "{app.prompt}"
            </p>
          </div>

          {/* Code view */}
          <Card className="overflow-hidden mb-8">
            <div className="flex items-center justify-between border-b border-border bg-card p-4">
              <h2 className="font-semibold">Code</h2>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={copyCode}
                  className="gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Copy
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={downloadCode}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </div>
            </div>
            <div className="max-h-96 overflow-auto">
              <CodeViewer code={app.code} />
            </div>
          </Card>

          {/* Share */}
          <Card className="p-6 text-center">
            <h3 className="font-semibold mb-2">Like this app?</h3>
            <p className="text-muted-foreground mb-4">
              Build your own amazing app with HyperSpeed
            </p>
            <Link href="/">
              <Button size="lg">Start building</Button>
            </Link>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
