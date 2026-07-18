import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useSocket } from "./SocketContext.jsx";
import { api } from "../lib/api.js";

const CallContext = createContext(null);

const RING_TIMEOUT_MS = 45000;

function buildIceServers() {
  const servers = [{ urls: "stun:stun.l.google.com:19302" }];
  const turnUrl = import.meta.env.VITE_TURN_URL;
  const turnUsername = import.meta.env.VITE_TURN_USERNAME;
  const turnCredential = import.meta.env.VITE_TURN_CREDENTIAL;
  if (turnUrl && turnUsername && turnCredential) {
    servers.push({ urls: turnUrl, username: turnUsername, credential: turnCredential });
  }
  return servers;
}

export function CallProvider({ children }) {
  const socket = useSocket();
  const [callState, setCallState] = useState("idle"); // idle | ringing-outgoing | ringing-incoming | connected
  const [peer, setPeer] = useState(null); // { userId, name, callType }
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [error, setError] = useState("");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const pcRef = useRef(null);
  const pendingOfferRef = useRef(null);
  const pendingCandidatesRef = useRef([]);
  const isCallerRef = useRef(false);
  const connectedAtRef = useRef(null);
  const ringTimeoutRef = useRef(null);
  const localStreamRef = useRef(null);
  const peerRef = useRef(null);
  const tickRef = useRef(null);

  // Keep refs mirrored to the latest state, since callbacks/timeouts/socket
  // listeners below are created once and would otherwise see stale values.
  useEffect(() => {
    localStreamRef.current = localStream;
  }, [localStream]);
  useEffect(() => {
    peerRef.current = peer;
  }, [peer]);

  const clearRingTimeout = () => {
    if (ringTimeoutRef.current) {
      clearTimeout(ringTimeoutRef.current);
      ringTimeoutRef.current = null;
    }
  };

  const logCallOutcome = useCallback((status) => {
    const p = peerRef.current;
    if (!p) return;
    const durationSeconds = connectedAtRef.current ? Math.round((Date.now() - connectedAtRef.current) / 1000) : 0;
    api.logCall(p.userId, { callType: p.callType, status, durationSeconds }).catch(() => {});
  }, []);

  const cleanup = useCallback(
    (logStatus) => {
      clearRingTimeout();
      if (tickRef.current) {
        clearInterval(tickRef.current);
        tickRef.current = null;
      }
      if (logStatus && isCallerRef.current) {
        logCallOutcome(connectedAtRef.current ? "completed" : logStatus);
      }
      pcRef.current?.close();
      pcRef.current = null;
      pendingOfferRef.current = null;
      pendingCandidatesRef.current = [];
      connectedAtRef.current = null;
      isCallerRef.current = false;
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      setLocalStream(null);
      setRemoteStream(null);
      setPeer(null);
      setCallState("idle");
      setMicOn(true);
      setCameraOn(true);
      setElapsedSeconds(0);
    },
    [logCallOutcome]
  );

  const beginTimer = useCallback(() => {
    connectedAtRef.current = Date.now();
    tickRef.current = setInterval(() => {
      setElapsedSeconds(Math.round((Date.now() - connectedAtRef.current) / 1000));
    }, 1000);
  }, []);

  const createPeerConnection = useCallback(
    (toUserId) => {
      const pc = new RTCPeerConnection({ iceServers: buildIceServers() });
      pc.onicecandidate = (e) => {
        if (e.candidate) socket?.emit("call:ice-candidate", { toUserId, candidate: e.candidate });
      };
      pc.ontrack = (e) => setRemoteStream(e.streams[0]);
      pc.onconnectionstatechange = () => {
        if (["failed", "closed"].includes(pc.connectionState)) cleanup("missed");
      };
      pcRef.current = pc;
      return pc;
    },
    [socket, cleanup]
  );

  const startCall = useCallback(
    async (toUserId, toName, callType) => {
      if (!socket) return;
      setError("");
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: callType === "video" });
        setLocalStream(stream);
        setPeer({ userId: toUserId, name: toName, callType });
        setCallState("ringing-outgoing");
        isCallerRef.current = true;

        const pc = createPeerConnection(toUserId);
        stream.getTracks().forEach((t) => pc.addTrack(t, stream));

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit("call:invite", { toUserId, offer, callType });

        // If nobody answers within this window, treat it as a missed/unanswered call.
        ringTimeoutRef.current = setTimeout(() => {
          socket.emit("call:end", { toUserId });
          cleanup("missed");
        }, RING_TIMEOUT_MS);
      } catch (err) {
        setError(err.message === "Permission denied" ? "Camera/microphone permission was denied." : err.message);
        cleanup();
      }
    },
    [socket, createPeerConnection, cleanup]
  );

  const acceptCall = useCallback(async () => {
    if (!socket || !peer || !pendingOfferRef.current) return;
    clearRingTimeout();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: peer.callType === "video" });
      setLocalStream(stream);
      isCallerRef.current = false;

      const pc = createPeerConnection(peer.userId);
      stream.getTracks().forEach((t) => pc.addTrack(t, stream));

      await pc.setRemoteDescription(new RTCSessionDescription(pendingOfferRef.current));
      for (const candidate of pendingCandidatesRef.current) {
        await pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(() => {});
      }
      pendingCandidatesRef.current = [];

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit("call:answer", { toUserId: peer.userId, answer });
      setCallState("connected");
      beginTimer();
    } catch (err) {
      setError(err.message === "Permission denied" ? "Camera/microphone permission was denied." : err.message);
      cleanup();
    }
  }, [socket, peer, createPeerConnection, cleanup, beginTimer]);

  const rejectCall = useCallback(() => {
    if (peer) socket?.emit("call:reject", { toUserId: peer.userId });
    cleanup(); // the caller logs "missed"; the person declining doesn't double-log
  }, [socket, peer, cleanup]);

  const endCall = useCallback(() => {
    if (peer) socket?.emit("call:end", { toUserId: peer.userId });
    cleanup("missed");
  }, [socket, peer, cleanup]);

  const toggleMic = useCallback(() => {
    const track = localStreamRef.current?.getAudioTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setMicOn(track.enabled);
    }
  }, []);

  const toggleCamera = useCallback(() => {
    const track = localStreamRef.current?.getVideoTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setCameraOn(track.enabled);
    }
  }, []);

  useEffect(() => {
    if (!socket) return;

    const onIncoming = ({ fromUserId, fromName, offer, callType }) => {
      if (callState !== "idle") {
        socket.emit("call:reject", { toUserId: fromUserId });
        return;
      }
      pendingOfferRef.current = offer;
      setPeer({ userId: fromUserId, name: fromName, callType });
      setCallState("ringing-incoming");
    };

    const onAnswered = async ({ answer }) => {
      if (!pcRef.current) return;
      clearRingTimeout();
      await pcRef.current.setRemoteDescription(new RTCSessionDescription(answer));
      for (const candidate of pendingCandidatesRef.current) {
        await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate)).catch(() => {});
      }
      pendingCandidatesRef.current = [];
      setCallState("connected");
      beginTimer();
    };

    const onIceCandidate = async ({ candidate }) => {
      if (pcRef.current?.remoteDescription) {
        await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate)).catch(() => {});
      } else {
        pendingCandidatesRef.current.push(candidate);
      }
    };

    const onRejected = () => cleanup("declined");
    const onEnded = () => cleanup();

    socket.on("call:incoming", onIncoming);
    socket.on("call:answered", onAnswered);
    socket.on("call:ice-candidate", onIceCandidate);
    socket.on("call:rejected", onRejected);
    socket.on("call:ended", onEnded);

    return () => {
      socket.off("call:incoming", onIncoming);
      socket.off("call:answered", onAnswered);
      socket.off("call:ice-candidate", onIceCandidate);
      socket.off("call:rejected", onRejected);
      socket.off("call:ended", onEnded);
    };
  }, [socket, callState, cleanup, beginTimer]);

  return (
    <CallContext.Provider
      value={{
        callState,
        peer,
        localStream,
        remoteStream,
        micOn,
        cameraOn,
        error,
        elapsedSeconds,
        startCall,
        acceptCall,
        rejectCall,
        endCall,
        toggleMic,
        toggleCamera,
      }}
    >
      {children}
    </CallContext.Provider>
  );
}

export function useCall() {
  const ctx = useContext(CallContext);
  if (!ctx) throw new Error("useCall must be used inside CallProvider");
  return ctx;
}
