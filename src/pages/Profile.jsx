import React, { useRef, useState } from "react";
import { Settings, Plus, X, Play, Pencil, Flame, Heart, MessageCircle } from "lucide-react";
import MobileShell from "../components/MobileShell.jsx";

const MAX_VIDEO_SECONDS = 90;
const MAX_SLOTS = 6;

export default function Profile() {
  const [name] = useState("You");
  const [age] = useState(27);
  const [bio, setBio] = useState("Tell people what makes you, you. Add your favorite hobbies, a fun fact, or your go-to karaoke song.");
  const [editingBio, setEditingBio] = useState(false);
  const [tags, setTags] = useState(["Photography", "Hiking", "Coffee"]);
  const [newTag, setNewTag] = useState("");
  const [media, setMedia] = useState([]); // { id, type, url, duration? }
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const addTag = () => {
    const t = newTag.trim();
    if (!t || tags.includes(t) || tags.length >= 6) return;
    setTags((prev) => [...prev, t]);
    setNewTag("");
  };

  const removeTag = (t) => setTags((prev) => prev.filter((x) => x !== t));

  const handleFiles = (fileList) => {
    setError("");
    const files = Array.from(fileList).slice(0, MAX_SLOTS - media.length);
    files.forEach((file) => {
      const isVideo = file.type.startsWith("video/");
      const url = URL.createObjectURL(file);

      if (isVideo) {
        const probe = document.createElement("video");
        probe.preload = "metadata";
        probe.src = url;
        probe.onloadedmetadata = () => {
          if (probe.duration > MAX_VIDEO_SECONDS) {
            setError(`Videos must be ${MAX_VIDEO_SECONDS}s or shorter. "${file.name}" is ${Math.round(probe.duration)}s.`);
            URL.revokeObjectURL(url);
            return;
          }
          setMedia((prev) => [...prev, { id: crypto.randomUUID(), type: "video", url, duration: Math.round(probe.duration) }]);
        };
      } else {
        setMedia((prev) => [...prev, { id: crypto.randomUUID(), type: "photo", url }]);
      }
    });
  };

  const removeMedia = (id) => setMedia((prev) => prev.filter((m) => m.id !== id));

  return (
    <MobileShell
      header={
        <header className="flex items-center justify-between px-5 pt-5 pb-2 shrink-0">
          <h1 className="font-fredoka text-2xl text-cream">My Profile</h1>
          <button className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/10">
            <Settings className="w-4 h-4 text-cream" />
          </button>
        </header>
      }
    >
      <div className="flex-1 overflow-y-auto scroll-thin px-5 pb-6">
        {/* Identity block */}
        <div className="flex items-center gap-4 mt-2">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-coral to-gold p-[3px]">
            <div className="w-full h-full rounded-[22px] bg-grape overflow-hidden flex items-center justify-center">
              {media[0] ? (
                media[0].type === "photo" ? (
                  <img src={media[0].url} className="w-full h-full object-cover" alt="You" />
                ) : (
                  <video src={media[0].url} className="w-full h-full object-cover" muted />
                )
              ) : (
                <span className="font-fredoka text-3xl text-cream/40">?</span>
              )}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-fredoka text-xl text-cream">{name}</h2>
              <span className="font-jakarta text-cream/70">{age}</span>
            </div>
            <span className="font-jakarta text-xs text-mint font-semibold">Profile 80% complete</span>
          </div>
        </div>

        {/* Photo / video grid */}
        <div className="mt-6 flex items-center justify-between">
          <h3 className="font-jakarta font-bold text-cream text-sm">Photos &amp; clips</h3>
          <span className="font-jakarta text-xs text-cream/40">{media.length}/{MAX_SLOTS} · clips up to {MAX_VIDEO_SECONDS}s</span>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-2">
          {media.map((m) => (
            <div key={m.id} className="relative aspect-[3/4] rounded-xl overflow-hidden bg-grape group">
              {m.type === "photo" ? (
                <img src={m.url} className="w-full h-full object-cover" alt="upload" />
              ) : (
                <>
                  <video src={m.url} className="w-full h-full object-cover" muted />
                  <span className="absolute bottom-1 left-1 flex items-center gap-0.5 bg-black/60 rounded-full px-1.5 py-0.5">
                    <Play className="w-2.5 h-2.5 text-white fill-white" />
                    <span className="text-[9px] text-white font-jakarta font-semibold">{m.duration}s</span>
                  </span>
                </>
              )}
              <button
                onClick={() => removeMedia(m.id)}
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center"
              >
                <X className="w-3 h-3 text-white" />
              </button>
            </div>
          ))}
          {media.length < MAX_SLOTS && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="aspect-[3/4] rounded-xl border-2 border-dashed border-white/20 flex flex-col items-center justify-center gap-1 text-cream/40 hover:border-coral hover:text-coral transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span className="font-jakarta text-[10px] font-semibold">Add</span>
            </button>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          hidden
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
        {error && <p className="font-jakarta text-xs text-coral mt-2">{error}</p>}

        {/* Bio */}
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <h3 className="font-jakarta font-bold text-cream text-sm">About me</h3>
            <button onClick={() => setEditingBio((v) => !v)} className="text-gold">
              <Pencil className="w-3.5 h-3.5" />
            </button>
          </div>
          {editingBio ? (
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              onBlur={() => setEditingBio(false)}
              autoFocus
              maxLength={280}
              rows={4}
              className="w-full mt-2 bg-grape rounded-2xl p-3 text-sm text-cream font-jakarta outline-none border border-white/10 resize-none"
            />
          ) : (
            <p className="font-jakarta text-sm text-cream/70 mt-2 leading-relaxed">{bio}</p>
          )}
        </div>

        {/* Interests */}
        <div className="mt-6">
          <h3 className="font-jakarta font-bold text-cream text-sm">Interests</h3>
          <div className="flex flex-wrap gap-2 mt-2">
            {tags.map((t) => (
              <span
                key={t}
                className="flex items-center gap-1.5 font-jakarta text-xs font-semibold px-3 py-1.5 rounded-full bg-white/10 text-cream border border-white/15"
              >
                {t}
                <button onClick={() => removeTag(t)}>
                  <X className="w-3 h-3 text-cream/50" />
                </button>
              </span>
            ))}
            {tags.length < 6 && (
              <div className="flex items-center gap-1 bg-white/5 rounded-full px-3 py-1.5 border border-white/10">
                <input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addTag()}
                  placeholder="Add interest"
                  className="bg-transparent outline-none text-xs text-cream placeholder:text-cream/40 font-jakarta w-24"
                />
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-3 gap-2">
          {[
            { icon: Heart, label: "Likes", value: 214 },
            { icon: Flame, label: "Matches", value: 38 },
            { icon: MessageCircle, label: "Chats", value: 12 },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="bg-grape rounded-2xl p-3 flex flex-col items-center border border-white/10">
              <Icon className="w-4 h-4 text-coral mb-1" />
              <span className="font-fredoka text-lg text-cream">{value}</span>
              <span className="font-jakarta text-[10px] text-cream/50">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </MobileShell>
  );
}
