import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Flame,
  SlidersHorizontal,
  Heart,
  MessageCircle,
  Send,
  Play,
  MapPin,
  X,
} from "lucide-react";
import MobileShell from "../components/MobileShell.jsx";
import NotificationBell from "../components/NotificationBell.jsx";
import { api } from "../lib/api.js";

const PLACEHOLDER_PHOTO = "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=900&q=80";

function VideoCard({ media }) {
  const [playing, setPlaying] = useState(false);
  return (
    <div className="absolute inset-0 w-full h-full bg-black">
      <video
        src={media.url}
        className="absolute inset-0 w-full h-full object-cover"
        loop
        muted
        playsInline
        autoPlay={playing}
        onClick={(e) => {
          e.stopPropagation();
          setPlaying((p) => !p);
        }}
      />
      {!playing && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setPlaying(true);
          }}
          className="absolute inset-0 flex items-center justify-center"
          aria-label="Play video"
        >
          <span className="w-16 h-16 rounded-full bg-white/25 backdrop-blur-md border-2 border-white flex items-center justify-center">
            <Play className="w-7 h-7 text-white fill-white" />
          </span>
        </button>
      )}
      <div className="absolute top-4 left-4 flex items-center gap-1 bg-black/50 backdrop-blur px-2.5 py-1 rounded-full">
        <span className="w-1.5 h-1.5 rounded-full bg-coral animate-pulse" />
        <span className="text-[11px] font-semibold text-white tracking-wide font-jakarta">CLIP</span>
      </div>
    </div>
  );
}

function CommentsSheet({ profile, onClose }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    api
      .getComments(profile.id)
      .then(({ comments }) => setComments(comments))
      .finally(() => setLoading(false));
  }, [profile.id]);

  const submit = async () => {
    if (!draft.trim() || sending) return;
    setSending(true);
    try {
      const { comment } = await api.addComment(profile.id, draft.trim());
      setComments((c) => [...c, comment]);
      setDraft("");
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-grape rounded-t-3xl border-t border-white/10 max-h-[70%] flex flex-col">
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-white/10 shrink-0">
          <h3 className="font-fredoka text-lg text-cream">Comments</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
            <X className="w-4 h-4 text-cream" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto scroll-thin px-5 py-3 space-y-3">
          {loading && <p className="font-jakarta text-sm text-cream/40 text-center mt-6">Loading comments...</p>}
          {!loading && comments.length === 0 && (
            <p className="font-jakarta text-sm text-cream/40 text-center mt-6">Be the first to comment on {profile.name}'s post.</p>
          )}
          {comments.map((c) => (
            <div key={c.id} className="flex gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-coral to-gold shrink-0 overflow-hidden flex items-center justify-center">
                {c.author.avatarUrl && <img src={c.author.avatarUrl} alt={c.author.name} className="w-full h-full object-cover" />}
              </div>
              <div>
                <p className="font-jakarta text-xs font-bold text-cream">{c.author.name}</p>
                <p className="font-jakarta text-sm text-cream/80">{c.text}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 px-4 py-3 border-t border-white/10 shrink-0">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="Add a comment..."
            className="flex-1 bg-white/10 rounded-full px-4 py-2.5 text-sm text-cream placeholder:text-cream/40 outline-none font-jakarta border border-white/10"
          />
          <button
            onClick={submit}
            disabled={sending}
            className="w-10 h-10 rounded-full bg-gradient-to-br from-coral to-gold flex items-center justify-center text-white shrink-0 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function FilterSheet({ filters, onChange, onClose, onReset, resultCount }) {
  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-grape rounded-t-3xl border-t border-white/10 flex flex-col">
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-white/10">
          <h3 className="font-fredoka text-lg text-cream">Filters</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
            <X className="w-4 h-4 text-cream" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-jakarta text-sm font-bold text-cream">Age range</span>
              <span className="font-jakarta text-sm font-bold text-gold">
                {filters.minAge} - {filters.maxAge}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={18}
                max={60}
                value={filters.minAge}
                onChange={(e) => onChange({ ...filters, minAge: Math.min(Number(e.target.value), filters.maxAge) })}
                className="w-full accent-[#FF5D73]"
              />
              <input
                type="range"
                min={18}
                max={60}
                value={filters.maxAge}
                onChange={(e) => onChange({ ...filters, maxAge: Math.max(Number(e.target.value), filters.minAge) })}
                className="w-full accent-[#FFC857]"
              />
            </div>
          </div>

          <div>
            <span className="font-jakarta text-sm font-bold text-cream mb-2 block">Show me</span>
            <div className="flex gap-2">
              {["Everyone", "Women", "Men"].map((opt) => (
                <button
                  key={opt}
                  onClick={() => onChange({ ...filters, showMe: opt })}
                  className={`flex-1 py-2.5 rounded-full font-jakarta text-sm font-bold transition-colors ${
                    filters.showMe === opt ? "bg-gradient-to-br from-coral to-gold text-white" : "bg-white/5 text-cream/60 border border-white/10"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 px-5 pb-6 pt-2">
          <button onClick={onReset} className="font-jakarta text-sm font-bold text-cream/60 px-4 py-3">
            Reset
          </button>
          <button onClick={onClose} className="flex-1 bg-gradient-to-br from-coral to-gold text-white font-jakarta font-bold text-sm py-3 rounded-2xl">
            Show {resultCount} {resultCount === 1 ? "profile" : "profiles"}
          </button>
        </div>
      </div>
    </div>
  );
}

const DEFAULT_FILTERS = { minAge: 18, maxAge: 45, showMe: "Everyone" };

function FeedCard({ profile, onToggleLike, onOpenComments, onMessage, onOpenProfile }) {
  const primaryMedia = profile.media?.[0];

  return (
    <section className="relative h-full w-full shrink-0 snap-start">
      {!primaryMedia && <img src={PLACEHOLDER_PHOTO} alt={profile.name} className="absolute inset-0 w-full h-full object-cover" />}
      {primaryMedia?.type === "photo" && (
        <img src={primaryMedia.url} alt={profile.name} className="absolute inset-0 w-full h-full object-cover" draggable={false} />
      )}
      {primaryMedia?.type === "video" && <VideoCard media={primaryMedia} />}

      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-ink via-ink/70 to-transparent" />

      <div className="absolute right-3 bottom-28 flex flex-col items-center gap-5 z-10">
        <button onClick={onToggleLike} className="flex flex-col items-center gap-1 active:scale-90 transition-transform">
          <span className={`w-12 h-12 rounded-full flex items-center justify-center ${profile.likedByMe ? "bg-coral" : "bg-white/15 backdrop-blur"}`}>
            <Heart className="w-5 h-5" fill={profile.likedByMe ? "white" : "none"} stroke="white" />
          </span>
          <span className="font-jakarta text-[11px] font-bold text-cream">{profile.likeCount}</span>
        </button>
        <button onClick={onOpenComments} className="flex flex-col items-center gap-1 active:scale-90 transition-transform">
          <span className="w-12 h-12 rounded-full bg-white/15 backdrop-blur flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-white" />
          </span>
          <span className="font-jakarta text-[11px] font-bold text-cream">{profile.commentCount}</span>
        </button>
        <button onClick={onMessage} className="flex flex-col items-center gap-1 active:scale-90 transition-transform">
          <span className="w-12 h-12 rounded-full bg-gradient-to-br from-coral to-gold flex items-center justify-center">
            <Send className="w-5 h-5 text-white" />
          </span>
          <span className="font-jakarta text-[11px] font-bold text-cream">Chat</span>
        </button>
      </div>

      <div className="absolute inset-x-0 bottom-0 p-5 pb-6 pr-20">
        <button onClick={onOpenProfile} className="flex items-baseline gap-2 active:opacity-70">
          <h2 className="font-fredoka text-[26px] text-cream leading-none underline decoration-gold/50 decoration-2 underline-offset-4">{profile.name}</h2>
          {profile.age && <span className="font-jakarta text-lg text-cream/90">{profile.age}</span>}
        </button>
        {profile.location && (
          <div className="flex items-center gap-1 mt-1.5 text-gold">
            <MapPin className="w-3.5 h-3.5" />
            <span className="font-jakarta text-xs font-medium">{profile.location}</span>
          </div>
        )}
        {profile.bio && <p className="font-jakarta text-sm text-cream/85 mt-2 leading-snug">{profile.bio}</p>}
        {profile.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {profile.tags.map((tag) => (
              <span key={tag} className="font-jakarta text-[11px] font-semibold px-2.5 py-1 rounded-full bg-white/15 backdrop-blur text-cream border border-white/25">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default function Discover() {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openComments, setOpenComments] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  const loadProfiles = () => {
    setLoading(true);
    setError("");
    api
      .discover({ minAge: filters.minAge, maxAge: filters.maxAge, gender: filters.showMe })
      .then(({ profiles }) => setProfiles(profiles))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProfiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const toggleLike = async (id) => {
    setProfiles((prev) =>
      prev.map((p) => (p.id === id ? { ...p, likedByMe: !p.likedByMe, likeCount: p.likeCount + (p.likedByMe ? -1 : 1) } : p))
    );
    try {
      await api.toggleLike(id);
    } catch (err) {
      loadProfiles(); // resync on failure
    }
  };

  const activeProfile = profiles.find((p) => p.id === openComments);
  const filtersActive = JSON.stringify(filters) !== JSON.stringify(DEFAULT_FILTERS);

  return (
    <MobileShell
      header={
        <header className="flex items-center justify-between px-5 pt-5 pb-3 shrink-0 z-20 relative">
          <div className="flex items-center gap-1.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-coral to-gold flex items-center justify-center rotate-[-6deg]">
              <Flame className="w-4 h-4 text-white" fill="white" strokeWidth={0} />
            </div>
            <span className="font-fredoka text-2xl text-cream tracking-tight">friendczar</span>
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <button
              onClick={() => setShowFilters(true)}
              className="relative w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/10 active:scale-95 transition-transform"
            >
              <SlidersHorizontal className="w-4 h-4 text-cream" />
              {filtersActive && <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-coral border-2 border-ink" />}
            </button>
          </div>
        </header>
      }
    >
      <div className="absolute inset-0 overflow-y-auto snap-y snap-mandatory scroll-thin">
        {loading && (
          <div className="h-full w-full flex items-center justify-center">
            <span className="font-jakarta text-sm text-cream/50">Loading profiles...</span>
          </div>
        )}
        {!loading && error && (
          <div className="h-full w-full flex flex-col items-center justify-center text-center px-8">
            <p className="font-jakarta text-sm text-coral">{error}</p>
            <button onClick={loadProfiles} className="mt-3 font-jakarta text-sm font-bold text-gold">
              Try again
            </button>
          </div>
        )}
        {!loading && !error && profiles.length === 0 && (
          <div className="h-full w-full flex flex-col items-center justify-center text-center px-8">
            <SlidersHorizontal className="w-8 h-8 text-gold mb-3" />
            <h3 className="font-fredoka text-xl text-cream">No one matches those filters</h3>
            <p className="font-jakarta text-sm text-cream/50 mt-1.5">Try widening your age range or "Show me" setting.</p>
          </div>
        )}
        {!loading &&
          !error &&
          profiles.map((profile) => (
            <FeedCard
              key={profile.id}
              profile={profile}
              onToggleLike={() => toggleLike(profile.id)}
              onOpenComments={() => setOpenComments(profile.id)}
              onMessage={() => navigate(`/messages/${profile.id}`)}
              onOpenProfile={() => navigate(`/user/${profile.id}`)}
            />
          ))}
      </div>

      {activeProfile && <CommentsSheet profile={activeProfile} onClose={() => setOpenComments(null)} />}

      {showFilters && (
        <FilterSheet
          filters={filters}
          onChange={setFilters}
          onClose={() => setShowFilters(false)}
          onReset={() => setFilters(DEFAULT_FILTERS)}
          resultCount={profiles.length}
        />
      )}
    </MobileShell>
  );
}
