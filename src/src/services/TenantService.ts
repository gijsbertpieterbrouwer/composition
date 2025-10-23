import * as LOG from '@/log';
import { debugApi } from '@/log';
import { GetRegisterProgressRequest, GetRegisterProgressResponse, GetTenantInfoByUrlNameRequest, GetTenantInfoByUrlNameResponse, PreRegisterRequest, PreRegisterResponse, RegisterRequest, RegisterResponse } from "@/TickApi";
import { Post } from "./Server";
import URL from "./urls";


interface GetTenantInfoServiceResponse {
  success: boolean;
  tenantId: string;
  tenantName: string;
  tenantUrlName: string
}

export async function getTenantInfo(request: GetTenantInfoByUrlNameRequest): Promise<GetTenantInfoServiceResponse> {
  debugApi('[Tenant:Fetch]Start getting tenant info');

  try {
    const response = await Post<Required<GetTenantInfoByUrlNameResponse>>(URL.getByUrlName, request)
    return response.data;
  } catch (error) {
    LOG.error('error while getting tenant from urlName', error);
    return null;
  }
}

export async function preRegister(request: PreRegisterRequest): Promise<PreRegisterResponse> {
  LOG.debugApi('[Tenant:Pre register]Start preregister tenant');

  try {
    const response = await Post<PreRegisterResponse>(URL.preregister, request);
    return response.data;
  } catch (error) {
    LOG.error('error while registering tenant', error);
    return null;
  }
}

export async function register(request: RegisterRequest): Promise<RegisterResponse> {
  LOG.debugApi('[Tenant:Register]Start register tenant');

  try {
    const response = await Post<RegisterResponse>(URL.register, request);
    return response.data;
  } catch (error) {
    LOG.error('error while registering tenant', error);
    return null;
  }
}

export async function getRegisterProgress(request: GetRegisterProgressRequest): Promise<GetRegisterProgressResponse> {
  LOG.debugApi('[Tenant:Fetch]get register progress');

  try {
    const response = await Post<GetRegisterProgressResponse>(URL.getRegisterProgress, request);
    return response.data;
  } catch (error) {
    LOG.error('error while registering tenant', error);
    return null;
  }
}


