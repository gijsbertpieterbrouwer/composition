<template>
  <span class="indicator" :title="authorizationHelpText">{{ this.authorizedCaption }}</span>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-facing-decorator";
import UserPanel from "../panels/UserPanel.vue";
import TickAvatar from "./TickAvatar.vue";
import TickIcon from "../TickIcon.vue";
import { AuthorizationType, LanguagePath } from "@/TickApi";
import { getAuthorizationTypeOptions } from "@/helpers/enumsHelper";
import { translate } from "@/plugins/translatePlugin";

@Component({
  components: { TickAvatar, UserPanel, TickIcon },
})
export default class UserAuthorizationIndicator extends Vue {
  @Prop({ default: "" }) private data!: AuthorizationType;

  private get authorizedCaption() {
    const c = getAuthorizationTypeOptions().find(p => p.value == this.data);
    return c?.text || ""
  }

  private get authorizationHelpText() {

    switch (this.data) {
      case AuthorizationType.Viewer:
        return translate(LanguagePath.Authorization_Indicator_Viewer_Explanation)
      case AuthorizationType.Contributor:
        return translate(LanguagePath.Authorization_Indicator_Contributor_Explanation)
      case AuthorizationType.Owner:
        return translate(LanguagePath.Authorization_Indicator_Owner_Explanation)
      default:
        return "";
    }
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.indicator {
  font-size: 0.7em;
  color: var(--c-contrast);
  opacity: 0.7;
}
</style>
