import React, { useCallback, useRef, useState } from "react";
import { Flame, SlidersHorizontal, X, Star, RotateCcw, Zap, Play, MapPin, Sparkles } from "lucide-react";
import MobileShell from "../components/MobileShell.jsx";

const PROFILES = [
  {
    id: 1,
    name: "Amara",
    age: 26,
    distance: "3 km away",
    bio: "Chasing sunsets and street food. Will trade you a samosa recipe for a good playlist.",
    tags: ["Foodie", "Salsa", "Photography"],
    media: { type: "photo", src: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&q=80" },
    rotation: -3,
  },
  {
    id: 2,
    name: "Kwame",
    age: 29,
    distance: "6 km away",
    bio: "Building startups by day, terrible karaoke by night. Ask me about my dog.",
    tags: ["Startups", "Karaoke", "Dogs"],
    media: {
      type: "video",
      src: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
      poster: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800&q=80",
    },
    rotation: 2,
  },
  {
    id: 3,
    name: "Noor",
    age: 24,
    distance: "1 km away",
    bio: "Poet, plant mom, professional over-thinker. Let's overthink together.",
    tags: ["Poetry", "Plants", "Coffee"],
    media: { type: "photo", src: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=800&q=80" },
    rotation: -2,
  },
  {
    id: 4,
    name: "Diego",
    age: 31,
    distance: "9 km away",
    bio: "Weekend hiker, weekday spreadsheet wrangler. Looking for a co-pilot.",
    tags: ["Hiking", "Spreadsheets", "Tacos"],
    media: { type: "photo", src: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&q=80" },
    rotation: 3,
  },
  {
    id: 5,
    name: "Layla",
    age: 27,
    distance: "4 km away",
    bio: "I collect vinyl and bad puns in equal measure. Swipe if you can beat my pun game.",
    tags: ["Vinyl", "Puns", "Cats"],
    media: { type: "photo", src: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&q=80" },
    rotation: -1,
  },
];

function Confetti({ burstKey }) {
  if (!burstKey) return null;
  const pieces = Array.from({ length: 14 });
  return (
    <div key={burstKey} className="pointer-events-none absolute inset-0 z-40 overflow-visible">
      {pieces.map((_, i) => {
        const angle = (i / pieces.length) * 360;
        const dist = 60 + (i % 4) * 18;
        const colors = ["#FF5D73", "#FFC857", "#3DDC97", "#FFF8F0"];
        const size = 6 + (i % 3) * 3;
        return (
          <span
            key={i}
            className="confetti-piece"
            style={{
              "--angle": `${angle}deg`,
              "--dist": `${dist}px`,
              background: colors[i % colors.length],
              width: size,
              height: size,
              borderRadius: i % 2 === 0 ? "50%" : "2px",
            }}
          />
        );
      })}
    </div>
  );
}

function ProfileCard({ profile, index, total, isTop, drag, onPointerDown }) {
  const depth = index;
  const scale = 1 - depth * 0.045;
  const translateY = depth * 14;
  const dragRotate = isTop ? drag.x / 14 : 0;
  const [videoPlaying, setVideoPlaying] = useState(false);

  const style = {
    transform: `translate(${isTop ? drag.x : 0}px, ${isTop ? drag.y : translateY}px) rotate(${
      isTop ? profile.rotation + dragRotate : profile.rotation
    }deg) scale(${scale})`,
    zIndex: total - index,
    transition: drag.dragging ? "none" : "transform 0.45s cubic-bezier(.2,.9,.3,1.2)",
  };

  const likeOpacity = isTop ? Math.max(0, Math.min(1, drag.x / 90)) : 0;
  const nopeOpacity = isTop ? Math.max(0, Math.min(1, -drag.x / 90)) : 0;

  return (
    <div className="absolute inset-0 select-none" style={style} onPointerDown={isTop ? onPointerDown : undefined}>
      <div className="relative w-full h-full rounded-[28px] overflow-hidden shadow-[0_18px_40px_-8px_rgba(26,11,46,0.45)] border-[3px] border-white bg-grape">
        {profile.media.type === "photo" ? (
          <img src={profile.media.src} alt={profile.name} className="absolute inset-0 w-full h-full object-cover" draggable={false} />
        ) : (
          <div className="absolute inset-0 w-full h-full bg-black">
            {!videoPlaying && (
              <img src={profile.media.poster} alt={profile.name} className="absolute inset-0 w-full h-full object-cover opacity-90" draggable={false} />
            )}
            <video
              src={profile.media.src}
              poster={profile.media.poster}
              className="absolute inset-0 w-full h-full object-cover"
              loop
              muted
              playsInline
              autoPlay={videoPlaying}
              onClick={(e) => {
                e.stopPropagation();
                setVideoPlaying((p) => !p);
              }}
            />
            {!videoPlaying && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setVideoPlaying(true);
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
        )}

        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-ink via-ink/70 to-transparent" />

        <div className="absolute top-8 left-6 border-4 border-mint rounded-xl px-4 py-1 -rotate-12" style={{ opacity: likeOpacity }}>
          <span className="font-fredoka text-3xl text-mint tracking-wider">MATCH</span>
        </div>
        <div className="absolute top-8 right-6 border-4 border-coral rounded-xl px-4 py-1 rotate-12" style={{ opacity: nopeOpacity }}>
          <span className="font-fredoka text-3xl text-coral tracking-wider">NOPE</span>
        </div>

        <div className="absolute inset-x-0 bottom-0 p-5 pb-6">
          <div className="flex items-baseline gap-2">
            <h2 className="font-fredoka text-[28px] text-cream leading-none">{profile.name}</h2>
            <span className="font-jakarta text-lg text-cream/90">{profile.age}</span>
          </div>
          <div className="flex items-center gap-1 mt-1.5 text-gold">
            <MapPin className="w-3.5 h-3.5" />
            <span className="font-jakarta text-xs font-medium">{profile.distance}</span>
          </div>
          <p className="font-jakarta text-sm text-cream/85 mt-2 leading-snug pr-4">{profile.bio}</p>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {profile.tags.map((tag) => (
              <span key={tag} className="font-jakarta text-[11px] font-semibold px-2.5 py-1 rounded-full bg-white/15 backdrop-blur text-cream border border-white/25">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Discover() {
  const [deck, setDeck] = useState(PROFILES);
  const [history, setHistory] = useState([]);
  const [drag, setDrag] = useState({ x: 0, y: 0, dragging: false });
  const [burstKey, setBurstKey] = useState(0);
  const [toast, setToast] = useState(null);
  const startPos = useRef({ x: 0, y: 0 });
  const dragging = useRef(false);
  const toastTimer = useRef(null);

  const showToast = (msg) => {
    setToast(msg);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 1400);
  };

  const commitSwipe = useCallback((direction) => {
    setDeck((prev) => {
      if (prev.length === 0) return prev;
      const [current, ...rest] = prev;
      setHistory((h) => [current, ...h].slice(0, 5));
      if (direction === "like" || direction === "superlike") {
        setBurstKey((k) => k + 1);
        showToast(direction === "superlike" ? `Super Liked ${current.name}!` : `Liked ${current.name}!`);
      } else {
        showToast(`Passed on ${current.name}`);
      }
      return rest;
    });
    setDrag({ x: 0, y: 0, dragging: false });
  }, []);

  const onPointerDown = (e) => {
    dragging.current = true;
    startPos.current = { x: e.clientX, y: e.clientY };
    setDrag((d) => ({ ...d, dragging: true }));
    const move = (ev) => {
      if (!dragging.current) return;
      setDrag({ x: ev.clientX - startPos.current.x, y: ev.clientY - startPos.current.y, dragging: true });
    };
    const up = (ev) => {
      dragging.current = false;
      const dx = ev.clientX - startPos.current.x;
      if (dx > 110) commitSwipe("like");
      else if (dx < -110) commitSwipe("pass");
      else setDrag({ x: 0, y: 0, dragging: false });
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const rewind = () => {
    if (history.length === 0) return;
    const [last, ...rest] = history;
    setDeck((d) => [last, ...d]);
    setHistory(rest);
    showToast(`Rewound ${last.name}`);
  };

  const visible = deck.slice(0, 3);
  const current = deck[0];

  return (
    <MobileShell
      header={
        <header className="flex items-center justify-between px-5 pt-5 pb-3 shrink-0">
          <div className="flex items-center gap-1.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-coral to-gold flex items-center justify-center rotate-[-6deg]">
              <Flame className="w-4 h-4 text-white" fill="white" strokeWidth={0} />
            </div>
            <span className="font-fredoka text-2xl text-cream tracking-tight">friendczar</span>
          </div>
          <button className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/10 active:scale-95 transition-transform">
            <SlidersHorizontal className="w-4 h-4 text-cream" />
          </button>
        </header>
      }
    >
      <div className="absolute inset-0 px-5 pb-3">
        <div className="relative w-full h-full">
          {visible.length > 0 ? (
            visible
              .slice()
              .reverse()
              .map((p, i) => {
                const realIndex = visible.length - 1 - i;
                return (
                  <ProfileCard
                    key={p.id}
                    profile={p}
                    index={realIndex}
                    total={visible.length}
                    isTop={realIndex === 0}
                    drag={drag}
                    onPointerDown={onPointerDown}
                  />
                );
              })
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8">
              <Sparkles className="w-10 h-10 text-gold mb-3" />
              <h3 className="font-fredoka text-2xl text-cream">You're all caught up</h3>
              <p className="font-jakarta text-sm text-cream/60 mt-1.5">
                Check back soon for new faces nearby, or widen your distance filter.
              </p>
            </div>
          )}
          {current && <Confetti burstKey={burstKey} />}
        </div>

        {toast && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-grape border border-white/10 text-cream font-jakarta text-xs font-semibold px-4 py-2 rounded-full shadow-lg z-50">
            {toast}
          </div>
        )}
      </div>

      <div className="absolute bottom-3 inset-x-0 flex items-center justify-center gap-3.5 px-5">
        <button
          onClick={rewind}
          disabled={history.length === 0}
          className="w-11 h-11 rounded-full bg-grape border border-white/10 flex items-center justify-center text-gold disabled:opacity-30 active:scale-90 transition-transform"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <button
          onClick={() => commitSwipe("pass")}
          disabled={!current}
          className="w-14 h-14 rounded-full bg-cream shadow-[0_8px_20px_-4px_rgba(255,93,115,0.35)] flex items-center justify-center text-coral disabled:opacity-30 active:scale-90 transition-transform"
        >
          <X className="w-6 h-6" strokeWidth={3} />
        </button>
        <button
          onClick={() => commitSwipe("superlike")}
          disabled={!current}
          className="w-11 h-11 rounded-full bg-grape border border-white/10 flex items-center justify-center text-blue-400 disabled:opacity-30 active:scale-90 transition-transform"
        >
          <Star className="w-4 h-4" fill="currentColor" />
        </button>
        <button
          onClick={() => commitSwipe("like")}
          disabled={!current}
          className="w-14 h-14 rounded-full bg-gradient-to-br from-coral to-gold shadow-[0_8px_20px_-4px_rgba(255,200,87,0.45)] flex items-center justify-center text-white disabled:opacity-30 active:scale-90 transition-transform"
        >
          <Flame className="w-6 h-6" fill="white" strokeWidth={0} />
        </button>
        <button
          disabled={!current}
          className="w-11 h-11 rounded-full bg-grape border border-white/10 flex items-center justify-center text-mint disabled:opacity-30 active:scale-90 transition-transform"
        >
          <Zap className="w-4 h-4" fill="currentColor" />
        </button>
      </div>
    </MobileShell>
  );
}
