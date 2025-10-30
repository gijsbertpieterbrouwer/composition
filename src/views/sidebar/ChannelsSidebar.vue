<template>
  <DocuHolder class="docuHolder" :group="docGroups" />
</template>

<script setup lang="ts">
import DocuHolder from '@/components/molecules/docublocks/DocuHolder.vue';
import { TickRouteParams } from '@/router';
import useChannelsStore from '@/store/channels';
import { CommunicationType, DocumentationGroup } from '@/TickApi';
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const channelsStore = useChannelsStore();

const selectedItemId = ref<string | null>(null);

onMounted(() => {
  if (route.params.id) {
    selectedItemId.value = route.params.id.toString();
  }
});

watch(
  () => route.params,
  (to: TickRouteParams) => {
    selectedItemId.value = to.id ?? null;
  }
);

const docGroups = computed(() => {
  if (!selectedItemId.value) {
    return [];
  }

  const channel = channelsStore.channelSummaries.find(p => p.id === selectedItemId.value) ||
    channelsStore.unsavedChannelDetails.find(p => p.id === selectedItemId.value);

  switch (channel?.communicationType) {
    case CommunicationType.Telegram:
      return [DocumentationGroup.ChannelEditorTelegram];
    case CommunicationType.ChatWidget:
      return [DocumentationGroup.ChannelEditorChatWidget];
    default:
      return [];
  }
});
</script>

<style lang="scss" scoped>
.docuHolder {
  margin-top: 58px;
}
</style>