<template>
  <TickEditorPanel :name="$translate(LanguagePath.App_EmailEditor_Title)">
    <div class="channel-editor">
      <TickInput :disabled="disabled" v-model="address" placeholder="Email address">{{ $translate(LanguagePath.App_EmailEditor_EmailAddress) }}</TickInput>
      <TickInput :disabled="disabled" v-model="apiKey" placeholder="Sendgrid API token">{{ $translate(LanguagePath.App_EmailEditor_SendgridToken) }}</TickInput>
      <BusyIndicator :loading="verificationBusy" />

      <template v-if="verificationBusy">{{ $translate(LanguagePath.App_EmailEditor_BusyChecking) }}</template>
      <template v-else>
        <template v-if="settingsSuccess">
          <div>{{ this.validationMessage }}</div>
        </template>
        <template v-else>
          <div>
            <TickIcon name="warning" /> {{ this.validationMessage }}
          </div>
        </template>
      </template>

      <TickTextArea :disabled="disabled" v-model="template">{{ $translate(LanguagePath.App_EmailEditor_Template) }}</TickTextArea>
    </div>
  </TickEditorPanel>
</template>

<script lang="ts">
import ThenHr from "@/components/atoms/ThenHr.vue";
import TickButton from "@/components/atoms/TickButton.vue";
import TickCheckbox from "@/components/atoms/TickCheckbox.vue";
import TickInput from "@/components/atoms/TickInput.vue";
import TickTextArea from "@/components/atoms/TickTextarea.vue";
import { jsonProxy } from "@/helpers/jsonProxy";
import useChannelsStore from "@/store/channels";
import { EmailChannelSettings, LanguagePath, TickChannel } from "@/TickApi";
import { toRefs } from "vue";
import { Component, Prop, Vue } from "vue-facing-decorator";
import TickEditorPanel from "../editor/TickEditorPanel.vue";

@Component({
  emits: [],
  components: { TickInput, TickTextArea, TickButton, TickCheckbox, ThenHr, TickEditorPanel },
})
export default class EmailChannelEditor extends Vue {
  LanguagePath = LanguagePath
  @Prop() private channel!: TickChannel;
  @Prop() private disabled!: boolean;

  private settingsSuccess = false;
  private validationMessage = "";
  private verificationBusy = false;
  private tokenTimer: number;

  setup(props: object) {
    const channel = toRefs(props);
    return { channel };
  }

  private get data() {
    return jsonProxy<EmailChannelSettings>(
      this.channel.settingsJson || "{}",
      (json) => {
        this.channel.settingsJson = json;
      }
    );
  }

  private get template() {
    return this.data.emailTemplate || "";
  }
  private set template(to: string) {
    this.data.emailTemplate = to;
  }

  private get address() {
    return this.data.emailAddress || "";
  }

  private set address(to: string) {
    this.data.emailAddress = to;
    this.onSettingChanged();
  }

  private onSettingChanged() {
    this.settingsSuccess = false;
    this.verificationBusy = false;
    this.validationMessage = "";

    if (this.tokenTimer) {
      clearTimeout(this.tokenTimer);
    }
    this.tokenTimer = window.setTimeout(this.checkSettings, 400);
  }

  private get apiKey() {
    return this.data.apiKey || "";
  }

  private set apiKey(to: string) {
    this.data.apiKey = to;
    this.onSettingChanged();
  }

  mounted() {
    this.checkSettings();
  }

  private checkSettings() {
    if (!this.data.apiKey) {
      this.settingsSuccess = false;
      return;
    }

    this.verificationBusy = true;
    useChannelsStore()
      .validateEmailSettings(this.channel.id, this.data)
      .then((result) => {
        if (this.verificationBusy != true) {
          return;
        } // do nothing if not waiting for this result
        this.validationMessage = result.message;
        this.settingsSuccess = result.success;
        this.verificationBusy = false;
      });
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";
</style>
