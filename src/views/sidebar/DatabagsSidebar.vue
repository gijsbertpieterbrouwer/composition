<template>
  <DocuHolder class="docuHolder" :group="docGroups" />
</template>

<script lang="ts">
import DocuHolder from '@/components/molecules/docublocks/DocuHolder.vue';
import { DocumentationGroup } from '@/TickApi';
import { Component, Vue } from 'vue-facing-decorator';

@Component({
  components: { DocuHolder }
})
export default class DatabagsSidebar extends Vue {
  DocumentationGroup = DocumentationGroup


  private get docGroups() {
    return [DocumentationGroup.States, DocumentationGroup.Utility];
  }
}
</script>
<style lang="scss" scoped>
.docuHolder {
  margin-top: 58px;
}
</style>