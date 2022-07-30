<template>
  <div class="example-container">
    <div class="left-container">
      <section class="theme-default-content">
        <el-scrollbar>
          <main>
            <content></content>
          </main>
        </el-scrollbar>
      </section>

      <section>
        <header>Input</header>
        <main>
          <code>
            <json :data="input"></json>
          </code>
        </main>
      </section>

      <section>
        <header>Output</header>
        <main>
          <code>
            <json :data="output"></json>
          </code>
        </main>
      </section>
    </div>

    <section class="right-container">
      <el-scrollbar>
        <form>
          <k-schema :schema="schema" :initial="initial" v-model="config"></k-schema>
        </form>
      </el-scrollbar>
    </section>
  </div>
</template>

<script setup lang="ts">

import { computed, ref, watch } from 'vue'
import { clone } from 'schemastery-vue'
import { usePageFrontmatter } from '@vuepress/client'
import Json from './json.vue'

const frontmatter = usePageFrontmatter()

const schema = computed(() => eval(frontmatter.value.code))

const initial = ref(null)
const config = ref(null)

const output = computed(() => {
  try {
    return schema.value(config.value)
  } catch (e) {}
})

const input = computed(() => {
  try {
    return JSON.parse(JSON.stringify(config.value))
  } catch (e) {}
})

</script>

<style lang="scss">

.example-container {
  position: relative;
  padding-left: var(--sidebar-width);
  height: 100vh;
  box-sizing: border-box;
  display: flex;

  > * {
    flex: 1;
  }

  > .left-container {
    box-sizing: border-box;
    border-right: 1px solid var(--c-border);
    display: flex;
    flex-direction: column;
    max-width: 50%;
    background-color: var(--code-bg-color);
    transition: transform var(--t-transform), background-color var(--t-color), border-color var(--t-color);

    section {
      flex: 1 1 auto;
      box-sizing: border-box;
      transition: transform var(--t-transform), background-color var(--t-color), border-color var(--t-color);

      main {
        padding: 1rem 2rem;
      }
    }

    .theme-default-content {
      overflow-y: auto;

      h1 {
        font-size: 1.75rem;
        margin-top: 1rem !important;

        + p {
          margin-top: 1rem;
        }
      }
    }

    section:not(.theme-default-content) {
      code {
        color: var(--shiki-color-text);
        background-color: var(--shiki-color-background);
      }
    }
  }

  .right-container {
    h2, h3 {
      border-bottom: none;
    }

    form {
      padding: 2rem 3rem;
    }
  }

  section header {
    height: 3rem;
    border-top: 1px solid var(--c-border);
    border-bottom: 1px solid var(--c-border);
    padding: 0 2rem;
    display: flex;
    align-items: center;
    font-weight: 500;
    font-size: 1.125rem;
  }
}

</style>
