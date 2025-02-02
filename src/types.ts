import { User as FirebaseUser } from 'firebase/auth'

export type UserFilter = {
  id: string
  displayName: string | null
  email: string | null
  photoURL: string | null
}

export type ActivityType = {
  id: string
  emoji: string
  name: string
  unit: 'Kilometer' | 'Minuten'
  status?: 'active' | 'deleted' | 'removed'
  createdAt: Date
}

export type Activity = {
  id: string
  typeId: string
  value: number
  date: Date
  userId: string
  createdAt: Date
}

export type NotificationType = {
  id: string
  userId: string
  activityId: string
  activityType: string
  userName: string
  value: number
  unit: string
  createdAt: Date
  read: boolean
}

export type UserData = {
  displayName: string | null
  photoURL: string | null
}

// Re-export Firebase User type
export type User = FirebaseUser 