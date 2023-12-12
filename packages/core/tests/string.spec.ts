import { describe, test } from 'node:test'
import { expect } from 'chai'
import Schema from 'schemastery'

describe('String', () => {
  test('string', () => {
    const config = Schema.string().default('bar')
    expect(config.toString()).to.equal('string')

    expect(config('foo')).to.equal('foo')
    expect(config('')).to.equal('')
    expect(config(null)).to.equal('bar')

    // @ts-expect-error
    expect(() => config(123)).to.throw()
  })

  test('string (length)', () => {
    const config = Schema.string().min(5).max(6)
    expect(config('dress')).to.equal('dress')

    expect(() => config('sock')).to.throw()
    expect(() => config('uniform')).to.throw()
  })

  test('string (pattern)', () => {
    const config = Schema.string().pattern(/^[a-z]+$/i)
    expect(config('dress')).to.equal('dress')
    expect(config('SKIRT')).to.equal('SKIRT')

    expect(() => config('?')).to.throw()
  })
})
