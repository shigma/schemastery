import { expect } from 'chai'
import Schema from 'schemastery'

describe('Date', () => {
  it('date', () => {
    const Config = Schema.object({
      date: Schema.date(),
    })

    const obj1 = { date: new Date('2020-01-01') }
    expect(new Config(obj1)).to.deep.equal({ date: new Date('2020-01-01') })
    expect(obj1).to.deep.equal({ date: new Date('2020-01-01') })

    const obj2 = { date: '1145-1-4 19:19:8.10' }
    expect(new Config(obj2)).to.deep.equal({ date: new Date('1145-1-4 19:19:8.10') })
    expect(obj2).to.deep.equal({ date: new Date('1145-1-4 19:19:8.10') })

    const obj3 = { date: 'foo bar baz' }
    expect(() => new Config(obj3)).to.throw()
  })
})
