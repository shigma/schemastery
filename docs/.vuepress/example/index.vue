<template>
  <parent-layout>
    <template #page v-if="page.frontmatter.layout === 'example'">
      <example-page :key="page.key"></example-page>
    </template>
    <template #sidebar-bottom>
      <ul class="sidebar-bottom">
        <li class="sidebar-item sidebar-heading appearance">
          Appearance<toggle-color-mode-button></toggle-color-mode-button>
        </li>
      </ul>
    </template>
  </parent-layout>
</template>

<script lang="ts" setup>

import { defineComponent, h } from 'vue'
import { usePageData } from '@vuepress/client'
import ParentLayout from '@vuepress/theme-default/lib/client/layouts/Layout.vue'
import ToggleColorModeButton from '@vuepress/theme-default/lib/client/components/ToggleColorModeButton.vue'
import ExamplePage from './page.vue'

const page = usePageData()

</script>

<style lang="scss" scoped>

.sidebar-bottom {
  margin-top: auto;
  margin-bottom: 1rem;
}

.appearance {
  display: flex;
  align-items: center;
  justify-content: space-between;

  button {
    margin: 0;
  }
}

</style>
