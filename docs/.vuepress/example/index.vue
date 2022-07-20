<template>
  <parent-layout>
    <template #page v-if="page.frontmatter.layout === 'example'">
      <keep-alive>
        <example-page :key="page.key"></example-page>
      </keep-alive>
    </template>
    <template #sidebar-bottom>
      <ul class="bottom">
        <li class="sidebar-item sidebar-heading">
          Appearance <toggle-color-mode-button></toggle-color-mode-button>
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
