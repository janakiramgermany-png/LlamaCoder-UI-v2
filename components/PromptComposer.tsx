"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
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
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Send,
  Settings2,
  Paperclip,
  X,
  Zap,
  Volume2,
  Sparkles,
  ChevronDown,
  Image as ImageIcon,
} from "lucide-react";
import { MODEL_REGISTRY } from "@/utils/openRouterStream";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export interface PromptComposerProps {
  onGenerate: (
    prompt: string,
    model: string,
    temperature: number,
    shadcn: boolean,
    imageData?: string
  ) => void;
  isLoading?: boolean;
  placeholder?: string;
  showSettings?: boolean;
}

export function PromptComposer({
  onGenerate,
  isLoading = false,
  placeholder = "Describe your app...",
  showSettings = true,
}: PromptComposerProps) {
  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState("openrouter/auto");
  const [temperature, setTemperature] = useState(0.2);
  const [useShadcn, setUseShadcn] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGenerate = () => {
    if (prompt.trim() || attachedImage) {
      onGenerate(
        prompt,
        model,
        temperature,
        useShadcn,
        attachedImage || undefined
      );
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.ctrlKey) {
      handleGenerate();
    }
  };

  const handleImageAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setAttachedImage(base64);
        setImagePreview(base64);
        // Auto-populate prompt if not set
        if (!prompt.trim()) {
          setPrompt("Build an app based on this screenshot/design");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setAttachedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <TooltipProvider>
      <div className="w-full space-y-3">
        {/* Image preview */}
        {imagePreview && (
          <div className="relative inline-block max-w-xs overflow-hidden rounded-lg border border-border">
            <img
              src={imagePreview}
              alt="Attached"
              className="h-auto w-full max-h-48 object-cover"
            />
            <button
              onClick={removeImage}
              className="absolute top-1 right-1 rounded-full bg-destructive p-1 text-destructive-foreground hover:bg-destructive/90"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}

        {/* Textarea */}
        <div className="relative">
          <Textarea
            ref={textareaRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isLoading}
            className="min-h-24 resize-none pr-12"
          />
          {/* Attach button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="absolute right-3 bottom-3 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 cursor-pointer"
              >
                <Paperclip className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Attach image or screenshot</TooltipContent>
          </Tooltip>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageAttach}
            disabled={isLoading}
          />
        </div>

        {/* Footer toolbar */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {/* Model selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1 text-xs"
                  disabled={isLoading}
                >
                  <Sparkles className="h-3 w-3" />
                  {MODEL_REGISTRY[model as keyof typeof MODEL_REGISTRY]
                    ?.name || "Model"}
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {Object.entries(MODEL_REGISTRY).map(([key, value]) => (
                  <DropdownMenuItem key={key} onClick={() => setModel(key)}>
                    <span className="flex flex-col gap-0.5">
                      <span className="font-medium">{value.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {value.description}
                      </span>
                    </span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Settings dialog */}
            {showSettings && (
              <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
                <DialogTrigger asChild>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={isLoading}
                        className="h-9 w-9 p-0"
                      >
                        <Settings2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Settings</TooltipContent>
                  </Tooltip>
                </DialogTrigger>
                <DialogContent className="max-w-sm">
                  <DialogHeader>
                    <DialogTitle>Generation Settings</DialogTitle>
                    <DialogDescription>
                      Fine-tune the code generation behavior.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    {/* Temperature */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">
                          Temperature
                        </label>
                        <span className="text-xs text-muted-foreground">
                          {temperature.toFixed(1)}
                        </span>
                      </div>
                      <Slider
                        value={[temperature]}
                        onValueChange={(val) => setTemperature(val[0])}
                        min={0}
                        max={1}
                        step={0.1}
                        className="w-full"
                      />
                      <p className="text-xs text-muted-foreground">
                        Lower = more deterministic, Higher = more creative
                      </p>
                    </div>

                    {/* Shadcn toggle */}
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">
                        Use shadcn Components
                      </label>
                      <Switch
                        checked={useShadcn}
                        onCheckedChange={setUseShadcn}
                      />
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {/* Generate button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={handleGenerate}
                disabled={isLoading || (!prompt.trim() && !attachedImage)}
                size="sm"
                className="gap-1"
              >
                <Send className="h-3 w-3" />
                {isLoading ? "Generating..." : "Generate"}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Ctrl+Enter to send</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
}
