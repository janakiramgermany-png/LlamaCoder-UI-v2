import Link from "next/link";
import { Zap } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";

export default function Header() {
  return (
    <header className="relative mx-auto flex w-full items-center justify-between px-4 py-4 sm:px-6">
      <Link
        href="/"
        className="flex items-center gap-2 font-bold text-lg transition-opacity hover:opacity-80"
      >
        <Zap className="h-5 w-5 text-blue-600" />
        <span>
          <span className="text-blue-600">Hyper</span>Speed
        </span>
      </Link>
      <ThemeToggle />
    </header>
  );
}
