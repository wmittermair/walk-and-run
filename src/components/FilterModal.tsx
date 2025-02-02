import { useRef, useEffect } from 'react'
import { UserFilter } from '../types'

type Props = {
  users: UserFilter[]
  selectedUserId: string
  onFilter: (userId: string) => void
  onClose: () => void
  buttonRef: React.RefObject<HTMLButtonElement>
}

export default function FilterModal({ users, selectedUserId, onFilter, onClose, buttonRef }: Props) {
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node) &&
          buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  const buttonRect = buttonRef.current?.getBoundingClientRect()
  const topPosition = buttonRect ? buttonRect.bottom + window.scrollY + 8 : 0
  const rightPosition = buttonRect ? window.innerWidth - buttonRect.right : 0

  return (
    <div
      ref={modalRef}
      className="fixed bg-white rounded-lg shadow-xl border border-gray-200 w-64 z-50"
      style={{
        top: `${topPosition}px`,
        right: `${rightPosition}px`
      }}
    >
      <div className="p-3">
        <h3 className="text-sm font-medium text-gray-700 mb-2">
          Aktivitäten filtern
        </h3>
        <select
          value={selectedUserId}
          onChange={(e) => {
            onFilter(e.target.value)
            onClose()
          }}
          className="w-full p-2 text-sm border rounded bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">Alle Benutzer</option>
          {users.map(user => (
            <option key={user.id} value={user.id}>
              {user.displayName || user.email || 'Unbekannter Benutzer'}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
} 