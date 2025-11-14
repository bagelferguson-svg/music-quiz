import { useState } from 'react';
import QRCode from 'react-qr-code';

export default function Home() {
  const [gameId, setGameId] = useState(null);

  async function createGame() {
    const r = await fetch('/api/createGame');
    const d = await r.json();
    setGameId(d.gameId);
  }

  return (
    <div>
      <h1>Music Quiz</h1>
      {!gameId && <button onClick={createGame}>Create Game</button>}
      {gameId && (
        <div>
          <p>Game ID: {gameId}</p>
          <QRCode value={`${typeof window !== 'undefined' ? window.location.origin : ''}/play/${gameId}`} />
          <p><a href={`/host/${gameId}`}>Go to Host</a></p>
        </div>
      )}
    </div>
  );
}