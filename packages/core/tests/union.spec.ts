import { describe, test } from 'node:test'
import { expect } from 'chai'
import Schema from 'schemastery'

describe('Union', () => {
  test('primitive', () => {
    const config = Schema.union([1, 2])
    expect(config.toString()).to.equal('1 | 2')

    expect(config(null)).to.equal(null)
    expect(config(2)).to.equal(2)

    // @ts-expect-error
    expect(() => config('1')).to.throw()
  })

  test('object', () => {
    const validate = Schema.union([
      Schema.object({ a: 'foo', b: Schema.number() }),
      Schema.object({ a: 'bar', c: Schema.string() }),
    ])
    expect(validate.toString()).to.equal('{ a: "foo", b?: number } | { a: "bar", c?: string }')

    expect(validate(null)).to.equal(null)
    expect(validate({ a: 'foo', b: 123 })).to.deep.equal({ a: 'foo', b: 123 })
    expect(validate({ a: 'bar', c: 'x' })).to.deep.equal({ a: 'bar', c: 'x' })

    expect(() => validate([])).to.throw()
    expect(() => validate({ b: 123 })).to.throw()
    expect(() => validate({ c: 'x' })).to.throw()
  })

  test('default', () => {
    const validate = Schema.union([
      Schema.object({ a: 'foo', b: Schema.number().default(123) }),
      Schema.object({ a: 'bar', b: Schema.number().default(456) }),
    ])
    expect(validate.toString()).to.equal('{ a: "foo", b?: number } | { a: "bar", b?: number }')

    expect(validate(null)).to.equal(null)
    expect(validate({ a: 'foo' })).to.deep.equal({ a: 'foo', b: 123 })
    expect(validate({ a: 'bar' })).to.deep.equal({ a: 'bar', b: 456 })
  })

  test('error detail', () => {
    const validate = Schema.union([
      Schema.object({ a: Schema.const('foo'), b: Schema.number().required() }),
      Schema.object({ a: Schema.const('bar'), c: Schema.string().required() }),
    ])

    // A branch failure that names a property carries what the union mismatch cannot.
    expect(() => validate({ a: 'foo' })).to.throw('$.b missing required value')
    expect(() => validate({ a: 'foo' })).to.throw('$.a expected bar but got foo')

    // Nested unions report absolute paths.
    expect(() => Schema.object({ x: validate })({ x: { a: 'foo' } })).to.throw('$.x.b missing required value')

    // Branches that failed at the union's own path restate the mismatch, so they add nothing.
    // @ts-expect-error
    expect(() => Schema.union([1, 2])('3')).to.throw(/^expected 1 \| 2 but got "3"$/)
  })
})
