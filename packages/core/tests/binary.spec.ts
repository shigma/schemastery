import { describe, test } from 'node:test'
import { expect } from 'chai'
import Schema from 'schemastery'

describe('Binary', () => {
  test('z.arrayBuffer()', () => {
    const Config1 = Schema.object({
      buffer: Schema.arrayBuffer(),
    })

    // ArrayBuffer
    const obj1 = { buffer: new ArrayBuffer(8) }
    expect(new Config1(obj1)).to.deep.equal({ buffer: new ArrayBuffer(8) })
    expect(obj1).to.deep.equal({ buffer: new ArrayBuffer(8) })

    // SharedArrayBuffer
    const obj2 = { buffer: new SharedArrayBuffer(8) }
    expect(new Config1(obj2)).to.deep.equal({ buffer: new SharedArrayBuffer(8) })
    expect(obj2).to.deep.equal({ buffer: new SharedArrayBuffer(8) })

    // Node.js Buffer
    const obj3 = { buffer: Buffer.from('Hello World') }
    expect(new Config1(obj3)).to.deep.equal({ buffer: new TextEncoder().encode('Hello World').buffer })
    expect(obj3).to.deep.equal({ buffer: Buffer.from('Hello World') })

    const Config2 = Schema.object({
      buffer: Schema.arrayBuffer('hex'),
    })

    // Hex String
    const obj4 = { buffer: '666f6f' }
    expect(new Config2(obj4)).to.deep.equal({ buffer: new TextEncoder().encode('foo').buffer })
    expect(obj4).to.deep.equal({ buffer: '666f6f' })

    const Config3 = Schema.object({
      buffer: Schema.arrayBuffer('base64'),
    })

    // Base64 String
    const obj5 = { buffer: 'YmFy' }
    expect(new Config3(obj5)).to.deep.equal({ buffer: new TextEncoder().encode('bar').buffer })
    expect(obj5).to.deep.equal({ buffer: 'YmFy' })
  })
})
