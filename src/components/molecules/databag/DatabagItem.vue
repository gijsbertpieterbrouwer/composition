<template>
  <div class="databag-item">
    <DatabagItemSelector v-model="path" :locations="availableLocations" />
    <TickInput v-model="value">{{ $translate(LanguagePath.App_Value) }}</TickInput>
  </div>
</template>

<script lang="ts">

import ThenHr from "@/components/atoms/ThenHr.vue";
import TickButton from "@/components/atoms/TickButton.vue";
import TickCheckbox from "@/components/atoms/TickCheckbox.vue";
import TickInput from "@/components/atoms/TickInput.vue";
import TickTextArea from "@/components/atoms/TickTextarea.vue";
import { LanguagePath, StorageLocation, TickDatabagItem, } from '@/TickApi';
import { Component, Prop, Vue } from 'vue-facing-decorator';
import TickEditorPanel from '../editor/TickEditorPanel.vue';
import DatabagItemSelector from '../Selectors/DatabagItemSelector.vue';


@Component({
  emits: [],
  components: { TickInput, TickTextArea, TickButton, TickCheckbox, ThenHr, TickEditorPanel, DatabagItemSelector },
})
export default class DataBagItem extends Vue {
  StorageLocation = StorageLocation
  LanguagePath = LanguagePath
  @Prop() private item: TickDatabagItem;
  @Prop() private location: StorageLocation;

  private get availableLocations(): StorageLocation[] {
    return [this.location];
  }

  private get path() {
    return this.item.path;
  }

  private set path(to: string) {
    this.item.path = to;
  }

  private get value() {
    return this.item.data;
  }

  private set value(to: string) {
    this.item.data = to;
  }

}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";
</style>
