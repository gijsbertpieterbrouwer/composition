<template>
  <TickForm class='form'>
    <template #heading>Logging out</template>
    <template #introduction>Just a moment please while we log you out.</template>
  </TickForm>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-facing-decorator';
import TickForm from "@/components/molecules/TickForm.vue";
import TickInput from "@/components/atoms/TickInput.vue";
import useAppStore from '@/store/app';

@Component({
  components: { TickForm, TickInput }
})
export default class Logout extends Vue {
  private beforeMount() {
    useAppStore().logOut()
  }



}
</script>
