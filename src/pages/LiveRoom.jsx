import React, { useEffect, useRef, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Room, RoomEvent, Track } from "livekit-client";
import { ChevronLeft, Mic, MicOff, Video, VideoOff, PhoneOff, Send, Heart, Users } from "lucide-react";
import { api } from "../lib/api.js";

const HEARTBEAT_MS = 20000;
const POLL_MS = 10000;

function FloatingHearts({ burstKey }) {
  if (!burstKey) return null;
  const pieces = Array.from({ length: 6 });
  return (
    <div key={burstKey} className="pointer-events-none absolute bottom-24 right-6 w-10 h-40 overflow-visible">
      {pieces.map((_, i) => (
        <Heart
          key={i}
          className="absolute bottom-0 right-0 text-coral heart-float"
          style={{ animationDelay: `${i * 90}ms`, left: `${(i % 3) * 8}px` }}
          fill="currentColor"
          size={20}
        />
      ))}
    </div>
  );
}

export default function LiveRoom() {
  const { liveId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [stream, setStream] = useState(null);
  const [isHost, setIsHost] = useState(!!location.state?.isHost);
  const [connecting, setConnecting] = useState(true);
  const [error, setError] = useState("");
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [viewerCount, setViewerCount] = useState(0);
  const [heartBurst, setHeartBurst] = useState(0);
  const [ended, setEnded] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);

  const roomRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const chatScrollRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    let room;

    async function connect() {
      try {
        let token = location.state?.token;
        let wsUrl = location.state?.wsUrl;
        let hostFlag = location.state?.isHost;
        let streamData;

        if (token && wsUrl) {
          const { stream } = await api.getLive(liveId);
          streamData = stream;
        } else {
          const res = await api.joinLive(liveId);
          token = res.token;
          wsUrl = res.wsUrl;
          hostFlag = res.isHost;
          streamData = res.stream;
        }

        if (cancelled) return;
        setStream(streamData);
        setIsHost(hostFlag);
        setViewerCount(streamData.viewerCount || 0);

        room = new Room({ adaptiveStream: true, dynacast: true });
        roomRef.current = room;

        room.on(RoomEvent.TrackSubscribed, (track) => {
          if (track.kind === "video" && remoteVideoRef.current) track.attach(remoteVideoRef.current);
        });
        room.on(RoomEvent.DataReceived, (payload) => {
          try {
            const msg = JSON.parse(new TextDecoder().decode(payload));
            if (msg.type === "chat") setMessages((m) => [...m.slice(-49), msg]);
            if (msg.type === "reaction") setHeartBurst((k) => k + 1);
          } catch {
            /* ignore malformed data messages */
          }
        });
        // A shaky mobile connection often drops and re-establishes within a
        // few seconds — LiveKit handles that automatically. We only treat
        // the stream as truly over once it gives up for good (Disconnected),
        // not during the brief Reconnecting phase in between.
        room.on(RoomEvent.Reconnecting, () => {
          if (!cancelled) setReconnecting(true);
        });
        room.on(RoomEvent.Reconnected, () => {
          if (!cancelled) setReconnecting(false);
        });
        room.on(RoomEvent.Disconnected, () => {
          if (!cancelled) setEnded(true);
        });

        await room.connect(wsUrl, token);

        if (hostFlag) {
          await room.localParticipant.setMicrophoneEnabled(true);
          await room.localParticipant.setCameraEnabled(true);
          const camPub = room.localParticipant.getTrackPublication(Track.Source.Camera);
          if (camPub?.videoTrack && localVideoRef.current) camPub.videoTrack.attach(localVideoRef.current);
        }

        setConnecting(false);
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Couldn't connect to the stream");
          setConnecting(false);
        }
      }
    }

    connect();

    return () => {
      cancelled = true;
      room?.disconnect();
      if (!location.state?.isHost) api.leaveLive(liveId).catch(() => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liveId]);

  // Host heartbeat so the stream doesn't get treated as stale/dead
  useEffect(() => {
    if (!isHost || connecting) return;
    const id = setInterval(() => api.liveHeartbeat(liveId).catch(() => {}), HEARTBEAT_MS);
    return () => clearInterval(id);
  }, [isHost, connecting, liveId]);

  // Poll for viewer count updates
  useEffect(() => {
    if (connecting) return;
    const id = setInterval(() => {
      api.getLive(liveId).then(({ stream }) => setViewerCount(stream.viewerCount)).catch(() => {});
    }, POLL_MS);
    return () => clearInterval(id);
  }, [connecting, liveId]);

  useEffect(() => {
    chatScrollRef.current?.scrollTo({ top: chatScrollRef.current.scrollHeight });
  }, [messages]);

  const sendChat = (text) => {
    const trimmed = text.trim();
    if (!trimmed || !roomRef.current) return;
    const msg = { type: "chat", name: isHost ? `${stream?.host?.name} (host)` : "You", text: trimmed };
    setMessages((m) => [...m.slice(-49), msg]);
    roomRef.current.localParticipant.publishData(new TextEncoder().encode(JSON.stringify(msg)), { reliable: true });
    setDraft("");
  };

  const sendReaction = () => {
    setHeartBurst((k) => k + 1);
    roomRef.current?.localParticipant.publishData(new TextEncoder().encode(JSON.stringify({ type: "reaction" })), { reliable: false });
  };

  const toggleMic = async () => {
    const next = !micOn;
    await roomRef.current?.localParticipant.setMicrophoneEnabled(next);
    setMicOn(next);
  };

  const toggleCamera = async () => {
    const next = !cameraOn;
    await roomRef.current?.localParticipant.setCameraEnabled(next);
    setCameraOn(next);
  };

  const leave = async () => {
    if (isHost) await api.endLive(liveId).catch(() => {});
    roomRef.current?.disconnect();
    navigate("/live");
  };

  if (connecting) {
    return (
      <div className="w-full h-[100dvh] flex items-center justify-center bg-ink">
        <span className="font-jakarta text-sm text-cream/50">Connecting to stream...</span>
      </div>
    );
  }

  if (error || ended) {
    return (
      <div className="w-full h-[100dvh] flex flex-col items-center justify-center bg-ink px-8 text-center">
        <p className="font-fredoka text-2xl text-cream">{ended ? "Stream ended" : "Couldn't connect"}</p>
        {error && <p className="font-jakarta text-sm text-cream/50 mt-2">{error}</p>}
        <button onClick={() => navigate("/live")} className="mt-4 font-jakarta text-sm font-bold text-gold">
          Back to Live
        </button>
      </div>
    );
  }

  return (
    <div className="w-full h-[100dvh] bg-ink relative overflow-hidden">
      <style>{`
        .heart-float { animation: heartFloat 1.4s ease-out forwards; }
        @keyframes heartFloat {
          0% { transform: translateY(0) scale(0.6); opacity: 1; }
          100% { transform: translateY(-140px) scale(1.1); opacity: 0; }
        }
      `}</style>

      {isHost ? (
        <video ref={localVideoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover" />
      ) : (
        <video ref={remoteVideoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover bg-grape" />
      )}

      <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-ink/90 to-transparent p-4 flex items-center justify-between">
        <button onClick={leave} className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
          <ChevronLeft className="w-5 h-5 text-cream" />
        </button>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 bg-coral px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <span className="font-jakarta text-[11px] font-bold text-white">LIVE</span>
          </span>
          <span className="flex items-center gap-1 bg-black/50 backdrop-blur px-2.5 py-1 rounded-full">
            <Users className="w-3.5 h-3.5 text-white" />
            <span className="font-jakarta text-[11px] font-bold text-white">{viewerCount}</span>
          </span>
        </div>
      </div>

      {reconnecting && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-gold/90 text-ink font-jakarta text-xs font-bold px-4 py-2 rounded-full z-10">
          Reconnecting...
        </div>
      )}

      <FloatingHearts burstKey={heartBurst} />

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink via-ink/85 to-transparent pt-10 pb-5 px-4">
        <p className="font-jakarta text-sm font-bold text-cream mb-1">{stream?.title}</p>

        <div ref={chatScrollRef} className="max-h-32 overflow-y-auto scroll-thin space-y-1 mb-3">
          {messages.map((m, i) => (
            <p key={i} className="font-jakarta text-xs text-cream/90">
              <span className="font-bold text-gold">{m.name}: </span>
              {m.text}
            </p>
          ))}
        </div>

        <div className="flex items-center gap-2 mb-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendChat(draft)}
            placeholder="Say something..."
            className="flex-1 min-w-0 bg-white/10 rounded-full px-4 py-2.5 text-sm text-cream placeholder:text-cream/40 outline-none font-jakarta border border-white/10"
          />
          <button onClick={() => sendChat(draft)} className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center shrink-0">
            <Send className="w-4 h-4 text-cream" />
          </button>
        </div>

        <div className="flex items-center justify-center gap-3">
          <button onClick={sendReaction} className="w-9 h-9 rounded-full bg-coral flex items-center justify-center shrink-0 active:scale-90 transition-transform">
            <Heart className="w-4 h-4 text-white" fill="white" />
          </button>

          {isHost ? (
            <>
              <button onClick={toggleMic} className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${micOn ? "bg-white/10" : "bg-coral"}`}>
                {micOn ? <Mic className="w-4 h-4 text-cream" /> : <MicOff className="w-4 h-4 text-white" />}
              </button>
              <button onClick={toggleCamera} className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${cameraOn ? "bg-white/10" : "bg-coral"}`}>
                {cameraOn ? <Video className="w-4 h-4 text-cream" /> : <VideoOff className="w-4 h-4 text-white" />}
              </button>
            </>
          ) : null}

          <button onClick={leave} className="w-9 h-9 rounded-full bg-coral flex items-center justify-center shrink-0">
            <PhoneOff className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
