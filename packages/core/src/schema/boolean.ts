import { ValidateOptions, Schema } from '../core.ts'

class $Boolean extends Schema<boolean> {
  type = 'boolean'

  validate(value: unknown, options: ValidateOptions) {
    if (typeof value !== 'boolean') return this.failure(value, options.path)
    return { value }
  }
}

export { $Boolean as Boolean }

export function boolean() {
  return new $Boolean()
}
