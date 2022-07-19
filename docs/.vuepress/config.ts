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
        '/examples/object.md',
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
