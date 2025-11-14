import { useState } from 'react';
import QRCode from 'react-qr-code';

export default function Home() {
  const [gameId, setGameId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function createGame() {
    try {
      setLoading(true);
      setError(null);
      const r = await fetch('/api/createGame');
      if (!r.ok) throw new Error('Failed to create game');
      const d = await r.json();
      setGameId(d.gameId);
    } catch (e) {
      console.error(e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  return (
    <div style={{ padding: 20, fontFamily: 'system-ui' }}>
      <h1>Music Quiz — Host Lobby</h1>
      {!gameId && (
        <>
          <p>Click the button below to create a new game.</p>
          <button onClick={createGame} disabled={loading}>
            {loading ? 'Creating…' : 'Create Game'}
          </button>
          {error && <p style={{ color: 'red' }}>{error}</p>}
        </>
      )}
      {gameId && (
        <div style={{ marginTop: 20 }}>
          <h2>Game Created</h2>
          <p><strong>Game ID:</strong> {gameId}</p>
          <p>Ask your friends to scan this QR code to join:</p>
          <div style={{ background: 'white', padding: 10, display: 'inline-block' }}>
            <QRCode value={`${origin}/play/${gameId}`} />
          </div>
          <p style={{ marginTop: 10 }}>
            Open the host controller here:{' '}
            <a href={`/host/${gameId}`}>{origin}/host/{gameId}</a>
          </p>
        </div>
      )}
    </div>
  );
}
