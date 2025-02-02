import { useState, useEffect, useRef } from 'react'
import { User } from 'firebase/auth'
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc, orderBy, setDoc, getDocs } from 'firebase/firestore'
import { auth, db, FirebaseActivity, FirebaseActivityType } from './lib/firebase'
import ActivityList from './components/ActivityList'
import AddActivityModal from './components/AddActivityModal'
import Auth from './components/Auth'
import ProfileMenu from './components/ProfileMenu'
import ManageActivityTypesModal from './components/ManageActivityTypesModal'
import FilterModal from './components/FilterModal'
import { UserFilter, UserData } from './types'
import { useNotifications } from './hooks/useNotifications'
import NotificationPrompt from './components/NotificationPrompt'

export type Activity = Omit<FirebaseActivity, 'createdAt'>
export type ActivityType = Omit<FirebaseActivityType, 'createdAt'>

function App() {
  // 1. Alle useState Hooks
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [activityTypes, setActivityTypes] = useState<ActivityType[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editActivity, setEditActivity] = useState<Activity | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [showActivityTypesModal, setShowActivityTypesModal] = useState(false)
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState('all')
  const [users, setUsers] = useState<UserFilter[]>([])

  // 2. Alle useRef Hooks
  const filterButtonRef = useRef<HTMLButtonElement>(null)

  // 3. Alle useEffect Hooks
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  useEffect(() => {
    if (!user) return

    // Initial setzen
    setUserData({
      displayName: user.displayName,
      photoURL: user.photoURL
    })

    // Firestore User-Dokument überwachen
    const userRef = doc(db, 'users', user.uid)
    const unsubscribe = onSnapshot(userRef, (doc) => {
      if (doc.exists()) {
        setUserData({
          displayName: doc.data().name || user.displayName,
          photoURL: doc.data().photoURL || user.photoURL
        })
      }
    })

    return unsubscribe
  }, [user])

  useEffect(() => {
    const q = query(
      collection(db, 'activityTypes'),
      orderBy('createdAt', 'asc'),
      orderBy('name', 'asc')
    )
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const types: ActivityType[] = []
      snapshot.forEach((doc) => {
        types.push({ id: doc.id, ...doc.data() } as ActivityType)
      })
      if (types.length === 0) {
        createDefaultActivityTypes()
      }
      setActivityTypes(types)
    })
    return unsubscribe
  }, [])

  useEffect(() => {
    if (!user) return

    const q = query(
      collection(db, 'activities'),
      orderBy('date', 'desc')
    )
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const acts: Activity[] = []
      snapshot.forEach((doc) => {
        const data = doc.data()
        acts.push({
          id: doc.id,
          typeId: data.typeId,
          value: data.value,
          date: data.date.toDate(),
          userId: data.userId
        })
      })
      setActivities(acts)
    })
    return unsubscribe
  }, [user])

  useEffect(() => {
    if (!showFilterModal) return

    const loadUsers = async () => {
      try {
        const usersRef = collection(db, 'users')
        const snapshot = await getDocs(usersRef)
        const usersList: UserFilter[] = []
        
        snapshot.forEach(doc => {
          const data = doc.data()
          usersList.push({
            id: doc.id,
            displayName: data.name || null,
            email: data.email || null,
            photoURL: data.photoURL || null
          })
        })
        
        setUsers(usersList)
      } catch (error) {
        console.error('Error loading users:', error)
      }
    }

    loadUsers()
  }, [showFilterModal])

  // 4. Notifications Hook (muss nach allen anderen Hooks kommen)
  useNotifications(user)

  const createDefaultActivityTypes = async () => {
    const defaultTypes = [
      {
        id: 'running',
        emoji: '🏃',
        name: 'Laufen',
        unit: 'Kilometer',
        status: 'active' as const,
        createdAt: new Date()
      },
      {
        id: 'walking',
        emoji: '🚶',
        name: 'Gehen',
        unit: 'Kilometer',
        status: 'active' as const,
        createdAt: new Date()
      },
      {
        id: 'gym',
        emoji: '💪',
        name: 'Fitnessstudio',
        unit: 'Minuten',
        status: 'active' as const,
        createdAt: new Date()
      }
    ]

    for (const type of defaultTypes) {
      await setDoc(doc(db, 'activityTypes', type.id), type)
    }
  }

  const handleAddActivity = async (activity: Omit<Activity, 'id' | 'userId'>) => {
    if (!user) return
    
    try {
      // Nur noch die Aktivität speichern
      await addDoc(collection(db, 'activities'), {
        ...activity,
        userId: user.uid,
        createdAt: new Date()
      })

      setIsModalOpen(false)
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleUpdateActivity = async (updatedActivity: Omit<Activity, 'id' | 'userId'>) => {
    if (!user || !editActivity) return

    const activityRef = doc(db, 'activities', editActivity.id)
    await updateDoc(activityRef, {
      ...updatedActivity,
      userId: user.uid
    })
    setEditActivity(null)
    setIsModalOpen(false)
  }

  const handleDeleteActivity = async (activityId: string) => {
    if (!user) return
    
    // Direkt löschen ohne window.confirm
    await deleteDoc(doc(db, 'activities', activityId))
  }

  const handleAddActivityType = async (newType: Omit<ActivityType, 'id'>): Promise<string> => {
    if (!user) throw new Error('Nicht authentifiziert')
    
    try {
      const docRef = await addDoc(collection(db, 'activityTypes'), {
        ...newType,
        status: 'active',
        createdAt: new Date()
      })
      return docRef.id
    } catch (error) {
      console.error('Error adding activity type:', error)
      throw error
    }
  }

  const handleDeleteActivityType = async (typeId: string) => {
    if (!user) return
    
    if (window.confirm('Möchtest du diese Sportart wirklich deaktivieren? Sie kann später wieder aktiviert werden.')) {
      try {
        const typeRef = doc(db, 'activityTypes', typeId)
        await updateDoc(typeRef, { status: 'deleted' })
      } catch (error) {
        console.error('Error deactivating activity type:', error)
        alert('Fehler beim Deaktivieren der Sportart. Bitte versuche es erneut.')
      }
    }
  }

  const handleRestoreActivityType = async (typeId: string) => {
    if (!user) return
    
    try {
      const typeRef = doc(db, 'activityTypes', typeId)
      await updateDoc(typeRef, { status: 'active' })
    } catch (error) {
      console.error('Error restoring activity type:', error)
      alert('Fehler beim Wiederherstellen der Sportart. Bitte versuche es erneut.')
    }
  }

  const handleUpdateActivityType = async (typeId: string, updates: Partial<ActivityType>) => {
    if (!user) return
    
    const typeRef = doc(db, 'activityTypes', typeId)
    await updateDoc(typeRef, updates)
  }

  const handleRemoveActivityType = async (typeId: string) => {
    if (!user) return
    
    try {
      const typeRef = doc(db, 'activityTypes', typeId)
      await updateDoc(typeRef, { status: 'removed' })
    } catch (error) {
      console.error('Error removing activity type:', error)
      alert('Fehler beim Löschen der Sportart. Bitte versuche es erneut.')
    }
  }

  const handleProfileUpdate = (updates: Partial<UserData>) => {
    if (userData) {
      setUserData({
        ...userData,
        displayName: updates.displayName ?? userData.displayName,
        photoURL: updates.photoURL ?? userData.photoURL
      })
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-xl">Laden...</div>
      </div>
    )
  }

  if (!user) {
    return <Auth />
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center space-x-4">
              <h1 className="text-3xl font-bold text-gray-800">Fitness Tracker</h1>
              {user && (
                <ProfileMenu 
                  user={user}
                  onProfileUpdate={handleProfileUpdate}
                />
              )}
            </div>
            <div className="flex items-center space-x-3">
              <button
                ref={filterButtonRef}
                onClick={() => setShowFilterModal(true)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                title="Filter"
              >
                <svg 
                  className="w-5 h-5" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" 
                  />
                </svg>
              </button>
              <button
                onClick={() => setShowActivityTypesModal(true)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                title="Sportarten verwalten"
              >
                <svg 
                  className="w-5 h-5" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </button>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
              >
                Aktivität hinzufügen
              </button>
            </div>
          </div>
          
          <ActivityList 
            activities={activities} 
            activityTypes={activityTypes}
            currentUserId={user.uid}
            onDelete={handleDeleteActivity}
            onEdit={(activity) => {
              setEditActivity(activity)
              setIsModalOpen(true)
            }}
            userData={userData}
            selectedUserId={selectedUserId}
          />
          
          {isModalOpen && (
            <AddActivityModal
              onClose={() => {
                setIsModalOpen(false)
                setEditActivity(null)
              }}
              onAdd={handleAddActivity}
              onUpdate={handleUpdateActivity}
              activityTypes={activityTypes}
              onAddActivityType={handleAddActivityType}
              editActivity={editActivity}
            />
          )}

          {showFilterModal && (
            <FilterModal
              users={users}
              selectedUserId={selectedUserId}
              onFilter={setSelectedUserId}
              onClose={() => setShowFilterModal(false)}
              buttonRef={filterButtonRef}
            />
          )}
        </div>
      </main>
      {showActivityTypesModal && (
        <ManageActivityTypesModal
          activityTypes={activityTypes.filter(type => type.status !== 'removed')}
          onClose={() => setShowActivityTypesModal(false)}
          onDelete={handleDeleteActivityType}
          onAdd={handleAddActivityType}
          onUpdate={handleUpdateActivityType}
          onRestore={handleRestoreActivityType}
          onRemove={handleRemoveActivityType}
        />
      )}
      <NotificationPrompt />
    </div>
  )
}

export default App

