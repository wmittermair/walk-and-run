import { useEffect, useState } from 'react'
import { collection, query, where, onSnapshot, orderBy, doc, updateDoc } from 'firebase/firestore'
import { db, messaging } from '../lib/firebase'
import { getToken } from 'firebase/messaging'
import { User, NotificationType } from '../types'

// Cache im localStorage verwalten
const getShownNotifications = (): Set<string> => {
  const cached = localStorage.getItem('shownNotifications')
  return cached ? new Set(JSON.parse(cached)) : new Set()
}

const addToShownNotifications = (id: string) => {
  const shown = getShownNotifications()
  shown.add(id)
  localStorage.setItem('shownNotifications', JSON.stringify([...shown]))
}

export function useNotifications(currentUser: User | null) {
  const [notifications, setNotifications] = useState<NotificationType[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!currentUser) return

    const setupNotifications = async () => {
      try {
        // Berechtigung für Benachrichtigungen einholen
        if (Notification.permission === 'default') {
          await Notification.requestPermission()
        }

        // FCM Token erhalten
        if ('serviceWorker' in navigator) {
          const registration = await navigator.serviceWorker.register('/walk-and-run/firebase-messaging-sw.js', {
            scope: '/walk-and-run/'
          })
          
          await navigator.serviceWorker.ready

          const token = await getToken(messaging, {
            vapidKey: 'BCsZwFscqSZCoKy22g803xnsj32QKfWf4j1Xae3CcbYrWtt-88GbtiqnluKby_aLpphzuW3QROvd0lUCadcETKo',
            serviceWorkerRegistration: registration
          })

          if (token) {
            console.log('FCM Token:', token)
            await updateDoc(doc(db, 'users', currentUser.uid), {
              fcmToken: token
            })
          }
        }
      } catch (error) {
        console.error('Error setting up notifications:', error)
      }
    }

    setupNotifications()

    // Neue Benachrichtigungen überwachen
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', currentUser.uid),
      where('read', '==', false),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newNotifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as NotificationType[]
      
      setNotifications(newNotifications)
      setUnreadCount(newNotifications.length)

      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added' && !getShownNotifications().has(change.doc.id)) {
          addToShownNotifications(change.doc.id)
        }
      })
    })

    return () => unsubscribe()
  }, [currentUser])

  return { notifications, unreadCount }
} 