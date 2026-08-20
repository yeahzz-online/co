import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useNavigate,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { AuthProvider, useAuth, useProfile } from "@/hooks/use-auth";
import { SiteFooter, SiteNav } from "@/components/site-nav";
import { Toaster } from "@/components/ui/sonner";
import "@/integrations/firebase/client";
import copexLogo from "@/assets/copex-logo.png";
import copexFlag from "@/assets/copex-flag.gif";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="glass-panel max-w-md rounded-3xl px-8 py-10 text-center">
        <h1 className="font-display text-7xl font-black text-primary">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          This page doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Back to COPEX
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="glass-panel max-w-md rounded-3xl px-8 py-10 text-center">
        <h1 className="text-xl font-semibold tracking-tight">This page didn't load</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong. Try again or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-glass-border px-5 py-2.5 text-sm font-medium"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "COPEX Community" },
      {
        name: "description",
        content: "Discover events, classes, workshops and communities on COPEX.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,700&display=swap",
      },
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/copex-logo.png", type: "image/png" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppFrame />
      </AuthProvider>
    </QueryClientProvider>
  );
}

function AppFrame() {
  const { loading } = useAuth();
  return (
    <>
      <ProfileAccessGate />
      {loading ? <BrandLoader /> : null}
      <div className="relative flex min-h-screen flex-col">
        <SiteNav />
        <main className="flex-1 pt-20">
          <Outlet />
        </main>
        <SiteFooter />
      </div>
      <Toaster position="top-center" />
    </>
  );
}

function BrandLoader() {
  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-center !bg-white"
      style={{ backgroundColor: "#ffffff" }}
      role="status"
      aria-label="Loading COPEX"
    >
      <img src={copexFlag} alt="COPEX" className="size-64 object-contain" />
    </div>
  );
}

function ProfileAccessGate() {
  const { user, loading } = useAuth();
  const { data: profile, isLoading } = useProfile();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  useEffect(() => {
    if (
      loading ||
      isLoading ||
      !user ||
      pathname === "/join" ||
      pathname === "/login" ||
      pathname === "/register"
    )
      return;
    const member = profile as
      (typeof profile & { institution?: string; profile_interests?: string[] }) | null;
    if (
      !member?.full_name ||
      !member.institution ||
      !member.year ||
      !member.profile_interests?.length
    )
      navigate({ to: "/join", replace: true });
  }, [isLoading, loading, navigate, pathname, profile, user]);
  return null;
}
