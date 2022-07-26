<template>
  <span style="color: var(--shiki-token-constant)" v-if="isNullable(data)">null</span>
  <span style="color: var(--shiki-token-string)" v-else-if="typeof data === 'string'">"{{ data }}"</span>
  <span style="color: var(--shiki-token-constant)" v-else-if="typeof data === 'number'">{{ data }}</span>
  <span style="color: var(--shiki-token-constant)" v-else-if="typeof data === 'boolean'">{{ data }}</span>
  <template v-else-if="(data instanceof Date)">
    <span style="color: var(--shiki-token-function)">Date</span>
    <span style="color: var(--shiki-token-punctuation)">(</span>
    <span style="color: var(--shiki-token-string)">{{ data.toISOString() }}</span>
    <span style="color: var(--shiki-token-punctuation)">)</span>
  </template>
  <template v-else-if="(data instanceof Array)">
    <span style="color: var(--shiki-token-punctuation)">[ </span>
    <template v-for="(value, index) in data" :key="index">
      <span style="color: var(--shiki-token-punctuation)" v-if="index">, </span>
      <json :data="value"></json>
    </template>
    <span style="color: var(--shiki-token-punctuation)"> ]</span>
  </template>
  <template v-else>
    <span style="color: var(--shiki-token-punctuation)">{ </span>
    <template v-for="([key, value], index) in Object.entries(data)" :key="index">
      <span style="color: var(--shiki-token-punctuation)" v-if="index">, </span>
      <span style="color: var(--shiki-token-parameter)">"{{ key }}"</span>:
      <json :data="value"></json>
    </template>
    <span style="color: var(--shiki-token-punctuation)"> }</span>
  </template>
</template>

<script lang="ts" setup>

import { isNullable } from 'cosmokit'

defineProps({
  data: {},
})

</script>
