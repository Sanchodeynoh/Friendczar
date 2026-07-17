import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useSocket } from "./SocketContext.jsx";

const CallContext = createContext(null);

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

  const pcRef = useRef(null);
  const pendingOfferRef = useRef(null);
  const pendingCandidatesRef = useRef([]);

  const cleanup = useCallback(() => {
    pcRef.current?.close();
    pcRef.current = null;
    pendingOfferRef.current = null;
    pendingCandidatesRef.current = [];
    localStream?.getTracks().forEach((t) => t.stop());
    setLocalStream(null);
    setRemoteStream(null);
    setPeer(null);
    setCallState("idle");
    setMicOn(true);
    setCameraOn(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localStream]);

  const createPeerConnection = useCallback(
    (toUserId) => {
      const pc = new RTCPeerConnection({ iceServers: buildIceServers() });
      pc.onicecandidate = (e) => {
        if (e.candidate) socket?.emit("call:ice-candidate", { toUserId, candidate: e.candidate });
      };
      pc.ontrack = (e) => setRemoteStream(e.streams[0]);
      pc.onconnectionstatechange = () => {
        if (["failed", "closed"].includes(pc.connectionState)) cleanup();
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

        const pc = createPeerConnection(toUserId);
        stream.getTracks().forEach((t) => pc.addTrack(t, stream));

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit("call:invite", { toUserId, offer, callType });
      } catch (err) {
        setError(err.message === "Permission denied" ? "Camera/microphone permission was denied." : err.message);
        cleanup();
      }
    },
    [socket, createPeerConnection, cleanup]
  );

  const acceptCall = useCallback(async () => {
    if (!socket || !peer || !pendingOfferRef.current) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: peer.callType === "video" });
      setLocalStream(stream);

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
    } catch (err) {
      setError(err.message === "Permission denied" ? "Camera/microphone permission was denied." : err.message);
      cleanup();
    }
  }, [socket, peer, createPeerConnection, cleanup]);

  const rejectCall = useCallback(() => {
    if (peer) socket?.emit("call:reject", { toUserId: peer.userId });
    cleanup();
  }, [socket, peer, cleanup]);

  const endCall = useCallback(() => {
    if (peer) socket?.emit("call:end", { toUserId: peer.userId });
    cleanup();
  }, [socket, peer, cleanup]);

  const toggleMic = useCallback(() => {
    if (!localStream) return;
    const track = localStream.getAudioTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setMicOn(track.enabled);
    }
  }, [localStream]);

  const toggleCamera = useCallback(() => {
    if (!localStream) return;
    const track = localStream.getVideoTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setCameraOn(track.enabled);
    }
  }, [localStream]);

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
      await pcRef.current.setRemoteDescription(new RTCSessionDescription(answer));
      for (const candidate of pendingCandidatesRef.current) {
        await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate)).catch(() => {});
      }
      pendingCandidatesRef.current = [];
      setCallState("connected");
    };

    const onIceCandidate = async ({ candidate }) => {
      if (pcRef.current?.remoteDescription) {
        await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate)).catch(() => {});
      } else {
        pendingCandidatesRef.current.push(candidate);
      }
    };

    const onRejected = () => cleanup();
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
  }, [socket, callState, cleanup]);

  return (
    <CallContext.Provider
      value={{ callState, peer, localStream, remoteStream, micOn, cameraOn, error, startCall, acceptCall, rejectCall, endCall, toggleMic, toggleCamera }}
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
