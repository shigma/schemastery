import { ParseOptions, Schema } from '../core.ts'

export namespace $Object {
  export interface Options {
    items: Record<string, Schema>
    extra?: Schema // TODO
  }
}

export class $Object<S, T extends S = S> extends Schema<S, T> {
  type = 'object'
  options: $Object.Options

  constructor(items: Record<string, Schema>) {
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

  validate(value: unknown, options: ParseOptions) {
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
