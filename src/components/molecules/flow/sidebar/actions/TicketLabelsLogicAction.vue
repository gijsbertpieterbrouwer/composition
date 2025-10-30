<template>
  <div class="action">

    <SidebarPanel id="labels-remove" :name="$translate(LanguagePath.App_FlowEditor_SideBar_Labels_Remove_Title)">
      <template #subheader> {{ $translate(LanguagePath.App_FlowEditor_SideBar_Labels_Remove_Explanation) }}</template>
      <LabelsSelector :disabled="disabled" v-model="removinglabelIds" />
    </SidebarPanel>

    <SidebarPanel id="labels-add" :name="$translate(LanguagePath.App_FlowEditor_SideBar_Labels_Add_Title)">
      <template #subheader>{{ $translate(LanguagePath.App_FlowEditor_SideBar_Labels_Add_Explanation) }} </template>
      <LabelsSelector :disabled="disabled" v-model="addinglabelIds" />
    </SidebarPanel>

  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-facing-decorator';
import { FlowDefinitionAction, LabelActionType, LanguagePath, TicketLogicLabelsActionData, UpdateLabelsActionDataItem } from "@/TickApi";
import { TicketLabelsLogicActionSettings } from "@/TickApiModels";
import { jsonProxy } from "@/helpers/jsonProxy";
import SidebarPanel from "@/components/atoms/SidebarPanel.vue";
import { Appearance, Color, Size } from '@/components/atoms/TickButton.vue';
import LabelsSelector from '@/components/molecules/Selectors/LabelsSelector.vue'

@Component({
  emits: ["remove", "update"],
  components: { SidebarPanel, LabelsSelector },
})
export default class TicketLabelsLogicAction extends Vue {
  LabelActionType = LabelActionType;
  Appearance = Appearance
  Color = Color
  Size = Size
  LanguagePath = LanguagePath

  @Prop() private action!: FlowDefinitionAction;
  @Prop() private settings!: TicketLabelsLogicActionSettings;
  @Prop() private disabled!: boolean;

  private get data() {
    return jsonProxy<TicketLogicLabelsActionData>(this.settings.actionDataJson || "{}", (json) => {
      this.settings.actionDataJson = json;
    });
  }
  // private actionAlreadyExist(labelDefId: string, type: LabelActionType): boolean {
  //   var existingItem = this.data.labelActions.find((la) => la.action == type && la.labelDefinitionId == labelDefId);
  //   return existingItem != null;
  // }


  private get removinglabelIds() {
    return this.data.labelActions
      .filter((la) => la.action == LabelActionType.Remove)
      .map((p) => p.labelDefinitionId);
  }

  private set removinglabelIds(to: string[]) {


    let newActions: UpdateLabelsActionDataItem[] = to.map((id) => ({
      action: LabelActionType.Remove,
      labelDefinitionId: id,
    }))

    // remove overlapping other actions (don't remove and add in the same step-action)
    const otherActions = this.data.labelActions
      .filter((la) => la.action != LabelActionType.Remove
        && !to.some(p => p == la.labelDefinitionId))

    this.data.labelActions = otherActions.concat(newActions);
  }


  private get addinglabelIds() {
    return this.data.labelActions
      .filter((la) => la.action == LabelActionType.Add)
      .map((p) => p.labelDefinitionId);
  }

  private set addinglabelIds(to: string[]) {

    let newActions: UpdateLabelsActionDataItem[] = to.map((id) => ({
      action: LabelActionType.Add,
      labelDefinitionId: id,
    }))

    // remove overlapping other actions (don't remove and add in the same step-action)
    const otherActions = this.data.labelActions
      .filter((la) => la.action != LabelActionType.Add
        && !to.some(p => p == la.labelDefinitionId))

    this.data.labelActions = otherActions.concat(newActions);
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";
</style>
