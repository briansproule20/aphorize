# Aphorize - Implementation Summary

## Overview
Aphorize is a production-ready Next.js 15 app that helps users find and create memorable quotes with AI, then turn them into beautiful posters. The app uses Echo SDK for authentication and billing, and the Vercel AI SDK for AI capabilities.

## Tech Stack
- **Framework**: Next.js 15 (App Router, TypeScript), React 19
- **Styling**: Tailwind CSS 4 with Classic color palette (Onyx #1A1A1A, Paper #F5F3EF, Brass #CBB682)
- **UI Components**: shadcn/ui (clean, responsive design)
- **Authentication & Billing**: Echo Next SDK
- **AI**: Vercel AI SDK with multiple providers:
  - Anthropic (Claude Sonnet 4 - default, Claude 3.5 Sonnet, Claude Haiku)
  - OpenAI (GPT-4o - backup)
  - Google Gemini (Nano Banana for image generation)
- **Image Sources**: Unsplash, Pexels, AI generation (Nano Banana), local uploads
- **Quote Sources**: Quotable API (default)

## Key Features

### 1. Quote Chat (Main Page)
**Location**: `/` (src/app/_components/chat-quote.tsx)

Two-tab workflow:
- **Find Tab**: Search real quotes by keywords, author, or tags. Option to fallback to AI generation if no results found.
- **Generate Tab**: Create original AI quotes with customizable:
  - Occasion (birthday, wedding, graduation, etc.)
  - Tone (sincere, witty, inspirational, etc.)
  - Length (short, medium, long)
  - Audience (optional)

Features:
- Model selection (Claude Sonnet 4 default)
- Real-time streaming responses
- "Posterize" button on each quote to send to poster builder
- Copy to clipboard functionality
- Clear labeling of AI-generated vs. real quotes

### 2. Poster Builder
**Location**: `/poster` (src/app/poster/page.tsx)

**Left Panel - Settings**:
- Quote text and author (editable)
- Typography controls:
  - Font family (Serif, Sans Serif, Monospace, etc.)
  - Font weight (Normal to Extra Bold)
  - Font size (24-120px)
  - Line height (1.0-2.0)
  - Text alignment (left, center, right)
  - Text color picker
  - Padding control
  - Text shadow toggle
  - Text stroke toggle
  - Watermark toggle

**Background Sources** (3 tabs):
1. **Upload**: Local file upload or solid color picker
2. **Photo**: Search Unsplash or Pexels with photographer attribution
3. **AI**: Generate abstract backgrounds using Google Nano Banana

**Right Panel - Preview**:
- Live canvas preview
- Download PNG button
- Photographer attribution (for stock photos)

### 3. Header & Navigation
**Location**: src/app/_components/header.tsx

- Responsive hamburger menu (mobile)
- Desktop navigation links
- Echo balance widget
- Sign in/out functionality

## API Routes

### Chat API (`/api/chat`)
**Location**: src/app/api/chat/route.ts

Handles both search and generate modes:
- Search mode: Queries Quotable API for real quotes
- Generate mode: Uses AI (Claude/GPT) to create original quotes
- Supports multiple AI providers (Anthropic, OpenAI)
- Fallback logic if search finds no results

### Image Generation API (`/api/image`)
**Location**: src/app/api/image/route.ts

Uses Google Gemini 2.5 Flash Image (Nano Banana) to generate abstract backgrounds for quote posters through Echo's billing system.

### Poster API (Stub)
**Location**: src/app/api/poster/route.ts

Stubbed for future server-side rendering. Current implementation uses client-side Canvas API.

## Components

### Core Components
- **PhotoSearch** (src/components/photo-search.tsx): Unsplash/Pexels integration with attribution
- **PosterCanvas** (src/components/poster-canvas.tsx): Client-side canvas rendering with text wrapping and export
- **ChatQuote** (src/app/_components/chat-quote.tsx): Main chat interface with Find/Generate tabs

### UI Components (shadcn/ui)
All located in src/components/ui/:
- Button, Input, Textarea, Label
- Tabs, Dialog, Switch, Separator
- Select, Card, Badge, Avatar
- Sheet (hamburger menu)
- Tooltip, Popover, Hover Card
- Scroll Area, Carousel, Collapsible

## Configuration

### Environment Variables (.env.local)
```env
# Echo App ID (required)
ECHO_APP_ID=your_echo_app_id
NEXT_PUBLIC_ECHO_APP_ID=your_echo_app_id

# Quote API (default: Quotable)
QUOTES_API_URL=https://api.quotable.io/search/quotes

# Photo APIs (optional)
NEXT_PUBLIC_UNSPLASH_ACCESS_KEY=your_unsplash_access_key_here
NEXT_PUBLIC_PEXELS_API_KEY=your_pexels_api_key_here
```

### Color Palette (Classic Theme)
- **Onyx**: #1A1A1A (26, 26, 26) - Dark backgrounds
- **Paper**: #F5F3EF (245, 243, 239) - Light backgrounds
- **Brass**: #CBB682 (203, 182, 130) - Accent color

Applied throughout UI as:
- Primary color: Brass
- Background (light): Paper
- Background (dark): Onyx
- All borders, text, and interactive elements use this palette

## Project Structure
```
aphorize/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── chat/route.ts          # Quote search & generation
│   │   │   ├── image/route.ts         # Nano Banana image gen
│   │   │   ├── poster/route.ts        # Poster stub
│   │   │   └── echo/[...echo]/route.ts # Echo handlers
│   │   ├── _components/
│   │   │   ├── chat-quote.tsx         # Main chat UI
│   │   │   ├── header.tsx             # Navigation
│   │   │   └── echo/                  # Echo components
│   │   ├── poster/
│   │   │   └── page.tsx               # Poster builder
│   │   ├── globals.css                # Tailwind + theme
│   │   ├── layout.tsx                 # Root layout
│   │   └── page.tsx                   # Home page
│   ├── components/
│   │   ├── photo-search.tsx           # Unsplash/Pexels
│   │   ├── poster-canvas.tsx          # Canvas rendering
│   │   └── ui/                        # shadcn components
│   ├── echo/
│   │   └── index.ts                   # Echo config
│   └── lib/
│       └── utils.ts                   # Utilities
├── public/                            # Static assets
├── .env.local                         # Environment config
├── package.json                       # Dependencies
└── tsconfig.json                      # TypeScript config
```

## Features Implemented

✅ Next.js 15 App Router with TypeScript
✅ Echo SDK integration for auth + billing
✅ Classic color palette (Onyx, Paper, Brass)
✅ Hamburger menu with slide-out navigation
✅ Responsive mobile/desktop design
✅ Quote search (Quotable API)
✅ AI quote generation (Claude Sonnet 4, 3.5, Haiku, GPT-4o)
✅ Find vs Generate tabs
✅ AI image generation (Google Nano Banana)
✅ Unsplash/Pexels photo search with attribution
✅ Local image upload
✅ Client-side canvas poster rendering
✅ Text wrapping and positioning
✅ Typography controls (font, size, weight, alignment, etc.)
✅ PNG export with download
✅ Watermark toggle
✅ Settings persistence (localStorage)
✅ "Posterize" button to send quotes to poster builder

## Running the App

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

The app runs on http://localhost:3000 (or next available port).

## Notes

- **Quote Attribution**: Real quotes from Quotable include author and source. AI-generated quotes are clearly labeled.
- **Photo Attribution**: Unsplash and Pexels photos display photographer credit with required links.
- **Poster Rendering**: Currently client-side only. Server-side rendering can be added later using @napi-rs/canvas.
- **AI Billing**: All AI calls (chat + image generation) are billed through Echo.
- **Model Defaults**: Claude Sonnet 4 is the default chat model. Nano Banana is used for background generation.

## Future Enhancements

- Server-side poster rendering
- Export sizes (1:1, 4:5, 9:16)
- JPEG export option
- Brand kits (color + font presets)
- Occasions preset library
- Keyboard shortcuts (⌘K quick actions, / focus input)
- More image generation providers
- Quote favorites/history
