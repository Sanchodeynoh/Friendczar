import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  Heart,
  Send,
  MapPin,
  Briefcase,
  GraduationCap,
  Ruler,
  Sparkles,
  Languages as LanguagesIcon,
  Play,
  X,
  Flag,
} from "lucide-react";
import { api } from "../lib/api.js";

function LightboxItem({ item, onClose }) {
  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
      <button onClick={onClose} className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center z-10">
        <X className="w-5 h-5 text-white" />
      </button>
      {item.type === "photo" ? (
        <img src={item.url} alt="" className="max-w-full max-h-full object-contain" />
      ) : (
        <video src={item.url} controls autoPlay className="max-w-full max-h-full object-contain" />
      )}
    </div>
  );
}

function ReportSheet({ onSubmit, onClose }) {
  const [reason, setReason] = useState("");
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60" onClick={onClose}>
      <div className="w-full max-w-[420px] bg-grape rounded-t-3xl border-t border-white/10 p-5" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-fredoka text-lg text-cream mb-3">Report this profile</h3>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="What's wrong with this profile?"
          rows={3}
          className="w-full bg-white/10 rounded-2xl p-3 text-sm text-cream placeholder:text-cream/40 outline-none font-jakarta border border-white/10 resize-none"
        />
        <button
          onClick={() => reason.trim() && onSubmit(reason.trim())}
          className="w-full mt-3 bg-coral text-white font-jakarta font-bold text-sm py-3 rounded-2xl"
        >
          Submit report
        </button>
      </div>
    </div>
  );
}

export default function UserProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lightbox, setLightbox] = useState(null);
  const [showReport, setShowReport] = useState(false);
  const [reportSent, setReportSent] = useState(false);

  useEffect(() => {
    setLoading(true);
    api
      .getProfile(userId)
      .then(({ profile }) => setProfile(profile))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [userId]);

  useEffect(() => {
    if (!reportSent) return;
    const t = setTimeout(() => setReportSent(false), 3000);
    return () => clearTimeout(t);
  }, [reportSent]);

  const toggleLike = async () => {
    setProfile((p) => ({ ...p, likedByMe: !p.likedByMe, likeCount: p.likeCount + (p.likedByMe ? -1 : 1) }));
    try {
      await api.toggleLike(userId);
    } catch (err) {
      console.error(err);
    }
  };

  const submitReport = async (reason) => {
    try {
      await api.fileReport(userId, reason);
      setReportSent(true);
      setShowReport(false);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-ink">
        <span className="font-jakarta text-sm text-cream/50">Loading profile...</span>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-ink px-8 text-center">
        <p className="font-fredoka text-2xl text-cream">Profile not found</p>
        <button onClick={() => navigate("/discover")} className="mt-4 font-jakarta text-sm text-gold font-bold">
          Back to Discover
        </button>
      </div>
    );
  }

  const details = [
    { icon: Sparkles, label: "Gender", value: profile.gender },
    { icon: MapPin, label: "Location", value: profile.location },
    { icon: Briefcase, label: "Occupation", value: profile.occupation },
    { icon: GraduationCap, label: "Education", value: profile.education },
    { icon: Ruler, label: "Height", value: profile.height },
    { icon: Heart, label: "Looking for", value: profile.lookingFor },
  ];

  const gallery = profile.media || [];
  const hero = gallery[0] || (profile.avatarUrl ? { type: "photo", url: profile.avatarUrl } : null);

  return (
    <div className="w-full h-[100dvh] flex justify-center bg-ink overflow-hidden">
      <div className="w-full max-w-[420px] flex flex-col h-full">
        <header className="flex items-center justify-between gap-3 px-4 pt-5 pb-3 shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
              <ChevronLeft className="w-5 h-5 text-cream" />
            </button>
            <h1 className="font-fredoka text-xl text-cream">{profile.name}'s profile</h1>
          </div>
          <button onClick={() => setShowReport(true)} className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
            <Flag className="w-4 h-4 text-cream/60" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto scroll-thin pb-24">
          <div className="relative aspect-[4/5] w-full bg-grape">
            {hero ? (
              <img src={hero.type === "photo" ? hero.url : hero.url} alt={profile.name} className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-fredoka text-5xl text-cream/20">?</span>
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-ink to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5">
              <div className="flex items-baseline gap-2">
                <h2 className="font-fredoka text-3xl text-cream leading-none">{profile.name}</h2>
                {profile.age && <span className="font-jakarta text-xl text-cream/90">{profile.age}</span>}
              </div>
              {profile.location && (
                <div className="flex items-center gap-1 mt-1.5 text-gold">
                  <MapPin className="w-3.5 h-3.5" />
                  <span className="font-jakarta text-xs font-medium">{profile.location}</span>
                </div>
              )}
            </div>
          </div>

          <div className="px-5">
            {profile.bio && <p className="font-jakarta text-sm text-cream/80 leading-relaxed mt-4">{profile.bio}</p>}

            {profile.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {profile.tags.map((tag) => (
                  <span key={tag} className="font-jakarta text-[11px] font-semibold px-2.5 py-1 rounded-full bg-white/10 text-cream border border-white/15">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-6 bg-grape rounded-2xl px-4 border border-white/10">
              {details.map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-3 py-3 border-b border-white/5 last:border-0">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-gold" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-jakarta text-[11px] text-cream/40">{label}</p>
                    <p className="font-jakarta text-sm font-semibold text-cream mt-0.5">{value || "Not shared"}</p>
                  </div>
                </div>
              ))}
            </div>

            {profile.languages?.length > 0 && (
              <div className="mt-6">
                <h3 className="font-jakarta font-bold text-cream text-sm flex items-center gap-1.5">
                  <LanguagesIcon className="w-3.5 h-3.5 text-gold" /> Speaks
                </h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  {profile.languages.map((l) => (
                    <span key={l} className="font-jakarta text-xs font-semibold px-3 py-1.5 rounded-full bg-white/10 text-cream border border-white/15">
                      {l}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6">
              <h3 className="font-jakarta font-bold text-cream text-sm">Photos &amp; clips</h3>
              {gallery.length === 0 ? (
                <p className="font-jakarta text-sm text-cream/40 mt-2">No photos or clips uploaded yet.</p>
              ) : (
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {gallery.map((item) => (
                    <button key={item.id} onClick={() => setLightbox(item)} className="relative aspect-[3/4] rounded-xl overflow-hidden bg-white/5">
                      <img src={item.url} alt="" className="w-full h-full object-cover" />
                      {item.type === "video" && (
                        <span className="absolute inset-0 flex items-center justify-center bg-black/20">
                          <Play className="w-5 h-5 text-white fill-white" />
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 inset-x-0 flex items-center gap-3 px-5 py-4 bg-gradient-to-t from-ink via-ink/95 to-transparent">
          <button
            onClick={toggleLike}
            className={`w-14 h-14 rounded-full flex items-center justify-center border ${profile.likedByMe ? "bg-coral border-coral" : "bg-grape border-white/10"}`}
          >
            <Heart className="w-6 h-6 text-white" fill={profile.likedByMe ? "white" : "none"} />
          </button>
          <button
            onClick={() => navigate(`/messages/${profile.id}`)}
            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-br from-coral to-gold text-white font-jakarta font-bold text-sm py-4 rounded-full"
          >
            <Send className="w-4 h-4" /> Message {profile.name}
          </button>
        </div>
      </div>

      {lightbox && <LightboxItem item={lightbox} onClose={() => setLightbox(null)} />}
      {showReport && <ReportSheet onSubmit={submitReport} onClose={() => setShowReport(false)} />}
      {reportSent && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-grape border border-white/10 text-cream font-jakarta text-xs font-semibold px-4 py-2 rounded-full shadow-lg z-50">
          Report submitted — our team will review it.
        </div>
      )}
    </div>
  );
}
