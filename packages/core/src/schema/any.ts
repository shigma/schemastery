import { ValidateOptions, Schema } from '../core.ts'

export namespace Any {}

export class Any<T> extends Schema<T> {
  type = 'any'

  validate(value: unknown, options: ValidateOptions) {
    return { value: value as T }
  }
}

export function any<T = any>() {
  return new Any<T>()
}
