import { useState, useEffect } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { auth, db } from '../lib/firebase'

export type UserData = {
  displayName: string | null
  photoURL: string | null
  email: string | null
}

export function useUserData(userId: string) {
  const [userData, setUserData] = useState<UserData | null>(null)

  useEffect(() => {
    // Warten bis Auth initialisiert ist
    const unsubscribeAuth = auth.onAuthStateChanged(() => {
      // Dann erst Firestore subscription starten
      const userRef = doc(db, 'users', userId)
      const unsubscribe = onSnapshot(userRef, (doc) => {
        if (doc.exists()) {
          setUserData({
            displayName: doc.data().name || null,
            photoURL: doc.data().photoURL || null,
            email: doc.data().email || null
          })
        }
      })

      return () => unsubscribe()
    })

    return () => unsubscribeAuth()
  }, [userId])

  return userData
} 