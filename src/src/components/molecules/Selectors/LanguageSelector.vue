<template>
  <TickDropdown @select="selectLanguage" :options="languageOptions" :noFilter="true" :dropdownTitle="$translate(LanguagePath.App_LanguageSelector_Title)"
    :placeholder="$translate(LanguagePath.App_LanguageSelector_Title)" :allowAsSubDialog="true" :size="size" :appearance="appearance" :color="color" :asButton="true">
    <template #content>
      <TickIcon v-if="hasLanguage" class="icon" :name="langIconName" />

    </template>
  </TickDropdown>
</template>

<script lang="ts">
import { Appearance, Color, Size } from "@/components/atoms/TickButton.vue";
import TickDropdown, { DropdownOption } from "@/components/atoms/TickDropdown.vue";
import TickIcon from "@/components/TickIcon.vue";
import { getLanguageOptions } from "@/helpers/enumsHelper";
import { LanguagePath } from "@/TickApi";
import { Component, Prop, Vue } from "vue-facing-decorator";

@Component({
  emits: ["select"],
  components: {
    TickIcon,
    TickDropdown
  },
})
export default class LanguageSelector extends Vue {

  LanguagePath = LanguagePath;

  @Prop() private languageCode: string;
  @Prop() private size: Size;
  @Prop() private appearance: Appearance;
  @Prop() private color: Color;

  private get language(): DropdownOption {
    return this.languageOptions.find(p => p.id == this.languageCode);
  }

  private get hasLanguage(): boolean {
    return this.language != null;
  }

  private get langIconName(): string {
    return this.language ? this.language.icon : '';
  }

  private selectLanguage(to: string) {
    this.$emit("select", to);
  }

  private get languageOptions(): DropdownOption[] {
    return getLanguageOptions();
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/theme";

.icon {
  width: 30px;
  height: 15px;
}
</style>
