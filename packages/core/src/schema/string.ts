import { ParseOptions, Schema } from '../core.ts'

export namespace $String {
  export interface Options {
    length?: Schema<number>
    pattern?: RegExp
  }
}

export class $String extends Schema<string> {
  type = 'string'
  options: $String.Options = {}

  length(value: Schema<number>) {
    this.options.length = value
    return this
  }

  pattern(value: RegExp) {
    this.options.pattern = value
    return this
  }

  validate(value: unknown, options: ParseOptions) {
    if (typeof value !== 'string') return this.failure(value, options.path)
    if (this.options.pattern) {
      const regexp = new RegExp(this.options.pattern.source, this.options.pattern.flags)
      if (!regexp.test(value)) {
        return this.failure(value, options.path, ` to match ${regexp}`)
      }
    }
    if (this.options.length) {
      const result = this.options.length.validate(value.length, options)
      if (result.issues) {
        return this.failure(value, options.path, ` with length ${this.options.length.format()}`)
      }
    }
    return { value }
  }
}
