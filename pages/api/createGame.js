import { db } from '../../../lib/firebase';
import { ref, set } from 'firebase/database';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const gameId = uuidv4().slice(0, 6).toUpperCase();

  const gameRef = ref(db, `games/${gameId}`);
  const initialData = {
    state: 'lobby', // lobby | in-round | finished
    createdAt: Date.now(),
    currentSong: null
  };

  await set(gameRef, initialData);

  res.status(200).json({ gameId });
}
