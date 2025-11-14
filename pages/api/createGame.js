import { db } from "../../../lib/firebase";
import { ref, set } from "firebase/database";
import { v4 as uuidv4 } from "uuid";

export default async function handler(req, res) {
  if (req.method !== "POST" && req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const rawId = uuidv4().slice(0, 6);
  const gameId = rawId.toUpperCase();

  const gameRef = ref(db, `games/${gameId}`);

  const initial = {
    state: "lobby",
    createdAt: Date.now(),
    currentRound: null
  };

  await set(gameRef, initial);

  return res.status(200).json({ gameId });
}
