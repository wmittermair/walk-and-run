import { useState } from 'react'
import { ActivityType } from '../App'
import AddActivityTypeModal from './AddActivityTypeModal'

type Props = {
  activityTypes: ActivityType[]
  onClose: () => void
  onDelete: (id: string) => Promise<void>
  onAdd: (type: Omit<ActivityType, 'id'>) => Promise<string>
  onUpdate: (id: string, type: Partial<ActivityType>) => Promise<void>
  onRestore: (id: string) => Promise<void>
  onRemove: (id: string) => Promise<void>
}

export default function ManageActivityTypesModal({ activityTypes, onClose, onDelete, onAdd, onUpdate, onRestore, onRemove }: Props) {
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingType, setEditingType] = useState<ActivityType | null>(null)
  const [activeTab, setActiveTab] = useState<'active' | 'deleted'>('active')

  const activeTypes = activityTypes.filter(type => type.status !== 'deleted')
  const deletedTypes = activityTypes.filter(type => type.status === 'deleted')

  const handleEdit = (type: ActivityType) => {
    setEditingType(type)
    setShowAddModal(true)
  }

  const handleRemove = async (typeId: string) => {
    if (window.confirm('Diese Sportart wird gelöscht und erscheint nirgendwo mehr in der App. Die bisherigen Aktivitäten bleiben erhalten. Fortfahren?')) {
      await onRemove(typeId)
    }
  }

  if (showAddModal) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg w-full max-w-md">
          <AddActivityTypeModal
            onClose={() => {
              setShowAddModal(false)
              setEditingType(null)
            }}
            onAdd={async (updates) => {
              if (editingType) {
                await onUpdate(editingType.id, updates)
              } else {
                await onAdd(updates)
              }
              setShowAddModal(false)
              setEditingType(null)
            }}
            editType={editingType || undefined}
            onBack={() => {
              setShowAddModal(false)
              setEditingType(null)
            }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Sportarten verwalten</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b mb-4">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-4 py-2 -mb-px ${
              activeTab === 'active'
                ? 'border-b-2 border-blue-500 text-blue-600 font-medium'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Aktiv ({activeTypes.length})
          </button>
          <button
            onClick={() => setActiveTab('deleted')}
            className={`px-4 py-2 -mb-px ${
              activeTab === 'deleted'
                ? 'border-b-2 border-blue-500 text-blue-600 font-medium'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Deaktiviert ({deletedTypes.length})
          </button>
        </div>

        {activeTab === 'active' ? (
          <div className="space-y-2">
            {activeTypes.map(type => (
              <div key={type.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                <div className="flex items-center space-x-2">
                  <span className="text-xl">{type.emoji}</span>
                  <span>{type.name}</span>
                  <span className="text-sm text-gray-500">({type.unit})</span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(type)}
                    className="p-1 text-gray-600 hover:text-gray-800"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => onDelete(type.id)}
                    className="p-1 text-gray-600 hover:text-gray-800"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2 mb-4">
            {deletedTypes.map((type) => (
              <div 
                key={type.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{type.emoji}</span>
                  <span className="font-medium">{type.name}</span>
                  <span className="text-sm text-gray-500">({type.unit})</span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => onRestore(type.id)}
                    className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                    title="Wiederherstellen"
                  >
                    ↩️
                  </button>
                  <button
                    onClick={() => handleRemove(type.id)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                    title="Löschen"
                  >
                    ❌
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={() => setShowAddModal(true)}
          className="w-full mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          + Neue Sportart hinzufügen
        </button>
      </div>
    </div>
  )
} 