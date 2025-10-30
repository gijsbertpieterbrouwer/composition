<template>
  <div class="list-item" :class="{ 'selected': this.selected, 'get-attention': this.attention }">

    <button class="list-item-button" @click="select" :class="{ 'no-title': !this.hasTitle }">
      <div class="title" v-if="hasTitle">{{ this.title }}</div>
      <div class="subtitle">
        <div class="attention-indicator" />
        {{ this.subtitle }}
      </div>
      <div class="content">
        <slot />
      </div>

      <div class="indicators">

        <slot name="indicators" />
      </div>
    </button>
  </div>
</template>

<script lang="ts">
import { stringIsNullOrEmpty } from "@/helpers/stringHelper";
import { Component, Prop, Vue } from "vue-facing-decorator";

@Component({
  emits: ["select"],
})
export default class MenuListItem extends Vue {
  @Prop() private selected: Required<boolean>;
  @Prop() private title: Required<string>;
  @Prop() private subtitle: Required<string>;
  @Prop() private attention: Required<boolean>;

  private get hasTitle() {
    return !stringIsNullOrEmpty(this.title);
  }

  private select() {
    this.$emit('select');
  }


}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

@keyframes pulse {
  from {
    opacity: 0;
  }

  33% {
    opacity: 1;
  }

  66% {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

.list-item {
  border-radius: $text-size-regular;

  &.selected {
    background-color: var(--c-base-300);
  }

  &:hover {

    background-color: var(--c-base-200);
  }
}

.list-item-button {
  width: 100%;
  padding: 12px 8px 16px 24px;

  display: grid;
  grid-template-columns: 1fr 20px;
  grid-template-areas:
    "name indicators"
    "title title";
  outline: none;

  &.no-title {
    grid-template-areas:
      "title indicators";
  }


}

.title {
  grid-area: name;
  font-size: 14px;
  line-height: 20px;
  opacity: 0.72;
  text-transform: capitalize;
}

.subtitle {
  text-transform: capitalize;
  grid-area: title;
  @include font-outfit;
  font-size: 16px;
  line-height: 20px;
  white-space: nowrap;
  overflow: hidden;

  display: flex;
  align-items: center;
  gap: 8px;

  .attention-indicator {
    display: none;
    width: 8px;
    height: 8px;
    border-radius: 8px;
    background-color: var(--c-secondary);
    flex-shrink: 0;
    animation: pulse 0.6s;
  }
}

.indicators {
  grid-area: indicators;
  height: 20px;
  overflow: hidden;
}

.list-item.get-attention {

  .subtitle {
    transform: translateX(-16px);
  }


  .attention-indicator {
    display: block;
  }
}

.content {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
</style>
