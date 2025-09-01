import { ValidateOptions, Schema } from '../core.ts'

export namespace BigInt {
  export interface Options {
    max?: bigint
    min?: bigint
  }
}

export class BigInt extends Schema<bigint> {
  type = 'bigint'
  options: BigInt.Options = {}

  max(value: bigint) {
    this.options.max = value
    return this
  }

  min(value: bigint) {
    this.options.min = value
    return this
  }

  validate(value: unknown, options: ValidateOptions) {
    if (typeof value !== 'bigint') return this.failure(value, options.path)
    const { max = Infinity, min = -Infinity } = this.options
    if (value > max) return this.failure(value, options.path, ` greater than ${max}`)
    if (value < min) return this.failure(value, options.path, ` less than ${min}`)
    return { value }
  }
}

export function bigint() {
  return new BigInt()
}
