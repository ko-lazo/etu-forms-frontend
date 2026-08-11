import type { Form } from '~/types/form/api'
import type { FormEditorModel } from '~/types/form/editor'

export function createEmptyFormEditorModel(): FormEditorModel {
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

export function formToEditorModel(form: Form): FormEditorModel {
  return {
    id: form.id,
    title: form.title,
    schema: form.schema,
    settings: form.settings
  }
}
