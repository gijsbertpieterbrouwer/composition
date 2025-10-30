<template>
  <div v-html="highlightedContent"></div>
</template>


<script lang="ts">
import { replaceAll } from '@/helpers/stringHelper';
import { Component, Prop, Vue } from 'vue-facing-decorator';


@Component({ components: {} })
export default class TickTokenizedContentViewer extends Vue {
  @Prop() private content!: string;

  private get highlightedContent(): string {

    // replace tokens
    let newHtml = replaceAll(this.content, "{{", `<span class='tick-token-highlight'>{{`);
    newHtml = replaceAll(newHtml, "}}", "}}</span>")

    //replace @mentions
    newHtml = newHtml.replace(/(?<=^|\s)(@[\w.]+)(?<!\.)/gi, '<span class="tick-mention-highlight">$1</span>')


    return newHtml;
  }

}
</script>

<style lang="scss">
@import "@/styles/theme";

.tick-token-highlight {
  color: var(--c-pink-neon);
  font-style: normal;
}

.tick-mention-highlight {
  color: var(--c-blue-neon);
  font-style: normal;
}
</style>
