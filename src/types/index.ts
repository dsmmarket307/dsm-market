export type UserRole = 'buyer' | 'seller' | 'admin'

export interface Profile {
  id: string
  name: string
  role: UserRole
  created_at: string
}

export interface AuthUser {
  id: string
  email: string
  profile: Profile | null
}