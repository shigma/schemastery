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
      text: 'Basic Types',
      children: [
        '/examples/number.md',
        '/examples/string.md',
        '/examples/boolean.md',
        '/examples/bitset.md',
        '/examples/array.md',
        '/examples/dict.md',
        '/examples/object.md',
      ],
    }, {
      text: 'Advanced Types',
      children: [
        '/examples/default.md',
        '/examples/hidden.md',
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
