import { viteBundler, defineUserConfig } from 'vuepress'
import { shikiPlugin } from '@vuepress/plugin-shiki'
import { resolve } from 'path'
import theme from './theme'

export default defineUserConfig({
  port: 8004,
  title: 'Schemastery',
  base: '/schemastery/',
  dest: resolve(__dirname, 'dist/schemastery'),

  theme: theme({
    navbar: false,
    sidebar: [{
      text: 'Introduction',
      link: '/',
    }, {
      text: 'Meta Properties',
      children: [
        '/meta/label.md',
        '/meta/description.md',
        '/meta/required.md',
        '/meta/default.md',
        '/meta/role.md',
        '/meta/hidden.md',
      ],
    }, {
      text: 'Atomic Types',
      children: [
        '/atomic/number.md',
        '/atomic/string.md',
        '/atomic/boolean.md',
        '/atomic/date.md',
        '/atomic/bitset.md',
      ],
    }, {
      text: 'Composite Types',
      children: [
        '/composite/array.md',
        '/composite/dict.md',
        '/composite/tuple.md',
        '/composite/object.md',
        '/composite/intersect.md',
        '/composite/union-select.md',
        '/composite/union-arbitrary.md',
        '/composite/union-tagged-1.md',
        '/composite/union-tagged-2.md',
        '/composite/transform.md',
      ],
    }],
    themePlugins: {
      git: false,
    },
  }),

  markdown: {
    headers: false,
    code: {
      lineNumbers: false,
    },
  },

  plugins: [
    shikiPlugin({
      theme: 'one-dark-pro',
    }),
  ],

  bundler: viteBundler({
    viteOptions: {
      resolve: {
        dedupe: ['vue'],
      },
      server: {
        fs: {
          strict: false,
        },
      },
    },
  }),
})
