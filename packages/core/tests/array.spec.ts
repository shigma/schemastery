import { expect } from 'chai'
import Schema from 'schemastery'

describe('Array', () => {
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
})
