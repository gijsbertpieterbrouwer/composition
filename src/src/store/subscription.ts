import {
  createMandate,
  getBillingInfo,
  getInvoicesLast12Months,
  revokeMandate,
  startManualInvoicePayment,
} from "@/services/billingService";
import {
  getActiveSubscription,
  getCurrentPeriodUsage,
  removeTenant,
  subscribeTenant,
} from "@/services/SubscriptionService";
import {
  BillingPeriodData,
  PaymentProgressResponse,
  RemoveTenantProgress,
  SubscriptionProgressResponse,
  TickBillingInfo,
  TickInvoice,
  TickRemoveTenantRequest,
  TickSubscribeRequest,
  TickSubScriptionData,
} from "@/TickApi";
import { _ActionsTree, _GettersTree, defineStore } from "pinia";
import { PiniaStorageType } from "../helpers/piniaStatehelper";
import { getTickStorage } from "./pinia";
import { PiniaStoragePath } from "./piniaStoragePaths";
interface State {
  subscription: TickSubScriptionData;
  currentPeriodUsage: BillingPeriodData;
  invoices: TickInvoice[];
  billingInfo: TickBillingInfo;
}

interface Getters extends _GettersTree<State> {
  all(state: State): unknown;
}

interface Actions extends _ActionsTree {
  use(): void;
  subscribe(
    request: TickSubscribeRequest
  ): Promise<SubscriptionProgressResponse>;
  useCurrentPeriodUsage(): void;
  useInvoices(): void;
  useBilling(): void;
  manualPayInvoice(id: string): Promise<PaymentProgressResponse>;
  revokeMandate(): Promise<unknown>;
  createMandate(): Promise<PaymentProgressResponse>;
  removeTenant(req: TickRemoveTenantRequest): Promise<RemoveTenantProgress>;
}

const useSubscriptionStore = defineStore<
  "subscription",
  State,
  Getters,
  Actions
>("subscription", {
  state: () => ({
    subscription: {},
    invoices: [],
    currentPeriodUsage: {},
    billingInfo: {},
  }),
  getters: {
    all: (state) => state.subscription,
  },
  actions: {
    async use() {
      const sub = await getActiveSubscription();
      this.subscription = sub;
    },
    async subscribe(request: TickSubscribeRequest) {
      const sub = await subscribeTenant(request);
      return sub;
    },

    async useCurrentPeriodUsage() {
      const data = await getCurrentPeriodUsage();
      this.currentPeriodUsage = data;
    },

    async useInvoices() {
      const data = await getInvoicesLast12Months();
      this.invoices = data;
    },
    async useBilling() {
      const data = await getBillingInfo();
      this.billingInfo = data;
    },
    async manualPayInvoice(id: string) {
      const data = await startManualInvoicePayment(id);
      this.useInvoices(); // refresh list (busy invoice)
      return data;
    },
    async revokeMandate() {
      const data = await revokeMandate();
      this.billingInfo.hasMandate = false;
      return data;
    },
    async createMandate() {
      const data = await createMandate();
      return data;
    },
    async removeTenant(req: TickRemoveTenantRequest) {
      const data = await removeTenant(req);
      return data;
    },

  },
  persist: [
    {
      pick: undefined,
      key: PiniaStoragePath.subscription,// "tick-subscription",
      storage: getTickStorage(PiniaStorageType.Session, true),
    },
  ],
});

export default useSubscriptionStore;
