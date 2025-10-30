import useAppStore, { LanguageTokenItem } from "@/store/app";
import { LanguagePath } from "@/TickApi";
import { App } from "vue";

export function translate(path: LanguagePath, tokens?: LanguageTokenItem | LanguageTokenItem[]): string {
  try {
    return useAppStore().getLanguageItem(path, tokens);
  } catch (error) {
    return "";
  }
}


export default {
  install: (app: App) => {
    // inject a globally available $translate() method
    app.config.globalProperties.$translate = (path: LanguagePath, tokens?: LanguageTokenItem | LanguageTokenItem[]) => {
      return translate(path, tokens);
    }
  }
}

//declare global  $translate(path: LanguagePath, tokens?: LanguageTokenItem | LanguageTokenItem[]): string

// must cast as any to set property on window
// const _global = (window /* browser */ || global /* node */) as any
// _global.$translate = translate

// declare global {
//   function $translate(path: LanguagePath, tokens?: LanguageTokenItem | LanguageTokenItem[]): string;
// }

// interface Window {
//   $translate(path: LanguagePath, tokens?: LanguageTokenItem | LanguageTokenItem[]): string;
// }