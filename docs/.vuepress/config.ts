import { viteBundler, defineUserConfig } from 'vuepress'
import { shikiPlugin } from '@vuepress/plugin-shiki'
import { resolve } from 'path'
import theme from './theme'

export default defineUserConfig({
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
        '/meta/description.md',
        '/meta/required.md',
        '/meta/default.md',
        '/meta/role.md',
        '/meta/hidden.md',
      ],
    }, {
      text: 'Atomic Types',
      children: [
        '/examples/number.md',
        '/examples/string.md',
        '/examples/boolean.md',
        '/atomic/date.md',
        '/examples/bitset.md',
      ],
    }, {
      text: 'Composite Types',
      children: [
        '/examples/array.md',
        '/examples/dict.md',
        '/examples/object.md',
        '/examples/intersect.md',
        '/examples/union-select.md',
        '/examples/union-arbitrary.md',
        '/examples/union-tagged.md',
        '/examples/transform.md',
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
