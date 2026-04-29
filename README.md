# Sales Craft AI

Sales Craft AI is an AI-powered application for generating, previewing, and exporting high-converting sales pages. It uses OpenAI to generate copy and layout structures based on user inputs, providing a complete editing and previewing experience.

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Backend & Database**: [Convex](https://convex.dev/)
- **Authentication**: [Better Auth](https://better-auth.com/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components**: [Shadcn UI](https://ui.shadcn.com/) / Radix UI
- **AI Integration**: [Vercel AI SDK](https://sdk.vercel.ai/) & OpenAI (`gpt-4o-mini`)

## Features

- **AI Sales Page Generation**: Input your product details, target audience, and pricing, and let AI generate a structured, high-converting sales page.
- **Editable Sections**: Edit generated sections directly, including benefits, features, and pricing tiers.
- **Real-time Preview**: View changes as you make them with a responsive, modern design.
- **Export to HTML**: Export the finalized sales page as a standalone HTML file ready for deployment.
- **Authentication**: Secure Google Sign-In using Better Auth.
- **Light/Dark Mode**: Built-in theming support.

## Getting Started

### Prerequisites

- Node.js 18+ and `npm` or `pnpm` installed
- A [Convex](https://convex.dev/) account
- An [OpenAI API Key](https://platform.openai.com/)
- A Google OAuth Client ID and Secret (for authentication)

### Installation

1. Clone the repository and install dependencies:

```bash
pnpm install
```

2. Set up your environment variables:

Copy `.env.example` to `.env.local` and fill in the necessary keys (like `OPENAI_API_KEY`, etc.).

```bash
cp .env.example .env.local
```

3. Start the development server (runs both Next.js and Convex):

```bash
pnpm run dev
```

This will run Next.js on `http://localhost:3000` and start the Convex dev server, syncing your schema and functions.

## Project Structure

- `app/`: Next.js App Router pages and layouts.
  - `(auth)/`: Protected routes (e.g., `sales-pages` creation and editing).
  - `(unauth)/`: Public routes (e.g., sign in).
- `convex/`: Convex backend functions, database schema, and Better Auth configuration.
- `components/`: Reusable React components and UI elements.

## Scripts

- `pnpm run dev`: Starts the frontend and backend development servers concurrently.
- `pnpm run lint`: Runs ESLint and type checking for both frontend and Convex code.
