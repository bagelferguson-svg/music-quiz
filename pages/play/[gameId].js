import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { db } from "../../lib/firebase";
import { ref, set, onValue } from "firebase/database";
import AnswerBox from "../../components/AnswerBox";

export default function PlayerScreen() {
  const router = useRouter();
  const { gameId } = router.query;

  const [name, setName] = useState("");
  const [playerId, setPlayerId] = useState(null);
  const [game, setGame] = useState(null);

  useEffect(() => {
    if (!gameId) return;
    const gameRef = ref(db, `games/${gameId}`);
    const unsub = onValue(gameRef, (snap) => {
      setGame(snap.val());
    });
    return () => unsub();
  }, [gameId]);

  async function joinGame() {
    if (!name || !gameId) return;
    let id = null;
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      id = crypto.randomUUID();
    } else {
      id = Math.random().toString(36).slice(2);
    }

    await set(ref(db, `games/${gameId}/players/${id}`), {
      name,
      score: 0,
      joinedAt: Date.now(),
    });

    setPlayerId(id);
  }

  if (!gameId) {
    return <div style={{ padding: 24 }}>Joining game…</div>;
  }

  if (!playerId) {
    return (
      <div style={{ padding: 24, fontFamily: "system-ui" }}>
        <h2>Join Game {gameId}</h2>
        <input
          style={{ padding: 8, display: "block", marginBottom: 8, width: "100%", maxWidth: 320 }}
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

  const state = game?.state || "unknown";
  const inRound = state === "in-round";

  return (
    <div style={{ padding: 24, fontFamily: "system-ui" }}>
      <h3>Player: {name}</h3>
      <p>Game: {gameId}</p>
      {inRound ? (
        <>
          <p>Round in progress — guess the artist!</p>
          <AnswerBox gameId={gameId} playerId={playerId} />
        </>
      ) : (
        <p>Waiting for host to start the next round…</p>
      )}
    </div>
  );
}
