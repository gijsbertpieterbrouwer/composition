<template>
  <tr :title="tooltip">
    <td class="name">
      <TickInput v-model="name" :disabled="disabled" />
    </td>
    <!-- <td>
      <TickSelector v-model="storageLocation" :options="storageLocationOptions" :disabled="disabled" />
    </td> -->
    <td>
      <TickInput v-model="path" :disabled="disabled" />
    </td>
    <td>
      <TickInput v-model="value" :disabled="disabled" />
    </td>
    <td v-if="enableSetSearch">
      <TickSwitch v-model="searchable" :disabled="!enableSetSearch" />
    </td>
    <td>
      <TickButton class="delete" :title="$translate(LanguagePath.App_Remove)" @click="removeDefinitionItem" icon="delete" :appearance="Appearance.secondary" :color="Color.contrast" v-if="!disabled" />
    </td>
  </tr>
</template>

<script lang="ts">

import ThenHr from "@/components/atoms/ThenHr.vue";
import TickButton, { Appearance, Color, Size } from "@/components/atoms/TickButton.vue";
import TickCheckbox from "@/components/atoms/TickCheckbox.vue";
import TickDropdown from '@/components/atoms/TickDropdown.vue';
import TickInput from "@/components/atoms/TickInput.vue";
import TickSelector from '@/components/atoms/TickSelector.vue';
import TickSwitch from '@/components/atoms/TickSwitch.vue';
import { getStorageLocationOptions, isDatabagLocation } from '@/helpers/enumsHelper';
import { replaceAll } from '@/helpers/stringHelper';
import useManagingStore from '@/store/managingStore';
import { LanguagePath, StorageLocation, TickDatabagItemDefinition } from '@/TickApi';
import { Component, Prop, Vue } from 'vue-facing-decorator';
import TickEditorPanel from '../editor/TickEditorPanel.vue';
import TickScreen from '../editor/TickScreen.vue';


@Component({
  emits: ["delete", "saved"],
  components: {
    TickInput, TickButton, TickCheckbox, ThenHr, TickScreen, TickEditorPanel, TickDropdown, TickSelector, TickSwitch
  },
})
export default class DatabagItemDefinitionRowEditor extends Vue {
  Appearance = Appearance
  Color = Color
  Size = Size
  LanguagePath = LanguagePath

  @Prop({ required: true }) private definitionItemId!: string;
  @Prop({ required: false }) private disabled!: boolean

  private get enableSetSearch(): boolean {
    if (this.disabled) { return false; }
    if (this.storageLocation != StorageLocation.Ticket) { return false }

    return true;
  }

  private get providedByTick(): boolean {
    return this.definitionItem?.providedByTick;
  }

  private get isDatabagLocation(): boolean {
    return isDatabagLocation(this.storageLocation)
  }

  private get value() {
    return this.isDatabagLocation ? this.definitionItem?.databagValue : this.definitionItem.defaultValue;
  }

  private set value(to: string) {
    if (this.isDatabagLocation) {
      this.definitionItem.databagValue = to;
    } else {
      this.definitionItem.defaultValue = to;
    }
  }

  private get name() {
    return this.definitionItem?.name
  }

  private set name(to: string) {

    this.definitionItem.name = to

    const splitter = ".";

    let path = (this.path || "").toLowerCase();
    path = replaceAll(replaceAll(path, splitter, ""), " ", "");

    let name = to.toLowerCase();
    name = replaceAll(replaceAll(name, splitter, ""), " ", "");

    if (name && (!path || name.startsWith(path))) {
      this.path = replaceAll(to.toLowerCase(), " ", splitter);
    }

  }
  private get storageLocation() {
    return this.definitionItem?.storageLocation
  }

  private set storageLocation(to: StorageLocation) {

    const oldLocation = this.definitionItem.storageLocation;
    const oldLocationName = this.specificStorageName(oldLocation);

    this.definitionItem.storageLocation = to

    if (this.definitionItem.fullPath.startsWith(oldLocationName + ".")) {
      let newFullPath = `${this.specificStorageName(to)}.${this.definitionItem.fullPath.substring(oldLocationName.length + 1)}`
      this.definitionItem.fullPath = newFullPath;
    }

  }


  private get path() {
    let p = this.definitionItem?.fullPath;
    // const storageName = this.storageName;
    // if (p.startsWith(storageName + ".")) {
    //   p = p.substring(storageName.length + 1);
    // }

    return p
  }

  private set path(to: string) {
    this.definitionItem.fullPath = to.toLowerCase();
  }

  private get searchable() {
    return this.definitionItem?.searchable
  }

  private set searchable(to: boolean) {
    this.definitionItem.searchable = to
  }

  private get storageName(): string {
    return this.specificStorageName(this.storageLocation);
  }

  private specificStorageName(location: StorageLocation): string {
    const l = this.storageLocationOptions.find(p => p.value == location)
    return l != null ? l.text.toLowerCase() : "-";
  }

  private get tooltip(): string {
    const preLine = this.definitionItem?.providedByTick ? "(read-only because provided by Tick)" : "";
    return `Usage: {{${this.path}?my-default-value}} ${preLine}`;
  }


  private get definitionItem() {
    return this.allItemDefinitions.find(p => p.id == this.definitionItemId)
  }

  private get allItemDefinitions() {
    const items = useManagingStore().databagItemDefinitions as TickDatabagItemDefinition[] || [];
    return items;
  }

  private get storageLocationOptions() {
    return getStorageLocationOptions(true, true);
  }

  private removeDefinitionItem() {
    this.$emit("delete");
  }

}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.name {
  width: 200px;
}

.delete {
  margin-left: auto;
}
</style>
