<template>
  <div class="storage-input">
    <select v-model="dataStorageLocation">
      <option v-for="location in this.dataStorageLocations" :key="location.value" :value="location.value">{{ location.text }}</option>
    </select>
    <input type="text" v-model="dataStorageKey" />
  </div>
</template>

<script lang="ts">
import { Component, VModel, Vue } from 'vue-facing-decorator';

import TickTextarea from "@/components/atoms/TickTextarea.vue";
import { DataPointer, StorageLocation } from "@/store/apiflowmodels";
import { LanguagePath } from '@/TickApi';
import { translate } from '@/plugins/translatePlugin';

@Component({
  emits: ["update:modelValue"],
  components: { TickTextarea },
})
export default class MessageAction extends Vue {
  @VModel() private value!: DataPointer;

  private labels = {
    [StorageLocation.Communicator]: translate(LanguagePath.StorageLocation_Communicator),
    [StorageLocation.Flow]: translate(LanguagePath.StorageLocation_Flow),
    [StorageLocation.Ticket]: translate(LanguagePath.StorageLocation_Ticket),
  }

  private get dataStorageLocations() {
    return Object.entries(this.labels).map((e) => ({ text: e[1], value: e[0] }));
  }

  private get dataStorageLocation() {
    return this.value.location;
  }

  private set dataStorageLocation(location: StorageLocation) {
    this.patch({ location });
  }

  private get dataStorageKey() {
    return this.value.value;
  }

  private set dataStorageKey(value: string) {
    this.patch({ value })
  }

  private patch(delta: Partial<DataPointer>) {
    this.$emit("update:modelValue", {
      ...this.value,
      ...delta,
    });
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.storage-input {
  padding: 0 36px 0 8px;
  font-size: 14px;
  display: flex;
  gap: 8px;
  align-items: center;

  input,
  select {
    padding: 4px;
    min-width: 0;
    width: 100%;
    flex-grow: 1;
    white-space: nowrap;
  }
}
</style>
