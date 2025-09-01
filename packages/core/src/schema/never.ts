import { ParseOptions, Schema } from '../core.ts'

export namespace $Never {}

export class $Never<T> extends Schema<T> {
  type = 'never'

  validate(value: unknown, options: ParseOptions) {
    return this.failure(`expect never but got ${value}`, options.path)
  }
}
