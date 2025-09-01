import { ValidateOptions, Schema } from '../core.ts'

namespace $Dict {
  export interface Options<S, T extends S = S> {
    inner: Schema<S, T>
    key?: Schema<string>
  }
}

class $Dict<S, T extends S = S> extends Schema<Readonly<Record<string, S>>, Record<string, T>> {
  type = 'dict'
  options: $Dict.Options<S, T>

  constructor(inner: Schema<S, T>) {
    super()
    this.options = { inner }
  }

  key(value: Schema<string>) {
    this.options.key = value
    return this
  }

  format() {
    return `Record<${this.options.key ? this.options.key.format() : 'string'}, ${this.options.inner.format()}>`
  }

  validate(value: unknown, options: ValidateOptions) {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      return this.failure(value, options.path)
    }
    const values: Record<string, T> = {}
    const issues: Schema.Issue[] = []
    for (const key in value) {
      if (this.options.key) {
        const keyResult = this.options.key.validate(key, options)
        if (keyResult.issues) {
          issues.push(...keyResult.issues)
        }
      }
      const result = this.options.inner.validate((value as any)[key], {
        ...options,
        path: [...options.path || [], key],
      })
      if (result.issues) {
        issues.push(...result.issues)
      } else {
        values[key] = result.value
      }
    }
    if (issues.length) return { issues }
    return { value: values }
  }
}

export { $Dict as Dict }

export function dict<S, T extends S = S>(inner: Schema<S, T>) {
  return new $Dict(inner)
}
