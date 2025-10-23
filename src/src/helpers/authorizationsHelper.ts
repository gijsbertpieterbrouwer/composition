import { AuthorizationType } from "@/TickApi";



export function authorizationIsSufficient(required: AuthorizationType, having: AuthorizationType): boolean {
  return having != null && required <= having;
}