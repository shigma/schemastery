import type { Theme } from '@vuepress/core'
import { defaultTheme } from '@vuepress/theme-default'
import type { DefaultThemeOptions } from '@vuepress/theme-default'

export default (options: DefaultThemeOptions): Theme => ({
  name: 'vuepress-theme-local',
  extends: defaultTheme(options),

  layouts: {
    example: require.resolve('./example.ts'),
  },
})
