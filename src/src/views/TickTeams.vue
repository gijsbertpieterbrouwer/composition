<template>
  <template v-if="hasActiveItem">
    <TeamEditor :activeId="selectedItemId" @deleted="teamDeleted" @saved="teamSaved" />
  </template>
  <template v-else>
    <TickScreen :title="$translate(LanguagePath.Teams)">
      <template v-slot:actions>
        <!-- <TickButton @click="addEmptyTeam" v-if="createallowed" :busy="busyAdding">Add</TickButton> -->

        <TickAddCostItemButton @add="addEmptyTeam" :requiredAuth="AuthorizationObjectType.Workspace" :costItem="SubscriptionCostItemType.Teams" :currentNr="this.currentNr"
          :title="LanguagePath.App_Add" />
      </template>

      <template v-slot:default>


        <div class="list">
          <TickListItem icon="" :name="item.name" @select="selectItem(item)" v-for="item in this.teams" :key="item.id">
            <template v-slot:icon>
              <TeamIcon :teamId="item.id" />
            </template>
            {{ $translate(LanguagePath.Team) }}
          </TickListItem>
        </div>

      </template>
    </TickScreen>
  </template>
</template>

<script lang="ts">
import {
  AuthorizationObjectType,
  LanguagePath,
  MetaDataItem,
  SubscriptionCostItemType,
  TeamSummary,
} from "@/TickApi";
import TeamIcon from "@/components/atoms/TeamIcon.vue";
import TickAddCostItemButton from "@/components/atoms/TickAddCostItemButton.vue";
import TickButton from "@/components/atoms/TickButton.vue";
import TickInput from "@/components/atoms/TickInput.vue";
import TickListItem from "@/components/atoms/TickListItem.vue";
import TickEditorPanel from "@/components/molecules/editor/TickEditorPanel.vue";
import TickScreen from "@/components/molecules/editor/TickScreen.vue";
import TeamEditor from "@/components/molecules/team/TeamEditor.vue";
import TeamLabel from "@/components/molecules/team/TeamLabel.vue";
import { TickRouteParams, ViewName } from "@/router";
import useManagingStore from "@/store/managingStore";
import useUserStore from "@/store/user";
import { Component, Vue, Watch } from "vue-facing-decorator";

@Component({
  components: {
    TickScreen,
    TickButton,
    TickEditorPanel,
    TickInput,
    TeamEditor,
    TickListItem,
    TeamLabel,
    TeamIcon,
    TickAddCostItemButton
  },
})
export default class TickTeams extends Vue {
  LanguagePath = LanguagePath
  AuthorizationObjectType = AuthorizationObjectType;
  SubscriptionCostItemType = SubscriptionCostItemType;

  private get currentNr() {
    return this.teams.length;
  }
  private selectedItemId = "";
  private busyAdding = false;

  private get hasActiveItem() {
    return this.selectedItemId != null && this.selectedItemId != "";
  }
  private get addAllowedInPlan() {
    const currentNr = this.teams.length;
    return useUserStore().allowedAddInPlan(SubscriptionCostItemType.Teams, currentNr)
  }

  private get createallowed() {
    return useUserStore().allowedEdit(AuthorizationObjectType.Workspace) && this.addAllowedInPlan;
  }

  private addEmptyTeam() {
    useManagingStore()
      .addTeam({
        workspaceId: useUserStore().activeWorkspaceId,
        name: "New Team",
        handle: "@team",
      })
      .then((newItem) => {
        this.selectId(newItem.id);
      });
  }

  private get teams() {
    const all = useManagingStore().teamSummaries;
    return all;
  }

  private onCreation(item: MetaDataItem) {
    this.selectId(item.id);
  }

  private teamDeleted() {
    this.$router.push({ name: ViewName.Teams });
  }

  private teamSaved() {
    //
  }

  private selectItem(item: TeamSummary) {
    this.selectId(item.id);
  }

  private selectId(id: string) {
    this.$router.push({ params: { ...this.$route.params, id: id } });
  }

  mounted() {
    useManagingStore().useTeams(true);

    if (this.$route.params.id) {
      this.selectedItemId = this.$route.params.id.toString();
    }
  }

  @Watch("$route.params")
  private paramsChanged(to: TickRouteParams) {
    this.selectedItemId = to.id || null;
  }
}
</script>


<style lang="scss" scoped>
@import "@/styles/theme";

.list {
  background-color: var(--c-base-100);
  border-radius: 8px;
  overflow: hidden;
}
</style>
