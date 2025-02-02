import { useState, useRef } from 'react'
import { User } from 'firebase/auth'
import { auth, storage, db } from '../lib/firebase'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { updateProfile } from 'firebase/auth'
import { doc, updateDoc, setDoc } from 'firebase/firestore'
import ImageCropModal from './ImageCropModal'

type Props = {
  user: User
  onProfileUpdate: (data: { displayName?: string | null; photoURL?: string | null }) => void
}

export default function ProfileMenu({ user, onProfileUpdate }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [displayName, setDisplayName] = useState(user.displayName || '')
  const [cropImageUrl, setCropImageUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUpdateName = async () => {
    if (!displayName.trim()) return

    try {
      setIsUploading(true)
      
      // Zuerst Firebase Auth aktualisieren
      await updateProfile(user, { 
        displayName: displayName.trim() 
      })
      
      // Dann Firestore aktualisieren
      const userRef = doc(db, 'users', user.uid)
      await setDoc(userRef, {
        name: displayName.trim(),
        email: user.email,
        updatedAt: new Date(),
        photoURL: user.photoURL || null,  // Füge auch das Profilbild hinzu
        uid: user.uid  // Speichere die User-ID
      }, { merge: true })
      
      onProfileUpdate({ displayName: displayName.trim() })
      setIsEditing(false)
    } catch (error: any) {  // Explizite Fehlertypisierung
      console.error('Error updating name:', error)
      
      // Detailliertere Fehlermeldung
      let errorMessage = 'Fehler beim Aktualisieren des Namens. '
      if (error.code === 'permission-denied') {
        errorMessage += 'Keine Berechtigung.'
      } else if (error.code === 'not-found') {
        errorMessage += 'Benutzer nicht gefunden.'
      } else {
        errorMessage += 'Bitte versuche es erneut.'
      }
      
      alert(errorMessage)
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      setCropImageUrl(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleSaveCroppedImage = async (croppedImage: Blob) => {
    try {
      setIsUploading(true)
      const storageRef = ref(storage, `avatars/${user.uid}`)
      await uploadBytes(storageRef, croppedImage)
      const photoURL = await getDownloadURL(storageRef)
      
      // Zuerst in Auth aktualisieren
      await updateProfile(user, { photoURL })
      
      // Dann in Firestore mit der gleichen URL speichern
      const userRef = doc(db, 'users', user.uid)
      await updateDoc(userRef, {
        photoURL: photoURL
      })

      onProfileUpdate({ photoURL })
      setIsOpen(false)
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Fehler beim Hochladen des Bildes. Bitte versuche es erneut.')
    } finally {
      setIsUploading(false)
      setCropImageUrl(null)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 focus:outline-none"
      >
        <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200">
          {user.photoURL ? (
            <img 
              src={user.photoURL} 
              alt="Profile" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-lg">👤</span>
            </div>
          )}
        </div>
        <svg 
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg py-1 z-10">
          <div className="px-4 py-2 border-b">
            <div className="text-sm text-gray-600">Angemeldet als</div>
            <div className="text-sm font-medium truncate">{user.email}</div>
          </div>

          <div className="px-4 py-2 border-b">
            <div className="text-sm text-gray-600">Name</div>
            {isEditing ? (
              <div className="flex items-center mt-1">
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleUpdateName()
                    }
                  }}
                  className="flex-grow text-sm p-1.5 border rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                  placeholder="Dein Name"
                  autoFocus
                />
                <div className="flex ml-2">
                  <button
                    onClick={handleUpdateName}
                    disabled={isUploading}
                    className="p-1.5 text-white bg-blue-500 hover:bg-blue-600 rounded-l flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Speichern"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false)
                      setDisplayName(user.displayName || '')
                    }}
                    className="p-1.5 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-r border-l border-gray-200 flex items-center justify-center"
                    title="Abbrechen"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium truncate">
                  {user.displayName || user.email}
                </div>
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-sm text-blue-500 hover:text-blue-700"
                >
                  Ändern
                </button>
              </div>
            )}
          </div>
          
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50"
            disabled={isUploading}
          >
            {isUploading ? 'Wird hochgeladen...' : 'Profilbild ändern'}
          </button>
          
          <button
            onClick={() => auth.signOut()}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Abmelden
          </button>
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*"
        className="hidden"
      />

      {cropImageUrl && (
        <ImageCropModal
          imageUrl={cropImageUrl}
          onClose={() => setCropImageUrl(null)}
          onSave={handleSaveCroppedImage}
        />
      )}
    </div>
  )
} 