import { expect } from 'chai'
import Schema from '../src'

describe('Bitset', () => {
  it('basic usage', () => {
    const validate = Schema.bitset({ a: 1, b: 2, c: 4 })

    expect(validate()).to.equal(0)
    expect(validate(['a'])).to.equal(1)
    expect(validate(['a', 'a'])).to.equal(1)
    expect(validate(['a', 'c'])).to.equal(5)

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
    expect(validate(['a'])).to.equal(1)

    // @ts-expect-error
    expect(() => validate('a')).to.throw()
  })
})
