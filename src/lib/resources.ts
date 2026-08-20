export type ResourceType = "document" | "guide" | "ebook" | "code" | "video" | "template" | "link";
export type ResourceCategory = "technical" | "design" | "career" | "hackathon" | "community" | "general";

export interface Resource {
  id: string;
  title: string;
  description: string;
  content?: string;
  url?: string;
  type: ResourceType;
  category: ResourceCategory;
  author_name: string;
  author_role?: string;
  tags: string[];
  featured: boolean;
  created_at: string;
  downloads_count?: number;
}

export const INITIAL_RESOURCES: Resource[] = [];
/*
  Resources are created by admins and stored in the user's resource store.
  Keep this list empty so the app never presents fake/demo content as real data.
*/
/*
  {
    id: "res-javascript-ebook",
    title: "The Student's JavaScript eBook",
    description: "A practical eBook covering JavaScript fundamentals, DOM programming, async code, and modern ES modules.",
    content: "## The Student's JavaScript eBook\\n\\nA guided reading path from JavaScript basics to real web applications.\\n\\n### Chapters\\n\\n1. Values, variables, and functions\\n2. Arrays, objects, and data structures\\n3. DOM events and browser APIs\\n4. Promises, async/await, and fetching data\\n5. Modules, testing, and clean project structure\\n\\nRead one chapter, complete its exercise, and apply the idea in a mini project.",
    type: "ebook",
    category: "technical",
    author_name: "COPEX Learning Team",
    author_role: "Student Edition",
    tags: ["JavaScript", "Web Development", "Beginner", "eBook"],
    featured: true,
    created_at: "2026-08-18T09:00:00Z",
    downloads_count: 326,
  },
  {
    id: "res-fullstack-roadmap-2026",
    title: "Full-Stack Development Roadmap 2026",
    description: "Complete guide covering modern frontend (React, Next.js, Vite), backend (Node, Nitro, Supabase), APIs, databases, and Cloudflare deployment.",
    content: `## 🚀 Full-Stack Engineering Guide (2026 Edition)

Welcome to the definitive roadmap for modern full-stack web development!

### 1. Core Web Fundamentals
- **HTML5 & Semantic Markup**: Accessibility, SEO structure, metadata.
- **CSS3 & Modern Styling**: Tailwind CSS, CSS Variables, container queries, glassmorphism UI patterns.
- **JavaScript (ESNext) & TypeScript**: Strict type safety, Async/Await, Generics, Event loop.

### 2. Modern Frontend Stack
- **React 19 & Next.js / TanStack Start**: Server components, routing, data fetching hooks.
- **State Management**: TanStack Query (React Query) for server state; Zustand / Context for UI state.

### 3. Backend & Cloud Services
- **Serverless & Edge**: Nitro, Cloudflare Workers, Edge Functions.
- **Database & Auth**: Supabase (PostgreSQL, Row Level Security, Realtime subscriptions, Auth UI).

### 4. Essential Tools
- **Git & GitHub**: Trunk-based development, Pull Request workflow, GitHub Actions CI/CD.
- **Testing & Quality**: Vitest, Playwright, ESLint, Prettier.`,
    url: "https://github.com/topics/full-stack",
    type: "guide",
    category: "technical",
    author_name: "COPEX Tech Lead",
    author_role: "Core Team",
    tags: ["React", "TypeScript", "Supabase", "FullStack", "Roadmap"],
    featured: true,
    created_at: "2026-08-01T10:00:00Z",
    downloads_count: 142,
  },
  {
    id: "res-hackathon-starter-kit",
    title: "COPEX Hackathon Starter Kit & Boilerplate",
    description: "Production-ready template with authentication, UI design system, database connections, and deployment configurations pre-built.",
    content: `## ⚡ COPEX Hackathon Starter Pack

Speed up your hackathon build with this ready-to-use repository template!

### Included Features
- 🎨 **Pre-built UI Kit**: Glassmorphic components, dark mode design system, Radix primitives.
- 🔐 **Authentication**: Supabase Auth (Email, OAuth, JWT management) pre-configured.
- ⚡ **TanStack Router & Query**: Blazing-fast client routing and caching.
- 🛠️ **Deployment Ready**: One-click deployment to Vercel and Cloudflare Pages.

### Quick Start
\`\`\`bash
# Clone the repository
git clone https://github.com/copex-community/hackathon-starter.git my-hackathon-app

# Install dependencies
bun install # or npm install

# Start development server
npm run dev
\`\`\`
`,
    url: "https://github.com/copex-community/hackathon-starter",
    type: "template",
    category: "hackathon",
    author_name: "Hackathon Org",
    author_role: "Organizer",
    tags: ["Hackathon", "Template", "Vite", "React", "Starter"],
    featured: true,
    created_at: "2026-08-05T14:30:00Z",
    downloads_count: 98,
  },
  {
    id: "res-system-design-cheatsheet",
    title: "System Design & Microservices Cheat Sheet",
    description: "High-level architecture concepts, caching strategies, load balancing, database sharding, and interview preparation notes.",
    content: `## 🏗️ System Design Core Principles

### Key Concepts
1. **Scalability**: Horizontal vs. Vertical scaling.
2. **Database Choice**: SQL (ACID, relational integrity) vs NoSQL (eventual consistency, key-value, document).
3. **Caching Strategies**: Redis / Memcached, Cache-aside, Read-through, Write-through.
4. **Load Balancing**: Round Robin, Least Connections, IP Hash.
5. **Message Queues**: RabbitMQ, Kafka, AWS SQS for async processing.

### Distributed Systems Architecture
- API Gateways & Reverse Proxies (Nginx, Traefik).
- CDN (Cloudflare, CloudFront) for static asset distribution.
- Rate limiting algorithms (Token Bucket, Leaky Bucket).`,
    url: "https://systemdesign.one",
    type: "document",
    category: "technical",
    author_name: "Alex Rivera",
    author_role: "Senior Architect",
    tags: ["Architecture", "SystemDesign", "Backend", "Microservices"],
    featured: false,
    created_at: "2026-07-20T09:15:00Z",
    downloads_count: 85,
  },
  {
    id: "res-ui-ux-design-tokens",
    title: "UI/UX Glassmorphism Figma Design System",
    description: "Comprehensive Figma UI kit with dark theme tokens, glassmorphic card variants, color palettes, and component states.",
    content: `## 🎨 COPEX UI/UX Design System Specification

### Design Principles
- **Aesthetic Depth**: Multi-layered glass surfaces, subtle backdrop-blur (12px to 24px), fine borders (\`rgba(255,255,255,0.08)\`).
- **Color Hierarchy**: Premium deep dark background (\`#0a0b10\`), vivid cyan-violet accent highlights, high-contrast typography.
- **Micro-Interactions**: Smooth 200ms cubic-bezier transition curves on hover and click states.

### Included Figma Assets
- Button variants (Primary, Secondary, Ghost, Icon buttons).
- Form inputs, floating dropdowns, modal sheets.
- Pre-made landing page layouts and dashboard cards.`,
    url: "https://figma.com/community",
    type: "template",
    category: "design",
    author_name: "Sarah Chen",
    author_role: "Lead UI Designer",
    tags: ["Figma", "DesignSystem", "UI/UX", "Glassmorphism"],
    featured: true,
    created_at: "2026-08-08T11:20:00Z",
    downloads_count: 210,
  },
  {
    id: "res-resume-portfolio-guide",
    title: "Student Resume & Portfolio Masterclass Notes",
    description: "Actionable tips for crafting tech resumes, building standout project showcases, and acing technical interviews.",
    content: `## 💼 Career & Portfolio Optimization Guide

### 1. Resume Formatting Rules
- Keep to 1 single page.
- Focus on quantifiable achievements (e.g. "Optimized API latency by 40% using Redis caching").
- Clean typography and ATS-friendly PDF layout.

### 2. Building a Standout Portfolio
- Host live demos for every project with sample login credentials.
- Add clear GitHub README documentation with screenshots or GIF demos.
- Highlight your specific role and tech stack used.`,
    type: "guide",
    category: "career",
    author_name: "COPEX Career Club",
    author_role: "Mentors",
    tags: ["Career", "Resume", "Portfolio", "Interviews"],
    featured: false,
    created_at: "2026-07-28T16:00:00Z",
    downloads_count: 64,
  },
  {
    id: "res-git-workflow-guide",
    title: "Git & GitHub Team Collaboration Guide",
    description: "Best practices for branching strategy, writing clean commit messages, resolving merge conflicts, and code reviews.",
    content: `## 🌿 Team Git Workflow & Best Practices

### Branching Convention
- \`main\` / \`master\`: Always stable and ready for deployment.
- \`feature/feature-name\`: For new capabilities.
- \`fix/issue-description\`: For bug fixes.

### Commit Message Standard (Conventional Commits)
- \`feat: add user profile picture uploader\`
- \`fix: resolve navigation overlay click bug\`
- \`docs: update API setup instructions\`
`,
    type: "document",
    category: "community",
    author_name: "DevOps Club",
    author_role: "Community Lead",
    tags: ["Git", "GitHub", "DevOps", "Workflow"],
    featured: false,
    created_at: "2026-08-02T13:45:00Z",
    downloads_count: 53,
  },
];
*/

const STORAGE_KEY = "copex_community_resources_v1";

export function getStoredResources(): Resource[] {
  if (typeof window === "undefined") return INITIAL_RESOURCES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_RESOURCES));
      return INITIAL_RESOURCES;
    }
    const stored = JSON.parse(raw);
    if (!Array.isArray(stored)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_RESOURCES));
      return INITIAL_RESOURCES;
    }

    // Remove the catalog that was shipped as demo content in earlier builds.
    const demoResourceIds = new Set([
      "res-javascript-ebook",
      "res-fullstack-roadmap-2026",
      "res-hackathon-starter-kit",
      "res-system-design-cheatsheet",
      "res-ui-ux-design-tokens",
      "res-resume-portfolio-guide",
      "res-git-workflow-guide",
    ]);
    const cleaned = stored.filter((resource) => !demoResourceIds.has(resource?.id));
    if (cleaned.length !== stored.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
    }
    return cleaned;
  } catch (e) {
    console.error("Error reading resources from localStorage:", e);
    return INITIAL_RESOURCES;
  }
}

export function saveResources(resources: Resource[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(resources));
  } catch (e) {
    console.error("Error saving resources to localStorage:", e);
  }
}

export function getResourceById(id: string): Resource | undefined {
  const all = getStoredResources();
  return all.find((r) => r.id === id);
}

export function createResource(data: Omit<Resource, "id" | "created_at" | "downloads_count">): Resource {
  const all = getStoredResources();
  const newResource: Resource = {
    ...data,
    id: `res-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    created_at: new Date().toISOString(),
    downloads_count: 0,
  };
  const updated = [newResource, ...all];
  saveResources(updated);
  return newResource;
}

export function updateResource(id: string, updates: Partial<Resource>): Resource | null {
  const all = getStoredResources();
  const index = all.findIndex((r) => r.id === id);
  if (index === -1) return null;
  const updatedResource = { ...all[index], ...updates };
  all[index] = updatedResource;
  saveResources(all);
  return updatedResource;
}

export function deleteResource(id: string): boolean {
  const all = getStoredResources();
  const filtered = all.filter((r) => r.id !== id);
  if (filtered.length === all.length) return false;
  saveResources(filtered);
  return true;
}
