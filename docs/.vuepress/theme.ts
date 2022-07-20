import type { Theme } from '@vuepress/core'
import { defaultTheme } from '@vuepress/theme-default'
import type { DefaultThemeOptions } from '@vuepress/theme-default'

export default (options: DefaultThemeOptions): Theme => ({
  name: 'vuepress-theme-local',
  extends: defaultTheme(options),

  layouts: {
    Layout: require.resolve('./layout.vue'),
  },

  alias: {
    '@theme/Sidebar.vue': require.resolve('./sidebar.vue'),
  },
})
