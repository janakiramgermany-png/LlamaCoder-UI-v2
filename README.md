# HyperSpeed – AI App Builder

Build production-ready React apps in minutes with AI. Just describe what you want, and HyperSpeed generates it.

## Features

- **Multi-Model Support**: Choose between OpenRouter Auto, Free models, Kimi, and DeepSeek
- **Real-time Code Generation**: Stream responses as they're generated
- **Dark Mode**: Beautiful dark theme with full theme customization
- **Resizable Editor**: Split view IDE with chat, code, preview, and file tree
- **Version History**: Track and revert to previous code generations
- **Screenshot Input**: Upload screenshots for AI to generate apps from
- **Featured Apps**: Browse and share beautiful example apps
- **shadcn/ui Integration**: Pre-built, customizable components
- **Responsive Design**: Works on desktop and mobile
- **One-Click Publishing**: Share your apps publicly with a single click

## Tech Stack

- **Frontend**: Next.js 14+, React, TypeScript
- **UI Components**: shadcn/ui (Radix UI + Tailwind CSS)
- **Database**: Neon PostgreSQL + Prisma ORM
- **Storage**: Vercel Blob (for images/files)
- **AI**: OpenRouter + Vercel AI SDK
- **Styling**: Tailwind CSS with dark mode support
- **Deploy**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ and npm/pnpm
- OpenRouter API key
- Neon PostgreSQL database
- Vercel Blob storage (optional)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/hyperspeed.git
cd hyperspeed
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# .env.local
OPENROUTER_API_KEY=your_openrouter_key
DATABASE_URL=your_neon_database_url
NEXT_PUBLIC_DOMAIN=http://localhost:3000
```

4. Run Prisma migrations:
```bash
npx prisma migrate dev
```

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### Home Page
Describe your app idea and HyperSpeed generates production-ready React code. Customize settings like:
- Model selection (Auto, Free, Kimi, DeepSeek)
- Temperature (creativity vs. determinism)
- shadcn/ui component usage

### Chat IDE (`/chats`)
- **Chat Panel**: Conversational interface to refine your app
- **Code Panel**: View and edit generated code
- **Preview Panel**: See real-time preview
- **Versions**: Browse and restore previous generations
- **File Tree**: Manage project files

### Featured Apps (`/featured`)
- Browse curated apps built with HyperSpeed
- Click any app to view and download its code
- Use as inspiration for your own builds

### Dynamic App View (`/id/[prompt]`)
- View full app details
- Copy or download code
- Share with others

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/generateCode` | POST | Generate code from prompt |
| `/api/featured` | GET | Fetch featured apps |
| `/api/app/[id]` | GET | Fetch individual app |

## Project Structure

```
├── app/
│   ├── (main)/          # Main landing page
│   ├── chats/          # v0.dev-style IDE
│   ├── featured/       # Featured apps showcase
│   ├── id/[prompt]/    # Dynamic app view
│   ├── api/            # API routes
│   └── layout.tsx      # Root layout with theme provider
├── components/
│   ├── ui/             # shadcn/ui components
│   ├── PromptComposer.tsx  # Shared prompt input
│   ├── Header.tsx      # Navigation header
│   ├── Footer.tsx      # Footer
│   └── ...
├── lib/
│   ├── utils.ts        # Utility functions
│   ├── models.ts       # Model registry
│   ├── prisma.ts       # Prisma client singleton
│   └── ...
├── utils/
│   ├── openRouterStream.ts  # AI streaming logic
│   └── ...
├── prisma/
│   └── schema.prisma   # Database schema
└── public/             # Static assets
```

## Roadmap (Future)

- [ ] E2B Python sandbox execution
- [ ] Model fine-tuning on high-quality prompts
- [ ] Upstash Redis rate-limiting
- [ ] Advanced visual inspector / design mode
- [ ] Improved diff and code apply logic
- [ ] Prompt rewriter for optimization
- [ ] Dynamic OG image generation
- [ ] Advanced sharability & collaboration
- [ ] Subscription tiers

## Customization

### Adding Models

Edit `lib/models.ts` and `utils/openRouterStream.ts` to add new models:

```typescript
export const MODEL_REGISTRY = {
  "your-model-id": {
    name: "Model Display Name",
    description: "Brief description",
  },
  // ...
};
```

### Theming

Tailwind CSS variables live in `app/globals.css`. Customize colors, spacing, and more via CSS variables or the Tailwind config.

### Components

All UI components are in `components/ui/` using shadcn/ui. Install new components with:
```bash
npx shadcn-ui@latest add component-name
```

## Contributing

Contributions welcome! Please open an issue or PR. Follow the existing code style and commit message conventions.

## License

MIT – See [LICENSE](LICENSE) for details

## Support

- **Issues**: Open a GitHub issue for bugs or feature requests
- **Docs**: Check the README and inline code comments
- **Community**: Join our Discord (coming soon)

---

Built with ❤️ by the HyperSpeed team. [Deploy your own](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/hyperspeed) on Vercel.
