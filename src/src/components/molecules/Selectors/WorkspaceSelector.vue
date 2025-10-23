<template>
  <div class="home-button" @click="togglePanel" ref=toggleButton>
    <WorkspaceIcon :name="workspaceName" :workspaceId="workspaceId" :sizePx="48" />

  </div>
</template>

<script lang="ts">
import { Appearance as ButtonAppearance, Color as ButtonColor, Size as ButtonSize, } from "@/components/atoms/TickButton.vue";
import { mount, unmount } from "@/helpers/mountHelper";
import { getRefElementDOMRect } from "@/helpers/refHelpers";
import { LanguagePath } from "@/TickApi";
import { Component, Vue } from "vue-facing-decorator";
import { RouterToHome } from "../../../router";
import useUserStore from "../../../store/user";
import { TickWorkspace } from "../../../TickApi";
import { TickPanelOptions } from "../../atoms/TickPanel.vue";
import WorkspaceIcon from "../../atoms/WorkspaceIcon.vue";
import WorkspaceSelectorPanel from "../../panels/WorkspaceSelectorPanel.vue";
import TickIcon from "../../TickIcon.vue";

@Component({
  emits: ["select"],
  directives: {},
  components: {
    WorkspaceIcon,
    TickIcon
  },
})
export default class WorkspaceSelector extends Vue {
  Appearance = ButtonAppearance;
  Size = ButtonSize;
  Color = ButtonColor;
  LanguagePath = LanguagePath

  private activePanel = "";

  created() {
    window.addEventListener('keyup', this.keyListener);
  }

  beforeUnmount() {
    document.removeEventListener("keyup", this.keyListener);
  }

  private keyListener(e: KeyboardEvent) {

    if (e.ctrlKey && e.shiftKey && e.code >= 'Digit1' && e.code <= 'Digit9') {
      // Prevent the Save dialog to open
      e.preventDefault();

      // Extract the digit from event.code (e.g., 'Digit1' -> '1')
      const numberKey = e.code.charAt(5); // 'DigitX' -> 'X'
      const index = parseInt(numberKey, 10) - 1; // 0-based index (1 -> 0, etc.)

      // Check if index is within array bounds
      if (index >= 0 && index < this.workspaces.length) {
        const selectedItem = this.workspaces[index];
        useUserStore().activateWorkspace(selectedItem);
        RouterToHome();

      }

      return false;
    }
  }

  private get workspaceName() {
    return this.workspace?.name;
  }

  private get workspace() {
    const ws = useUserStore().activeWorkspace;
    return ws;
  }

  private get workspaces(): TickWorkspace[] {
    return useUserStore().workspaces;
  }


  private get workspaceFileId() {
    return this.workspace?.iconFileId;
  }

  private get workspaceId() {
    return this.workspace?.id;
  }



  private togglePanel() {

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
      title: "WorkspaceSelectorPanel",
      allowAsSubDialog: true,
      from: getRefElementDOMRect(this, "toggleButton"),
    }

    this.activePanel = mount(WorkspaceSelectorPanel, {
      props: {
        panelOptions: panelOptions,
      },
      events: {
        close: () => {
          this.closePanel();
        },
        select: (toId: string) => {
          //this.select(to);
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
</style>
