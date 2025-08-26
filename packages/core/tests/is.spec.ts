import { describe, test } from 'node:test'
import { expect } from 'chai'
import Schema from 'schemastery'

describe('Is', () => {
  test('built-in', () => {
    const config = Schema.is(RegExp)
    expect(config.toString()).to.equal('RegExp')

    expect(config(/1/)).to.deep.equal(/1/)

    // @ts-expect-error
    expect(() => config(1)).to.throw()
    // @ts-expect-error
    expect(() => config('1')).to.throw()
  })

  test('constructor', () => {
    class A {}
    class B extends A {}

    const configA = Schema.is(A)
    expect(configA.toString()).to.equal('A')
    const configB = Schema.is(B)
    expect(configB.toString()).to.equal('B')

    expect(configA(new A())).to.deep.equal(new A())
    expect(() => configB(new A())).to.throw()
    expect(configA(new B())).to.deep.equal(new B())
    expect(configB(new B())).to.deep.equal(new B())
  })

  test('constructor.name', () => {
    class A {}
    class B extends A {}

    const configA = Schema.is('A')
    expect(configA.toString()).to.equal('A')
    const configB = Schema.is('B')
    expect(configB.toString()).to.equal('B')

    expect(configA(new A())).to.deep.equal(new A())
    expect(() => configB(new A())).to.throw()
    expect(configA(new B())).to.deep.equal(new B())
    expect(configB(new B())).to.deep.equal(new B())
  })
})
