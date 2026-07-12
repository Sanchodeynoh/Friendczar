import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Flame, Mail, Lock, User, Calendar, ArrowRight } from "lucide-react";

const STOCK_FACES = [
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&q=80",
  "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&q=80",
  "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=300&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&q=80",
];

export default function Landing() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("signup"); // signup | login

  const submit = (e) => {
    e.preventDefault();
    // No backend yet — jump straight into the app.
    navigate("/discover");
  };

  return (
    <div className="min-h-screen w-full flex justify-center bg-ink overflow-y-auto">
      <div className="w-full max-w-[420px] px-6 pt-10 pb-12">
        {/* Hero */}
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-coral to-gold flex items-center justify-center rotate-[-6deg]">
            <Flame className="w-5 h-5 text-white" fill="white" strokeWidth={0} />
          </div>
          <span className="font-fredoka text-3xl text-cream tracking-tight">friendczar</span>
        </div>

        <h1 className="font-fredoka text-[40px] leading-[1.05] text-cream mt-8">
          Meet people who <span className="text-transparent bg-clip-text bg-gradient-to-r from-coral to-gold">actually</span> click.
        </h1>
        <p className="font-jakarta text-sm text-cream/60 mt-3 leading-relaxed">
          Photos, 90-second clips, real conversations. Swipe through nearby people, match, and message — no games, no algorithms pretending to know you better than you do.
        </p>

        {/* floating faces strip */}
        <div className="flex -space-x-3 mt-6">
          {STOCK_FACES.map((src, i) => (
            <img
              key={src}
              src={src}
              alt=""
              className="w-11 h-11 rounded-2xl object-cover border-2 border-ink shadow-lg"
              style={{ transform: `rotate(${i % 2 === 0 ? -6 : 6}deg)`, zIndex: STOCK_FACES.length - i }}
            />
          ))}
          <div className="w-11 h-11 rounded-2xl bg-grape border-2 border-ink flex items-center justify-center">
            <span className="font-jakarta text-[11px] font-bold text-mint">+2k</span>
          </div>
        </div>

        {/* Mode toggle */}
        <div className="mt-9 flex bg-grape rounded-full p-1 border border-white/10">
          {["signup", "login"].map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 py-2.5 rounded-full font-jakarta text-sm font-bold transition-colors ${
                mode === m ? "bg-gradient-to-br from-coral to-gold text-white" : "text-cream/50"
              }`}
            >
              {m === "signup" ? "Create account" : "Log in"}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={submit} className="mt-6 space-y-3">
          {mode === "signup" && (
            <div className="flex items-center gap-2 bg-grape rounded-2xl px-4 py-3 border border-white/10">
              <User className="w-4 h-4 text-cream/40 shrink-0" />
              <input required placeholder="First name" className="bg-transparent outline-none text-sm text-cream placeholder:text-cream/40 font-jakarta w-full" />
            </div>
          )}
          <div className="flex items-center gap-2 bg-grape rounded-2xl px-4 py-3 border border-white/10">
            <Mail className="w-4 h-4 text-cream/40 shrink-0" />
            <input required type="email" placeholder="Email address" className="bg-transparent outline-none text-sm text-cream placeholder:text-cream/40 font-jakarta w-full" />
          </div>
          <div className="flex items-center gap-2 bg-grape rounded-2xl px-4 py-3 border border-white/10">
            <Lock className="w-4 h-4 text-cream/40 shrink-0" />
            <input required type="password" placeholder="Password" className="bg-transparent outline-none text-sm text-cream placeholder:text-cream/40 font-jakarta w-full" />
          </div>
          {mode === "signup" && (
            <div className="flex items-center gap-2 bg-grape rounded-2xl px-4 py-3 border border-white/10">
              <Calendar className="w-4 h-4 text-cream/40 shrink-0" />
              <input required type="date" className="bg-transparent outline-none text-sm text-cream placeholder:text-cream/40 font-jakarta w-full [color-scheme:dark]" />
            </div>
          )}

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-br from-coral to-gold text-white font-jakarta font-bold text-sm py-3.5 rounded-2xl mt-5 shadow-[0_8px_24px_-6px_rgba(255,93,115,0.5)] active:scale-[0.98] transition-transform"
          >
            {mode === "signup" ? "Create my account" : "Log in"}
            <ArrowRight className="w-4 h-4" />
          </button>

          {mode === "signup" && (
            <p className="font-jakarta text-[11px] text-cream/40 text-center mt-3 leading-relaxed">
              You must be 18+ to join. By continuing you agree to our Terms and Community Guidelines.
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
