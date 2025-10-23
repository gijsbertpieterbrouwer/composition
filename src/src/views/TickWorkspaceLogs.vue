<template>
  <template v-if="hasActiveItem">
    <!-- <FileEditor :activeId="selectedItemId" @deleted="onFileDeleted" @saved="onFileSaved" /> -->
    log here
  </template>
  <template v-else>
    <TickScreen :title="$translate(LanguagePath.WorkspaceLogs)">
      <template v-slot:actions>
        <!-- <TickButton @click="addFile" ref="addButton" v-if="createallowed">{{ $translate(LanguagePath.App_Add) }}</TickButton> -->
      </template>
      <template v-slot:default>
        <div class="content">
          <div class="navigator">
            <TickButton @click="prevPage" :disabled="disablePrevious">{{ $translate(LanguagePath.App_Previous) }}</TickButton>
            <span> {{ this.pageNr }}</span>
            <TickButton @click="nextPage" :disabled="disableNext">{{ $translate(LanguagePath.App_Next) }}</TickButton>
          </div>

          <table class="styledTable" v-if="logs.length">
            <!-- <thead>
            <tr>
              <th>{{ $translate(LanguagePath.App_AdapterLogDetailsPanel_RequestHeaders_Key_Title) }}</th>
              <th>{{ $translate(LanguagePath.App_AdapterLogDetailsPanel_RequestHeaders_Key_Title) }}</th>
              <th>{{ $translate(LanguagePath.App_AdapterLogDetailsPanel_RequestHeaders_Value_Title) }}</th>
            </tr>
          </thead> -->
            <tbody>
              <tr v-for="(item) in this.logs" :key="item.id">
                <td>
                  <TickIcon name="warning" v-if="item.logType == LogTypeEnum.Warning" />
                  <TickIcon name="delete" v-else-if="item.logType == LogTypeEnum.Removal" />
                  <TickIcon name="message" v-else-if="item.logType == LogTypeEnum.Update" />
                </td>
                <td class="numeric">
                  <UserIcon :sizePx="24" :userId="item.initiator.id" :disabled="true" />
                </td>
                <td style="width:100px" :title="getDisplayDate(item)">{{ displayDistanceToNowDate(item) }}</td>
                <td :title="item.message">
                  {{ item.title }}<br />
                  {{ item.message }}
                </td>

              </tr>
            </tbody>
          </table>

          <div class="navigator">
            <TickButton @click="prevPage" :disabled="disablePrevious">{{ $translate(LanguagePath.App_Previous) }}</TickButton>
            <span> {{ this.pageNr }}</span>
            <TickButton @click="nextPage" :disabled="disableNext">{{ $translate(LanguagePath.App_Next) }}</TickButton>
          </div>


        </div>
      </template>
    </TickScreen>

  </template>
</template>


<script lang="ts">
import { Component, Vue } from 'vue-facing-decorator';
import { focus } from "@/directives";
import TickButton from "@/components/atoms/TickButton.vue";
import { LanguagePath, LogTypeEnum, TickWorkspaceLog } from '@/TickApi';
import TickScreen from '@/components/molecules/editor/TickScreen.vue';
import useUserStore from '@/store/user';
import TickListItem from '@/components/atoms/TickListItem.vue';
import { getWorkspaceLogs } from '@/services/WorkspaceService';
import UserIcon from '@/components/atoms/UserIcon.vue';
import { displayDate } from '@/helpers/dateHelper';
import TickIcon from '@/components/TickIcon.vue';

@Component({
  directives: { focus },
  components: { TickButton, TickScreen, TickListItem, UserIcon, TickIcon },
})
export default class TickWorkspaceLogs extends Vue {
  LanguagePath = LanguagePath
  private selectedItemId = "";
  private pageNr = 1;
  private pageAmount = 20;
  private logs: TickWorkspaceLog[] = [];
  LogTypeEnum = LogTypeEnum

  private get disablePrevious(): boolean {
    return this.pageNr == 1;
  }

  private get disableNext(): boolean {
    return this.logs?.length < this.pageAmount;
  }

  private getLogClass(log: TickWorkspaceLog): string {
    if (log.logType == LogTypeEnum.Warning) { return 'warning'; }
    return '';
  }


  private getDisplayDate(log: TickWorkspaceLog): string {
    return displayDate(log.creationDate);
  }

  private displayDistanceToNowDate(log: TickWorkspaceLog): string {
    return displayDate(log.creationDate, true);
  }

  // private get hasActiveItem() {
  //   return this.selectedItemId != null && this.selectedItemId != "";
  // }

  private prevPage() {
    this.pageNr--
    if (this.pageNr < 1) { this.pageNr = 1; }
    this.refresh();
  }

  private nextPage() {
    this.pageNr++;
    this.refresh();
  }

  private refresh() {
    getWorkspaceLogs(useUserStore().activeWorkspaceId, this.pageNr, this.pageAmount).then((logs) => {
      this.logs = logs;
    })
  }

  mounted() {
    this.refresh();

    // if (this.$route.params.id) {
    //   this.selectedItemId = this.$route.params.id.toString();
    // }
  }

  // private selectItem(item: SelectedItem) {
  //   RouterToItem(item.objectType, item.id);
  // }

  // @Watch("$route.params")
  // private paramsChanged(to: TickRouteParams) {
  //   this.selectedItemId = to.id || null;
  // }



}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.content {
  display: grid;
  gap: 10px;

  .navigator {
    display: flex;
    gap: 10px;
    justify-content: center;
    align-content: center;
    align-items: center;
    flex-wrap: wrap;
  }
}
</style>
