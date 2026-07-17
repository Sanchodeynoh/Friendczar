import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Heart, MessageCircle, Send, PartyPopper } from "lucide-react";
import { api } from "../lib/api.js";

const POLL_INTERVAL_MS = 15000;

const TYPE_ICON = { like: Heart, comment: MessageCircle, message: Send, match: PartyPopper };

function timeAgo(dateStr) {
  const mins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

export default function NotificationBell() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef(null);

  useEffect(() => {
    const poll = () => api.getUnreadCount().then(({ count }) => setUnreadCount(count)).catch(() => {});
    poll();
    const id = setInterval(poll, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    api
      .getNotifications()
      .then(({ notifications }) => setNotifications(notifications))
      .finally(() => setLoading(false));
  }, [open]);

  const openPanel = async () => {
    setOpen(true);
    setUnreadCount(0);
    api.markAllNotificationsRead().catch(() => {});
  };

  const handleClick = (n) => {
    setOpen(false);
    if (n.type === "message" && n.fromUser) navigate(`/messages/${n.fromUser.id}`);
    else if (n.type === "comment" && n.fromUser) navigate(`/user/${n.fromUser.id}`, { state: { scrollToComments: true } });
    else if (n.fromUser) navigate(`/user/${n.fromUser.id}`);
  };

  return (
    <div className="relative">
      <button
        onClick={() => (open ? setOpen(false) : openPanel())}
        className="relative w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/10 active:scale-95 transition-transform"
      >
        <Bell className="w-4 h-4 text-cream" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-coral border-2 border-ink flex items-center justify-center">
            <span className="font-jakarta text-[9px] font-bold text-white leading-none">{unreadCount > 9 ? "9+" : unreadCount}</span>
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div ref={panelRef} className="absolute right-0 top-12 z-50 w-72 bg-grape border border-white/10 rounded-2xl shadow-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-white/10">
              <h3 className="font-fredoka text-base text-cream">Notifications</h3>
            </div>
            <div className="max-h-80 overflow-y-auto scroll-thin">
              {loading && <p className="font-jakarta text-xs text-cream/40 text-center py-6">Loading...</p>}
              {!loading && notifications.length === 0 && <p className="font-jakarta text-xs text-cream/40 text-center py-6">Nothing yet — likes, comments, matches, and messages will show up here.</p>}
              {notifications.map((n) => {
                const Icon = TYPE_ICON[n.type] || Bell;
                return (
                  <button key={n.id} onClick={() => handleClick(n)} className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-white/5 border-b border-white/5 last:border-0">
                    <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Icon className="w-3.5 h-3.5 text-coral" />
                    </span>
                    <div className="min-w-0">
                      <p className="font-jakarta text-xs text-cream leading-snug">{n.text}</p>
                      <p className="font-jakarta text-[10px] text-cream/40 mt-0.5">{timeAgo(n.createdAt)}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
