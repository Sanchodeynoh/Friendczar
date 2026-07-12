import React, { useRef, useState } from "react";
import { Settings, Plus, X, Play, Pencil, Flame, Heart } from "lucide-react";

const PINK = "#FF5D73";
const BG = "#0B0414";
const CARD = "#1A0E2A";

export default function Profile() {
  const [editing, setEditing] = useState(false);
  const [photos, setPhotos] = useState([
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=80",
    "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=800&q=80",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&q=80",
  ]);
  const [name, setName] = useState("Olivia");
  const [age, setAge] = useState("24");
  const [bio, setBio] = useState(
    "Adventure lover ✈️ | Coffee addict ☕ | Looking for genuine connections ❤️"
  );

  const fileInputRef = useRef(null);

  const addPhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPhotos((prev) => [...prev, url].slice(0, 6));
  };

  return (
    <div className="flex flex-col h-full bg-[var(--bg)] text-[#FFF8F0]">
      {/* Header */}
      <header className="flex items-center justify-between px-5 pt-6 pb-4">
        <h1 className="text-xl font-bold">Profile</h1>
        <button className="p-2 rounded-full bg-white/5">
          <Settings className="w-5 h-5" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-5 pb-28">
        {/* Photos */}
        <div className="grid grid-cols-3 gap-2">
          {photos.map((src, idx) => (
            <div
              key={idx}
              className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-white/10"
            >
              <img
                src={src}
                alt=""
                className="w-full h-full object-cover"
              />
              {editing && (
                <button
                  onClick={() =>
                    setPhotos((prev) => prev.filter((_, i) => i !== idx))
                  }
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}

          {photos.length < 6 && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="aspect-[3/4] rounded-2xl border border-dashed border-white/20 flex items-center justify-center"
            >
              <Plus className="w-7 h-7 opacity-70" />
            </button>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={addPhoto}
        />

        {/* Name */}
        <div className="mt-6">
          {editing ? (
            <div className="flex gap-2">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex-1 bg-white/10 rounded-xl px-3 py-2 outline-none"
              />
              <input
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-20 bg-white/10 rounded-xl px-3 py-2 outline-none"
              />
            </div>
          ) : (
            <h2 className="text-3xl font-bold">
              {name}, {age}
            </h2>
          )}
        </div>

        {/* Bio */}
        <div className="mt-5">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">About me</h3>
            <button
              onClick={() => setEditing((v) => !v)}
              className="p-2 rounded-full bg-white/5"
            >
              <Pencil className="w-4 h-4" />
            </button>
          </div>          {editing ? (
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              className="w-full mt-3 bg-white/10 rounded-2xl px-4 py-3 outline-none resize-none"
            />
          ) : (
            <p className="mt-3 text-sm leading-6 text-white/75">{bio}</p>
          )}
        </div>

        {/* Interests */}
        <div className="mt-8">
          <h3 className="font-semibold text-lg mb-3">Interests</h3>
          <div className="flex flex-wrap gap-2">
            {[
              "Travel",
              "Music",
              "Fitness",
              "Movies",
              "Gaming",
              "Food",
              "Photography",
              "Hiking",
            ].map((item) => (
              <div
                key={item}
                className="px-4 py-2 rounded-full bg-white/10 text-sm"
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mt-8">
          <div className="rounded-3xl bg-white/5 p-5">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-[#FF5D73]" />
              <span className="text-white/70 text-sm">Likes</span>
            </div>
            <p className="text-2xl font-bold mt-2">2.8k</p>
          </div>

          <div className="rounded-3xl bg-white/5 p-5">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-[#FF5D73]" />
              <span className="text-white/70 text-sm">Matches</span>
            </div>
            <p className="text-2xl font-bold mt-2">487</p>
          </div>
        </div>

        {/* Videos */}
        <div className="mt-8">
          <h3 className="font-semibold text-lg mb-3">Videos</h3>

          <div className="grid grid-cols-2 gap-3">
            {[1, 2].map((item) => (
              <div
                key={item}
                className="relative aspect-[9/16] rounded-3xl overflow-hidden bg-white/10"
              >
                <img
                  src={`https://picsum.photos/400/700?random=${item}`}
                  alt=""
                  className="w-full h-full object-cover"
                />

                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <div className="w-14 h-14 rounded-full bg-white/80 flex items-center justify-center">
                    <Play
                      className="w-6 h-6 ml-1"
                      fill="#111"
                      strokeWidth={0}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
