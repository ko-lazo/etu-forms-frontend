import type { Condition, ConditionRule } from '../schema/condition'
import { isEmptyValue } from './input'

type Values = Record<string, unknown>

export function isRule(condition: Condition): condition is ConditionRule {
  return 'field' in condition
}

function compare(a: unknown, b: unknown): number {
  if (typeof a === 'number' && typeof b === 'number') return a - b
  return String(a).localeCompare(String(b))
}

function evaluateRule(rule: ConditionRule, values: Values): boolean {
  const actual = values[rule.field]

  switch (rule.operator) {
    case 'empty':
      return isEmptyValue(actual)
    case 'notEmpty':
      return !isEmptyValue(actual)
    case 'equals':
      return Array.isArray(actual) ? actual.includes(String(rule.value)) : actual === rule.value
    case 'notEquals':
      return Array.isArray(actual) ? !actual.includes(String(rule.value)) : actual !== rule.value
    case 'greaterThan':
      return !isEmptyValue(actual) && compare(actual, rule.value) > 0
    case 'greaterThanOrEqual':
      return !isEmptyValue(actual) && compare(actual, rule.value) >= 0
    case 'lessThan':
      return !isEmptyValue(actual) && compare(actual, rule.value) < 0
    case 'lessThanOrEqual':
      return !isEmptyValue(actual) && compare(actual, rule.value) <= 0
    case 'contains':
      if (Array.isArray(actual)) return actual.includes(String(rule.value))
      return String(actual ?? '').includes(String(rule.value ?? ''))
    case 'notContains':
      if (Array.isArray(actual)) return !actual.includes(String(rule.value))
      return !String(actual ?? '').includes(String(rule.value ?? ''))
  }
}

export function evaluateCondition(condition: Condition | undefined, values: Values): boolean {
  if (!condition) return true

  if (isRule(condition)) {
    return evaluateRule(condition, values)
  }

  if ('and' in condition) {
    return condition.and.every(child => evaluateCondition(child, values))
  }

  return condition.or.some(child => evaluateCondition(child, values))
}
