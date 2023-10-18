import { expect } from 'chai'
import Schema from 'schemastery'

describe('Bitset', () => {
  it('basic usage', () => {
    expect(() => Schema.bitset({})).to.throw()
    // @ts-expect-error
    expect(() => Schema.bitset({ a: 1, b: 2n })).to.throw()

    const validate = Schema.bitset({ a: 1n, b: 2n, c: 4n })

    expect(validate()).to.equal(0n)
    expect(validate(3n)).to.equal(3n)
    expect(validate(['a'])).to.equal(1n)
    expect(validate(['a', 'a'])).to.equal(1n)
    expect(validate(['a', 'c'])).to.equal(5n)
    // @ts-expect-error
    expect(validate(['a', 'c', 'e'])).to.equal(5n)

    // @ts-expect-error
    expect(() => validate('a')).to.throw()
  })

  it('enumeration support', () => {
    enum Foo {
      a = 1,
      b = 2,
      c = 4,
    }

    const validate = Schema.bitset(Foo)

    expect(validate()).to.equal(0)
    expect(validate(3)).to.equal(3)
    expect(validate(['a'])).to.equal(1)

    // @ts-expect-error
    expect(() => validate('a')).to.throw()
  })

  it('transform', () => {
    const validate = Schema.object({
      foo: Schema.bitset({ a: 1, b: 2, c: 4 }),
    })

    const object1 = { foo: ['a', 'c', 'e'] } as any
    expect(validate(object1)).to.deep.equal({ foo: 5 })
    expect(object1).to.deep.equal({ foo: ['a', 'c', 'e'] })

    const object2 = { foo: 11 } as any
    expect(validate(object2)).to.deep.equal({ foo: 11 })
    expect(object2).to.deep.equal({ foo: ['a', 'b'] })
  })
})
