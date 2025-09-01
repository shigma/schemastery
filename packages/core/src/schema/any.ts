import { ParseOptions, Schema } from '../core.ts'

export namespace $Any {}

export class $Any<T> extends Schema<T> {
  type = 'any'

  validate(value: unknown, options: ParseOptions) {
    return { value: value as T }
  }
}
