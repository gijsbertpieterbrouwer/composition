<template>
  <SubscriptionEditor />
</template>


<script lang="ts">
import { Component, Vue, } from 'vue-facing-decorator';
import SubscriptionEditor from '@/components/molecules/subscription/SubscriptionEditor.vue';

@Component({ components: { SubscriptionEditor } })
export default class TickTenantSubscription extends Vue {

}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";
</style>
