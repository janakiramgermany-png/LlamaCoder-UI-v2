"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";

interface FeaturedApp {
  id: string;
  title: string;
  description: string;
  prompt: string;
  code: string;
}

export default function FeaturedPage() {
  const [apps, setApps] = useState<FeaturedApp[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch featured apps from API
    const fetchFeatured = async () => {
      try {
        const res = await fetch("/api/featured");
        if (res.ok) {
          const data = await res.json();
          setApps(data);
        }
      } catch (error) {
        console.error("[v0] Error fetching featured apps:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h1 className="mb-4 flex items-center justify-center gap-2 text-4xl font-bold sm:text-5xl">
              <Sparkles className="h-8 w-8 text-blue-600" />
              Featured Apps
            </h1>
            <p className="text-lg text-muted-foreground">
              Explore beautiful, production-ready apps built with HyperSpeed
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center">
              <p className="text-muted-foreground">Loading featured apps...</p>
            </div>
          ) : apps.length === 0 ? (
            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                No featured apps yet. Build something amazing!
              </p>
              <Link href="/">
                <Button>Build App</Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {apps.map((app) => (
                <Link key={app.id} href={`/id/${app.id}`}>
                  <Card className="group h-full cursor-pointer overflow-hidden transition-all hover:shadow-lg hover:border-blue-600">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 h-40" />

                    <div className="p-6 space-y-3">
                      <div>
                        <h3 className="text-lg font-bold group-hover:text-blue-600 transition-colors">
                          {app.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {app.description}
                        </p>
                      </div>

                      <p className="text-xs text-muted-foreground italic">
                        "{app.prompt}"
                      </p>

                      <div className="flex items-center gap-2 text-sm font-medium text-blue-600 group-hover:gap-3 transition-all">
                        View <ArrowRight className="h-4 w-4" />
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
