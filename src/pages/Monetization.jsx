import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Crown } from "lucide-react";

export default function Monetization() {
  const navigate = useNavigate();

  return (
    <div className="w-full h-[100dvh] flex justify-center bg-ink overflow-y-auto">
      <div className="w-full max-w-[420px] px-6 pt-5 pb-10">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center mb-6">
          <ChevronLeft className="w-5 h-5 text-cream" />
        </button>

        <div className="flex flex-col items-center text-center mt-10">
          <div className="w-16 h-16 rounded-full bg-[#1a1a1a] border border-[#C9A227]/50 flex items-center justify-center">
            <Crown className="w-7 h-7 text-[#C9A227]" />
          </div>
          <h1 className="font-fredoka text-2xl text-[#C9A227] mt-4 tracking-wide">Monetization</h1>
          <p className="font-jakarta text-sm text-cream/50 mt-2 max-w-xs">
            This is coming soon — details on how you'll be able to earn on Friendczar will appear here.
          </p>
        </div>
      </div>
    </div>
  );
}
