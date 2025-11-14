import { db } from '../../../lib/firebase';
import { ref, set } from 'firebase/database';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req, res) {
  const gameId = uuidv4().slice(0,6);
  await set(ref(db, `games/${gameId}`), {
    state: 'waiting',
    players: {}
  });
  res.status(200).json({ gameId });
}