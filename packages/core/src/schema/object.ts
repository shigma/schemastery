import { ValidateOptions, Schema } from '../core.ts'

namespace _Object {
  export interface Options {
    items: Readonly<Record<string, Schema>>
    extra?: Schema // TODO
  }
}

class _Object<S, T extends S = S> extends Schema<S, T> {
  type = 'object'
  options: _Object.Options

  constructor(items: Readonly<Record<string, Schema>>) {
    super()
    this.options = { items }
  }

  extra(value: Schema) {
    this.options.extra = value
    return this
  }

  format() {
    const defs = Object.entries(this.options.items).map(([key, schema]) => `${key}: ${schema.format()}`)
    return `{ ${defs.join(', ')} }`
  }

  validate(value: unknown, options: ValidateOptions): Schema.Result<T> {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      return this.failure(value, options.path)
    }
    const source: any = value
    const target: any = {}
    const issues: Schema.Issue[] = []
    for (const key in this.options.items) {
      const schema = this.options.items[key]
      const result = schema.validate(source[key], {
        ...options,
        path: [...options.path || [], key],
      })
      if (result.issues) {
        issues.push(...result.issues)
      } else {
        target[key] = result.value
      }
    }
    if (issues.length) return { issues }
    return { value: target }
  }
}

export { _Object as Object }

type ObjectS<X extends Readonly<Record<string, unknown>>> = {
  [K in keyof X]: Schema.InferS<X[K]>
}

type ObjectT<X extends Readonly<Record<string, unknown>>> = {
  [K in keyof X]: Schema.InferT<X[K]>
}

export function object<const X extends Readonly<Record<string, unknown>>>(items: X) {
  return new _Object<ObjectS<X>, ObjectT<X>>(Object.fromEntries(
    Object.entries(items).map(([key, schema]) => [key, Schema.from(schema)]),
  ))
}
