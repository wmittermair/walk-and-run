import { User, NotificationType } from '../types'
import { useNotifications } from '../hooks/useNotifications'

type Props = {
  user: User
}

export default function NotificationBell({ user }: Props) {
  const { notifications, unreadCount } = useNotifications(user)

  return (
    <div className="relative">
      <button className="p-2 hover:bg-gray-100 rounded-full">
        🔔
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>
      
      {/* Notification Dropdown */}
      {notifications.length > 0 && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl">
          {notifications.map((notification: NotificationType) => (
            <div key={notification.id} className="p-4 border-b hover:bg-gray-50">
              <div className="font-medium">{notification.userName}</div>
              <div className="text-sm text-gray-600">
                hat {notification.value} {notification.unit} {notification.activityType} hinzugefügt
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {new Date(notification.createdAt).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 