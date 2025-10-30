<template>
  <TickSettingsPanel :panelOptions="panelOptions" @close="$emit('close')" :header="false">
    <template #title>{{ $translate(LanguagePath.App_Shortcuts) }}</template>

    <template v-for="(shortcut, index) in this.shortcuts" :key="index">
      <template v-if="shortcut.isSpacer">
        <div class="spacer" />
      </template>
      <template v-else>

        <button @click="selectShortcut(shortcut)" class="shortcut-button">
          <ShortcutKey>{{ shortcut.key }}</ShortcutKey> {{ shortcut.name }}
        </button>
      </template>
    </template>

  </TickSettingsPanel>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-facing-decorator";
import { TickPanelOptions } from "@/components/atoms/TickPanel.vue";
import ShortcutKey from "@/components/atoms/ShortcutKey.vue";
import TickSettingsPanel from "@/components/panels/TickSettingsPanel.vue";
import { LanguagePath } from "@/TickApi";

export interface ShortCutPanelItem {
  isSpacer: boolean,
  key?: string,
  name?: string,
}

@Component({
  emits: ["close", "selectShortCut"],
  components: {
    ShortcutKey,
    TickSettingsPanel,
  },
})
export default class ShortcutsPanel extends Vue {
  LanguagePath = LanguagePath
  @Prop() private panelOptions!: TickPanelOptions;
  @Prop() private shortcuts!: ShortCutPanelItem[];

  private selectShortcut(shortcut: ShortCutPanelItem) {
    this.$emit("selectShortCut", shortcut)
  }


}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.shortcut-button {
  padding: 8px 0;
  display: flex;
  gap: 12px;
  align-items: center;
  white-space: nowrap;
  width: 200px;
  font-size: $text-size-regular;
  font-weight: 500;
}

.spacer {
  height: 16px;
}
</style>
