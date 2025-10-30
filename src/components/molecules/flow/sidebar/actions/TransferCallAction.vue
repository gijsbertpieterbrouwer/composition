<template>
  <div class="action">


    <SidebarPanel id="message-message" :name="$translate(LanguagePath.App_FlowEditor_SideBar_Message_Title)">
      <TickTextarea v-model.lazy="message" :disabled="disabled" class="message" v-tokenize="{ locations: this.readLocations, defaultNewStorageLocation: StorageLocation.Flow }"
        :placeholder="$translate(LanguagePath.App_FlowEditor_SideBar_Message_MarkDown_Placeholder)" />


      <div class="options">
        <template v-for="(transfer, index) in transferCallOptions" :key="transfer.id">
          <TransferCallOptionEditor @remove="removeTransferOption(transfer)" @update="conditionUpdate" v-model="transferCallOptions[index]" />
        </template>
      </div>
      <TickButton icon="plus" v-if="!disabled" @click="addTransferOption" :appearance="Appearance.secondary" :color="Color.contrast">Add</TickButton>

    </SidebarPanel>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-facing-decorator';

import TickCheckbox from "@/components/atoms/TickCheckbox.vue";
import TickTextarea from "@/components/atoms/TickTextarea.vue";
import StorageInput from "@/components/molecules/flow/sidebar/actions/molecules/StorageInput.vue";
import TickIcon from "@/components/TickIcon.vue";
import { jsonProxy } from "@/helpers/jsonProxy";
import { FlowActionSpecialSettings, FlowDefinitionAction, LabelActionType, LanguagePath, SpecialTransferCallOption, SpecialTransferCallSettings, StorageLocation } from "@/TickApi";

import LabelList from "@/components/atoms/LabelList.vue";
import SidebarPanel from "@/components/atoms/SidebarPanel.vue";
import TickButton, { Appearance, Color } from '@/components/atoms/TickButton.vue';
import TickDropdown from '@/components/atoms/TickDropdown.vue';
import TickInput from '@/components/atoms/TickInput.vue';
import { tokenize } from '@/directives';
import { findMaxValueInList } from '@/helpers/arrayHelper';
import { getEmptyConditiongroup as getEmptyConditionGroup } from '@/helpers/conditionHelper';
import { getFlowReadStorageLocations } from '@/helpers/enumsHelper';
import generateId from '@/helpers/guid';
import { askNewName } from '@/helpers/questionHelper';
import useUserStore from '@/store/user';
import TransferCallOptionEditor from './molecules/TransferCallOptionEditor.vue';
@Component({
  directives: { tokenize },
  emits: [],
  components: { SidebarPanel, StorageInput, TickIcon, TickCheckbox, TickTextarea, LabelList, TickDropdown, TickInput, TransferCallOptionEditor, TickButton },
})
export default class TransferCallAction extends Vue {
  LabelActionType = LabelActionType;
  StorageLocation = StorageLocation;
  LanguagePath = LanguagePath
  Appearance = Appearance
  Color = Color
  @Prop() private action!: FlowDefinitionAction;
  @Prop() private settings!: FlowActionSpecialSettings;
  @Prop() private disabled!: boolean;

  private get readLocations() {
    return getFlowReadStorageLocations();
  }

  private get data() {
    return jsonProxy<SpecialTransferCallSettings>(this.settings?.actionDataJson || "{}", (json) => {
      this.settings.actionDataJson = json;
    });
  }


  private get message() {
    return this.data.message || "";
  }

  private set message(to) {
    this.data.message = to;
  }

  private get transferCallOptions() {
    return this.data.transferCallOptions || [];
  }

  private set transferCallOptions(to) {
    this.data.transferCallOptions = to;
  }

  private conditionUpdate() {
    this.data.transferCallOptions = this.data.transferCallOptions.slice(0);
  }

  private removeTransferOption(item: SpecialTransferCallOption) {
    this.data.transferCallOptions = this.data.transferCallOptions.filter(p => p.id != item.id)
  }

  private addTransferOption() {

    askNewName((to) => {

      const newIndex = findMaxValueInList(this.data.transferCallOptions, "index") + 1;
      this.data.transferCallOptions.push({
        condition: getEmptyConditionGroup(to),
        id: generateId(),
        index: newIndex,
        transferToUserId: useUserStore().userId,  // to self
      })
      this.data.transferCallOptions = this.data.transferCallOptions.slice(0);


    }, "");



  }



}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.options {
  display: grid;
  gap: 10px;
}
</style>
