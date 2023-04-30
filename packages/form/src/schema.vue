<script lang="ts">

import { defineComponent, h, PropType, resolveComponent } from 'vue'
import { check, clone, deepEqual, isNullable, makeArray, Schema } from './utils'
import form from '.'
import SchemaPrimitive from './primitive.vue'
import SchemaBase from './base.vue'

export default defineComponent({
  props: {
    schema: {} as PropType<Schema>,
    initial: {} as PropType<any>,
    modelValue: {},
    invalid: Boolean,
    disabled: Boolean,
    branch: Boolean,
    prefix: { type: String, default: '' },
  },

  emits: ['update:modelValue', 'command'],

  setup(props, { attrs, emit, slots, expose }) {
    return () => {
      if (!props.schema || props.schema.meta.hidden) return

      const candidates = [...form.extensions].map((ext) => {
        if (ext.type && props.schema.type !== ext.type) return
        if (ext.role && props.schema.meta.role !== ext.role) return
        return [ext.component, +!!ext.type + +!!ext.role] as const
      }).filter(Boolean).sort((a, b) => b[1] - a[1])
      candidates.push([SchemaBase, 0])
      return h(candidates[0][0], {
        schema: props.schema,
        prefix: props.prefix,
        initial: props.initial,
        disabled: props.disabled,
        class: {
          changed: !deepEqual(props.initial, props.modelValue),
          required: props.schema.meta.required && isNullable(props.schema.meta.default) && isNullable(props.modelValue),
          invalid: props.invalid,
        },
        modelValue: props.modelValue,
        'onUpdate:modelValue': (value: any) => emit('update:modelValue', value),
      }, {
        title: () => slots.title?.(),
        desc: () => slots.desc?.() ?? h(resolveComponent('k-markdown'), { source: props.schema.meta.description }),
        menu: () => [
          h(resolveComponent('el-dropdown-item'), {
            command: 'discard',
            onClick: () => emit('update:modelValue', clone(props.initial)),
          }, () => '撤销更改'),
          h(resolveComponent('el-dropdown-item'), {
            command: 'default',
            onClick: () => emit('update:modelValue'),
          }, () => '恢复默认值'),
          ...makeArray(slots.menu?.()),
        ],
        prefix: () => slots.prefix?.(),
        suffix: () => slots.suffix?.(),
        control: () => {
          if (!check(props.schema, props.modelValue)) return
          if (['string', 'number', 'boolean'].includes(props.schema.type)) {
            return h(SchemaPrimitive, {
              schema: props.schema,
              disabled: props.disabled,
              modelValue: props.modelValue,
              'onUpdate:modelValue': (value: any) => emit('update:modelValue', value),
            })
          }
        },
      })
    }
  },
})

</script>

<style lang="scss">

.k-schema-header {
  font-size: 1.25rem;

  .el-button {
    float: right;
    transform: translateY(-2px);
  }
}

.k-schema-group {
  position: relative;
  padding-left: 1rem;
  border-bottom: 1px solid var(--el-border-color-light);

  &:empty {
    border-bottom: none;
  }

  > :first-child {
    border-top: none;
  }

  > :last-child {
    border-bottom: none;
  }
}

</style>
