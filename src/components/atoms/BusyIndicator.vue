<template>
  <template v-if="loading">
    <div class="lds-dual-ring"></div>
  </template>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-facing-decorator';

@Component
export default class BusyIndicator extends Vue {
  @Prop({ default: false }) private loading: boolean;

}


</script>

<style lang="scss" scoped>
.lds-dual-ring {
  display: inline-block;
  width: 15px;
  height: 15px;
}

.lds-dual-ring:after {
  content: " ";
  display: inline-block;
  width: 8px;
  height: 8px;
  margin: 2px;
  border-radius: 50%;
  border: 2px solid var(--c-contrast);
  border-color: var(--c-contrast) transparent var(--c-contrast) transparent;
  animation: lds-dual-ring 2.5s linear infinite;
}

@keyframes lds-dual-ring {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>
