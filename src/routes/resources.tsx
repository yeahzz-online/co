import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BookOpen,
  Code,
  Download,
  ExternalLink,
  FileText,
  Filter,
  FolderKanban,
  LibraryBig,
  Layers,
  Search,
  Sparkles,
  Tag,
  Video,
} from "lucide-react";
import { useMemo, useState } from "react";

import { GlassCard, PageHeader, Pill } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getStoredResources,
  type Resource,
  type ResourceCategory,
  type ResourceType,
} from "@/lib/resources";

export const Route = createFileRoute("/resources")({
  head: () => ({
    meta: [
      { title: "Resources & Guides — COPEX Community" },
      {
        name: "description",
        content: "Explore developer roadmaps, hackathon starter kits, design systems, and study notes on COPEX.",
      },
      { property: "og:title", content: "Resources & Guides — COPEX Community" },
      {
        property: "og:description",
        content: "Explore developer roadmaps, hackathon starter kits, design systems, and study notes.",
      },
    ],
  }),
  component: ResourcesPage,
});

const CATEGORIES: { value: "all" | ResourceCategory; label: string }[] = [
  { value: "all", label: "All Topics" },
  { value: "technical", label: "Technical" },
  { value: "hackathon", label: "Hackathons" },
  { value: "design", label: "Design & UI" },
  { value: "career", label: "Career & Resume" },
  { value: "community", label: "Community" },
];

const TYPES: { value: "all" | ResourceType; label: string }[] = [
  { value: "all", label: "All Types" },
  { value: "guide", label: "Guides" },
  { value: "template", label: "Templates" },
  { value: "ebook", label: "eBooks" },
  { value: "document", label: "Documents" },
  { value: "code", label: "Code" },
  { value: "video", label: "Videos" },
  { value: "link", label: "Links" },
];

export function getResourceIcon(type: ResourceType) {
  switch (type) {
    case "guide":
      return BookOpen;
    case "template":
      return FolderKanban;
    case "ebook":
      return LibraryBig;
    case "code":
      return Code;
    case "video":
      return Video;
    case "link":
      return ExternalLink;
    case "document":
    default:
      return FileText;
  }
}

function ResourcesPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<"all" | ResourceCategory>("all");
  const [type, setType] = useState<"all" | ResourceType>("all");
  const [sort, setSort] = useState<"latest" | "popular">("latest");

  const resources = useMemo(() => getStoredResources(), []);

  const filteredResources = useMemo(() => {
    return resources.filter((res) => {
      const matchCategory = category === "all" || res.category === category;
      const matchType = type === "all" || res.type === type;
      const term = search.trim().toLowerCase();
      const matchSearch =
        !term ||
        res.title.toLowerCase().includes(term) ||
        res.description.toLowerCase().includes(term) ||
        res.tags.some((t) => t.toLowerCase().includes(term)) ||
        res.author_name.toLowerCase().includes(term);

      return matchCategory && matchType && matchSearch;
    });
  }, [resources, category, type, search]);

  const orderedResources = useMemo(() => [...filteredResources].sort((a, b) => sort === "popular"
    ? (b.downloads_count ?? 0) - (a.downloads_count ?? 0)
    : new Date(b.created_at).getTime() - new Date(a.created_at).getTime()), [filteredResources, sort]);

  const latestUpdates = useMemo(() => [...resources].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 3), [resources]);
  const ebooks = useMemo(() => resources.filter((resource) => resource.type === "ebook"), [resources]);

  const featured = useMemo(() => resources.filter((r) => r.featured), [resources]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <PageHeader
        title="Resources & Learning Hub"
        description="Explore eBooks, roadmaps, coding guides, project kits, and the latest community updates."
      />

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[{ label: "Learning resources", value: resources.length }, { label: "eBooks & study notes", value: ebooks.length }, { label: "New this month", value: resources.filter((resource) => new Date(resource.created_at).getMonth() === new Date().getMonth()).length }].map((stat) => (
          <GlassCard key={stat.label} className="p-5"><p className="text-xs uppercase tracking-widest text-muted-foreground">{stat.label}</p><p className="mt-2 font-display text-3xl font-bold">{stat.value}</p></GlassCard>
        ))}
      </div>

      <section className="mt-8 grid gap-5 lg:grid-cols-2">
        <GlassCard className="p-6">
          <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-2xl bg-primary/15 text-primary"><LibraryBig className="size-5" /></span><div><p className="text-xs font-semibold uppercase tracking-widest text-primary">Read & learn</p><h2 className="font-display text-xl font-bold">eBooks and study notes</h2></div></div>
          <p className="mt-3 text-sm text-muted-foreground">Build a consistent learning habit with chapter-based material made for students.</p>
          <Button className="mt-5 rounded-full" onClick={() => setType("ebook")}><LibraryBig className="size-4" /> Browse eBooks</Button>
        </GlassCard>
        <GlassCard className="p-6">
          <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-2xl bg-violet-500/15 text-violet-500"><Sparkles className="size-5" /></span><div><p className="text-xs font-semibold uppercase tracking-widest text-violet-500">Community feed</p><h2 className="font-display text-xl font-bold">Latest updates</h2></div></div>
          <div className="mt-4 space-y-3">{latestUpdates.map((resource) => <Link key={resource.id} to="/resources/$resourceId" params={{ resourceId: resource.id }} className="flex items-center justify-between gap-3 rounded-xl bg-glass p-3 hover:bg-primary/10"><span className="min-w-0 truncate text-sm font-semibold">{resource.title}</span><span className="shrink-0 text-[10px] text-muted-foreground">{new Date(resource.created_at).toLocaleDateString()}</span></Link>)}</div>
        </GlassCard>
      </section>

      {/* Featured Section */}
      {featured.length > 0 && !search && category === "all" && type === "all" ? (
        <section className="mt-8">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="size-4 text-primary" aria-hidden="true" />
            <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Featured Community Kits
            </h2>
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {featured.map((res) => {
              const Icon = getResourceIcon(res.type);
              return (
                <Link key={res.id} to="/resources/$resourceId" params={{ resourceId: res.id }}>
                  <GlassCard className="glass-hover group relative flex h-full flex-col p-6 transition-transform duration-300 hover:-translate-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="grid size-10 place-items-center rounded-2xl bg-primary/15 text-primary">
                        <Icon className="size-5" aria-hidden="true" />
                      </span>
                      <Pill tone="violet">{res.category}</Pill>
                    </div>

                    <h3 className="mt-4 font-display text-lg font-bold group-hover:text-primary transition-colors">
                      {res.title}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                      {res.description}
                    </p>

                    <div className="mt-auto pt-6 flex flex-wrap items-center justify-between gap-2 border-t border-glass-border">
                      <span className="text-xs text-muted-foreground">By {res.author_name}</span>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
                        Read Kit <ExternalLink className="size-3" />
                      </span>
                    </div>
                  </GlassCard>
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}

      {/* Search & Filter Bar */}
      <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search guides, templates, tags, or topics..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 rounded-full border-glass-border bg-glass-strong"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                  category === cat.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-glass border border-glass-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
          <select value={sort} onChange={(event) => setSort(event.target.value as "latest" | "popular")} className="rounded-full border border-glass-border bg-glass px-3 py-1.5 text-xs font-semibold">
            <option value="latest">Latest first</option><option value="popular">Most viewed</option>
          </select>
        </div>
      </div>

      {/* Resource Types Pills */}
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="text-xs font-medium text-muted-foreground self-center mr-1">Type:</span>
        {TYPES.map((t) => (
          <button
            key={t.value}
            onClick={() => setType(t.value)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              type === t.value
                ? "bg-foreground text-background font-semibold"
                : "border border-glass-border bg-glass-strong text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Resource Grid */}
      <div className="mt-8">
        {orderedResources.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {orderedResources.map((res) => {
              const Icon = getResourceIcon(res.type);
              return (
                <Link key={res.id} to="/resources/$resourceId" params={{ resourceId: res.id }}>
                  <GlassCard className="glass-hover group flex h-full flex-col p-6 transition-transform duration-300 hover:-translate-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary">
                          <Icon className="size-4" aria-hidden="true" />
                        </span>
                        <span className="text-xs font-semibold capitalize text-muted-foreground">
                          {res.type}
                        </span>
                      </div>
                      <Pill tone={res.featured ? "primary" : "neutral"}>{res.category}</Pill>
                    </div>

                    <h3 className="mt-4 font-display text-base font-bold group-hover:text-primary transition-colors">
                      {res.title}
                    </h3>
                    <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-muted-foreground">
                      {res.description}
                    </p>

                    {res.tags.length > 0 ? (
                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {res.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1 rounded-md bg-glass px-2 py-0.5 text-[10px] text-muted-foreground"
                          >
                            <Tag className="size-2.5" /> #{tag}
                          </span>
                        ))}
                      </div>
                    ) : null}

                    <div className="mt-auto pt-5 flex items-center justify-between border-t border-glass-border/60 text-xs text-muted-foreground">
                      <span>{res.author_name}</span>
                      {res.downloads_count ? (
                        <span className="inline-flex items-center gap-1">
                          <Download className="size-3 text-primary" /> {res.downloads_count} views
                        </span>
                      ) : null}
                    </div>
                  </GlassCard>
                </Link>
              );
            })}
          </div>
        ) : (
          <GlassCard className="p-12 text-center">
            <BookOpen className="mx-auto size-10 text-muted-foreground" />
            <h3 className="mt-4 text-base font-semibold">No resources match your search</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Try adjusting your keyword search or switching to "All Topics".
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4 rounded-full"
              onClick={() => {
                setSearch("");
                setCategory("all");
                setType("all");
              }}
            >
              Reset Filters
            </Button>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
