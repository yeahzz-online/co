import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Bell,
  BarChart3,
  BriefcaseBusiness,
  BookOpen,
  Building2,
  CalendarDays,
  ChevronRight,
  CheckCircle2,
  ClipboardList,
  Database as DatabaseIcon,
  Download,
  Eye,
  FilePlus,
  FolderKanban,
  Layers,
  LayoutDashboard,
  Loader2,
  Mail,
  Megaphone,
  Menu,
  Pencil,
  Plus,
  Search,
  Send,
  Shield,
  Sparkles,
  Settings,
  Trash2,
  Trophy,
  UserCheck,
  Users,
  UserRoundCog,
  XCircle,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { ErrorState, GlassCard, PageHeader, Pill, RowSkeleton } from "@/components/ui-kit";
import { CollegeImportCard } from "@/components/college-import-card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth, usePermissions } from "@/hooks/use-auth";
import {
  collectionRef,
  documentRef,
  getDocs,
  saveUserProfile,
  setDoc,
  type FirestoreUserProfile,
} from "@/integrations/firebase/firestore";
import { firebaseStore } from "@/integrations/firebase/store";
import {
  createResource,
  deleteResource,
  getStoredResources,
  type Resource,
  type ResourceCategory,
  type ResourceType,
  updateResource,
} from "@/lib/resources";

type FirestoreAnnouncement = {
  id: string;
  title: string;
  body: string;
  audience?: string;
  published?: boolean;
  created_at: string;
};

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Panel — COPEX Community" },
      {
        name: "description",
        content: "Platform moderation, resource creation, role management, and system overview.",
      },
      { property: "og:title", content: "Admin Panel — COPEX Community" },
      { property: "og:description", content: "COPEX platform administration and moderation." },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const { user } = useAuth();
  const { isAdmin, isLoading: permissionsLoading } = usePermissions();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");

  // State for Resource Modal
  const [resources, setResources] = useState<Resource[]>(() => getStoredResources());
  const [resourceModalOpen, setResourceModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);

  const [resTitle, setResTitle] = useState("");
  const [resDesc, setResDesc] = useState("");
  const [resContent, setResContent] = useState("");
  const [resUrl, setResUrl] = useState("");
  const [resCategory, setResCategory] = useState<ResourceCategory>("technical");
  const [resType, setResType] = useState<ResourceType>("guide");
  const [resAuthor, setResAuthor] = useState("COPEX Admin");
  const [resAuthorRole, setResAuthorRole] = useState("Admin Team");
  const [resTags, setResTags] = useState("React, FullStack");
  const [resFeatured, setResFeatured] = useState(false);

  // User search in User Management tab
  const [userSearch, setUserSearch] = useState("");
  const [mailAudience, setMailAudience] = useState<"all_members" | "event_registrants">(
    "all_members",
  );
  const [mailActivityId, setMailActivityId] = useState("");
  const [mailSubject, setMailSubject] = useState("");
  const [mailPreview, setMailPreview] = useState("");
  const [mailMessage, setMailMessage] = useState("");
  const [opportunityTitle, setOpportunityTitle] = useState("");
  const [opportunityOrganization, setOpportunityOrganization] = useState("");
  const [opportunityKind, setOpportunityKind] = useState("internship");
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementBody, setAnnouncementBody] = useState("");

  // Platform stats query
  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
    refetch: refetchStats,
  } = useQuery({
    queryKey: ["admin-stats"],
    enabled: isAdmin,
    queryFn: async () => {
      const [
        activities,
        registrations,
        communities,
        opportunities,
        announcementsSnapshot,
        colleges,
        representatives,
        reports,
        usersSnapshot,
      ] = await Promise.all([
        firebaseStore
          .from("activities")
          .select("id, published, title, kind, created_at, starts_at, seats_taken, capacity", {
            count: "exact",
          }),
        firebaseStore
          .from("registrations")
          .select("id, status, full_name, created_at", { count: "exact" }),
        firebaseStore.from("communities").select("id, published, name", { count: "exact" }),
        firebaseStore
          .from("opportunities")
          .select("id, title, organization, kind, published, deadline, created_at", {
            count: "exact",
          }),
        getDocs(collectionRef<FirestoreAnnouncement>("announcements")),
        firebaseStore
          .from("colleges")
          .select("id, name, city, state, status, created_at", { count: "exact" }),
        firebaseStore
          .from("college_representatives")
          .select("id, college_id, user_id, status, created_at", { count: "exact" }),
        firebaseStore
          .from("content_reports")
          .select("id, content_type, reason, status, created_at", { count: "exact" }),
        getDocs(collectionRef<FirestoreUserProfile>("users")),
      ]);
      const referralsSnapshot = await getDocs(collectionRef<Record<string, unknown>>("referrals"));
      const referralCounts = referralsSnapshot.docs.reduce<Record<string, number>>(
        (counts, snapshot) => {
          const referrerId = snapshot.data().referrer_id;
          if (typeof referrerId === "string") counts[referrerId] = (counts[referrerId] ?? 0) + 1;
          return counts;
        },
        {},
      );
      const profiles = usersSnapshot.docs.map((snapshot) => ({
        id: snapshot.id,
        ...snapshot.data(),
        referrals: referralCounts[snapshot.id] ?? snapshot.data().referrals ?? 0,
      }));
      return {
        activitiesCount: activities.count ?? 0,
        registrationsCount: registrations.count ?? 0,
        communitiesCount: communities.count ?? 0,
        profilesCount: profiles.length,
        activitiesList: activities.data ?? [],
        registrationsList: registrations.data ?? [],
        communitiesList: communities.data ?? [],
        opportunitiesList: opportunities.data ?? [],
        announcementsList: announcementsSnapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        })),
        collegesList: colleges.data ?? [],
        representativesList: representatives.data ?? [],
        reportsList: reports.data ?? [],
        profilesList: profiles,
      };
    },
  });

  const pendingRegistrationsCount = useMemo(() => {
    return stats?.registrationsList.filter((r) => r.status === "pending").length ?? 0;
  }, [stats]);

  const registrationTrend = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - (6 - index));
      return date;
    });
    return days.map((date) => {
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      const count =
        stats?.registrationsList.filter((registration) => {
          const created = new Date(registration.created_at);
          return created >= date && created < nextDay;
        }).length ?? 0;
      return {
        day: date.toLocaleDateString(undefined, { weekday: "short" }),
        registrations: count,
      };
    });
  }, [stats]);

  const activityBreakdown = useMemo(() => {
    const kinds = ["event", "hackathon", "workshop", "opportunity"];
    return kinds.map((kind) => ({
      kind: kind[0].toUpperCase() + kind.slice(1),
      total: stats?.activitiesList.filter((activity) => activity.kind === kind).length ?? 0,
    }));
  }, [stats]);

  const searchResults = useMemo(() => {
    const term = globalSearch.trim().toLowerCase();
    if (!term || !stats) return [];
    return [
      ...(stats.profilesList ?? [])
        .filter((item) =>
          `${item.full_name ?? ""} ${item.email ?? ""}`.toLowerCase().includes(term),
        )
        .slice(0, 4)
        .map((item) => ({
          type: "Student",
          title: item.full_name || item.email || "Unnamed student",
          meta: item.email || "Member",
          tab: "users",
        })),
      ...(stats.collegesList ?? [])
        .filter((item) =>
          `${item.name} ${item.city ?? ""} ${item.state ?? ""}`.toLowerCase().includes(term),
        )
        .slice(0, 4)
        .map((item) => ({
          type: "College",
          title: item.name,
          meta: [item.city, item.state].filter(Boolean).join(", "),
          tab: "overview",
        })),
      ...(stats.activitiesList ?? [])
        .filter((item) => item.title.toLowerCase().includes(term))
        .slice(0, 4)
        .map((item) => ({
          type: "Program",
          title: item.title,
          meta: item.kind,
          tab: "moderation",
        })),
      ...(stats.opportunitiesList ?? [])
        .filter((item) => `${item.title} ${item.organization ?? ""}`.toLowerCase().includes(term))
        .slice(0, 4)
        .map((item) => ({
          type: "Opportunity",
          title: item.title,
          meta: item.organization || item.kind,
          tab: "opportunities",
        })),
    ].slice(0, 8);
  }, [globalSearch, stats]);

  const sendMail = useMutation({
    mutationFn: async (): Promise<{ delivered: number }> => {
      const { data, error } = await firebaseStore.functions.invoke<{ delivered: number }>(
        "send-campaign",
        {
          body: {
            audience: mailAudience,
            activityId:
              mailAudience === "event_registrants" ? mailActivityId || undefined : undefined,
            subject: mailSubject,
            previewText: mailPreview || undefined,
            message: mailMessage,
          },
        },
      );
      if (error) throw error;
      if (!data) throw new Error("The mailing service did not return a delivery result.");
      return data;
    },
    onSuccess: (result) => {
      toast.success(
        `Campaign sent to ${result.delivered} recipient${result.delivered === 1 ? "" : "s"}.`,
      );
      setMailSubject("");
      setMailPreview("");
      setMailMessage("");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const moderationMutation = useMutation({
    mutationFn: async ({
      table,
      id,
      published,
    }: {
      table: "activities" | "communities";
      id: string;
      published: boolean;
    }) => {
      const result =
        table === "activities"
          ? await firebaseStore.from("activities").update({ published }).eq("id", id)
          : await firebaseStore.from("communities").update({ published }).eq("id", id);
      if (result.error) throw result.error;
    },
    onSuccess: (_, variables) => {
      toast.success(
        `${variables.table === "activities" ? "Activity" : "Community"} ${variables.published ? "published" : "hidden"}.`,
      );
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    },
    onError: (error: Error) => toast.error(`Could not update content: ${error.message}`),
  });

  const createOpportunity = useMutation({
    mutationFn: async () => {
      const title = opportunityTitle.trim();
      if (!title) throw new Error("Enter an opportunity title.");
      const { error } = await firebaseStore.from("opportunities").insert({
        title,
        organization: opportunityOrganization.trim() || null,
        kind: opportunityKind,
        created_by: user?.uid ?? null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setOpportunityTitle("");
      setOpportunityOrganization("");
      toast.success("Opportunity created as a draft.");
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const createAnnouncement = useMutation({
    mutationFn: async () => {
      const title = announcementTitle.trim();
      const body = announcementBody.trim();
      if (!title || !body) throw new Error("Enter an announcement title and message.");
      const id = crypto.randomUUID();
      await setDoc(documentRef(`announcements/${id}`), {
        id,
        title,
        body,
        audience: "all",
        published: false,
        created_by: user?.uid ?? null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      setAnnouncementTitle("");
      setAnnouncementBody("");
      toast.success("Announcement saved as a draft.");
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  function exportRegistrations() {
    const rows = stats?.registrationsList ?? [];
    if (!rows.length) {
      toast.info("There are no registrations to export.");
      return;
    }
    const escapeCell = (value: unknown) => `"${String(value ?? "").replaceAll('"', '""')}"`;
    const csv = [
      ["Name", "Status", "Registered"],
      ...rows.map((row) => [row.full_name, row.status, row.created_at]),
    ]
      .map((row) => row.map(escapeCell).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `copex-registrations-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success("Registration export downloaded.");
  }

  function handleSendMail(event: React.FormEvent) {
    event.preventDefault();
    if (mailAudience === "event_registrants" && !mailActivityId) {
      toast.error("Choose an event to email its registrants.");
      return;
    }
    sendMail.mutate();
  }

  // Open resource modal for creation
  function handleOpenCreateResource() {
    setEditingResource(null);
    setResTitle("");
    setResDesc("");
    setResContent("");
    setResUrl("");
    setResCategory("technical");
    setResType("guide");
    setResAuthor("COPEX Admin");
    setResAuthorRole("Admin Team");
    setResTags("");
    setResFeatured(false);
    setResourceModalOpen(true);
  }

  // Open resource modal for editing
  function handleOpenEditResource(res: Resource) {
    setEditingResource(res);
    setResTitle(res.title);
    setResDesc(res.description);
    setResContent(res.content ?? "");
    setResUrl(res.url ?? "");
    setResCategory(res.category);
    setResType(res.type);
    setResAuthor(res.author_name);
    setResAuthorRole(res.author_role ?? "");
    setResTags(res.tags.join(", "));
    setResFeatured(res.featured);
    setResourceModalOpen(true);
  }

  // Save Resource (Create or Update)
  function handleSaveResource(e: React.FormEvent) {
    e.preventDefault();
    if (!resTitle.trim() || !resDesc.trim()) {
      toast.error("Please fill in title and description.");
      return;
    }

    const tagsArray = resTags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    if (editingResource) {
      const updated = updateResource(editingResource.id, {
        title: resTitle,
        description: resDesc,
        content: resContent,
        url: resUrl,
        category: resCategory,
        type: resType,
        author_name: resAuthor,
        author_role: resAuthorRole,
        tags: tagsArray,
        featured: resFeatured,
      });
      if (updated) {
        toast.success("Resource updated successfully!");
      }
    } else {
      createResource({
        title: resTitle,
        description: resDesc,
        content: resContent,
        url: resUrl,
        category: resCategory,
        type: resType,
        author_name: resAuthor,
        author_role: resAuthorRole,
        tags: tagsArray,
        featured: resFeatured,
      });
      toast.success("New resource created!");
    }

    setResources(getStoredResources());
    setResourceModalOpen(false);
  }

  // Delete Resource
  function handleDeleteResource(id: string, title: string) {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      deleteResource(id);
      setResources(getStoredResources());
      toast.success("Resource deleted.");
    }
  }

  // Toggle Featured status
  function handleToggleFeatured(res: Resource) {
    updateResource(res.id, { featured: !res.featured });
    setResources(getStoredResources());
    toast.success(`Resource ${!res.featured ? "marked as featured" : "unfeatured"}.`);
  }

  // Toggle user role
  async function handleToggleRole(
    userId: string,
    currentRoles: string[],
    targetRole: "admin" | "organizer",
  ) {
    let nextRoles: string[];
    if (currentRoles.includes(targetRole)) {
      nextRoles = currentRoles.filter((r) => r !== targetRole);
    } else {
      nextRoles = [...currentRoles, targetRole];
    }
    if (nextRoles.length === 0) nextRoles = ["member"];

    try {
      await saveUserProfile(userId, { roles: nextRoles });
      toast.success("User roles updated successfully.");
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    } catch (error) {
      toast.error(
        `Error updating role: ${error instanceof Error ? error.message : "Could not update role"}`,
      );
    }
  }

  async function handleMemberUpdate(userId: string, patch: FirestoreUserProfile) {
    try {
      await saveUserProfile(userId, patch);
      toast.success("Member profile updated.");
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update member.");
    }
  }

  // Handle registration approval/rejection
  async function handleUpdateRegistrationStatus(regId: string, status: "approved" | "rejected") {
    const { error } = await firebaseStore.from("registrations").update({ status }).eq("id", regId);
    if (error) {
      toast.error(`Error: ${error.message}`);
    } else {
      toast.success(`Registration ${status}!`);
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    }
  }

  if (permissionsLoading) {
    return (
      <div className="mx-auto flex max-w-md items-center justify-center px-4 py-20 text-center">
        <Loader2 className="size-8 animate-spin text-primary" aria-label="Checking admin access" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <GlassCard className="p-8">
          <Shield className="mx-auto size-12 text-primary" />
          <h1 className="mt-4 font-display text-xl font-bold">Admin Access Required</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            You need admin privileges to access this control panel.
          </p>
          <Button asChild className="mt-6 rounded-full">
            <Link to="/">Back to Home</Link>
          </Button>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1500px] px-3 py-5 sm:px-6 sm:py-8">
      <div className="mb-5 flex items-center justify-between rounded-2xl border border-glass-border bg-glass px-4 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="hidden rounded-xl sm:inline-flex"
            onClick={() => setSidebarCollapsed((collapsed) => !collapsed)}
            aria-label="Toggle admin navigation"
          >
            <Menu className="size-4" />
          </Button>
          <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Shield className="size-4" />
          </span>
          <div>
            <p className="font-display text-sm font-bold">COPEX Admin</p>
            <p className="text-[11px] text-muted-foreground">Community control center</p>
          </div>
        </div>
        <div className="hidden items-center gap-2 sm:flex">
          <Button variant="ghost" size="icon" className="rounded-full">
            <Bell className="size-4" />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Settings className="size-4" />
          </Button>
          <Pill tone="success" className="text-[10px]">
            Admin session active
          </Pill>
        </div>
      </div>
      <PageHeader
        title="Good morning, Admin"
        description="Here’s what’s happening across the COPEX community today."
      >
        <Button asChild className="mt-4 rounded-full">
          <Link to="/admin/forms">
            <FilePlus className="mr-2 size-4" /> Forms
          </Link>
        </Button>
      </PageHeader>

      <div className="mt-8">
        <CollegeImportCard />
      </div>

      <div className="mt-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="relative mb-5 max-w-2xl">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={globalSearch}
              onChange={(event) => setGlobalSearch(event.target.value)}
              placeholder="Search students, colleges, programs, opportunities…"
              className="h-12 rounded-2xl border-glass-border bg-glass pl-11 pr-4"
            />
            {globalSearch && (
              <div className="absolute left-0 right-0 top-14 z-20 overflow-hidden rounded-2xl border border-glass-border bg-background p-2 shadow-xl">
                {searchResults.length ? (
                  searchResults.map((result) => (
                    <button
                      key={`${result.type}-${result.title}`}
                      type="button"
                      onClick={() => {
                        setActiveTab(result.tab);
                        setGlobalSearch("");
                      }}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left hover:bg-muted"
                    >
                      <span className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
                        <Search className="size-3.5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold">{result.title}</span>
                        <span className="block text-xs text-muted-foreground">
                          {result.type} · {result.meta || "No details"}
                        </span>
                      </span>
                      <ChevronRight className="size-4 text-muted-foreground" />
                    </button>
                  ))
                ) : (
                  <p className="px-3 py-4 text-sm text-muted-foreground">
                    No matches across the admin workspace.
                  </p>
                )}
              </div>
            )}
          </div>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
            <TabsList
              className={`glass-strong flex h-auto shrink-0 gap-1 overflow-x-auto rounded-2xl border border-glass-border p-2 lg:sticky lg:top-24 lg:flex-col lg:overflow-visible ${sidebarCollapsed ? "lg:w-[68px]" : "lg:w-60"}`}
            >
              <p
                className={`hidden px-3 pb-2 pt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground lg:block ${sidebarCollapsed ? "lg:text-center lg:px-0" : ""}`}
              >
                {sidebarCollapsed ? "CPX" : "Workspace"}
              </p>
              <TabsTrigger
                value="overview"
                className={`justify-start rounded-xl px-3 py-2 text-xs font-semibold ${sidebarCollapsed ? "lg:justify-center lg:px-0" : ""}`}
              >
                <LayoutDashboard className="mr-1.5 size-3.5" /> Overview
              </TabsTrigger>
              <TabsTrigger
                value="resources"
                className={`justify-start rounded-xl px-3 py-2 text-xs font-semibold ${sidebarCollapsed ? "lg:justify-center lg:px-0" : ""}`}
              >
                <BookOpen className="mr-1.5 size-3.5" /> Manage Resources ({resources.length})
              </TabsTrigger>
              <TabsTrigger
                value="users"
                className={`justify-start rounded-xl px-3 py-2 text-xs font-semibold ${sidebarCollapsed ? "lg:justify-center lg:px-0" : ""}`}
              >
                <Users className="mr-1.5 size-3.5" /> User Roles ({stats?.profilesCount ?? 0})
              </TabsTrigger>
              <TabsTrigger
                value="members"
                className={`justify-start rounded-xl px-3 py-2 text-xs font-semibold ${sidebarCollapsed ? "lg:justify-center lg:px-0" : ""}`}
              >
                <Sparkles className="mr-1.5 size-3.5" /> Member Portal
              </TabsTrigger>
              <TabsTrigger
                value="registrations"
                className={`justify-start rounded-xl px-3 py-2 text-xs font-semibold ${sidebarCollapsed ? "lg:justify-center lg:px-0" : ""}`}
              >
                <UserCheck className="mr-1.5 size-3.5" /> Registrations ({pendingRegistrationsCount}{" "}
                pending)
              </TabsTrigger>
              <TabsTrigger
                value="mailing"
                className={`justify-start rounded-xl px-3 py-2 text-xs font-semibold ${sidebarCollapsed ? "lg:justify-center lg:px-0" : ""}`}
              >
                <Mail className="mr-1.5 size-3.5" /> Mailing
              </TabsTrigger>
              <TabsTrigger
                value="opportunities"
                className={`justify-start rounded-xl px-3 py-2 text-xs font-semibold ${sidebarCollapsed ? "lg:justify-center lg:px-0" : ""}`}
              >
                <BriefcaseBusiness className="mr-1.5 size-3.5" /> Opportunities
              </TabsTrigger>
              <TabsTrigger
                value="announcements"
                className={`justify-start rounded-xl px-3 py-2 text-xs font-semibold ${sidebarCollapsed ? "lg:justify-center lg:px-0" : ""}`}
              >
                <Megaphone className="mr-1.5 size-3.5" /> Announcements
              </TabsTrigger>
              <TabsTrigger
                value="moderation"
                className={`justify-start rounded-xl px-3 py-2 text-xs font-semibold ${sidebarCollapsed ? "lg:justify-center lg:px-0" : ""}`}
              >
                <Shield className="mr-1.5 size-3.5" /> Content Moderation
              </TabsTrigger>
              <p
                className={`hidden px-3 pb-1 pt-4 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground lg:block ${sidebarCollapsed ? "lg:px-0 lg:text-center" : ""}`}
              >
                {sidebarCollapsed ? "OPS" : "Operations"}
              </p>
              <TabsTrigger
                value="overview"
                className={`justify-start rounded-xl px-3 py-2 text-xs font-semibold ${sidebarCollapsed ? "lg:justify-center lg:px-0" : ""}`}
              >
                <Building2 className="mr-1.5 size-3.5" /> Colleges & reps
              </TabsTrigger>
              <TabsTrigger
                value="overview"
                className={`justify-start rounded-xl px-3 py-2 text-xs font-semibold ${sidebarCollapsed ? "lg:justify-center lg:px-0" : ""}`}
              >
                <Trophy className="mr-1.5 size-3.5" /> Programs
              </TabsTrigger>
              <TabsTrigger
                value="overview"
                className={`justify-start rounded-xl px-3 py-2 text-xs font-semibold ${sidebarCollapsed ? "lg:justify-center lg:px-0" : ""}`}
              >
                <ClipboardList className="mr-1.5 size-3.5" /> Approval center
              </TabsTrigger>
            </TabsList>

            <div className="min-w-0 flex-1">
              {/* TAB 1: OVERVIEW */}
              <TabsContent value="overview" className="mt-6 space-y-6">
                {statsError ? (
                  <ErrorState
                    message="Unable to load admin dashboard data. Please try again."
                    onRetry={() => refetchStats()}
                  />
                ) : statsLoading ? (
                  <RowSkeleton rows={3} />
                ) : (
                  <>
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                      {[
                        { title: "Total students", value: stats?.profilesCount ?? 0, icon: Users },
                        {
                          title: "Colleges",
                          value: stats?.collegesList?.length ?? 0,
                          icon: Building2,
                        },
                        {
                          title: "Active programs",
                          value: stats?.activitiesCount ?? 0,
                          icon: CalendarDays,
                        },
                        {
                          title: "Opportunities",
                          value: stats?.opportunitiesList?.length ?? 0,
                          icon: BriefcaseBusiness,
                        },
                      ].map((metric) => (
                        <GlassCard key={metric.title} className="p-6">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                              {metric.title}
                            </span>
                            <span className="grid size-9 place-items-center rounded-xl bg-primary/15 text-primary">
                              <metric.icon className="size-4" />
                            </span>
                          </div>
                          <dd className="mt-4 font-display text-3xl font-black">{metric.value}</dd>
                        </GlassCard>
                      ))}
                    </div>

                    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                      {[
                        {
                          label: "Pending approvals",
                          value:
                            (stats?.collegesList?.filter((item) => item.status === "pending")
                              .length ?? 0) +
                            (stats?.representativesList?.filter((item) => item.status === "pending")
                              .length ?? 0),
                          detail: "Colleges + representatives",
                          icon: ClipboardList,
                          tab: "overview",
                        },
                        {
                          label: "College representatives",
                          value:
                            stats?.representativesList?.filter((item) => item.status === "approved")
                              .length ?? 0,
                          detail: "Approved and active",
                          icon: UserRoundCog,
                          tab: "users",
                        },
                        {
                          label: "Open reports",
                          value:
                            stats?.reportsList?.filter(
                              (item) => item.status === "open" || item.status === "reviewing",
                            ).length ?? 0,
                          detail: "Needs moderation review",
                          icon: Shield,
                          tab: "moderation",
                        },
                        {
                          label: "Community activity",
                          value: stats?.communitiesCount ?? 0,
                          detail: "Published spaces",
                          icon: Sparkles,
                          tab: "moderation",
                        },
                      ].map((item) => (
                        <button
                          type="button"
                          key={item.label}
                          onClick={() => setActiveTab(item.tab)}
                          className="text-left"
                        >
                          <GlassCard className="p-5 transition hover:-translate-y-0.5 hover:border-primary/40">
                            <div className="flex items-center justify-between">
                              <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                                <item.icon className="size-5" />
                              </span>
                              <ChevronRight className="size-4 text-muted-foreground" />
                            </div>
                            <p className="mt-5 text-sm text-muted-foreground">{item.label}</p>
                            <p className="mt-1 font-display text-3xl font-black">{item.value}</p>
                            <p className="mt-1 text-xs text-muted-foreground">{item.detail}</p>
                          </GlassCard>
                        </button>
                      ))}
                    </div>

                    <div className="grid gap-5 lg:grid-cols-[1.35fr_1fr]">
                      <GlassCard className="p-5 sm:p-6">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                              Analytics
                            </p>
                            <h3 className="mt-1 font-display text-lg font-bold">
                              Registration growth
                            </h3>
                          </div>
                          <Pill tone="primary" className="text-[10px]">
                            Last 7 days
                          </Pill>
                        </div>
                        <div className="mt-5 h-56 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={registrationTrend}>
                              <defs>
                                <linearGradient id="registrationFill" x1="0" y1="0" x2="0" y2="1">
                                  <stop
                                    offset="0%"
                                    stopColor="hsl(var(--primary))"
                                    stopOpacity={0.35}
                                  />
                                  <stop
                                    offset="100%"
                                    stopColor="hsl(var(--primary))"
                                    stopOpacity={0.02}
                                  />
                                </linearGradient>
                              </defs>
                              <CartesianGrid
                                vertical={false}
                                stroke="hsl(var(--border))"
                                strokeDasharray="4 4"
                              />
                              <XAxis
                                dataKey="day"
                                axisLine={false}
                                tickLine={false}
                                fontSize={11}
                              />
                              <YAxis
                                allowDecimals={false}
                                axisLine={false}
                                tickLine={false}
                                fontSize={11}
                                width={24}
                              />
                              <Tooltip
                                contentStyle={{
                                  borderRadius: 12,
                                  border: "1px solid hsl(var(--border))",
                                  background: "hsl(var(--card))",
                                }}
                              />
                              <Area
                                type="monotone"
                                dataKey="registrations"
                                stroke="hsl(var(--primary))"
                                fill="url(#registrationFill)"
                                strokeWidth={3}
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </GlassCard>
                      <GlassCard className="p-5 sm:p-6">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Program mix
                        </p>
                        <h3 className="mt-1 font-display text-lg font-bold">Activities by type</h3>
                        <div className="mt-5 h-56 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={activityBreakdown}
                              layout="vertical"
                              margin={{ left: 0, right: 8 }}
                            >
                              <CartesianGrid
                                horizontal={false}
                                stroke="hsl(var(--border))"
                                strokeDasharray="4 4"
                              />
                              <XAxis type="number" allowDecimals={false} hide />
                              <YAxis
                                dataKey="kind"
                                type="category"
                                axisLine={false}
                                tickLine={false}
                                fontSize={11}
                                width={78}
                              />
                              <Tooltip
                                cursor={{ fill: "hsl(var(--muted) / .3)" }}
                                contentStyle={{
                                  borderRadius: 12,
                                  border: "1px solid hsl(var(--border))",
                                  background: "hsl(var(--card))",
                                }}
                              />
                              <Bar
                                dataKey="total"
                                fill="hsl(var(--primary))"
                                radius={[0, 8, 8, 0]}
                                barSize={18}
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </GlassCard>
                    </div>

                    <div className="grid gap-5 md:grid-cols-3">
                      <GlassCard className="p-5">
                        <div className="flex items-center gap-3">
                          <span className="grid size-10 place-items-center rounded-xl bg-primary/15 text-primary">
                            <BarChart3 className="size-5" />
                          </span>
                          <div>
                            <p className="text-xs text-muted-foreground">Upcoming activities</p>
                            <p className="font-display text-2xl font-black">
                              {stats?.activitiesList.filter(
                                (activity) => new Date(activity.starts_at) >= new Date(),
                              ).length ?? 0}
                            </p>
                          </div>
                        </div>
                      </GlassCard>
                      <GlassCard className="p-5">
                        <div className="flex items-center gap-3">
                          <span className="grid size-10 place-items-center rounded-xl bg-warning/15 text-warning">
                            <UserCheck className="size-5" />
                          </span>
                          <div>
                            <p className="text-xs text-muted-foreground">Pending approvals</p>
                            <p className="font-display text-2xl font-black">
                              {pendingRegistrationsCount}
                            </p>
                          </div>
                        </div>
                      </GlassCard>
                      <GlassCard className="p-5">
                        <div className="flex items-center gap-3">
                          <span className="grid size-10 place-items-center rounded-xl bg-success/15 text-success">
                            <DatabaseIcon className="size-5" />
                          </span>
                          <div>
                            <p className="text-xs text-muted-foreground">System health</p>
                            <p className="font-display text-2xl font-black text-success">
                              Operational
                            </p>
                          </div>
                        </div>
                      </GlassCard>
                    </div>

                    {/* Quick actions panel */}
                    <GlassCard className="p-6">
                      <h3 className="font-display text-lg font-bold">
                        Quick Administrative Actions
                      </h3>
                      <div className="mt-4 flex flex-wrap gap-3">
                        <Button asChild className="rounded-full">
                          <Link to="/organizer">
                            <CalendarDays className="mr-1.5 size-4" /> Create Event
                          </Link>
                        </Button>
                        <Button onClick={handleOpenCreateResource} className="rounded-full">
                          <Plus className="mr-1.5 size-4" /> Publish New Resource
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={() => setActiveTab("users")}
                          className="rounded-full"
                        >
                          <Users className="mr-1.5 size-4" /> Manage Permissions
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setActiveTab("registrations")}
                          className="rounded-full"
                        >
                          <UserCheck className="mr-1.5 size-4" /> Review Registrations
                        </Button>
                      </div>
                    </GlassCard>
                  </>
                )}
              </TabsContent>

              {/* TAB 2: RESOURCES MANAGER */}
              <TabsContent value="resources" className="mt-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-display text-xl font-bold">Platform Learning Resources</h3>
                    <p className="text-xs text-muted-foreground">
                      Create, update, and manage guides, cheat sheets, and hackathon templates.
                    </p>
                  </div>
                  <Button onClick={handleOpenCreateResource} className="rounded-full">
                    <Plus className="mr-1.5 size-4" /> Create Resource
                  </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {resources.map((res) => (
                    <GlassCard key={res.id} className="flex flex-col justify-between p-5">
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <Pill tone={res.featured ? "primary" : "muted"} className="text-[10px]">
                            {res.category}
                          </Pill>
                          <span className="text-[10px] font-semibold uppercase text-muted-foreground">
                            {res.type}
                          </span>
                        </div>
                        <h4 className="mt-3 font-display text-base font-bold">{res.title}</h4>
                        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                          {res.description}
                        </p>
                        <div className="mt-3 text-[11px] text-muted-foreground">
                          By {res.author_name}
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between border-t border-glass-border/60 pt-3">
                        <Button
                          variant={res.featured ? "default" : "ghost"}
                          size="sm"
                          className="rounded-full text-[11px] h-7 px-2.5"
                          onClick={() => handleToggleFeatured(res)}
                        >
                          {res.featured ? "Featured" : "Make Featured"}
                        </Button>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7 rounded-full"
                            onClick={() => handleOpenEditResource(res)}
                          >
                            <Pencil className="size-3.5 text-muted-foreground" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-7 rounded-full text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeleteResource(res.id, res.title)}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </div>
                    </GlassCard>
                  ))}
                </div>
              </TabsContent>

              {/* TAB 3: USER ROLES */}
              <TabsContent value="users" className="mt-6 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="font-display text-xl font-bold">User Access & Roles</h3>
                  <div className="relative w-full max-w-xs">
                    <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search user name or email..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="pl-9 rounded-full border-glass-border bg-glass-strong text-xs"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs text-muted-foreground">
                    Review and process participant applications.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={exportRegistrations}
                    className="rounded-full"
                  >
                    <Download className="mr-1.5 size-3.5" /> Export CSV
                  </Button>
                </div>
                <GlassCard className="overflow-x-auto p-0">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-glass-border bg-glass-strong text-muted-foreground">
                      <tr>
                        <th className="px-4 py-3 font-semibold">User</th>
                        <th className="px-4 py-3 font-semibold">Current Roles</th>
                        <th className="px-4 py-3 font-semibold text-right">Role Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-glass-border">
                      {stats?.profilesList
                        .filter(
                          (p) =>
                            !userSearch ||
                            p.full_name?.toLowerCase().includes(userSearch.toLowerCase()) ||
                            p.email?.toLowerCase().includes(userSearch.toLowerCase()),
                        )
                        .map((p) => {
                          const roles = (p.roles as string[]) ?? ["member"];
                          const isUserAdmin = roles.includes("admin");
                          const isUserOrg = roles.includes("organizer");

                          return (
                            <tr key={p.id} className="hover:bg-glass/50">
                              <td className="px-4 py-3">
                                <div className="font-semibold">
                                  {p.full_name ?? "Anonymous User"}
                                </div>
                                <div className="text-[11px] text-muted-foreground">{p.email}</div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex flex-wrap gap-1">
                                  {roles.map((r) => (
                                    <Pill
                                      key={r}
                                      tone={
                                        r === "admin"
                                          ? "danger"
                                          : r === "organizer"
                                            ? "primary"
                                            : "muted"
                                      }
                                      className="text-[10px] capitalize"
                                    >
                                      {r}
                                    </Pill>
                                  ))}
                                </div>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <Button
                                    size="sm"
                                    variant={isUserOrg ? "secondary" : "outline"}
                                    className="rounded-full text-[10px] h-7 px-2.5"
                                    onClick={() => handleToggleRole(p.id, roles, "organizer")}
                                  >
                                    {isUserOrg ? "Revoke Organizer" : "Make Organizer"}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant={isUserAdmin ? "destructive" : "default"}
                                    className="rounded-full text-[10px] h-7 px-2.5"
                                    onClick={() => handleToggleRole(p.id, roles, "admin")}
                                  >
                                    {isUserAdmin ? "Revoke Admin" : "Make Admin"}
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </GlassCard>
              </TabsContent>

              {/* MEMBER PORTAL */}
              <TabsContent value="members" className="mt-6 space-y-4">
                <div>
                  <h3 className="font-display text-xl font-bold">Member Portal Management</h3>
                  <p className="text-xs text-muted-foreground">
                    Approve access, enable referrals, and manage member rewards.
                  </p>
                </div>
                <GlassCard className="overflow-x-auto p-0">
                  <table className="w-full min-w-[1400px] text-left text-xs">
                    <thead className="border-b border-glass-border bg-glass-strong text-muted-foreground">
                      <tr>
                        <th className="px-4 py-3">Member</th>
                        <th className="px-4 py-3">Contact</th>
                        <th className="px-4 py-3">Study details</th>
                        <th className="px-4 py-3">Interests</th>
                        <th className="px-4 py-3">Referral details</th>
                        <th className="px-4 py-3">Points</th>
                        <th className="px-4 py-3">Credits</th>
                        <th className="px-4 py-3">Referrals</th>
                        <th className="px-4 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-glass-border">
                      {stats?.profilesList
                        .filter((raw) => {
                          const member = raw as FirestoreUserProfile & { id: string };
                          const term = userSearch.toLowerCase();
                          return (
                            !term ||
                            `${member.full_name ?? ""} ${member.email ?? ""}`
                              .toLowerCase()
                              .includes(term)
                          );
                        })
                        .map((raw) => {
                          const member = raw as FirestoreUserProfile & { id: string };
                          return (
                            <tr key={member.id}>
                              <td className="px-4 py-3">
                                <p className="font-semibold">
                                  {member.full_name ?? "Unnamed member"}
                                </p>
                              </td>
                              <td className="px-4 py-3">
                                <p>{member.email ?? "Email missing"}</p>
                                <p className="mt-1 text-muted-foreground">
                                  {member.phone ?? "Phone missing"}
                                </p>
                              </td>
                              <td className="px-4 py-3">
                                <Pill
                                  tone={member.status === "ACTIVE" ? "success" : "warning"}
                                  className="text-[10px]"
                                >
                                  {member.status ?? "INCOMPLETE"}
                                </Pill>
                                <p className="mt-1">{member.institution ?? "College missing"}</p>
                                <p className="mt-1 text-muted-foreground">
                                  {member.branch ?? ""}
                                  {member.branch && member.year ? " · " : ""}
                                  {member.year ?? "Year missing"}
                                </p>
                              </td>
                              <td className="max-w-[230px] px-4 py-3 text-muted-foreground">
                                {member.profile_interests?.length
                                  ? member.profile_interests.join(", ")
                                  : "Interests missing"}
                              </td>
                              <td className="px-4 py-3">
                                <p>Invited: {member.referred_by ?? "Direct join"}</p>
                                <p className="mt-1 text-muted-foreground">
                                  Code: {member.referral_code ?? "Not set"}
                                </p>
                                <p className="mt-1 font-semibold">
                                  Successful: {member.referrals ?? 0}
                                </p>
                              </td>
                              <td className="px-4 py-3 font-semibold">{member.points ?? 0}</td>
                              <td className="px-4 py-3 font-semibold">{member.credits ?? 0}</td>
                              <td className="px-4 py-3">{member.referrals ?? 0}</td>
                              <td className="px-4 py-3">
                                <div className="flex flex-wrap gap-1.5">
                                  <Button
                                    size="sm"
                                    variant={member.referral_access ? "secondary" : "outline"}
                                    className="h-7 rounded-full px-2.5 text-[10px]"
                                    onClick={() =>
                                      handleMemberUpdate(member.id, {
                                        referral_access: !member.referral_access,
                                      })
                                    }
                                  >
                                    {member.referral_access
                                      ? "Disable referrals"
                                      : "Enable referrals"}
                                  </Button>
                                  <Button
                                    size="sm"
                                    className="h-7 rounded-full px-2.5 text-[10px]"
                                    onClick={() =>
                                      handleMemberUpdate(member.id, {
                                        status: member.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE",
                                      })
                                    }
                                  >
                                    {member.status === "ACTIVE" ? "Suspend" : "Activate"}
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                  {!stats?.profilesList.length && (
                    <p className="p-8 text-center text-sm text-muted-foreground">
                      No member profiles found.
                    </p>
                  )}
                </GlassCard>
              </TabsContent>

              {/* TAB 4: REGISTRATIONS */}
              <TabsContent value="registrations" className="mt-6 space-y-4">
                <h3 className="font-display text-xl font-bold">Event Registrations</h3>
                <GlassCard className="overflow-x-auto p-0">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-glass-border bg-glass-strong text-muted-foreground">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Participant</th>
                        <th className="px-4 py-3 font-semibold">Status</th>
                        <th className="px-4 py-3 font-semibold">Registered Date</th>
                        <th className="px-4 py-3 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-glass-border">
                      {stats?.registrationsList.map((reg) => (
                        <tr key={reg.id} className="hover:bg-glass/50">
                          <td className="px-4 py-3 font-semibold">
                            {reg.full_name ?? "Participant"}
                          </td>
                          <td className="px-4 py-3">
                            <Pill
                              tone={
                                reg.status === "approved"
                                  ? "success"
                                  : reg.status === "pending"
                                    ? "warning"
                                    : "danger"
                              }
                              className="text-[10px] capitalize"
                            >
                              {reg.status}
                            </Pill>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {new Date(reg.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {reg.status === "pending" ? (
                              <div className="flex items-center justify-end gap-1.5">
                                <Button
                                  size="sm"
                                  className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-[10px] h-7 px-2.5"
                                  onClick={() => handleUpdateRegistrationStatus(reg.id, "approved")}
                                >
                                  <CheckCircle2 className="mr-1 size-3" /> Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  className="rounded-full text-[10px] h-7 px-2.5"
                                  onClick={() => handleUpdateRegistrationStatus(reg.id, "rejected")}
                                >
                                  <XCircle className="mr-1 size-3" /> Reject
                                </Button>
                              </div>
                            ) : (
                              <span className="text-[11px] text-muted-foreground">Processed</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </GlassCard>
              </TabsContent>

              {/* TAB: MAILING */}
              <TabsContent value="mailing" className="mt-6">
                <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                  <GlassCard className="p-6">
                    <div className="flex items-start gap-3">
                      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
                        <Mail className="size-5" />
                      </span>
                      <div>
                        <h3 className="font-display text-xl font-bold">Send a community update</h3>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Campaigns are sent by your Supabase Edge Function. Your API key stays in
                          Supabase secrets.
                        </p>
                      </div>
                    </div>

                    <form onSubmit={handleSendMail} className="mt-6 space-y-4">
                      <div>
                        <Label className="text-xs">Audience</Label>
                        <select
                          value={mailAudience}
                          onChange={(e) =>
                            setMailAudience(e.target.value as "all_members" | "event_registrants")
                          }
                          className="mt-1 w-full rounded-xl border border-glass-border bg-glass px-3 py-2 text-sm"
                        >
                          <option value="all_members">All community members</option>
                          <option value="event_registrants">
                            Approved and pending event registrants
                          </option>
                        </select>
                      </div>
                      {mailAudience === "event_registrants" && (
                        <div>
                          <Label className="text-xs">Event</Label>
                          <select
                            value={mailActivityId}
                            onChange={(e) => setMailActivityId(e.target.value)}
                            className="mt-1 w-full rounded-xl border border-glass-border bg-glass px-3 py-2 text-sm"
                          >
                            <option value="">Select an event</option>
                            {stats?.activitiesList.map((activity) => (
                              <option key={activity.id} value={activity.id}>
                                {activity.title}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                      <div>
                        <Label className="text-xs">Subject</Label>
                        <Input
                          required
                          maxLength={180}
                          value={mailSubject}
                          onChange={(e) => setMailSubject(e.target.value)}
                          placeholder="What's new at COPEX?"
                          className="mt-1 rounded-xl border-glass-border bg-glass"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">
                          Preview text <span className="text-muted-foreground">(optional)</span>
                        </Label>
                        <Input
                          maxLength={250}
                          value={mailPreview}
                          onChange={(e) => setMailPreview(e.target.value)}
                          placeholder="A short line shown beside the subject"
                          className="mt-1 rounded-xl border-glass-border bg-glass"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Message</Label>
                        <textarea
                          required
                          rows={9}
                          maxLength={20000}
                          value={mailMessage}
                          onChange={(e) => setMailMessage(e.target.value)}
                          placeholder="Write your update here. Line breaks will be preserved in the email."
                          className="mt-1 w-full rounded-xl border border-glass-border bg-glass p-3 text-sm"
                        />
                      </div>
                      <Button type="submit" disabled={sendMail.isPending} className="rounded-full">
                        {sendMail.isPending ? (
                          <Loader2 className="mr-1.5 size-4 animate-spin" />
                        ) : (
                          <Send className="mr-1.5 size-4" />
                        )}
                        {sendMail.isPending ? "Sending…" : "Send campaign"}
                      </Button>
                    </form>
                  </GlassCard>

                  <GlassCard className="h-fit p-6">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Delivery details
                    </span>
                    <div className="mt-4 space-y-4 text-sm">
                      <div>
                        <p className="font-semibold">Audience</p>
                        <p className="text-muted-foreground">
                          {mailAudience === "all_members"
                            ? `${stats?.profilesCount ?? 0} member profiles`
                            : "Registrants for the selected event"}
                        </p>
                      </div>
                      <div>
                        <p className="font-semibold">Sender</p>
                        <p className="text-muted-foreground">
                          Configured from the <code>RESEND_FROM_EMAIL</code> Edge Function secret.
                        </p>
                      </div>
                      <div>
                        <p className="font-semibold">Before sending</p>
                        <p className="text-muted-foreground">
                          Deploy <code>send-campaign</code>, then configure{" "}
                          <code>FIREBASE_MAILER_URL</code> and <code>FIREBASE_MAILER_TOKEN</code> as
                          Supabase Edge Function secrets.
                        </p>
                      </div>
                    </div>
                  </GlassCard>
                </div>
              </TabsContent>

              <TabsContent value="opportunities" className="mt-6 space-y-6">
                <div>
                  <h3 className="font-display text-xl font-bold">Opportunities</h3>
                  <p className="text-xs text-muted-foreground">
                    Create internships, scholarships, competitions, and jobs for the community.
                  </p>
                </div>
                <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
                  <GlassCard className="p-6">
                    <h4 className="font-display font-bold">Add opportunity</h4>
                    <form
                      className="mt-4 space-y-3"
                      onSubmit={(event) => {
                        event.preventDefault();
                        createOpportunity.mutate();
                      }}
                    >
                      <Input
                        required
                        value={opportunityTitle}
                        onChange={(event) => setOpportunityTitle(event.target.value)}
                        placeholder="Opportunity title"
                      />
                      <Input
                        value={opportunityOrganization}
                        onChange={(event) => setOpportunityOrganization(event.target.value)}
                        placeholder="Organization"
                      />
                      <select
                        value={opportunityKind}
                        onChange={(event) => setOpportunityKind(event.target.value)}
                        className="w-full rounded-xl border border-glass-border bg-glass px-3 py-2 text-sm"
                      >
                        <option value="internship">Internship</option>
                        <option value="job">Job</option>
                        <option value="scholarship">Scholarship</option>
                        <option value="competition">Competition</option>
                        <option value="fellowship">Fellowship</option>
                        <option value="research">Research</option>
                      </select>
                      <Button
                        disabled={createOpportunity.isPending}
                        className="w-full rounded-full"
                      >
                        <Plus className="mr-1.5 size-4" /> Create draft
                      </Button>
                    </form>
                  </GlassCard>
                  <GlassCard className="overflow-x-auto p-0">
                    <table className="w-full text-left text-xs">
                      <thead className="border-b border-glass-border bg-glass-strong">
                        <tr>
                          <th className="px-4 py-3">Opportunity</th>
                          <th className="px-4 py-3">Type</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3">Created</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-glass-border">
                        {stats?.opportunitiesList.map((item) => (
                          <tr key={item.id}>
                            <td className="px-4 py-3">
                              <p className="font-semibold">{item.title}</p>
                              <p className="text-muted-foreground">
                                {item.organization ?? "Independent"}
                              </p>
                            </td>
                            <td className="px-4 py-3 capitalize">{item.kind}</td>
                            <td className="px-4 py-3">
                              <Pill
                                tone={item.published ? "success" : "muted"}
                                className="text-[10px]"
                              >
                                {item.published ? "Published" : "Draft"}
                              </Pill>
                            </td>
                            <td className="px-4 py-3 text-muted-foreground">
                              {new Date(item.created_at).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {!stats?.opportunitiesList.length && (
                      <p className="p-8 text-center text-sm text-muted-foreground">
                        No opportunities yet.
                      </p>
                    )}
                  </GlassCard>
                </div>
              </TabsContent>

              <TabsContent value="announcements" className="mt-6 space-y-6">
                <div>
                  <h3 className="font-display text-xl font-bold">Announcements</h3>
                  <p className="text-xs text-muted-foreground">
                    Draft important updates before publishing them to the community.
                  </p>
                </div>
                <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
                  <GlassCard className="p-6">
                    <h4 className="font-display font-bold">Create announcement</h4>
                    <form
                      className="mt-4 space-y-3"
                      onSubmit={(event) => {
                        event.preventDefault();
                        createAnnouncement.mutate();
                      }}
                    >
                      <Input
                        required
                        value={announcementTitle}
                        onChange={(event) => setAnnouncementTitle(event.target.value)}
                        placeholder="Announcement title"
                      />
                      <textarea
                        required
                        rows={5}
                        value={announcementBody}
                        onChange={(event) => setAnnouncementBody(event.target.value)}
                        placeholder="Write your announcement..."
                        className="w-full rounded-xl border border-glass-border bg-glass p-3 text-sm"
                      />
                      <Button
                        disabled={createAnnouncement.isPending}
                        className="w-full rounded-full"
                      >
                        <Megaphone className="mr-1.5 size-4" /> Save draft
                      </Button>
                    </form>
                  </GlassCard>
                  <div className="space-y-3">
                    {stats?.announcementsList.map((item) => (
                      <GlassCard key={item.id} className="p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h4 className="font-display font-bold">{item.title}</h4>
                            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                              {item.body}
                            </p>
                          </div>
                          <Pill tone={item.published ? "success" : "muted"} className="text-[10px]">
                            {item.published ? "Published" : "Draft"}
                          </Pill>
                        </div>
                      </GlassCard>
                    ))}
                    {!stats?.announcementsList.length && (
                      <GlassCard className="p-8 text-center text-sm text-muted-foreground">
                        No announcements yet.
                      </GlassCard>
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* TAB 5: MODERATION */}
              <TabsContent value="moderation" className="mt-6 space-y-4">
                <h3 className="font-display text-xl font-bold">
                  Community & Event Content Moderation
                </h3>
                <div className="grid gap-6 md:grid-cols-2">
                  <GlassCard className="p-6">
                    <h4 className="font-display text-base font-bold">Published Events</h4>
                    <div className="mt-4 space-y-2">
                      {stats?.activitiesList.map((act) => (
                        <div
                          key={act.id}
                          className="flex items-center justify-between rounded-xl bg-glass p-3 text-xs"
                        >
                          <span className="min-w-0 truncate pr-2 font-semibold">{act.title}</span>
                          <div className="flex shrink-0 items-center gap-2">
                            <Pill
                              tone={act.published ? "success" : "muted"}
                              className="text-[10px]"
                            >
                              {act.published ? "Published" : "Hidden"}
                            </Pill>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 rounded-full px-2 text-[10px]"
                              disabled={moderationMutation.isPending}
                              onClick={() =>
                                moderationMutation.mutate({
                                  table: "activities",
                                  id: act.id,
                                  published: !act.published,
                                })
                              }
                            >
                              {act.published ? "Hide" : "Publish"}
                            </Button>
                          </div>
                        </div>
                      ))}
                      {!stats?.activitiesList.length && (
                        <p className="rounded-xl bg-glass p-4 text-xs text-muted-foreground">
                          No activities found.
                        </p>
                      )}
                    </div>
                  </GlassCard>

                  <GlassCard className="p-6">
                    <h4 className="font-display text-base font-bold">Active Communities</h4>
                    <div className="mt-4 space-y-2">
                      {stats?.communitiesList.map((com) => (
                        <div
                          key={com.id}
                          className="flex items-center justify-between rounded-xl bg-glass p-3 text-xs"
                        >
                          <span className="min-w-0 truncate pr-2 font-semibold">{com.name}</span>
                          <div className="flex shrink-0 items-center gap-2">
                            <Pill
                              tone={com.published ? "success" : "muted"}
                              className="text-[10px]"
                            >
                              {com.published ? "Published" : "Hidden"}
                            </Pill>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 rounded-full px-2 text-[10px]"
                              disabled={moderationMutation.isPending}
                              onClick={() =>
                                moderationMutation.mutate({
                                  table: "communities",
                                  id: com.id,
                                  published: !com.published,
                                })
                              }
                            >
                              {com.published ? "Hide" : "Publish"}
                            </Button>
                          </div>
                        </div>
                      ))}
                      {!stats?.communitiesList.length && (
                        <p className="rounded-xl bg-glass p-4 text-xs text-muted-foreground">
                          No communities found.
                        </p>
                      )}
                    </div>
                  </GlassCard>
                </div>
              </TabsContent>
            </div>
          </div>
        </Tabs>
      </div>

      {/* CREATE / EDIT RESOURCE DIALOG */}
      <Dialog open={resourceModalOpen} onOpenChange={setResourceModalOpen}>
        <DialogContent className="glass-strong border-glass-border max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-bold">
              {editingResource ? "Edit Resource" : "Publish New Resource"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveResource} className="mt-4 space-y-4 text-xs">
            <div>
              <Label className="text-xs">Resource Title</Label>
              <Input
                required
                placeholder="e.g. Full-Stack Development Roadmap 2026"
                value={resTitle}
                onChange={(e) => setResTitle(e.target.value)}
                className="mt-1 rounded-xl border-glass-border bg-glass"
              />
            </div>

            <div>
              <Label className="text-xs">Short Description</Label>
              <Input
                required
                placeholder="Brief summary of what users will learn or find in this resource..."
                value={resDesc}
                onChange={(e) => setResDesc(e.target.value)}
                className="mt-1 rounded-xl border-glass-border bg-glass"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label className="text-xs">Category</Label>
                <select
                  value={resCategory}
                  onChange={(e) => setResCategory(e.target.value as ResourceCategory)}
                  className="mt-1 w-full rounded-xl border border-glass-border bg-glass px-3 py-2 text-xs"
                >
                  <option value="technical">Technical</option>
                  <option value="hackathon">Hackathon</option>
                  <option value="design">Design & UI</option>
                  <option value="career">Career & Resume</option>
                  <option value="community">Community</option>
                  <option value="general">General</option>
                </select>
              </div>

              <div>
                <Label className="text-xs">Type</Label>
                <select
                  value={resType}
                  onChange={(e) => setResType(e.target.value as ResourceType)}
                  className="mt-1 w-full rounded-xl border border-glass-border bg-glass px-3 py-2 text-xs"
                >
                  <option value="guide">Guide</option>
                  <option value="ebook">eBook</option>
                  <option value="template">Template</option>
                  <option value="document">Document</option>
                  <option value="code">Code Repository</option>
                  <option value="video">Video Masterclass</option>
                  <option value="link">External Link</option>
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label className="text-xs">Author Name</Label>
                <Input
                  value={resAuthor}
                  onChange={(e) => setResAuthor(e.target.value)}
                  className="mt-1 rounded-xl border-glass-border bg-glass"
                />
              </div>
              <div>
                <Label className="text-xs">Author Role / Badge</Label>
                <Input
                  value={resAuthorRole}
                  onChange={(e) => setResAuthorRole(e.target.value)}
                  className="mt-1 rounded-xl border-glass-border bg-glass"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs">External Resource URL (Optional)</Label>
              <Input
                placeholder="https://github.com/or-figma-link..."
                value={resUrl}
                onChange={(e) => setResUrl(e.target.value)}
                className="mt-1 rounded-xl border-glass-border bg-glass"
              />
            </div>

            <div>
              <Label className="text-xs">Tags (comma separated)</Label>
              <Input
                placeholder="React, Supabase, FullStack"
                value={resTags}
                onChange={(e) => setResTags(e.target.value)}
                className="mt-1 rounded-xl border-glass-border bg-glass"
              />
            </div>

            <div>
              <Label className="text-xs">
                Detailed Guide / Documentation Content (Markdown Supported)
              </Label>
              <textarea
                rows={5}
                placeholder="Write detailed notes, guide sections, or installation steps here..."
                value={resContent}
                onChange={(e) => setResContent(e.target.value)}
                className="mt-1 w-full rounded-xl border border-glass-border bg-glass p-3 text-xs font-mono"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="resFeatured"
                checked={resFeatured}
                onChange={(e) => setResFeatured(e.target.checked)}
                className="rounded border-glass-border"
              />
              <Label htmlFor="resFeatured" className="text-xs cursor-pointer">
                Mark as Featured Kit on Resources Homepage
              </Label>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setResourceModalOpen(false)}
                className="rounded-full"
              >
                Cancel
              </Button>
              <Button type="submit" className="rounded-full">
                {editingResource ? "Save Changes" : "Publish Resource"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
