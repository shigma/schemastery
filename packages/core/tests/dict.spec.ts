import { expect } from 'chai'
import Schema from '../src'

describe('Dictionary', () => {
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
})
