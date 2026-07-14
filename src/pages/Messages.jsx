import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Send, Image as ImageIcon, Flame, Search, MoreVertical, Pin, PinOff, Trash2, X } from "lucide-react";
import MobileShell from "../components/MobileShell.jsx";

const SEED_THREADS = [
  {
    id: "amara",
    name: "Amara",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80",
    online: true,
    pinned: false,
    lastMessage: "haha okay you've convinced me, sushi it is 🍣",
    time: "2m",
    unread: 2,
    messages: [
      { from: "them", text: "Okay wait, so what's your actual favorite cuisine?", time: "10:02" },
      { from: "me", text: "Honestly can't decide between Ethiopian and Japanese", time: "10:03" },
      { from: "them", text: "Ooh bold combo. Sushi date to break the tie?", time: "10:04" },
      { from: "them", text: "haha okay you've convinced me, sushi it is 🍣", time: "10:05" },
    ],
  },
  {
    id: "kwame",
    name: "Kwame",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&q=80",
    online: false,
    pinned: false,
    lastMessage: "You: sounds good, see you at 7!",
    time: "1h",
    unread: 0,
    messages: [
      { from: "them", text: "Coffee this week?", time: "09:10" },
      { from: "me", text: "sounds good, see you at 7!", time: "09:14" },
    ],
  },
  {
    id: "noor",
    name: "Noor",
    avatar: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200&q=80",
    online: true,
    pinned: false,
    lastMessage: "sent a photo",
    time: "3h",
    unread: 0,
    messages: [{ from: "them", attachment: { type: "photo", url: "https://images.unsplash.com/photo-1520950237264-05a5f349b8d5?w=500&q=80" }, time: "07:40" }],
  },
  {
    id: "layla",
    name: "Layla",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&q=80",
    online: false,
    pinned: false,
    lastMessage: "It's a match! Say hi 👋",
    time: "1d",
    unread: 1,
    messages: [{ from: "system", text: "You matched with Layla", time: "yesterday" }],
  },
];

function ThreadMenu({ thread, onPin, onDelete, onCloseMenu }) {
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onCloseMenu} />
      <div className="absolute right-2 top-12 z-50 bg-ink border border-white/10 rounded-2xl shadow-xl overflow-hidden w-40">
        <button
          onClick={() => {
            onPin();
            onCloseMenu();
          }}
          className="w-full flex items-center gap-2 px-4 py-3 text-left font-jakarta text-sm text-cream hover:bg-white/5"
        >
          {thread.pinned ? <PinOff className="w-4 h-4 text-gold" /> : <Pin className="w-4 h-4 text-gold" />}
          {thread.pinned ? "Unpin" : "Pin to top"}
        </button>
        <button
          onClick={() => {
            onDelete();
            onCloseMenu();
          }}
          className="w-full flex items-center gap-2 px-4 py-3 text-left font-jakarta text-sm text-coral hover:bg-white/5 border-t border-white/5"
        >
          <Trash2 className="w-4 h-4" />
          Delete conversation
        </button>
      </div>
    </>
  );
}

function InboxList({ threads, onOpen, onPin, onDelete }) {
  const [query, setQuery] = useState("");
  const [menuOpenId, setMenuOpenId] = useState(null);

  const filtered = threads.filter((t) => t.name.toLowerCase().includes(query.toLowerCase()));
  const sorted = [...filtered].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

  return (
    <>
      <header className="px-5 pt-5 pb-3 shrink-0">
        <h1 className="font-fredoka text-3xl text-cream">Messages</h1>
        <div className="mt-3 flex items-center gap-2 bg-grape rounded-full px-4 py-2.5 border border-white/10">
          <Search className="w-4 h-4 text-cream/50" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search matches"
            className="bg-transparent outline-none text-sm text-cream placeholder:text-cream/40 font-jakarta w-full"
          />
        </div>
      </header>

      <div className="flex-1 overflow-y-auto scroll-thin px-2 pb-2">
        {sorted.map((t) => (
          <div key={t.id} className="relative">
            <button
              onClick={() => onOpen(t.id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-white/5 active:bg-white/10 transition-colors text-left"
            >
              <div className="relative shrink-0">
                <img src={t.avatar} alt={t.name} className="w-14 h-14 rounded-2xl object-cover" />
                {t.online && <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-mint border-2 border-ink" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  {t.pinned && <Pin className="w-3 h-3 text-gold shrink-0" fill="currentColor" />}
                  <span className="font-jakarta font-bold text-cream text-[15px] truncate">{t.name}</span>
                  <span className="font-jakarta text-[11px] text-cream/40 shrink-0 ml-auto">{t.time}</span>
                </div>
                <p className={`font-jakarta text-[13px] truncate mt-0.5 ${t.unread ? "text-cream/90 font-semibold" : "text-cream/50"}`}>
                  {t.lastMessage}
                </p>
              </div>
              {t.unread > 0 && (
                <span className="shrink-0 w-5 h-5 rounded-full bg-coral text-white text-[11px] font-bold flex items-center justify-center">
                  {t.unread}
                </span>
              )}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpenId(menuOpenId === t.id ? null : t.id);
              }}
              className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center text-cream/40 hover:bg-white/10 hover:text-cream"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            {menuOpenId === t.id && (
              <ThreadMenu thread={t} onPin={() => onPin(t.id)} onDelete={() => onDelete(t.id)} onCloseMenu={() => setMenuOpenId(null)} />
            )}
          </div>
        ))}
        {sorted.length === 0 && (
          <p className="text-center font-jakarta text-sm text-cream/40 mt-10">No matches found for "{query}"</p>
        )}
      </div>
    </>
  );
}

function ChatThread({ thread, onBack }) {
  const [messages, setMessages] = useState(thread.messages);
  const [draft, setDraft] = useState("");
  const [pendingAttachment, setPendingAttachment] = useState(null);
  const scrollRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  const send = () => {
    if (!draft.trim() && !pendingAttachment) return;
    setMessages((m) => [
      ...m,
      {
        from: "me",
        text: draft.trim() || undefined,
        attachment: pendingAttachment || undefined,
        time: "now",
      },
    ]);
    setDraft("");
    setPendingAttachment(null);
  };

  const handleFilePicked = (file) => {
    if (!file) return;
    const isVideo = file.type.startsWith("video/");
    const url = URL.createObjectURL(file);
    setPendingAttachment({ type: isVideo ? "video" : "photo", url });
  };

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center gap-3 px-4 pt-5 pb-3 border-b border-white/10 shrink-0">
        <button onClick={onBack} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/5">
          <ChevronLeft className="w-5 h-5 text-cream" />
        </button>
        <img src={thread.avatar} alt={thread.name} className="w-9 h-9 rounded-full object-cover" />
        <div>
          <p className="font-jakarta font-bold text-cream text-sm leading-none">{thread.name}</p>
          <p className="font-jakarta text-[11px] text-mint mt-0.5">{thread.online ? "Online now" : "Offline"}</p>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto scroll-thin px-4 py-4 space-y-3">
        {messages.map((m, i) =>
          m.from === "system" ? (
            <div key={i} className="flex justify-center">
              <span className="font-jakarta text-[11px] font-semibold text-gold bg-gold/10 border border-gold/20 px-3 py-1 rounded-full flex items-center gap-1">
                <Flame className="w-3 h-3" /> {m.text}
              </span>
            </div>
          ) : (
            <div key={i} className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] rounded-2xl overflow-hidden font-jakarta text-sm ${
                  m.from === "me" ? "bg-gradient-to-br from-coral to-gold text-white rounded-br-md" : "bg-grape text-cream rounded-bl-md"
                } ${m.attachment ? "p-1.5" : "px-4 py-2.5"}`}
              >
                {m.attachment?.type === "photo" && <img src={m.attachment.url} alt="shared" className="rounded-xl w-full max-h-64 object-cover" />}
                {m.attachment?.type === "video" && (
                  <video src={m.attachment.url} controls className="rounded-xl w-full max-h-64 object-cover" />
                )}
                {m.text && <p className={m.attachment ? "px-2.5 py-1.5" : ""}>{m.text}</p>}
              </div>
            </div>
          )
        )}
      </div>

      {pendingAttachment && (
        <div className="px-4 pb-2 shrink-0">
          <div className="relative inline-block">
            {pendingAttachment.type === "photo" ? (
              <img src={pendingAttachment.url} alt="attachment preview" className="h-20 w-20 object-cover rounded-xl border border-white/10" />
            ) : (
              <video src={pendingAttachment.url} className="h-20 w-20 object-cover rounded-xl border border-white/10" />
            )}
            <button
              onClick={() => setPendingAttachment(null)}
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-ink border border-white/20 flex items-center justify-center"
            >
              <X className="w-3.5 h-3.5 text-cream" />
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 px-4 py-3 border-t border-white/10 shrink-0">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-9 h-9 rounded-full flex items-center justify-center text-cream/60 hover:bg-white/5 shrink-0"
        >
          <ImageIcon className="w-5 h-5" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          hidden
          onChange={(e) => {
            handleFilePicked(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Send a message..."
          className="flex-1 bg-grape rounded-full px-4 py-2.5 text-sm text-cream placeholder:text-cream/40 outline-none font-jakarta border border-white/10"
        />
        <button
          onClick={send}
          className="w-10 h-10 rounded-full bg-gradient-to-br from-coral to-gold flex items-center justify-center text-white shrink-0 active:scale-90 transition-transform"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function Messages() {
  const { threadId } = useParams();
  const navigate = useNavigate();
  const [threads, setThreads] = useState(SEED_THREADS);
  const activeThread = useMemo(() => threads.find((t) => t.id === threadId), [threads, threadId]);

  const togglePin = (id) => {
    setThreads((prev) => prev.map((t) => (t.id === id ? { ...t, pinned: !t.pinned } : t)));
  };

  const deleteThread = (id) => {
    setThreads((prev) => prev.filter((t) => t.id !== id));
    if (activeThread?.id === id) navigate("/messages");
  };

  return (
    <MobileShell showNav={!activeThread}>
      {activeThread ? (
        <ChatThread thread={activeThread} onBack={() => navigate("/messages")} />
      ) : (
        <InboxList threads={threads} onOpen={(id) => navigate(`/messages/${id}`)} onPin={togglePin} onDelete={deleteThread} />
      )}
    </MobileShell>
  );
}
