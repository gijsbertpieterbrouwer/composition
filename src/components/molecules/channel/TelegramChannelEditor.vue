<template>
  <TickEditorPanel :name="$translate(LanguagePath.App_TelegramEditor_Title)">
    <div class="channel-editor">
      <TickInput :disabled="disabled" v-model="token" placeholder="Authentication token"> {{ }}</TickInput>
      <BusyIndicator :loading="telegramVerificationBusy" />
      <template v-if="telegramVerificationBusy"> {{ $translate(LanguagePath.App_TelegramEditor_BusyChecking) }}</template>
      <template v-else>
        <template v-if="telegramSuccess">
          <div>
            {{ this.validationMessage }} {{ $translate(LanguagePath.App_TelegramEditor_PreviewLink) }}
            <a :href="telegramDeeplink" target="_blank">{{
              this.telegramDeeplink
            }}</a>
          </div>
        </template>
        <template v-else>
          <div>
            <TickIcon name="warning" v-if="validationMessage" />
            {{ this.validationMessage }}
          </div>
        </template>
      </template>

    </div>
  </TickEditorPanel>
</template>

<script lang="ts">
import BusyIndicator from "@/components/atoms/BusyIndicator.vue";
import ThenHr from "@/components/atoms/ThenHr.vue";
import TickButton from "@/components/atoms/TickButton.vue";
import TickCheckbox from "@/components/atoms/TickCheckbox.vue";
import TickInput from "@/components/atoms/TickInput.vue";
import TickTextArea from "@/components/atoms/TickTextarea.vue";
import TickIcon from "@/components/TickIcon.vue";
import { jsonProxy } from "@/helpers/jsonProxy";
import useChannelsStore from "@/store/channels";
import {
  LanguagePath,
  TelegramChannelSettings,
  TickChannel,
} from "@/TickApi";
import { toRefs } from "vue";
import { Component, Prop, Vue } from "vue-facing-decorator";
import TickEditorPanel from "../editor/TickEditorPanel.vue";

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
    TickEditorPanel
  },
})
export default class TelegramChannelEditor extends Vue {
  LanguagePath = LanguagePath
  @Prop() private channel!: TickChannel;
  @Prop() private disabled!: boolean;

  private telegramDeeplink = "";
  private telegramSuccess = false;
  private validationMessage = "";
  private telegramVerificationBusy = false;
  private tokenTimer: number;

  setup(props: object) {
    const channel = toRefs(props);
    return { channel };
  }

  mounted() {
    this.checkToken();
  }

  private get data() {
    return jsonProxy<TelegramChannelSettings>(
      this.channel.settingsJson || "{}",
      (json) => {
        this.channel.settingsJson = json;
      }
    );
  }

  private get token() {
    return this.data.token || "";
  }

  private set token(to: string) {
    if (to == "") {
      to = null;
    }
    this.data.token = to;

    this.telegramDeeplink = "";
    this.telegramSuccess = false;
    this.telegramVerificationBusy = false;
    this.validationMessage = "";

    if (this.tokenTimer) {
      clearTimeout(this.tokenTimer);
    }
    this.tokenTimer = window.setTimeout(this.checkToken, 400);
  }

  private checkToken() {
    if (!this.data.token) {
      this.telegramSuccess = false;
      return;
    }
    this.telegramVerificationBusy = true;
    useChannelsStore()
      .validateTelegramToken(this.channel.id, this.data.token)
      .then((result) => {
        if (this.telegramVerificationBusy != true) {
          return;
        } // do nothing if not waiting for this result
        this.validationMessage = result.message;
        this.telegramDeeplink = result.deeplink;
        this.telegramSuccess = result.success;
        this.telegramVerificationBusy = false;
      });
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";
</style>
