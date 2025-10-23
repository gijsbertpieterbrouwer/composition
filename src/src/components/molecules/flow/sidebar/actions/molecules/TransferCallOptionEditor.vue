<template>

  <div class="wrapper">

    <div class="header">
      <div class="condition">{{ $translate(LanguagePath.Condition_If) }}: <TickButton icon="condition" :disabled="disabled" @click="editCondition" :appearance="Appearance.secondary"
          :color="Color.contrast" :size="Size.mini">{{ conditionName }}</TickButton>
      </div>
      <span>
        <TickButton icon="delete" v-if="!disabled" @click.stop="remove" :appearance="Appearance.secondary" :color="Color.contrast" :size="Size.mini" />
      </span>
    </div>


    {{ $translate(LanguagePath.App_FlowEditor_SideBar_TransferCall_Explanation) }}


    <UsersAndTeamsSelector :limitToOne="true" :title="$translate(LanguagePath.App_FlowEditor_SideBar_TransferCall_Random_FromTeam_Selector_Title)" v-model="transferToUserOrTeam"
      :emptyLabel="$translate(LanguagePath.App_FlowEditor_SideBar_TransferCall_Specific_Selector_Empty_Title)" />


  </div>

</template>

<script lang="ts">
import ThenHr from "@/components/atoms/ThenHr.vue";
import TickButton, { Appearance, Color, Size } from '@/components/atoms/TickButton.vue';
import TickInput from '@/components/atoms/TickInput.vue';
import TickSwitch from "@/components/atoms/TickSwitch.vue";
import UsersAndTeamsSelector, { UsersAndTeamsSelection } from "@/components/molecules/Selectors/UsersAndTeamsSelector.vue";
import { tokenize } from '@/directives';
import { getFlowReadStorageLocations } from '@/helpers/enumsHelper';
import { AssigneeTypeEnum, LanguagePath, SpecialTransferCallOption, StorageLocation } from '@/TickApi';
import { Component, Prop, VModel, Vue } from 'vue-facing-decorator';
import { openConditionEditorPanel } from "../../../panel/ConditionEditorPanel.vue";
@Component({
  directives: { tokenize },
  emits: ["update:modelValue", "update", "remove"],
  components: { TickInput, ThenHr, TickButton, UsersAndTeamsSelector, TickSwitch },
})
export default class TransferCallOptionEditor extends Vue {
  AssigneeTypeEnum = AssigneeTypeEnum
  Appearance = Appearance
  Color = Color
  Size = Size
  StorageLocation = StorageLocation
  LanguagePath = LanguagePath
  @VModel() private value!: SpecialTransferCallOption;
  @Prop() private disabled!: boolean;

  private get readLocations() {
    return getFlowReadStorageLocations();
  }

  private remove() {
    this.$emit("remove");
  }

  private update() {
    this.$emit("update:modelValue", this.value);
    this.$emit("update", this.value);
  }

  private editCondition() {
    openConditionEditorPanel(this.disabled, false, false, "", this.value.condition, (to) => {
      this.value.condition = to;
      this.update();
    });
  }

  private get conditionName(): string {
    return this.value?.condition?.name;
  }



  private get transferToUserOrTeam(): UsersAndTeamsSelection {
    return this.value.transferToUserId
      ? { userIds: [this.value.transferToUserId], teamIds: [] }
      : this.value.transferToTeamId
        ? { userIds: [], teamIds: [this.value.transferToTeamId] }
        : { userIds: [], teamIds: [] };
  }

  private set transferToUserOrTeam(to: UsersAndTeamsSelection) {
    this.value.transferToUserId = to.userIds.length ? to.userIds[0] : null;
    this.value.transferToTeamId = to.teamIds.length ? to.teamIds[0] : null;
    this.update();
  }

}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.wrapper {
  background-color: var(--c-base-300);
  display: grid;
  border: dotted 1px var(--c-contrast);
  padding: 10px;
  border-radius: 8px;
  font-size: $text-size-regular;
  gap: 10px;

  .header {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;

    .condition {
      flex-grow: 1;
      display: inline-flex;
      flex-wrap: wrap;
      gap: 10px;
      align-items: center;
    }


  }

}
</style>
