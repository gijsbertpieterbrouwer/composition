<template>
  <WorkspaceEditor @saved="saved" :activeId="selectedId" />
</template>


<script lang="ts">
import { Component, Vue } from 'vue-facing-decorator';
import useUserStore from "@/store/user";
import TickMenuItem from '@/components/atoms/TickMenuItem.vue';
import SectionWithSidebar from "@/components/atoms/SectionWithSidebar.vue";

import WorkspaceEditor from '@/components/molecules/workspace/WorkspaceEditor.vue';

@Component({
  components: { SectionWithSidebar, TickMenuItem, WorkspaceEditor }
})
export default class TickWorkspaceSettings extends Vue {

  private get selectedId() {
    return useUserStore().activeWorkspaceId;
  }

  private saved() {
    //do nothing
  }



}
</script>
