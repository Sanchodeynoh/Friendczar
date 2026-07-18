import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Ban, UserX } from "lucide-react";
import { api } from "../lib/api.js";

export default function Settings() {
  const navigate = useNavigate();
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unblockingId, setUnblockingId] = useState(null);

  const load = () => api.getBlockedUsers().then(({ blocks }) => setBlocks(blocks)).finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  const unblock = async (userId) => {
    setUnblockingId(userId);
    try {
      await api.unblockUser(userId);
      setBlocks((prev) => prev.filter((b) => b.blocked.id !== userId));
    } catch (err) {
      console.error(err);
    } finally {
      setUnblockingId(null);
    }
  };

  return (
    <div className="w-full h-[100dvh] flex justify-center bg-ink overflow-hidden">
      <div className="w-full max-w-[420px] flex flex-col h-full">
        <header className="flex items-center gap-3 px-4 pt-5 pb-3 shrink-0">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
            <ChevronLeft className="w-5 h-5 text-cream" />
          </button>
          <h1 className="font-fredoka text-xl text-cream">Settings</h1>
        </header>

        <div className="flex-1 overflow-y-auto scroll-thin px-5 pb-8">
          <h2 className="font-jakarta font-bold text-cream text-sm flex items-center gap-1.5 mb-3">
            <Ban className="w-3.5 h-3.5 text-gold" /> Blocked accounts
          </h2>

          {loading && <p className="font-jakarta text-sm text-cream/40">Loading...</p>}
          {!loading && blocks.length === 0 && (
            <p className="font-jakarta text-sm text-cream/40">You haven't blocked anyone. Blocked accounts can't see your profile, message you, or call you.</p>
          )}

          <div className="space-y-2">
            {blocks.map((b) => (
              <div key={b.id} className="flex items-center gap-3 bg-grape rounded-2xl p-3 border border-white/10">
                <div className="w-10 h-10 rounded-full bg-white/10 overflow-hidden flex items-center justify-center shrink-0">
                  {b.blocked.avatarUrl ? (
                    <img src={b.blocked.avatarUrl} alt={b.blocked.name} className="w-full h-full object-cover" />
                  ) : (
                    <UserX className="w-4 h-4 text-cream/40" />
                  )}
                </div>
                <p className="font-jakarta text-sm font-semibold text-cream flex-1">{b.blocked.name}</p>
                <button
                  onClick={() => unblock(b.blocked.id)}
                  disabled={unblockingId === b.blocked.id}
                  className="font-jakarta text-xs font-bold text-gold px-3 py-1.5 rounded-full bg-white/5 disabled:opacity-50"
                >
                  {unblockingId === b.blocked.id ? "..." : "Unblock"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
