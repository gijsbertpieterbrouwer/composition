import { CommunicationType, CommunicatorAddress } from "@/TickApi";
import { getCommunicationTypeOptions } from "./enumsHelper";

const types = getCommunicationTypeOptions();

export function getCommunicationAddressName(address: CommunicatorAddress) {
  if (address.type == CommunicationType.Email) { return address.address; }
  if (address.type == CommunicationType.Phone) { return address.address; }
  return types.find((p) => p.id == address.type)?.text;
}