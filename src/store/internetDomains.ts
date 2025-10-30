import { AddInternetDomainRequest, TickInternetDomain, ValidateInternetDomainRequest } from "@/TickApi";
import { createInternetDomain, getAllInternetDomains, validateInternetDomain } from "@/services/InternetDomainVerificationService";
import { PiniaStorageType } from "../helpers/piniaStatehelper";
import { getTickStorage } from "./pinia";

import { _ActionsTree, _GettersTree, defineStore } from "pinia";
import { deleteInternetDomain } from "../services/InternetDomainVerificationService";
import { PiniaStoragePath } from "./piniaStoragePaths";
interface State {
  domains: TickInternetDomain[];

}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Getters extends _GettersTree<State> {
  // getCurrent(state: State): TickPartnerShipData;
}

interface Actions extends _ActionsTree {
  use(): void;
  validateDomainByPublicValidationKey(domainId: string, validationKey: string): Promise<TickInternetDomain>;
  createDomain(domainName: string): Promise<TickInternetDomain>;
  deleteDomain(id: string): Promise<unknown>;
}

const useInternetDomainsStore = defineStore<
  "internetDomains",
  State,
  Getters,
  Actions
>("internetDomains", {
  state: () => ({
    domains: [],
  }),
  getters: {

  },
  actions: {
    async use() {
      const data = await getAllInternetDomains();
      this.domains = data;
    },

    async createDomain(domainName: string) {
      const req: AddInternetDomainRequest = {
        domainName: domainName,
      }

      const data = await createInternetDomain(req);
      this.use();
      return data;
    },
    async deleteDomain(id: string) {

      const data = await deleteInternetDomain(id);
      this.use();
      return data;
    },

    async validateDomainByPublicValidationKey(domainId: string, publicValidationKey: string) {
      const req: ValidateInternetDomainRequest = {
        internetDomainId: domainId,
        validationKey: publicValidationKey,
      }

      const data = await validateInternetDomain(req);
      this.use();
      return data;
    },
  },
  persist: [
    {
      pick: undefined,
      key: PiniaStoragePath.internetDomains,// "tick-internet-domains",
      storage: getTickStorage(PiniaStorageType.Session),
    },
  ],
});

export default useInternetDomainsStore;
