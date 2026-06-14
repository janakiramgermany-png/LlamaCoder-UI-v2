export default function Footer() {
  return (
    <footer className="mb-3 mt-5 flex h-16 w-full flex-col items-center justify-center space-y-3 px-3 pt-4 text-center text-sm text-muted-foreground sm:mb-0 sm:h-20 sm:flex-row sm:pt-2">
      <div>
        <p>
          Built with AI. Powered by{" "}
          <span className="font-semibold">OpenRouter</span>.
        </p>
      </div>
    </footer>
  );
}
