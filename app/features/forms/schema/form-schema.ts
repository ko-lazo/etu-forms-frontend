import { z } from 'zod'
import { conditionSchema } from './condition'

const MAX_PAGES = 50
const MAX_ELEMENTS_PER_PAGE = 200

export const formElementNameSchema = z
  .string()
  .min(1)
  .max(100)
  .regex(/^[a-zA-Z][a-zA-Z0-9_-]*$/)

const baseFieldSchema = z.object({
  name: formElementNameSchema,

  label: z.string().min(1).max(500),

  required: z.boolean().default(false),

  placeholder: z.string().optional(),

  visibleIf: conditionSchema.optional()
})

const choiceOptionSchema = z.object({
  value: z.string(),
  text: z.string()
})

const textValidation = z.object({
  minLength: z.number().int().nonnegative().optional(),
  maxLength: z.number().int().positive().optional()
})

const numberValidation = z.object({
  min: z.number().optional(),
  max: z.number().optional()
})

const fileValidation = z.object({
  maxFileSizeMb: z.number().positive().default(5),
  allowedMimeTypes: z.array(z.string()).min(1).optional(),
  maxFilesCount: z.number().int().positive().default(1)
})

const textFieldSchema = baseFieldSchema.extend({
  type: z.enum(['text', 'email', 'textarea']),
  validation: textValidation.optional()
})

const numberFieldSchema = baseFieldSchema.extend({
  type: z.literal('number'),
  validation: numberValidation.optional()
})

const selectFieldSchema = baseFieldSchema.extend({
  type: z.enum(['dropdown', 'radiogroup', 'checkbox']),
  choices: z.array(choiceOptionSchema).min(1)
})

const fileFieldSchema = baseFieldSchema.extend({
  type: z.literal('file'),
  validation: fileValidation.optional()
})

export const formElementSchema = z.discriminatedUnion('type', [
  textFieldSchema,
  numberFieldSchema,
  selectFieldSchema,
  fileFieldSchema
])

export const formPageSchema = z.object({
  name: z.string().min(1).max(100),
  title: z.string().optional(),
  visibleIf: conditionSchema.optional(),
  elements: z.array(formElementSchema).max(MAX_ELEMENTS_PER_PAGE)
})

export const formSchemaObject = z
  .object({
    pages: z.array(formPageSchema).min(1).max(MAX_PAGES)
  })
  .superRefine((schema, ctx) => {
    validateUniqueElementNames(schema.pages, ctx)
  })

export type FormSchema = z.infer<typeof formSchemaObject>
export type FormElement = z.infer<typeof formElementSchema>
export type FormElementType = FormElement['type']
export type FormPage = z.infer<typeof formPageSchema>
export type ChoiceOption = z.infer<typeof choiceOptionSchema>

function validateUniqueElementNames(pages: FormPage[], ctx: z.RefinementCtx): void {
  const names = new Set<string>()

  pages.forEach((page, pageIndex) => {
    page.elements.forEach((element, elementIndex) => {
      if (names.has(element.name)) {
        ctx.addIssue({
          code: 'custom',
          message: `Поле с именем "${element.name}" уже используется`,
          path: ['pages', pageIndex, 'elements', elementIndex, 'name']
        })
      }

      names.add(element.name)
    })
  })
}
