<template>

  <TickButton :size="Size.mini" :color="Color.contrast" :appearance="Appearance.secondary">{{ this.text }}</TickButton>
  <!-- 
  <button class="choiceOption" @click="select">
    {{ this.text }}
  </button> -->

</template>

<script lang="ts">
import TickButton, { Appearance, Color, Size } from "@/components/atoms/TickButton.vue";
import { jsonProxy } from "@/helpers/jsonProxy";

import { ChoiceOptionData, ReplyOptionsData } from "@/TickApi";
import { Component, Prop, Vue } from "vue-facing-decorator";

@Component({
  emits: [],
  components: { TickButton },
})
export default class ChoiceOption extends Vue {
  Size = Size
  Appearance = Appearance
  Color = Color
  @Prop() private data!: ReplyOptionsData;


  private get optionsData(): ChoiceOptionData {
    return jsonProxy<ChoiceOptionData>(this.data.data || "{}", () => {
      //do nothing
    });
  }

  private get text() {
    return this.optionsData.text || "";
  }

  private select() {
    //useAppStore().replyOptionCallback(this.optionsData.value)
  }

}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.choiceOption {
  cursor: pointer;
  border-radius: 6px;
  display: flex;


  line-height: 24px;
  padding: 4px 16px;
  background-color: var(--c-base-400);
  color: $white;
  transition: background-color 120ms ease;
  align-items: center;


}
</style>