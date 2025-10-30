<template>
  <TickSettingsPanel class="user-panel" @close="close">
    <template #title>{{ this.name }}</template>
    <template #actions>

      <!-- <TickColorSelector :allowAsSubDialog="true" v-model="editableColor" /> -->

      <TickButton @click="editCommunicator" v-if="this.canEditCommunicators" :size="Size.mini" :appearance="Appearance.secondary" :color="Color.contrast">
        {{ $translate(LanguagePath.App_View) }}
      </TickButton>
    </template>
    <div class="content">
      <!-- <TickAvatar :color="editableColor" :sizePx="100" :online="online" :fileId="fileId" :name="name" /> -->

      <AvatarSelector @select="setAvatarSelection" :fileId="editableAvatarFileId" :name="name" :color="editableColor" :sizePx="100" :type="null" />
      <TickInput class="input" v-model.lazy="editableName" :maxlength="20" :placeholder="$translate(LanguagePath.App_Name)" v-focus:true />

      <div class="addresses">
        <CommunicatorAddressLabel :communicatorId="communicator.id" :address="address" :sizePx="20" v-for="address in addresses" :key="address.id" />

        <!-- <div class="address" v-for="address in addresses" :key="address.id">
          <TickAvatar class="address-avatar" :sizePx="20" :online="online" :fileId="address.avatarFileId" :name="name" /> <span class="address-name">{{
            this.communicationName(address)
          }}</span>
        </div> -->
      </div>

      <EditorMessage v-if="communicatorMarkedAsSpammer" :type="EditorMessageType.Warning" title="Marked as spammer" message="Messages from this communicator are blocked. " />


      <div class="actions">
        <TickButton @click="toggleMarkAsSpammer" :appearance="Appearance.secondary" :color="Color.contrast" :size="Size.mini"
          :title="$translate(LanguagePath.App_CommunicatorPanel_MarkAsSpammer_Tooltip)">
          {{
            this.markAsSpammerText }}</TickButton>

        <TickButton @click="startMergePanel" :appearance="Appearance.secondary" :color="Color.contrast" :size="Size.mini" :title="$translate(LanguagePath.App_CommunicatorPanel_Merge_Tooltip)">
          {{ $translate(LanguagePath.App_CommunicatorPanel_Merge_Title) }}</TickButton>


      </div>

    </div>
  </TickSettingsPanel>
</template>

<script lang="ts">
import TickInput from "@/components/atoms/TickInput.vue";
import EditorMessage, { EditorMessageType } from '@/components/molecules/EditorMessage.vue';
import TickSettingsPanel from "@/components/panels/TickSettingsPanel.vue";
import TickIcon from "@/components/TickIcon.vue";
import { focus } from "@/directives";
import { getCommunicationAddressName } from "@/helpers/communicationsHelper";
import keyboard from "@/helpers/keyboard";
import { mount, unmount } from "@/helpers/mountHelper";
import { translate } from '@/plugins/translatePlugin';
import { RouterToView, ViewName } from "@/router";
import { markCommunicatorAsSpammer, updateCommunicator } from "@/services/CommunicatorsService";
import { ColorsEnum, CommunicatorAddress, FileSourceType, LanguagePath, TickCommunicator, TickTicketCommunicator, UserTypeEnum } from "@/TickApi";
import { Component, Prop, Vue } from "vue-facing-decorator";
import CommunicatorAddressLabel from "../atoms/CommunicatorAddressLabel.vue";
import TickAvatar from "../atoms/TickAvatar.vue";
import TickButton, { Appearance, Color, Size } from "../atoms/TickButton.vue";
import { TickPanelOptions } from "../atoms/TickPanel.vue";
import TickSwitch from "../atoms/TickSwitch.vue";
import FileDataUploaderZone from "../molecules/files/FileDataUploaderZone.vue";
import AvatarSelector from "../molecules/Selectors/AvatarSelector.vue";
import TickColorSelector from "../molecules/Selectors/TickColorSelector.vue";
import { AvatarSelection } from "./AvatarSelectorPanel.vue";
import { openMergeCommunicatorPanel } from "./CommunicatorMergePanel.vue";


const onboardingPanelId = "CommunicatorPanel";

export function removeCommunicatorPanelPanel() {
  unmount(onboardingPanelId);
}

export function openCommunicatorPanel(communicator: TickCommunicator | TickTicketCommunicator, address?: CommunicatorAddress, fromDomRect?: DOMRect) {
  const panelOptions: TickPanelOptions = {
    title: "CommunicatorPanel",
    from: fromDomRect
  }

  mount(CommunicatorPanel, {
    props: {
      panelOptions: panelOptions,
      communicator: communicator,
      currentAddressId: address?.id,
      addresses: communicator.addresses
    },
    events: {
      close: () => {
        removeCommunicatorPanelPanel();
      },
    },
  }, onboardingPanelId);
}

@Component({
  directives: { focus },
  emits: ["close"],
  components: {
    TickSettingsPanel,
    TickInput,
    TickIcon,
    TickSwitch,
    TickButton,
    TickAvatar,
    FileDataUploaderZone,
    EditorMessage,
    TickColorSelector,
    AvatarSelector,
    CommunicatorAddressLabel
  },
})
export default class CommunicatorPanel extends Vue {
  Appearance = Appearance;
  Size = Size
  Color = Color
  FileSourceType = FileSourceType;
  EditorMessageType = EditorMessageType
  LanguagePath = LanguagePath

  @Prop() private communicator!: TickTicketCommunicator;
  @Prop() private addresses?: CommunicatorAddress[];
  @Prop() private currentAddressId?: string;

  private editableName?: string = "";
  private editableColor?: ColorsEnum = null
  private editableAvatarFileId?: string = null
  private keyboardIds: number[] = [];

  private setAvatarSelection(to: AvatarSelection) {
    this.editableAvatarFileId = to.fileId;
    this.editableColor = to.color;
  }

  private get userType() {
    return UserTypeEnum.User;
  }
  private editCommunicator() {
    this.close();

    RouterToView(ViewName.Communicators, this.communicator.id);
  }

  private canEditCommunicators() {
    return true;
  }


  private close(ignoreChanges?: boolean) {
    if (!ignoreChanges) {
      this.updateCommunicator();
    }

    this.$emit("close");
  }

  private updateCommunicator() {
    if (!this.communicator) { return; }

    // no change => do nothing
    if (this.editableName.length > 0
      && this.communicator.name == this.editableName
      && this.communicator.color == this.editableColor
      && this.communicator.avatarFileId == this.editableAvatarFileId
    ) {
      return;
    }

    // store in store();
    this.communicator.name = this.editableName;
    this.communicator.color = this.editableColor;
    this.communicator.avatarFileId = this.editableAvatarFileId;

    updateCommunicator({
      id: this.communicator.id,
      name: this.editableName,
      addresses: this.addresses,
      color: this.communicator.color,
      avatarFileId: this.communicator.avatarFileId,
      markedAsSpammer: this.communicator.markedAsSpammer,

    })
  }


  private get communicatorMarkedAsSpammer() {
    return this.communicator.markedAsSpammer || false;
  }


  // private get communicatorColor() {
  //   return this.communicator.color;
  // }
  // private set communicatorColor(to: ColorsEnum) {
  //   this.communicator.color = to;
  // }
  private get markAsSpammerText() {
    return this.communicator.markedAsSpammer
      ? translate(LanguagePath.App_CommunicatorPanel_UnMarkAsSpammer_Title)
      : translate(LanguagePath.App_CommunicatorPanel_MarkAsSpammer_Title)
  }

  private toggleMarkAsSpammer() {
    const newValue = !this.communicator.markedAsSpammer;

    markCommunicatorAsSpammer({
      communicatorId: this.communicator.id,
      isSpammer: newValue,
    });

    this.communicator.markedAsSpammer = newValue;
  }

  private get fileId(): string {
    if (this.communicator.avatarFileId) { return this.communicator.avatarFileId; }

    let address = this.addresses ? this.currentAddressId
      ? this.addresses.find(p => p.id == this.currentAddressId)
      : this.addresses[0]
      : null;

    return address
      ? address.avatarFileId
      : this.communicator.avatarFileId;
  }

  private get name() {
    return this.communicator?.name || "-";
  }

  private communicationName(address: CommunicatorAddress) {
    return getCommunicationAddressName(address);
  }

  private startMergePanel() {
    const c: TickCommunicator = this.communicator;
    openMergeCommunicatorPanel(c)
    this.close();
  }


  private get online(): boolean {
    return false;
  }

  mounted() {
    this.editableName = this.communicator.name;
    this.editableColor = this.communicator.color;

    this.keyboardIds.push(keyboard.on("Enter", () => {
      this.close()
    }, { ignoreInputFieldEvents: false }));

    this.keyboardIds.push(keyboard.on("Escape", () => {
      this.close(true)
    }, { ignoreInputFieldEvents: false }));

  }

  beforeUnmount() {
    keyboard.off(this.keyboardIds);
  }


}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.user-panel {
  min-width: 300px;

  .content {
    display: flex;
    flex-direction: column;
    gap: 8px;

    .addresses {
      align-items: center;

      .address {
        display: flex;
        align-items: center;
        gap: 4px;

        .address-name {
          font-size: 0.7em;
        }
      }
    }

    .actions {
      display: flex;
      gap: 10px;
    }

    .profile-picture {
      .overlay {
        position: relative;
        bottom: -18px;
        background-color: rgba(255, 255, 255, 0.5019607843);
        color: black;
        width: 60px;
        height: 25px;
        text-align: center;
      }
    }

  }
}
</style>
