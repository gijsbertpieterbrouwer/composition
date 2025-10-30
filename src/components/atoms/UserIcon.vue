<template>
  <div class="user-icon">
    <button v-if="!disabled" class="button" :class="{ 'deleted': this.deleted }" @click.="togglePanel" ref="toggleButton">
      <TickAvatar :color="color" :sizePx="sizePx" :online="showAsOnline" :fileId="fileId" :name="nameForAvatar">
        <TickIcon class="admin-icon" v-if="showAsAdmin" name="admin" />
      </TickAvatar>
      <span v-if="showName">{{ this.name }}</span>
    </button>

    <div v-else class="button" :class="{ 'deleted': this.deleted }" @click="togglePanel" ref="toggleButton">
      <TickAvatar :color="color" :sizePx="sizePx" :online="showAsOnline" :fileId="fileId" :name="nameForAvatar">
        <TickIcon class="admin-icon" v-if="showAsAdmin" name="admin" />
      </TickAvatar>
      <span v-if="showName">{{ this.name }}</span>
    </div>

  </div>
</template>

<script lang="ts">
import { mount, unmount } from "@/helpers/mountHelper";
import { getRefElementDOMRect } from "@/helpers/refHelpers";
import useUserStore from "@/store/user";
import useUtilityDataStore from "@/store/utilitydata";
import { Component, Prop, Vue } from "vue-facing-decorator";
import UserPanel from "../panels/UserPanel.vue";
import TickIcon from "../TickIcon.vue";
import TickAvatar from "./TickAvatar.vue";
import { TickPanelOptions } from "./TickPanel.vue";

@Component({
  components: { TickAvatar, UserPanel, TickIcon },
})
export default class UserIcon extends Vue {
  @Prop({ default: "" }) private userId!: string;
  @Prop() private sizePx: number;
  @Prop() private disabled: boolean;
  @Prop() private showName: boolean;
  @Prop() private hideAdminBadge: boolean;
  @Prop() private allowMenu: boolean;

  private activePanel = "";

  private get leftPx() {
    return `${(this.sizePx / 2) - 3}px`;
  }

  private get color() {
    return this.user?.color;
  }

  private get showAsAdmin() {
    return this.isAdmin && !this.hideAdminBadge;
  }

  private get isAdmin(): boolean {
    return this.user?.isAdmin ?? false;
  }
  private get deleted(): boolean {
    const user = this.user;
    return user ? user.deleted : false;
  }

  private get showAsOnline(): boolean {
    const user = this.user;
    if (!user) { return false; }

    if (this.allowMenu && useUserStore().isSelf(user?.id)) { return false; }


    return user.loggedIn;
  }

  private get fileId() {
    const user = this.user;
    return user ? user.avatarFileId : null;
  }

  private get name() {
    const user = this.user;
    return user ? user.name : "";
  }

  private get nameForAvatar() {
    const user = this.user;
    return user ? user.name : "-";
  }

  private get user() {
    const id = this.userId || useUserStore().userId;
    return useUtilityDataStore().user(id);
  }


  private togglePanel() {

    if (this.disabled) {
      //debug("[USER:CLICK]Clicking on disabled userIcon");
      return;
    }

    if (this.activePanel) {
      this.closePanel();
    } else {
      this.openPanel();
    }
  }

  private openPanel() {
    if (this.activePanel) {
      return;
    }

    const panelOptions: TickPanelOptions = {
      title: "UserPanel",
      from: getRefElementDOMRect(this, "toggleButton")
    }

    this.activePanel = mount(UserPanel, {
      props: {
        panelOptions: panelOptions,
        userId: this.userId,
        allowMenu: this.allowMenu,
      },
      events: {
        close: () => {
          this.closePanel();
        },
      },
    });
  }

  private closePanel() {
    if (!this.activePanel) {
      return;
    }

    unmount(this.activePanel);
    this.activePanel = "";
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.user-icon {
  position: relative;
  display: inline-block;

  .admin-icon {
    position: absolute;
    left: 20px;
    top: -3px;
    color: var(--c-contrast);
    height: 40%;
    width: 40%;
  }

  .button {
    // border-radius: 100%;
    display: flex;
    gap: 5px;
    flex-wrap: wrap;
    align-items: center;

    &.deleted {
      filter: grayscale(100%);
    }

  }
}
</style>
