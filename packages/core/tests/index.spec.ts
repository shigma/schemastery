import { expect } from 'chai'
import Schema from '../src'

describe('Schema API', () => {
  it('unknown', () => {
    const validate1 = new Schema({ type: 'unknown' })
    expect(() => validate1(0)).to.throw()

    expect(() => Schema.array(Symbol('unknown'))).to.throw()
  })

  it('any', () => {
    const config = Schema.any()
    expect(config.toString()).to.equal('any')

    expect(config(123)).to.equal(123)
    expect(config(null)).to.equal(null)
  })

  it('never', () => {
    const config = Schema.never()
    expect(config.toString()).to.equal('never')

    expect(config(null)).to.equal(null)
    // @ts-expect-error
    expect(() => config(123)).to.throw()
  })

  it('string', () => {
    const config = Schema.string().default('bar')
    expect(config.toString()).to.equal('string')

    expect(config('foo')).to.equal('foo')
    expect(config('')).to.equal('')
    expect(config(null)).to.equal('bar')

    // @ts-expect-error
    expect(() => config(123)).to.throw()
  })

  it('string (length)', () => {
    const config = Schema.string().min(5).max(6)
    expect(config('dress')).to.equal('dress')

    expect(() => config('sock')).to.throw()
    expect(() => config('uniform')).to.throw()
  })

  it('number', () => {
    const config = Schema.number().min(1).step(2).default(123)
    expect(config.toString()).to.equal('number')

    expect(config(345)).to.equal(345)
    expect(config(null)).to.equal(123)

    // @ts-expect-error
    expect(() => config('123')).to.throw()
    expect(() => config(-1)).to.throw()
    expect(() => config(456)).to.throw()
  })

  it('boolean', () => {
    const config = Schema.boolean().default(true)
    expect(config.toString()).to.equal('boolean')

    expect(config(true)).to.equal(true)
    expect(config(false)).to.equal(false)
    expect(config(null)).to.equal(true)

    // @ts-expect-error
    expect(() => config(1)).to.throw()
  })

  it('function', () => {
    const config = Schema.function()
    expect(config.toString()).to.equal('function')

    expect(config(() => {})).to.be.a('function')
    expect(config(null)).to.equal(null)

    // @ts-expect-error
    expect(() => config(1)).to.throw()
  })

  it('is', () => {
    const config = Schema.is(RegExp)
    expect(config.toString()).to.equal('RegExp')

    expect(config(/1/)).to.deep.equal(/1/)

    // @ts-expect-error
    expect(() => config(1)).to.throw()
    // @ts-expect-error
    expect(() => config('1')).to.throw()
  })

  it('array', () => {
    const Config = Schema.array(String)
    expect(Config.toString()).to.equal('string[]')

    expect(new Config([])).to.deep.equal([])
    expect(new Config(['foo'])).to.deep.equal(['foo'])

    // @ts-expect-error
    expect(() => new Config('')).to.throw()
    // @ts-expect-error
    expect(() => new Config({})).to.throw()
    // @ts-expect-error
    expect(() => new Config([0])).to.throw()
  })

  it('array (length)', () => {
    const Config = Schema.array(String).min(2).max(3)

    expect(new Config(['dress', 'skirt'])).to.deep.equal(['dress', 'skirt'])

    expect(() => new Config(['dress'])).to.throw()
    expect(() => new Config(['dress', 'skirt', 'socks', 'swimming suit'])).to.throw()
  })

  it('dict (basic)', () => {
    const Config = Schema.dict(RegExp)
    expect(Config.toString()).to.equal('{ [key: string]: RegExp }')

    const original = { a: /1/ }
    expect(new Config({})).to.deep.equal({})
    expect(new Config(original)).to.deep.equal({ a: /1/ })
    expect(original).to.deep.equal({ a: /1/ })

    // @ts-expect-error
    expect(() => new Config(1)).to.throw()
    // @ts-expect-error
    expect(() => new Config([])).to.throw()
    // @ts-expect-error
    expect(() => new Config({ a: '' })).to.throw()
  })

  it('dict (key schema)', () => {
    const validate = Schema.dict(Number, Schema.union([
      'foo' as const,
      Schema.transform('bar' as const, () => 'foo' as const),
    ]))
    expect(validate.toString()).to.equal('{ [key: "foo" | "bar"]: number }')

    let original: any = { bar: 2 }
    expect(validate({ foo: 1 })).to.deep.equal({ foo: 1 })
    expect(validate(original)).to.deep.equal({ foo: 2 })
    expect(original).to.deep.equal({ foo: 2 })

    // @ts-expect-error
    expect(() => validate({ foo: '' })).to.throw()
    // @ts-expect-error
    expect(() => validate({ bar: '' })).to.throw()
    // @ts-expect-error
    expect(() => validate({ baz: '' })).to.throw()

    original = { bar: 2, baz: '3' }
    const validate2 = Schema.intersect([validate, Schema.object({})])
    expect(validate2(original)).to.deep.equal({ foo: 2, baz: '3' })
    expect(original).to.deep.equal({ foo: 2, baz: '3' })

    // @ts-expect-error
    expect(() => validate2({ foo: '' })).to.throw()
    // @ts-expect-error
    expect(() => validate2({ bar: '' })).to.throw()
  })

  it('tuple', () => {
    const Config = Schema.tuple([
      Schema.string().required(),
      Schema.number().default(123),
      Schema.boolean(),
    ] as const)
    expect(Config.toString()).to.equal('[string, number, boolean]')

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
    expect(Config.toString()).to.equal('{ a: string, b?: number }')

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
    const config = Schema.union([1, 2] as const)
    expect(config.toString()).to.equal('1 | 2')

    expect(config(null)).to.equal(null)
    expect(config(2)).to.equal(2)

    // @ts-expect-error
    expect(() => config('1')).to.throw()
  })

  it('union (object)', () => {
    const validate = Schema.union([
      Schema.object({ a: 'foo', b: Schema.number() }),
      Schema.object({ a: 'bar', b: Schema.string() }),
    ])
    expect(validate.toString()).to.equal('{ a: "foo", b?: number } | { a: "bar", b?: string }')

    expect(validate(null)).to.equal(null)
    expect(validate({ a: 'foo', b: 123 })).to.deep.equal({ a: 'foo', b: 123 })
    expect(validate({ a: 'bar', b: 'x' })).to.deep.equal({ a: 'bar', b: 'x' })

    expect(() => validate([])).to.throw()
    expect(() => validate({ b: 123 })).to.throw()
    expect(() => validate({ b: 'x' })).to.throw()
  })

  it('intersect (primitive)', () => {
    const validate = Schema.intersect([String, Number])
    expect(validate.toString()).to.equal('string & number')

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
    expect(validate.toString()).to.equal('{ a?: string } & { b: number }')

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
    expect(validate.toString()).to.equal('{ a?: string } & { b?: number } & { c?: boolean }')

    expect(validate(null)).to.equal(null)
    expect(validate({})).to.deep.equal({})

    // @ts-expect-error
    expect(() => validate({ b: '' })).to.throw()
    // @ts-expect-error
    expect(() => validate({ c: '' })).to.throw()
  })

  it('adapt with array', () => {
    const Config = Schema.array(Schema.union([
      String,
      Schema.transform(Number, data => data.toString()),
    ]))
    expect(Config.toString()).to.equal('(string | number)[]')

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
        Schema.array(Number),
        Schema.transform(Number, data => [data]),
      ]).default([]),
    })
    expect(Config.toString()).to.equal('{ foo?: number[] | number }')

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
      Schema.intersect([
        Schema.object({ c: Schema.number() }),
      ]),
      Schema.union([
        Schema.object({ b: Schema.array(Inner).required() }),
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
    expect(() => new Config({ b: [{ c: 3 }] })).to.throw()
    // @ts-expect-error
    expect(() => new Config({ a: 1, c: 'foo' })).to.throw()
  })

  it('recursive adaptive structure', () => {
    const original = Schema.object({ id: Number })
    const validate = Schema.union([
      original,
      Schema.transform(Number, (id) => ({ id, children: [] })),
    ]).required()
    original.set('children', Schema.array(validate))

    expect(validate(1)).to.deep.equal({ id: 1, children: [] })
    expect(validate({ id: 1 })).to.deep.equal({ id: 1, children: [] })
    expect(validate({ id: 1, children: [2] })).to.deep.equal({ id: 1, children: [{ id: 2, children: [] }] })
    expect(() => validate(null)).to.throw()
    expect(() => validate({ id: 1, children: {} })).to.throw()
  })

  it('serialization (basic)', () => {
    const Number = Schema.number()
    const validate = new Schema(JSON.parse(JSON.stringify(Number)))

    expect(validate(null)).to.equal(null)
    expect(validate(0)).to.equal(0)
    expect(() => validate('0')).to.throw()
  })

  it('serialization (recursive)', () => {
    const Node = Schema.object({ id: Number })
    Node.set('children', Schema.array(Node))
    const validate = new Schema(JSON.parse(JSON.stringify(Node)))

    expect(validate({ id: 1 })).to.deep.equal({ id: 1, children: [] })
    expect(validate({ id: 1, children: [{ id: 2 }] })).to.deep.equal({ id: 1, children: [{ id: 2, children: [] }] })
    expect(() => validate(null)).to.throw()
    expect(() => validate({ id: 1, children: {} })).to.throw()
  })
})
