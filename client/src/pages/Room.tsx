import { useEffect, useRef, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { io, Socket } from "socket.io-client";

const socket: Socket = io(import.meta.env.VITE_API_URL);

function Room() {
  const { state } = useLocation();
  const { roomCode } = useParams();
  const myEmail = state?.email || "Unknown";
  const [otherUser, setOtherUser] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [videoStarted, setVideoStarted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);

  // Handle user join, signaling, and user leave
  useEffect(() => {
    socket.on("user-joined", (data: { email: string }) => {
      setOtherUser(data.email);
    });

    socket.on("user-left", () => {
      setRemoteStream(null);
      setOtherUser(null);
      if (peerConnection.current) {
        peerConnection.current.close();
        peerConnection.current = null;
      }
    });

    socket.on("signal", async (data: any) => {
      if (!peerConnection.current) return;

      if (data.signal.type === "offer") {
        await peerConnection.current.setRemoteDescription(
          new RTCSessionDescription(data.signal)
        );
        const answer = await peerConnection.current.createAnswer();
        await peerConnection.current.setLocalDescription(answer);
        socket.emit("signal", {
          roomCode,
          signal: peerConnection.current.localDescription,
          email: myEmail,
        });
      } else if (data.signal.type === "answer") {
        await peerConnection.current.setRemoteDescription(
          new RTCSessionDescription(data.signal)
        );
      } else if (data.signal.candidate) {
        await peerConnection.current.addIceCandidate(
          new RTCIceCandidate(data.signal)
        );
      }
    });

    return () => {
      socket.off("user-joined");
      socket.off("user-left");
      socket.off("signal");
    };
  }, [myEmail, roomCode]);

  // Attach streams to video elements
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [stream, remoteStream]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (peerConnection.current) {
        peerConnection.current.close();
        peerConnection.current = null;
      }
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (remoteStream) {
        remoteStream.getTracks().forEach((track) => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSendVideo = async () => {
    if (videoStarted) return; // Prevent multiple peer connections
    setVideoStarted(true);

    try {
      const localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setStream(localStream);

      // Peer connection setup
      const pc = new RTCPeerConnection();
      peerConnection.current = pc;

      // Add local tracks
      localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));

      // Handle remote stream
      const remoteMediaStream = new MediaStream();
      setRemoteStream(remoteMediaStream);

      pc.ontrack = (event) => {
        event.streams[0].getTracks().forEach((track) => {
          remoteMediaStream.addTrack(track);
        });
      };

      // ICE candidate handling
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("signal", {
            roomCode,
            signal: event.candidate,
            email: myEmail,
          });
        }
      };

      // Only the first user creates offer
      if (!otherUser) {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit("signal", {
          roomCode,
          signal: offer,
          email: myEmail,
        });
      }
      // Second user waits for offer and responds with answer automatically
    } catch (err) {
      alert(
        "ক্যামেরা চালু করা যায়নি: " +
          (err instanceof Error ? err.message : String(err))
      );
      setVideoStarted(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: 400,
        margin: "100px auto",
        textAlign: "center",
      }}
    >
      <h2>Room: {roomCode}</h2>
      {otherUser ? (
        <p>
          You are connected as <strong>{otherUser}</strong>
        </p>
      ) : (
        <p>Waiting for another user to join...</p>
      )}
      <button
        style={{ padding: 10, marginTop: 20 }}
        onClick={handleSendVideo}
        disabled={videoStarted}
      >
        Send by Video
      </button>
      {stream && (
        <div style={{ marginTop: 20 }}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            controls
            width={320}
            height={240}
          />
        </div>
      )}
      {remoteStream && (
        <div style={{ marginTop: 20 }}>
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            controls
            width={320}
            height={240}
          />
        </div>
      )}
    </div>
  );
}

export default Room;
