import { describe, test } from 'node:test'
import { expect } from 'chai'
import Schema from 'schemastery'

describe('Object', () => {
  test('basic support', () => {
    const Config = Schema.object({
      a: Schema.string().required(),
      b: Schema.number().default(123),
    })
    expect(Config.toString()).to.equal('{ a: string, b?: number }')

    const original = { a: 'foo', c: true }
    expect(new Config(original)).to.deep.equal({ a: 'foo', b: 123, c: true })
    expect(new Config({ a: 'foo', b: 0 })).to.deep.equal({ a: 'foo', b: 0 })

    expect(() => new Config({})).to.throw()
    expect(() => new Config([])).to.throw()
    // @ts-expect-error
    expect(() => new Config({ a: 0 })).to.throw()
    // @ts-expect-error
    expect(() => new Config({ a: '', b: '' })).to.throw()

    // we resolve value without modifying the original object
    expect(original).to.deep.equal({ a: 'foo', c: true })
  })
})
