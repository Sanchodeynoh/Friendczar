import React from "react";
import BottomNav from "./BottomNav.jsx";

export default function MobileShell({ children, header, showNav = true }) {
  return (
    <div className="w-full h-[100dvh] flex justify-center bg-ink overflow-hidden">
      <div className="w-full max-w-[420px] flex flex-col h-full">
        {header}
        <main className="flex-1 min-h-0 relative flex flex-col">{children}</main>
        {showNav && <BottomNav />}
      </div>
    </div>
  );
}
