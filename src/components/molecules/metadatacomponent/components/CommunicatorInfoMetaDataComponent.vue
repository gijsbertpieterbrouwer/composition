<template>
  <MetaDataComponentWrapper :data="data">

    <template #subheader>
      <TickButton v-if="canEditCommunicator" @click="editCommunicator" :size="ButtonSize.mini" :color="ButtonColor.contrast" :appearance="ButtonAppearance.secondary">{{
        $translate(LanguagePath.App_View) }}
      </TickButton>
      <TickButton :busy="busySaving" @click="save" :size="ButtonSize.mini" :color="ButtonColor.contrast" :appearance="ButtonAppearance.secondary">{{
        $translate(LanguagePath.App_Save) }}
      </TickButton>


    </template>

    <div class="info">
      <AvatarSelector :disabled="!canEditCommunicator" @select="setAvatarSelection" :fileId="avatarFileId" :name="name" :color="color" :sizePx="100" :type="null" />
      <TickInput :disabled="disabled" class="input" v-model.lazy="name" :maxlength="20" :placeholder="$translate(LanguagePath.App_Name)" v-focus:true />
    </div>

    <TickFormInstance class="form" v-if="hasForm" :disabled="!canEditCommunicator" :form="formData" :validationResponse="validationResponse" />
  </MetaDataComponentWrapper>
</template>

<script lang="ts">
import TickButton, {
  Appearance as ButtonAppearance,
  Color as ButtonColor,
  Size as ButtonSize,
} from "@/components/atoms/TickButton.vue";
import TickComboButton from '@/components/atoms/TickComboButton.vue';
import { DropdownOption } from '@/components/atoms/TickDropdown.vue';
import TickInput from '@/components/atoms/TickInput.vue';
import TickListItem from '@/components/atoms/TickListItem.vue';
import { AvatarSelection } from '@/components/panels/AvatarSelectorPanel.vue';
import { displayDate } from '@/helpers/dateHelper';
import { jsonProxy } from "@/helpers/jsonProxy";
import { RouterToTicket, RouterToView, ViewName } from '@/router';
import useCommunicatorsStore from "@/store/communicators";
import useUserStore from '@/store/user';
import { AuthorizationObjectType, CommunicatorHistoryDataItem, FormValidationResponse, LanguagePath, MetaDataComponentCommunicatorInfoData, MetaDataComponentUpdate } from '@/TickApi';
import { Component, Prop, Vue } from 'vue-facing-decorator';
import TickFormInstance from '../../form/form/TickFormInstance.vue';
import AvatarSelector from '../../Selectors/AvatarSelector.vue';
import TicketStatusLabel from '../../ticket/TicketStatusLabel.vue';
import MetaDataComponentWrapper from './MetaDataComponentWrapper.vue';

export interface IMetaDataComponentListItem {
  id: string;
  title: string;
  subtitle: string;
}

@Component({
  emits: [],
  components: { MetaDataComponentWrapper, TickListItem, TicketStatusLabel, TickFormInstance, AvatarSelector, TickInput, TickComboButton, TickButton },
})
export default class CommunicatorInfoMetaDataComponent extends Vue {
  LanguagePath = LanguagePath
  ButtonSize = ButtonSize;
  ButtonAppearance = ButtonAppearance;
  ButtonColor = ButtonColor;
  @Prop() private data!: MetaDataComponentUpdate;
  @Prop() private disabled!: boolean;

  //private validationResponse: FormValidationResponse = null;
  private busySaving = false;

  private get validationResponse(): FormValidationResponse {
    return this.update.formValidationResponse;
  }


  private save() {
    this.busySaving = true;
    useCommunicatorsStore().updateCommunicatorFromMetaDataComponent(this.data.ticketId, this.data.metaDataComponentDefinitionId, this.update.communicatorSummary.id, this.update).then((d) => {
      //this.validationResponse = d.formValidationResponse;
      // if (!d.some(p => !p.isValid)) {
      //   this.$emit("saved");
      // }
      this.busySaving = false;
      this.data.componentData = JSON.stringify(d);
    });
  }

  private editCommunicator() {
    RouterToView(ViewName.Communicators, this.update.communicatorSummary.id);
  }

  private get mainOptions(): DropdownOption[] {
    const editOptions = [];
    return editOptions;
  }

  private setAvatarSelection(to: AvatarSelection) {
    const c = this.update.communicatorSummary;
    c.avatarFileId = to.fileId;
    c.color = to.color;
    this.update.communicatorSummary = c;
    //this.data.componentData = JSON.stringify(this.update);
  }

  private get avatarFileId() {
    return this.update?.communicatorSummary?.avatarFileId;
  }
  private get name() {
    return this.update?.communicatorSummary?.name;
  }

  private set name(to: string) {
    this.update.communicatorSummary.name = to;
  }
  private get color() {
    return this.update?.communicatorSummary?.color;
  }
  // private get communicator() {
  //   return this.update?.communicatorSummary;
  // }

  private select(item: CommunicatorHistoryDataItem) {
    RouterToTicket(item.ticketId);
  }

  // private get update(): MetaDataComponentCommunicatorInfoData {
  //   return JSON.parse(this.data.componentData);
  // }

  private get update() {
    return jsonProxy<MetaDataComponentCommunicatorInfoData>(
      this.data.componentData,
      (json) => {
        this.data.componentData = json;
      }
    );
  }

  private set update(to: MetaDataComponentCommunicatorInfoData) {

    this.data.componentData = JSON.stringify(to);


  }

  private get hasForm(): boolean {
    return this.formData != null;
  }
  private get formData() {
    return this.update?.form != null ? this.update?.form : null;
  }

  private getSubTitle(item: CommunicatorHistoryDataItem) {
    return displayDate(item.creationDate, true);
  }

  private get canEditCommunicator(): boolean {
    if (this.disabled) { return false; }
    return useUserStore().allowedEdit(AuthorizationObjectType.Workspace)
  }

}

</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.info {
  width: 100%;
  display: grid;
  gap: 10px;
}

.form {
  margin-left: -10px;
  width: 100%;

}
</style>
