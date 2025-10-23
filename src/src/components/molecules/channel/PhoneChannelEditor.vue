<template>
  <div>
    <TickEditorPanel :name="$translate(LanguagePath.App_PhoneEditor_Title) + ' ' + phoneNumber">

      <div class="channel-editor" v-if="tenantIsHolder">

        <TickInput :disabled="disabled" v-model="accountSId" placeholder="Account SID"> {{ $translate(LanguagePath.App_PhoneEditor_AccountSId) }}</TickInput>
        <TickInput :disabled="disabled" v-model="token" placeholder="Auth token"> {{ $translate(LanguagePath.App_PhoneEditor_Token) }}</TickInput>
        <BusyIndicator :loading="verificationBusy" />
        <template v-if="verificationBusy"> {{ $translate(LanguagePath.App_PhoneEditor_BusyChecking) }}</template>
        <template v-else>
          <template v-if="validationSuccess">
            <div>
              {{ validationMessage }}

              <div class="list">
                <TickListItem icon="phone" :name="item.phoneNumber" @select="selectPhoneNumber(item)" v-for="(item, index) in this.availablePhoneNumbers" :key="index">
                  <TickActiveIndicator v-if="nrIsSelected(item)" :status="ActiveStatusEnum.active" :text="$translate(LanguagePath.App_Selected)" />
                </TickListItem>
              </div>

            </div>
          </template>
          <template v-else>
            <div>
              <TickIcon name="warning" v-if="validationMessage" />
              {{ validationMessage }}
            </div>
          </template>
        </template>

      </div>
      <div v-else class="channel-editor text-selectable">
        <div class="phone-info">
          <a class="" :href="'tel:' + phoneNumber">{{ phoneNumber }}</a>
          <TickButton @click="copyPhoneNumber" :appearance="Appearance.secondary" :color="Color.contrast" :size="Size.mini"> {{ $translate(LanguagePath.App_Copy) }}</TickButton>
        </div>
      </div>




      <div class="editor-section">
        <TickSwitch :disabled="disabled" v-model="recordPhoneCall">{{ $translate(LanguagePath.App_PhoneEditor_RecordPhoneCall_Title) }}</TickSwitch>
        <TickSelector :disabled="disabled" v-model="gender" :options="genderOptions">{{ $translate(LanguagePath.App_PhoneEditor_VoiceGender_Title) }}</TickSelector>
        <TickSelector :disabled="disabled" v-model="voiceLang" :options="voiceLanguageOptions">{{ $translate(LanguagePath.App_PhoneEditor_VoiceLanguage_Title) }}</TickSelector>
      </div>


    </TickEditorPanel>


    <TickEditorPanel :name="$translate(LanguagePath.App_PhoneEditor_OpeningHours_Title)">
      <template #explainer>

      </template>
      <template #actions>
        <TickSwitch v-model="useOpeningHours" :disabled="disabled">{{ $translate(LanguagePath.App_PhoneEditor_OpeningHours_Use) }}</TickSwitch>
      </template>

      <div class="opening-hours-wrapper">

        <ChannelOpeningHoursEditor v-model="openMonday" :name="$translate(LanguagePath.Monday)" :disabled="disabled || !this.useOpeningHours" />
        <ChannelOpeningHoursEditor v-model="openTuesday" :name="$translate(LanguagePath.Tuesday)" :disabled="disabled || !this.useOpeningHours" />
        <ChannelOpeningHoursEditor v-model="openWednesday" :name="$translate(LanguagePath.Wednesday)" :disabled="disabled || !this.useOpeningHours" />
        <ChannelOpeningHoursEditor v-model="openThursday" :name="$translate(LanguagePath.Thursday)" :disabled="disabled || !this.useOpeningHours" />
        <ChannelOpeningHoursEditor v-model="openFriday" :name="$translate(LanguagePath.Friday)" :disabled="disabled || !this.useOpeningHours" />
        <ChannelOpeningHoursEditor v-model="openSaturday" :name="$translate(LanguagePath.Saturday)" :disabled="disabled || !this.useOpeningHours" />
        <ChannelOpeningHoursEditor v-model="openSunday" :name="$translate(LanguagePath.Sunday)" :disabled="disabled || !this.useOpeningHours" />
      </div>
    </TickEditorPanel>


    <TickEditorPanel :name="$translate(LanguagePath.App_PhoneEditor_Lobby_Title)">
      <TickEditor class="editor" :maxlength="200" :maxheight="200" v-model="lobbyMessage" @change="onLobbyMessageChange" :autoSize="true" :disabled="disabled" :tokenizable="false" />

      <TickInput v-model="lobbymessageafteraction">{{ $translate(LanguagePath.App_PhoneEditor_MessageAfterAction_Title) }}</TickInput>

      <div class="tb-lobby-actions">
        <EditorMessage v-if="!lobbyActions.length" :type="EditorMessageType.Message" title="Lobby actions (optional)"
          message="No lobby actions have been specified. With Lobby actions you can trigger a flow" />

        <template v-for="(action, index) in lobbyActions" :key="action.id">
          <PhoneChannelLobbyActionEditor :keyPadNum="index + 1" :preview="false" @delete="deleteLobbyAction(action)" @update="lobbyActionUpdate" :action="action" />
        </template>
      </div>
      <div class="button-wrapper">
        <TickButton @click="addLobbyAction" :appearance="Appearance.secondary" :color="Color.contrast" icon="plus">{{ $translate(LanguagePath.App_Add) }}</TickButton>
      </div>
    </TickEditorPanel>



    <TickEditorPanel :name="$translate(LanguagePath.App_PhoneEditor_Lobby_OutsideOpeningHours_Title)" v-if="this.useOpeningHours">
      <TickEditor class="editor" :maxlength="200" :maxheight="200" v-model="outsideOpeningHoursLobbyMessage" @change="onOutsideOpeningHoursLobbyMessageChange" :autoSize="true" :disabled="disabled"
        :tokenizable="false" />
      <TickInput v-model="outsideOpeningHoursLobbymessageafteraction">{{ $translate(LanguagePath.App_PhoneEditor_MessageAfterAction_Title) }}</TickInput>
      <div class="tb-lobby-actions">
        <EditorMessage v-if="!outsideOpeningHoursLobbyActions.length" :type="EditorMessageType.Message" title="Lobby actions (optional)"
          message="No lobby actions have been specified. With Lobby actions you can trigger a flow" />

        <template v-for="(action, index) in outsideOpeningHoursLobbyActions" :key="action.id">
          <PhoneChannelLobbyActionEditor :keyPadNum="index + 1" :preview="false" @delete="deleteOutsideOpeningHoursLobbyAction(action)" @update="outsideOpeningHoursLobbyActionUpdate"
            :action="action" />
        </template>
      </div>
      <div class="button-wrapper">
        <TickButton @click="addOutsideOpeningHoursLobbyAction" :appearance="Appearance.secondary" :color="Color.contrast" icon="plus">{{ $translate(LanguagePath.App_Add) }}</TickButton>
      </div>
    </TickEditorPanel>
  </div>
</template>

<script lang="ts">
import BusyIndicator from "@/components/atoms/BusyIndicator.vue";
import ThenHr from "@/components/atoms/ThenHr.vue";
import TickActiveIndicator, { ActiveStatusEnum } from "@/components/atoms/TickActiveIndicator.vue";
import TickButton, { Appearance, Color, Size } from "@/components/atoms/TickButton.vue";
import TickCheckbox from "@/components/atoms/TickCheckbox.vue";
import TickInput from "@/components/atoms/TickInput.vue";
import TickListItem from "@/components/atoms/TickListItem.vue";
import TickSelector from "@/components/atoms/TickSelector.vue";
import TickSwitch from "@/components/atoms/TickSwitch.vue";
import TickTextArea from "@/components/atoms/TickTextarea.vue";
import TickIcon from "@/components/TickIcon.vue";
import { getGenderOptions, getVoiceLangOptions } from "@/helpers/enumsHelper";
import generateId from "@/helpers/guid";
import { jsonProxy } from "@/helpers/jsonProxy";
import { copyToClipboard } from "@/helpers/stringHelper";
import useChannelsStore from "@/store/channels";
import {
  GenderEnum,
  LanguagePath,
  OpeningHoursItem,
  PhoneActionItemData,
  PhoneActionItemType,
  PhoneChannelAccountHolderType,
  PhoneChannelSettings,
  PhoneNumberData,
  TickChannel,
  VoiceLanguageEnum,
} from "@/TickApi";
import { toRefs } from "vue";
import { Component, Prop, Vue } from "vue-facing-decorator";
import TickEditorPanel from "../editor/TickEditorPanel.vue";
import EditorMessage, { EditorMessageType } from "../EditorMessage.vue";
import TickEditor from "../ticket/TickEditor.vue";
import ChannelOpeningHoursEditor from "./ChannelOpeningHoursEditor.vue";
import PhoneChannelLobbyActionEditor from "./PhoneChannelLobbyActionEditor.vue";

@Component({
  emits: [],
  components: {
    TickInput,
    TickTextArea,
    TickButton,
    TickCheckbox,
    ThenHr,
    BusyIndicator,
    TickIcon,
    TickEditorPanel,
    TickListItem, TickActiveIndicator,
    EditorMessage,
    PhoneChannelLobbyActionEditor,
    TickEditor,
    TickSwitch,
    TickSelector,
    ChannelOpeningHoursEditor
  },
})
export default class PhoneChannelEditor extends Vue {
  LanguagePath = LanguagePath
  ActiveStatusEnum = ActiveStatusEnum
  Appearance = Appearance
  Color = Color
  Size = Size
  EditorMessageType = EditorMessageType;

  @Prop() private channel!: TickChannel;
  @Prop() private disabled!: boolean;

  private validationSuccess = false;
  private validationMessage = "";
  private verificationBusy = false;
  private tokenTimer: number;

  private availablePhoneNumbers: PhoneNumberData[] = [];


  setup(props: object) {
    const channel = toRefs(props);
    return { channel };
  }

  mounted() {
    this.checkToken();
  }

  private get data() {
    return jsonProxy<PhoneChannelSettings>(
      this.channel.settingsJson || "{}",
      (json) => {
        this.channel.settingsJson = json;
      }
    );
  }

  private get recordPhoneCall() {
    return this.data.recordPhoneCall
  }
  private set recordPhoneCall(to: boolean) {
    this.data.recordPhoneCall = to;
  }

  private get lobbyMessage() {
    return this.data.lobby.message;
  }
  private set lobbyMessage(to: string) {
    this.data.lobby.message = to;
  }

  private get lobbymessageafteraction() {
    return this.data.lobby.messageAfterChoice;
  }
  private set lobbymessageafteraction(to: string) {
    const lobby = { ...this.data.lobby };
    lobby.messageAfterChoice = to;
    this.data.lobby = lobby;
  }

  private get lobbyActions() {
    return this.data.lobby.actions || [];
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private onLobbyMessageChange(md: string, html: string) {
    const lobby = { ...this.data.lobby };
    lobby.message = md;
    this.data.lobby = lobby;
  }



  private addLobbyAction() {

    const lobby = { ...this.data.lobby };
    const nrOfActions = lobby.actions ? lobby.actions.length : 0;

    lobby.actions.push({
      actionType: PhoneActionItemType.StartFlow,
      data: null,
      id: generateId(),
      text: `option ${(nrOfActions + 1)}`,
    });

    this.data.lobby = lobby;
  }

  private deleteLobbyAction(action: PhoneActionItemData) {
    const lobby = { ...this.data.lobby };
    lobby.actions = lobby.actions.filter(p => p.id != action.id);
    lobby.actions = lobby.actions.slice(0);
    this.data.lobby = lobby;
  }

  private lobbyActionUpdate(to: PhoneActionItemData) {
    const lobby = { ...this.data.lobby };
    const action = lobby.actions.find(p => p.id == to.id);
    if (action == null) { return; }

    action.actionType = to.actionType;
    action.data = to.data;
    action.text = to.text;

    this.data.lobby = lobby;

  }

  private get tenantIsHolder() {
    return this.data.accountHolder == PhoneChannelAccountHolderType.Tenant;
  }


  private selectPhoneNumber(item: PhoneNumberData) {
    this.data.phoneNumber = item;
  }

  private nrIsSelected(item: PhoneNumberData): boolean {
    return this.data.phoneNumber.sId == item.sId;
  }

  private get phoneNumber() {
    return this.data?.phoneNumber?.phoneNumber;
  }

  private copyPhoneNumber() {
    copyToClipboard(this.phoneNumber);
  }

  private onCredentialsChange() {
    this.validationSuccess = false;
    this.verificationBusy = false;
    this.validationMessage = "";

    if (this.tokenTimer) {
      clearTimeout(this.tokenTimer);
    }
    this.tokenTimer = window.setTimeout(this.checkToken, 400);
  }

  private get accountSId() {
    return this.data.accountSId || "";
  }
  private set accountSId(to: string) {
    this.data.accountSId = to;
    this.onCredentialsChange();
  }
  private get token() {
    return this.data.token || "";
  }

  private set token(to: string) {
    if (to == "") { to = null; }
    this.data.token = to;

    this.onCredentialsChange();
  }

  private checkToken() {
    if (!this.data.token || !this.data.accountSId) {
      this.validationSuccess = false;
      return;
    }



    this.verificationBusy = true;
    useChannelsStore()
      .validateTwilioPhoneToken(this.channel.id, this.data.accountSId, this.data.token)
      .then((result) => {
        if (this.verificationBusy != true) {
          return;

        }

        // do nothing if not waiting for this result
        this.validationMessage = result.message;
        this.validationSuccess = result.success;
        this.verificationBusy = false;

        this.availablePhoneNumbers = result.availablePhoneNumbers || [];
        if (this.availablePhoneNumbers.length == 1) {
          this.selectPhoneNumber(this.availablePhoneNumbers[0]);
        }
      });
  }


  private get genderOptions() {
    return getGenderOptions();
  }

  private get gender() {
    return this.data?.voiceGender;
  }
  private set gender(to: GenderEnum) {
    this.data.voiceGender = to;
  }

  private get voiceLang() {
    return this.data?.voiceLanguage;
  }
  private set voiceLang(to: VoiceLanguageEnum) {
    this.data.voiceLanguage = to;
  }


  private get voiceLanguageOptions() {
    return getVoiceLangOptions();
  }



  private get openingHours() {
    if (!this.data.openingHours) { this.data.openingHours = {}; }
    return this.data.openingHours || {};
  }

  private get useOpeningHours() {
    return this.data.openingHours?.useOpeningHours;
  }
  private set useOpeningHours(to: boolean) {
    const openingHours = { ...this.data.openingHours };
    openingHours.useOpeningHours = to
    this.data.openingHours = openingHours;
  }

  private get openMonday() {
    return this.openingHours.monday;
  }
  private set openMonday(to: OpeningHoursItem) {
    const openingHours = { ...this.data.openingHours };
    openingHours.monday = to;
    this.data.openingHours = openingHours;
  }


  private get openTuesday() {
    return this.openingHours.tuesday;
  }
  private set openTuesday(to: OpeningHoursItem) {
    const openingHours = { ...this.data.openingHours };
    openingHours.tuesday = to;
    this.data.openingHours = openingHours;
  }

  private get openWednesday() {
    return this.openingHours.wednesday;
  }
  private set openWednesday(to: OpeningHoursItem) {
    const openingHours = { ...this.data.openingHours };
    openingHours.wednesday = to;
    this.data.openingHours = openingHours;
  }

  private get openThursday() {
    return this.openingHours.thursday;
  }
  private set openThursday(to: OpeningHoursItem) {
    const openingHours = { ...this.data.openingHours };
    openingHours.thursday = to;
    this.data.openingHours = openingHours;
  }

  private get openFriday() {
    return this.openingHours.friday;
  }
  private set openFriday(to: OpeningHoursItem) {
    const openingHours = { ...this.data.openingHours };
    openingHours.friday = to;
    this.data.openingHours = openingHours;
  }

  private get openSaturday() {
    return this.openingHours.saturday;
  }
  private set openSaturday(to: OpeningHoursItem) {
    const openingHours = { ...this.data.openingHours };
    openingHours.saturday = to;
    this.data.openingHours = openingHours;
  }

  private get openSunday() {
    return this.openingHours.sunday;
  }
  private set openSunday(to: OpeningHoursItem) {
    const openingHours = { ...this.data.openingHours };
    openingHours.sunday = to;
    this.data.openingHours = openingHours;
  }



  private get outsideOpeningHoursLobbyMessage() {
    return this.data.lobby_OutsideOpeningHours.message;
  }
  private set outsideOpeningHoursLobbyMessage(to: string) {
    this.data.lobby_OutsideOpeningHours.message = to;
  }
  private get outsideOpeningHoursLobbymessageafteraction() {
    return this.data.lobby_OutsideOpeningHours.messageAfterChoice;
  }
  private set outsideOpeningHoursLobbymessageafteraction(to: string) {
    const lobby = { ...this.data.lobby_OutsideOpeningHours };
    lobby.messageAfterChoice = to;
    this.data.lobby_OutsideOpeningHours = lobby;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private onOutsideOpeningHoursLobbyMessageChange(md: string, html: string) {
    const lobby = { ...this.data.lobby_OutsideOpeningHours };
    lobby.message = md;
    this.data.lobby_OutsideOpeningHours = lobby;
  }


  private get outsideOpeningHoursLobbyActions() {
    return this.data.lobby_OutsideOpeningHours.actions || [];
  }
  private addOutsideOpeningHoursLobbyAction() {

    const lobby = { ...this.data.lobby_OutsideOpeningHours };
    const nrOfActions = lobby.actions ? lobby.actions.length : 0;

    lobby.actions.push({
      actionType: PhoneActionItemType.StartFlow,
      data: null,
      id: generateId(),
      text: `option ${(nrOfActions + 1)}`,
    });

    this.data.lobby_OutsideOpeningHours = lobby;
  }

  private deleteOutsideOpeningHoursLobbyAction(action: PhoneActionItemData) {
    const lobby = { ...this.data.lobby_OutsideOpeningHours };
    lobby.actions = lobby.actions.filter(p => p.id != action.id);
    lobby.actions = lobby.actions.slice(0);
    this.data.lobby_OutsideOpeningHours = lobby;
  }

  private outsideOpeningHoursLobbyActionUpdate(to: PhoneActionItemData) {
    const lobby = { ...this.data.lobby_OutsideOpeningHours };
    const action = lobby.actions.find(p => p.id == to.id);
    if (action == null) { return; }

    action.actionType = to.actionType;
    action.data = to.data;
    action.text = to.text;

    this.data.lobby_OutsideOpeningHours = lobby;

  }


}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.opening-hours-wrapper {
  font-size: $text-size-regular;
  display: grid;
  gap: 10px;
  padding: 20px;

}

.list {
  margin-top: 30px;
  background-color: var(--c-base-100);
  border-radius: 8px;
  overflow: hidden;
}


.editor {
  padding: 4px 4px 0 4px;
  border-radius: 4px;
  font-size: $text-size-regular;

  min-height: 150px;
  display: block;
  width: 100%;
  padding: 8px;

  background-color: var(--c-base-300);
  color: var(--c-contrast);
}

.tab-bar {
  background-color: var(--c-base-200);
  border-radius: 4px 4px 0 0;
}

.editor-section {
  display: grid;
  gap: 10px;
  padding: 20px;
  border-radius: 0 0 4px 4px;
}

.flex-row {
  display: flex;
  gap: 10px;
  align-items: center;
  font-size: $text-size-regular;
}

.tb-lobby-actions {
  margin-top: 10px;
  margin-bottom: 20px;
  display: grid;
  gap: 30px;
  width: 100%;
}

.button-wrapper {
  margin-top: 10px;
  margin-bottom: 10px;
  display: flex;
  grid-auto-flow: row;
  gap: 30px;
}

.phone-info {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  justify-items: center;

  a {
    font-size: $text-size-regular;
    align-content: center;
  }
}
</style>
