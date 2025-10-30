<template>
  <TickEditorPanel :name="$translate(LanguagePath.App_ChannelEditor_Installation_Title)">
    <template #explainer>
      {{ $translate(LanguagePath.App_ChannelEditor_Chatwidget_Installation_Explanation) }}
    </template>
    <br> <br>
    {{ $translate(LanguagePath.App_ChannelEditor_Chatwidget_Installation_Step1_Explanation) }}
    <code class="text-selectable">{{ this.headCode }}</code>
    <TickButton @click="copyHeadCode" :appearance="Appearance.secondary" :color="Color.contrast" :size="Size.mini"> {{ $translate(LanguagePath.App_Copy) }}</TickButton>
    <br> <br>

    {{ $translate(LanguagePath.App_ChannelEditor_Chatwidget_Installation_Step2_Explanation) }}
    <code class="text-selectable">{{ this.installationScript }}</code>

    <div class="button-wrapper">
      <TickButton @click="copyBodyCode" :appearance="Appearance.secondary" :color="Color.contrast" :size="Size.mini"> {{ $translate(LanguagePath.App_Copy) }}</TickButton>
    </div>
  </TickEditorPanel>


  <TickEditorPanel :name="$translate(LanguagePath.App_ChannelEditor_Chatwidget_OpeningHours_Title)">
    <template #explainer>
      {{ $translate(LanguagePath.App_ChannelEditor_Chatwidget_OpeningHours_Explanation) }}
    </template>
    <template #actions>
      <TickSwitch v-model="useOpeningHours" :disabled="disabled">{{ $translate(LanguagePath.App_ChannelEditor_Chatwidget_OpeningHours_Use) }}</TickSwitch>
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


  <TickEditorPanel :name="$translate(LanguagePath.App_ChannelEditor_Customization_Title)">
    <template #explainer>
      <TickSwitch v-model="enablePreviewChatwidget">{{ $translate(LanguagePath.App_ChannelEditor_Chatwidget_Installation_PreviewButton_Title) }}</TickSwitch>
    </template>

    <div>
      <TickOptionBar class="tab-bar" v-model="editorViewStateValue" :buttons="tabButtons" :size="Size.regular" />

      <div class="editor-section" v-if="editorViewState == EditorViewState.General">
        <EditorMessage v-if="isFreeSubscription" :type="EditorMessageType.Message" title="Upgrade subscription" message="Please upgrade to a paid subscription to be able to set the title." />
        <TickInput :maxlength="40" v-model="generalTitle" :disabled="disableWidgetTitle">{{ $translate(LanguagePath.App_Name) }} </TickInput>
        <!-- <TickSelector :options="fontOptions" v-model="widgetFont">Font used in widget</TickSelector> -->

        <div class="flex-row">
          <TickInput type="range" :min="300" :max="1000" v-model="widgetMaxWidth" :hideInput="true">{{ $translate(LanguagePath.App_ChannelEditor_Chatwidget_MaxWidth) }}</TickInput>
          <TickInput type="range" :min="40" :max="100" v-model="widgetMaxHeight" :hideInput="true">{{ $translate(LanguagePath.App_ChannelEditor_Chatwidget_MaxHeight) }}</TickInput>
        </div>

        <FileDataUploaderZone :title="$translate(LanguagePath.App_ChannelEditor_Chatwidget_WidgetBackground_Uploader_Title)" @uploadsCompleted="widgetFileUploadCompleted" :disableUploaderView="false"
          :fileType="FileSourceType.ChannelFile" :disableMultiple="true" :accepts="acceptableImageFormats">
          <p> {{ $translate(LanguagePath.App_ChannelEditor_Chatwidget_WidgetBackground_Uploader_Explanation) }}</p>
          <img v-if="widgetBackgroundUrl" class="img-preview" :src="widgetBackgroundUrl">
        </FileDataUploaderZone>
        <TickButton v-if="hasWidgetBackgroundImage" @click="removeWidgetBackgroundImage" :appearance="Appearance.secondary" :size="Size.mini" :color="Color.contrast">{{
          $translate(LanguagePath.App_Remove) }}
        </TickButton>

        <div class="button-wrapper">
          <ChatWidgetStyledItemEditor :preview="false" :maxBorderRadiusFactor="0.05" v-model="generalStyling" :title="$translate(LanguagePath.App_ChannelEditor_Widget_StylingButton_Title)"
            :disabled="disabled">
          </ChatWidgetStyledItemEditor>
          <ChatWidgetStyledItemEditor :preview="false" :maxBorderRadiusFactor="0.05" v-model="headerStyling" :title="$translate(LanguagePath.App_ChannelEditor_WidgetHeader_StylingButton_Title)"
            :disabled="disabled">
          </ChatWidgetStyledItemEditor>
          <ChatWidgetStyledItemEditor :preview="false" :maxBorderRadiusFactor="0.05" v-model="conversationButtonsStyling"
            :title="$translate(LanguagePath.App_ChannelEditor_WidgetButtons_StylingButton_Title)" :disabled="disabled">
          </ChatWidgetStyledItemEditor>
        </div>
      </div>


      <div class="editor-section" v-if="editorViewState == EditorViewState.Opener">
        <TickInput :maxlength="12" v-model="openerTitle" :disabled="disabled">{{ $translate(LanguagePath.App_ChannelEditor_Opener_Title) }} </TickInput>
        <TickSelector :options="openerOptions" v-model="openerType">{{ $translate(LanguagePath.App_ChannelEditor_Opener_Type) }}</TickSelector>

        <ChatWidgetStyledItemEditor :preview="false" :maxBorderRadiusFactor="0.05" v-model="openerStyling" :title="$translate(LanguagePath.App_ChannelEditor_Opener_StylingButton_Title)"
          :disabled="disabled">
        </ChatWidgetStyledItemEditor>

        <FileDataUploaderZone :title="$translate(LanguagePath.App_ChannelEditor_Chatwidget_OpenerBackground_Uploader_Title)" @uploadsCompleted="openerFileUploadCompleted" :disableUploaderView="false"
          :fileType="FileSourceType.ChannelFile" :disableMultiple="true" :accepts="acceptableImageFormats">
          <p>{{ $translate(LanguagePath.App_ChannelEditor_Chatwidget_OpenerBackground_Uploader_Explanation) }}</p>

          <img v-if="openerBackgroundUrl" class="img-preview" :src="openerBackgroundUrl">
        </FileDataUploaderZone>

        <TickButton v-if="hasOpenerBackgroundImage" @click="removeOpenerBackgroundImage" :appearance="Appearance.secondary" :size="Size.mini" :color="Color.contrast" icon="delete">{{
          $translate(LanguagePath.App_Remove) }}</TickButton>
      </div>



      <div class="editor-section" v-if="editorViewState == EditorViewState.Lobby">

        <TickInput v-model="lobbyTitle" :disabled="disabled">{{ $translate(LanguagePath.App_ChannelEditor_Chatwidget_Lobby_Title) }}</TickInput>
        <TickEditor class="editor" :maxlength="200" :maxheight="200" v-model="lobbyMessage" @change="onLobbyMessageChange" :autoSize="true" :disabled="disabled" :tokenizable="false" />

        <div class="tb-lobby-actions">
          <EditorMessage v-if="!lobbyActions.length" :type="EditorMessageType.Message" title="Lobby actions (optional)"
            message="No lobby actions have been specified. With Lobby actions you can add buttons to directly start a flow from within the chat widget" />

          <template v-for="action in this.lobbyActions" :key="action.id">
            <ChatWidgetChannelLobbyActionEditor :preview="false" @delete="deleteLobbyAction(action)" @update="lobbyActionUpdate" :action="action" />
          </template>
        </div>

        <div class="button-wrapper">
          <TickButton @click="addLobbyAction" :appearance="Appearance.secondary" :color="Color.contrast" icon="plus">{{ $translate(LanguagePath.App_Add) }}</TickButton>
          <ChatWidgetStyledItemEditor :preview="false" :maxBorderRadiusFactor="0.05" v-model="lobbyActionssStyling" title="Action style" :disabled="disabled"></ChatWidgetStyledItemEditor>
        </div>
      </div>


      <div class="editor-section" v-if="editorViewState == EditorViewState.Messaging">
        <TickSwitch v-model="showAvatars">{{ $translate(LanguagePath.App_ChannelEditor_Chatwidget_Messaging_ShowAvatars) }}</TickSwitch>
        <TickSwitch v-model="positionAllMessagesLeft">{{ $translate(LanguagePath.App_ChannelEditor_Chatwidget_Messaging_ShowAllMessagesLeft) }}</TickSwitch>
        <TickSwitch v-model="allowUploadFiles">{{ $translate(LanguagePath.App_ChannelEditor_Chatwidget_Messaging_ShowFileUploader) }}</TickSwitch>

        <div class="button-wrapper preview-widget" :style="previewWidgetStyling">
          <ChatWidgetStyledItemEditor :maxBorderRadiusFactor="0.05" class="full-width" v-model="conversationInboundMessageStyling"
            :title="$translate(LanguagePath.App_ChannelEditor_Chatwidget_Messaging_StylingButton_Inbound)" :disabled="disabled">
          </ChatWidgetStyledItemEditor>
          <ChatWidgetStyledItemEditor :maxBorderRadiusFactor="0.05" class="full-width" v-model="conversationOutboundMessageStyling"
            :title="$translate(LanguagePath.App_ChannelEditor_Chatwidget_Messaging_StylingButton_Inbound)" :disabled="disabled">
          </ChatWidgetStyledItemEditor>

          <ChatWidgetStyledItemEditor :maxBorderRadiusFactor="0.05" class="full-width" v-model="conversationMessageActionsStyling"
            :title="$translate(LanguagePath.App_ChannelEditor_Chatwidget_Messaging_StylingButton_ConversationActions)" :disabled="disabled"></ChatWidgetStyledItemEditor>
          <ChatWidgetStyledItemEditor :maxBorderRadiusFactor="0.005" class="full-width" v-model="conversationMessageBoxStyling"
            :title="$translate(LanguagePath.App_ChannelEditor_Chatwidget_Messaging_StylingButton_MessageBox)" :disabled="disabled"></ChatWidgetStyledItemEditor>
        </div>
      </div>
    </div>
    <!-- <div>
    {{ this.previewSettings }}
  </div> -->

    <tick-chatwidget v-if="enablePreviewChatwidget" cwtoken="preview" :settings.prop="previewSettings" :previewmessages.prop="previewMessages" :chatwidgetid.prop="previewchatWidgetId"
      :viewstate="previewViewstate" />

  </TickEditorPanel>


</template>

<script lang="ts">
import TickButton, { Appearance, Color, Size } from "@/components/atoms/TickButton.vue";
import TickCheckbox from "@/components/atoms/TickCheckbox.vue";
import TickHeading from "@/components/atoms/TickHeading.vue";
import TickInput from "@/components/atoms/TickInput.vue";
import TickInputLabel from "@/components/atoms/TickInputLabel.vue";
import TickOptionBar, { OptionBarItem } from "@/components/atoms/TickOptionBar.vue";
import TickSelector, { Option } from "@/components/atoms/TickSelector.vue";
import TickSwitch from "@/components/atoms/TickSwitch.vue";
import TickTextArea from "@/components/atoms/TickTextarea.vue";
import { generateBorderRadius, getChatWidgetDummyPreviewMessages, getChatWidgetDummyWidgetId } from "@/helpers/chatWidgetPreviewMessagesHelper";
import { acceptableChatWidgetImageFormats, acceptableImageFormats } from "@/helpers/fileHelper";
import generateId from "@/helpers/guid";
import { jsonProxy } from "@/helpers/jsonProxy";
import { copyToClipboard } from "@/helpers/stringHelper";
import { translate } from "@/plugins/translatePlugin";
import useChannelsStore from "@/store/channels";
import useUserStore from "@/store/user";
import {
  ChatWidgetActionItemData,
  ChatWidgetActionItemType,
  ChatWidgetActionRequest,
  ChatWidgetChannelSettings,
  ChatWidgetStylingSettingsData,
  FileLink,
  FileSourceType,
  LanguagePath,
  OpenerTypeEnum,
  OpeningHoursItem,
  TickChannel,
} from "@/TickApi";
import { toRefs } from "vue";
import { Component, Prop, VModel, Vue } from "vue-facing-decorator";
import TickEditorPanel from "../editor/TickEditorPanel.vue";
import EditorMessage, { EditorMessageType } from "../EditorMessage.vue";
import FileDataUploaderZone from "../files/FileDataUploaderZone.vue";
import TickEditor from "../ticket/TickEditor.vue";
import ChannelOpeningHoursEditor from "./ChannelOpeningHoursEditor.vue";
import ChatWidgetChannelLobbyActionEditor from "./ChatWidgetChannelLobbyActionEditor.vue";
import ChatWidgetStylePanel from "./ChatWidgetComponents/ChatWidgetStylePanel.vue";
import ChatWidgetStyledItemEditor from "./ChatWidgetStyledItemEditor.vue";

export enum widgetViewState {
  opener = "opener",
  lobby = "lobby",
  messages = "messages"
}

enum EditorViewState {
  General,
  Opener,
  Lobby,
  Messaging,

}

@Component({
  emits: [],
  components: {
    TickInput, TickTextArea, TickButton, TickCheckbox,
    ChatWidgetStylePanel, TickHeading, ChatWidgetChannelLobbyActionEditor,
    FileDataUploaderZone, TickSelector,
    ChannelOpeningHoursEditor, TickSwitch, TickEditorPanel,
    EditorMessage,
    TickInputLabel,
    TickEditor,
    TickOptionBar,
    ChatWidgetStyledItemEditor
  },
})
export default class ChatWidgetChannelEditor extends Vue {
  Appearance = Appearance
  Color = Color
  Size = Size
  FileSourceType = FileSourceType
  EditorMessageType = EditorMessageType
  EditorViewState = EditorViewState
  LanguagePath = LanguagePath

  @VModel({ required: true }) private channel!: TickChannel;
  @Prop() private disabled!: boolean;

  private enablePreviewChatwidget = true;
  private settingsSuccess = false;
  private activePanel = "";
  private previewViewstate = widgetViewState.messages;
  private editorViewState: EditorViewState = EditorViewState.General; // default viewstate

  private get previewWidgetStyling() {
    const d = this.publicSettings.styling;
    const borderWidth = 1;//this.data.showBorder ? 1 : 0;
    const borderColor = this.publicSettings.styling.borderColor || "#efefef";
    const backgroundColor = d.showBackground ? d.backgroundColor : "";
    const backgroundImg = d.showBackground ? 'url(' + (this.publicSettings.backgroundImageFileUrl || "") + ")" : ""

    return {
      'background-color': backgroundColor,
      'background-image': backgroundImg,
      'background-repeat': 'no-repeat',
      'background-size': 'cover',
      'background-position': 'bottom',
      'color': d.foregroundColor,
      'border': `solid ${borderWidth}px ${borderColor}`,
      'border-radius': generateBorderRadius(d),
    }
  }


  private get editorViewStateValue() {
    return this.editorViewState;
  }
  private set editorViewStateValue(to: EditorViewState) {
    this.editorViewState = to;

    switch (to) {
      case EditorViewState.General: this.previewViewstate = widgetViewState.messages; break;
      case EditorViewState.Lobby: this.previewViewstate = widgetViewState.lobby; break;
      case EditorViewState.Messaging: this.previewViewstate = widgetViewState.messages; break;
      case EditorViewState.Opener: this.previewViewstate = widgetViewState.opener; break;
    }

  }

  private get tabButtons(): OptionBarItem[] {
    return [
      {
        id: EditorViewState.General,
        text: translate(LanguagePath.App_ChannelEditor_Chatwidget_Tabs_General),
      },
      {
        id: EditorViewState.Opener,
        text: translate(LanguagePath.App_ChannelEditor_Chatwidget_Tabs_Opener),
      },
      {
        id: EditorViewState.Lobby,
        text: translate(LanguagePath.App_ChannelEditor_Chatwidget_Tabs_Lobby),
      },
      {
        id: EditorViewState.Messaging,
        text: translate(LanguagePath.App_ChannelEditor_Chatwidget_Tabs_Messaging),
      },

    ]
  }

  private get isUnsaved() {
    const unsaved = useChannelsStore().unsavedItem(this.channel.id)
    return unsaved != null;
  }

  setup(props: object) {
    const channel = toRefs(props);
    return { channel };
  }

  private get headCode() {
    return "<script defer src='https://chatwidget.tick.cloud/js/chatwidget.min.js'/>";
  }

  private copyHeadCode() {
    copyToClipboard(this.headCode);
  }

  private copyBodyCode() {
    copyToClipboard(this.installationScript);
  }

  private get disableWidgetTitle() {
    return this.disabled || this.isFreeSubscription;
  }
  private get isFreeSubscription() {
    return useUserStore().allowUpsell;
  }


  // private get fontOptions() {
  //   return getChatwidgetFontOptions();
  // }

  private get acceptableImageFormats() {
    return acceptableChatWidgetImageFormats();
  }

  private get installationScript() {
    return `<tick-chatwidget cwtoken="${this.cwToken}" />`;
  }

  private get previewSettings() {
    return this.data.publicSettings;
  }

  private get previewMessages(): ChatWidgetActionRequest[] {
    return getChatWidgetDummyPreviewMessages();
  }

  private get previewchatWidgetId(): string {
    return getChatWidgetDummyWidgetId();
  }



  private get cwToken() {
    return this.channel.externalId || "";
  }


  // private get previewViewstateOptions() {
  //   const options: Option[] = [
  //     {
  //       text: 'opener',
  //       value: widgetViewState.opener,
  //     }, {
  //       text: 'lobby',
  //       value: widgetViewState.lobby,
  //     },
  //     {
  //       text: 'messages',
  //       value: widgetViewState.messages,
  //     },
  //   ]
  //   return options;
  // }

  private get data() {
    return jsonProxy<ChatWidgetChannelSettings>(
      this.channel.settingsJson || "{}",
      (json) => {
        this.channel.settingsJson = json;
      }
    );
  }

  private get publicSettings() {
    return this.data.publicSettings;
  }

  private get openerOptions() {
    const options: Option[] = [{
      text: translate(LanguagePath.App_ChannelEditor_Chatwidget_Opener_Layout_Square),
      value: OpenerTypeEnum.Square,
    },
    {
      text: translate(LanguagePath.App_ChannelEditor_Chatwidget_Opener_Layout_Landscape),
      value: OpenerTypeEnum.Landscape,
    }

    ]
    return options;
  }

  private get openerType() {
    const type = this.data?.publicSettings?.opener?.type;
    return type;
  }

  private set openerType(to: OpenerTypeEnum) {
    const publicSettings = { ...this.data.publicSettings };
    this.data.publicSettings.opener.type = to;
    this.data.publicSettings = publicSettings;
  }

  private get openerTitle() {
    return this.data?.publicSettings?.opener?.title;
  }

  private set openerTitle(to: string) {
    const publicSettings = { ...this.data.publicSettings };
    this.data.publicSettings.opener.title = to;
    this.data.publicSettings = publicSettings;
  }

  private get openingHours() {
    if (!this.data.publicSettings.openingHours) { this.data.publicSettings.openingHours = {}; }
    return this.data.publicSettings.openingHours || {};
  }

  private get useOpeningHours() {
    return this.data.publicSettings.openingHours.useOpeningHours;
  }
  private set useOpeningHours(to: boolean) {
    const publicSettings = { ...this.data.publicSettings };
    this.data.publicSettings.openingHours.useOpeningHours = to
    this.data.publicSettings = publicSettings;
  }

  private get openMonday() {
    return this.openingHours.monday;
  }
  private set openMonday(to: OpeningHoursItem) {
    const publicSettings = { ...this.data.publicSettings };
    this.data.publicSettings.openingHours.monday = to;
    this.data.publicSettings = publicSettings;
  }


  private get openTuesday() {
    return this.openingHours.tuesday;
  }
  private set openTuesday(to: OpeningHoursItem) {
    const publicSettings = { ...this.data.publicSettings };
    this.data.publicSettings.openingHours.tuesday = to;
    this.data.publicSettings = publicSettings;
  }

  private get openWednesday() {
    return this.openingHours.wednesday;
  }
  private set openWednesday(to: OpeningHoursItem) {
    const publicSettings = { ...this.data.publicSettings };
    this.data.publicSettings.openingHours.wednesday = to;
    this.data.publicSettings = publicSettings;
  }

  private get openThursday() {
    return this.openingHours.thursday;
  }
  private set openThursday(to: OpeningHoursItem) {
    const publicSettings = { ...this.data.publicSettings };
    this.data.publicSettings.openingHours.thursday = to;
    this.data.publicSettings = publicSettings;
  }

  private get openFriday() {
    return this.openingHours.friday;
  }
  private set openFriday(to: OpeningHoursItem) {
    const publicSettings = { ...this.data.publicSettings };
    this.data.publicSettings.openingHours.friday = to;
    this.data.publicSettings = publicSettings;
  }

  private get openSaturday() {
    return this.openingHours.saturday;
  }
  private set openSaturday(to: OpeningHoursItem) {
    const publicSettings = { ...this.data.publicSettings };
    this.data.publicSettings.openingHours.saturday = to;
    this.data.publicSettings = publicSettings;
  }

  private get openSunday() {
    return this.openingHours.sunday;
  }
  private set openSunday(to: OpeningHoursItem) {
    const publicSettings = { ...this.data.publicSettings };
    this.data.publicSettings.openingHours.sunday = to;
    this.data.publicSettings = publicSettings;
  }

  private get openerStyling() {
    return this.data.publicSettings.opener.styling;
  }
  private set openerStyling(to: ChatWidgetStylingSettingsData) {

    const publicSettings = { ...this.data.publicSettings };
    publicSettings.opener.styling = to;
    this.data.publicSettings = publicSettings;
  }

  private get generalTitle() {
    return this.data.publicSettings.title;
  }
  private set generalTitle(to: string) {
    const publicSettings = { ...this.data.publicSettings };
    publicSettings.title = to;

    this.data.publicSettings = publicSettings;
    this.previewViewstate = widgetViewState.lobby;
  }


  private get allowUploadFiles() {
    return this.publicSettings?.allowFileUploads;
  }
  private set allowUploadFiles(to: boolean) {
    const publicSettings = { ...this.data.publicSettings };
    publicSettings.allowFileUploads = to;

    this.data.publicSettings = publicSettings;
    this.previewViewstate = widgetViewState.messages;
  }


  private get showAvatars() {
    return this.publicSettings?.conversation?.showAvatars;
  }
  private set showAvatars(to: boolean) {

    const publicSettings = { ...this.data.publicSettings };
    publicSettings.conversation.showAvatars = to;

    this.data.publicSettings = publicSettings;
    this.previewViewstate = widgetViewState.messages;
  }

  private get positionAllMessagesLeft() {
    return this.publicSettings?.conversation?.positionAllMessagesLeft;
  }
  private set positionAllMessagesLeft(to: boolean) {

    const publicSettings = { ...this.data.publicSettings };
    publicSettings.conversation.positionAllMessagesLeft = to;

    this.data.publicSettings = publicSettings;
    this.previewViewstate = widgetViewState.messages;
  }

  private get widgetMaxHeight() {
    return this.data.publicSettings.maxHeightPercentage;
  }
  private set widgetMaxHeight(to: number | string) {
    if (typeof (to) == 'string') { to = parseInt(to); }

    const publicSettings = { ...this.data.publicSettings };
    publicSettings.maxHeightPercentage = to;

    this.data.publicSettings = publicSettings;
    this.previewViewstate = widgetViewState.messages;
  }

  private get widgetMaxWidth() {
    return this.data.publicSettings.maxWidth;
  }
  private set widgetMaxWidth(to: number | string) {
    if (typeof (to) == 'string') { to = parseInt(to); }

    const publicSettings = { ...this.data.publicSettings };
    publicSettings.maxWidth = to;

    this.data.publicSettings = publicSettings;
    this.previewViewstate = widgetViewState.messages;
  }

  // private get widgetFont() {
  //   return this.data.publicSettings.fontFamily;
  // }
  // private set widgetFont(to: string) {
  //   const publicSettings = { ...this.data.publicSettings };
  //   publicSettings.fontFamily = to;

  //   this.data.publicSettings = publicSettings;
  // }

  private get openerBackgroundStyle() {
    const url = this.openerBackgroundUrl;
    if (!url) { return null; }

    return {
      "background-image": `url(${url})`
    }
  }
  private get widgetBackgroundUrl() {
    const publicSettings = { ...this.data.publicSettings };
    return publicSettings.backgroundImageFileUrl
  }
  private get openerBackgroundUrl() {
    const publicSettings = { ...this.data.publicSettings };
    return publicSettings.opener?.backgroundImageFileUrl
  }

  private openerFileUploadCompleted(to: FileLink[]) {
    if (!to || !to.length) { return; }

    const publicSettings = { ...this.data.publicSettings };
    publicSettings.opener.backgroundImageFileUrl = to[0].url;

    this.data.publicSettings = publicSettings;
    this.previewViewstate = widgetViewState.opener;
  }

  private removeOpenerBackgroundImage() {
    const publicSettings = { ...this.data.publicSettings };
    publicSettings.opener.backgroundImageFileUrl = null;
    this.previewViewstate = widgetViewState.opener;
    this.data.publicSettings = publicSettings;
  }

  private get hasOpenerBackgroundImage() {
    const publicSettings = { ...this.data.publicSettings };
    return publicSettings.opener.backgroundImageFileUrl != null;
  }



  private widgetFileUploadCompleted(to: FileLink[]) {
    if (!to || !to.length) { return; }

    const publicSettings = { ...this.data.publicSettings };
    publicSettings.backgroundImageFileUrl = to[0].url;

    this.data.publicSettings = publicSettings;

  }

  private removeWidgetBackgroundImage() {
    const publicSettings = { ...this.data.publicSettings };
    publicSettings.backgroundImageFileUrl = null;

    this.data.publicSettings = publicSettings;
  }

  private get hasWidgetBackgroundImage() {
    const publicSettings = { ...this.data.publicSettings };
    return publicSettings.backgroundImageFileUrl != null;
  }




  private get lobbyTitle() {
    return this.data.publicSettings.lobby.title;
  }
  private set lobbyTitle(to: string) {
    const publicSettings = { ...this.data.publicSettings };
    publicSettings.lobby.title = to;

    this.data.publicSettings = publicSettings;
    this.previewViewstate = widgetViewState.lobby;
  }

  private get lobbyActions() {
    return this.data.publicSettings.lobby.actions || [];
  }

  private addLobbyAction() {
    const publicSettings = { ...this.data.publicSettings };

    const nrOfActions = publicSettings.lobby.actions ? publicSettings.lobby.actions.length : 0;

    publicSettings.lobby.actions.push({
      actionType: ChatWidgetActionItemType.StartFlow,
      data: null,
      id: generateId(),
      text: `Action ${(nrOfActions + 1)}`,
    })

    this.data.publicSettings = publicSettings;
    this.previewViewstate = widgetViewState.lobby;
  }

  private deleteLobbyAction(action: ChatWidgetActionItemData) {
    const publicSettings = { ...this.data.publicSettings };
    publicSettings.lobby.actions = publicSettings.lobby.actions.filter(p => p.id != action.id);

    this.data.publicSettings = publicSettings;
    this.previewViewstate = widgetViewState.lobby;
  }

  private lobbyActionUpdate(to: ChatWidgetActionItemData) {
    const publicSettings = { ...this.data.publicSettings };

    const action = publicSettings.lobby.actions.find(p => p.id == to.id);
    if (action == null) { return; }
    action.actionType = to.actionType;
    action.data = to.data;
    action.text = to.text;

    this.data.publicSettings = publicSettings;
    this.previewViewstate = widgetViewState.lobby;
  }

  private get lobbyMessage() {
    return this.data.publicSettings.lobby.message;
  }
  private set lobbyMessage(to: string) {
    const publicSettings = { ...this.data.publicSettings };
    publicSettings.lobby.message = to;

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const showdown = require('showdown');
    const converter = new showdown.Converter();
    converter.setOption('simpleLineBreaks', true);
    const markdownContent = to;
    const htmlContent = converter.makeHtml(markdownContent);

    publicSettings.lobby.messageHtml = htmlContent;


    this.data.publicSettings = publicSettings;
    this.previewViewstate = widgetViewState.lobby;
  }


  private onLobbyMessageChange(md: string, html: string) {
    const publicSettings = { ...this.data.publicSettings };
    publicSettings.lobby.message = md;

    publicSettings.lobby.messageHtml = html;
    this.data.publicSettings = publicSettings;
    this.previewViewstate = widgetViewState.lobby;
  }




  private get generalStyling() {
    return this.data.publicSettings.styling;
  }
  private set generalStyling(to: ChatWidgetStylingSettingsData) {
    const publicSettings = { ...this.data.publicSettings };
    publicSettings.styling = to;
    this.data.publicSettings = publicSettings;
  }

  private get headerStyling() {
    return this.data.publicSettings.header;
  }
  private set headerStyling(to: ChatWidgetStylingSettingsData) {
    const publicSettings = { ...this.data.publicSettings };
    publicSettings.header = to;
    this.data.publicSettings = publicSettings;
  }


  private get conversationMessageActionsStyling() {
    return this.data.publicSettings.conversation.messageActions;
  }
  private set conversationMessageActionsStyling(to: ChatWidgetStylingSettingsData) {
    const publicSettings = { ...this.data.publicSettings };
    publicSettings.conversation.messageActions = to;
    this.data.publicSettings = publicSettings;
  }

  private get conversationInboundMessageStyling() {
    return this.data.publicSettings.conversation.inboundMessageStyle;
  }
  private set conversationInboundMessageStyling(to: ChatWidgetStylingSettingsData) {
    const publicSettings = { ...this.data.publicSettings };
    publicSettings.conversation.inboundMessageStyle = to;
    this.data.publicSettings = publicSettings;
  }

  private get conversationOutboundMessageStyling() {
    return this.data.publicSettings.conversation.outboundMessageStyle;
  }
  private set conversationOutboundMessageStyling(to: ChatWidgetStylingSettingsData) {
    const publicSettings = { ...this.data.publicSettings };
    publicSettings.conversation.outboundMessageStyle = to;
    this.data.publicSettings = publicSettings;
  }

  private get conversationMessageBoxStyling() {
    return this.data.publicSettings.conversation.messageBoxStyle;
  }
  private set conversationMessageBoxStyling(to: ChatWidgetStylingSettingsData) {
    const publicSettings = { ...this.data.publicSettings };
    publicSettings.conversation.messageBoxStyle = to;
    this.data.publicSettings = publicSettings;
  }


  private get conversationButtonsStyling() {
    return this.data.publicSettings.conversation.buttonsStyle;
  }
  private set conversationButtonsStyling(to: ChatWidgetStylingSettingsData) {
    const publicSettings = { ...this.data.publicSettings };
    publicSettings.conversation.buttonsStyle = to;
    this.data.publicSettings = publicSettings;
  }


  private get lobbyActionssStyling() {
    return this.data.publicSettings.lobby.actionsStyling;
  }
  private set lobbyActionssStyling(to: ChatWidgetStylingSettingsData) {
    const publicSettings = { ...this.data.publicSettings };
    publicSettings.lobby.actionsStyling = to;
    this.data.publicSettings = publicSettings;
  }


  mounted() {
    this.checkSettings();
  }

  private checkSettings() {
    this.settingsSuccess = true;
  }


}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

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

.opening-hours-wrapper {
  font-size: $text-size-regular;
  display: grid;
  gap: 10px;
  padding: 20px;

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
  gap: 5px;
}

.button-wrapper {
  margin-top: 10px;
  margin-bottom: 10px;
  display: flex;
  grid-auto-flow: row;
  gap: 30px;
}


code {
  font-family: monospace;
  font-size: inherit;
}

.img-preview {
  display: inline-block;
  max-width: 300px;
  max-height: 200px;
  border: solid 1px #ffffff;
  border-radius: 4px;
  // background-repeat: no-repeat;
  // background-size: cover;
}

.preview-widget {
  padding: 30px;
  display: inline-block;
  width: 350px;

  .full-width {
    width: 100%;
  }
}
</style>
