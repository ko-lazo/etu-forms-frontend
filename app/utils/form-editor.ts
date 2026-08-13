import type { Form } from '~/types/form/form'
import type { FormEditorModel } from '~/types/form/editor'
import type { EditorModel, EditorPage } from '~/types/form/editor'
import type { FormSchemaDto } from '~/types/form/schema/form-schema.schema'
import { formEditorSchema } from '~/types/form/editor'
import { createUid } from '~/utils/uid'

function withUids(schema: FormSchemaDto): { pages: EditorPage[] } {
  return {
    pages: schema.pages.map(page => ({
      ...page,
      elements: page.elements.map(element => ({ ...element, _uid: createUid() }))
    }))
  }
}

export function createEmptyFormEditorModel(): EditorModel {
  return {
    title: '',
    schema: {
      pages: [
        { name: 'page1', title: 'Страница 1', elements: [] }
      ]
    },
    settings: {}
  }
}

export function formToEditorModel(form: Form): EditorModel {
  return {
    id: form.id,
    title: form.title,
    schema: withUids(form.schema),
    settings: form.settings
  }
}
