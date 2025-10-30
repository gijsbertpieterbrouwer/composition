import { maxDetailsListItems, patchMetaDataList } from "@/helpers/arrayHelper";
import {
  createChannel,
  deleteChannel,
  getChannels,
  getDetails,
  getEmptyChannel as getUnsavedChannel,
  updateChannel,
  validateEmailSettings,
  validateTelegramToken,
  validateTwilioPhoneToken,
} from "@/services/ChannelsService";
import {
  CommunicationType,
  EmailChannelSettings,
  TickChannel,
  TickChannelSummary,
  ValidateEmailSettingsResponse,
  ValidateTelegramTokenResponse,
  ValidateTwilioPhoneTokenResponse,
} from "@/TickApi";
import { _ActionsTree, _GettersTree, defineStore } from "pinia";
import { PiniaStorageType } from "../helpers/piniaStatehelper";
import { getTickStorage } from "./pinia";
import { PiniaStoragePath } from "./piniaStoragePaths";
import useUserStore from "./user";

interface State {
  channelSummaries: TickChannelSummary[];
  channelDetails: TickChannel[];
  unsavedChannelDetails: TickChannel[];
  validateTelegramTokenResponses: ValidateTelegramTokenResponse[];
  validateEmailSettingsResponses: ValidateEmailSettingsResponse[];
  validateTwilioPhoneTokenResponses: ValidateTwilioPhoneTokenResponse[];
}

interface Getters extends _GettersTree<State> {
  summaries: (state: State) => TickChannelSummary[];
  unsavedItem: (state: State) => (id: string) => TickChannel;
}

interface Actions extends _ActionsTree {
  use(): void;
  get(id: string): Promise<TickChannel | null>;
  add(type: CommunicationType, name: string, settingsJson?: string): Promise<string>;
  save(id: string): Promise<TickChannel>;
  delete(id: string): Promise<unknown>;
  validateTelegramToken(
    id: string,
    token: string
  ): Promise<ValidateTelegramTokenResponse>;

  validateTwilioPhoneToken(
    id: string,
    accountSId: string,
    token: string
  ): Promise<ValidateTwilioPhoneTokenResponse>;

  validateEmailSettings(
    id: string,
    settings: EmailChannelSettings
  ): Promise<ValidateEmailSettingsResponse>;
  eraseUnsaved(id: string): void;
}

const useChannelsStore = defineStore<"channels", State, Getters, Actions>(
  "channels",
  {
    state: () => ({
      channelSummaries: [],
      channelDetails: [], // contains secrets so only store in session storage
      unsavedChannelDetails: [], // used for creating new channels without saving them
      validateTelegramTokenResponses: [],
      validateEmailSettingsResponses: [],
      validateTwilioPhoneTokenResponses: [],
    }),
    getters: {
      summaries: (state) => state.channelSummaries,
      unsavedItem: (state) => (id: string) =>
        state.unsavedChannelDetails.find((f) => f.id === id) as TickChannel,
    },
    actions: {
      async use() {
        const channels = await getChannels(useUserStore().activeWorkspaceId ?? "");
        this.channelSummaries = channels;
      },
      async add(type: CommunicationType, name: string, settingsJson?: string) {
        const item: TickChannel = await getUnsavedChannel({
          workspaceId: useUserStore().activeWorkspaceId ?? "",
          communicationType: type,
          name: name,
          settingsJson: settingsJson ?? null,
        });
        this.unsavedChannelDetails.push(item);
        return item.id;
      },
      async delete(id: string) {
        const unsavedItem = this.unsavedItem(id);
        if (unsavedItem) {
          this.eraseUnsaved(id);
          return null;
        } else {
          const response: unknown = await deleteChannel(id);

          const index = (this.channelDetails as TickChannel[]).findIndex(
            (s) => s.id === id
          );
          if (index > -1) {
            this.channelDetails.splice(index, 1);
          }

          const indexSummary = (
            this.channelSummaries as TickChannelSummary[]
          ).findIndex((s) => s.id === id);
          if (indexSummary > -1) {
            this.channelSummaries.splice(indexSummary, 1);
          }

          return response;
        }
      },
      async validateEmailSettings(id: string, settings: EmailChannelSettings) {
        const serverData = await validateEmailSettings(id, settings);

        if (!serverData) {
          throw new Error("No response from server");
        }
        const index = (
          this.validateEmailSettingsResponses as ValidateEmailSettingsResponse[]
        ).findIndex((s) => s.channelId === serverData.channelId);
        if (index === -1) {
          this.validateEmailSettingsResponses.push(serverData);
        } else {
          this.validateEmailSettingsResponses.splice(index, 1, serverData);
        }

        return serverData;
      },
      async validateTelegramToken(id: string, token: string) {
        const serverData = await validateTelegramToken(id, token);

        if (!serverData) {
          throw new Error("No response from server");

        }
        const index = (
          this.validateTelegramTokenResponses as ValidateTelegramTokenResponse[]
        ).findIndex((s) => s.channelId === serverData.channelId);
        if (index === -1) {
          this.validateTelegramTokenResponses.push(serverData);
        } else {
          this.validateTelegramTokenResponses.splice(index, 1, serverData);
        }

        return serverData;
      },
      async validateTwilioPhoneToken(id: string, accountSId: string, token: string) {
        const serverData = await validateTwilioPhoneToken(id, accountSId, token);

        if (!serverData) {
          throw new Error("No response from server");
        }
        const index = (this.validateTwilioPhoneTokenResponses as ValidateTwilioPhoneTokenResponse[]).findIndex((s) => s.channelId === serverData.channelId);
        if (index === -1) {
          this.validateTwilioPhoneTokenResponses.push(serverData);
        } else {
          this.validateTwilioPhoneTokenResponses.splice(index, 1, serverData);
        }

        return serverData;
      },
      async save(id: string) {
        const unsavedItem = this.unsavedItem(id);
        if (unsavedItem) {
          const savedChannel = await createChannel(unsavedItem);
          this.patch(savedChannel);
          this.use(); // refresh data
          return savedChannel;
        } else {
          const item = (this.channelDetails as TickChannel[]).find(
            (f) => f.id === id
          ) as TickChannel;
          const updatedChannel = await updateChannel(item);
          this.patch(updatedChannel);
          this.use(); // refresh data
          return updatedChannel;
        }
      },
      eraseUnsaved(id: string) {
        if (!id) {
          return;
        }
        const unsavedItem = this.unsavedItem(id);
        if (unsavedItem) {
          const index = (this.unsavedChannelDetails as TickChannel[]).findIndex(
            (p) => p.id === id
          );
          if (index > -1) {
            this.unsavedChannelDetails.splice(index, 1);
          }
        }
      },
      async get(id): Promise<TickChannel | null> {
        if (!id) {
          return null;
        }
        const unsavedItem = this.unsavedItem(id);
        if (unsavedItem) {
          return unsavedItem;
        } else {
          const serverData = await getDetails(id);
          this.patch(serverData);
          return serverData;
        }
      },
      patch(serverData: TickChannel) {
        this.channelDetails = patchMetaDataList(serverData, this.channelDetails, maxDetailsListItems);


        // if (!serverData) {
        //   return;
        // }
        // const index = (this.channelDetails as TickChannel[]).findIndex(
        //   (s) => s.id === serverData.id
        // );
        // if (index === -1) {
        //   this.channelDetails.push(serverData);
        // } else {
        //   this.channelDetails.splice(index, 1, serverData);
        // }
      },
    },
    persist: [
      {
        pick: ["channelSummaries"],
        key: PiniaStoragePath.channelsSummaries,
        storage: getTickStorage(PiniaStorageType.Local),
      },
      {
        pick: ["channelDetails"],
        key: PiniaStoragePath.channelsDetails,
        storage: getTickStorage(PiniaStorageType.Session),
      },
      {
        pick: ["unsavedChannelDetails"],
        key: PiniaStoragePath.channelsUnsaved,
        storage: getTickStorage(PiniaStorageType.Session),
      },
    ],
  }
);

export default useChannelsStore;
