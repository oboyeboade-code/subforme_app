import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import useSWR from "swr";
import {
  Rule,
  MaisonEyebrow,
  MaisonInput,
  MaisonButton,
  UnderlineTabs,
  StatusBadge,
} from "@/components/admin/AdminMaison";
import { MissionMasthead, StatStrip, BentoCell, PulseDot } from "@/components/admin/AdminMaisonPlus";
import { AdminEmptyState } from "@/components/admin/AdminStates";
import { adminApi, type IContactMessage } from "@/lib/api/";
import {
  Search,
  Mail,
  Loader2,
  Archive,
  CheckCheck,
  Inbox,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────────────────────
 * AdminContactMessages — split-pane inbox.
 * Left: filterable list. Right: focused preview with quick actions.
 * Replaces the previous modal-driven flow with a native inbox UX.
 * ───────────────────────────────────────────────────────────── */

export type ContactStatus = "unread" | "read" | "archived";

export interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  status: ContactStatus;
  createdAt: string;
}

const uiStatus = (s: IContactMessage["status"]): ContactStatus => (s === "resolved" ? "read" : "unread");

const adapt = (m: IContactMessage & { _id?: string }): ContactMessage => ({
  _id: (m as any)._id ?? "",
  name: m.name,
  email: m.email,
  subject: m.subject,
  message: m.message,
  status: uiStatus(m.status),
  createdAt: m.createdAt,
});

const TABS = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "read", label: "Read" },
  { key: "archived", label: "Archived" },
] as const;
type TabKey = (typeof TABS)[number]["key"];

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

const CONTACT_KEY = "/admin/contact-messages";
const fetcher = () =>
  adminApi.getContactMessages().then((r) => (r.data ?? []).map(adapt));

const AdminContactMessages = () => {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: messages = [], error, isLoading, mutate } =
    useSWR<ContactMessage[]>(CONTACT_KEY, fetcher);

  const filtered = useMemo(() => {
    let r = messages;
    if (activeTab !== "all") r = r.filter((m) => m.status === activeTab);
    const q = search.trim().toLowerCase();
    if (q) {
      r = r.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.email.toLowerCase().includes(q) ||
          m.subject?.toLowerCase().includes(q) ||
          m.message.toLowerCase().includes(q),
      );
    }
    return [...r].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  }, [messages, search, activeTab]);

  // Default-select first row on load.
  useEffect(() => {
    if (!selectedId && filtered.length) setSelectedId(filtered[0]._id);
    if (selectedId && !filtered.find((m) => m._id === selectedId)) {
      setSelectedId(filtered[0]?._id ?? null);
    }
  }, [filtered, selectedId]);

  const selected = useMemo(
    () => messages.find((m) => m._id === selectedId) ?? null,
    [messages, selectedId],
  );

  const tabs = [
    { key: "all" as const, label: "All", count: messages.length },
    {
      key: "unread" as const,
      label: "Unread",
      count: messages.filter((m) => m.status === "unread").length,
    },
    {
      key: "read" as const,
      label: "Read",
      count: messages.filter((m) => m.status === "read").length,
    },
    {
      key: "archived" as const,
      label: "Archived",
      count: messages.filter((m) => m.status === "archived").length,
    },
  ];

  const stats = useMemo(() => {
    const unread = messages.filter((m) => m.status === "unread").length;
    return [
      { label: "Inbox", value: messages.length.toLocaleString(), hint: "All messages" },
      { label: "Unread", value: unread.toLocaleString(), hint: "Needs attention", tone: unread ? ("amber" as const) : undefined },
      { label: "Resolved", value: messages.filter((m) => m.status === "read").length.toLocaleString(), hint: "Read / replied", tone: "green" as const },
      { label: "Archived", value: messages.filter((m) => m.status === "archived").length.toLocaleString(), hint: "Hidden" },
    ];
  }, [messages]);

  return (
    <div className="space-y-8">
      <MissionMasthead
        index="VI"
        section="Support"
        title="Messages"
        description="Customer contact form submissions — triage, reply, and resolve from one pane."
        actions={
          <div className="hidden md:flex items-center gap-2">
            <PulseDot tone={stats[1].value === "0" ? "green" : "amber"} />
            <MaisonEyebrow>
              {stats[1].value === "0" ? "Inbox zero" : `${stats[1].value} unread`}
            </MaisonEyebrow>
          </div>
        }
      />

      <StatStrip items={stats} />

      <div className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-center">
          <MaisonInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search subject, sender, body…"
            icon={<Search className="h-4 w-4" />}
          />
        </div>

        <UnderlineTabs
          layoutId="messages-tabs"
          tabs={tabs}
          value={activeTab}
          onChange={(v) => setActiveTab(v)}
        />
      </div>

      {/* Split pane */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] gap-5 min-h-[60vh]">
        {/* List */}
        <BentoCell className="p-0 overflow-hidden">
          {isLoading && (
            <div className="p-10 flex items-center justify-center text-ink/50">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          )}
          {!isLoading && error && (
            <div className="p-6">
              <AdminEmptyState index="00" title="Unable to load messages" />
            </div>
          )}
          {!isLoading && !error && filtered.length === 0 && (
            <div className="p-6">
              <AdminEmptyState
                index="—"
                title="Inbox quiet"
                hint={search ? "Adjust your filters." : "No messages match this view."}
              />
            </div>
          )}
          {!isLoading && !error && filtered.length > 0 && (
            <ul className="divide-y divide-ink/8 max-h-[70vh] overflow-y-auto">
              {filtered.map((m) => {
                const isActive = m._id === selectedId;
                const isUnread = m.status === "unread";
                return (
                  <li key={m._id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(m._id)}
                      className={cn(
                        "w-full text-left flex items-start gap-3 px-5 py-4 transition-colors",
                        isActive ? "bg-ink/[0.04]" : "hover:bg-ink/[0.02]",
                      )}
                    >
                      <span
                        className={cn(
                          "mt-2 h-2 w-2 rounded-full shrink-0",
                          isUnread ? "bg-amber-500" : "bg-ink/15",
                        )}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between gap-3 mb-1">
                          <p
                            className={cn(
                              "text-sm truncate",
                              isUnread ? "font-semibold text-ink" : "text-ink/75",
                            )}
                          >
                            {m.name}
                          </p>
                          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink/45 whitespace-nowrap shrink-0">
                            {fmtDate(m.createdAt)}
                          </span>
                        </div>
                        <p
                          className={cn(
                            "text-sm truncate",
                            isUnread ? "text-ink" : "text-ink/65",
                          )}
                        >
                          {m.subject || "(No subject)"}
                        </p>
                        <p className="text-xs text-ink/50 truncate mt-1">{m.message}</p>
                      </div>
                      <ChevronRight
                        className={cn(
                          "h-4 w-4 shrink-0 transition-colors mt-2",
                          isActive ? "text-ink" : "text-ink/25",
                        )}
                      />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </BentoCell>

        {/* Preview */}
        <BentoCell className="p-0 overflow-hidden">
          <AnimatePresence mode="wait">
            {!selected ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full min-h-[40vh] flex flex-col items-center justify-center text-center p-10 text-ink/40"
              >
                <Inbox className="h-8 w-8 mb-3" />
                <MaisonEyebrow>Nothing selected</MaisonEyebrow>
                <p className="mt-3 text-sm text-ink/55 max-w-xs">
                  Pick a message on the left to read it here.
                </p>
              </motion.div>
            ) : (
              <MessagePreview
                key={selected._id}
                message={selected}
                onChanged={() => mutate()}
              />
            )}
          </AnimatePresence>
        </BentoCell>
      </div>

      <Rule weight="hair" />
    </div>
  );
};

const MessagePreview = ({
  message,
  onChanged,
}: {
  message: ContactMessage;
  onChanged: () => void;
}) => {
  const [acting, setActing] = useState<null | "read" | "archive">(null);

  const update = async (kind: "read" | "archive") => {
    setActing(kind);
    try {
      await adminApi.updateContactMessage(message._id, { status: "resolved" });
      toast.success(kind === "read" ? "Marked as read" : "Archived");
      onChanged();
    } catch (e: any) {
      toast.error(e?.message ?? "Action failed");
    } finally {
      setActing(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="h-full flex flex-col"
    >
      <div className="px-7 pt-7 pb-5 border-b border-ink/10">
        <MaisonEyebrow>{fmtDate(message.createdAt)} · {fmtTime(message.createdAt)}</MaisonEyebrow>
        <h2 className="font-v3-display text-2xl md:text-3xl tracking-[-0.01em] text-ink mt-3">
          {message.subject || "(No subject)"}
        </h2>
        <div className="mt-3 flex items-center gap-3 flex-wrap">
          <span className="text-sm text-ink/65 truncate min-w-0">
            From <span className="text-ink font-medium">{message.name}</span>{" "}
            <span className="text-ink/45">·</span>{" "}
            <a
              href={`mailto:${message.email}`}
              className="text-ink underline underline-offset-4 decoration-ink/30 hover:decoration-ink"
            >
              {message.email}
            </a>
          </span>
          <StatusBadge
            status={
              message.status === "unread"
                ? "pending"
                : message.status === "read"
                  ? "approved"
                  : "rejected"
            }
            label={message.status.charAt(0).toUpperCase() + message.status.slice(1)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-7 py-6">
        <p className="text-[15px] leading-[1.7] text-ink whitespace-pre-wrap">{message.message}</p>
      </div>

      <div className="border-t border-ink/10 px-7 py-4 flex items-center gap-3 flex-wrap">
        <MaisonButton
          variant="primary"
          size="sm"
          onClick={() => update("read")}
          disabled={acting !== null || message.status === "read"}
        >
          {acting === "read" ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCheck className="h-4 w-4" />}
          Mark read
        </MaisonButton>
        <MaisonButton
          variant="ghost"
          size="sm"
          onClick={() => update("archive")}
          disabled={acting !== null}
        >
          {acting === "archive" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Archive className="h-4 w-4" />}
          Archive
        </MaisonButton>
        <MaisonButton variant="ghost" size="sm" asChild>
          <a href={`mailto:${message.email}?subject=Re: ${encodeURIComponent(message.subject || "")}`}>
            <Mail className="h-4 w-4" />
            Reply
          </a>
        </MaisonButton>
      </div>
    </motion.div>
  );
};

export default AdminContactMessages;
