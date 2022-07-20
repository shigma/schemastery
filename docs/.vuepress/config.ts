import { viteBundler } from 'vuepress'
import { shikiPlugin } from '@vuepress/plugin-shiki'
import theme from './theme'

export default {
  title: 'Schemastery',
  base: '/schemastery/',

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
}
