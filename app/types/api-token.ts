import { z } from 'zod'

export const apiToken = z.object({
  id: z.uuid(),
  name: z.string(),
  lastUsedAt: z.string().nullable(),
  expiresAt: z.string().nullable(),
  createdAt: z.string()
})

export const apiTokenCreated = apiToken.extend({
  token: z.string()
})

export const apiTokenSave = z.object({
  name: z.string(),
  expiresAt: z.string().nullable()
})

export type ApiToken = z.infer<typeof apiToken>
export type ApiTokenCreated = z.infer<typeof apiTokenCreated>
export type ApiTokenSave = z.infer<typeof apiTokenSave>
