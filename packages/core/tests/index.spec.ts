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
})
