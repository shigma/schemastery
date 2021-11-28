import { expect } from 'chai'
import Schema from 'schemastery/src'

describe('Schema API', () => {
  it('unknown', () => {
    const validate = new Schema({ type: 'unknown' })
    expect(() => validate(0)).to.throw()
  })

  it('any', () => {
    const config = Schema.any()
    expect(config(123)).to.equal(123)
    expect(config(null)).to.equal(null)
  })

  it('never', () => {
    const config = Schema.never()
    expect(config(null)).to.equal(null)
    // @ts-expect-error
    expect(() => config(123)).to.throw()
  })

  it('string', () => {
    const config = Schema.string().default('bar')

    expect(config('foo')).to.equal('foo')
    expect(config(String('foo'))).to.equal('foo')
    expect(config('')).to.equal('')
    expect(config(null)).to.equal('bar')

    // @ts-expect-error
    expect(() => config(123)).to.throw()
  })

  it('number', () => {
    const config = Schema.number().default(123)

    expect(config(456)).to.equal(456)
    expect(config(Number(456))).to.equal(456)
    expect(config(0)).to.equal(0)
    expect(config(null)).to.equal(123)

    // @ts-expect-error
    expect(() => config('123')).to.throw()
  })

  it('array', () => {
    const Config = Schema.array(Schema.string())

    expect(new Config([])).to.deep.equal([])
    expect(new Config(['foo'])).to.deep.equal(['foo'])

    // @ts-expect-error
    expect(() => new Config('')).to.throw()
    // @ts-expect-error
    expect(() => new Config({})).to.throw()
    // @ts-expect-error
    expect(() => new Config([0])).to.throw()
  })

  it('dict', () => {
    const Config = Schema.dict(Schema.number())

    expect(new Config({ a: 1 })).to.deep.equal({ a: 1 })
    expect(new Config({})).to.deep.equal({})
    expect(new Config(null)).to.deep.equal({})

    // @ts-expect-error
    expect(() => new Config(1)).to.throw()
    // @ts-expect-error
    expect(() => new Config([])).to.throw()
    // @ts-expect-error
    expect(() => new Config({ a: '' })).to.throw()
  })

  it('tuple', () => {
    const Config = Schema.tuple([
      Schema.string().required(),
      Schema.number().default(123),
      Schema.boolean(),
    ] as const)

    expect(new Config(['foo'])).to.deep.equal(['foo', 123, undefined])
    expect(new Config(['foo', 0])).to.deep.equal(['foo', 0, undefined])
    expect(new Config(['foo', 0, true])).to.deep.equal(['foo', 0, true])
    expect(new Config(['foo', 0, true, {}])).to.deep.equal(['foo', 0, true, {}])

    // @ts-expect-error
    expect(() => new Config({})).to.throw()
    // @ts-expect-error
    expect(() => new Config(['foo', 'bar'])).to.throw()
  })

  it('object', () => {
    const Config = Schema.object({
      a: Schema.string().required(),
      b: Schema.number().default(123),
    })

    const original = { a: 'foo', c: true }
    expect(new Config(original)).to.deep.equal({ a: 'foo', b: 123, c: true })
    expect(new Config({ a: 'foo', b: 0 })).to.deep.equal({ a: 'foo', b: 0 })

    expect(() => new Config({})).to.throw()
    expect(() => new Config([])).to.throw()
    // @ts-expect-error
    expect(() => new Config({ a: 0 })).to.throw()
    // @ts-expect-error
    expect(() => new Config({ a: '', b: '' })).to.throw()

    // we resolve value without modifying the original object
    expect(original).to.deep.equal({ a: 'foo', c: true })
  })

  it('union (primitive)', () => {
    const config = Schema.union([
      Schema.const(1 as const),
      Schema.const(2 as const),
    ])

    expect(config(2)).to.equal(2)

    // @ts-expect-error
    expect(() => config('1')).to.throw()
  })

  it('union (object)', () => {
    const validate = Schema.union([
      Schema.object({ a: Schema.const('foo' as const).required(), b: Schema.number() }),
      Schema.object({ a: Schema.const('bar' as const).required(), b: Schema.string() }),
    ])

    expect(validate(null)).to.equal(null)
    expect(validate({ a: 'foo', b: 123 })).to.deep.equal({ a: 'foo', b: 123 })
    expect(validate({ a: 'bar', b: 'x' })).to.deep.equal({ a: 'bar', b: 'x' })

    expect(() => validate([])).to.throw()
    expect(() => validate({ b: 123 })).to.throw()
    expect(() => validate({ b: 'x' })).to.throw()
  })

  it('intersect (primitive)', () => {
    const validate = Schema.intersect([
      Schema.string(),
      Schema.number(),
    ])

    expect(validate(null)).to.equal(null)

    // @ts-expect-error
    expect(() => validate('foo')).to.throw()
    // @ts-expect-error
    expect(() => validate(123)).to.throw()
  })

  it('intersect (object)', () => {
    const validate = Schema.intersect([
      Schema.object({ a: Schema.string().default('foo') }),
      Schema.object({ b: Schema.number().required() }),
    ])

    expect(validate(null)).to.equal(null)
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

    expect(validate(null)).to.equal(null)
    expect(validate({})).to.deep.equal({})

    // @ts-expect-error
    expect(() => validate({ b: '' })).to.throw()
    // @ts-expect-error
    expect(() => validate({ c: '' })).to.throw()
  })

  it('adapt with array', () => {
    const Config = Schema.array(Schema.union([
      Schema.string(),
      Schema.transform(Schema.number(), data => data.toString()),
    ]))

    const original = ['456', 123]
    expect(new Config(original)).to.deep.equal(['456', '123'])
    // modify original data during adaptation
    expect(original).to.deep.equal(['456', '123'])

    // @ts-expect-error
    expect(() => new Config({})).to.throw()
    // @ts-expect-error
    expect(() => new Config([{}])).to.throw()
  })

  it('adapt with object', () => {
    const Config = Schema.object({
      foo: Schema.union([
        Schema.array(Schema.number()),
        Schema.transform(Schema.number(), data => [data]),
      ]).default([]),
    })

    // modify original data during adaptation
    const original = { foo: 0 }
    expect(new Config(original)).to.deep.equal({ foo: [0] })
    expect(original).to.deep.equal({ foo: [0] })

    expect(new Config({})).to.deep.equal({ foo: [] })
    expect(new Config({ foo: [1] })).to.deep.equal({ foo: [1] })

    // @ts-expect-error
    expect(() => new Config({ foo: '' })).to.throw()
    // @ts-expect-error
    expect(() => new Config({ foo: [''] })).to.throw()
  })

  it('adapt with intersect', () => {
    const Inner = Schema.object({
      a: Schema.number().required(),
      d: Schema.number().default(0),
    })

    const Config = Schema.intersect([
      Schema.object({ c: Schema.number() }),
      Schema.union([
        Schema.object({ b: Schema.number().required() }),
        Schema.transform(Inner, data => ({ b: [data] })),
      ]),
    ])

    // modify original data during adaptation
    const original = { a: 1, c: 3, e: 5 }
    expect(new Config(original)).to.deep.equal({ b: [{ a: 1, d: 0 }], c: 3, e: 5 })
    expect(original).to.deep.equal({ b: [{ a: 1 }], c: 3, e: 5 })

    expect(() => new Config({})).to.throw()
    // @ts-expect-error
    expect(() => new Config({ a: '' })).to.throw()
    // @ts-expect-error
    expect(() => new Config({ b: {} })).to.throw()
    // @ts-expect-error
    expect(() => new Config({ b: [{ c: 3 }] })).to.throw()
    // @ts-expect-error
    expect(() => new Config({ a: 1, c: 'foo' })).to.throw()
  })
})
