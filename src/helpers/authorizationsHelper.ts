import { AuthorizationType } from "@/TickApi";



export function authorizationIsSufficient(required: AuthorizationType, having: AuthorizationType | undefined): boolean {
  return having != null && required <= having;
}