import { isNullable } from 'cosmokit'
import { ParseOptions, Schema } from '../core.ts'

export namespace $Is {
  export interface Options {
    constructor: { name: string }
  }
}

export class $Is<T> extends Schema<T> {
  type = 'is'
  options: $Is.Options

  constructor(constructor: { name: string }) {
    super()
    this.options = { constructor }
  }

  format() {
    return this.options.constructor.name
  }

  validate(value: unknown, options: ParseOptions) {
    let isValid: boolean
    if (typeof this.options.constructor === 'function') {
      isValid = value instanceof this.options.constructor
    } else if (isNullable(value)) {
      isValid = false
    } else {
      isValid = false
      const { name } = this.options.constructor
      let prototype = Object.getPrototypeOf(value)
      while (prototype) {
        if (prototype.constructor?.name === name) {
          isValid = true
          break
        }
        prototype = Object.getPrototypeOf(prototype)
      }
    }
    if (!isValid) return this.failure(`expect ${this.options.constructor.name} but got ${value}`, options.path)
    return { value: value as T }
  }
}
