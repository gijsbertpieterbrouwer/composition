<template>
  <PartnershipEditor />
</template>


<script lang="ts">
import { Component, Vue, } from 'vue-facing-decorator';
import PartnershipEditor from '@/components/molecules/partnership/PartnershipEditor.vue';
@Component({ components: { PartnershipEditor } })
export default class TickTenantPartnership extends Vue {

}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";
</style>
