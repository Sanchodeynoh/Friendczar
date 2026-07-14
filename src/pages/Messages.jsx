import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Send, Image as ImageIcon, Flame, Search, MoreVertical, Pin, PinOff, Trash2, X } from "lucide-react";
import MobileShell from "../components/MobileShell.jsx";
import { api } from "../lib/api.js";

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

function ThreadMenu({ pinned, onPin, onDelete, onCloseMenu }) {
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
          {pinned ? <PinOff className="w-4 h-4 text-gold" /> : <Pin className="w-4 h-4 text-gold" />}
          {pinned ? "Unpin" : "Pin to top"}
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

function InboxList({ threads, loading, onOpen, onPin, onDelete }) {
  const [query, setQuery] = useState("");
  const [menuOpenId, setMenuOpenId] = useState(null);

  const filtered = threads.filter((t) => t.otherUser.name.toLowerCase().includes(query.toLowerCase()));
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
        {loading && <p className="text-center font-jakarta text-sm text-cream/40 mt-10">Loading conversations...</p>}
        {!loading && sorted.length === 0 && <p className="text-center font-jakarta text-sm text-cream/40 mt-10">No conversations yet — like or comment on a profile to start one.</p>}
        {sorted.map((t) => (
          <div key={t.id} className="relative">
            <button onClick={() => onOpen(t.otherUser.id)} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-white/5 active:bg-white/10 transition-colors text-left">
              <div className="relative shrink-0 w-14 h-14 rounded-2xl bg-grape overflow-hidden flex items-center justify-center">
                {t.otherUser.media?.[0] ? (
                  <img src={t.otherUser.media[0].url} alt={t.otherUser.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="font-fredoka text-lg text-cream/30">{t.otherUser.name[0]}</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  {t.pinned && <Pin className="w-3 h-3 text-gold shrink-0" fill="currentColor" />}
                  <span className="font-jakarta font-bold text-cream text-[15px] truncate">{t.otherUser.name}</span>
                  <span className="font-jakarta text-[11px] text-cream/40 shrink-0 ml-auto">{timeAgo(t.lastMessage?.createdAt)}</span>
                </div>
                <p className={`font-jakarta text-[13px] truncate mt-0.5 ${t.unread ? "text-cream/90 font-semibold" : "text-cream/50"}`}>
                  {t.lastMessage ? t.lastMessage.text || (t.lastMessage.attachmentType === "video" ? "Sent a video" : "Sent a photo") : "Say hi 👋"}
                </p>
              </div>
              {t.unread > 0 && (
                <span className="shrink-0 w-5 h-5 rounded-full bg-coral text-white text-[11px] font-bold flex items-center justify-center">{t.unread}</span>
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
            {menuOpenId === t.id && <ThreadMenu pinned={t.pinned} onPin={() => onPin(t.id)} onDelete={() => onDelete(t.id)} onCloseMenu={() => setMenuOpenId(null)} />}
          </div>
        ))}
      </div>
    </>
  );
}

function ChatThread({ otherUserId, onBack }) {
  const [thread, setThread] = useState(null);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState("");
  const [pendingFile, setPendingFile] = useState(null);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    api
      .getThread(otherUserId)
      .then((data) => setThread(data))
      .finally(() => setLoading(false));
  }, [otherUserId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [thread?.messages]);

  const send = async () => {
    if ((!draft.trim() && !pendingFile) || sending) return;
    setSending(true);
    try {
      const { message } = await api.sendMessage(otherUserId, { text: draft.trim(), file: pendingFile?.file });
      setThread((t) => ({ ...t, messages: [...t.messages, message] }));
      setDraft("");
      setPendingFile(null);
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const handleFilePicked = (file) => {
    if (!file) return;
    setPendingFile({ file, previewUrl: URL.createObjectURL(file), isVideo: file.type.startsWith("video/") });
  };

  if (loading || !thread) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <span className="font-jakarta text-sm text-cream/50">Loading conversation...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center gap-3 px-4 pt-5 pb-3 border-b border-white/10 shrink-0">
        <button onClick={onBack} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white/5">
          <ChevronLeft className="w-5 h-5 text-cream" />
        </button>
        <div className="w-9 h-9 rounded-full bg-grape overflow-hidden flex items-center justify-center shrink-0">
          {thread.otherUser.media?.[0] ? (
            <img src={thread.otherUser.media[0].url} alt={thread.otherUser.name} className="w-full h-full object-cover" />
          ) : (
            <span className="font-fredoka text-sm text-cream/30">{thread.otherUser.name[0]}</span>
          )}
        </div>
        <p className="font-jakarta font-bold text-cream text-sm leading-none">{thread.otherUser.name}</p>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto scroll-thin px-4 py-4 space-y-3">
        {thread.messages.length === 0 && (
          <div className="flex justify-center">
            <span className="font-jakarta text-[11px] font-semibold text-gold bg-gold/10 border border-gold/20 px-3 py-1 rounded-full flex items-center gap-1">
              <Flame className="w-3 h-3" /> Say hi to {thread.otherUser.name}!
            </span>
          </div>
        )}
        {thread.messages.map((m) => (
          <div key={m.id} className={`flex ${m.senderId !== thread.otherUser.id ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[75%] rounded-2xl overflow-hidden font-jakarta text-sm ${
                m.senderId !== thread.otherUser.id ? "bg-gradient-to-br from-coral to-gold text-white rounded-br-md" : "bg-grape text-cream rounded-bl-md"
              } ${m.attachmentUrl ? "p-1.5" : "px-4 py-2.5"}`}
            >
              {m.attachmentType === "photo" && <img src={m.attachmentUrl} alt="shared" className="rounded-xl w-full max-h-64 object-cover" />}
              {m.attachmentType === "video" && <video src={m.attachmentUrl} controls className="rounded-xl w-full max-h-64 object-cover" />}
              {m.text && <p className={m.attachmentUrl ? "px-2.5 py-1.5" : ""}>{m.text}</p>}
            </div>
          </div>
        ))}
      </div>

      {pendingFile && (
        <div className="px-4 pb-2 shrink-0">
          <div className="relative inline-block">
            {pendingFile.isVideo ? (
              <video src={pendingFile.previewUrl} className="h-20 w-20 object-cover rounded-xl border border-white/10" />
            ) : (
              <img src={pendingFile.previewUrl} alt="attachment preview" className="h-20 w-20 object-cover rounded-xl border border-white/10" />
            )}
            <button onClick={() => setPendingFile(null)} className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-ink border border-white/20 flex items-center justify-center">
              <X className="w-3.5 h-3.5 text-cream" />
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 px-4 py-3 border-t border-white/10 shrink-0">
        <button onClick={() => fileInputRef.current?.click()} className="w-9 h-9 rounded-full flex items-center justify-center text-cream/60 hover:bg-white/5 shrink-0">
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
          disabled={sending}
          className="w-10 h-10 rounded-full bg-gradient-to-br from-coral to-gold flex items-center justify-center text-white shrink-0 active:scale-90 transition-transform disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function Messages() {
  const { threadId: otherUserId } = useParams();
  const navigate = useNavigate();
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadThreads = () => {
    setLoading(true);
    api
      .getThreads()
      .then(({ threads }) => setThreads(threads))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadThreads();
  }, [otherUserId]);

  const togglePin = async (threadId) => {
    setThreads((prev) => prev.map((t) => (t.id === threadId ? { ...t, pinned: !t.pinned } : t)));
    try {
      await api.togglePinThread(threadId);
    } catch (err) {
      loadThreads();
    }
  };

  const deleteThread = async (threadId) => {
    setThreads((prev) => prev.filter((t) => t.id !== threadId));
    try {
      await api.deleteThread(threadId);
    } catch (err) {
      loadThreads();
    }
  };

  return (
    <MobileShell showNav={!otherUserId}>
      {otherUserId ? (
        <ChatThread otherUserId={otherUserId} onBack={() => navigate("/messages")} />
      ) : (
        <InboxList threads={threads} loading={loading} onOpen={(id) => navigate(`/messages/${id}`)} onPin={togglePin} onDelete={deleteThread} />
      )}
    </MobileShell>
  );
}
