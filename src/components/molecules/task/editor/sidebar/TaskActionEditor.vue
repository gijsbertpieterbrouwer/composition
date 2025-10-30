<template>
  <!-- <div class="item-actions">
    <span class="name">{{ $translate(LanguagePath.App_TaskDefinitionEditor_Panel_Outcome_Title) }}</span>
    <TickButton @click="remove" icon="delete" v-if="!disabled" :appearance="Appearance.secondary" :size="Size.regular" :color="Color.contrast" />
  </div> -->
  <div>
    <SidebarPanel :name="$translate(LanguagePath.App_Editor_General)">
      <template #header>
        <TickSelector v-model="data.targetStatus" :options="statusOptions" :disabled="disabled"></TickSelector>
      </template>
      <TickInput v-model="data.name" :disabled="disabled">{{ $translate(LanguagePath.App_Name) }}</TickInput>
    </SidebarPanel>

    <SidebarPanel :name="$translate(LanguagePath.App_TaskDefinitionEditor_Storage_Title)">
      <template #header>
        <TickSwitch v-model="data.saveToState" :disabled="disabled" />
      </template>
      <div v-if="data.saveToState">
        <DatabagItemSelector :disabled="disabled" v-model="data.storagePath" :locations="availableStorageLocations" />
      </div>
    </SidebarPanel>
  </div>
</template>

<script lang="ts">
import { LanguagePath, StorageLocation, TaskDefinitionAction } from "@/TickApi";
import SidebarPanel from '@/components/atoms/SidebarPanel.vue';
import TickButton, { Appearance, Color, Size } from '@/components/atoms/TickButton.vue';
import TickInput from '@/components/atoms/TickInput.vue';
import TickSelector from '@/components/atoms/TickSelector.vue';
import TickSwitch from '@/components/atoms/TickSwitch.vue';
import TickTextarea from '@/components/atoms/TickTextarea.vue';
import DatabagItemSelector from '@/components/molecules/Selectors/DatabagItemSelector.vue';
import { getStorageLocationOptions, getTaskInstanceStatusOptions } from '@/helpers/enumsHelper';
import { Component, Prop, VModel, Vue } from 'vue-facing-decorator';

@Component({
  emits: ["delete"],
  components: { TickButton, TickInput, TickTextarea, TickSelector, TickSwitch, SidebarPanel, DatabagItemSelector }
})
export default class TaskActionEditor extends Vue {
  Appearance = Appearance
  Color = Color
  Size = Size
  LanguagePath = LanguagePath

  @Prop({ default: false }) private disabled = false;
  @VModel({ required: true }) private data!: TaskDefinitionAction;

  private get availableStorageLocations(): StorageLocation[] {
    return this.storageLocationOptions.map((d) => d.value);
  }

  private get model() {
    return this.data;
  }

  private set model(to: TaskDefinitionAction) {
    this.$emit("update:modelValue", to);
  }

  private get statusOptions() {
    return getTaskInstanceStatusOptions(true);
  }

  private remove() {
    this.$emit("delete");
  }

  private get storageLocationOptions() {
    return getStorageLocationOptions(false, false);
  }

}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.item-actions {
  display: flex;
  flex-wrap: wrap;

  .name {
    flex-grow: 1;
    cursor: text;
    font-size: 25px;
    display: inline-flex;
    @include font-outfit;
    font-weight: 600;
    width: 60%;
  }

}
</style>
