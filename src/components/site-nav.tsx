import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  CalendarDays,
  GraduationCap,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Shield,
  Sparkles,
  Ticket,
  User as UserIcon,
  Users,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, usePermissions, useProfile } from "@/hooks/use-auth";
import { notificationsQuery } from "@/lib/data";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Home", icon: Home },
  { to: "/events", label: "Events", icon: Sparkles },
  { to: "/classes", label: "Classes", icon: GraduationCap },
  { to: "/communities", label: "Communities", icon: Users },
  { to: "/calendar", label: "Calendar", icon: CalendarDays },
] as const;

const MOBILE_NAV = [
  { to: "/", label: "Home", icon: Home },
  { to: "/events", label: "Events", icon: Sparkles },
  { to: "/classes", label: "Classes", icon: GraduationCap },
  { to: "/calendar", label: "Calendar", icon: CalendarDays },
  { to: "/my-registrations", label: "Tickets", icon: Ticket },
] as const;

function Logo() {
  return (
    <Link to="/" className="flex shrink-0 items-center gap-2" aria-label="COPEX Community home">
      <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
        <Sparkles className="size-4" aria-hidden="true" />
      </span>
      <span className="font-display text-lg font-bold tracking-tight">COPEX</span>
    </Link>
  );
}

function useUnreadCount() {
  const { user } = useAuth();
  const { data } = useQuery({
    ...notificationsQuery(user?.id),
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
    await supabase.auth.signOut();
    navigate({ to: "/login", replace: true });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="grid size-9 shrink-0 place-items-center rounded-full border border-glass-border bg-glass-strong text-xs font-bold transition-colors hover:border-primary/50"
          aria-label="Account menu"
        >
          {initials}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 rounded-2xl">
        <DropdownMenuLabel className="truncate">{profile?.full_name ?? user.email}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/profile">
            <UserIcon className="size-4" aria-hidden="true" /> Profile
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

export function SiteNav() {
  const { user } = useAuth();
  const unread = useUnreadCount();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-5">
      <nav
        className="glass-strong mx-auto flex max-w-7xl items-center gap-3 rounded-3xl px-3 py-2.5 sm:px-5"
        aria-label="Main"
      >
        <Logo />

        <ul className="ml-3 hidden items-center gap-1 lg:flex">
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

        <div className="ml-auto flex items-center gap-1.5">
          <Button asChild variant="ghost" size="icon" className="rounded-full">
            <Link to="/search" aria-label="Search COPEX">
              <Search className="size-4" aria-hidden="true" />
            </Link>
          </Button>

          {user ? (
            <Button asChild variant="ghost" size="icon" className="relative rounded-full">
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

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full lg:hidden" aria-label="Open menu">
                <Menu className="size-4" aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="glass-strong w-[86vw] max-w-sm border-glass-border">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <div className="mt-6 flex flex-col gap-1 px-4">
                {NAV.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-glass hover:text-foreground data-[status=active]:bg-glass-strong data-[status=active]:text-foreground"
                  >
                    <item.icon className="size-4" aria-hidden="true" />
                    {item.label}
                  </Link>
                ))}
                <Link
                  to="/my-registrations"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-glass hover:text-foreground"
                >
                  <Ticket className="size-4" aria-hidden="true" /> My registrations
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-glass hover:text-foreground"
                >
                  <UserIcon className="size-4" aria-hidden="true" /> Profile
                </Link>
                <div className="mt-4 border-t border-glass-border pt-4 sm:hidden">
                  <AccountMenu />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}

export function MobileTabBar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav
      className="glass-strong fixed inset-x-3 bottom-3 z-50 grid grid-cols-5 rounded-3xl p-1.5 md:hidden"
      aria-label="Primary mobile"
    >
      {MOBILE_NAV.map((item) => {
        const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
        return (
          <Link
            key={item.to}
            to={item.to}
            className={cn(
              "flex flex-col items-center gap-1 rounded-2xl px-1 py-2 text-[10px] font-semibold transition-colors",
              active ? "bg-primary/15 text-primary" : "text-muted-foreground",
            )}
          >
            <item.icon className="size-4" aria-hidden="true" />
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function SiteFooter() {
  return (
    <footer className="mx-auto mt-24 max-w-7xl px-4 pb-28 md:pb-10">
      <div className="glass-panel flex flex-col gap-4 rounded-3xl px-6 py-7 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="font-display text-lg font-bold">COPEX Community</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Learn. Connect. Participate.
          </p>
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
          <Link to="/events" className="hover:text-foreground">
            Events
          </Link>
          <Link to="/classes" className="hover:text-foreground">
            Classes
          </Link>
          <Link to="/communities" className="hover:text-foreground">
            Communities
          </Link>
          <Link to="/calendar" className="hover:text-foreground">
            Calendar
          </Link>
        </div>
      </div>
    </footer>
  );
}
