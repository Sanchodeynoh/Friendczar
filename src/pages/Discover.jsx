import React, { useRef, useState } from "react";
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

const PROFILES = [
  {
    id: "amara",
    name: "Amara",
    age: 26,
    distance: "3 km away",
    bio: "Chasing sunsets and street food. Will trade you a samosa recipe for a good playlist.",
    tags: ["Foodie", "Salsa", "Photography"],
    media: { type: "photo", src: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=900&q=80" },
    likes: 214,
    comments: [
      { author: "Diego", text: "That playlist offer is very tempting 👀" },
      { author: "Noor", text: "Samosas AND salsa? Sold." },
    ],
  },
  {
    id: "kwame",
    name: "Kwame",
    age: 29,
    distance: "6 km away",
    bio: "Building startups by day, terrible karaoke by night. Ask me about my dog.",
    tags: ["Startups", "Karaoke", "Dogs"],
    media: {
      type: "video",
      src: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
      poster: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=900&q=80",
    },
    likes: 389,
    comments: [{ author: "Layla", text: "the dog better be in the next video" }],
  },
  {
    id: "noor",
    name: "Noor",
    age: 24,
    distance: "1 km away",
    bio: "Poet, plant mom, professional over-thinker. Let's overthink together.",
    tags: ["Poetry", "Plants", "Coffee"],
    media: { type: "photo", src: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=900&q=80" },
    likes: 502,
    comments: [],
  },
  {
    id: "diego",
    name: "Diego",
    age: 31,
    distance: "9 km away",
    bio: "Weekend hiker, weekday spreadsheet wrangler. Looking for a co-pilot.",
    tags: ["Hiking", "Spreadsheets", "Tacos"],
    media: { type: "photo", src: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=900&q=80" },
    likes: 167,
    comments: [],
  },
  {
    id: "layla",
    name: "Layla",
    age: 27,
    distance: "4 km away",
    bio: "I collect vinyl and bad puns in equal measure. Swipe if you can beat my pun game.",
    tags: ["Vinyl", "Puns", "Cats"],
    media: { type: "photo", src: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=900&q=80" },
    likes: 298,
    comments: [{ author: "Kwame", text: "give me your worst pun" }],
  },
];

function VideoCard({ media }) {
  const [playing, setPlaying] = useState(false);
  return (
    <div className="absolute inset-0 w-full h-full bg-black">
      {!playing && <img src={media.poster} alt="" className="absolute inset-0 w-full h-full object-cover opacity-90" draggable={false} />}
      <video
        src={media.src}
        poster={media.poster}
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

function CommentsSheet({ profile, comments, onAdd, onClose }) {
  const [draft, setDraft] = useState("");
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
          {comments.length === 0 && <p className="font-jakarta text-sm text-cream/40 text-center mt-6">Be the first to comment on {profile.name}'s post.</p>}
          {comments.map((c, i) => (
            <div key={i} className="flex gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-coral to-gold shrink-0" />
              <div>
                <p className="font-jakarta text-xs font-bold text-cream">{c.author}</p>
                <p className="font-jakarta text-sm text-cream/80">{c.text}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 px-4 py-3 border-t border-white/10 shrink-0">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && draft.trim()) {
                onAdd(draft.trim());
                setDraft("");
              }
            }}
            placeholder="Add a comment..."
            className="flex-1 bg-white/10 rounded-full px-4 py-2.5 text-sm text-cream placeholder:text-cream/40 outline-none font-jakarta border border-white/10"
          />
          <button
            onClick={() => {
              if (!draft.trim()) return;
              onAdd(draft.trim());
              setDraft("");
            }}
            className="w-10 h-10 rounded-full bg-gradient-to-br from-coral to-gold flex items-center justify-center text-white shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function FeedCard({ profile, liked, likeCount, comments, onToggleLike, onOpenComments, onMessage }) {
  return (
    <section className="relative h-full w-full shrink-0 snap-start">
      {profile.media.type === "photo" ? (
        <img src={profile.media.src} alt={profile.name} className="absolute inset-0 w-full h-full object-cover" draggable={false} />
      ) : (
        <VideoCard media={profile.media} />
      )}

      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-ink via-ink/70 to-transparent" />

      {/* right action rail */}
      <div className="absolute right-3 bottom-28 flex flex-col items-center gap-5 z-10">
        <button onClick={onToggleLike} className="flex flex-col items-center gap-1 active:scale-90 transition-transform">
          <span className={`w-12 h-12 rounded-full flex items-center justify-center ${liked ? "bg-coral" : "bg-white/15 backdrop-blur"}`}>
            <Heart className="w-5 h-5" fill={liked ? "white" : "none"} stroke="white" />
          </span>
          <span className="font-jakarta text-[11px] font-bold text-cream">{likeCount}</span>
        </button>
        <button onClick={onOpenComments} className="flex flex-col items-center gap-1 active:scale-90 transition-transform">
          <span className="w-12 h-12 rounded-full bg-white/15 backdrop-blur flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-white" />
          </span>
          <span className="font-jakarta text-[11px] font-bold text-cream">{comments.length}</span>
        </button>
        <button onClick={onMessage} className="flex flex-col items-center gap-1 active:scale-90 transition-transform">
          <span className="w-12 h-12 rounded-full bg-gradient-to-br from-coral to-gold flex items-center justify-center">
            <Send className="w-5 h-5 text-white" />
          </span>
          <span className="font-jakarta text-[11px] font-bold text-cream">Chat</span>
        </button>
      </div>

      {/* info block */}
      <div className="absolute inset-x-0 bottom-0 p-5 pb-6 pr-20">
        <div className="flex items-baseline gap-2">
          <h2 className="font-fredoka text-[26px] text-cream leading-none">{profile.name}</h2>
          <span className="font-jakarta text-lg text-cream/90">{profile.age}</span>
        </div>
        <div className="flex items-center gap-1 mt-1.5 text-gold">
          <MapPin className="w-3.5 h-3.5" />
          <span className="font-jakarta text-xs font-medium">{profile.distance}</span>
        </div>
        <p className="font-jakarta text-sm text-cream/85 mt-2 leading-snug">{profile.bio}</p>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {profile.tags.map((tag) => (
            <span key={tag} className="font-jakarta text-[11px] font-semibold px-2.5 py-1 rounded-full bg-white/15 backdrop-blur text-cream border border-white/25">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Discover() {
  const navigate = useNavigate();
  const [likedMap, setLikedMap] = useState({});
  const [likeCounts, setLikeCounts] = useState(() => Object.fromEntries(PROFILES.map((p) => [p.id, p.likes])));
  const [commentsMap, setCommentsMap] = useState(() => Object.fromEntries(PROFILES.map((p) => [p.id, p.comments])));
  const [openComments, setOpenComments] = useState(null);

  const toggleLike = (id) => {
    setLikedMap((prev) => {
      const isLiked = !prev[id];
      setLikeCounts((counts) => ({ ...counts, [id]: counts[id] + (isLiked ? 1 : -1) }));
      return { ...prev, [id]: isLiked };
    });
  };

  const addComment = (id, text) => {
    setCommentsMap((prev) => ({ ...prev, [id]: [...prev[id], { author: "You", text }] }));
  };

  const activeProfile = PROFILES.find((p) => p.id === openComments);

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
          <button className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/10 active:scale-95 transition-transform">
            <SlidersHorizontal className="w-4 h-4 text-cream" />
          </button>
        </header>
      }
    >
      <div className="absolute inset-0 overflow-y-auto snap-y snap-mandatory scroll-thin">
        {PROFILES.map((profile) => (
          <FeedCard
            key={profile.id}
            profile={profile}
            liked={!!likedMap[profile.id]}
            likeCount={likeCounts[profile.id]}
            comments={commentsMap[profile.id]}
            onToggleLike={() => toggleLike(profile.id)}
            onOpenComments={() => setOpenComments(profile.id)}
            onMessage={() => navigate(`/messages/${profile.id}`)}
          />
        ))}
      </div>

      {activeProfile && (
        <CommentsSheet
          profile={activeProfile}
          comments={commentsMap[activeProfile.id]}
          onAdd={(text) => addComment(activeProfile.id, text)}
          onClose={() => setOpenComments(null)}
        />
      )}
    </MobileShell>
  );
}
