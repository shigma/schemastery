import { expect } from 'chai'
import Schema from '../src'

describe('Miscellaneous', () => {
  it('serialization (basic)', () => {
    const Number = Schema.number()
    const validate = new Schema(JSON.parse(JSON.stringify(Number)))

    expect(validate(null)).to.equal(null)
    expect(validate(0)).to.equal(0)
    expect(() => validate('0')).to.throw()
  })

  it('serialization (recursive)', () => {
    const Node = Schema.object({ id: Number })
    Node.set('children', Schema.array(Node))
    const validate = new Schema(JSON.parse(JSON.stringify(Node)))

    expect(validate({ id: 1 })).to.deep.equal({ id: 1, children: [] })
    expect(validate({ id: 1, children: [{ id: 2 }] })).to.deep.equal({ id: 1, children: [{ id: 2, children: [] }] })
    expect(() => validate(null)).to.throw()
    expect(() => validate({ id: 1, children: {} })).to.throw()
  })
})
