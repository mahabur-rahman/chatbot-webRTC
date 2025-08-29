import { useLocation, useParams } from 'react-router-dom';

function Room() {
  const { state } = useLocation();
  const { roomCode } = useParams();
  const email = state?.email || 'Unknown';

  return (
    <div style={{ maxWidth: 400, margin: '100px auto', textAlign: 'center' }}>
      <h2>Room: {roomCode}</h2>
      <p>You are connected : <strong>{email} (alternative email here)</strong></p>
      <button style={{ padding: 10, marginTop: 20 }}>Send My Video</button>
    </div>
  );
}

export default Room;