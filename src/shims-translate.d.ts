import { translate } from "./plugins/translatePlugin";

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $translate: typeof translate;
  }
}
