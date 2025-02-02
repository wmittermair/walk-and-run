type Props = {
  onConfirm: () => void
  onCancel: () => void
}

export default function DeleteConfirmationModal({ onConfirm, onCancel }: Props) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl transform transition-all">
        <div className="text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-2xl">🗑️</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aktivität löschen
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            Möchtest du diese Aktivität wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
          </p>
        </div>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200"
          >
            Abbrechen
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Löschen
          </button>
        </div>
      </div>
    </div>
  )
} 