import React, { useState } from "react";
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
} from "lucide-react";
import { getProfile } from "../data/profiles.js";

function LightboxItem({ item, onClose }) {
  const [playing, setPlaying] = useState(false);
  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
      <button onClick={onClose} className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center z-10">
        <X className="w-5 h-5 text-white" />
      </button>
      {item.type === "photo" ? (
        <img src={item.src} alt="" className="max-w-full max-h-full object-contain" />
      ) : (
        <video src={item.src} poster={item.poster} controls autoPlay className="max-w-full max-h-full object-contain" />
      )}
    </div>
  );
}

export default function UserProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const profile = getProfile(userId);
  const [liked, setLiked] = useState(false);
  const [lightbox, setLightbox] = useState(null);

  if (!profile) {
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

  return (
    <div className="w-full h-[100dvh] flex justify-center bg-ink overflow-hidden">
      <div className="w-full max-w-[420px] flex flex-col h-full">
        <header className="flex items-center gap-3 px-4 pt-5 pb-3 shrink-0">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
            <ChevronLeft className="w-5 h-5 text-cream" />
          </button>
          <h1 className="font-fredoka text-xl text-cream">{profile.name}'s profile</h1>
        </header>

        <div className="flex-1 overflow-y-auto scroll-thin pb-24">
          {/* Hero */}
          <div className="relative aspect-[4/5] w-full">
            {profile.gallery[0].type === "photo" ? (
              <img src={profile.gallery[0].src} alt={profile.name} className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <img src={profile.gallery[0].poster} alt={profile.name} className="absolute inset-0 w-full h-full object-cover" />
            )}
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-ink to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5">
              <div className="flex items-baseline gap-2">
                <h2 className="font-fredoka text-3xl text-cream leading-none">{profile.name}</h2>
                <span className="font-jakarta text-xl text-cream/90">{profile.age}</span>
              </div>
              <div className="flex items-center gap-1 mt-1.5 text-gold">
                <MapPin className="w-3.5 h-3.5" />
                <span className="font-jakarta text-xs font-medium">{profile.location} · {profile.distanceKm} km away</span>
              </div>
            </div>
          </div>

          <div className="px-5">
            {/* Bio */}
            <p className="font-jakarta text-sm text-cream/80 leading-relaxed mt-4">{profile.bio}</p>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 mt-3">
              {profile.tags.map((tag) => (
                <span key={tag} className="font-jakarta text-[11px] font-semibold px-2.5 py-1 rounded-full bg-white/10 text-cream border border-white/15">
                  {tag}
                </span>
              ))}
            </div>

            {/* Details */}
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

            {/* Languages */}
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

            {/* Gallery */}
            <div className="mt-6">
              <h3 className="font-jakarta font-bold text-cream text-sm">Photos &amp; clips</h3>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {profile.gallery.map((item, i) => (
                  <button key={i} onClick={() => setLightbox(item)} className="relative aspect-[3/4] rounded-xl overflow-hidden bg-white/5">
                    <img src={item.type === "photo" ? item.src : item.poster} alt="" className="w-full h-full object-cover" />
                    {item.type === "video" && (
                      <span className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <Play className="w-5 h-5 text-white fill-white" />
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sticky actions */}
        <div className="absolute bottom-0 inset-x-0 flex items-center gap-3 px-5 py-4 bg-gradient-to-t from-ink via-ink/95 to-transparent">
          <button
            onClick={() => setLiked((v) => !v)}
            className={`w-14 h-14 rounded-full flex items-center justify-center border ${liked ? "bg-coral border-coral" : "bg-grape border-white/10"}`}
          >
            <Heart className="w-6 h-6 text-white" fill={liked ? "white" : "none"} />
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
    </div>
  );
}
