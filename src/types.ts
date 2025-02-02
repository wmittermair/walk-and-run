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
} 