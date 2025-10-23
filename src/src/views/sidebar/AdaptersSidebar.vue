<template>
  <DocuHolder class="docuHolder" :group="docGroups" />


  <AdapterLogsList v-if="hasSelection" :adapterDefinitionId="selectedItemId" />
</template>

<script lang="ts">
import AdapterLogsList from '@/components/molecules/dataadapters/AdapterLogsList.vue';
import DocuHolder from '@/components/molecules/docublocks/DocuHolder.vue';
import { TickRouteParams } from '@/router';
import { DocumentationGroup } from '@/TickApi';
import { Component, Vue, Watch } from 'vue-facing-decorator';

@Component({
  components: { DocuHolder, AdapterLogsList }
})
export default class AdaptersSidebar extends Vue {
  DocumentationGroup = DocumentationGroup
  private selectedItemId: string = null;


  private get hasSelection() {
    return this.selectedItemId != null;
  }

  mounted() {
    if (this.$route.params.id) {
      this.selectedItemId = this.$route.params.id.toString();
    }
  }

  @Watch("$route.params")
  private paramsChanged(to: TickRouteParams) {
    this.selectedItemId = to.id || null;
  }

  private get docGroups() {
    return [DocumentationGroup.AdapterEditor, DocumentationGroup.Utility];
  }
}
</script>
<style lang="scss" scoped>
.docuHolder {
  margin-top: 58px;
}
</style>