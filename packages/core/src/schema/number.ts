import { ParseOptions, Schema } from '../core.ts'

function decimalShift(data: number, digits: number) {
  const str = data.toString()
  if (str.includes('e')) return data * Math.pow(10, digits)
  const index = str.indexOf('.')
  if (index === -1) return data * Math.pow(10, digits)
  const frac = str.slice(index + 1)
  const integer = str.slice(0, index)
  if (frac.length <= digits) return +(integer + frac.padEnd(digits, '0'))
  return +(integer + frac.slice(0, digits) + '.' + frac.slice(digits))
}

function isMultipleOf(data: number, min: number, step: number) {
  step = Math.abs(step)
  if (!/^\d+\.\d+$/.test(step.toString())) {
    return (data - min) % step === 0
  }
  const index = step.toString().indexOf('.')
  const digits = step.toString().slice(index + 1).length
  return Math.abs(decimalShift(data, digits) - decimalShift(min, digits)) % decimalShift(step, digits) === 0
}

export namespace $Number {
  export interface Options {
    max?: number
    min?: number
    step?: number
  }
}

export class $Number extends Schema<number> {
  type = 'number'
  options: $Number.Options = {}

  max(value: number) {
    this.options.max = value
    return this
  }

  min(value: number) {
    this.options.min = value
    return this
  }

  step(value: number) {
    this.options.step = value
    return this
  }

  validate(value: unknown, options: ParseOptions) {
    if (typeof value !== 'number') return this.failure(value, options.path)
    const { max = Infinity, min = -Infinity } = this.options
    if (value > max) return this.failure(value, options.path, ` greater than ${max}`)
    if (value < min) return this.failure(value, options.path, ` less than ${min}`)
    const { step } = this.options
    if (step && !isMultipleOf(value, this.options.min ?? 0, step)) {
      return this.failure(value, options.path, ` multiple of ${step}`)
    }
    return { value }
  }
}
