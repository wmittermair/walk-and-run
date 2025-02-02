import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { getMessaging } from 'firebase/messaging'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
export const messaging = getMessaging(app)

// Typen für die Firestore-Dokumente
export type FirebaseUser = {
  id: string
  email: string
  name: string
  avatarUrl?: string
}

export type FirebaseActivity = {
  id: string
  typeId: string
  value: number
  date: Date
  userId: string
  createdAt: Date
}

export type FirebaseActivityType = {
  id: string
  emoji: string
  name: string
  unit: 'Kilometer' | 'Minuten'
  status?: 'active' | 'deleted'
  createdAt: Date
}

export interface Notification {
  id: string
  userId: string
  activityId: string
  activityType: string
  userName: string
  value: number
  unit: string
  createdAt: Date
  read: boolean
} 