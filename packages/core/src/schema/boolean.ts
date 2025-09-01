import { ValidateOptions, Schema } from '../core.ts'

export class Boolean extends Schema<boolean> {
  type = 'boolean'

  validate(value: unknown, options: ValidateOptions) {
    if (typeof value !== 'boolean') return this.failure(value, options.path)
    return { value }
  }
}

export function boolean() {
  return new Boolean()
}
