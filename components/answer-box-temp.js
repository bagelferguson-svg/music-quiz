import { useEffect, useState } from "react";
import Fuse from "fuse.js";
import songs from "../lib/songs.json";
import { db } from "../lib/firebase";
import { ref, push } from "firebase/database";

const artistList = Array.from(new Set(songs.map((s) => s.artist))).map((a) => ({
  name: a,
}));

const fuse = new Fuse(artistList, {
  keys: ["name"],
  threshold: 0.3,
});

export default function AnswerBox({ gameId, playerId, disabled }) {
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    if (input.length >= 3) {
      const results = fuse.search(input).slice(0, 6).map((r) => r.item.name);
      setSuggestions(results);
    } else {
      setSuggestions([]);
    }
  }, [input]);

  async function submit(answer) {
    if (!answer || disabled) return;
    const trimmed = String(answer).trim();
    if (!trimmed) return;

    await push(ref(db, `games/${gameId}/answers`), {
      playerId,
      answer: trimmed,
      ts: Date.now(),
    });

    setInput("");
    setSuggestions([]);
  }

  return (
    <div style={{ marginTop: 16 }}>
      <input
        style={{ padding: 8, width: "100%", boxSizing: "border-box" }}
        placeholder="Type artist name…"
        value={input}
        disabled={disabled}
        onChange={(e) => setInput(e.target.value)}
      />
      <button
        style={{ marginTop: 8 }}
        disabled={disabled || !input}
        onClick={() => submit(input)}
      >
        Submit
      </button>
      <div style={{ marginTop: 8 }}>
        {suggestions.map((s, i) => (
          <div
            key={i}
            style={{
              cursor: "pointer",
              padding: "4px 0",
              borderBottom: "1px solid #eee",
            }}
            onClick={() => submit(s)}
          >
            {s}
          </div>
        ))}
      </div>
    </div>
  );
}
