<template>
  <TickSettingsPanel :panelOptions="panelOptions" class="flows-panel" @close="close">
    <template #title> {{ $translate(LanguagePath.Workspaces) }} </template>

    <div class="content">

      <div class="list">
        <TickListItem :noBGColor="true" :name="ws.name" @select="selectItem(ws)" v-for="(ws, index) in workspaces" :key="ws.id">
          <template v-slot:icon>
            <div class="list-icon">
              <WorkspaceIcon :name="ws.name" :workspaceId="ws.id" :sizePx="48" />
            </div>
          </template>

          <span class="info">(Ctrl + Shift + {{ (index + 1) }})</span>
        </TickListItem>

        <TickListItem v-if="allowCreate" :noBGColor="true" :name="''" @select="startAddWorkspace">
          <template v-slot:icon>
            <div class="list-icon">
              <TickIcon class="logo" name="plus" />
            </div>
          </template>

          <TickAddCostItemButton v-if="isGlobalAdmin" @add="startAddWorkspace" :requiredAuth="null" :costItem="SubscriptionCostItemType.Workspaces" :currentNr="currentNr" :title="LanguagePath.App_Add"
            :appearance="Appearance.transparent" :color="Color.contrast" />
        </TickListItem>
      </div>

    </div>

  </TickSettingsPanel>
</template>

<script lang="ts">
import TickListItem from '@/components/atoms/TickListItem.vue';
import TickMenuItem from "@/components/atoms/TickMenuItem.vue";
import { TickPanelOptions } from "@/components/atoms/TickPanel.vue";
import TickSettingsPanel from "@/components/panels/TickSettingsPanel.vue";
import { focus } from "@/directives";
import { unlimited } from "@/helpers/guid";
import useUserStore from "@/store/user";
import { LanguagePath, SubscriptionCostItemType, TickWorkspace } from "@/TickApi";
import { Component, Prop, Vue } from "vue-facing-decorator";
import { askNewName } from '../../helpers/questionHelper';
import { RouterToHome } from '../../router';
import useWorkspacesStore from '../../store/workspacesStore';
import MenuListItem from "../atoms/MenuListItem.vue";
import TickAddCostItemButton from '../atoms/TickAddCostItemButton.vue';
import { Appearance, Color } from '../atoms/TickButton.vue';
import WorkspaceIcon from "../atoms/WorkspaceIcon.vue";
import TickIcon from '../TickIcon.vue';

@Component({
  directives: { focus },
  emits: ["update:modelValue", "close"],
  components: {
    TickSettingsPanel,
    MenuListItem,
    TickMenuItem,
    TickListItem,
    WorkspaceIcon,
    TickIcon, TickAddCostItemButton
  },
})
export default class WorkspaceSelectorPanel extends Vue {
  SubscriptionCostItemType = SubscriptionCostItemType;
  LanguagePath = LanguagePath
  Appearance = Appearance;
  Color = Color;

  @Prop() private panelOptions!: TickPanelOptions;

  private get allowCreate(): boolean {
    return this.hasRoomToAdd && this.isGlobalAdmin;
  }

  private get isGlobalAdmin(): boolean {
    return useUserStore().isGlobalAdmin;
  }

  private startAddWorkspace() {
    if (!this.allowCreate) return;


    askNewName((to) => {
      if (to) {
        useWorkspacesStore().createWorkspace(to)
      }
    }, "");
  }

  private selectItem(item: TickWorkspace): void {
    useUserStore().activateWorkspace(item);
    RouterToHome();
    this.close();
  }


  private get maxInPlan(): number {
    return useUserStore().maxAllowedInPlan(SubscriptionCostItemType.Workspaces);
  }

  private get hasRoomToAdd() {
    return this.maxInPlan == unlimited || this.maxInPlan > this.currentNr;
  }

  private get currentNr(): number {
    return this.workspaces.length;
  }

  // private isSelected(item: TickWorkspace): boolean {
  //   return item.id == useUserStore().activeWorkspaceId;
  // }

  private get workspaces(): TickWorkspace[] {
    return useUserStore().workspaces;
  }


  private close() {
    this.$emit('close')
  }

}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";


.content {
  min-width: 400px;
  //display: grid;
  //gap: 8px;
}

.list {
  background-color: var(--c-base-100);
  border-radius: 8px;
  margin-bottom: 10px;
  overflow: hidden;
}

.list-icon {
  padding: 5px;
  min-height: 50px;
  display: grid;
  align-content: center;
}

.info {
  font-style: italic;
  opacity: 0.7;
}
</style>
