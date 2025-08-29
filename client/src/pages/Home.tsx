import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_API_URL);

function Home() {
  const [email, setEmail] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleEnterRoom = () => {
    if (!email || !roomCode) {
      setError("Email এবং Room Code দিতে হবে");
      return;
    }
    // সার্ভারে join-room ইভেন্ট পাঠান
    socket.emit("join-room", { email, roomCode }, (response: any) => {
      if (response?.status === "joined") {
        navigate(`/room/${roomCode}`, { state: { email } });
      } else {
        setError("রুমে প্রবেশ করা যায়নি");
      }
    });
  };

  return (
    <div style={{ maxWidth: 400, margin: "100px auto", textAlign: "center" }}>
      <h2>Enter Room</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ width: "100%", marginBottom: 10, padding: 8 }}
      />
      <input
        type="text"
        placeholder="Room Code"
        value={roomCode}
        onChange={(e) => setRoomCode(e.target.value)}
        style={{ width: "100%", marginBottom: 10, padding: 8 }}
      />
      <button onClick={handleEnterRoom} style={{ width: "100%", padding: 10 }}>
        Enter Room
      </button>
      {error && <div style={{ color: "red", marginTop: 10 }}>{error}</div>}
    </div>
  );
}

export default Home;
