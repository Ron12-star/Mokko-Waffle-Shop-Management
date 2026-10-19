"use client";
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

export function getSocket(): Socket {
  if (!socket) {
    socket = io(BACKEND_URL, {
      transports: ["websocket", "polling"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socket.on("connect", () => {
      console.log("🔌 Connected to MOKKO realtime server:", socket?.id);
    });

    socket.on("connect_error", (err) => {
      console.warn("⚠️ Realtime connection attempt:", err.message);
    });
  }
  return socket;
}

/**
 * Pleasant restaurant chime using Web Audio API
 * No external MP3 file needed — plays reliably on all browsers!
 */
export function playChime(isUrgent = false) {
  try {
    const AudioContextClass =
      window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // Frequencies: High crisp chime
    const freq1 = isUrgent ? 880 : 587.33; // D5 or A5
    const freq2 = isUrgent ? 1174.66 : 880; // D6 or A5

    // Tone 1
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(freq1, now);
    gain1.gain.setValueAtTime(0.3, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.6);

    // Tone 2 (delayed slightly for bell chime effect)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(freq2, now + 0.15);
    gain2.gain.setValueAtTime(0.35, now + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.85);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.15);
    osc2.stop(now + 0.85);
  } catch (e) {
    console.warn("Audio chime could not be played:", e);
  }
}
