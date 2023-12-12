import { describe, test } from 'node:test'
import { expect } from 'chai'
import Schema from 'schemastery'

describe('Intersect', () => {
  test('intersect (primitive 1)', () => {
    const validate = Schema.intersect([String, Number])
    expect(validate.toString()).to.equal('string & number')

    expect(validate(null)).to.equal(null)
    // @ts-expect-error
    expect(() => validate('foo')).to.throw()
    // @ts-expect-error
    expect(() => validate(123)).to.throw()
  })

  test('intersect (primitive 2)', () => {
    const validate = Schema.intersect([String, 'foo'])
    expect(validate.toString()).to.equal('string & "foo"')

    expect(validate(null)).to.equal(null)
    expect(validate('foo')).to.equal('foo')
    // @ts-expect-error
    expect(() => validate('bar')).to.throw()
  })

  test('intersect (object)', () => {
    const validate = Schema.intersect([
      Schema.object({ a: Schema.string().default('foo') }),
      Schema.object({ b: Schema.number().required() }),
    ])
    expect(validate.toString()).to.equal('{ a?: string } & { b: number }')

    expect(() => validate(null)).to.throw()
    expect(validate({ b: 1, c: true })).to.deep.equal({ a: 'foo', b: 1, c: true })

    expect(() => validate({})).to.throw()
    // @ts-expect-error
    expect(() => validate({ b: '' })).to.throw()
  })

  test('intersect (nested)', () => {
    const validate = Schema.intersect([
      Schema.intersect([
        Schema.object({ a: Schema.string() }),
        Schema.object({ b: Schema.number() }),
      ]),
      Schema.object({ c: Schema.boolean() }),
    ])
    expect(validate.toString()).to.equal('{ a?: string } & { b?: number } & { c?: boolean }')

    expect(validate(null)).to.deep.equal({})
    expect(validate({})).to.deep.equal({})

    // @ts-expect-error
    expect(() => validate({ b: '' })).to.throw()
    // @ts-expect-error
    expect(() => validate({ c: '' })).to.throw()
  })

  test('intersect (tagged union)', () => {
    // https://github.com/shigma/schemastery/issues/31
    const validate = Schema.intersect([
      Schema.object({ e: Schema.boolean().default(true) }),
      Schema.union([
        Schema.object({
          e: Schema.const(true),
          x: Schema.number().default(114),
        }),
        Schema.object({
          e: Schema.const(false),
          y: Schema.number().default(514),
        })
      ]),
    ])

    expect(validate(null)).to.deep.equal({ e: true, x: 114 })
  })

  test('intersect (shared default)', () => {
    // https://github.com/shigma/schemastery/issues/45
    const validate = Schema.intersect([
      Schema.object({
        a: Schema.boolean().default(true),
        b: Schema.boolean().default(false),
      }),
      Schema.union([
        Schema.object({ a: Schema.const(true) }),
        Schema.object({ a: Schema.const(false) }),
      ]),
    ])

    expect(validate(null)).to.deep.equal({ a: true, b: false })
    expect(validate({ a: null })).to.deep.equal({ a: true, b: false })
    expect(validate({ a: null, b: true })).to.deep.equal({ a: true, b: true })
  })
})
