import React, { useEffect, useRef } from "react";
import { Phone, PhoneOff, Video, VideoOff, Mic, MicOff, User } from "lucide-react";
import { useCall } from "../context/CallContext.jsx";

function formatDuration(totalSeconds) {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

export default function CallOverlay() {
  const {
    callState,
    peer,
    localStream,
    remoteStream,
    micOn,
    cameraOn,
    error,
    elapsedSeconds,
    acceptCall,
    rejectCall,
    endCall,
    toggleMic,
    toggleCamera,
  } = useCall();

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const remoteAudioRef = useRef(null);

  useEffect(() => {
    if (localVideoRef.current) localVideoRef.current.srcObject = localStream || null;
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream || null;
    // Audio-only calls have no <video> element mounted to play the remote
    // track, so we always keep a dedicated <audio> element in sync too.
    if (remoteAudioRef.current) remoteAudioRef.current.srcObject = remoteStream || null;
  }, [remoteStream]);

  if (callState === "idle") return null;

  const isVideo = peer?.callType === "video";

  return (
    <div className="fixed inset-0 z-[999] bg-ink flex flex-col">
      {/* This plays remote audio for BOTH call types. For video calls the
          <video> element below also carries audio, but keeping this always
          mounted (and simply always in sync) is what actually fixes voice
          calls having no sound — previously nothing played the audio-only
          remote track at all. */}
      <audio ref={remoteAudioRef} autoPlay className={isVideo ? "hidden" : ""} />

      {isVideo && remoteStream && (
        <video ref={remoteVideoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover" />
      )}
      {(!isVideo || !remoteStream) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-grape to-ink">
          <div className="w-28 h-28 rounded-full bg-gradient-to-br from-coral to-gold flex items-center justify-center">
            <User className="w-12 h-12 text-white" />
          </div>
          <h2 className="font-fredoka text-2xl text-cream mt-5">{peer?.name}</h2>
          <p className="font-jakarta text-sm text-cream/50 mt-1">
            {callState === "ringing-outgoing" && "Calling..."}
            {callState === "ringing-incoming" && `Incoming ${isVideo ? "video" : "voice"} call`}
            {callState === "connected" && (isVideo ? "Connecting video..." : formatDuration(elapsedSeconds))}
          </p>
        </div>
      )}

      {/* Name + live timer overlay for video calls (audio calls show it in the center card above) */}
      {isVideo && callState === "connected" && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-black/40 backdrop-blur px-4 py-1.5 rounded-full">
          <p className="font-jakarta text-xs font-bold text-white">
            {peer?.name} · {formatDuration(elapsedSeconds)}
          </p>
        </div>
      )}

      {/* Local video PIP — shown to whichever side (caller or receiver) has their camera on, WhatsApp-style */}
      {isVideo && localStream && (
        <video ref={localVideoRef} autoPlay playsInline muted className="absolute top-6 right-5 w-24 h-32 rounded-2xl object-cover border-2 border-white/20 z-10" />
      )}

      {error && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-coral/90 text-white font-jakarta text-xs font-semibold px-4 py-2 rounded-full z-10">
          {error}
        </div>
      )}

      {/* Controls */}
      <div className="relative mt-auto pb-10 pt-6 flex items-center justify-center gap-5 z-10">
        {callState === "ringing-incoming" ? (
          <>
            <button onClick={rejectCall} className="w-16 h-16 rounded-full bg-coral flex items-center justify-center shadow-lg active:scale-90 transition-transform">
              <PhoneOff className="w-6 h-6 text-white" />
            </button>
            <button onClick={acceptCall} className="w-16 h-16 rounded-full bg-mint flex items-center justify-center shadow-lg active:scale-90 transition-transform">
              <Phone className="w-6 h-6 text-ink" />
            </button>
          </>
        ) : (
          <>
            <button
              onClick={toggleMic}
              className={`w-14 h-14 rounded-full flex items-center justify-center border ${micOn ? "bg-white/10 border-white/20" : "bg-coral border-coral"}`}
            >
              {micOn ? <Mic className="w-5 h-5 text-white" /> : <MicOff className="w-5 h-5 text-white" />}
            </button>
            {isVideo && (
              <button
                onClick={toggleCamera}
                className={`w-14 h-14 rounded-full flex items-center justify-center border ${cameraOn ? "bg-white/10 border-white/20" : "bg-coral border-coral"}`}
              >
                {cameraOn ? <Video className="w-5 h-5 text-white" /> : <VideoOff className="w-5 h-5 text-white" />}
              </button>
            )}
            <button onClick={endCall} className="w-16 h-16 rounded-full bg-coral flex items-center justify-center shadow-lg active:scale-90 transition-transform">
              <PhoneOff className="w-6 h-6 text-white" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
