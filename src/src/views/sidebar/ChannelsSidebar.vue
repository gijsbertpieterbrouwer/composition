<template>
  <DocuHolder class="docuHolder" :group="docGroups" />
</template>

<script lang="ts">
import DocuHolder from '@/components/molecules/docublocks/DocuHolder.vue';
import { TickRouteParams } from '@/router';
import useChannelsStore from '@/store/channels';
import { CommunicationType, DocumentationGroup } from '@/TickApi';
import { Component, Vue, Watch } from 'vue-facing-decorator';

@Component({
  components: { DocuHolder }
})
export default class ChannelsSidebar extends Vue {
  DocumentationGroup = DocumentationGroup
  private selectedItemId: string = null;

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

    if (!this.selectedItemId) {
      return [];
    } else {
      let channel = useChannelsStore().channelSummaries.find(p => p.id == this.selectedItemId);
      if (!channel) {
        channel = useChannelsStore().unsavedChannelDetails.find(p => p.id == this.selectedItemId);
      }


      switch (channel?.communicationType) {
        case CommunicationType.Telegram: return [DocumentationGroup.ChannelEditorTelegram];
        case CommunicationType.ChatWidget: return [DocumentationGroup.ChannelEditorChatWidget];
        default: return [];
      }

    }

    //return [];
  }
}
</script>
<style lang="scss" scoped>
.docuHolder {
  margin-top: 58px;
}
</style>