import { describe, test } from 'node:test'
import { expect } from 'chai'
import Schema from 'schemastery'

describe('RegExp', () => {
  test('z.regExp()', () => {
    const Config = Schema.object({
      re: Schema.regExp('i'),
    })

    const obj1 = { re: /foo/g }
    expect(new Config(obj1)).to.deep.equal({ re: /foo/g })
    expect(obj1).to.deep.equal({ re: /foo/g })

    const obj2 = { re: 'bar' }
    expect(new Config(obj2)).to.deep.equal({ re: /bar/i })
    expect(obj2).to.deep.equal({ re: 'bar' })

    const obj3 = { re: '+' }
    expect(() => new Config(obj3)).to.throw()
  })
})
