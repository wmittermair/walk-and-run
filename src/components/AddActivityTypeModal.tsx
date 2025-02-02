import { useState, useRef } from 'react'
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import { ActivityType } from '../App'

type Props = {
  onClose: () => void
  onAdd: (type: Omit<ActivityType, 'id'>) => Promise<void>
  editType?: ActivityType
  onBack?: () => void
}

export default function AddActivityTypeModal({ onClose, onAdd, editType, onBack }: Props) {
  const [name, setName] = useState(editType?.name || '')
  const [emoji, setEmoji] = useState(editType?.emoji || '🏃')
  const [unit, setUnit] = useState<'Kilometer' | 'Minuten'>(editType?.unit || 'Kilometer')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const emojiPickerRef = useRef<HTMLDivElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await onAdd({ emoji, name, unit })
    } catch (error) {
      console.error('Fehler beim Hinzufügen der Sportart:', error)
      alert('Fehler beim Hinzufügen der Sportart. Bitte versuche es erneut.')
    }
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          {onBack && (
            <button
              onClick={onBack}
              className="mr-4 text-gray-600 hover:text-gray-800 flex items-center"
              type="button"
            >
              <span className="mr-1">←</span> Zurück
            </button>
          )}
          <h2 className="text-xl font-semibold">
            {editType ? 'Sportart bearbeiten' : 'Neue Sportart'}
          </h2>
        </div>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
          type="button"
        >
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Emoji</label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="text-2xl p-2 border rounded hover:bg-gray-50"
            >
              {emoji}
            </button>
            {showEmojiPicker && (
              <div 
                ref={emojiPickerRef}
                className="absolute left-0 top-12 z-50"
              >
                <Picker
                  data={data}
                  onEmojiSelect={(emoji: any) => {
                    setEmoji(emoji.native)
                    setShowEmojiPicker(false)
                  }}
                />
              </div>
            )}
          </div>
        </div>
        
        <div>
          <label className="block mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="z.B. Radfahren"
            required
          />
        </div>
        
        <div>
          <label className="block mb-1">Einheit</label>
          <select
            value={unit}
            onChange={(e) => setUnit(e.target.value as 'Kilometer' | 'Minuten')}
            className="w-full p-2 border rounded"
          >
            <option value="Kilometer">Kilometer</option>
            <option value="Minuten">Minuten</option>
          </select>
        </div>
        
        <div className="flex justify-end space-x-2">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {editType ? 'Speichern' : 'Hinzufügen'}
          </button>
        </div>
      </form>
    </div>
  )
} 