import { describe, test } from 'node:test'
import { expect } from 'chai'
import Schema from 'schemastery'

describe('Schema API', () => {
  test('unknown', () => {
    const validate1 = new Schema({ type: 'unknown' })
    expect(() => validate1(0)).to.throw()

    expect(() => Schema.array(Symbol('unknown'))).to.throw()
  })

  test('any', () => {
    const config = Schema.any()
    expect(config.toString()).to.equal('any')

    expect(config(123)).to.equal(123)
    expect(config(null)).to.equal(null)
  })

  test('never', () => {
    const config = Schema.never()
    expect(config.toString()).to.equal('never')

    expect(config(null)).to.equal(null)
    // @ts-expect-error
    expect(() => config(123)).to.throw()
  })

  test('number', () => {
    const config = Schema.number().min(1).step(2).default(123)
    expect(config.toString()).to.equal('number')

    expect(config(345)).to.equal(345)
    expect(config(null)).to.equal(123)

    // @ts-expect-error
    expect(() => config('123')).to.throw()
    expect(() => config(-1)).to.throw()
    expect(() => config(456)).to.throw()
  })

  test('boolean', () => {
    const config = Schema.boolean().default(true)
    expect(config.toString()).to.equal('boolean')

    expect(config(true)).to.equal(true)
    expect(config(false)).to.equal(false)
    expect(config(null)).to.equal(true)

    // @ts-expect-error
    expect(() => config(1)).to.throw()
  })

  test('function', () => {
    const config = Schema.function()
    expect(config.toString()).to.equal('function')

    expect(config(() => {})).to.be.a('function')
    expect(config(null)).to.equal(null)

    // @ts-expect-error
    expect(() => config(1)).to.throw()
  })

  test('is', () => {
    const config = Schema.is(RegExp)
    expect(config.toString()).to.equal('RegExp')

    expect(config(/1/)).to.deep.equal(/1/)

    // @ts-expect-error
    expect(() => config(1)).to.throw()
    // @ts-expect-error
    expect(() => config('1')).to.throw()
  })

  test('loose', () => {
    const config = Schema.object({
      foo: Schema.union([1, 2, 3]).loose().default(1),
      bar: Schema.union([1, 2, 3]),
    })

    expect(config({ foo: 0, bar: 2 })).to.deep.equal({ foo: 1, bar: 2 })
    expect(() => config({ foo: 2, bar: 0 })).to.throw()
  })
})
