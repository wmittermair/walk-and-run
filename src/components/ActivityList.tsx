import { Activity, ActivityType } from '../App'
import { useUserData } from '../hooks/useUserData'
import DeleteConfirmationModal from './DeleteConfirmationModal'
import { useState, useEffect } from 'react'
import { db } from '../lib/firebase'
import { collection, getDocs } from 'firebase/firestore'

// Helper-Funktionen außerhalb der Komponenten
const calculateCost = (value: number, unit: 'Kilometer' | 'Minuten') => {
  if (unit === 'Kilometer') {
    return value * 0.15; // 0,15€ pro km
  } else {
    return (value / 10) * 0.15; // 0,15€ pro 10 Minuten
  }
}

// Neuer Typ für User-Filter
type UserFilter = {
  id: string
  displayName: string | null
  email: string | null
  photoURL: string | null
}

type Props = {
  activities: Activity[]
  activityTypes: ActivityType[]
  currentUserId: string
  onDelete: (id: string) => void
  onEdit: (activity: Activity) => void
  userData: UserFilter[]
  selectedUserId: string
}

type ActivityItemProps = {
  activity: Activity
  type: ActivityType | undefined
  activityTypes: ActivityType[]
  onDelete: (id: string) => void
  onEdit: (activity: Activity) => void
  currentUserId: string
}

const ActivityItem = ({ activity, type, activityTypes, onDelete, onEdit, currentUserId }: ActivityItemProps) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const userData = useUserData(activity.userId)
  const cost = type ? calculateCost(activity.value, type.unit) : 0
  const isOwner = activity.userId === currentUserId

  const formatValue = (value: number, typeId: string) => {
    const type = activityTypes.find(type => type.id === typeId)
    if (!type) return `${value}`
    
    const unitDisplay = type.unit === 'Minuten' ? 'Min.' : 'km'
    return `${value} ${unitDisplay}`
  }

  return (
    <>
      <div className="group flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
        <div className="flex items-center pr-4 mr-4 border-r border-gray-200">
          <div className="w-8 h-8 rounded-full overflow-hidden mr-2">
            {userData?.photoURL ? (
              <img 
                src={userData.photoURL} 
                alt={userData.displayName || ''} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <span className="text-lg">👤</span>
              </div>
            )}
          </div>
          <div className="text-sm text-gray-600">
            {userData?.displayName || userData?.email || 'Unbenannt'}
          </div>
        </div>
        <div className="flex items-center flex-grow">
          <div className="text-2xl mr-4">
            {type?.emoji}
          </div>
          <div className="flex-grow">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="font-medium text-gray-800">
                  {type?.name}
                </span>
                <span className="ml-3 text-gray-600 bg-gray-100 px-3 py-1 rounded-full text-sm">
                  {formatValue(activity.value, activity.typeId)}
                </span>
                <span className="ml-3 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm flex items-center">
                  <span className="mr-1">💰</span>
                  {cost.toFixed(2)}€
                </span>
              </div>
              <div className="flex items-center gap-3">
                {isOwner && (
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onEdit(activity)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                      title="Bearbeiten"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => setShowDeleteModal(true)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                      title="Löschen"
                    >
                      🗑️
                    </button>
                  </div>
                )}
                <div className="text-sm text-gray-500 min-w-[85px] text-right">
                  {new Date(activity.date).toLocaleDateString('de-DE')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <DeleteConfirmationModal
          onConfirm={() => {
            onDelete(activity.id)
            setShowDeleteModal(false)
          }}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
    </>
  )
}

const ActivityList = ({ activities, activityTypes, currentUserId, onDelete, onEdit, userData, selectedUserId }: Props) => {
  // Filter die Aktivitäten nach ausgewähltem Benutzer
  const filteredActivities = selectedUserId === 'all' 
    ? activities 
    : activities.filter(activity => activity.userId === selectedUserId)

  const getActivityType = (typeId: string) => {
    return activityTypes.find(type => type.id === typeId)
  }

  const formatValue = (value: number, typeId: string) => {
    const type = getActivityType(typeId)
    if (!type) return `${value}`
    
    // Einheitliche Abkürzungen
    const unitDisplay = type.unit === 'Minuten' ? 'Min.' : 'km'
    return `${value} ${unitDisplay}`
  }

  const groupByMonth = (activities: Activity[]) => {
    return activities.reduce((groups: Record<string, Activity[]>, activity) => {
      const date = new Date(activity.date)
      const key = `${date.getFullYear()}-${date.getMonth() + 1}`
      if (!groups[key]) {
        groups[key] = []
      }
      groups[key].push(activity)
      return groups
    }, {})
  }

  const groupedActivities = groupByMonth(filteredActivities)

  const calculateMonthSums = (monthActivities: Activity[]) => {
    const sums = {
      kilometer: 0,
      minuten: 0,
      cost: 0
    }

    monthActivities.forEach(activity => {
      const type = getActivityType(activity.typeId)
      if (type?.unit === 'Kilometer') {
        sums.kilometer += activity.value
        sums.cost += calculateCost(activity.value, 'Kilometer')
      } else if (type?.unit === 'Minuten') {
        sums.minuten += activity.value
        sums.cost += calculateCost(activity.value, 'Minuten')
      }
    })

    return sums
  }

  return (
    <div className="space-y-8">
      {/* Dropdown entfernt */}
      {Object.entries(groupedActivities).map(([month, activities]) => {
        const monthSums = calculateMonthSums(activities)
        
        return (
          <div key={month} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="flex justify-between items-center mb-6 border-b pb-2">
              <h2 className="text-2xl font-bold text-gray-800">
                {new Date(month).toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}
              </h2>
              <div className="flex gap-4 text-sm">
                {monthSums.kilometer > 0 && (
                  <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
                    {monthSums.kilometer.toFixed(1)} km gesamt
                  </div>
                )}
                {monthSums.minuten > 0 && (
                  <div className="bg-green-50 text-green-700 px-3 py-1 rounded-full">
                    {monthSums.minuten} Min. gesamt
                  </div>
                )}
                <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full flex items-center">
                  <span className="mr-1">💰</span>
                  {monthSums.cost.toFixed(2)}€
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              {activities.map((activity) => (
                <ActivityItem
                  key={activity.id}
                  activity={activity}
                  type={getActivityType(activity.typeId)}
                  activityTypes={activityTypes}
                  onDelete={onDelete}
                  onEdit={onEdit}
                  currentUserId={currentUserId}
                />
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t text-sm text-gray-500 flex justify-between items-center">
              <div>
                {activities.length} Aktivität{activities.length !== 1 ? 'en' : ''} in diesem Monat
              </div>
              <div className="flex gap-3 text-sm">
                {monthSums.kilometer > 0 && (
                  <span className="text-blue-600">
                    ⌀ {(monthSums.kilometer / activities.filter(a => getActivityType(a.typeId)?.unit === 'Kilometer').length).toFixed(1)} km/Aktivität
                  </span>
                )}
                {monthSums.minuten > 0 && (
                  <span className="text-green-600">
                    ⌀ {Math.round(monthSums.minuten / activities.filter(a => getActivityType(a.typeId)?.unit === 'Minuten').length)} Min./Aktivität
                  </span>
                )}
                <span className="text-yellow-800 flex items-center">
                  <span className="mr-1">💰</span>
                  ⌀ {(monthSums.cost / activities.length).toFixed(2)}€/Aktivität
                </span>
              </div>
            </div>
          </div>
        )
      })}

      {filteredActivities.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl shadow-lg">
          <div className="text-4xl mb-4">📝</div>
          <h3 className="text-xl font-medium text-gray-800 mb-2">
            {selectedUserId === 'all' 
              ? 'Noch keine Aktivitäten'
              : 'Keine Aktivitäten für diesen Benutzer'}
          </h3>
          <p className="text-gray-600">
            {selectedUserId === 'all'
              ? 'Füge deine erste Aktivität hinzu!'
              : 'Wähle einen anderen Benutzer oder zeige alle Aktivitäten an.'}
          </p>
        </div>
      )}
    </div>
  )
}

export default ActivityList 