import type { Condition, ConditionRule } from '../schema/condition'
import type { EditorPage } from './editor-model'

function isRule(condition: Condition): condition is ConditionRule {
  return 'field' in condition
}

function renameInCondition(condition: Condition | undefined, from: string, to: string): void {
  if (!condition) return

  if (isRule(condition)) {
    if (condition.field === from) condition.field = to
    return
  }

  const children = 'and' in condition ? condition.and : condition.or
  children.forEach(child => renameInCondition(child, from, to))
}

/**
 * Условия ссылаются на поля по `name`, поэтому переименование
 * пробегается по условиям и переименовывает поля также и в них
 */
export function renameField(pages: EditorPage[], from: string, to: string): void {
  for (const page of pages) {
    page.elements.forEach((element) => {
      if (element.name === from) element.name = to
    })

    renameInCondition(page.visibleIf, from, to)
    page.elements.forEach(element => renameInCondition(element.visibleIf, from, to))
  }
}
