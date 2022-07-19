import { viteBundler } from 'vuepress'
import { shikiPlugin } from '@vuepress/plugin-shiki'
import theme from './theme'

export default {
  title: 'Schemastery',
  base: '/schemastery/',

  theme: theme({
    navbar: false,
    sidebar: ['/', {
      text: 'Examples',
      children: [
        '/examples/number.md',
        '/examples/string.md',
        '/examples/boolean.md',
        '/examples/bitset.md',
        '/examples/array.md',
        '/examples/dict.md',
        '/examples/union-select.md',
        '/examples/union-arbitrary.md',
        '/examples/union-tagged.md',
        '/examples/intersect.md',
        '/examples/transform.md',
      ],
    }],
  }),

  markdown: {
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
}
