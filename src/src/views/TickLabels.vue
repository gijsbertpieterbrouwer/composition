<template>
  <LabelsEditor @saved="saved" :activeId="selectedId" />
</template>


<script lang="ts">
import { Component, Vue } from 'vue-facing-decorator';
import useUserStore from "@/store/user";
import TickMenuItem from '@/components/atoms/TickMenuItem.vue';
import SectionWithSidebar from "@/components/atoms/SectionWithSidebar.vue";
import LabelsEditor from '@/components/molecules/label/LabelsEditor.vue';

@Component({
  components: { SectionWithSidebar, TickMenuItem, LabelsEditor }
})
export default class TickLabels extends Vue {

  private get selectedId() {
    return useUserStore().activeWorkspaceId;
  }

  private saved() {
    //do nothing
  }

}
</script>
