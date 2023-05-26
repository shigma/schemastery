import { expect } from 'chai'
import Schema from 'schemastery'

describe('Transform', () => {
  it('transform with array', () => {
    const Config = Schema.array(Schema.union([
      String,
      Schema.transform(Number, data => data.toString()),
    ]))
    expect(Config.toString()).to.equal('(string | number)[]')

    const original = ['456', 123]
    expect(new Config(original)).to.deep.equal(['456', '123'])
    // modify original data during adaptation
    expect(original).to.deep.equal(['456', '123'])

    // @ts-expect-error
    expect(() => new Config({})).to.throw()
    // @ts-expect-error
    expect(() => new Config([{}])).to.throw()
  })

  it('transform with object', () => {
    const Config = Schema.object({
      foo: Schema.union([
        Schema.array(Number),
        Schema.transform(Number, data => [data]),
      ]).default([]),
    })
    expect(Config.toString()).to.equal('{ foo?: number[] | number }')

    // modify original data during adaptation
    const original = { foo: 0 }
    expect(new Config(original)).to.deep.equal({ foo: [0] })
    expect(original).to.deep.equal({ foo: [0] })

    expect(new Config({})).to.deep.equal({ foo: [] })
    expect(new Config({ foo: [1] })).to.deep.equal({ foo: [1] })

    // @ts-expect-error
    expect(() => new Config({ foo: '' })).to.throw()
    // @ts-expect-error
    expect(() => new Config({ foo: [''] })).to.throw()
  })

  it.skip('transform with intersect', () => {
    const Inner = Schema.object({
      a: Schema.number().required(),
      d: Schema.number().default(0),
    })

    const Config = Schema.intersect([
      Schema.intersect([
        Schema.object({ c: Schema.number() }),
      ]),
      Schema.union([
        Schema.object({ b: Schema.array(Inner).required() }),
        Schema.transform(Inner, data => ({ b: [data] })),
      ]),
    ])

    // modify original data during adaptation
    const original = { a: 1, c: 3, e: 5 }
    expect(new Config(original)).to.deep.equal({ b: [{ a: 1, d: 0 }], c: 3, e: 5 })
    expect(original).to.deep.equal({ b: [{ a: 1 }], c: 3, e: 5 })

    expect(() => new Config({})).to.throw()
    expect(() => new Config({ a: '' })).to.throw()
    expect(() => new Config({ b: {} })).to.throw()
    expect(() => new Config({ b: [{ c: 3 }] })).to.throw()
    // @ts-expect-error
    expect(() => new Config({ a: 1, c: 'foo' })).to.throw()
  })

  it('recursive adaptive structure', () => {
    const original = Schema.object({ id: Number })
    const validate = Schema.union([
      original,
      Schema.transform(Number, (id) => ({ id, children: [] })),
    ]).required()
    original.set('children', Schema.array(validate))

    expect(validate(1)).to.deep.equal({ id: 1, children: [] })
    expect(validate({ id: 1 })).to.deep.equal({ id: 1, children: [] })
    expect(validate({ id: 1, children: [2] })).to.deep.equal({ id: 1, children: [{ id: 2, children: [] }] })
    expect(() => validate(null)).to.throw()
    expect(() => validate({ id: 1, children: {} })).to.throw()
  })

  it('adaptive root', () => {
    const original = Schema.object({
      bar: Schema.boolean().default(false),
      id: Schema.never(),
    })
    const validate = Schema.union([
      original,
      Schema.transform(Schema.dict(Schema.any()), (data) => {
        data.foo = {
          ...data.foo,
          id: data.id,
        }
        delete data.id
        return original(data)
      }),
    ])

    const root: any = { id: 1 }
    expect(validate(null)).to.deep.equal(null)
    expect(validate(root)).to.deep.equal({ foo: { id: 1 }, bar: false })
    expect(root).to.deep.equal({ foo: { id: 1 } })
  })

  it('autofix', () => {
    const validate = Schema.object({
      foo: Schema.number().default(0),
    })

    const original = { foo: '' }
    // @ts-expect-error
    expect(validate(original, { autofix: true })).to.deep.equal({ foo: 0 })
    expect(original).to.deep.equal({})
  })
})
