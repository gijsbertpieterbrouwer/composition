//import { generate } from "@vue/compiler-core};
import { getLanguageByLocale, getNotificationTypeDuration } from "@/helpers/enumsHelper";
import generateId from "@/helpers/guid";
import { warn } from "@/log";
import { notifyDeveloper } from "@/notify";
import { translate } from "@/plugins/translatePlugin";
import { RouterToLogin, ViewName } from "@/router";
import { logout } from "@/services/AuthenticationService";
import { getLanguagePack } from "@/services/LanguageService";
import { updateMyUser } from "@/services/TeamsService";
import { LanguagePack, LanguagePath, LanguageType, NotificationType } from "@/TickApi";
import { _ActionsTree, _GettersTree, defineStore } from "pinia";
import { PiniaStorageType } from "../helpers/piniaStatehelper";
import { getTickStorage } from "./pinia";
import { PiniaStoragePath } from "./piniaStoragePaths";
import useTasksStore from "./tasks";
import useTicketsStore from "./tickets";
import useUserStore from "./user";
import useUtilityDataStore from "./utilitydata";
import useViewstateStore, { UserSettings } from "./viewstate";
import useVoiceStore from "./voice";


interface State {
  deviceId: string | null;
  deviceName: string | null;
  token: string | null;
  rtcConnected: boolean;
  notifications: TickNotification[];
  nowUtcTicks: number;
  dialogStack: TickDialogStackData[]
  languagePacks: LanguagePack[];
  route: {
    name: ViewName,
  } | null
}


export interface TickNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  status: notificationStatus;
}

export interface TickDialogStackData {
  title: string;
  id: string;
  depth: NotificationType;
  close(): void;
}

export interface LanguageTokenItem {
  path: string;
  value: string;
}



// export enum notificationType {
//   normal,
//   error,
//   subscription,
// }

export enum notificationStatus {
  show,
  finish,
}

interface Getters extends _GettersTree<State> {
  inDeveloperMode(state: State): boolean;
  authenticated(state: State): boolean;
  highestDialog(state: State): TickDialogStackData | null;
  getLanguageItem: (state: State) => (path: LanguagePath, tokens?: LanguageTokenItem | LanguageTokenItem[]) => string;
}

interface Actions extends _ActionsTree {
  useLanguage(language: LanguageType, forceReload: boolean): Promise<boolean>;
  notify(type: NotificationType, title: string | LanguagePath, message: string | LanguagePath): void;
  closeNotification(id: string): void;
  getDeviceId(): string;
  getDeviceName(): string;
  logOut(): void;
  addDialog(title: string, close: () => void): TickDialogStackData;
  removeAllDialogs(): void;
  removeDialog(id: string, ignoreCloseEvent: boolean): void;
}

const useAppStore = defineStore<"app", State, Getters, Actions>("app", {
  state: () => ({
    deviceId: null,
    deviceName: null,
    token: null,
    rtcConnected: false,
    notifications: [],
    nowUtcTicks: 0,
    dialogStack: [],
    languagePacks: [],
    route: null,
  }),
  getters: {

    inDeveloperMode() {
      return process.env.VUE_APP_VERSION == "development";
    },
    authenticated: (state) => state.token !== null,
    highestDialog() {
      return this.dialogStack.length
        ? this.dialogStack.at(-1) ?? null
        : null;
    },


    getLanguageItem(state) {
      const lang = getLanguageByLocale(useUserStore().locale);
      const langPack = (state.languagePacks as LanguagePack[]).find(p => p.language == lang);

      return (path: LanguagePath, tokens?: LanguageTokenItem | LanguageTokenItem[]): string => {
        if (path == undefined || path == null) {
          notifyDeveloper("Missing translation path")


          return "";
        }

        if (!langPack || !langPack.items?.length) { return ""; }
        const item = langPack.items.find(p => p.path == path);

        if (!item) {
          //alert(LanguagePath[path].toString())
          warn("MISSING_LANGUAGE " + LanguagePath[path].toString());
        }

        if (!item) { return LanguagePath[path].toString(); }

        let output = item.value;
        if (tokens) {



          if (tokens instanceof Array) {
            // multiple tokens
            const tokenList = tokens as LanguageTokenItem[];
            if (tokenList.length) {
              for (let index = 0; index < tokenList.length; index++) {
                const token = tokenList[index];
                output = output?.replace(`{{${token.path}}}`, token.value);
              }
            }
          } else {
            // single token
            output = output?.replace(`{{${tokens.path}}}`, tokens.value);
          }


        }
        return output ?? "";
      }
    },

  },
  actions: {
    async useLanguage(language: LanguageType, forceReload: boolean) {
      language = language || LanguageType.EnUs;
      const languagePack = ((this.languagePacks || []) as LanguagePack[]).find(p => p.language == language);

      // fetch if not present
      if (!languagePack || forceReload) {
        const newLangPack = await getLanguagePack(language);
        if (newLangPack) {
          this.languagePacks = (this.languagePacks as LanguagePack[]).filter(p => p.language != language);
          this.languagePacks.push(newLangPack);
        } else {
          return false;
        }
      }

      return true;
    },
    logOut() {
      this.removeAllDialogs();
      // save user settings
      const user = useUtilityDataStore().user(useUserStore().userId);

      if (!user) {
        logout({
          deviceId: useAppStore().getDeviceId(),
          forceLogOffAllDevices: true,
        }).then(() => {
          setTimeout(RouterToLogin, 500);
        }).catch(() => {
          RouterToLogin();
        });
        return;
      }

      const settings: UserSettings = {
        //localeCode: useUserStore().localeCode,
        viewstateRules: useViewstateStore().rules,
        theme: useViewstateStore().theme,
        tasks: {
          filterOptions: useTasksStore().taskFilters,
          listOptions: useTasksStore().listOptions,
        },
        tickets: {
          filterOptions: useTicketsStore().ticketFilters ?? null,
          listOptions: useTicketsStore().listOptions,
        },
        voice: {
          autoConnect: useVoiceStore().autoConnect ?? null,
          defaultChannelId: useVoiceStore().defaultChannelId ?? null,
        }
      };

      updateMyUser({
        avatarFileId: user.avatarFileId,
        localeCode: useUserStore().localeCode,
        workspaceId: useUserStore().activeWorkspaceId ?? "",
        settingsJson: settings ? JSON.stringify(settings || "{}") : null,
      }).then(() => {
        // log out
        logout({
          deviceId: useAppStore().getDeviceId(),
          forceLogOffAllDevices: true,
        }).then(() => {
          setTimeout(RouterToLogin, 500);
        }).catch(() => {
          RouterToLogin();
        });
      }).catch(() => {
        RouterToLogin();
      });


    },
    getDeviceName() {
      if (!this.deviceName) {
        this.deviceName = navigator.userAgent;
      }

      return this.deviceName;
    },
    getDeviceId() {
      if (!this.deviceId) {
        this.deviceId = generateId();

      }

      return this.deviceId;
    },
    addDialog(title: string, closer: () => void): TickDialogStackData {
      const currentHighest = this.highestDialog as TickDialogStackData;
      const currentDepth = currentHighest?.depth || 0;

      const newData: TickDialogStackData = {
        title: title || "unknown-panel",
        id: generateId(),
        depth: currentDepth + 1,
        close: closer,
      };

      this.dialogStack.push(newData);


      return newData;
    },
    removeDialog(id: string, ignoreCloseEvent: boolean) {
      if (!ignoreCloseEvent) {
        const dialog = (this.dialogStack as TickDialogStackData[]).find(p => p.id == id);
        if (!dialog) { return; }
        if (dialog?.close) { dialog.close(); }
      }
      setTimeout(() => {
        this.dialogStack = (this.dialogStack as TickDialogStackData[]).filter(p => p.id != id);
      }, 10);
    },
    removeAllDialogs() {
      for (let index = 0; index < this.dialogStack.length; index++) {
        const dialog = this.dialogStack[index];
        if (!dialog) { continue; }
        if (dialog?.close) { dialog.close(); }
      }

    },

    async closeNotification(id: string) {
      const index = (this.notifications as TickNotification[]).findIndex(
        (s) => s.id === id
      );
      if (index > -1) {
        this.notifications.splice(index, 1);
      }
    },
    async notify(type: NotificationType, title: string | LanguagePath, message: string | LanguagePath) {
      // if same as last => ignore
      const last = this.notifications.slice(-1)[0] as TickNotification;
      if (
        last &&
        last.title == title &&
        last.message == message &&
        last.type == type &&
        last.status == notificationStatus.show
      ) {
        return;
      }

      const newId = generateId();

      const displayTitle = typeof (title) == 'string' ? title : translate(title as LanguagePath);
      const displayMessage = typeof (message) == 'string' ? message : translate(message as LanguagePath);

      const tn: TickNotification = {
        id: newId,
        message: displayMessage,
        title: displayTitle,
        type: type,
        status: notificationStatus.show,
      };
      this.notifications.push(tn);

      setTimeout(() => {
        tn.status = notificationStatus.finish;
        this.notifications = this.notifications.slice();

        setTimeout(() => {
          this.closeNotification(newId);
        }, 400);
      }, getNotificationTypeDuration(tn.type));
    },
  },
  persist: [
    {
      pick: ["theme"],
      key: PiniaStoragePath.theme,
      storage: getTickStorage(PiniaStorageType.Session, true),
    },
    {
      pick: ["nowUtcTicks"],
      key: PiniaStoragePath.nowUtcTicks,
      storage: getTickStorage(PiniaStorageType.Session, true),
    },
    {
      pick: ["deviceId"],
      key: PiniaStoragePath.appDeviceId,
      storage: getTickStorage(PiniaStorageType.Local, true),
    },
    {
      pick: ["deviceName"],
      key: PiniaStoragePath.appDeviceName,
      storage: getTickStorage(PiniaStorageType.Local, true),
    },
    {
      pick: ["token"],
      key: PiniaStoragePath.token,
      storage: getTickStorage(PiniaStorageType.Session, true),
    },
    {
      pick: ["languagePacks"],
      key: PiniaStoragePath.languagePacks,
      storage: getTickStorage(PiniaStorageType.Local, true),
    },
  ],
});

export default useAppStore;
