import { expect } from 'chai'
import Schema from 'schemastery'

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
})
