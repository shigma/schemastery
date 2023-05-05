import { expect } from 'chai'
import Schema from 'schemastery'

describe('Intersect', () => {
  it('intersect (primitive 1)', () => {
    const validate = Schema.intersect([String, Number] as const)
    expect(validate.toString()).to.equal('string & number')

    expect(validate(null)).to.equal(null)
    // @ts-expect-error
    expect(() => validate('foo')).to.throw()
    // @ts-expect-error
    expect(() => validate(123)).to.throw()
  })

  it('intersect (primitive 2)', () => {
    const validate = Schema.intersect([String, 'foo'] as const)
    expect(validate.toString()).to.equal('string & "foo"')

    expect(validate(null)).to.equal(null)
    expect(validate('foo')).to.equal('foo')
    // @ts-expect-error
    expect(() => validate('bar')).to.throw()
  })

  it('intersect (object)', () => {
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

  it('intersect (nested)', () => {
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

  it('intersect (tagged union)', () => {
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

  it('intersect (shared default)', () => {
    // https://github.com/shigma/schemastery/issues/45
    const validate = Schema.intersect([
      Schema.object({ a: Schema.boolean().default(true) }),
      Schema.union([
        Schema.object({ b: Schema.const(true) }),
        Schema.object({ b: Schema.const(false) }),
      ]),
    ])

    expect(validate(null)).to.deep.equal({ a: true })
    expect(validate({ a: null })).to.deep.equal({ a: true })
  })
})
