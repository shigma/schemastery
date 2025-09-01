import { ParseOptions, Schema } from '../core.ts'

export class $Function extends Schema<Function> {
  type = 'function'

  validate(value: unknown, options: ParseOptions) {
    if (typeof value !== 'function') return this.failure(`expect function but got ${value}`, options.path)
    return { value }
  }
}
