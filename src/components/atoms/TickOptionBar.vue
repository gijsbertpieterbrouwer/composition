<template>
  <div class="button-bar">

    <div class="wrapper">
      <template v-for="btn in this.buttons" :key="btn.id">
        <TickButton :class="{ 'highlighted': this.isHighlighted(btn.id) }" @click="selectItem(btn)" :icon="btn.icon" :size="btn_size" :color="Color.contrast"
          :appearance="isHighlighted(btn.id) ? Appearance.primary : Appearance.transparent">
          {{ btn.text }}
        </TickButton>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, VModel, Vue } from "vue-facing-decorator";
import TickButton, { Appearance, Color, Size } from "./TickButton.vue";

export interface OptionBarItem {
  id: string | number;
  icon?: string;
  text: string;
  disabled?: boolean;
}


@Component({
  emits: ["update:modelValue"],
  components: { TickButton },
})
export default class TickOptionBar extends Vue {
  Size = Size
  Appearance = Appearance
  Color = Color

  @Prop({ default: [] }) private buttons!: OptionBarItem[];
  @Prop() private size!: Size;
  @VModel({ required: true }) private value!: string;

  private get btn_size(): Size {
    return this.size || Size.mini;
  }

  private isHighlighted(id: string | number): boolean {
    return this.model == id;
  }

  private selectItem(item: OptionBarItem) {
    this.model = item.id;
  }

  private set model(to: string | number) {
    this.$emit("update:modelValue", to);
  }

  private get model() {
    return this.value;
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.button-bar {
  //width: 100%;

  .wrapper {
    border-radius: 8px;
    padding: 4px;

    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    background-color: var(--c-base-200);

  }

}
</style>
