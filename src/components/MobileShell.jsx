import React from "react";
import BottomNav from "./BottomNav.jsx";

export default function MobileShell({ children, header, showNav = true }) {
  return (
    <div className="min-h-screen w-full flex justify-center bg-ink">
      <div className="w-full max-w-[420px] flex flex-col h-screen">
        {header}
        <main className="flex-1 min-h-0 relative flex flex-col">{children}</main>
        {showNav && <BottomNav />}
      </div>
    </div>
  );
}
