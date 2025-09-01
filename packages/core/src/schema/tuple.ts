import { ValidateOptions, Schema } from '../core.ts'

namespace $Tuple {
  export interface Options {
    inner: Schema[]
    extra?: Schema // TODO
  }
}

class $Tuple<S, T extends S = S> extends Schema<S, T> {
  type = 'tuple'
  options: $Tuple.Options

  constructor(inner: Schema[]) {
    super()
    this.options = { inner }
  }

  extra(value: Schema) {
    this.options.extra = value
    return this
  }

  format() {
    return `[${this.options.inner.map((schema) => schema.format()).join(', ')}]`
  }

  validate(value: unknown, options: ValidateOptions) {
    if (!Array.isArray(value)) return this.failure(value, options.path)
    const values: any = []
    const issues: Schema.Issue[] = []
    for (let i = 0; i < this.options.inner.length; i++) {
      const result = this.options.inner[i].validate(value[i], {
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

export { $Tuple as Tuple }

export function tuple<S, T extends S = S>(inner: Schema[]) {
  return new $Tuple(inner)
}
