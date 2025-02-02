import { useState, useEffect } from 'react'

export default function NotificationPrompt() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (Notification.permission === 'default') {
      setShow(true)
    }
  }, [])

  if (!show) return null

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg max-w-sm">
      <h3 className="font-medium mb-2">Benachrichtigungen aktivieren?</h3>
      <p className="text-sm text-gray-600 mb-4">
        Erhalte eine Benachrichtigung, wenn andere Benutzer neue Aktivitäten hinzufügen.
      </p>
      <div className="flex justify-end space-x-2">
        <button
          onClick={() => setShow(false)}
          className="px-3 py-1 text-gray-600 hover:text-gray-800"
        >
          Später
        </button>
        <button
          onClick={async () => {
            const permission = await Notification.requestPermission()
            if (permission === 'granted') {
              setShow(false)
            }
          }}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Aktivieren
        </button>
      </div>
    </div>
  )
} 