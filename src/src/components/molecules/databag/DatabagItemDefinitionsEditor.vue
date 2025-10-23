<template>


  <template v-for="location in this.locations" :key="location.value">
    <template v-if="locationHasItems(location.value) || this.canAdd(location.value)">
      <TickHeading :size="HeaderSize.medium">{{ location.text }}
        <TickReadOnlyLabel v-if="isDatabagLocation(location.value)">{{ $translate(LanguagePath.App_DatabagItemDefinitionEditor_OnlyEditHere) }}</TickReadOnlyLabel>
      </TickHeading><br />
      <div class="info">{{ this.locationExplanation(location.value) }}</div>
      <table class="styledTable">
        <thead>
          <tr>
            <th>{{ $translate(LanguagePath.App_Name) }} </th>

            <th>{{ $translate(LanguagePath.App_DatabagItemDefinitionEditor_Path) }}</th>
            <th> {{ this.locationDefaultLabel(location.value) }}</th>
            <th style="width:80px" v-if="location.value == StorageLocation.Ticket">{{ $translate(LanguagePath.App_DatabagItemDefinitionEditor_Searchable) }}</th>
            <th style="width:50px;"></th>
          </tr>
        </thead>
        <tbody>
          <DatabagItemDefinitionRowEditor @delete="deleteItemDefinition(item)" :disabled="itemIsDisabled(item)" :definitionItemId="item.id" v-for="item in this.filteredItemDefinitions(location.value)"
            :key="item.id" />
          <tr v-if="canAdd(location.value)">
            <td colspan="100">
              <TickButton v-if="canAdd(location.value)" @click="addEmptyDefinitionItem(location)" class="add-button" icon="plus" :appearance="Appearance.secondary" :color="Color.contrast">
                {{ $translate(LanguagePath.App_Add) }}
                <!-- {{ this.specificStorageName(location.value) }}
                variable-->
              </TickButton>
            </td>

          </tr>
        </tbody>
      </table>
    </template>

  </template>


</template>

<script lang="ts">

import { AuthorizationObjectType, DataItemDataType, LanguagePath, StorageLocation, SubscriptionCostItemType, TickDatabagItemDefinition } from '@/TickApi';
import TickIcon from '@/components/TickIcon.vue';
import TeamIcon from '@/components/atoms/TeamIcon.vue';
import ThenHr from "@/components/atoms/ThenHr.vue";
import TickButton, { Appearance, Color, Size } from "@/components/atoms/TickButton.vue";
import TickCheckbox from "@/components/atoms/TickCheckbox.vue";
import TickDropdown from '@/components/atoms/TickDropdown.vue';
import TickHeading, { Size as HeaderSize } from '@/components/atoms/TickHeading.vue';
import TickInput from "@/components/atoms/TickInput.vue";
import TickReadOnlyLabel from '@/components/atoms/TickReadOnlyLabel.vue';
import TickSelector from '@/components/atoms/TickSelector.vue';
import TickSwitch from '@/components/atoms/TickSwitch.vue';
import UserIcon from '@/components/atoms/UserIcon.vue';
import { getStorageLocationOptions, isDatabagLocation } from '@/helpers/enumsHelper';
import generateId from "@/helpers/guid";
import { translate } from '@/plugins/translatePlugin';
import useManagingStore from '@/store/managingStore';
import useUserStore from '@/store/user';
import { Component, Vue } from 'vue-facing-decorator';
import TickEditorPanel from '../editor/TickEditorPanel.vue';
import TickScreen from '../editor/TickScreen.vue';
import DatabagItemDefinitionRowEditor from './DatabagItemDefinitionRowEditor.vue';

@Component({
  emits: ["saved"],
  components: {
    TickInput, TickButton, TickCheckbox, ThenHr, TickScreen, TickEditorPanel, TickDropdown, TickSelector, TickSwitch, DatabagItemDefinitionRowEditor, UserIcon, TeamIcon, TickHeading, TickIcon, TickReadOnlyLabel
  },
})
export default class DatabagItemDefinitionsEditor extends Vue {
  Appearance = Appearance
  Color = Color
  Size = Size
  HeaderSize = HeaderSize
  StorageLocation = StorageLocation
  LanguagePath = LanguagePath
  private loaded = false;

  mounted() {
    useManagingStore().useDatabagItemDefinitions().then(() => {
      this.loaded = true;
    });
  }


  private get addAllowedInPlan() {
    const currentNr = this.allItemDefinitions.length;
    return useUserStore().allowedAddInPlan(SubscriptionCostItemType.DatabagItem, currentNr)
  }


  private canAdd(l: StorageLocation): boolean {
    if (this.disabled) { return false; }
    if (!this.addAllowedInPlan) { return false; }
    if (l == StorageLocation.Tick) { return false; }

    return true;
  }

  private get storageLocationOptions() {
    return getStorageLocationOptions(true, true);
  }

  private specificStorageName(location: StorageLocation): string {
    const l = this.storageLocationOptions.find(p => p.value == location)
    return l != null ? l.text.toLowerCase() : "-";
  }

  private locationExplanation(l: StorageLocation): string {
    switch (l) {
      case StorageLocation.Vault: return translate(LanguagePath.App_DatabagItemDefinitionEditor_Vault_Explanation);
      case StorageLocation.Workspace: return translate(LanguagePath.App_DatabagItemDefinitionEditor_Workspace_Explanation);
      case StorageLocation.Tick: return translate(LanguagePath.App_DatabagItemDefinitionEditor_Tick_Explanation);
      default: return translate(LanguagePath.App_DatabagItemDefinitionEditor_Others_Explanation, [{ path: 'name', value: this.specificStorageName(l) }]);
    }
  }

  private isDatabagLocation(l: StorageLocation): boolean {
    return isDatabagLocation(l)
  }

  private locationDefaultLabel(l: StorageLocation): string {
    return isDatabagLocation(l) ? translate(LanguagePath.App_Value) : translate(LanguagePath.App_DatabagItemDefinitionEditor_DefaultValue);
  }

  private itemIsDisabled(item: TickDatabagItemDefinition) {
    if (this.disabled) { return true; }
    return item.providedByTick;
  }

  private get disabled() {
    return !this.allowEdit;
  }
  private get allowEdit() {
    return useUserStore().allowedEdit(AuthorizationObjectType.TechnicalConfiguration);
  }

  private get locations() {
    const locations = getStorageLocationOptions(true, true).sort((a, b) => a.text.localeCompare(b.text));
    return locations;
  }

  private locationHasItems(location: StorageLocation): boolean {
    return this.filteredItemDefinitions(location).length > 0
  }
  private get allItemDefinitions() {
    const items = useManagingStore().databagItemDefinitions as TickDatabagItemDefinition[] || [];
    return items//.sort((a, b) => a.name.localeCompare(b.name));
  }

  private filteredItemDefinitions(location: StorageLocation) {
    return this.allItemDefinitions.filter(p => p.storageLocation == location);//.sort((a, b) => a.name.localeCompare(b.name));
  }

  private deleteItemDefinition(item: TickDatabagItemDefinition) {
    useManagingStore().databagItemDefinitions = useManagingStore().databagItemDefinitions.filter(p => p.id != item.id);
  }

  private addEmptyDefinitionItem(location: { text: string, value: StorageLocation }) {

    this.allItemDefinitions.push({
      id: generateId(),
      name: location.text,
      dataType: DataItemDataType.Text,
      fullPath: `${location.text.toLowerCase()}.`,
      searchable: false,
      storageLocation: location.value
    })
  }

  private save() {
    useManagingStore().saveDatabagItemDefinitions().then(() => {
      this.$emit("saved");
    });
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.info {
  font-size: 0.7em;
  opacity: 0.7;
  padding-bottom: 15px;
  padding-left: 10px;
}

.styledTable {
  margin-bottom: 40px;
  margin-top: -15px;

  tbody {
    tr:not(:first-child) {
      border-top: solid 1px var(--c-base-200);
    }

    tr:hover {
      background-color: var(--c-base-100);
    }
  }

}

.add-button {
  // width: 100%;
}
</style>
