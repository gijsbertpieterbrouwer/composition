<template>
  <AuthorizationsEditor @saved="onSaved" />
</template>

<script lang="ts">
import { Component, Vue } from 'vue-facing-decorator';
import AuthorizationsEditor from '@/components/molecules/authorizations/AuthorizationsEditor.vue';

@Component({
  directives: {},
  components: { AuthorizationsEditor },
})
export default class TickAuthorizations extends Vue {
  private onSaved() {
    //
  }

}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";
</style>
