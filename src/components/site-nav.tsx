import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  Bell,
  BookOpen,
  CalendarDays,
  Home,
  LayoutDashboard,
  LogOut,
  Search,
  Shield,
  Sparkles,
  Ticket,
  User as UserIcon,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { firebaseSignOut } from "@/integrations/firebase/auth";
import { useAuth, usePermissions, useProfile } from "@/hooks/use-auth";
import { notificationsQuery } from "@/lib/data";

const NAV = [
  { to: "/", label: "Home", icon: Home },
  { to: "/events", label: "Events", icon: Sparkles },
  { to: "/resources", label: "Resources", icon: BookOpen },
  { to: "/communities", label: "Communities", icon: Users },
  { to: "/calendar", label: "Calendar", icon: CalendarDays },
] as const;

function Logo() {
  return (
    <Link to="/" className="flex shrink-0 items-center" aria-label="COPEX Community home">
      <img src="/copex-logo.png" alt="COPEX" className="h-10 w-28 object-contain sm:h-12 sm:w-36" />
    </Link>
  );
}

function useUnreadCount() {
  const { user } = useAuth();
  const { data } = useQuery({
    ...notificationsQuery(user?.uid),
    select: (rows) => rows.filter((r) => !r.read).length,
  });
  return data ?? 0;
}

function AccountMenu() {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const { isStaff, isAdmin } = usePermissions();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm">
          <Link to="/login">Sign in</Link>
        </Button>
        <Button asChild size="sm">
          <Link to="/register">Join COPEX</Link>
        </Button>
      </div>
    );
  }

  const initials = (profile?.full_name ?? user.email ?? "?")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await firebaseSignOut();
    navigate({ to: "/login", replace: true });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-full border border-glass-border bg-glass-strong text-xs font-bold transition-colors hover:border-primary/50"
          aria-label="Account menu"
        >
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="" className="size-full rounded-full object-cover" />
          ) : (
            initials
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 rounded-2xl">
        <DropdownMenuLabel className="truncate">
          {profile?.full_name ?? user.email}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/dashboard">
            <LayoutDashboard className="size-4" aria-hidden="true" /> Member dashboard
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/learning-profile">
            <Sparkles className="size-4" aria-hidden="true" /> Learning profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/dashboard">
            <UserIcon className="size-4" aria-hidden="true" /> Dashboard
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/my-registrations">
            <Ticket className="size-4" aria-hidden="true" /> My registrations
          </Link>
        </DropdownMenuItem>
        {isStaff ? (
          <DropdownMenuItem asChild>
            <Link to="/organizer">
              <LayoutDashboard className="size-4" aria-hidden="true" /> Organizer
            </Link>
          </DropdownMenuItem>
        ) : null}
        {isAdmin ? (
          <DropdownMenuItem asChild>
            <Link to="/admin">
              <Shield className="size-4" aria-hidden="true" /> Admin
            </Link>
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={handleSignOut}>
          <LogOut className="size-4" aria-hidden="true" /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function MobileProfileLink() {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  if (!user)
    return (
      <Button asChild size="sm" className="h-9 rounded-full px-3 text-xs">
        <Link to="/login">Sign in</Link>
      </Button>
    );
  const initials = (profile?.full_name ?? user.email ?? "?")
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return <MobileProfileMenu initials={initials} profile={profile} user={user} />;
}

function MobileProfileMenu({
  initials,
  profile,
  user,
}: {
  initials: string;
  profile: ReturnType<typeof useProfile>["data"];
  user: NonNullable<ReturnType<typeof useAuth>["user"]>;
}) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await firebaseSignOut();
    navigate({ to: "/login", replace: true });
  }
  return (
    <>
      <button
        type="button"
        aria-label="Open profile menu"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-full border border-glass-border bg-glass-strong text-xs font-bold transition-colors hover:border-primary/50"
      >
        {profile?.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt="Profile"
            className="size-full rounded-full object-cover"
          />
        ) : (
          initials
        )}
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-[70] sm:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Profile menu"
        >
          <button
            type="button"
            aria-label="Close profile menu"
            className="absolute inset-0 bg-transparent"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-3 top-[4.25rem] w-[min(18rem,calc(100vw-1.5rem))] rounded-3xl border border-slate-200 bg-white p-3 shadow-2xl">
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="flex items-center gap-3">
                <div className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="" className="size-full object-cover" />
                  ) : (
                    initials
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold">
                    {profile?.full_name ?? user.displayName ?? "Student"}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                </div>
              </div>
            </div>
            <div className="mt-2 grid gap-1">
              <Link
                to="/dashboard"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium hover:bg-slate-50"
              >
                <LayoutDashboard className="size-4" /> Dashboard
              </Link>
              <Link
                to="/profile"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium hover:bg-slate-50"
              >
                <UserIcon className="size-4" /> My profile
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-destructive hover:bg-red-50"
              >
                <LogOut className="size-4" /> Sign out
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

export function SiteNav() {
  const { user } = useAuth();
  const unread = useUnreadCount();
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur-md">
      <nav
        className="mx-auto flex h-16 w-full items-center gap-2 px-4 py-0 sm:h-20 sm:gap-3 sm:px-8 lg:px-12"
        aria-label="Main"
      >
        <Logo />

        <ul className="ml-auto hidden items-center gap-1 lg:flex">
          {NAV.map((item) => (
            <li key={item.to}>
              <Link
                to={item.to}
                activeOptions={{ exact: item.to === "/" }}
                className="rounded-full px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-glass hover:text-foreground data-[status=active]:bg-glass-strong data-[status=active]:text-foreground"
              >
                {item.label}
              </Link>
            </li>
          ))}
          {user ? (
            <li>
              <Link
                to="/my-registrations"
                className="rounded-full px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-glass hover:text-foreground data-[status=active]:bg-glass-strong data-[status=active]:text-foreground"
              >
                My registrations
              </Link>
            </li>
          ) : null}
        </ul>

        <div className="ml-auto flex items-center gap-0.5 sm:gap-1.5">
          <Button asChild variant="ghost" size="icon" className="size-9 rounded-full sm:size-10">
            <Link to="/search" aria-label="Search COPEX">
              <Search className="size-4" aria-hidden="true" />
            </Link>
          </Button>

          {user ? (
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="relative size-9 rounded-full sm:size-10"
            >
              <Link to="/notifications" aria-label={`Notifications, ${unread} unread`}>
                <Bell className="size-4" aria-hidden="true" />
                {unread > 0 ? (
                  <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-primary" />
                ) : null}
              </Link>
            </Button>
          ) : null}

          <div className="hidden sm:block">
            <AccountMenu />
          </div>
          <div className="sm:hidden">
            <MobileProfileLink />
          </div>
        </div>
      </nav>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mx-auto mt-24 w-full max-w-7xl px-4 pb-10 sm:px-8 lg:px-12">
      <div className="glass-panel overflow-hidden rounded-[2rem]">
        <div className="grid gap-10 px-6 py-8 sm:px-8 lg:grid-cols-[1.4fr_1fr_1fr] lg:px-10 lg:py-10">
          <div>
            <Link to="/" className="inline-flex" aria-label="COPEX Community home">
              <img
                src="/copex-logo.png"
                alt="COPEX"
                className="h-12 w-36 object-contain object-left"
              />
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-6 text-muted-foreground">
              A student-led community to learn, connect, build, and find opportunities together.
            </p>
            <Link
              to="/about"
              className="mt-5 inline-flex text-sm font-semibold text-primary hover:underline"
            >
              Meet the team
            </Link>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
              Explore
            </p>
            <div className="mt-4 grid gap-3 text-sm">
              <Link to="/events" className="hover:text-primary">
                Events
              </Link>
              <Link to="/resources" className="hover:text-primary">
                Resources
              </Link>
              <Link to="/communities" className="hover:text-primary">
                Communities
              </Link>
              <Link to="/calendar" className="hover:text-primary">
                Calendar
              </Link>
            </div>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
              Community
            </p>
            <div className="mt-4 grid gap-3 text-sm">
              <Link to="/join" className="hover:text-primary">
                Join COPEX
              </Link>
              <Link to="/about" className="hover:text-primary">
                About COPEX
              </Link>
              <Link to="/privacy" className="hover:text-primary">
                Privacy
              </Link>
              <Link to="/terms" className="hover:text-primary">
                Terms
              </Link>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2 border-t border-glass-border px-6 py-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-10">
          <p>© {new Date().getFullYear()} COPEX Community. Built for students.</p>
          <p>Learn. Connect. Participate.</p>
        </div>
      </div>
    </footer>
  );
}
