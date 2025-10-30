<template>
  <div class="list-item">
    <button class="list-button" @click="selectItem" :class="{ 'no-icon': !this.hasIcon }">

      <div class="icon" :class="{ 'noBGColor': this.noBGColor }" v-if="hasIcon">
        <slot name="icon" />
        <tickIcon v-if="icon" :name="icon" />
      </div>

      <div class="content">
        <div class="name">{{ this.name }}</div>
        <div class="description">
          <slot />
        </div>
      </div>

      <div class="actions">
        <slot name="actions" />
      </div>

      <TickIcon name="arrow-right" />
    </button>
  </div>
</template>

<script lang="ts">
import TickIcon from "@/components/TickIcon.vue";
import { stringIsNullOrEmpty } from '@/helpers/stringHelper';
import { Component, Prop, Vue } from 'vue-facing-decorator';

@Component({
  name: "TickListItem",
  emits: [
    "select",
  ],
  components: {
    TickIcon
  }
})

export default class TickListItem extends Vue {
  @Prop({ default: "" }) private name!: string;
  @Prop({ default: "" }) private icon!: string;
  @Prop({ default: false }) private noBGColor!: boolean;
  @Prop() private clickData!: unknown;

  private selectItem() {
    this.$emit('select', this.clickData);
  }

  private get hasIcon() {
    return !!this.$slots.icon || !stringIsNullOrEmpty(this.icon);
  }

}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.list-item {
  overflow: hidden;

  &:not(:last-child) {
    border-bottom: 1px solid var(--c-base-200);
  }

  .list-button {
    display: grid;
    grid-template-columns: 48px 1fr auto 32px;
    grid-template-areas: "icon content actions indicator";
    align-items: center;
    width: 100%;


    &.no-icon {
      grid-template-areas: "content content actions indicator";
    }

    &:hover {
      color: var(--c-contrast);
      background-color: var(--c-base-300);

    }
  }

  .icon {
    grid-area: icon;
    display: grid;
    justify-content: center;
    align-content: center;

    height: 90%;
    width: 90%;
    margin-left: 5px;
    border-radius: 4px;
  }

  .content {
    grid-area: content;
    padding: 8px 10px;
    text-align: left;
  }

  .actions {
    padding-right: 10px;
    display: flex;
    gap: 10px;
  }

  .name {
    font-size: 14px;
    line-height: 20px;
  }

  .description {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    font-size: $text-size-regular;
    line-height: 16px;
    color: var(--c-contrast-hsl);

  }
}
</style>
