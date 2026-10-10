import { describe, test } from 'node:test'
import { expect } from 'chai'
import Schema from 'schemastery'

describe('Array', () => {
  test('array', () => {
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

  test('array (length)', () => {
    const Config = Schema.array(String).min(2).max(3)

    expect(new Config(['dress', 'skirt'])).to.deep.equal(['dress', 'skirt'])

    expect(() => new Config(['dress'])).to.throw()
    expect(() => new Config(['dress', 'skirt', 'socks', 'swimming suit'])).to.throw()
  })

  test('array (length) with a defaulted inner', () => {
    // the inner schema's default used to disable the length check entirely
    const Config = Schema.array(Schema.string().default('x')).min(2)

    expect(() => new Config([])).to.throw()
    expect(() => new Config(['dress'])).to.throw()

    expect(new Config(['dress', 'skirt'])).to.deep.equal(['dress', 'skirt'])
    expect(new Config(['dress', null])).to.deep.equal(['dress', 'x'])
  })
})
