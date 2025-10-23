import { TenantOverview, TickEndPartnershipRequest, TickEndPartnershipResponse, TickEndTenantSubscriptionRequest, TickPartnerShipData, TickStartAffiliatePartnershipRequest, TickStartAffiliatePartnershipResponse } from "@/TickApi";
import { maxDetailsListItems, patchMetaDataList } from "@/helpers/arrayHelper";
import { endPartnership, endTenantViaPartnership, getActivePartnership, getPartnershipSubTenant, startAffiliatePartnership } from "@/services/PartnershipService";
import { _ActionsTree, _GettersTree, defineStore } from "pinia";
import { PiniaStorageType } from "../helpers/piniaStatehelper";
import { getTickStorage } from "./pinia";
import { PiniaStoragePath } from "./piniaStoragePaths";
import useUserStore from "./user";
interface State {
  partnership: TickPartnerShipData;
  subTenants: TenantOverview[];
}

interface Getters extends _GettersTree<State> {
  getCurrent(state: State): TickPartnerShipData;
  subTenant: (state: State) => (id: string) => TenantOverview;
}

interface Actions extends _ActionsTree {
  use(): void;
  startAffiliatePartnership(financeViaPartnerShip: boolean, invoiceEmailAddresses: string[]): Promise<TickStartAffiliatePartnershipResponse>;
  endPartnership(partnershipId: string): Promise<TickEndPartnershipResponse>;
  endSubscription(tenantId: string): Promise<unknown>;
  getSubTenant(tenantId: string): Promise<TenantOverview>;
}

const usePartnershipStore = defineStore<
  "partnership",
  State,
  Getters,
  Actions
>("partnership", {
  state: () => ({
    partnership: null,
    subTenants: [],
  }),
  getters: {
    getCurrent: (state) => state.partnership,
    subTenant: (state) => (id: string) => (state.subTenants || []).find((p) => p.id == id) as TenantOverview,

  },
  actions: {
    async use() {
      const data = await getActivePartnership();
      this.partnership = data;
    },

    async startAffiliatePartnership(financeViaPartnerShip: boolean, invoiceEmailAddresses: string[]) {
      const req: TickStartAffiliatePartnershipRequest = {
        financeViaPartnerShip: financeViaPartnerShip,
        invoiceMailAddresses: invoiceEmailAddresses,
      }

      const data = await startAffiliatePartnership(req);
      this.use();
      return data;
    },

    async endPartnership(partnershipId: string) {
      const req: TickEndPartnershipRequest = {
        partnerShipId: partnershipId,
      }

      const data = await endPartnership(req);
      this.use();
      return data;
    },
    async endSubscription(tenantId: string) {
      const req: TickEndTenantSubscriptionRequest = {
        tenantId: tenantId,
        workspaceId: useUserStore().activeWorkspaceId,
      }

      const data = await endTenantViaPartnership(req);
      this.use();
      return data;
    },
    async getSubTenant(tenantId: string) {

      const data = await getPartnershipSubTenant(tenantId, useUserStore().activeWorkspaceId);
      this.patch(data);
      return data;
    },
    patch(serverData: TenantOverview) {
      this.subTenants = patchMetaDataList(serverData, this.subTenants, maxDetailsListItems);
    },



  },
  persist: [
    {
      pick: undefined,
      key: PiniaStoragePath.partnership,// "tick-partnership",
      storage: getTickStorage(PiniaStorageType.Session),
    },
  ],
});

export default usePartnershipStore;
