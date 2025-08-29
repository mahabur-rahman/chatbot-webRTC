import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Home() {
  const [email, setEmail] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const navigate = useNavigate();

  const handleEnterRoom = () => {
    if (email && roomCode) {
      navigate(`/room/${roomCode}`, { state: { email } });
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '100px auto', textAlign: 'center' }}>
      <h2>Enter Room</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        style={{ width: '100%', marginBottom: 10, padding: 8 }}
      />
      <input
        type="text"
        placeholder="Room Code"
        value={roomCode}
        onChange={e => setRoomCode(e.target.value)}
        style={{ width: '100%', marginBottom: 10, padding: 8 }}
      />
      <button onClick={handleEnterRoom} style={{ width: '100%', padding: 10 }}>
        Enter Room
      </button>
    </div>
  );
}

export default Home;