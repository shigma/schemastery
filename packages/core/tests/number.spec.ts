import { describe, test } from 'node:test'
import { expect } from 'chai'
import Schema from 'schemastery'

describe('Number', () => {
  test('number', () => {
    const config = Schema.number().default(42)
    expect(config.toString()).to.equal('number')

    expect(config(514)).to.equal(514)
    expect(config(0)).to.equal(0)
    expect(config(null)).to.equal(42)

    // @ts-expect-error
    expect(() => config('42')).to.throw()
  })

  test('number (range)', () => {
    // https://github.com/shigma/schemastery/issues/44
    const config = Schema.number().min(1).max(3).step(0.1)
    expect(config(1)).to.equal(1)
    expect(config(3)).to.equal(3)
    expect(config(2.3)).to.equal(2.3)

    expect(() => config(0.5)).to.throw()
    expect(() => config(2.718)).to.throw()
  })

  test('number (decimal)', () => {
    // https://github.com/shigma/schemastery/issues/44
    const config = Schema.number().min(-1).max(0).step(0.01)
    expect(config(-0.55)).to.equal(-0.55)
  })
})
