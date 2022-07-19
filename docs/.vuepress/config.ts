import { viteBundler } from 'vuepress'
import theme from './theme'

export default {
  title: 'Schemastery',

  theme: theme({
    sidebar: ['/', {
      text: 'Examples',
      children: [
        '/examples/primitive.md',
        '/examples/object.md',
      ],
    }],
  }),

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
