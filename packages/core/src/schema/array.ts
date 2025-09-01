import { ValidateOptions, Schema } from '../core.ts'

const isArray = (value: unknown): value is readonly unknown[] => Array.isArray(value)

namespace $Array {
  export interface Options<S, T extends S = S> {
    inner: Schema<S, T>
    length?: Schema<number>
  }
}

class $Array<S, T extends S = S> extends Schema<readonly S[], T[]> {
  type = 'array'
  options: $Array.Options<S, T>

  constructor(inner: Schema<S, T>) {
    super()
    this.options = { inner }
  }

  length(value: Schema<number>) {
    this.options.length = value
    return this
  }

  format(): string {
    return `Array<${this.options.inner.format()}>`
  }

  validate(value: unknown, options: ValidateOptions) {
    if (!isArray(value)) return this.failure(value, options.path)
    if (this.options.length) {
      const result = this.options.length.validate(value.length, options)
      if (result.issues) {
        return this.failure(value, options.path, ` with length ${this.options.length.format()}`)
      }
    }
    const values: T[] = []
    const issues: Schema.Issue[] = []
    for (let i = 0; i < value.length; i++) {
      const result = this.options.inner.validate(value[i], {
        ...options,
        path: [...options.path || [], i],
      })
      if (result.issues) {
        issues.push(...result.issues)
      } else {
        values.push(result.value)
      }
    }
    if (issues.length) return { issues }
    return { value: values }
  }
}

export { $Array as Array }

export function array<S, T extends S = S>(inner: Schema<S, T>) {
  return new $Array(inner)
}
