<template>
  <parent-layout>
    <template #page v-if="page.frontmatter.example">
      <example-page :key="page.key"></example-page>
    </template>
  </parent-layout>
</template>

<script lang="ts" setup>

import { usePageData } from '@vuepress/client'
import ParentLayout from '@vuepress/theme-default/lib/client/layouts/Layout.vue'
import ExamplePage from './example.vue'

const page = usePageData()

</script>
