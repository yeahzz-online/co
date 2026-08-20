import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Download,
  ExternalLink,
  Share2,
  Sparkles,
  Tag,
  User,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { GlassCard, Pill } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { getResourceById, getStoredResources, type Resource } from "@/lib/resources";
import { getResourceIcon } from "./resources";

export const Route = createFileRoute("/resources/$resourceId")({
  head: ({ params }) => {
    const res = getResourceById(params.resourceId);
    return {
      meta: [
        { title: `${res?.title ?? "Resource"} — COPEX Community` },
        { name: "description", content: res?.description ?? "COPEX Community Resource Kit." },
      ],
    };
  },
  component: ResourceDetailPage,
});

function ResourceDetailPage() {
  const { resourceId } = Route.useParams();
  const resource = useMemo(() => getResourceById(resourceId), [resourceId]);
  const [downloading, setDownloading] = useState(false);

  const related = useMemo(() => {
    if (!resource) return [];
    return getStoredResources()
      .filter((r) => r.id !== resource.id && (r.category === resource.category || r.type === resource.type))
      .slice(0, 3);
  }, [resource]);

  if (!resource) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <GlassCard className="p-8">
          <BookOpen className="mx-auto size-12 text-muted-foreground" />
          <h1 className="mt-4 font-display text-xl font-bold">Resource Not Found</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            The resource kit you requested may have been removed or renamed.
          </p>
          <Button asChild className="mt-6 rounded-full">
            <Link to="/resources">Browse all resources</Link>
          </Button>
        </GlassCard>
      </div>
    );
  }

  const Icon = getResourceIcon(resource.type);

  function handleShare() {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Resource link copied to clipboard!");
    }
  }

  function handleDownload() {
    setDownloading(true);
    toast.success(`Accessing "${resource.title}"...`);
    setTimeout(() => {
      setDownloading(false);
      if (resource.url) {
        window.open(resource.url, "_blank");
      }
    }, 600);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      {/* Back button */}
      <div className="mb-6">
        <Button asChild variant="ghost" size="sm" className="rounded-full">
          <Link to="/resources">
            <ArrowLeft className="mr-1 size-4" /> Back to Resources
          </Link>
        </Button>
      </div>

      {/* Main Header Banner */}
      <GlassCard className="relative overflow-hidden p-6 sm:p-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="grid size-10 place-items-center rounded-2xl bg-primary/20 text-primary">
              <Icon className="size-5" />
            </span>
            <Pill tone="violet" className="capitalize">
              {resource.type}
            </Pill>
            <Pill tone="primary" className="capitalize">
              {resource.category}
            </Pill>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="rounded-full" onClick={handleShare} title="Share link">
              <Share2 className="size-4" />
            </Button>
          </div>
        </div>

        <h1 className="mt-6 font-display text-2xl font-black leading-tight sm:text-4xl">
          {resource.title}
        </h1>

        <p className="mt-4 text-base text-muted-foreground sm:text-lg leading-relaxed">
          {resource.description}
        </p>

        {/* Metadata stats */}
        <div className="mt-8 flex flex-wrap items-center gap-6 border-t border-glass-border pt-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <User className="size-4 text-primary" />
            <span>
              Author: <strong>{resource.author_name}</strong> {resource.author_role ? `(${resource.author_role})` : ""}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="size-4 text-primary" />
            <span>Published: {new Date(resource.created_at).toLocaleDateString()}</span>
          </div>
          {resource.downloads_count != null ? (
            <div className="flex items-center gap-2">
              <Download className="size-4 text-primary" />
              <span>{resource.downloads_count} views</span>
            </div>
          ) : null}
        </div>

        {/* Call to action button */}
        <div className="mt-8 flex flex-wrap gap-3">
          {resource.url ? (
            <Button size="lg" className="rounded-full" onClick={handleDownload} disabled={downloading}>
              <ExternalLink className="mr-2 size-4" /> Access Resource Link
            </Button>
          ) : (
            <Button size="lg" className="rounded-full" onClick={handleDownload} disabled={downloading}>
              <Download className="mr-2 size-4" /> Download Resource
            </Button>
          )}
        </div>
      </GlassCard>

      {/* Main Content Body */}
      {resource.content ? (
        <GlassCard className="mt-8 p-6 sm:p-10">
          <div className="prose prose-invert max-w-none prose-headings:font-display prose-headings:font-bold prose-h2:text-xl prose-h3:text-lg prose-p:text-sm prose-p:text-muted-foreground prose-li:text-sm prose-li:text-muted-foreground prose-code:text-primary prose-code:bg-glass prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md">
            <div className="space-y-4 whitespace-pre-wrap font-sans leading-relaxed">
              {resource.content}
            </div>
          </div>
        </GlassCard>
      ) : null}

      {/* Tags */}
      {resource.tags.length > 0 ? (
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground font-semibold">Tags:</span>
          {resource.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-full border border-glass-border bg-glass px-3 py-1 text-xs text-muted-foreground"
            >
              <Tag className="size-3 text-primary" /> #{tag}
            </span>
          ))}
        </div>
      ) : null}

      {/* Related Resources */}
      {related.length > 0 ? (
        <section className="mt-12">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="size-4 text-primary" />
            <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Related Resources
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {related.map((r) => (
              <Link key={r.id} to="/resources/$resourceId" params={{ resourceId: r.id }}>
                <GlassCard className="glass-hover h-full p-5">
                  <Pill tone="neutral" className="text-[10px]">{r.category}</Pill>
                  <h3 className="mt-2 font-display text-sm font-bold truncate">{r.title}</h3>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{r.description}</p>
                </GlassCard>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
