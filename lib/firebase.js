import { initializeApp, getApps } from "firebase/app";
import { getDatabase } from "firebase/database";
import { firebaseConfig } from "./firebaseConfig";

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

export const db = getDatabase(app);
