<template>

  <TickScreen :title="name" :loading="!loaded || !this.channel">
    <template v-slot:actions>

      <TickButton icon="eye" @click="openChatWidget" v-if="isChatWidget && !this.isUnsaved" :appearance="Appearance.secondary" :color="Color.contrast" :size="Size.regular">
        {{ $translate(LanguagePath.App_ChannelEditor_Preview) }}</TickButton>

      <TickButton v-if="allowEdit && this.allowSettings" @click="remove" icon="delete" :appearance="Appearance.secondary" :color="Color.contrast" />
      <TickButton v-if="allowEdit" @click="save" :disabled="!readyForSave">{{ $translate(LanguagePath.App_Save) }}</TickButton>
    </template>

    <template v-slot:default>
      <TickEditorPanel :name="$translate(LanguagePath.App_Editor_General)">
        <TickInput :disabled="disabled" v-model="name" maxlength="20" :placeholder="$translate(LanguagePath.App_Name)">{{ $translate(LanguagePath.App_Name) }}</TickInput>
        <TickSwitch :disabled="disabled || !this.allowSettings" v-model="enableInboundMessages">{{ $translate(LanguagePath.App_ChannelEditor_Inbound_Title) }}</TickSwitch>
        <TickSwitch :disabled="disabled || !this.allowSettings" v-model="enableOutboundMessages">{{ $translate(LanguagePath.App_ChannelEditor_Outbound_Title) }}</TickSwitch>


        <EditorMessage v-if="isUnsaved" :type="EditorMessageType.Message" title="Save first" message="You can test this channel once it is saved." />


      </TickEditorPanel>

      <TickEditorPanel v-if="!allowSettings" :name="$translate(LanguagePath.App_ChannelEditor_Generic_Title)">
        <a target="new" :href="'mailto:' + this.channel.externalId">{{ this.channel.externalId }}</a><br><br>
        {{ $translate(LanguagePath.App_ChannelEditor_Generic_Explanation) }}

      </TickEditorPanel>

      <TickEditorPanel :name="$translate(LanguagePath.App_ChannelEditor_Assignments_Title)">
        <template v-slot:explainer>
          {{ $translate(LanguagePath.App_ChannelEditor_Assignments_Explanation) }}
        </template>

        <TickSwitch :disabled="disabled" v-model="useRouting">{{ $translate(LanguagePath.App_ChannelEditor_Assignments_Use_Title) }}</TickSwitch>

        <template v-if="useRouting">
          <UsersAndTeamsSelector :disabled="disabled" title="Assign to Ticket" v-model="adderAssignments" :overlapAfter="10" />
        </template>
        <template v-else>
          <TickIcon name="warning" />{{ $translate(LanguagePath.App_ChannelEditor_Assignments_Use_Warning) }}
        </template>

      </TickEditorPanel>


      <template v-if="allowSettings">
        <TelegramChannelEditor :disabled="disabled" v-if="channelCommunicationType == CommunicationType.Telegram" :channel="channel" />
        <EmailChannelEditor :disabled="disabled" v-if="channelCommunicationType == CommunicationType.Email" :channel="channel" />
        <ChatWidgetChannelEditor :disabled="disabled" v-if="channelCommunicationType == CommunicationType.ChatWidget" v-model="channel" />
        <FacebookMessengerChannelEditor :disabled="disabled" v-if="channelCommunicationType == CommunicationType.FacebookMessenger" :channel="channel" />
        <PhoneChannelEditor :disabled="disabled" v-if="channelCommunicationType == CommunicationType.Phone" :channel="channel" />
      </template>


      <TickEditorPanel v-if="allowAddresses" :name="$translate(LanguagePath.App_ChannelEditor_Routing_Title)">
        <template v-slot:explainer>
          {{ $translate(LanguagePath.App_ChannelEditor_Routing_Explanation) }}
          <TickButton v-if="allowEdit" @click="addNewAddress" class="outline">{{ $translate(LanguagePath.App_Add) }}</TickButton>
        </template>

        <TickEditorPanel v-for="address in this.channel.addresses" :key="address.id">
          <template v-slot:explainer>
            <TickButton v-if="allowEdit" @click="removeAddress(address)" class="address-remove-button  delete small">{{ $translate(LanguagePath.App_Remove) }}</TickButton>
          </template>

          <TickInput :disabled="disabled" v-model="address.address">{{ $translate(LanguagePath.App_ChannelEditor_Routing_Address) }}</TickInput>
          <div class="addressWarningMessage">
            <TickIcon name="warning" v-if="addressWarningMessage(address)" /> {{ addressWarningMessage(address) }}
          </div>

          <TickCheckbox :disabled="disabled" v-model="address.useForRouting">{{ $translate(LanguagePath.App_ChannelEditor_Routing_Assignments_Title) }}</TickCheckbox>
          <template v-if="address.useForRouting">
            <TickSelector :disabled="disabled" v-model="address.routingToType" :options="allRoutingOptions">{{ $translate(LanguagePath.App_ChannelEditor_Routing_Assignments_To)
            }}
            </TickSelector>
            <TickSelector :disabled="disabled" v-model="address.routingToObjectId" :options="addressRoutingObjectOptions(address)"></TickSelector>
          </template>
        </TickEditorPanel>

      </TickEditorPanel>


    </template>
  </TickScreen>
</template>


<script lang="ts">

import ThenHr from "@/components/atoms/ThenHr.vue";
import TickButton, { Appearance, Color, Size } from "@/components/atoms/TickButton.vue";
import TickCheckbox from "@/components/atoms/TickCheckbox.vue";
import TickDropdown from '@/components/atoms/TickDropdown.vue';
import TickInput from "@/components/atoms/TickInput.vue";
import TickSelector from '@/components/atoms/TickSelector.vue';
import TickSwitch from '@/components/atoms/TickSwitch.vue';
import TickTextArea from "@/components/atoms/TickTextarea.vue";
import TickIcon from '@/components/TickIcon.vue';
import { getChannelRoutingTypeEnumOptions } from '@/helpers/enumsHelper';
import generateId from '@/helpers/guid';
import { jsonProxy } from '@/helpers/jsonProxy';
import { onConfirmation } from '@/helpers/questionHelper';
import { ChatWidgetURL, popupCenter } from '@/services/urls';
import useChannelsStore from '@/store/channels';
import useUserStore from '@/store/user';
import useUtilityDataStore from '@/store/utilitydata';
import { AuthorizationObjectType, ChannelRoutingTypeEnum, CommunicationType, EmailChannelSettings, GeneralChannelSettings, LanguagePath, PhoneChannelAccountHolderType, PhoneChannelSettings, TickChannel, TickChannelAddress, } from '@/TickApi';
import { Component, Prop, Vue, Watch } from 'vue-facing-decorator';
import TickEditorPanel from '../editor/TickEditorPanel.vue';
import TickScreen from '../editor/TickScreen.vue';
import EditorMessage, { EditorMessageType } from "../EditorMessage.vue";
import UsersAndTeamsSelector, { UsersAndTeamsSelection } from '../Selectors/UsersAndTeamsSelector.vue';
import ChatWidgetChannelEditor from './ChatWidgetChannelEditor.vue';
import EmailChannelEditor from './EmailChannelEditor.vue';
import FacebookMessengerChannelEditor from './FacebookMessengerChannelEditor.vue';
import PhoneChannelEditor from "./PhoneChannelEditor.vue";
import TelegramChannelEditor from './TelegramChannelEditor.vue';

@Component({
  emits: ["deleted", "saved"],
  components: {
    TickInput, TickTextArea, TickButton, TickCheckbox, ThenHr, TickScreen, TickEditorPanel, TickDropdown, TickSelector, TickIcon, TickSwitch,
    TelegramChannelEditor, EmailChannelEditor, ChatWidgetChannelEditor, FacebookMessengerChannelEditor, UsersAndTeamsSelector, PhoneChannelEditor, EditorMessage
  },
})
export default class ChannelEditor extends Vue {
  Appearance = Appearance
  Color = Color
  Size = Size
  LanguagePath = LanguagePath;
  CommunicationType = CommunicationType;  //.Email .Telegram
  EditorMessageType = EditorMessageType;
  @Prop() private activeId!: string;
  private channel: TickChannel = null;
  private loaded = false;

  private get channelCommunicationType() {
    return this.channel?.communicationType;
  }
  private get isChatWidget() {
    return this.channel?.communicationType == CommunicationType.ChatWidget;
  }
  private openChatWidget() {
    const url = `${ChatWidgetURL()}?cwtoken=${this.channel.externalId}&forceRefresh=true`;
    popupCenter(url, "Preview", 600, 800);
  }

  private get isUnsaved() {
    const unsaved = useChannelsStore().unsavedItem(this.channel?.id)
    return unsaved != null;
  }

  private get generalSettings(): GeneralChannelSettings {
    return this.channel ? this.channel.generalSettings : {
      routingTeamIds: [],
      routingUserIds: [],
      useForRouting: false
    };
  }

  private get adderAssignments(): UsersAndTeamsSelection {
    return {
      userIds: this.generalSettings.routingUserIds || [],
      teamIds: this.generalSettings.routingTeamIds || [],
    };
  }

  private set adderAssignments(to: UsersAndTeamsSelection) {

    this.generalSettings.routingUserIds = to.userIds || [];
    this.generalSettings.routingTeamIds = to.teamIds || [];
  }


  @Watch("activeId")
  private async activate(id: string) {
    this.loaded = false;
    useChannelsStore().get(id).then(channel => {
      this.channel = channel;
      this.loaded = true;
    })
  }
  mounted() {
    this.activate(this.activeId);
  }
  beforeUnmount() {
    this.activate(null);

    useChannelsStore().eraseUnsaved(this.activeId);
  }

  private remove() {
    onConfirmation(() => {
      useChannelsStore().delete(this.channel.id).then(() => {
        this.$emit("deleted");
      });
    });


  }

  private set useRouting(to: boolean) {
    this.generalSettings.useForRouting = to;
  }

  private get useRouting() {
    return (this.generalSettings && this.generalSettings.useForRouting) || false;
  }

  private get editorIcon() {
    return "channel";
  }
  private get editorName() {
    return "Channel";
  }



  private get allowSettings() {
    return !this.channel?.lockedSettings
  }

  private get readyForSave() {
    if (this.channel?.lockedSettings) { return true; }

    if (this.channel?.communicationType == CommunicationType.Telegram) {
      //const telegramSettings = JSON.parse(this.channel.settingsJson) as TelegramChannelSettings;
      const validations = useChannelsStore().validateTelegramTokenResponses;
      const validation = validations.find(p => p.channelId == this.channel?.id)
      if (validation && validation.success) {
        return true;
      } else {
        return false;
      }
    }

    if (this.channel?.communicationType == CommunicationType.Phone) {
      const phoneSettings = JSON.parse(this.channel?.settingsJson) as PhoneChannelSettings;
      if (phoneSettings.accountHolder == PhoneChannelAccountHolderType.Tenant) {
        const validations = useChannelsStore().validateTwilioPhoneTokenResponses;
        const validation = validations.find(p => p.channelId == this.channel?.id)
        if (validation && validation.success) {
          return true;
        } else {
          return false;
        }
      }
    }

    if (this.channel?.communicationType == CommunicationType.Email) {
      // const emailSettings = JSON.parse(this.channel.settingsJson) as EmailChannelSettings;
      const validations = useChannelsStore().validateEmailSettingsResponses;
      const validation = validations.find(p => p.channelId == this.channel?.id)
      if (validation && validation.success) {
        return true;
      } else {
        return false;
      }
    }
    return true;
  }

  private get name() {
    return this.channel?.name;
  }
  private set name(to: string) {
    this.channel.name = to;
  }

  private get enableInboundMessages() {
    return this.channel?.enableInboundMessages;
  }
  private set enableInboundMessages(to: boolean) {
    this.channel.enableInboundMessages = to;
  }

  private get enableOutboundMessages() {
    return this.channel?.enableOutboundMessages;
  }
  private set enableOutboundMessages(to: boolean) {
    this.channel.enableOutboundMessages = to;
  }

  private save() {
    useChannelsStore().save(this.channel.id).then(() => {
      this.$emit("saved");
    });

  }

  private get allRoutingOptions() {
    return getChannelRoutingTypeEnumOptions();
  }

  private get allowAddresses() {
    return this.channel?.communicationType == CommunicationType.Email && !this.channel?.lockedSettings
  }

  private addNewAddress() {
    this.channel.addresses.push({
      id: generateId(),
      communicationType: this.channel.communicationType,
      creationDate: new Date(),
      routingToObjectId: null,
      useForRouting: true,
      communicationChannelId: this.channel.id,
      address: this.channel.externalId,
      routingToType: ChannelRoutingTypeEnum.Team
    });
  }

  private removeAddress(address: TickChannelAddress) {
    const index = this.channel.addresses.findIndex(a => a.id == address.id);
    if (index != -1) {
      this.channel.addresses.splice(index, 1);
    }
  }

  private get emailSettingsData() {
    return jsonProxy<EmailChannelSettings>(this.channel?.settingsJson || "{}", (json) => {
      this.channel.settingsJson = json;
    });
  }

  private getEmailAddressWarningMessage(input: TickChannelAddress) {
    if (!this.readyForSave) { return "Please first specify correct channel configuration." }

    let channelAddress = this.emailSettingsData.emailAddress;
    let channelAddressArr = channelAddress.split("@");
    const channelDomain = channelAddressArr[1];

    let address = input.address;
    let addressArr = address.split("@");
    const addressDomain = addressArr[1];

    if (addressDomain != channelDomain) {
      return `The address should be on the same domain and thus ends with: @${channelDomain}.`
    }

    return "";
  }


  private addressWarningMessage(address: TickChannelAddress) {
    switch (this.channel?.communicationType) {
      case CommunicationType.Email:
        return this.getEmailAddressWarningMessage(address);
      default:
        return "This communication type does not support addresses.";
    }
  }

  private addressRoutingObjectOptions(address: TickChannelAddress) {
    return this.routingObjectOptions(address.routingToType);
  }

  // private get channelRoutingObjectOptions() {
  //   return this.routingObjectOptions(this.channel.routingToType);
  // }


  private routingObjectOptions(routingType: ChannelRoutingTypeEnum) {
    switch (routingType) {
      case ChannelRoutingTypeEnum.Team: return this.teamOptions;
      case ChannelRoutingTypeEnum.User: return this.userOptions;
    }
  }

  private get teamOptions() {

    const all = useUtilityDataStore().utilityData.teams;
    let options = all.map((item) => ({
      text: item.name,
      value: item.id,
    }))
    return options;
  }

  private get userOptions() {
    const all = useUtilityDataStore().utilityData.users;
    let options = all.map((item) => ({
      text: item.name,
      value: item.id,
    }))
    return options;
  }

  private get disabled() {
    return !this.allowEdit
  }

  private get allowEdit() {
    return this.channel && useUserStore().allowedEdit(AuthorizationObjectType.TechnicalConfiguration);
  }


}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";


// .channel-editor {
//   overflow-y: auto;
// }


.address-remove-button {
  position: relative;
  left: 92%;
}
</style>
