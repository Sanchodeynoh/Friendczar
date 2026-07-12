import React, { useState } from "react";
import {
  Flame,
  Users,
  MessageCircle,
  Flag,
  TrendingUp,
  Search,
  MoreVertical,
  ShieldCheck,
  Ban,
  CheckCircle2,
  XCircle,
  LayoutDashboard,
  Image as ImageIcon,
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const GROWTH = [
  { day: "Mon", signups: 120, matches: 340 },
  { day: "Tue", signups: 145, matches: 380 },
  { day: "Wed", signups: 132, matches: 410 },
  { day: "Thu", signups: 178, matches: 460 },
  { day: "Fri", signups: 210, matches: 520 },
  { day: "Sat", signups: 265, matches: 610 },
  { day: "Sun", signups: 240, matches: 590 },
];

const USERS = [
  { id: 1, name: "Amara Diallo", email: "amara@mail.com", status: "active", joined: "Jul 2, 2026", reports: 0 },
  { id: 2, name: "Kwame Boateng", email: "kwame@mail.com", status: "active", joined: "Jun 28, 2026", reports: 0 },
  { id: 3, name: "Noor Haddad", email: "noor@mail.com", status: "flagged", joined: "Jun 20, 2026", reports: 2 },
  { id: 4, name: "Diego Reyes", email: "diego@mail.com", status: "active", joined: "Jun 18, 2026", reports: 0 },
  { id: 5, name: "Layla Karimi", email: "layla@mail.com", status: "suspended", joined: "May 30, 2026", reports: 5 },
];

const REPORTS = [
  { id: 1, reporter: "Amara Diallo", target: "Unknown User #4471", reason: "Inappropriate photo", media: "photo", time: "10m ago" },
  { id: 2, reporter: "Noor Haddad", target: "Layla Karimi", reason: "Harassment in chat", media: null, time: "1h ago" },
  { id: 3, reporter: "Diego Reyes", target: "Unknown User #3390", reason: "Fake profile / spam", media: "photo", time: "3h ago" },
];

const STATUS_STYLES = {
  active: "bg-mint/15 text-mint",
  flagged: "bg-gold/15 text-gold",
  suspended: "bg-coral/15 text-coral",
};

function StatCard({ icon: Icon, label, value, delta }) {
  return (
    <div className="bg-grape rounded-2xl p-4 border border-white/10">
      <div className="flex items-center justify-between">
        <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
          <Icon className="w-4 h-4 text-coral" />
        </div>
        {delta && (
          <span className="flex items-center gap-0.5 text-mint font-jakarta text-xs font-bold">
            <TrendingUp className="w-3 h-3" /> {delta}
          </span>
        )}
      </div>
      <p className="font-fredoka text-2xl text-cream mt-3">{value}</p>
      <p className="font-jakarta text-xs text-cream/50">{label}</p>
    </div>
  );
}

function Sidebar({ active, setActive }) {
  const items = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "users", label: "Users", icon: Users },
    { id: "reports", label: "Reports", icon: Flag },
    { id: "content", label: "Content review", icon: ImageIcon },
  ];
  return (
    <aside className="w-60 shrink-0 border-r border-white/10 flex flex-col bg-[#150824] p-4">
      <div className="flex items-center gap-2 px-2 pb-6">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-coral to-gold flex items-center justify-center rotate-[-6deg]">
          <Flame className="w-4 h-4 text-white" fill="white" strokeWidth={0} />
        </div>
        <span className="font-fredoka text-xl text-cream">friendczar</span>
        <span className="font-jakarta text-[10px] font-bold text-cream/40 bg-white/10 px-1.5 py-0.5 rounded-md">ADMIN</span>
      </div>
      <nav className="flex flex-col gap-1">
        {items.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActive(id)}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-jakarta text-sm font-semibold transition-colors ${
              active === id ? "bg-gradient-to-br from-coral to-gold text-white" : "text-cream/60 hover:bg-white/5"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </nav>
      <div className="mt-auto flex items-center gap-2 px-2 py-3 border-t border-white/10">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-coral to-gold" />
        <div>
          <p className="font-jakarta text-xs font-bold text-cream">Admin</p>
          <p className="font-jakarta text-[10px] text-cream/40">admin@friendczar.com</p>
        </div>
      </div>
    </aside>
  );
}

function Overview() {
  return (
    <>
      <div className="grid grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total users" value="12,480" delta="+8.2%" />
        <StatCard icon={Flame} label="Matches today" value="590" delta="+12%" />
        <StatCard icon={MessageCircle} label="Messages sent" value="34,120" delta="+4.6%" />
        <StatCard icon={Flag} label="Open reports" value={REPORTS.length} />
      </div>

      <div className="bg-grape rounded-2xl p-5 border border-white/10 mt-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-jakarta font-bold text-cream text-sm">Signups &amp; matches, last 7 days</h3>
          <div className="flex items-center gap-3 text-xs font-jakarta text-cream/50">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-coral inline-block" /> Signups</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gold inline-block" /> Matches</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={GROWTH}>
            <defs>
              <linearGradient id="signupsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FF5D73" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#FF5D73" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="matchesGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FFC857" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#FFC857" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,248,240,0.08)" vertical={false} />
            <XAxis dataKey="day" stroke="rgba(255,248,240,0.4)" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="rgba(255,248,240,0.4)" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ background: "#1A0B2E", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, fontFamily: "Plus Jakarta Sans" }} />
            <Area type="monotone" dataKey="signups" stroke="#FF5D73" fill="url(#signupsGrad)" strokeWidth={2} />
            <Area type="monotone" dataKey="matches" stroke="#FFC857" fill="url(#matchesGrad)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}

function UsersTable() {
  const [query, setQuery] = useState("");
  const filtered = USERS.filter((u) => u.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="bg-grape rounded-2xl border border-white/10 overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <h3 className="font-jakarta font-bold text-cream text-sm">All users</h3>
        <div className="flex items-center gap-2 bg-white/5 rounded-full px-3 py-1.5 border border-white/10">
          <Search className="w-3.5 h-3.5 text-cream/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search users"
            className="bg-transparent outline-none text-xs text-cream placeholder:text-cream/40 font-jakarta w-40"
          />
        </div>
      </div>
      <table className="w-full text-left">
        <thead>
          <tr className="font-jakarta text-[11px] uppercase text-cream/40">
            <th className="px-4 py-2.5 font-semibold">Name</th>
            <th className="px-4 py-2.5 font-semibold">Joined</th>
            <th className="px-4 py-2.5 font-semibold">Reports</th>
            <th className="px-4 py-2.5 font-semibold">Status</th>
            <th className="px-4 py-2.5"></th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((u) => (
            <tr key={u.id} className="border-t border-white/5 hover:bg-white/[0.03]">
              <td className="px-4 py-3">
                <p className="font-jakarta text-sm font-semibold text-cream">{u.name}</p>
                <p className="font-jakarta text-xs text-cream/40">{u.email}</p>
              </td>
              <td className="px-4 py-3 font-jakarta text-xs text-cream/60">{u.joined}</td>
              <td className="px-4 py-3 font-jakarta text-xs text-cream/60">{u.reports}</td>
              <td className="px-4 py-3">
                <span className={`font-jakarta text-[11px] font-bold px-2.5 py-1 rounded-full capitalize ${STATUS_STYLES[u.status]}`}>
                  {u.status}
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                <button className="w-7 h-7 rounded-full hover:bg-white/10 inline-flex items-center justify-center">
                  <MoreVertical className="w-4 h-4 text-cream/50" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ReportsQueue() {
  return (
    <div className="space-y-3">
      {REPORTS.map((r) => (
        <div key={r.id} className="bg-grape rounded-2xl p-4 border border-white/10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-coral/15 flex items-center justify-center shrink-0">
              <Flag className="w-4 h-4 text-coral" />
            </div>
            <div className="min-w-0">
              <p className="font-jakarta text-sm font-semibold text-cream truncate">
                {r.reporter} reported <span className="text-gold">{r.target}</span>
              </p>
              <p className="font-jakarta text-xs text-cream/50 mt-0.5">{r.reason} · {r.time}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button className="flex items-center gap-1 font-jakarta text-xs font-bold text-mint bg-mint/10 px-3 py-1.5 rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5" /> Dismiss
            </button>
            <button className="flex items-center gap-1 font-jakarta text-xs font-bold text-coral bg-coral/10 px-3 py-1.5 rounded-full">
              <Ban className="w-3.5 h-3.5" /> Suspend
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function ContentReview() {
  const items = [
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&q=80",
    "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&q=80",
    "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=300&q=80",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&q=80",
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&q=80",
    "https://images.unsplash.com/photo-1520950237264-05a5f349b8d5?w=300&q=80",
  ];
  return (
    <div>
      <p className="font-jakarta text-sm text-cream/60 mb-4">New uploads awaiting moderation before they go live.</p>
      <div className="grid grid-cols-4 gap-3">
        {items.map((src, i) => (
          <div key={i} className="relative rounded-2xl overflow-hidden border border-white/10 aspect-square group">
            <img src={src} className="w-full h-full object-cover" alt="pending upload" />
            <div className="absolute inset-0 bg-ink/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button className="w-8 h-8 rounded-full bg-mint flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-ink" />
              </button>
              <button className="w-8 h-8 rounded-full bg-coral flex items-center justify-center">
                <XCircle className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Admin() {
  const [active, setActive] = useState("overview");

  const titles = {
    overview: "Overview",
    users: "Users",
    reports: "Reports",
    content: "Content review",
  };

  return (
    <div className="min-h-screen w-full flex bg-ink">
      <Sidebar active={active} setActive={setActive} />
      <div className="flex-1 min-w-0">
        <header className="flex items-center justify-between px-8 py-5 border-b border-white/10">
          <div>
            <h1 className="font-fredoka text-2xl text-cream">{titles[active]}</h1>
            <p className="font-jakarta text-xs text-cream/40 mt-0.5">Friendczar Admin Dashboard</p>
          </div>
          <span className="flex items-center gap-1.5 font-jakarta text-xs font-bold text-mint bg-mint/10 px-3 py-1.5 rounded-full">
            <ShieldCheck className="w-3.5 h-3.5" /> All systems normal
          </span>
        </header>
        <div className="p-8">
          {active === "overview" && <Overview />}
          {active === "users" && <UsersTable />}
          {active === "reports" && <ReportsQueue />}
          {active === "content" && <ContentReview />}
        </div>
      </div>
    </div>
  );
}
