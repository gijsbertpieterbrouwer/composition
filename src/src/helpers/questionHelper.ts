import { openConfirmDialogPanel } from "@/components/panels/ConfirmDialog.vue";
import { openPromptDialogPanel } from "@/components/panels/PromptDialog.vue";
import { translate } from "@/plugins/translatePlugin";
import { LanguagePath } from "@/TickApi";
import { maxNameLength } from "./stringHelper";

export function onConfirmation(callback: () => void, question?: string, current?: boolean): void {
  openConfirmDialogPanel((to: boolean) => {
    if (!to) { return; }
    callback();
  }, question || translate(LanguagePath.App_Question_Sure), current)
  //return confirm(question || translate(LanguagePath.App_Question_Sure));
}

export function askConfirmation(callback: (to: boolean) => void, question?: string, current?: boolean): void {
  openConfirmDialogPanel(callback, question, current)
  //return confirm(question || translate(LanguagePath.App_Question_Sure));
}

export function askPrompt(callback: (to: string) => void, prompt: string, current: string, maxLength?: number, title?: string, buttonTitle?: string): void {
  openPromptDialogPanel(callback, current, prompt, maxLength || maxNameLength, title, buttonTitle)
}

export function askNewName(callback: (to: string) => void, current: string, prompt?: string, maxLength?: number): void {
  askPrompt(callback, prompt || translate(LanguagePath.App_Question_New_Name), current, maxLength, translate(LanguagePath.App_Name));
}