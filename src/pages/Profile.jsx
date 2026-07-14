import React, { useEffect, useMemo, useRef, useState } from "react";
import { Settings, Plus, X, Play, Pencil, Flame, Heart, MessageCircle, Briefcase, GraduationCap, MapPin, Ruler, Sparkles, Languages as LanguagesIcon, Check, LogOut } from "lucide-react";
import MobileShell from "../components/MobileShell.jsx";
import { LANGUAGES } from "../data/languages.js";
import { api } from "../lib/api.js";
import { useAuth } from "../context/AuthContext.jsx";

const MAX_VIDEO_SECONDS = 90;
const MAX_SLOTS = 6;
const MAX_LANGUAGES = 10;

const GENDER_OPTIONS = ["Woman", "Man", "Non-binary", "Prefer not to say"];
const LOOKING_FOR_OPTIONS = ["Long-term relationship", "Something casual", "New friends", "Not sure yet"];

function LanguagePickerSheet({ selected, onSave, onClose }) {
  const [draft, setDraft] = useState(selected);
  const [query, setQuery] = useState("");
  const filtered = LANGUAGES.filter((l) => l.toLowerCase().includes(query.toLowerCase()));

  const toggle = (lang) => {
    setDraft((prev) => {
      if (prev.includes(lang)) return prev.filter((l) => l !== lang);
      if (prev.length >= MAX_LANGUAGES) return prev;
      return [...prev, lang];
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60" onClick={onClose}>
      <div className="w-full max-w-[420px] bg-grape rounded-t-3xl border-t border-white/10 flex flex-col max-h-[85%]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 pt-4 pb-2 shrink-0">
          <div>
            <h3 className="font-fredoka text-lg text-cream">Languages</h3>
            <p className="font-jakarta text-xs text-cream/40 mt-0.5">{draft.length}/{MAX_LANGUAGES} selected</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
            <X className="w-4 h-4 text-cream" />
          </button>
        </div>
        <div className="px-5 pb-2 shrink-0">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search languages..."
            className="w-full bg-white/10 rounded-full px-4 py-2.5 text-sm text-cream placeholder:text-cream/40 outline-none font-jakarta border border-white/10"
          />
        </div>
        <div className="flex-1 overflow-y-auto scroll-thin px-5 py-2">
          {filtered.map((lang) => {
            const isChecked = draft.includes(lang);
            const disabled = !isChecked && draft.length >= MAX_LANGUAGES;
            return (
              <button key={lang} onClick={() => toggle(lang)} disabled={disabled} className="w-full flex items-center justify-between py-3 border-b border-white/5 last:border-0 disabled:opacity-30">
                <span className="font-jakarta text-sm text-cream">{lang}</span>
                <span className={`w-5 h-5 rounded-md border flex items-center justify-center ${isChecked ? "bg-gradient-to-br from-coral to-gold border-transparent" : "border-white/20"}`}>
                  {isChecked && <Check className="w-3.5 h-3.5 text-white" />}
                </span>
              </button>
            );
          })}
        </div>
        <div className="px-5 py-4 shrink-0">
          <button
            onClick={() => {
              onSave(draft);
              onClose();
            }}
            className="w-full bg-gradient-to-br from-coral to-gold text-white font-jakarta font-bold text-sm py-3.5 rounded-2xl"
          >
            Save languages
          </button>
        </div>
      </div>
    </div>
  );
}

function EditableField({ icon: Icon, label, value, placeholder, onSave, type = "text", options }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value || "");

  useEffect(() => setDraft(value || ""), [value]);

  const commit = () => {
    if (draft.trim() !== (value || "")) onSave(draft.trim());
    setEditing(false);
  };

  return (
    <div className="flex items-center gap-3 py-3 border-b border-white/5 last:border-0">
      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-gold" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-jakarta text-[11px] text-cream/40">{label}</p>
        {editing ? (
          type === "select" ? (
            <select autoFocus value={draft} onChange={(e) => setDraft(e.target.value)} onBlur={commit} className="w-full bg-transparent outline-none text-sm text-cream font-jakarta font-semibold mt-0.5 [color-scheme:dark]">
              <option value="" disabled>Select...</option>
              {options.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          ) : (
            <input
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commit}
              onKeyDown={(e) => e.key === "Enter" && commit()}
              placeholder={placeholder}
              className="w-full bg-transparent outline-none text-sm text-cream font-jakarta font-semibold mt-0.5 placeholder:text-cream/30 placeholder:font-normal"
            />
          )
        ) : (
          <p onClick={() => setEditing(true)} className={`text-sm font-jakarta mt-0.5 ${value ? "text-cream font-semibold" : "text-cream/30"}`}>
            {value || placeholder}
          </p>
        )}
      </div>
      <button onClick={() => setEditing(true)} className="text-gold shrink-0">
        <Pencil className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export default function Profile() {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingBio, setEditingBio] = useState(false);
  const [bioDraft, setBioDraft] = useState("");
  const [newTag, setNewTag] = useState("");
  const [showLanguagePicker, setShowLanguagePicker] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    api
      .myProfile()
      .then(({ profile }) => {
        setProfile(profile);
        setBioDraft(profile.bio || "");
      })
      .finally(() => setLoading(false));
  }, []);

  const patch = async (fields) => {
    setProfile((p) => ({ ...p, ...fields }));
    try {
      const { profile: updated } = await api.updateMyProfile(fields);
      setProfile(updated);
    } catch (err) {
      setError(err.message);
    }
  };

  const addTag = () => {
    const t = newTag.trim();
    if (!t || profile.tags.includes(t) || profile.tags.length >= 6) return;
    patch({ tags: [...profile.tags, t] });
    setNewTag("");
  };
  const removeTag = (t) => patch({ tags: profile.tags.filter((x) => x !== t) });

  const handleFiles = async (fileList) => {
    setError("");
    const files = Array.from(fileList).slice(0, MAX_SLOTS - profile.media.length);
    setUploading(true);
    for (const file of files) {
      try {
        const { media } = await api.uploadMedia(file);
        setProfile((p) => ({ ...p, media: [...p.media, media] }));
      } catch (err) {
        setError(err.message);
      }
    }
    setUploading(false);
  };

  const removeMedia = async (id) => {
    setProfile((p) => ({ ...p, media: p.media.filter((m) => m.id !== id) }));
    try {
      await api.deleteMedia(id);
    } catch (err) {
      setError(err.message);
    }
  };

  const completion = useMemo(() => {
    if (!profile) return 0;
    const checks = [
      profile.media.length > 0,
      profile.media.length >= 3,
      profile.bio?.trim().length > 20,
      profile.tags.length >= 3,
      !!profile.gender,
      !!profile.location,
      !!profile.occupation,
      !!profile.education,
      !!profile.height,
      !!profile.lookingFor,
      profile.languages.length > 0,
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [profile]);

  if (loading || !profile) {
    return (
      <MobileShell header={<header className="px-5 pt-5 pb-2 shrink-0"><h1 className="font-fredoka text-2xl text-cream">My Profile</h1></header>}>
        <div className="flex-1 flex items-center justify-center">
          <span className="font-jakarta text-sm text-cream/50">Loading your profile...</span>
        </div>
      </MobileShell>
    );
  }

  return (
    <MobileShell
      header={
        <header className="flex items-center justify-between px-5 pt-5 pb-2 shrink-0">
          <h1 className="font-fredoka text-2xl text-cream">My Profile</h1>
          <button onClick={logout} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/10">
            <LogOut className="w-4 h-4 text-cream" />
          </button>
        </header>
      }
    >
      <div className="flex-1 overflow-y-auto scroll-thin px-5 pb-8">
        <div className="flex items-center gap-4 mt-2">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-coral to-gold p-[3px]">
            <div className="w-full h-full rounded-[22px] bg-grape overflow-hidden flex items-center justify-center">
              {profile.media[0] ? (
                profile.media[0].type === "photo" ? (
                  <img src={profile.media[0].url} className="w-full h-full object-cover" alt="You" />
                ) : (
                  <video src={profile.media[0].url} className="w-full h-full object-cover" muted />
                )
              ) : (
                <span className="font-fredoka text-3xl text-cream/40">?</span>
              )}
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="font-fredoka text-xl text-cream">{profile.name}</h2>
              {profile.age && <span className="font-jakarta text-cream/70">{profile.age}</span>}
            </div>
            <div className="flex items-center gap-2 mt-1.5">
              <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-coral to-gold transition-all" style={{ width: `${completion}%` }} />
              </div>
              <span className="font-jakarta text-xs font-bold text-mint shrink-0">{completion}%</span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <h3 className="font-jakarta font-bold text-cream text-sm">Photos &amp; clips</h3>
          <span className="font-jakarta text-xs text-cream/40">{profile.media.length}/{MAX_SLOTS} · clips up to {MAX_VIDEO_SECONDS}s</span>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-2">
          {profile.media.map((m) => (
            <div key={m.id} className="relative aspect-[3/4] rounded-xl overflow-hidden bg-grape group">
              {m.type === "photo" ? (
                <img src={m.url} className="w-full h-full object-cover" alt="upload" />
              ) : (
                <>
                  <video src={m.url} className="w-full h-full object-cover" muted />
                  <span className="absolute bottom-1 left-1 flex items-center gap-0.5 bg-black/60 rounded-full px-1.5 py-0.5">
                    <Play className="w-2.5 h-2.5 text-white fill-white" />
                    {m.duration && <span className="text-[9px] text-white font-jakarta font-semibold">{m.duration}s</span>}
                  </span>
                </>
              )}
              <button onClick={() => removeMedia(m.id)} className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center">
                <X className="w-3 h-3 text-white" />
              </button>
              {!m.approved && (
                <span className="absolute bottom-1 right-1 bg-gold text-ink text-[8px] font-bold px-1.5 py-0.5 rounded-full">Pending review</span>
              )}
            </div>
          ))}
          {profile.media.length < MAX_SLOTS && (
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="aspect-[3/4] rounded-xl border-2 border-dashed border-white/20 flex flex-col items-center justify-center gap-1 text-cream/40 hover:border-coral hover:text-coral transition-colors disabled:opacity-50"
            >
              <Plus className="w-5 h-5" />
              <span className="font-jakarta text-[10px] font-semibold">{uploading ? "Uploading..." : "Add"}</span>
            </button>
          )}
        </div>
        <input ref={fileInputRef} type="file" accept="image/*,video/*" multiple hidden onChange={(e) => e.target.files && handleFiles(e.target.files)} />
        {error && <p className="font-jakarta text-xs text-coral mt-2">{error}</p>}

        <div className="mt-6">
          <div className="flex items-center justify-between">
            <h3 className="font-jakarta font-bold text-cream text-sm">About me</h3>
            <button onClick={() => setEditingBio((v) => !v)} className="text-gold">
              <Pencil className="w-3.5 h-3.5" />
            </button>
          </div>
          {editingBio ? (
            <textarea
              value={bioDraft}
              onChange={(e) => setBioDraft(e.target.value)}
              onBlur={() => {
                setEditingBio(false);
                if (bioDraft !== profile.bio) patch({ bio: bioDraft });
              }}
              autoFocus
              maxLength={280}
              rows={4}
              placeholder="Tell people what makes you, you."
              className="w-full mt-2 bg-grape rounded-2xl p-3 text-sm text-cream font-jakarta outline-none border border-white/10 resize-none"
            />
          ) : (
            <p className="font-jakarta text-sm text-cream/70 mt-2 leading-relaxed">{profile.bio || "Tell people what makes you, you."}</p>
          )}
        </div>

        <div className="mt-6">
          <h3 className="font-jakarta font-bold text-cream text-sm mb-1">Basic details</h3>
          <div className="bg-grape rounded-2xl px-4 border border-white/10">
            <EditableField icon={Sparkles} label="Gender" value={profile.gender} placeholder="Add gender" type="select" options={GENDER_OPTIONS} onSave={(v) => patch({ gender: v })} />
            <EditableField icon={MapPin} label="Location" value={profile.location} placeholder="Add your city" onSave={(v) => patch({ location: v })} />
            <EditableField icon={Briefcase} label="Occupation" value={profile.occupation} placeholder="What do you do?" onSave={(v) => patch({ occupation: v })} />
            <EditableField icon={GraduationCap} label="Education" value={profile.education} placeholder="School or degree" onSave={(v) => patch({ education: v })} />
            <EditableField icon={Ruler} label="Height" value={profile.height} placeholder={`e.g. 5'8" or 173 cm`} onSave={(v) => patch({ height: v })} />
            <EditableField icon={Heart} label="Looking for" value={profile.lookingFor} placeholder="Add what you're looking for" type="select" options={LOOKING_FOR_OPTIONS} onSave={(v) => patch({ lookingFor: v })} />
          </div>
        </div>

        <div className="mt-6">
          <h3 className="font-jakarta font-bold text-cream text-sm flex items-center gap-1.5">
            <LanguagesIcon className="w-3.5 h-3.5 text-gold" /> Languages
          </h3>
          <div className="flex flex-wrap gap-2 mt-2">
            {profile.languages.map((l) => (
              <span key={l} className="flex items-center gap-1.5 font-jakarta text-xs font-semibold px-3 py-1.5 rounded-full bg-white/10 text-cream border border-white/15">
                {l}
                <button onClick={() => patch({ languages: profile.languages.filter((x) => x !== l) })}>
                  <X className="w-3 h-3 text-cream/50" />
                </button>
              </span>
            ))}
            <button onClick={() => setShowLanguagePicker(true)} className="flex items-center gap-1 font-jakarta text-xs font-semibold px-3 py-1.5 rounded-full bg-white/5 text-gold border border-white/10">
              <Plus className="w-3 h-3" /> {profile.languages.length ? "Edit" : "Add"} languages
            </button>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="font-jakarta font-bold text-cream text-sm">Interests</h3>
          <div className="flex flex-wrap gap-2 mt-2">
            {profile.tags.map((t) => (
              <span key={t} className="flex items-center gap-1.5 font-jakarta text-xs font-semibold px-3 py-1.5 rounded-full bg-white/10 text-cream border border-white/15">
                {t}
                <button onClick={() => removeTag(t)}>
                  <X className="w-3 h-3 text-cream/50" />
                </button>
              </span>
            ))}
            {profile.tags.length < 6 && (
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

        <div className="mt-6 grid grid-cols-3 gap-2">
          {[
            { icon: Heart, label: "Likes", value: profile.likeCount ?? 0 },
            { icon: Flame, label: "Matches", value: 0 },
            { icon: MessageCircle, label: "Chats", value: 0 },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="bg-grape rounded-2xl p-3 flex flex-col items-center border border-white/10">
              <Icon className="w-4 h-4 text-coral mb-1" />
              <span className="font-fredoka text-lg text-cream">{value}</span>
              <span className="font-jakarta text-[10px] text-cream/50">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {showLanguagePicker && (
        <LanguagePickerSheet selected={profile.languages} onSave={(langs) => patch({ languages: langs })} onClose={() => setShowLanguagePicker(false)} />
      )}
    </MobileShell>
  );
}
