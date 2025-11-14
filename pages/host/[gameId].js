import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { db } from "../../lib/firebase";
import { ref, onValue, set, get } from "firebase/database";
import songs from "../../lib/songs.json";

export default function HostScreen() {
  const router = useRouter();
  const { gameId } = router.query;

  const [players, setPlayers] = useState([]);
  const [game, setGame] = useState(null);
  const [now, setNow] = useState(Date.now());

  const timerRef = useRef(null);

  useEffect(() => {
    if (!gameId) return;

    const gameRef = ref(db, `games/${gameId}`);
    const unsubGame = onValue(gameRef, (snap) => {
      setGame(snap.val());
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
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameId]);

  useEffect(() => {
    timerRef.current = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(timerRef.current);
  }, []);

  async function startRound() {
    if (!gameId) return;

    const song = songs[Math.floor(Math.random() * songs.length)];
    const durationMs = 20000;
    const startedAt = Date.now();

    await set(ref(db, `games/${gameId}/currentRound`), {
      type: "artist",
      songId: song.id,
      title: song.title,
      artist: song.artist,
      year: song.year,
      youtubeId: song.youtubeId,
      startedAt,
      durationMs,
    });

    await set(ref(db, `games/${gameId}/answers`), null);
    await set(ref(db, `games/${gameId}/state`), "in-round");
  }

  async function endAndScoreRound() {
    if (!gameId || !game?.currentRound) return;

    const correctArtist = game.currentRound.artist.toLowerCase();
    const answersSnap = await get(ref(db, `games/${gameId}/answers`));
    const answersVal = answersSnap.val() || {};
    const answers = Object.values(answersVal);

    const scored = answers.map((a) => ({
      ...a,
      ok: String(a.answer || "").toLowerCase().includes(correctArtist),
    }));

    scored.sort((a, b) => {
      if (a.ok && !b.ok) return -1;
      if (!a.ok && b.ok) return 1;
      return a.ts - b.ts;
    });

    const maxPoints = players.length > 0 ? Math.max(10, players.length * 2) : 10;
    const pointsByPlace = (place) =>
      Math.max(1, Math.floor((maxPoints * (players.length - place + 1)) / players.length));

    const awards = {};
    let place = 1;
    for (const a of scored) {
      const award = a.ok ? pointsByPlace(place) : 0;
      awards[a.playerId] = award;
      place++;
    }
    for (const p of players) {
      if (!awards[p.id]) awards[p.id] = 0;
    }

    for (const p of players) {
      const prev = p.score || 0;
      const add = awards[p.id] || 0;
      await set(ref(db, `games/${gameId}/players/${p.id}/score`), prev + add);
    }

    await set(ref(db, `games/${gameId}/lastRoundResult`), {
      correctArtist: game.currentRound.artist,
      correctTitle: game.currentRound.title,
      awards,
      totalAnswers: answers.length,
    });

    await set(ref(db, `games/${gameId}/state`), "lobby");
    await set(ref(db, `games/${gameId}/currentRound`), null);
    await set(ref(db, `games/${gameId}/answers`), null);
  }

  if (!gameId) {
    return <div style={{ padding: 24 }}>Loading host…</div>;
  }

  const inRound = game?.state === "in-round";
  const cr = game?.currentRound;
  let countdown = null;
  if (inRound && cr) {
    const ends = cr.startedAt + cr.durationMs;
    countdown = Math.max(0, Math.round((ends - now) / 1000));
  }

  return (
    <div style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1>Host — Game {gameId}</h1>

      <section style={{ marginBottom: 24 }}>
        <h2>Controls</h2>
        {!inRound && (
          <button onClick={startRound}>
            Start Artist Round (20s)
          </button>
        )}
        {inRound && (
          <button onClick={endAndScoreRound}>
            End Round &amp; Score Now
          </button>
        )}
        <p style={{ marginTop: 8 }}>
          State: <strong>{game?.state || "unknown"}</strong>
        </p>
        {inRound && countdown !== null && (
          <p>Time remaining: <strong>{countdown}s</strong></p>
        )}
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2>Current Song (host only)</h2>
        {cr ? (
          <>
            <p>
              <strong>{cr.title}</strong> — {cr.artist} ({cr.year})
            </p>
            {cr.youtubeId && (
              <div style={{ marginTop: 8 }}>
                <iframe
                  width="320"
                  height="180"
                  src={`https://www.youtube.com/embed/${cr.youtubeId}?autoplay=1`}
                  title="Song clip"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}
          </>
        ) : (
          <p>No active round.</p>
        )}
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2>Players &amp; Scores</h2>
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

      <section>
        <h2>Last Round Result</h2>
        {game?.lastRoundResult ? (
          <pre style={{ background: "#f5f5f5", padding: 8 }}>
JSON.stringify(game.lastRoundResult, null, 2)
          </pre>
        ) : (
          <p>No round scored yet.</p>
        )}
      </section>
    </div>
  );
}
