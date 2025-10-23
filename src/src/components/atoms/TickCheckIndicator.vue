<template>

  <div class="check" :class="{ 'valid': valid }"></div>


</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-facing-decorator';
import TickIcon from '../TickIcon.vue';

@Component({

  components: {
    TickIcon,
  },
})
export default class TickCheckIndicator extends Vue {
  @Prop({ default: false }) private valid: boolean;

}


</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.check {
  width: 12px;
  height: 12px;
  border-radius: 20px;

  background-color: $error;

  &.valid {
    background-color: $success;
  }
}
</style>
