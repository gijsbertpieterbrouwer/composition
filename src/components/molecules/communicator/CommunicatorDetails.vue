<template>
  <TickScreen :loading="isLoading" :title="name">
    <template v-slot:subtitle>
      <CommunicatorCategoriesSelector v-model="chosenCategories" v-if="loaded" />
    </template>
    <template v-slot:actions>

      <TickButton @click="addTicket" icon="plus" :appearance="Appearance.secondary" :color="Color.contrast">{{ $translate(LanguagePath.Ticket) }}</TickButton>
      <TickButton @click="mergeCommunicator" :appearance="Appearance.secondary" :color="Color.contrast">{{ $translate(LanguagePath.App_CommunicatorPanel_Merge_Title) }}</TickButton>
      <TickButton @click="save" :appearance="Appearance.primary" :color="Color.contrast">{{ $translate(LanguagePath.App_Save) }}</TickButton>
    </template>
    <template v-slot:default>
      <!-- <TickOptionBar class="tab-bar" v-if="categoryFormButtons.length > 1" v-model="editorViewStateValue" :buttons="categoryFormButtons" :size="Size.regular" /> -->
      <div class="wrapper">
        <TickEditorPanel :name="$translate(LanguagePath.App_Editor_General)" v-if="loaded">
          <div class="general-section">
            <div class="info">
              <AvatarSelector :disabled="!canEditCommunicator" @select="setAvatarSelection" :fileId="avatarFileId" :name="name" :color="color" :sizePx="100" :type="null" />
              <TickInput class="input" v-model.lazy="name" :maxlength="20" :placeholder="$translate(LanguagePath.App_Name)" v-focus:true />
            </div>

            <div class="addresses">
              <CommunicatorAddressLabel :communicatorId="activeId" :address="address" :sizePx="20" v-for="address in addresses" :key="address.id" />

              <!-- <div class="address" v-for="address in addresses" :key="address.id">
                <TickAvatar class="address-avatar" :sizePx="20" :online="false" :fileId="address.avatarFileId" :name="name" /> <span class="address-name">{{
                  communicationName(address)
                }}</span>
              </div> -->
            </div>

            <div class="tickets-list">
              <template v-for="item in tickets" :key="item.id">
                <TickListItem @click="selectTicket(item)" class="list-item" :name="item.title">
                  <div class="history-description"><span class="subtitle">{{ this.getSubTitle(item) }}</span> <span class="divider">&#9679;</span>
                    <TicketStatusLabel :status="item.status" />
                  </div>
                </TickListItem>
              </template>
            </div>
          </div>

        </TickEditorPanel>


        <TickEditorPanel :name="$translate(LanguagePath.App_CommunicatorDetails_PhoneCalls_Title)" v-if="loaded && hasCalls" :maxheight="200">
          <div class="calls-list">
            <TickPhoneCallListItem :call="item" v-for="item in phoneCalls" :key="item.id" />
          </div>
        </TickEditorPanel>


        <template v-for="workingData in categoryWorkingDatas" :key="workingData.categoryDefinitionId">
          <TickEditorPanel :name="getCategoryName(workingData)">
            <template #actions>

              <TickButton v-if="canEditCategoryDefinition" @click="editCategory(workingData.categoryDefinitionId)" :appearance="Appearance.secondary" :color="Color.contrast" :size="Size.mini">{{
                $translate(LanguagePath.App_Edit) }}</TickButton>
            </template>

            <!-- <TickHeading :size="HeadingSize.small">{{ getCategoryName(workingData) }}</TickHeading> -->
            <TickFormInstance v-if="workingData.form" :disabled="!canEditCommunicator" :form="workingData.form" :validationResponse="getValidationsForForm(workingData)" />
          </TickEditorPanel>
        </template>
      </div>
    </template>
  </TickScreen>
</template>

<script lang="ts">
import { AuthorizationObjectType, ColorsEnum, CommunicatorAddress, CommunicatorCategoryWorkingData, FormValidationResponse, LanguagePath, TickCommunicatorWorkingData, TicketSummary } from "@/TickApi";
import CommunicatorAddressLabel from "@/components/atoms/CommunicatorAddressLabel.vue";
import TickAvatar from "@/components/atoms/TickAvatar.vue";
import TickButton, { Appearance, Color, Size } from '@/components/atoms/TickButton.vue';
import TickHeading, { Size as HeadingSize } from "@/components/atoms/TickHeading.vue";
import Ticklabel, { Size as LabelSize } from "@/components/atoms/TickLabel.vue";
import TickListItem from "@/components/atoms/TickListItem.vue";
import TickOptionBar from "@/components/atoms/TickOptionBar.vue";
import TickPhoneCallListItem from "@/components/atoms/TickPhoneCallListItem.vue";
import { AvatarSelection } from "@/components/panels/AvatarSelectorPanel.vue";
import { openMergeCommunicatorPanel } from "@/components/panels/CommunicatorMergePanel.vue";
import { openTicketCreatorPanel } from "@/components/panels/TicketCreatorPanel.vue";
import { getCommunicationAddressName } from "@/helpers/communicationsHelper";
import { displayDate } from "@/helpers/dateHelper";
import { RouterToTicket, RouterToView, ViewName } from "@/router";
import useCommunicatorsStore from "@/store/communicators";
import useUserStore from "@/store/user";
import useUtilityDataStore from "@/store/utilitydata";
import { Component, Prop, Vue, Watch } from 'vue-facing-decorator';
import AvatarSelector from "../Selectors/AvatarSelector.vue";
import CommunicatorCategoriesSelector from "../Selectors/CommunicatorCategoriesSelector.vue";
import TickInitiator from '../TickInitiator.vue';
import TickEditorPanel from '../editor/TickEditorPanel.vue';
import TickScreen from '../editor/TickScreen.vue';
import TickFormInstance from "../form/form/TickFormInstance.vue";

@Component({
  emits: ["select", "exit", "saved"],
  components: {
    TickScreen, TickEditorPanel, TickButton, TickFormInstance, TickHeading, TickInitiator, Ticklabel,
    TickOptionBar, CommunicatorCategoriesSelector, TickAvatar, AvatarSelector, TickListItem, CommunicatorAddressLabel, TickPhoneCallListItem
  }
})
export default class CommunicatorDetails extends Vue {
  Appearance = Appearance
  Color = Color
  Size = Size
  LanguagePath = LanguagePath
  ColorsEnum = ColorsEnum
  LabelSize = LabelSize
  HeadingSize = HeadingSize

  @Prop() private activeId!: string;

  private loaded = false;

  private mergeCommunicator() {
    openMergeCommunicatorPanel(this.communicator);
  }

  private get canEditCategoryDefinition() {
    return useUserStore().allowedEdit(AuthorizationObjectType.ProcessConfiguration);

  }

  private editCategory(id: string) {
    RouterToView(ViewName.CommunicatorCategories, id);
  }

  private get hasCalls(): boolean {
    return this.phoneCalls.length > 0
  }
  private get phoneCalls() {
    return this.communicator?.lastCalls || []
  }

  private get tickets() {
    return this.communicator?.lastTickets || [];
  }
  private selectTicket(item: TicketSummary) {
    RouterToTicket(item.id);
  }
  private getSubTitle(item: TicketSummary) {
    return displayDate(item.creationDate, true);
  }
  private communicationName(address: CommunicatorAddress) {
    return getCommunicationAddressName(address);
  }
  private get addresses() {
    return this.communicator?.addresses || [];
  }

  private setAvatarSelection(to: AvatarSelection) {
    this.communicator.avatarFileId = to.fileId;
    this.communicator.color = to.color;
  }
  private get isLoading(): boolean {
    return this.loaded == false;
  }
  private get name() {
    return this.communicator?.name || "";
  }
  private set name(to: string) {
    this.communicator.name = to;
  }
  private get color() {
    return this.communicator?.color;
  }
  private set color(to: ColorsEnum) {
    this.communicator.color = to;
  }
  private get avatarFileId() {
    return this.communicator?.avatarFileId;
  }
  private set avatarFileId(to: string) {
    this.communicator.avatarFileId = to;
  }
  private communicator: TickCommunicatorWorkingData = null;
  private validationResponse: FormValidationResponse[] = [];


  private get chosenCategories(): string[] {
    return this.communicator?.categoryDefinitionIds || [];
  }

  private set chosenCategories(to: string[]) {
    this.communicator.categoryDefinitionIds = to;
    this.save();
  }

  private get canEditCommunicator(): boolean {
    return this.loaded && useUserStore().allowedEdit(AuthorizationObjectType.Workspace)
  }

  // private get allCommunicatorCategoryDefinitions() {
  //   return useUtilityDataStore().utilityData.communicatorCategoryDefinitions || [];
  // }


  private get categoryWorkingDatas(): CommunicatorCategoryWorkingData[] {
    const wd = this.communicator?.workingDatas || [];

    return wd
      .filter(p => p != null)
      .sort(({ categoryWeight: a }, { categoryWeight: b }) => a - b);
    //.reverse();
  }

  private getCategoryName(wd: CommunicatorCategoryWorkingData) {
    return useUtilityDataStore().communicatorCategoryDefinition(wd.categoryDefinitionId)?.name;
  }

  private getValidationsForForm(wd: CommunicatorCategoryWorkingData) {
    return this.validationResponse.find(p => p.formId == wd.categoryDefinitionId);
  }

  @Watch("activeId")
  private async activate(id: string) {
    if (!id) { return; }
    this.loaded = false;
    useCommunicatorsStore().getCommunicator(id).then(c => {
      this.communicator = c;
      //if (c && c.workingDatas && c.workingDatas.length) {
      //this.editorViewStateValue = c.workingDatas[0].categoryDefinitionId;
      // }
      this.loaded = true;
    });
  }

  mounted() {
    this.activate(this.activeId);
  }

  private save() {
    useCommunicatorsStore().updateCommunicatorDetails(this.communicator.id).then((d) => {
      this.validationResponse = d;
      if (!d.some(p => !p.isValid)) {
        this.activate(this.communicator.id);
        this.$emit("saved");
      }
    });
  }


  private addTicket() {
    openTicketCreatorPanel(this.communicator.id, true, "+31624321373");
  }

}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.calls-list {
  border-radius: 4px;
  overflow: hidden;
}

.wrapper {
  display: grid;
  gap: 10px;
  padding: 12px;
  font-size: $text-size-regular;

}

.completed {
  font-size: 0.7em;
  opacity: 0.7;
  font-style: italic;
  display: flex;
  gap: 5px;
  align-items: center;
}

.creator-wrapper,
.completer-wrapper {
  display: inline-flex;
  justify-content: center;
  align-content: center;
  flex-wrap: wrap;
  gap: 5px;
}



.note {
  font-style: italic;
  padding: 10px;
}

.general-section {
  width: 100%;
  display: grid;
  gap: 10px;
  grid-template-rows: auto;
  grid-template-columns: auto 1fr auto;
  grid-template-areas: "info addresses tickets";



  .info {
    grid-area: info;
  }

  .addresses {
    display: flex;
    flex-direction: column;
    grid-area: addresses;
    align-items: center;

    .address {
      display: flex;
      align-items: center;
      gap: 4px;

      .address-name {
        font-size: 1em;
      }
    }
  }




  .tickets-list {
    border-left: solid 1px var(--c-base-200);
    grid-area: tickets;
    width: 400px;
    max-height: 200px;
    overflow-y: auto;
    // justify-content: end;
    //align-content: end;

    .list-item {
      margin-bottom: 5px;
      width: 100%;

      .history-description {
        display: flex;
        gap: 5px;
      }

      .divider {
        color: var(--c-base-200);
      }

      .call-to-action {
        @include neon-bg;
        @include font-inter;

        padding: 0 4px;
        font-weight: 700;
        font-size: 10px;
        line-height: 16px;
        text-transform: capitalize;
        white-space: nowrap;

        border-radius: 2px;
        transition: all 0.3s ease;
        color: $white;
        display: inline-block;
        max-width: 200px;
        min-width: 20px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;

      }
    }
  }
}
</style>
