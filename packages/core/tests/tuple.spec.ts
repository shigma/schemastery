import { expect } from 'chai'
import Schema from '../src'

describe('Tuple', () => {
  it('basic support', () => {
    const Config = Schema.tuple([
      Schema.string().required(),
      Schema.number().default(123),
      Schema.boolean(),
    ] as const)
    expect(Config.toString()).to.equal('[string, number, boolean]')

    expect(new Config(['foo'])).to.deep.equal(['foo', 123, undefined])
    expect(new Config(['foo', 0])).to.deep.equal(['foo', 0, undefined])
    expect(new Config(['foo', 0, true])).to.deep.equal(['foo', 0, true])
    expect(new Config(['foo', 0, true, {}])).to.deep.equal(['foo', 0, true, {}])

    // @ts-expect-error
    expect(() => new Config({})).to.throw()
    // @ts-expect-error
    expect(() => new Config(['foo', 'bar'])).to.throw()
  })
})
