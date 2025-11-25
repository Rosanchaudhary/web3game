"use client";

import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";

export default function WebRTCCallPage() {
  const [users, setUsers] = useState<string[]>([]);
  const [messages, setMessages] = useState<string[]>([]);
  const [incomingCaller, setIncomingCaller] = useState<string | null>(null);

  const socketRef = useRef<any>(null);
  const pc = useRef<RTCPeerConnection | null>(null);
  const dataChannel = useRef<RTCDataChannel | null>(null);
  const activePeerId = useRef<string | null>(null);

  const roomId = "test-room";

  // ---------------------------------------------------
  // Initialize Socket + WebRTC
  // ---------------------------------------------------
  useEffect(() => {
    const socket = io("http://192.168.2.4:3001");
    socketRef.current = socket;

    socket.emit("join-room", { roomId });

    // Receive list of connected users
    socket.on("room-user-list", (list) => {
      setUsers(list.filter((id: string) => id !== socket.id));
    });

    // Create PeerConnection
    pc.current = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    // ICE candidate → send to specific peer
    pc.current.onicecandidate = (e) => {
      if (e.candidate && activePeerId.current) {
        socket.emit("webrtc-ice", {
          targetId: activePeerId.current,
          from: socket.id,
          candidate: e.candidate,
        });
      }
    };

    // When remote creates data channel
    pc.current.ondatachannel = (event) => {
      dataChannel.current = event.channel;
      setupDataChannel();
    };

    // Incoming CALL (offer)
    socket.on("incoming-call", async ({ offer, from }) => {
      setIncomingCaller(from);

      // Store peer for ICE
      activePeerId.current = from;

      // Wait for user to click Accept/Reject
      acceptCall.current = async () => {
        setIncomingCaller(null);

        await pc.current!.setRemoteDescription(offer);

        const answer = await pc.current!.createAnswer();
        await pc.current!.setLocalDescription(answer);

        socket.emit("answer-call", {
          targetId: from,
          from: socket.id,
          answer,
        });
      };
    });

    // Call answered (answer received)
    socket.on("call-answered", async ({ answer, from }) => {
      await pc.current!.setRemoteDescription(answer);
    });

    // ICE candidate from peer
    socket.on("webrtc-ice", async ({ candidate }) => {
      try {
        await pc.current!.addIceCandidate(candidate);
      } catch (e) {
        console.error("Error adding ICE", e);
      }
    });

    return () => {
      socket.disconnect();
      pc.current?.close();
    };
  }, []);

  // ---------------------------------------------------
  // Setup Data Channel handlers
  // ---------------------------------------------------
  const setupDataChannel = () => {
    if (!dataChannel.current) return;

    dataChannel.current.onopen = () => {
      setMessages((m) => [...m, "🟢 DataChannel connected"]);
    };

    dataChannel.current.onmessage = (e) => {
      setMessages((m) => [...m, "Remote: " + e.data]);
    };
  };

  // ---------------------------------------------------
  // Call a specific user
  // ---------------------------------------------------
  const startCall = async (targetId: string) => {
    if (!pc.current) return;

    activePeerId.current = targetId;

    dataChannel.current = pc.current.createDataChannel("game");
    setupDataChannel();

    const offer = await pc.current.createOffer();
    await pc.current.setLocalDescription(offer);

    socketRef.current.emit("call-user", {
      targetId,
      from: socketRef.current.id,
      offer,
    });
  };

  // Accept call (function assigned dynamically)
  const acceptCall = useRef<() => void>(() => {});

  // ---------------------------------------------------
  // Send message over DataChannel
  // ---------------------------------------------------
  const sendPing = () => {
    if (dataChannel.current?.readyState === "open") {
      dataChannel.current.send("PING");
      setMessages((m) => [...m, "You: PING"]);
    }
  };

  // ---------------------------------------------------
  // UI
  // ---------------------------------------------------
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">WebRTC Direct Calling Demo</h1>

      {/* USERS LIST */}
      <div className="border p-3 rounded">
        <h2 className="font-semibold mb-2">Connected Users:</h2>

        {users.length === 0 && <p>No other users connected...</p>}

        {users.map((uid) => (
          <div key={uid} className="flex items-center gap-3 mb-2">
            <span>{uid}</span>
            <button
              className="px-3 py-1 bg-blue-600 text-white rounded"
              onClick={() => startCall(uid)}
            >
              Call
            </button>
          </div>
        ))}
      </div>

      {/* INCOMING CALL POPUP */}
      {incomingCaller && (
        <div className="p-4 bg-yellow-200 border rounded">
          <p className="font-semibold">Incoming Call from:</p>
          <p className="mb-3">{incomingCaller}</p>

          <button
            className="px-4 py-1 bg-green-600 text-white rounded mr-2"
            onClick={() => acceptCall.current()}
          >
            Accept
          </button>

          <button
            className="px-4 py-1 bg-red-600 text-white rounded"
            onClick={() => setIncomingCaller(null)}
          >
            Reject
          </button>
        </div>
      )}

      {/* SEND MESSAGE */}
      <button
        className="px-4 py-2 bg-green-600 text-white rounded"
        onClick={sendPing}
      >
        Send Ping
      </button>

      {/* MESSAGES */}
      <div className="border p-3 h-64 overflow-auto rounded">
        <h2 className="font-semibold">Messages:</h2>
        {messages.map((m, i) => (
          <p key={i}>{m}</p>
        ))}
      </div>
    </div>
  );
}
