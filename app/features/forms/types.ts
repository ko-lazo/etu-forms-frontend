import type { Schemas } from '~/api/types'
import type { FormSchema } from './schema/form-schema'

export type Form = Omit<Schemas['Form'], 'schema'> & { schema: FormSchema }

export type FormSave = Omit<Schemas['FormWriteRequest'], 'schema'> & { schema: FormSchema }

export type FormStatus = Schemas['FormStatus']
