export interface User {
  id: string
  email: string
  createdAt: string
  updatedAt: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  id: string
  userId: string
  name: string
  token: string
  lastUsedAt: string | null
  expiresAt: string | null
  createdAt: string
}
