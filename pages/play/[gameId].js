import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { db } from '../../lib/firebase';
import { ref, set, onValue } from 'firebase/database';
import AnswerBox from '../../components/AnswerBox';

export default function PlayerScreen() {
  const router = useRouter();
  const { gameId } = router.query;

  const [name, setName] = useState('');
  const [playerId, setPlayerId] = useState(null);
  const [gameState, setGameState] = useState(null);

  useEffect(() => {
    if (!gameId) return;
    const gameRef = ref(db, `games/${gameId}`);
    const unsub = onValue(gameRef, (snap) => {
      setGameState(snap.val());
    });
    return () => unsub();
  }, [gameId]);

  async function joinGame() {
    if (!name || !gameId) return;
    const id = crypto.randomUUID();
    const playerRef = ref(db, `games/${gameId}/players/${id}`);
    await set(playerRef, {
      name,
      score: 0,
      joinedAt: Date.now()
    });
    setPlayerId(id);
  }

  if (!gameId) {
    return <div style={{ padding: 20 }}>Joining…</div>;
  }

  if (!playerId) {
    return (
      <div style={{ padding: 20, fontFamily: 'system-ui' }}>
        <h2>Join Game {gameId}</h2>
        <input
          style={{ padding: 8, display: 'block', marginBottom: 8 }}
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button disabled={!name} onClick={joinGame}>
          Join
        </button>
      </div>
    );
  }

  const isRoundActive = gameState && gameState.state === 'in-round';

  return (
    <div style={{ padding: 20, fontFamily: 'system-ui' }}>
      <h3>Player: {name}</h3>
      <p>Game: {gameId}</p>
      {isRoundActive ? (
        <AnswerBox gameId={gameId} playerId={playerId} />
      ) : (
        <p>Waiting for host to start a round…</p>
      )}
    </div>
  );
}
