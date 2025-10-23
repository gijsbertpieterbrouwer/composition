import * as LOG from "@/log";
import { debugApi } from "@/log";
import { Post } from "@/services/Server";
import URL from "@/services/urls";
import { ValidatePhoneNumberRequest, ValidatePhoneNumberResponse } from "@/TickApi";


export async function validatePhoneNumber(def: ValidatePhoneNumberRequest): Promise<ValidatePhoneNumberResponse> {
    debugApi(`[USER:VALIDATE]Validate phone number ${def.phoneNumber}`);
    try {
        const response = await Post<ValidatePhoneNumberResponse>(URL.validatePhoneNumber.toString(), def);
        return response.data;
    } catch (error) {
        LOG.error('Error while Validate phone number', { error });
        throw new Error(`Error while Validate phone number ${JSON.stringify(error)}`);
    }
}
