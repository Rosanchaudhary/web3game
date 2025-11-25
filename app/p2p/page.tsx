"use client";

import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";

export default function WebRTCVideoCall() {
  const [users, setUsers] = useState<string[]>([]);
  const [incomingCaller, setIncomingCaller] = useState<string | null>(null);
  const [inCall, setInCall] = useState(false);

  const socketRef = useRef<any>(null);
  const pc = useRef<RTCPeerConnection | null>(null);

  const localStream = useRef<MediaStream | null>(null);
  const remoteStream = useRef<MediaStream | null>(null);

  const activePeerId = useRef<string | null>(null);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

  const acceptCall = useRef<() => void>(() => {});
  const roomId = "video-room-1";

  // =====================================================================
  // Create new RTCPeerConnection + media
  // =====================================================================
  const initPeerConnection = async () => {
    console.log("🔄 Creating new peer connection");

    // Camera + mic
    localStream.current = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = localStream.current;
    }

    // Prepare remote stream
    remoteStream.current = new MediaStream();
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream.current;
    }

    // Create PeerConnection
    pc.current = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    // Add local tracks
    localStream.current.getTracks().forEach((track) => {
      pc.current!.addTrack(track, localStream.current!);
    });

    // Handle remote tracks
    pc.current.ontrack = (event) => {
      event.streams[0].getTracks().forEach((track) => {
        remoteStream.current!.addTrack(track);
      });
    };

    // ICE sending
    pc.current.onicecandidate = (e) => {
      if (e.candidate && activePeerId.current) {
        socketRef.current.emit("webrtc-ice", {
          targetId: activePeerId.current,
          from: socketRef.current.id,
          candidate: e.candidate,
        });
      }
    };
  };

  // =====================================================================
  // Cleanup function (local + remote)
  // =====================================================================
  const endCall = (fromRemote = false) => {
    console.log("📞 Ending call");

    setIncomingCaller(null);
    setInCall(false);

    // Notify remote peer unless they notified us
    if (!fromRemote && activePeerId.current) {
      socketRef.current.emit("end-call", {
        targetId: activePeerId.current,
      });
    }

    // Close RTCPeerConnection
    if (pc.current) {
      pc.current.ontrack = null;
      pc.current.onicecandidate = null;
      pc.current.close();
      pc.current = null;
    }

    // Stop local tracks
    if (localStream.current) {
      localStream.current.getTracks().forEach((t) => t.stop());
      localStream.current = null;
    }

    // Stop remote tracks
    if (remoteStream.current) {
      remoteStream.current.getTracks().forEach((t) => t.stop());
      remoteStream.current = null;
    }

    // Clear video elements
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;

    // Reset connection
    activePeerId.current = null;

    // Recreate peer connection
    setTimeout(() => initPeerConnection(), 300);
  };

  // =====================================================================
  // User starts a call
  // =====================================================================
  const startCall = async (targetId: string) => {
    console.log("📞 Starting call to", targetId);
    activePeerId.current = targetId;
    setInCall(true);

    const offer = await pc.current!.createOffer();
    await pc.current!.setLocalDescription(offer);

    socketRef.current.emit("call-user", {
      targetId,
      from: socketRef.current.id,
      offer,
    });
  };

  // =====================================================================
  // Socket setup + signaling logic
  // =====================================================================
  useEffect(() => {
    const socket = io("http://192.168.2.4:3001");
    socketRef.current = socket;

    // Join room
    socket.emit("join-room", { roomId });

    // Room user list
    socket.on("room-user-list", (list) => {
      setUsers(list.filter((id: string) => id !== socket.id));
    });

    // Incoming call
    socket.on("incoming-call", async ({ offer, from }) => {
      console.log("📥 Incoming call from", from);

      activePeerId.current = from;
      setIncomingCaller(from);

      acceptCall.current = async () => {
        setIncomingCaller(null);
        setInCall(true);

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

    // Remote answered
    socket.on("call-answered", async ({ answer }) => {
      console.log("📤 Call answered");
      await pc.current!.setRemoteDescription(answer);
    });

    // ICE from remote
    socket.on("webrtc-ice", async ({ candidate }) => {
      if (candidate) {
        try {
          await pc.current!.addIceCandidate(candidate);
        } catch (err) {
          console.error("ICE error:", err);
        }
      }
    });

    // Remote ended call
    socket.on("call-ended", () => {
      console.log("⚠ Remote ended the call");
      endCall(true);
    });

    // Create first peer connection
    initPeerConnection();

    return () => {
      socket.disconnect();
      pc.current?.close();
    };
  }, []);

  // =====================================================================
  // UI
  // =====================================================================
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">WebRTC Video Call</h1>

      {/* User List */}
      <div className="border p-3 rounded">
        <h2 className="font-semibold mb-2">Users in Room:</h2>

        {users.length === 0 && <p>No users connected...</p>}

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

      {/* Incoming Call */}
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

      {/* End Call */}
      {inCall && (
        <button
          className="px-4 py-2 bg-red-600 text-white rounded mb-4"
          onClick={() => endCall(false)}
        >
          End Call
        </button>
      )}

      {/* Video UI */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h2 className="font-semibold">You</h2>
          <video ref={localVideoRef} autoPlay playsInline className="w-full rounded" />
        </div>

        <div>
          <h2 className="font-semibold">Remote</h2>
          <video ref={remoteVideoRef} autoPlay playsInline className="w-full rounded" />
        </div>
      </div>
    </div>
  );
}
