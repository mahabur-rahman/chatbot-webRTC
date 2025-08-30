import { useEffect, useRef, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { io, Socket } from "socket.io-client";

const socket: Socket = io(import.meta.env.VITE_API_URL);

function Room() {
  const { state } = useLocation();
  const { roomCode } = useParams();
  const myEmail = state?.email || "Unknown";
  const [roomUsers, setRoomUsers] = useState<string[]>([]);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [videoStarted, setVideoStarted] = useState(false);
  const [callRequest, setCallRequest] = useState<string | null>(null);
  const [callAccepted, setCallAccepted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);

  // Listen for room users and user leave
  useEffect(() => {
    socket.on("room-users", (users: string[]) => {
      setRoomUsers(users);
    });

    socket.on("user-left", () => {
      setRemoteStream(null);
      setCallAccepted(false);
      setVideoStarted(false);
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

    // Listen for call request
    socket.on("call-request", (fromEmail: string) => {
      setCallRequest(fromEmail);
    });

    // Listen for call accept
    socket.on("call-accept", async () => {
      setCallAccepted(true);
      await startPeerConnection();
    });

    socket.on("call-cancel", () => {
      setCallAccepted(false);
      setVideoStarted(false);
      setRemoteStream(null);
      setCallRequest(null);
      if (peerConnection.current) {
        peerConnection.current.close();
        peerConnection.current = null;
      }
      alert("Call was cancelled.");
    });

    return () => {
      socket.off("room-users");
      socket.off("user-left");
      socket.off("signal");
      socket.off("call-request");
      socket.off("call-accept");
      socket.off("call-cancel");
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
  }, [stream, remoteStream]);

  const startPeerConnection = async () => {
    const pc = new RTCPeerConnection();
    peerConnection.current = pc;

    // Add local tracks
    if (stream) {
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));
    }

    // Handle remote stream
    const remoteMediaStream = new MediaStream();
    setRemoteStream(remoteMediaStream);

    pc.ontrack = (event) => {
      event.streams[0].getTracks().forEach((track) => {
        remoteMediaStream.addTrack(track);
      });
    };

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
    const otherEmails = roomUsers.filter((email) => email !== myEmail);
    if (otherEmails.length === 0) {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit("signal", {
        roomCode,
        signal: offer,
        email: myEmail,
      });
    }
    // Second user waits for offer and responds with answer automatically
  };

  // Send call request
  const handleSendVideo = async () => {
    if (videoStarted) return;
    setVideoStarted(true);
    try {
      const localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setStream(localStream);
      // Notify other user
      socket.emit("call-request", roomUsers.filter((email) => email !== myEmail)[0]);
    } catch (err) {
      alert(
        "ক্যামেরা চালু করা যায়নি: " +
          (err instanceof Error ? err.message : String(err))
      );
      setVideoStarted(false);
    }
  };

  // Accept call
  const handleAccept = async () => {
    setCallAccepted(true);
    setCallRequest(null);
    if (!stream) {
      try {
        const localStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setStream(localStream);
      } catch (err) {
        alert(
          "ক্যামেরা চালু করা যায়নি: " +
            (err instanceof Error ? err.message : String(err))
        );
        setCallAccepted(false);
        return;
      }
    }
    socket.emit("call-accept");
    await startPeerConnection();
  };

  // Cancel call
  const handleCancel = () => {
    setCallRequest(null);
    setVideoStarted(false);
    socket.emit("call-cancel");
  };

  // Find the alternative user's email
  const otherEmails = roomUsers.filter((email) => email !== myEmail);
  const alternativeEmail = otherEmails.length > 0 ? otherEmails[0] : null;

  return (
    <div
      style={{
        maxWidth: 400,
        margin: "100px auto",
        textAlign: "center",
      }}
    >
      <h2>Room: {roomCode}</h2>
      {alternativeEmail ? (
        <p>
          You are connected as <strong>{alternativeEmail}</strong>
        </p>
      ) : (
        <p>Waiting for another user to join...</p>
      )}
      <button
        style={{ padding: 10, marginTop: 20 }}
        onClick={handleSendVideo}
        disabled={videoStarted || callAccepted}
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
      {callRequest && !callAccepted && (
        <div>
          <p>
            Incoming call from <strong>{callRequest}</strong>
          </p>
          <button onClick={handleAccept}>Accept</button>
          <button onClick={handleCancel}>Reject</button>
        </div>
      )}
    </div>
  );
}

export default Room;
