"use client";

import { useEffect, useRef, useState } from "react";

type Mode = "audio" | "video";

export function CallWidget({ selfId, peerId, mode, onClose }: { selfId: string; peerId: string; mode: Mode; onClose: () => void }) {
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localRef = useRef<HTMLVideoElement>(null);
  const remoteRef = useRef<HTMLVideoElement>(null);
  const [since, setSince] = useState<number | undefined>();
  const [status, setStatus] = useState("Inisialisasi...");

  useEffect(() => {
    const pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
    pcRef.current = pc;

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        postSignal({ type: "candidate", data: e.candidate });
      }
    };
    pc.ontrack = (e) => {
      const [stream] = e.streams;
      if (remoteRef.current) {
        remoteRef.current.srcObject = stream;
      }
    };

    (async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: mode === "video" });
      stream.getTracks().forEach((t) => pc.addTrack(t, stream));
      if (localRef.current) localRef.current.srcObject = stream;
      setStatus("Menghubungkan...");
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      await postSignal({ type: "offer", data: offer });
    })();

    const timer = setInterval(async () => {
      const res = await fetch("/api/webrtc/poll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ since }),
      });
      const data = await res.json();
      if (Array.isArray(data.signals) && data.signals.length > 0) {
        setSince(data.signals[data.signals.length - 1].ts);
        for (const s of data.signals) {
          handleSignal(s);
        }
      }
    }, 1000);

    return () => {
      clearInterval(timer);
      pc.getSenders().forEach((s) => s.track?.stop());
      pc.close();
      pcRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const postSignal = async (payload: { type: string; data: any }) => {
    await fetch("/api/webrtc/post", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetId: peerId, type: payload.type, data: payload.data }),
    });
  };

  const handleSignal = async (s: any) => {
    const pc = pcRef.current!;
    if (s.type === "offer" && !pc.currentRemoteDescription) {
      setStatus("Menerima panggilan...");
      await pc.setRemoteDescription(new RTCSessionDescription(s.data));
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: mode === "video" });
      stream.getTracks().forEach((t) => pc.addTrack(t, stream));
      if (localRef.current) localRef.current.srcObject = stream;
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      await postSignal({ type: "answer", data: answer });
      setStatus("Terhubung");
    } else if (s.type === "answer" && pc.localDescription && !pc.currentRemoteDescription) {
      setStatus("Terhubung");
      await pc.setRemoteDescription(new RTCSessionDescription(s.data));
    } else if (s.type === "candidate") {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(s.data));
      } catch (e) {
        // ignore
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-4 w-full max-w-3xl">
        <div className="flex items-center justify-between mb-2">
          <div className="font-semibold">Panggilan {mode === "video" ? "Video" : "Suara"} ? {peerId}</div>
          <button onClick={onClose} className="text-red-600">Tutup</button>
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          <video ref={localRef} playsInline autoPlay muted className="bg-black rounded aspect-video" />
          <video ref={remoteRef} playsInline autoPlay className="bg-black rounded aspect-video" />
        </div>
        <div className="text-sm text-gray-600 mt-2">{status}</div>
      </div>
    </div>
  );
}
