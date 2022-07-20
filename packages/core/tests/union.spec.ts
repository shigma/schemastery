import { expect } from 'chai'
import Schema from 'schemastery'

describe('Union', () => {
  it('primitive', () => {
    const config = Schema.union([1, 2] as const)
    expect(config.toString()).to.equal('1 | 2')

    expect(config(null)).to.equal(null)
    expect(config(2)).to.equal(2)

    // @ts-expect-error
    expect(() => config('1')).to.throw()
  })

  it('object', () => {
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
})
