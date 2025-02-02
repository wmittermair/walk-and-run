import { useState, useRef } from 'react'
import { auth, db, storage } from '../lib/firebase'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { doc, setDoc } from 'firebase/firestore'

export default function Auth() {
  const [loading, setLoading] = useState(false)
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password)
      } else {
        // Registrierung mit Profilbild
        const { user } = await createUserWithEmailAndPassword(auth, email, password)
        
        // Profilbild hochladen wenn vorhanden
        let photoURL = ''
        if (avatarFile) {
          const storageRef = ref(storage, `avatars/${user.uid}`)
          await uploadBytes(storageRef, avatarFile)
          photoURL = await getDownloadURL(storageRef)
        }

        // Profil aktualisieren
        await updateProfile(user, {
          displayName: name,
          photoURL: photoURL
        })

        // Benutzerdaten in Firestore speichern
        await setDoc(doc(db, 'users', user.uid), {
          name,
          email: user.email,
          photoURL,
          createdAt: new Date()
        })
      }
    } catch (error) {
      console.error('Auth error:', error)
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setAvatarFile(e.target.files[0])
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow">
        <div>
          <h1 className="text-center text-3xl font-bold">Fitness Tracker</h1>
          <p className="mt-2 text-center text-gray-600">
            {isLogin ? 'Melde dich an' : 'Erstelle einen Account'}
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Profilbild
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                <div className="mt-1 flex items-center space-x-4">
                  <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    {avatarFile ? (
                      <img
                        src={URL.createObjectURL(avatarFile)}
                        alt="Avatar preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl">👤</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-2 text-sm text-blue-600 hover:text-blue-800"
                  >
                    Bild auswählen
                  </button>
                </div>
              </div>
            </>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email Adresse
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Passwort
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            disabled={loading}
          >
            {loading ? 'Laden...' : (isLogin ? 'Anmelden' : 'Registrieren')}
          </button>
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="w-full text-sm text-gray-600 hover:text-gray-800"
          >
            {isLogin ? 'Noch keinen Account? Registrieren' : 'Bereits registriert? Anmelden'}
          </button>
        </form>
      </div>
    </div>
  )
} 