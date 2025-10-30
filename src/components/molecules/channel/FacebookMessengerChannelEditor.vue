<template>
  <TickEditorPanel :name="$translate(LanguagePath.App_FacebookMessengerEditor_Title)">
    <div class="channel-editor">
      <TickInput :disabled="disabled" v-model="pageId" placeholder="Facebook page ID">{{ $translate(LanguagePath.App_FacebookMessengerEditor_PageId) }} </TickInput>
      <TickInput :disabled="disabled" v-model="pageToken" placeholder="Facebook page token">{{ $translate(LanguagePath.App_FacebookMessengerEditor_PageAccessToken) }}</TickInput>

      <BusyIndicator :loading="verificationBusy" />
      <template v-if="verificationBusy">{{ $translate(LanguagePath.App_FacebookMessengerEditor_BusyChecking) }}</template>
      <template v-else>
        <template v-if="verificationSuccess">
          <!-- <div>{{ this.validationMessage }} Chat via: <a :href="telegramDeeplink" target="_blank">{{ this.telegramDeeplink }}</a> </div> -->
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
import { FacebookMessengerChannelSettings, LanguagePath, TickChannel } from "@/TickApi";
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
export default class FacebookMessengerChannelEditor extends Vue {
  LanguagePath = LanguagePath
  @Prop() private channel!: TickChannel;
  @Prop() private disabled!: boolean;

  // private telegramDeeplink = "";
  private verificationSuccess = false;
  private validationMessage = "";
  private verificationBusy = false;
  private tokenTimer: number;

  setup(props: object) {
    const channel = toRefs(props);
    return { channel };
  }

  mounted() {
    this.checkToken();
  }

  private get data() {
    return jsonProxy<FacebookMessengerChannelSettings>(
      this.channel.settingsJson || "{}",
      (json) => {
        this.channel.settingsJson = json;
      }
    );
  }

  private get pageId() {
    return this.data.pageId || "";
  }

  private set pageId(to: string) {
    this.data.pageId = to;
  }

  private get pageToken() {
    return this.data.pageToken || "";
  }

  private set pageToken(to: string) {
    if (to == "") {
      to = null;
    }
    this.data.pageToken = to;

    // this.telegramDeeplink = "";
    this.verificationSuccess = false;
    this.verificationBusy = false;
    this.validationMessage = "";

    if (this.tokenTimer) {
      clearTimeout(this.tokenTimer);
    }
    this.tokenTimer = window.setTimeout(this.checkToken, 400);
  }

  private checkToken() {
    if (!this.data.pageToken) {
      this.verificationSuccess = false;
      return;
    }
    this.verificationBusy = true;

    this.verificationBusy = false;
    this.verificationSuccess = true;

    // useChannelsStore().validateTelegramToken(this.channel.id, this.data.token).then(result => {
    //   if (this.verificationBusy != true) { return; } // do nothing if not waiting for this result
    //   this.validationMessage = result.message
    //   //this.telegramDeeplink = result.deeplink;
    //   this.verificationSuccess = result.success;
    //   this.verificationBusy = false;

    // });
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

// .explainer {
//   font-size: 14px;
//   margin-top: 20px;
//   color: $grey400;
// }

// ol {
//   list-style-type: square;
//   margin-left: 20px;

// }</style>
