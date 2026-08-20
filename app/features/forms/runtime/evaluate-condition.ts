import type { Condition, ConditionRule } from '../schema/condition'
import { isEmptyAnswer } from './answers'

type Answers = Record<string, unknown>

export function isRule(condition: Condition): condition is ConditionRule {
  return 'field' in condition
}

function compare(a: unknown, b: unknown): number {
  if (typeof a === 'number' && typeof b === 'number') return a - b
  return String(a).localeCompare(String(b))
}

function evaluateRule(rule: ConditionRule, answers: Answers): boolean {
  const actual = answers[rule.field]

  switch (rule.operator) {
    case 'empty':
      return isEmptyAnswer(actual)
    case 'notEmpty':
      return !isEmptyAnswer(actual)
    case 'equals':
      return Array.isArray(actual) ? actual.includes(String(rule.value)) : actual === rule.value
    case 'notEquals':
      return Array.isArray(actual) ? !actual.includes(String(rule.value)) : actual !== rule.value
    case 'greaterThan':
      return !isEmptyAnswer(actual) && compare(actual, rule.value) > 0
    case 'greaterThanOrEqual':
      return !isEmptyAnswer(actual) && compare(actual, rule.value) >= 0
    case 'lessThan':
      return !isEmptyAnswer(actual) && compare(actual, rule.value) < 0
    case 'lessThanOrEqual':
      return !isEmptyAnswer(actual) && compare(actual, rule.value) <= 0
    case 'contains':
      if (Array.isArray(actual)) return actual.includes(String(rule.value))
      return String(actual ?? '').includes(String(rule.value ?? ''))
    case 'notContains':
      if (Array.isArray(actual)) return !actual.includes(String(rule.value))
      return !String(actual ?? '').includes(String(rule.value ?? ''))
  }
}

export function evaluateCondition(condition: Condition | undefined, answers: Answers): boolean {
  if (!condition) return true

  if (isRule(condition)) {
    return evaluateRule(condition, answers)
  }

  if ('and' in condition) {
    return condition.and.every(child => evaluateCondition(child, answers))
  }

  return condition.or.some(child => evaluateCondition(child, answers))
}
