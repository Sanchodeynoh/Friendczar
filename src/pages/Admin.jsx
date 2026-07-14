import React, { useEffect, useState } from "react";
import {
  Flame,
  Users,
  MessageCircle,
  Flag,
  Search,
  ShieldCheck,
  Ban,
  CheckCircle2,
  XCircle,
  LayoutDashboard,
  Image as ImageIcon,
} from "lucide-react";
import { api } from "../lib/api.js";

const STATUS_STYLES = {
  active: "bg-mint/15 text-mint",
  flagged: "bg-gold/15 text-gold",
  suspended: "bg-coral/15 text-coral",
};

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="bg-grape rounded-2xl p-4 border border-white/10">
      <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
        <Icon className="w-4 h-4 text-coral" />
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
    </aside>
  );
}

function Overview() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.adminStats().then(setStats);
  }, []);

  if (!stats) return <p className="font-jakarta text-sm text-cream/50">Loading stats...</p>;

  return (
    <div className="grid grid-cols-4 gap-4">
      <StatCard icon={Users} label="Total users" value={stats.totalUsers} />
      <StatCard icon={Flame} label="Total likes" value={stats.totalMatches} />
      <StatCard icon={MessageCircle} label="Messages sent" value={stats.totalMessages} />
      <StatCard icon={Flag} label="Open reports" value={stats.openReports} />
    </div>
  );
}

function UsersTable() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  const load = () => api.adminUsers().then(({ users }) => setUsers(users)).finally(() => setLoading(false));
  useEffect(() => {
    load();
  }, []);

  const setStatus = async (id, status) => {
    await api.adminSetUserStatus(id, status);
    load();
  };

  const filtered = users.filter((u) => u.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="bg-grape rounded-2xl border border-white/10 overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <h3 className="font-jakarta font-bold text-cream text-sm">All users</h3>
        <div className="flex items-center gap-2 bg-white/5 rounded-full px-3 py-1.5 border border-white/10">
          <Search className="w-3.5 h-3.5 text-cream/40" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search users" className="bg-transparent outline-none text-xs text-cream placeholder:text-cream/40 font-jakarta w-40" />
        </div>
      </div>
      {loading ? (
        <p className="font-jakarta text-sm text-cream/50 p-4">Loading users...</p>
      ) : (
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
                <td className="px-4 py-3 font-jakarta text-xs text-cream/60">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3 font-jakarta text-xs text-cream/60">{u._count.reportsAgainst}</td>
                <td className="px-4 py-3">
                  <span className={`font-jakarta text-[11px] font-bold px-2.5 py-1 rounded-full capitalize ${STATUS_STYLES[u.status]}`}>{u.status}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  {u.status !== "suspended" ? (
                    <button onClick={() => setStatus(u.id, "suspended")} className="font-jakarta text-xs font-bold text-coral">
                      Suspend
                    </button>
                  ) : (
                    <button onClick={() => setStatus(u.id, "active")} className="font-jakarta text-xs font-bold text-mint">
                      Reinstate
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function ReportsQueue() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => api.adminReports().then(({ reports }) => setReports(reports)).finally(() => setLoading(false));
  useEffect(() => {
    load();
  }, []);

  const resolve = async (id, action) => {
    await api.adminResolveReport(id, action);
    load();
  };

  if (loading) return <p className="font-jakarta text-sm text-cream/50">Loading reports...</p>;
  if (reports.length === 0) return <p className="font-jakarta text-sm text-cream/50">No open reports 🎉</p>;

  return (
    <div className="space-y-3">
      {reports.map((r) => (
        <div key={r.id} className="bg-grape rounded-2xl p-4 border border-white/10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-coral/15 flex items-center justify-center shrink-0">
              <Flag className="w-4 h-4 text-coral" />
            </div>
            <div className="min-w-0">
              <p className="font-jakarta text-sm font-semibold text-cream truncate">
                {r.reporter.name} reported <span className="text-gold">{r.target.name}</span>
              </p>
              <p className="font-jakarta text-xs text-cream/50 mt-0.5">{r.reason}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={() => resolve(r.id, "dismiss")} className="flex items-center gap-1 font-jakarta text-xs font-bold text-mint bg-mint/10 px-3 py-1.5 rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5" /> Dismiss
            </button>
            <button onClick={() => resolve(r.id, "suspend")} className="flex items-center gap-1 font-jakarta text-xs font-bold text-coral bg-coral/10 px-3 py-1.5 rounded-full">
              <Ban className="w-3.5 h-3.5" /> Suspend
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function ContentReview() {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => api.adminPendingMedia().then(({ media }) => setMedia(media)).finally(() => setLoading(false));
  useEffect(() => {
    load();
  }, []);

  const approve = async (id) => {
    await api.adminApproveMedia(id);
    load();
  };
  const reject = async (id) => {
    await api.adminDeleteMedia(id);
    load();
  };

  if (loading) return <p className="font-jakarta text-sm text-cream/50">Loading...</p>;

  return (
    <div>
      <p className="font-jakarta text-sm text-cream/60 mb-4">New uploads awaiting moderation before they go live.</p>
      {media.length === 0 ? (
        <p className="font-jakarta text-sm text-cream/50">Nothing pending review 🎉</p>
      ) : (
        <div className="grid grid-cols-4 gap-3">
          {media.map((m) => (
            <div key={m.id} className="relative rounded-2xl overflow-hidden border border-white/10 aspect-square group">
              <img src={m.url} className="w-full h-full object-cover" alt="pending upload" />
              <div className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] font-jakarta px-1.5 py-0.5 rounded-full">{m.user.name}</div>
              <div className="absolute inset-0 bg-ink/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button onClick={() => approve(m.id)} className="w-8 h-8 rounded-full bg-mint flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-ink" />
                </button>
                <button onClick={() => reject(m.id)} className="w-8 h-8 rounded-full bg-coral flex items-center justify-center">
                  <XCircle className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Admin() {
  const [active, setActive] = useState("overview");
  const titles = { overview: "Overview", users: "Users", reports: "Reports", content: "Content review" };

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
