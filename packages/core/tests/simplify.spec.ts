import { expect } from 'chai'
import Schema from 'schemastery'

describe('Simplify', () => {
  it('basic support', () => {
    const schema = Schema.intersect([
      Schema.object({
        a: Schema.string().default('a'),
        b: Schema.number(),
      }),
      Schema.object({
        c: Schema.object({
          d: Schema.boolean().default(true),
          e: Schema.string(),
        }),
      }),
    ])

    expect(schema.simplify(null)).to.deep.equal(null)
    expect(schema.simplify({ a: 'a', b: 1 })).to.deep.equal({ b: 1 })
    expect(schema.simplify({ c: {} })).to.deep.equal({})
    expect(schema.simplify({ c: { d: false } })).to.deep.equal({ c: { d: false } })
  })
})
