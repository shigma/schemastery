import { ParseOptions, Schema } from '../core.ts'

export class $Boolean extends Schema<boolean> {
  type = 'boolean'

  validate(value: unknown, options: ParseOptions) {
    if (typeof value !== 'boolean') return this.failure(`expect boolean but got ${value}`, options.path)
    return { value }
  }
}
