export const authToken = useCookie<string | null>('auth_token', { default: () => null })
