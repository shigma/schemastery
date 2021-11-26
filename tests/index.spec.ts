import { expect } from 'chai'
import Schema from 'schemastery/src'

describe('Schema API', () => {
  it('any', () => {
    const config = Schema.any()
    expect(config(123)).to.equal(123)
    expect(config(null)).to.equal(null)
  })

  it('never', () => {
    const config = Schema.never()
    expect(config(null)).to.equal(null)
    expect(() => config(123)).to.throw()
  })

  it('string', () => {
    const config = Schema.string().default('bar')

    expect(config('foo')).to.equal('foo')
    expect(config(String('foo'))).to.equal('foo')
    expect(config('')).to.equal('')
    expect(config(null)).to.equal('bar')
    expect(() => config(123)).to.throw()
  })

  it('number', () => {
    const config = Schema.number().default(123)

    expect(config(456)).to.equal(456)
    expect(config(Number(456))).to.equal(456)
    expect(config(0)).to.equal(0)
    expect(config(null)).to.equal(123)
    expect(() => config('123')).to.throw()
  })

  it('select 1', () => {
    const config = Schema.select(['foo', 'bar'])

    expect(config('bar')).to.equal('bar')
    expect(() => config('baz')).to.throw()
  })

  it('select 2', () => {
    const config = Schema.select({ 1: 'baz', 2: 'bax' })

    expect(config('2')).to.equal('2')
    expect(() => config(2)).to.throw()
  })

  it('array', () => {
    const Config = Schema.array(Schema.string())

    expect(new Config(['456'])).to.deep.equal(['456'])
    expect(new Config([])).to.deep.equal([])
    expect(new Config(null)).to.deep.equal([])
    expect(() => new Config('')).to.throw()
    expect(() => new Config({})).to.throw()
    expect(() => new Config([0])).to.throw()
  })

  it('dict', () => {
    const Config = Schema.dict(Schema.number())

    expect(new Config({ a: 1 })).to.deep.equal({ a: 1 })
    expect(new Config({})).to.deep.equal({})
    expect(new Config(null)).to.deep.equal({})
    expect(() => new Config(1)).to.throw()
    expect(() => new Config([])).to.throw()
    expect(() => new Config({ a: '' })).to.throw()
  })

  it('tuple', () => {
    const Config = Schema.tuple([Schema.string(), Schema.number()])

    expect(new Config(null)).to.deep.equal([])
    expect(new Config(['foo'])).to.deep.equal(['foo'])
    expect(new Config(['foo', 123])).to.deep.equal(['foo', 123])
    expect(new Config(['foo', 123, true])).to.deep.equal(['foo', 123, true])
    expect(() => new Config(['foo', 'bar'])).to.throw()
  })

  it('object 1', () => {
    const Config = Schema.object({
      a: Schema.string().required(),
      b: Schema.number().default(123),
    })

    const original = { a: 'foo', c: true }
    expect(new Config(original)).to.deep.equal({ a: 'foo', b: 123 })
    expect(new Config({ a: 'foo', b: 0 })).to.deep.equal({ a: 'foo', b: 0 })
    expect(() => new Config(null)).to.throw()
    expect(() => new Config({})).to.throw()
    expect(() => new Config({ a: 0 })).to.throw()
    expect(() => new Config({ a: '', b: '' })).to.throw()

    // we resolve value without modifying the original object
    expect(original).to.deep.equal({ a: 'foo', c: true })
  })

  it('object 2', () => {
    const Config = Schema.object({
      a: Schema.string(),
      b: Schema.number(),
    }, true)

    expect(new Config(null)).to.deep.equal({})
    expect(new Config({ c: true })).to.deep.equal({ c: true })
    expect(() => new Config([])).to.throw()
    expect(() => new Config('foo')).to.throw()
    expect(() => new Config(123)).to.throw()
  })

  it('decide 1', () => {
    const config = Schema.decide('a', {
      foo: Schema.object({ b: Schema.number() }),
      bar: Schema.object({ b: Schema.string() }),
    })

    expect(config(null)).to.equal(null)
    expect(config({ a: 'foo', b: 123 })).to.deep.equal({ a: 'foo', b: 123 })
    expect(config({ a: 'bar', b: 'x' })).to.deep.equal({ a: 'bar', b: 'x' })
    expect(() => config([])).to.throw()
    expect(() => config({ b: 123 })).to.throw()
    expect(() => config({ b: 'x' })).to.throw()
  })

  it('decide 2', () => {
    const Config = Schema.decide('a', {
      foo: Schema.object({ b: Schema.number() }),
      bar: Schema.object({ b: Schema.string() }),
    }, ({ b }) => typeof b === 'number' ? 'foo' : 'bar')

    const original = { b: 123 }
    expect(new Config(original)).to.deep.equal({ a: 'foo', b: 123 })
    expect(new Config({ b: 'x' })).to.deep.equal({ a: 'bar', b: 'x' })
    expect(() => new Config({ a: 'foo', b: 'x' })).to.throw()
    expect(() => new Config({ a: 'bar', b: 123 })).to.throw()

    // modify original data during adaptation
    expect(original).to.deep.equal({ a: 'foo', b: 123 })
  })

  it('adapt with array', () => {
    const Config = Schema.array(Schema.adapt(
      Schema.string(),
      Schema.number(),
      data => data.toString(),
    ))

    const original = [456, 123]
    expect(new Config(['456'])).to.deep.equal(['456'])
    expect(new Config(original)).to.deep.equal(['456', '123'])
    expect(new Config(null)).to.deep.equal([])
    expect(() => new Config({})).to.throw()
    expect(() => new Config([{}])).to.throw()

    // modify original data during adaptation
    expect(original).to.deep.equal(['456', '123'])
  })

  it('adapt with object', () => {
    const Config = Schema.object({
      foo: Schema.adapt(
        Schema.array(Schema.number()),
        Schema.number(),
        data => [data],
      ),
    })

    const original = { foo: 0 }
    expect(new Config(null)).to.deep.equal({ foo: [] })
    expect(new Config({})).to.deep.equal({ foo: [] })
    expect(new Config(original)).to.deep.equal({ foo: [0] })
    expect(new Config({ foo: [1] })).to.deep.equal({ foo: [1] })
    expect(() => new Config({ foo: '' })).to.throw()
    expect(() => new Config({ foo: [''] })).to.throw()

    // modify original data during adaptation
    expect(original).to.deep.equal({ foo: [0] })
  })

  it('adapt with intersect', () => {
    const Inner = Schema.object({
      a: Schema.number().required(),
      d: Schema.number().default(0),
    })

    const Config = Schema.intersect([
      Schema.object({ c: Schema.number() }),
      Schema.adapt(
        Schema.object({
          b: Schema.array(Inner).required(),
        }),
        Inner,
        data => ({ b: [data] }),
      ),
    ])

    const original = { a: 1, c: 3, e: 5 }
    expect(new Config(original)).to.deep.equal({ b: [{ a: 1, d: 0 }], c: 3 })
    expect(new Config({ b: [{ a: 2, c: 3 }] })).to.deep.equal({ b: [{ a: 2, d: 0 }] })
    expect(() => new Config({})).to.throw()
    expect(() => new Config({ a: '' })).to.throw()
    expect(() => new Config({ b: {} })).to.throw()
    expect(() => new Config({ b: [{ c: 3 }] })).to.throw()
    expect(() => new Config({ a: 1, c: 'foo' })).to.throw()

    // modify original data during adaptation
    expect(original).to.deep.equal({ b: [{ a: 1 }], c: 3, e: 5 })
  })
})
