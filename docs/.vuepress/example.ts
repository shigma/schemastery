import { defineComponent, h } from 'vue'
import { usePageData } from '@vuepress/client'
import ParentLayout from '@vuepress/theme-default/lib/client/layouts/Layout.vue'
import ExamplePage from './example.vue'

export default defineComponent(() => {
  const page = usePageData()

  return () => h(ParentLayout, {}, {
    page: () => {
      if (page.value.frontmatter.layout !== 'example') return
      return h('keep-alive', {}, h(ExamplePage, { key: page.value.key }))
    },
  })
})
