import { translate } from "@/plugins/translatePlugin";
import useAppStore from "./store/app";
import { LanguagePath, NotificationType } from "./TickApi";

export function notifyMessage(title: string | LanguagePath, message: string | LanguagePath) {
  useAppStore().notify(NotificationType.Normal, title, message)
}
export function notifyError(title: string | LanguagePath, message: string | LanguagePath) {

  useAppStore().notify(NotificationType.Error, title, message)
}
export function notifyApp(title: string | LanguagePath, message: string | LanguagePath, type: NotificationType) {
  useAppStore().notify(type, title, message)
}
export function notifySaved(title?: string, message?: string) {
  useAppStore().notify(NotificationType.Normal, title || translate(LanguagePath.App_Saved), message || translate(LanguagePath.App_Saved))
}

export function notifyDeveloper(message: string) {
  if (useAppStore().inDeveloperMode) {
    useAppStore().notify(NotificationType.Error, "DEVELOPER", message)
    console.trace("missing translation path");
  }
}