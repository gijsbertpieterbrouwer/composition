<template>
  <TickButton @click="togglePanel" :appearance="Appearance.secondary" :color="Color.contrast" ref="sharebutton">{{ $translate(LanguagePath.App_ObjectAuthorizationsSelector_Title) }}</TickButton>
</template>

<script lang="ts">
import TickButton, { Appearance, Color, Size } from '@/components/atoms/TickButton.vue';
import ObjectAuthorizationsPanel from "@/components/panels/ObjectAuthorizationsPanel.vue";
import { mount, unmount } from "@/helpers/mountHelper";
import { AuthorizationObjectType, LanguagePath } from "@/TickApi";
import { Component, Prop, Vue } from "vue-facing-decorator";

@Component({
  emits: ["update:modelValue"],
  components: {
    TickButton
  },
})
export default class ObjectAuthorizationsSelector extends Vue {
  Size = Size;
  Appearance = Appearance;
  Color = Color;
  LanguagePath = LanguagePath;
  @Prop() private title!: string;
  @Prop() private objectId!: string;
  @Prop() private objectType!: AuthorizationObjectType;

  private activePanel = "";

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
    // const panelOptions: TickPanelOptions = {
    //   title: "ObjectAuthorizationsPanel",
    //   from: getRefElementDOMRect(this, "sharebutton")
    // }

    this.activePanel = mount(ObjectAuthorizationsPanel, {
      props: {
        title: this.title,
        objectId: this.objectId,
        objectType: this.objectType,
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
</style>
