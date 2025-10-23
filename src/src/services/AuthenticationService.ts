
import * as LOG from "@/log";
import { debug, debugApi, error, warn } from "@/log";
import { appRtcHub } from "@/services/rtc/AppRtcHub";
import useAppStore from "@/store/app";
import useChannelsStore from "@/store/channels";
import useCollectionsStore from "@/store/collections";
import useDashboardsStore from "@/store/dashboards";
import useDataAdaptersStore from "@/store/dataadapters";
import useDataBagsStore from "@/store/databags";
import useEventSubscriptionsStore from "@/store/eventSubscriptions";
import useFilesStore from "@/store/files";
import useFlowStore from "@/store/flows";
import useInternetDomainsStore from "@/store/internetDomains";
import useManagingStore from "@/store/managingStore";
import usePartnershipStore from "@/store/partnership";
import useSubscriptionStore from "@/store/subscription";
import useTasksStore from "@/store/tasks";
import useTicketsStore from "@/store/tickets";
import useUserStore from "@/store/user";
import useUtilityDataStore from "@/store/utilitydata";
import useViewstateStore from "@/store/viewstate";
import useVoiceStore from "@/store/voice";
import { AuthenticateResponse, LoginRequest, LogOutRequest, RequestUserPasswordResetRequest, ResetPasswordResponse, ResetUserPasswordRequest } from "@/TickApi";
import DataAdapterRtcHub from "./rtc/DataAdapterRtcHub";
import FlowRtcHub from "./rtc/FlowRtcHub";
import TicketRtcHub from "./rtc/TicketRtcHub";
import { reset } from "./RtcHub";
import { Post } from "./Server";
import URL from "./urls";

export interface ViewAuthenticationResponse {
  success: boolean;
  message: string;

}

function processToken(token: string | null) {
  useAppStore().token = token || null;
}

export async function login(credentials: LoginRequest): Promise<ViewAuthenticationResponse> {
  debugApi('[Authentication:Start]Start authentication');

  try {
    const { data } = await Post<AuthenticateResponse>(URL.login, credentials);
    const { authentication } = data;

    if (authentication.authenticationSuccess) {
      debugApi(`[Authentication:Success]Retrieved authentication response: ${authentication.authenticationMessage}`)
      processToken(authentication.token);
      useUserStore().set(data.userContext);
    } else {
      warn(`[Authentication:Failed]Retrieved authentication response: ${authentication.authenticationMessage}`)
    }

    return {
      success: authentication.authenticationSuccess,
      message: authentication.authenticationMessage,
    }
  } catch (serverError) {
    error('Error while authenticating.', serverError);

    return {
      success: false,
      message: serverError.response.data.message || "Authentication failed",
    };
  }
}

export async function logout(request: LogOutRequest): Promise<unknown> {
  if (useAppStore().token) {
    try {
      await Post<unknown>(URL.logout, request);
    } catch (error) {
      LOG.error('Error while logging out');

    }
  }

  useUserStore().deactivateWorkspace();
  appRtcHub.reset();
  DataAdapterRtcHub.reset();
  FlowRtcHub.reset();
  TicketRtcHub.reset();

  // RTC hub reset (remove all events etc.)
  reset()

  if (request.forceLogOffAllDevices) {
    resetAllStores();
    processToken(null);
    debug('[LOGOUT:Success]');
  }

  return true;
}

export function resetAllStores() {
  useChannelsStore().$reset();
  useCollectionsStore().$reset();
  useDataAdaptersStore().$reset();
  useDataBagsStore().$reset();
  useFilesStore().$reset();
  useFlowStore().$reset();
  useManagingStore().$reset();
  useTicketsStore().$reset();
  useSubscriptionStore().$reset();
  useTasksStore().$reset();
  useUserStore().$reset();
  useUtilityDataStore().$reset();
  useViewstateStore().$reset();
  usePartnershipStore().$reset();
  useInternetDomainsStore().$reset();
  useEventSubscriptionsStore().$reset();
  useDashboardsStore().$reset();
  useVoiceStore().$reset();
}

export async function requestUserPasswordReset(req: RequestUserPasswordResetRequest): Promise<unknown> {


  try {
    const response = await Post<unknown>(URL.requestUserPasswordReset, req);
    debugApi(`[Authentication:Reset password]Request reset password link`);
    return response;
  } catch (serverError) {
    error('Error while resetting user password', { req, serverError });
    throw new Error(`Error while fetching details for user ${req.userName}: ${JSON.stringify(serverError)}`);
  }
}

export async function resetPassword(req: ResetUserPasswordRequest): Promise<ResetPasswordResponse> {


  try {
    const response = await Post<ResetPasswordResponse>(URL.resetUserPassword, req);
    debugApi(`[Authentication:Reset password]Resetting with validation code`);
    return response.data;
  } catch (serverError) {
    error('Error while resetting user password', { req, serverError });
    throw new Error(`Error while fetching details for user ${JSON.stringify(serverError)}`);
  }
}


