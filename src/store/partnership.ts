/* eslint-disable @typescript-eslint/no-unused-vars */
import { TenantOverview, TickEndPartnershipRequest, TickEndPartnershipResponse, TickEndTenantSubscriptionRequest, TickPartnerShipData, TickStartAffiliatePartnershipRequest, TickStartAffiliatePartnershipResponse } from "@/TickApi";
import { maxDetailsListItems, patchMetaDataList } from "@/helpers/arrayHelper";
import { defineStore } from "pinia";
import { computed, ref } from 'vue';
// Alias imports to avoid name collision with actions
import { endPartnership as apiEndPartnership, endTenantViaPartnership as apiEndTenantViaPartnership, getActivePartnership as apiGetActivePartnership, getPartnershipSubTenant as apiGetPartnershipSubTenant, startAffiliatePartnership as apiStartAffiliatePartnership } from "@/services/PartnershipService";
import { PiniaStorageType } from "../helpers/piniaStatehelper";
import { getTickStorage } from "./pinia";
import { PiniaStoragePath } from "./piniaStoragePaths";
import useUserStore from "./user";

interface State {
  partnership: TickPartnerShipData | null;
  subTenants: TenantOverview[];
}

const usePartnershipStore = defineStore("partnership", () => {
  // State as refs (allow null for partnership)
  const partnership = ref<TickPartnerShipData | undefined>(undefined);
  const subTenants = ref<TenantOverview[]>([]);

  // Getters as computed
  const getCurrent = computed(() => partnership.value);

  const subTenant = computed(() => {
    return (id: string) => subTenants.value.find((p) => p.id === id);
  });

  // Actions as functions
  const use = async (): Promise<void> => {
    try {
      const data = await apiGetActivePartnership();
      partnership.value = data;
    } catch (error) {
      console.error('Error fetching partnership:', error);
      partnership.value = undefined;
    }
  };

  const startAffiliatePartnership = async (financeViaPartnerShip: boolean, invoiceEmailAddresses: string[]): Promise<TickStartAffiliatePartnershipResponse | null> => {
    const req: TickStartAffiliatePartnershipRequest = {
      financeViaPartnerShip,
      invoiceMailAddresses: invoiceEmailAddresses,
    };

    try {
      const data = await apiStartAffiliatePartnership(req);
      await use();  // Refresh
      return data;
    } catch (error) {
      console.error('Error starting affiliate partnership:', error);
      return null;
    }
  };

  const endPartnership = async (partnershipId: string): Promise<TickEndPartnershipResponse | null> => {
    const req: TickEndPartnershipRequest = {
      partnerShipId: partnershipId,
    };

    try {
      const data = await apiEndPartnership(req);
      await use();  // Refresh
      return data;
    } catch (error) {
      console.error('Error ending partnership:', error);
      return null;
    }
  };

  const endSubscription = async (tenantId: string): Promise<unknown> => {
    const req: TickEndTenantSubscriptionRequest = {
      tenantId,
      workspaceId: useUserStore().activeWorkspaceId ?? "",
    };

    try {
      const data = await apiEndTenantViaPartnership(req);
      await use();  // Refresh
      return data;
    } catch (error) {
      console.error('Error ending subscription:', error);
      throw error;  // Re-throw for caller
    }
  };

  const getSubTenant = async (tenantId: string): Promise<TenantOverview | null> => {
    try {
      const data = await apiGetPartnershipSubTenant(tenantId, useUserStore().activeWorkspaceId ?? "");
      patch(data);
      return data;
    } catch (error) {
      console.error('Error getting sub-tenant:', error);
      return null;
    }
  };

  const patch = (serverData: TenantOverview): void => {
    subTenants.value = patchMetaDataList(serverData, subTenants.value, maxDetailsListItems);
  };

  return {
    // State
    partnership,
    subTenants,

    // Getters
    getCurrent,
    subTenant,

    // Actions
    use,
    startAffiliatePartnership,
    endPartnership,
    endSubscription,
    getSubTenant,
    patch,
  };
}, {
  persist: [
    {
      pick: undefined,
      key: PiniaStoragePath.partnership,
      storage: getTickStorage(PiniaStorageType.Session),
    },
  ],
});

export default usePartnershipStore;