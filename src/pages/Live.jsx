import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Radio, Plus, Users, X } from "lucide-react";
import MobileShell from "../components/MobileShell.jsx";
import NotificationBell from "../components/NotificationBell.jsx";
import { api } from "../lib/api.js";

const POLL_MS = 10000;

function GoLiveSheet({ onStart, onClose, starting, error }) {
  const [title, setTitle] = useState("");
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60" onClick={onClose}>
      <div className="w-full max-w-[420px] bg-grape rounded-t-3xl border-t border-white/10 p-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-fredoka text-lg text-cream">Go live</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
            <X className="w-4 h-4 text-cream" />
          </button>
        </div>
        <p className="font-jakarta text-xs text-cream/50 mb-3">Anyone browsing Friendczar will be able to find and join your stream.</p>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What's this live about?"
          maxLength={60}
          className="w-full bg-white/10 rounded-2xl px-4 py-3 text-sm text-cream placeholder:text-cream/40 outline-none font-jakarta border border-white/10"
        />
        {error && <p className="font-jakarta text-xs text-coral mt-2">{error}</p>}
        <button
          onClick={() => onStart(title)}
          disabled={starting}
          className="w-full mt-4 flex items-center justify-center gap-2 bg-gradient-to-br from-coral to-gold text-white font-jakarta font-bold text-sm py-3.5 rounded-2xl disabled:opacity-60"
        >
          <Radio className="w-4 h-4" /> {starting ? "Starting..." : "Start streaming"}
        </button>
      </div>
    </div>
  );
}

export default function Live() {
  const navigate = useNavigate();
  const [streams, setStreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showGoLive, setShowGoLive] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");
  const [myLive, setMyLive] = useState(null);

  const load = () => {
    api.listLive().then(({ streams }) => setStreams(streams)).finally(() => setLoading(false));
    api.myLive().then(({ stream }) => setMyLive(stream));
  };

  useEffect(() => {
    load();
    const id = setInterval(load, POLL_MS);
    return () => clearInterval(id);
  }, []);

  const startStream = async (title) => {
    setStarting(true);
    setError("");
    try {
      const { stream, token, wsUrl } = await api.startLive(title);
      navigate(`/live/${stream.id}`, { state: { token, wsUrl, isHost: true } });
    } catch (err) {
      setError(err.message);
    } finally {
      setStarting(false);
    }
  };

  return (
    <MobileShell
      header={
        <header className="flex items-center justify-between px-5 pt-5 pb-3 shrink-0">
          <h1 className="font-fredoka text-3xl text-cream">Live</h1>
          <div className="flex items-center gap-2">
            <NotificationBell />
          </div>
        </header>
      }
    >
      <div className="flex-1 overflow-y-auto scroll-thin px-5 pb-24">
        {myLive && (
          <button
            onClick={() => navigate(`/live/${myLive.id}`)}
            className="w-full flex items-center gap-3 bg-gradient-to-br from-coral to-gold rounded-2xl p-4 mb-4"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse shrink-0" />
            <span className="font-jakarta text-sm font-bold text-white text-left flex-1">You're live — tap to return to your stream</span>
          </button>
        )}

        {loading && <p className="font-jakarta text-sm text-cream/50 text-center mt-10">Loading...</p>}

        {!loading && streams.length === 0 && !myLive && (
          <div className="flex flex-col items-center text-center mt-16 px-4">
            <Radio className="w-8 h-8 text-gold mb-3" />
            <h3 className="font-fredoka text-xl text-cream">No one's live right now</h3>
            <p className="font-jakarta text-sm text-cream/50 mt-1.5">Be the first — tap the button below to start streaming.</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          {streams
            .filter((s) => s.id !== myLive?.id)
            .map((s) => (
              <button key={s.id} onClick={() => navigate(`/live/${s.id}`)} className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-grape border border-white/10">
                {s.host.avatarUrl ? (
                  <img src={s.host.avatarUrl} alt={s.host.name} className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-fredoka text-4xl text-cream/20">{s.host.name[0]}</span>
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink via-ink/70 to-transparent p-3">
                  <p className="font-jakarta text-xs font-bold text-cream truncate">{s.host.name}</p>
                  <p className="font-jakarta text-[11px] text-cream/70 truncate">{s.title}</p>
                </div>
                <span className="absolute top-2 left-2 flex items-center gap-1 bg-coral px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  <span className="font-jakarta text-[10px] font-bold text-white">LIVE</span>
                </span>
                <span className="absolute top-2 right-2 flex items-center gap-1 bg-black/50 backdrop-blur px-2 py-0.5 rounded-full">
                  <Users className="w-3 h-3 text-white" />
                  <span className="font-jakarta text-[10px] font-bold text-white">{s.viewerCount}</span>
                </span>
              </button>
            ))}
        </div>
      </div>

      {!myLive && (
        <button
          onClick={() => setShowGoLive(true)}
          className="absolute bottom-5 right-5 flex items-center gap-2 bg-gradient-to-br from-coral to-gold text-white font-jakarta font-bold text-sm px-5 py-3.5 rounded-full shadow-lg active:scale-95 transition-transform"
        >
          <Plus className="w-4 h-4" /> Go live
        </button>
      )}

      {showGoLive && <GoLiveSheet onStart={startStream} onClose={() => setShowGoLive(false)} starting={starting} error={error} />}
    </MobileShell>
  );
}
