import React from "react";
import { NavLink } from "react-router-dom";
import { Flame, MessageCircle, User, Radio } from "lucide-react";

const ITEMS = [
  { to: "/discover", icon: Flame, label: "Discover" },
  { to: "/live", icon: Radio, label: "Live" },
  { to: "/messages", icon: MessageCircle, label: "Messages" },
  { to: "/profile", icon: User, label: "Profile" },
];

export default function BottomNav() {
  return (
    <nav className="flex items-center justify-around px-2 py-3 border-t border-white/10 bg-[#150824] shrink-0">
      {ITEMS.map(({ to, icon: Icon, label }) => (
        <NavLink key={to} to={to} className="flex flex-col items-center gap-1 px-4">
          {({ isActive }) => (
            <>
              <Icon
                className="w-5 h-5"
                strokeWidth={isActive ? 0 : 2}
                fill={isActive ? "#FF5D73" : "none"}
                style={{ color: isActive ? "#FF5D73" : "rgba(255,248,240,0.45)" }}
              />
              <span
                className="font-jakarta text-[10px] font-semibold"
                style={{ color: isActive ? "#FF5D73" : "rgba(255,248,240,0.45)" }}
              >
                {label}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
