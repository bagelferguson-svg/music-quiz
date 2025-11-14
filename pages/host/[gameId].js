import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import { db } from '../../lib/firebase';
import { ref, onValue, set } from 'firebase/database';
import songs from '../../lib/songs.json';

export default function HostScreen() {
  const router = useRouter();
  const { gameId } = router.query;

  const [players, setPlayers] = useState([]);
  const [gameState, setGameState] = useState(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (!gameId) return;

    const gameRef = ref(db, `games/${gameId}`);
    const unsubGame = onValue(gameRef, (snap) => {
      setGameState(snap.val());
    });

    const playersRef = ref(db, `games/${gameId}/players`);
    const unsubPlayers = onValue(playersRef, (snap) => {
      const val = snap.val() || {};
      const list = Object.entries(val).map(([id, p]) => ({ id, ...p }));
      list.sort((a, b) => (b.score || 0) - (a.score || 0));
      setPlayers(list);
    });

    return () => {
      unsubGame();
      unsubPlayers();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [gameId]);

  async function startRound() {
    if (!gameId) return;
    // Pick a random song from sample list
    const song = songs[Math.floor(Math.random() * songs.length)];

    await set(ref(db, `games/${gameId}/currentSong`), {
      songId: song.id,
      title: song.title,
      artist: song.artist,
      year: song.year,
      youtubeId: song.youtubeId,
      startedAt: Date.now()
    });

    // Clear previous answers
    await set(ref(db, `games/${gameId}/answers`), null);

    // Set state to in-round
    await set(ref(db, `games/${gameId}/state`), 'in-round');

    // For now, just auto-finish the round after 20s by setting state back to lobby
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(async () => {
      await set(ref(db, `games/${gameId}/state`), 'lobby');
    }, 20000);
  }

  if (!gameId) {
    return <div style={{ padding: 20 }}>Loading host…</div>;
  }

  return (
    <div style={{ padding: 20, fontFamily: 'system-ui' }}>
      <h1>Host — Game {gameId}</h1>

      <section style={{ marginBottom: 20 }}>
        <h2>Controls</h2>
        <button onClick={startRound}>Start Artist Round (20s)</button>
        <p style={{ marginTop: 8 }}>
          State: <strong>{gameState?.state || 'unknown'}</strong>
        </p>
        {gameState?.currentSong && (
          <div style={{ marginTop: 10 }}>
            <p><strong>Current Song (hidden from players):</strong></p>
            <p>{gameState.currentSong.title} — {gameState.currentSong.artist}</p>
          </div>
        )}
      </section>

      <section>
        <h2>Players & Scores</h2>
        {players.length === 0 && <p>No players joined yet.</p>}
        {players.length > 0 && (
          <ol>
            {players.map((p) => (
              <li key={p.id}>
                {p.name} — {p.score || 0} pts
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
