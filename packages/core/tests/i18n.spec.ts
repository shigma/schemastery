import { describe, test } from 'node:test'
import { expect } from 'chai'
import Schema from 'schemastery'

describe('I18n', () => {
  test('basic support', () => {
    const schema = Schema.intersect([
      Schema.object({
        enabled: Schema.boolean().default(false),
      }),
      Schema.union([
        Schema.object({
          enabled: Schema.const(true),
          foo: Schema.string().required(),
        }),
        Schema.object({}),
      ]),
      Schema.object({
        bar: Schema.number(),
      }),
    ]).i18n({
      en: [
        {
          $desc: 'Feature 1',
          enabled: 'Enabled',
        },
        {
          foo: 'Property 1',
        },
        {
          $desc: 'Feature 2',
          bar: 'Property 2',
        },
      ],
      zh: {
        $desc: '配置项',
        enabled: '启用',
        foo: '属性 1',
        bar: '属性 2',
      },
    })

    expect(schema.meta.description).to.deep.equal({ zh: '配置项' })
    expect(schema.list![0].meta.description).to.deep.equal({ en: 'Feature 1' })
    expect(schema.list![0].dict!.enabled.meta.description).to.deep.equal({ en: 'Enabled', zh: '启用' })
    expect(schema.list![1].meta.description).to.deep.equal({})
    expect(schema.list![1].list![0].dict!.enabled.meta.description).to.deep.equal({ zh: '启用' })
    expect(schema.list![1].list![0].dict!.foo.meta.description).to.deep.equal({ en: 'Property 1', zh: '属性 1' })
    expect(schema.list![2].meta.description).to.deep.equal({ en: 'Feature 2' })
    expect(schema.list![2].dict!.bar.meta.description).to.deep.equal({ en: 'Property 2', zh: '属性 2' })
  })
})
