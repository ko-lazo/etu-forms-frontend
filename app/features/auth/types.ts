import type { Schemas } from '~/api/types'

export type User = Schemas['User']

export type LoginRequest = Schemas['LoginRequest']

/** Логин возвращает выпущенный токен сессии, а не пользователя */
export type IssuedToken = Schemas['IssuedApiToken']
