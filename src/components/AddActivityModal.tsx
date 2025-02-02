import { useState, useRef, useEffect } from 'react'
import { Activity, ActivityType } from '../App'
import AddActivityTypeModal from './AddActivityTypeModal'
import { playCelebrationAnimation } from './CelebrationAnimation'

type Props = {
  onClose: () => void
  onAdd: (activity: Omit<Activity, 'id' | 'userId'>) => void
  onUpdate?: (activity: Omit<Activity, 'id' | 'userId'>) => void
  activityTypes: ActivityType[]
  onAddActivityType: (type: Omit<ActivityType, 'id'>) => Promise<string>
  editActivity?: Activity | null
}

export default function AddActivityModal({ onClose, onAdd, onUpdate, activityTypes, onAddActivityType, editActivity }: Props) {
  const modalRef = useRef<HTMLDivElement>(null)
  const [typeId, setTypeId] = useState(editActivity?.typeId || activityTypes[0]?.id || '')
  const [value, setValue] = useState(editActivity?.value.toString() || '')
  const [date, setDate] = useState(
    editActivity?.date 
      ? new Date(editActivity.date).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0]
  )
  const [showAddTypeModal, setShowAddTypeModal] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  // Schließen wenn außerhalb geklickt wird
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const activityData = {
        typeId,
        value: Number(value),
        date: new Date(date)
      }
      
      if (editActivity && onUpdate) {
        await onUpdate(activityData)
      } else {
        await onAdd(activityData)
        setShowSuccess(true)
        playCelebrationAnimation()
        
        // Modal nach kurzer Verzögerung schließen
        setTimeout(() => {
          onClose()
        }, 1500)
      }
    } catch (error) {
      console.error('Fehler beim Speichern:', error)
      alert('Fehler beim Speichern der Aktivität. Bitte versuche es erneut.')
    }
  }

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value === 'new') {
      setShowAddTypeModal(true)
    } else {
      setTypeId(e.target.value)
    }
  }

  const handleAddActivityType = async (newType: Omit<ActivityType, 'id'>) => {
    try {
      const newTypeId = await onAddActivityType(newType)
      setTypeId(newTypeId)
      setShowAddTypeModal(false)
    } catch (error) {
      console.error('Error adding activity type:', error)
      alert('Fehler beim Hinzufügen des Aktivitätstyps')
    }
  }

  const selectedType = activityTypes.find(type => type.id === typeId)

  const getUnitLabel = (unit?: 'Kilometer' | 'Minuten') => {
    switch (unit) {
      case 'Kilometer': return 'Kilometer'
      case 'Minuten': return 'Minuten'
      default: return 'Kilometer'
    }
  }

  const getUnitPlaceholder = (unit?: 'Kilometer' | 'Minuten') => {
    switch (unit) {
      case 'Kilometer': return 'Kilometer eingeben'
      case 'Minuten': return 'Minuten eingeben'
      default: return 'Wert eingeben'
    }
  }

  const availableTypes = [...activityTypes]
    .filter(type => {
      if (!editActivity) {
        return type.status === 'active' || !type.status
      }
      
      if (type.status === 'active' || !type.status) return true
      if (type.id === editActivity.typeId) return true
      return false
    })
    .sort((a, b) => {
      if (a.status === 'deleted' && b.status !== 'deleted') return 1
      if (a.status !== 'deleted' && b.status === 'deleted') return -1
      return a.name.localeCompare(b.name)
    })

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div ref={modalRef} className="bg-white p-6 rounded-lg w-full max-w-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              {editActivity ? 'Aktivität bearbeiten' : 'Neue Aktivität'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-1">Sportart</label>
              <select
                value={typeId}
                onChange={handleTypeChange}
                className="w-full p-2 border rounded"
                required
              >
                {availableTypes.map(type => (
                  <option 
                    key={type.id} 
                    value={type.id}
                    className={type.status === 'deleted' ? 'text-gray-500' : 
                               type.status === 'removed' ? 'text-red-500' : ''}
                  >
                    {type.emoji} {type.name}
                    {type.status === 'deleted' ? ' (deaktiviert)' : 
                     type.status === 'removed' ? ' (gelöscht)' : ''}
                  </option>
                ))}
                <option value="new" className="font-medium text-blue-500">
                  + Neue Sportart hinzufügen...
                </option>
              </select>
            </div>
            
            <div>
              <label className="block mb-1">
                {getUnitLabel(selectedType?.unit)}
              </label>
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full p-2 border rounded"
                step="0.1"
                min="0"
                placeholder={getUnitPlaceholder(selectedType?.unit)}
                required
              />
            </div>
            
            <div>
              <label className="block mb-1">Datum</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                {editActivity ? 'Speichern' : 'Hinzufügen'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {showAddTypeModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center" 
          style={{ zIndex: 1000 }}
        >
          <div 
            className="bg-white p-6 rounded-lg w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onMouseUp={(e) => e.stopPropagation()}
          >
            <AddActivityTypeModal
              onClose={() => setShowAddTypeModal(false)}
              onAdd={async (type) => {
                try {
                  const newTypeId = await handleAddActivityType(type)
                  setTypeId(newTypeId)
                  setShowAddTypeModal(false)
                } catch (error) {
                  console.error('Error adding activity type:', error)
                  alert('Fehler beim Hinzufügen der Sportart')
                }
              }}
              onBack={() => setShowAddTypeModal(false)}
            />
          </div>
        </div>
      )}

      {showSuccess && (
        <div className="fixed top-4 right-4 bg-green-100 border-l-4 border-green-500 p-4 rounded shadow-lg animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span role="img" aria-label="celebration" className="text-2xl">
                  🎉
                </span>
              </div>
              <div className="ml-3">
                <p className="text-green-700">
                  Super gemacht! Weiter so! 💪
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="ml-4 text-green-700 hover:text-green-900"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  )
} 